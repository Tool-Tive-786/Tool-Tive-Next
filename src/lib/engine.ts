/* ImageForge engine v7 — main thread, yields so UI stays alive.
   MANUAL = exact slider value (no gate).
   TARGET = user's quality is the MAX preference; target is a ceiling.
            Engine lowers quality (never above user's) until target fits,
            but NEVER below the photo-safe floor (picture protected).
   AUTO   = engine picks best safe quality (slider ignored). */


const ENGINE_VERSION = 'v7-quality-target-2026';
if (typeof console !== 'undefined') console.log('%c[ImageForge engine] ' + ENGINE_VERSION, 'color:#00cec9;font-weight:bold');

export interface CompSettings {
  width?: number; height?: number;
  quality: number; colors: number; lossless: boolean;
  progressive: boolean; chroma: string; targetBytes?: number;
  forceTarget?: boolean;
}
export interface Meta {
  w: number; h: number; engine: string; param?: number;
  mode?: string; metTarget?: boolean; targetBytes?: number;
  qualitySafe?: boolean; forced?: boolean; isPhoto?: boolean;
}
export interface ProgressMsg { p: number; t: string; }
export type OnProgress = (m: ProgressMsg) => void;

const PROXY = 256;
const MIME: Record<string, string> = { jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', png: 'image/png' };
const SSIM_FLOOR = 0.92;
const COLOR_PSNR_FLOOR = 33;
const PHOTO_COMPLEXITY = 500;
const PHOTO_MIN_QUALITY = 60;     // raster photos: quality floor
const PHOTO_MIN_PALETTE = 240;    // PNG photos: palette floor (≈ near-lossless look)

type AnySource = ImageBitmap | OffscreenCanvas | HTMLCanvasElement;
type ToBlobFn = (mime: string, q01?: number) => Promise<Blob>;
interface Drawn { imageData: ImageData; toBlob: ToBlobFn; }

const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));
const haveOC: boolean = typeof OffscreenCanvas !== 'undefined';

function orientedSize(w: number, h: number, o: number): [number, number] { return (o >= 5 && o <= 8) ? [h, w] : [w, h]; }
function applyOrientation(bitmap: ImageBitmap, o: number): AnySource {
  if (!o || o === 1) return bitmap;
  const [w, h] = orientedSize(bitmap.width, bitmap.height, o);
  const rot = (x: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
    x.translate(w / 2, h / 2);
    switch (o) { case 2: x.scale(-1, 1); break; case 3: x.rotate(Math.PI); break; case 4: x.scale(1, -1); break; case 5: x.rotate(Math.PI / 2); x.scale(1, -1); break; case 6: x.rotate(Math.PI / 2); break; case 7: x.rotate(-Math.PI / 2); x.scale(1, -1); break; case 8: x.rotate(-Math.PI / 2); break; }
    x.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  };
  if (haveOC) { const c = new OffscreenCanvas(w, h); const x = c.getContext('2d'); if (x) { rot(x); return c; } return bitmap; }
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); if (x) { rot(x); return c; } return bitmap;
}

function drawTarget(source: AnySource, tw: number, th: number, fillWhite: boolean): Drawn {
  if (haveOC) {
    const c = new OffscreenCanvas(tw, th); const x = c.getContext('2d', { willReadFrequently: true }); if (!x) throw new Error('no 2d ctx');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    if (fillWhite) { x.fillStyle = '#fff'; x.fillRect(0, 0, tw, th); }
    x.drawImage(source, 0, 0, tw, th);
    const imageData = x.getImageData(0, 0, tw, th);
    const toBlob: ToBlobFn = async (mime, q01) => q01 === undefined ? await c.convertToBlob({ type: mime }) : await c.convertToBlob({ type: mime, quality: q01 });
    return { imageData, toBlob };
  }
  const c = document.createElement('canvas'); c.width = tw; c.height = th; const x = c.getContext('2d', { willReadFrequently: true }); if (!x) throw new Error('no 2d ctx');
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  if (fillWhite) { x.fillStyle = '#fff'; x.fillRect(0, 0, tw, th); }
  x.drawImage(source, 0, 0, tw, th);
  const imageData = x.getImageData(0, 0, tw, th);
  const toBlob: ToBlobFn = (mime, q01) => new Promise<Blob>((res) => { q01 === undefined ? c.toBlob((b) => res(b as Blob), mime) : c.toBlob((b) => res(b as Blob), mime, q01); });
  return { imageData, toBlob };
}
async function toImageData(blob: Blob, w: number, h: number): Promise<ImageData> {
  const b = await createImageBitmap(blob);
  if (haveOC) { const c = new OffscreenCanvas(w, h); const x = c.getContext('2d', { willReadFrequently: true }); if (!x) throw new Error('no 2d ctx'); x.drawImage(b, 0, 0, w, h); return x.getImageData(0, 0, w, h); }
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); if (!x) throw new Error('no 2d ctx'); x.drawImage(b, 0, 0, w, h); return x.getImageData(0, 0, w, h);
}

function ssim(a: ImageData, b: ImageData): number {
  const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2;
  const w = a.width, h = a.height, ad = a.data, bd = b.data, WIN = 8;
  let sum = 0, cnt = 0;
  const gray = (d: Uint8ClampedArray, i: number) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  for (let y = 0; y + WIN <= h; y += WIN) for (let x = 0; x + WIN <= w; x += WIN) {
    let ma = 0, mb = 0, va = 0, vb = 0, cov = 0; const N = WIN * WIN;
    const pa = new Float32Array(N), pb = new Float32Array(N);
    for (let j = 0, yy = y; yy < y + WIN; yy++) for (let xx = x; xx < x + WIN; xx++, j++) { const idx = (yy * w + xx) * 4; pa[j] = gray(ad, idx); pb[j] = gray(bd, idx); ma += pa[j]; mb += pb[j]; }
    ma /= N; mb /= N;
    for (let j = 0; j < N; j++) { const da = pa[j] - ma, db = pb[j] - mb; va += da * da; vb += db * db; cov += da * db; }
    va /= (N - 1); vb /= (N - 1); cov /= (N - 1);
    sum += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2)); cnt++;
  }
  return cnt ? sum / cnt : 1;
}
function rgbMSE(a: ImageData, b: ImageData): number { const ad = a.data, bd = b.data, n = ad.length; let s = 0, c = 0; for (let i = 0; i < n; i += 4) { const dr = ad[i] - bd[i], dg = ad[i + 1] - bd[i + 1], db = ad[i + 2] - bd[i + 2]; s += dr * dr + dg * dg + db * db; c += 3; } return s / c; }
function cpsnr(m: number): number { return 10 * Math.log10(255 * 255 / Math.max(m, 1e-6)); }
function colorComplexity(img: ImageData): number { const d = img.data; const set = new Set<number>(); for (let i = 0; i < d.length; i += 4) { set.add(((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)); if (set.size > 4000) break; } return set.size; }
function qualityOk(format: string, val: number, s: number, cp: number, Cx: number): boolean {
  if (s < SSIM_FLOOR) return false;
  if (cp < COLOR_PSNR_FLOOR) return false;
  if (Cx > PHOTO_COMPLEXITY) { if (format === 'png' && val < PHOTO_MIN_PALETTE) return false; if (format !== 'png' && val < PHOTO_MIN_QUALITY) return false; }
  return true;
}

async function wasmRaster(format: string, imageData: ImageData, p: CompSettings): Promise<Blob> {
  if (typeof window === 'undefined') throw new Error('no-wasm-ssr');
  const cdn = 'https://cdn.jsdelivr.net/npm';
  const mod: any = format === 'jpeg' 
    ? await import(/* webpackIgnore: true */ `${cdn}/@jsquash/jpeg/+esm`) 
    : format === 'webp' 
    ? await import(/* webpackIgnore: true */ `${cdn}/@jsquash/webp/+esm`) 
    : await import(/* webpackIgnore: true */ `${cdn}/@jsquash/avif/+esm`);
  let opts: any;
  if (format === 'jpeg') {
    if (!p.progressive && p.quality < 25) throw new Error("Avoid baseline JPEG WASM crash at low quality");
    opts = { quality: p.quality, baseline: !p.progressive, progressive: !!p.progressive, optimize_coding: true, mozjpeg: true };
    if (p.chroma && p.chroma !== '420') opts.chroma_sub_sampling = p.chroma;
  }
  else opts = { quality: p.quality };
  const buf: ArrayBuffer = await mod.encode(imageData, opts);
  return new Blob([buf], { type: MIME[format] });
}
async function encodeRaster(format: string, imageData: ImageData, toBlob: ToBlobFn, p: CompSettings): Promise<{ blob: Blob; engine: string }> {
  try { return { blob: await wasmRaster(format, imageData, p), engine: 'wasm' }; }
  catch { try { return { blob: await toBlob(MIME[format], p.quality / 100), engine: 'browser' }; } catch { return { blob: await toBlob(format === 'avif' ? MIME.webp : MIME[format], p.quality / 100), engine: 'browser-fallback' }; } }
}
async function encodePng(imageData: ImageData, p: CompSettings): Promise<{ blob: Blob; engine: string }> {
  const { default: UPNG } = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/upng-js/+esm');
  const rgba = new Uint8Array(imageData.data.buffer.slice(0));
  const out = UPNG.encode([rgba.buffer], imageData.width, imageData.height, p.lossless ? 0 : (p.colors || 256));
  return { blob: new Blob([out], { type: MIME.png }), engine: 'upng' };
}
async function encodeAt(format: string, source: AnySource, tw: number, th: number, p: CompSettings): Promise<{ blob: Blob; w: number; h: number; engine: string }> {
  const { imageData, toBlob } = drawTarget(source, tw, th, format === 'jpeg');
  if (format === 'png') { const r = await encodePng(imageData, p); return { blob: r.blob, engine: r.engine, w: tw, h: th }; }
  const r = await encodeRaster(format, imageData, toBlob, p); return { blob: r.blob, engine: r.engine, w: tw, h: th };
}

/* candidate lists */
function autoCandidates(format: string, isPhoto: boolean): number[] {
  if (format === 'png') return isPhoto ? [256] : [256, 160, 96, 48, 24];
  return [90, 78, 68, 60, 52, 44, 36, 28, 20];
}
/* TARGET: descending list that NEVER exceeds the user's value (user value = max preference) */
function targetCandidates(format: string, userVal: number): number[] {
  const grid = format === 'png'
    ? [256, 240, 224, 192, 160, 128, 96, 72, 56, 40, 28, 20]
    : [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20];
  const list = Array.from(new Set<number>([userVal, ...grid.filter((v) => v <= userVal)])).sort((a, b) => b - a);
  return list.slice(0, 14);
}

/* FORCE: descending list with a very low end (we allow destruction here) */
function forceCandidates(format: string, userVal: number): number[] {
  const grid = format === 'png'
    ? [256, 240, 224, 192, 160, 128, 96, 72, 56, 40, 28, 20, 12, 8, 4, 2]
    : [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 2];
  return Array.from(new Set<number>([userVal, ...grid.filter((v) => v <= userVal)])).sort((a, b) => b - a).slice(0, 20);
}
const mkP = (format: string, s: CompSettings, val: number): CompSettings => format === 'png' ? { ...s, lossless: false, colors: val } : { ...s, quality: val };

async function measure(format: string, proxy: Drawn, val: number, s: CompSettings, Cx: number) {
  const p = mkP(format, s, val);
  const enc = format === 'png' ? encodePng(proxy.imageData, p) : await encodeRaster(format, proxy.imageData, proxy.toBlob, p);
  const dec = await toImageData(enc.blob, proxy.imageData.width, proxy.imageData.height);
  return { val, size: enc.blob.size, ok: qualityOk(format, val, ssim(proxy.imageData, dec), cpsnr(rgbMSE(proxy.imageData, dec)), Cx) };
}

async function autoSearch(format: string, source: AnySource, tw: number, th: number, s: CompSettings, proxy: Drawn, Cx: number, onProgress: OnProgress) {
  const cands = autoCandidates(format, Cx > PHOTO_COMPLEXITY);
  const safe: number[] = [];
  for (let i = 0; i < cands.length; i++) {
    onProgress({ p: Math.round((i / cands.length) * 90), t: `Auto: measuring ${i + 1}/${cands.length}...` }); await tick();
    try { const m = await measure(format, proxy, cands[i], s, Cx); if (m.ok) safe.push(m.val); } catch { /* skip */ }
  }
  if (!safe.length) safe.push(Cx > PHOTO_COMPLEXITY ? (format === 'png' ? PHOTO_MIN_PALETTE : PHOTO_MIN_QUALITY) : cands[0]);
  const chosenVal = Math.min(...safe);
  const fin = await encodeAt(format, source, tw, th, mkP(format, s, chosenVal));
  return { ...fin, param: chosenVal, mode: 'auto', isPhoto: Cx > PHOTO_COMPLEXITY };
}

async function targetSearch(format: string, source: AnySource, tw: number, th: number, s: CompSettings, proxy: Drawn, Cx: number, onProgress: OnProgress) {
  const targetBytes = Math.max(30 * 1024, s.targetBytes || 30 * 1024);
  const isPhoto = Cx > PHOTO_COMPLEXITY;
  const userVal = format === 'png' ? (s.colors || 256) : s.quality;
  const protectFloor = format === 'png' ? PHOTO_MIN_PALETTE : PHOTO_MIN_QUALITY;

  /* ---- FORCE PATH: user said "har haal mein target" -> ignore quality gate ---- */
  if (s.forceTarget) {
    const cands = forceCandidates(format, userVal);
    let chosen: { val: number; blob: Blob; engine: string } | null = null;
    for (let i = 0; i < cands.length; i++) {
      onProgress({ p: 5 + Math.round((i / cands.length) * 90), t: `Force: encoding ${cands[i]}${format === 'png' ? ' colors' : '%'}...` }); await tick();
      const r = await encodeAt(format, source, tw, th, mkP(format, s, cands[i]));
      if (r.blob.size <= targetBytes) { chosen = { val: cands[i], blob: r.blob, engine: r.engine }; break; } // highest quality that fits
      chosen = { val: cands[i], blob: r.blob, engine: r.engine };
    }
    if (!chosen) throw new Error('Force: nothing encoded');
    const metTarget = chosen.blob.size <= targetBytes;   // false only if even min can't fit
    return { blob: chosen.blob, w: tw, h: th, engine: chosen.engine, param: chosen.val, mode: 'target', metTarget, targetBytes, qualitySafe: false, forced: true, isPhoto };
  }

  /* ---- NORMAL SAFE PATH (unchanged): quality gate ON ---- */
  const cands = targetCandidates(format, userVal);
  const safe: number[] = [];
  for (let i = 0; i < cands.length; i++) {
    onProgress({ p: 6 + Math.round((i / cands.length) * 55), t: `Target: checking quality ${i + 1}/${cands.length}...` }); await tick();
    try { const m = await measure(format, proxy, cands[i], s, Cx); if (m.ok) safe.push(m.val); } catch { /* skip */ }
  }
  if (!safe.length) safe.push(isPhoto ? protectFloor : cands[0]);
  const safeDesc = [...safe].sort((a, b) => b - a);
  let chosen: { val: number; blob: Blob; engine: string } | null = null;
  let metTarget = false;
  for (let i = 0; i < safeDesc.length; i++) {
    onProgress({ p: 65 + Math.round((i / safeDesc.length) * 30), t: `Target: encoding ${safeDesc[i]}${format === 'png' ? ' colors' : '%'}...` }); await tick();
    const r = await encodeAt(format, source, tw, th, mkP(format, s, safeDesc[i]));
    if (r.blob.size <= targetBytes) { chosen = { val: safeDesc[i], blob: r.blob, engine: r.engine }; metTarget = true; break; }
    chosen = { val: safeDesc[i], blob: r.blob, engine: r.engine };
  }
  if (!chosen) throw new Error('Target: nothing encoded');
  return { blob: chosen.blob, w: tw, h: th, engine: chosen.engine, param: chosen.val, mode: 'target', metTarget, targetBytes, qualitySafe: true, forced: false, isPhoto };
}

export async function compressOne(file: Blob, orientation: number, kind: string, format: string, settings: CompSettings, onProgress: OnProgress = () => { }): Promise<{ blob: Blob; meta: Meta }> {
  onProgress({ p: 4, t: 'Decoding image...' }); await tick();
  const bitmap = await createImageBitmap(file);
  const oriented = applyOrientation(bitmap, orientation);
  const tw = settings.width || bitmap.width, th = settings.height || bitmap.height;

  const scale = Math.min(1, PROXY / Math.max(tw, th));
  const pw = Math.max(1, Math.round(tw * scale)), ph = Math.max(1, Math.round(th * scale));
  const proxy = drawTarget(oriented, pw, ph, format === 'jpeg');
  const Cx = colorComplexity(proxy.imageData);
  const isPhoto = Cx > PHOTO_COMPLEXITY;

  let result: any;
  if (kind === 'auto') result = await autoSearch(format, oriented, tw, th, settings, proxy, Cx, onProgress);
  else if (kind === 'target') result = await targetSearch(format, oriented, tw, th, settings, proxy, Cx, onProgress);
  else result = { ...(await encodeAt(format, oriented, tw, th, settings)), mode: 'compress', isPhoto };   // MANUAL: exact slider, no gate

  onProgress({ p: 100, t: 'Done' }); await tick();
  return { blob: result.blob, meta: { w: result.w, h: result.h, engine: result.engine, param: result.param, mode: result.mode, metTarget: result.metTarget, targetBytes: result.targetBytes, qualitySafe: result.qualitySafe, forced: result.forced, isPhoto: result.isPhoto ?? isPhoto } };
}
