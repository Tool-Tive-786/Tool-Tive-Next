'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChangeEvent, PointerEvent as RPointerEvent, DragEvent as RDragEvent, MouseEvent as RMouseEvent } from 'react';
import JSZip from 'jszip';
import { readOrientation } from '@/lib/exif';
import { compressOne, type Meta } from '@/lib/engine';
// NOTE: CSS globals.css mein merge hai (.if-* namespace). Koi import nahi.

interface FileItem { file: File; orientation: number; url: string; dims: { w: number; h: number }; }
interface Result { blob: Blob; meta: Meta; origSize: number; }
interface ProgressLike { p: number; t: string; }
type Pair = [number, FileItem];

const fmtBytes = (b: number): string => { if (!b) return '0 B'; const k = 1024, s = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(b) / Math.log(k)); return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i]; };
const pngColors = (q: number): number => Math.max(2, Math.min(256, Math.round(2 + (q / 100) * 254)));
const isTargetValid = (str: string): boolean => /^\d+$/.test(String(str)) && +str >= 30;
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

export default function ImageCompressor() {
  const fileInput = useRef<HTMLInputElement>(null);
  const filesRef = useRef<FileItem[]>([]);                 // synchronous truth (avoids stale index on rapid add)
  const activeRef = useRef(0);                             // concurrent-run counter for overlay
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [results, setResults] = useState<(Result | null)[]>([]);
  const [sel, setSel] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressLike>({ p: 0, t: '' });
  const [toast, setToast] = useState<{ m: string; type: string } | null>(null);
  const [addDrag, setAddDrag] = useState(false);

  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(75);
  const [lossless, setLossless] = useState(false);
  const [progressive, setProgressive] = useState(true);
  const [chroma, setChroma] = useState('420');
  const [mode, setMode] = useState<'manual' | 'auto' | 'target'>('manual');
  const [targetStr, setTargetStr] = useState('');
  const [forceTarget, setForceTarget] = useState(false);

  const [rw, setRw] = useState(''); const [rh, setRh] = useState('');
  const [locked, setLocked] = useState(true);
  const [resizePreset, setResizePreset] = useState<string | null>('original');
  const [allowUp, setAllowUp] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const [view, setView] = useState<'compare' | 'original' | 'compressed'>('compare');
  const [slider, setSlider] = useState(50);

  const targetValid = mode === 'target' && isTargetValid(targetStr);
  const notify = (m: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => { /* Toasts disabled per user request */ };

  const targetDims = useCallback((): { w: number; h: number } => {
    if (!dims.w) return { w: 0, h: 0 };
    let w = rw ? Math.min(8192, Math.max(1, parseInt(rw) || 0)) : dims.w;
    let h = rh ? Math.min(8192, Math.max(1, parseInt(rh) || 0)) : dims.h;
    if (!allowUp) { w = Math.min(w, dims.w); h = Math.min(h, dims.h); }
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }, [rw, rh, dims, allowUp]);

  const beginRun = () => { activeRef.current++; setProcessing(true); };
  const endRun = () => { activeRef.current = Math.max(0, activeRef.current - 1); if (activeRef.current === 0) setProcessing(false); };

  /* core: compress the given index/item pairs (writes results by index, preserves others) */
  const processPairs = useCallback(async (pairs: Pair[]) => {
    if (!pairs.length) return;
    if (mode === 'target' && !isTargetValid(targetStr)) return;   // wait for a valid number
    beginRun();
    const { w, h } = targetDims();
    const settings = { width: w, height: h, quality, colors: lossless ? 0 : pngColors(quality), lossless, progressive, chroma, targetBytes: mode === 'target' ? Math.max(30, +targetStr) * 1024 : undefined, forceTarget: mode === 'target' ? forceTarget : false };
    const kind = mode === 'auto' ? 'auto' : mode === 'target' ? 'target' : 'compress';
    try {
      for (const [idx, f] of pairs) {
        setProgress({ p: 0, t: `Processing ${idx + 1}...` }); await tick();
        let res: Result | null = null;
        try {
          const r = await compressOne(f.file, f.orientation, kind, format, settings, (m) => setProgress(m));
          res = { blob: r.blob, meta: r.meta, origSize: f.file.size };
        } catch (e) { console.error(e); }
        setResults((prev) => { const n = [...prev]; n[idx] = res; return n; });
      }
      setProgress({ p: 100, t: 'Complete' });
      if (mode === 'target') {
        const missed = pairs.some(([idx]) => { const r = results_ref_current[idx]; return r && r.meta && r.meta.metTarget === false; });
        if (missed) notify(`⚠️ Some images could not safely reach ${+targetStr}KB.`, 'warning');
        else notify(`${pairs.length} image(s) compressed.`, 'success');
      } else notify(`${pairs.length} image(s) compressed.`, 'success');
    } finally { endRun(); }
  }, [format, quality, lossless, progressive, chroma, mode, targetStr, targetDims, forceTarget]); // eslint-disable-line

  // we need latest results inside processPairs for the missed-check without adding it to deps:
  const results_ref_current = results;

  /* settings change => reprocess ALL (files read from ref so identity doesn't depend on files) */
  const processAll = useCallback(() => processPairs(filesRef.current.map((it, i) => [i, it] as Pair)), [processPairs]);
  useEffect(() => {
    if (filesRef.current.length) { if (deb.current) clearTimeout(deb.current); deb.current = setTimeout(processAll, 400); }
  }, [processAll]);

  /* load = APPEND (first load: prev=[] so it's a set). Only NEW items are processed. */
  const loadFiles = async (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) return notify('No valid image selected.', 'error');
    const loaded: FileItem[] = [];
    for (const f of arr) {
      const orientation = await readOrientation(f);
      const url = URL.createObjectURL(f);
      const d = await new Promise<{ w: number; h: number }>((r) => { const i = new Image(); i.onload = () => r({ w: i.naturalWidth, h: i.naturalHeight }); i.src = url; });
      loaded.push({ file: f, orientation, url, dims: d });
    }
    const prev = filesRef.current;
    const next = [...prev, ...loaded];
    filesRef.current = next;                 // synchronous update (rapid double-add safe)
    setFiles(next);
    setResults((r) => [...r, ...new Array(loaded.length).fill(null)]);
    setSel(prev.length);                     // jump to first newly added
    setDims(loaded[0].dims);
    if (prev.length === 0) { setRw(''); setRh(''); setResizePreset('original'); }   // fresh only on first load
    notify(prev.length === 0 ? `Loaded ${loaded.length} image(s).` : `＋ ${loaded.length} image(s) added.`, 'success');
    processPairs(loaded.map((it, k) => [prev.length + k, it] as Pair));   // compress ONLY the new ones
  };

  const resetAll = () => { filesRef.current = []; setFiles([]); setResults([]); setSel(0); };

  const onFormat = (f: string) => { setFormat(f); setForceTarget(false); };
  const onQualityChange = (v: number) => { setQuality(v); setLossless(false); if (mode === 'auto') setMode('manual'); setForceTarget(false); };

  const onRw = (v: string) => { setRw(v); if (locked && dims.w) { const r = dims.w / dims.h; setRh(v ? String(Math.round((parseInt(v) || 0) / r)) : ''); } setResizePreset(null); };
  const onRh = (v: string) => { setRh(v); if (locked && dims.h) { const r = dims.w / dims.h; setRw(v ? String(Math.round((parseInt(v) || 0) * r)) : ''); } setResizePreset(null); };
  const applyResizePreset = (pct: number) => { if (!dims.w) return; setRw(String(Math.round(dims.w * pct / 100))); setRh(String(Math.round(dims.h * pct / 100))); setResizePreset(String(pct)); };
  const clearResize = () => { setRw(''); setRh(''); setResizePreset('original'); };

  const ext = format === 'jpeg' ? 'jpg' : format;
  const downloadOne = (i: number) => { const r = results[i]; if (!r) return; const a = document.createElement('a'); a.href = URL.createObjectURL(r.blob); a.download = files[i].file.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`; a.click(); };
  const downloadZip = async () => { const zip = new JSZip(); results.forEach((r, i) => { if (r) zip.file(files[i].file.name.replace(/\.[^.]+$/, '') + `.${ext}`, r.blob); }); const blob = await zip.generateAsync({ type: 'blob' }, (m) => setProgress({ p: m.percent, t: 'Zipping...' })); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'imageforge_compressed.zip'; a.click(); notify('ZIP downloaded.', 'success'); };
  const copyOne = async (i: number) => { const r = results[i]; if (!r) return; try { await navigator.clipboard.write([new ClipboardItem({ [r.blob.type]: r.blob })]); notify('Copied!', 'success'); } catch { notify('Copy unsupported.', 'warning'); } };
  const pickMore = () => fileInput.current?.click();

  const cur = results[sel] ?? null;
  const curFile = files[sel];
  const savings = cur ? ((1 - cur.blob.size / cur.origSize) * 100) : 0;
  const { w: ow, h: oh } = targetDims();
  const userVal = format === 'png' ? pngColors(quality) : quality;
  const autoPicked = (mode === 'auto' || targetValid) && cur?.meta?.param != null;
  const adjusted = targetValid && cur?.meta?.param != null && cur.meta.param !== userVal;
  const sliderDim = (mode === 'auto') || lossless;
  const pngPhotoStuck = format === 'png' && !lossless && mode === 'manual' && !!cur && cur.meta?.isPhoto === true && savings < 5;
  const photoClamped = format === 'png' && mode === 'target' && cur?.meta?.isPhoto === true && pngColors(quality) < 240;

  return (
    <div className="if-root">
      {toast && <div className={`if-toast ${toast.type}`}>{toast.m}</div>}

      {!files.length && (
        <div className="if-upload" onClick={pickMore} onDragOver={(e: RDragEvent) => e.preventDefault()} onDrop={(e: RDragEvent) => { e.preventDefault(); loadFiles(e.dataTransfer.files); }}>
          <div className="if-upload-icon">📁</div>
          <h2>Drop images here (single or batch)</h2>
          <p>or click to browse • Ctrl+V paste • 100% in-browser • private</p>
          <div className="if-tags">{['JPG', 'PNG', 'WebP', 'AVIF', 'GIF', 'BMP'].map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      )}
      <input ref={fileInput} type="file" accept="image/*" multiple hidden
        onChange={(e: ChangeEvent<HTMLInputElement>) => { loadFiles(e.target.files); e.currentTarget.value = ''; }} />

      {files.length > 0 && (
        <div className="if-editor">
          <div className="if-preview">
            <div className="if-preview-head">
              <div className="if-tabs">{(['compare', 'original', 'compressed'] as const).map((v) => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="if-btn if-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={pickMore}>＋ Add</button>
                <button className="if-btn if-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={resetAll}>✕ New</button>
              </div>
            </div>

            {view === 'compare' && cur && curFile && (
              <div className="if-compare">
                <span className="if-lbl l-o">Original</span><span className="if-lbl l-c">Compressed</span>
                <img src={curFile.url} alt="orig" className="if-img-o" />
                <img src={URL.createObjectURL(cur.blob)} alt="comp" className="if-img-c" style={{ clipPath: `inset(0 0 0 ${slider}%)` }} />
                <div className="if-slider" style={{ left: slider + '%' }}
                  onPointerDown={(e: RPointerEvent<HTMLDivElement>) => {
                    const track = e.currentTarget.parentElement; if (!track) return;
                    const update = (clientX: number) => { const r = track.getBoundingClientRect(); if (!r.width) return; setSlider(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100))); };
                    const move = (ev: globalThis.PointerEvent) => update(ev.clientX);
                    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
                    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); update(e.clientX);
                  }} />
              </div>
            )}
            {view === 'original' && curFile && <div className="if-single"><img src={curFile.url} alt="o" /></div>}
            {view === 'compressed' && cur && <div className="if-single"><img src={URL.createObjectURL(cur.blob)} alt="c" /></div>}

            {processing && <div className="if-overlay"><div className="if-spin" /><div>{progress.t || 'Processing...'}</div><div className="if-bar"><i style={{ width: progress.p + '%' }} /></div></div>}
          </div>

          <div className="if-panel">
            <div className="if-card">
              <div className="if-ct">🎨 Output Format</div>
              <div className="if-fmt">{([['webp', 'WebP', 'Best balance'], ['avif', 'AVIF', 'Smallest'], ['jpeg', 'JPEG', 'Universal'], ['png', 'PNG', 'Lossless/Lossy']] as const).map(([k, n, d]) => (<div key={k} className={format === k ? 'on' : ''} onClick={() => onFormat(k)}><b>{n}</b><small>{d}</small></div>))}</div>
            </div>

            <div className="if-card">
              <div className="if-ct">⚙️ Quality Control</div>
              <div className={`if-slide ${sliderDim ? 'dim' : ''}`}>
                <div className="if-sl">
                  <span>{format === 'png' ? 'Quality (palette)' : 'Quality'}</span>
                  <input type="number" min={0} max={100} value={quality} className="if-qnum"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => { const raw = e.target.value; if (raw === '') return; let v = +raw; if (Number.isNaN(v)) return; v = Math.max(0, Math.min(100, v)); onQualityChange(v); }} />
                </div>
                <input type="range" min={0} max={100} value={quality} onChange={(e: ChangeEvent<HTMLInputElement>) => onQualityChange(+e.target.value)} />
              </div>
              {sliderDim && <div className="if-png-note" style={{ color: '#00cec9' }}>🔒 {lossless ? 'Lossless' : 'Auto'} active — move slider to return to manual.</div>}
              {photoClamped && <div className="if-png-note" style={{ color: '#fdcb6e' }}>🛡️ This is a <b>photo</b> — quality is limited to safe floor (≈240 colors) to prevent posterization. <b>WebP</b> is best for photos.</div>}
              {format === 'png' && <label className="if-check"><input type="checkbox" checked={lossless} onChange={(e: ChangeEvent<HTMLInputElement>) => { setLossless(e.target.checked); if (e.target.checked) setMode('manual'); }} /> Lossless</label>}

              <button type="button" className={`if-auto-link ${mode === 'auto' ? 'on' : ''}`} onClick={() => { setMode(mode === 'auto' ? 'manual' : 'auto'); setLossless(false); }}>
                🚀 {mode === 'auto' ? 'Auto mode active — click to return to manual' : 'Auto-pick best quality'}
              </button>

              <label className="if-check target" style={{ marginTop: 10 }}>
                <input type="checkbox" checked={mode === 'target'} onChange={(e: ChangeEvent<HTMLInputElement>) => { setMode(e.target.checked ? 'target' : 'manual'); setLossless(false); setForceTarget(false); }} />
                🎯 Target size (max):
                <input type="number" value={targetStr} placeholder="30+" onChange={(e: ChangeEvent<HTMLInputElement>) => { setTargetStr(e.target.value); setMode('target'); setLossless(false); setForceTarget(false); }} onClick={(e: RMouseEvent) => e.stopPropagation()} /> KB
              </label>
              {mode === 'target' && targetStr === '' && <div className="if-target-hint">🎯 Enter Target KB (minimum 30).</div>}
              {mode === 'target' && targetStr !== '' && !targetValid && <div className="if-target-err">⚠️ Enter a value above 30 KB.</div>}


              {format === 'jpeg' && (
                <div className="if-pro">
                  <label className="if-check"><input type="checkbox" checked={progressive} onChange={(e: ChangeEvent<HTMLInputElement>) => setProgressive(e.target.checked)} /> Progressive</label>
                  <div className="if-sl"><span>Chroma</span><select value={chroma} onChange={(e: ChangeEvent<HTMLSelectElement>) => setChroma(e.target.value)}><option value="420">4:2:0 (smaller)</option><option value="444">4:4:4 (sharp text)</option></select></div>
                </div>
              )}
            </div>

            <div className="if-card">
              <div className="if-ct">📐 Resize <small>(optional)</small></div>
              <div className="if-row">
                {([100, 75, 50, 25] as const).map((p) => <button key={p} className={`if-chip ${resizePreset === String(p) ? 'on' : ''}`} onClick={() => applyResizePreset(p)}>{p}%</button>)}
                <button className={`if-chip ${resizePreset === 'original' ? 'on' : ''}`} onClick={clearResize}>Orig</button>
              </div>
              <div className="if-resize">
                <div><label>Width</label><input type="number" value={rw} placeholder={dims.w ? String(dims.w) : 'Auto'} onChange={(e: ChangeEvent<HTMLInputElement>) => onRw(e.target.value)} /></div>
                <button className={`if-lock ${locked ? 'on' : ''}`} onClick={() => setLocked(!locked)}>{locked ? '🔒' : '🔓'}</button>
                <div><label>Height</label><input type="number" value={rh} placeholder={dims.h ? String(dims.h) : 'Auto'} onChange={(e: ChangeEvent<HTMLInputElement>) => onRh(e.target.value)} /></div>
              </div>
              <div className="if-eff">Output: <b>{ow} × {oh}</b>{!rw && !rh && <span className="if-orig">· original</span>}</div>
              <label className="if-check"><input type="checkbox" checked={allowUp} onChange={(e: ChangeEvent<HTMLInputElement>) => setAllowUp(e.target.checked)} /> Allow upscaling</label>
            </div>

            <div className="if-card">
              <div className="if-ct">📊 Results {cur && <span className="if-engine">[{cur.meta?.engine}]</span>}</div>
              <div className="if-stats">
                <div><b className="o">{cur ? fmtBytes(cur.origSize) : '-'}</b><small>Original</small></div>
                <div><b className="c">{cur ? fmtBytes(cur.blob.size) : '-'}</b><small>Compressed</small></div>
                <div><b className="s">{cur ? (savings > 0 ? `-${savings.toFixed(1)}%` : `+${Math.abs(savings).toFixed(1)}%`) : '-'}</b><small>Saved</small></div>
                <div><b className="d">{cur ? `${cur.meta?.w}×${cur.meta?.h}` : '-'}</b><small>Dims</small></div>
              </div>
              <div className="if-bar"><i style={{ width: Math.max(0, Math.min(100, savings)) + '%' }} /></div>

              {pngPhotoStuck && (
                <div className="if-warn">
                  🖼️ This looks like a <b>photo</b>. PNG is inefficient for photos. Please use <b>WebP/AVIF</b>.
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}><button type="button" className="if-chip on" style={{ flex: '0 0 auto' }} onClick={() => onFormat('webp')}>💡 Switch to WebP</button></div>
                </div>
              )}
              {targetValid && cur?.meta?.metTarget === false && (
                <div className="if-warn">
                  ⚠️ <b>{+targetStr}KB</b> is not possible without quality loss. Best safe size: <b>{fmtBytes(cur.blob.size)}</b>.
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {format === 'png' && <button type="button" className="if-chip on" style={{ flex: '0 0 auto' }} onClick={() => onFormat('webp')}>💡 Try WebP</button>}
                    <button type="button" className="if-chip on" style={{ flex: '0 0 auto' }} onClick={() => applyResizePreset(50)}>📐 Try 50% size</button>
                    <button type="button" className="if-chip" style={{ flex: '0 0 auto' }} onClick={() => setForceTarget(true)}>⚠️ Force Target</button>
                  </div>
                </div>
              )}
              {/* Success message removed as requested */}
              {targetValid && cur?.meta?.forced === true && cur?.meta?.metTarget === true && (
                <div className="if-warn">
                  ⚠️ <b>Forced to {+targetStr}KB</b> (Quality reduced to {cur.meta?.param}{format === 'png' ? ' colors' : '%'})
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button type="button" className="if-chip on" style={{ flex: '0 0 auto' }} onClick={() => setForceTarget(false)}>↩️ Revert to safe size</button>
                  </div>
                </div>
              )}
              {targetValid && cur?.meta?.forced === true && cur?.meta?.metTarget === false && (
                <div className="if-warn">⚠️ Target <b>{+targetStr}KB</b> is unreachable. Smallest possible size is <b>{fmtBytes(cur.blob.size)}</b>.</div>
              )}
            </div>

            <div className="if-card">
              <div className="if-ct">💾 Export</div>
              <button className="if-btn if-accent if-big" disabled={!cur} onClick={() => downloadOne(sel)}>⬇️ Download</button>
              <button className="if-btn if-ghost" disabled={!cur} onClick={() => copyOne(sel)}>📋 Copy</button>
              {files.length > 1 && <button className="if-btn if-accent" onClick={downloadZip} disabled={processing}>📦 Download All (ZIP)</button>}
            </div>
          </div>

          {/* BATCH + ADD-MORE (visible from 1 file so the add path is always discoverable) */}
          {files.length >= 1 && (
            <div className="if-batch">
              <div className="if-ct">🗂️ Queue ({files.length})</div>
              <button type="button" className={`if-btn if-ghost ${addDrag ? 'drag' : ''}`} style={{ width: '100%', marginBottom: 12, borderStyle: 'dashed' }} onClick={pickMore}
                onDragOver={(e: RDragEvent) => e.preventDefault()} onDragEnter={() => setAddDrag(true)} onDragLeave={() => setAddDrag(false)}
                onDrop={(e: RDragEvent) => { e.preventDefault(); setAddDrag(false); loadFiles(e.dataTransfer.files); }}>
                ＋ Add more images
              </button>
              {files.map((f, i) => { const r = results[i]; const sv = r ? ((1 - r.blob.size / r.origSize) * 100) : 0; return (
                <div key={i} className={`if-brow ${sel === i ? 'on' : ''}`} onClick={() => setSel(i)}>
                  <span className="if-bname">{sel === i ? '▸ ' : ''}{f.file.name}</span>
                  <span className="if-bsize">{fmtBytes(f.file.size)} → {r ? fmtBytes(r.blob.size) : '…'}</span>
                  <span className={`if-bsv ${sv > 0 ? 'pos' : 'neg'}`}>{r ? (sv > 0 ? `-${sv.toFixed(0)}%` : `+${Math.abs(sv).toFixed(0)}%`) : ''}</span>
                  <button className="if-bdl" onClick={(e: RMouseEvent) => { e.stopPropagation(); downloadOne(i); }} disabled={!r}>⬇️</button>
                </div>); })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
