"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { Download, UploadCloud, X, Zap, SlidersHorizontal, Image as ImageIcon, CheckCircle2, AlertCircle, ShieldCheck, DownloadCloud } from 'lucide-react';
import '@/styles/image-compressor.css';

// Types
interface FileItem {
  id: string;
  originalFile: File;
  compressedFile: File | null;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string | null;
  status: 'idle' | 'compressing' | 'done' | 'error';
  progress: number;
  error?: string;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageCompressor() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [targetSize, setTargetSize] = useState<number>(100);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressingAll, setIsCompressingAll] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(f => {
        URL.revokeObjectURL(f.originalUrl);
        if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
      });
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (newFiles: File[]) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const addedFiles: FileItem[] = [];

    newFiles.forEach(file => {
      if (!validImageTypes.includes(file.type)) {
        addToast(`Unsupported format: ${file.name}`, 'error');
        return;
      }

      // Limit to 50MB
      if (file.size > 50 * 1024 * 1024) {
        addToast(`File too large (max 50MB): ${file.name}`, 'error');
        return;
      }

      addedFiles.push({
        id: Math.random().toString(36).substring(7),
        originalFile: file,
        compressedFile: null,
        originalSize: file.size,
        compressedSize: 0,
        originalUrl: URL.createObjectURL(file),
        compressedUrl: null,
        status: 'idle',
        progress: 0
      });
    });

    if (addedFiles.length > 0) {
      setFiles(prev => [...prev, ...addedFiles]);
    }
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCompressionOptions = (fileType: string) => {
    // Calculate target size in MB
    let maxSizeMB = targetSize;
    if (targetUnit === 'KB') {
      maxSizeMB = targetSize / 1024;
    }

    const options: any = {
      useWebWorker: true,
      maxSizeMB: maxSizeMB > 0 ? maxSizeMB : 1, // fallback to 1MB if invalid
      alwaysKeepResolution: true, // Force the library to NEVER scale down dimensions
      initialQuality: 0.85, // Starts at a high quality and intelligently steps down to hit the maxSizeMB
    };

    if (outputFormat !== 'original') {
      options.fileType = outputFormat;
    }

    return options;
  };

  const compressSingleImage = async (fileId: string) => {
    const fileItem = files.find(f => f.id === fileId);
    if (!fileItem || fileItem.status === 'compressing') return;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'compressing', progress: 5 } : f));

    try {
      let targetBytes = targetSize;
      if (targetUnit === 'KB') {
        targetBytes *= 1024;
      } else {
        targetBytes *= 1024 * 1024;
      }

      let currentTargetMB = targetBytes / (1024 * 1024);
      let currentQuality = 0.85;
      let finalBlob: Blob | null = null;
      let attempts = 0;
      let maxAttempts = 6; // slightly more attempts

      // Strict Enforcement Loop: If the library returns a file larger than the target, 
      // we systematically lower the internal target passed to the library to force it smaller.
      while (attempts < maxAttempts) {
        const options = {
          ...getCompressionOptions(fileItem.originalFile.type),
          maxSizeMB: currentTargetMB,
          initialQuality: currentQuality, // override with our aggressive quality drop
          onProgress: (p: number) => {
            // Fake a smoother progress bar across attempts
            const overallProgress = Math.floor((attempts / maxAttempts) * 100) + Math.floor(p / maxAttempts);
            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: overallProgress } : f));
          }
        };

        const compressedBlob = await imageCompression(fileItem.originalFile, options);
        finalBlob = compressedBlob;

        // If we successfully hit the strict target (<= requested bytes), stop!
        if (compressedBlob.size <= targetBytes) {
          break;
        }

        // It overshot the target! 
        // 1. Lower the internal threshold aggressively.
        // 2. Brutally drop the starting quality (down to a minimum of 0.01) to force extreme compression.
        currentTargetMB = currentTargetMB * 0.70;
        currentQuality = Math.max(0.01, currentQuality - 0.20);
        attempts++;
      }

      if (!finalBlob) throw new Error("Compression failed completely");

      // Check if we hit the physical floor (impossible to compress further without resizing)
      const isPhysicalLimitReached = finalBlob.size > targetBytes;

      // Determine final extension based on the actual output type
      let finalType = finalBlob.type;
      let finalExt = fileItem.originalFile.name.split('.').pop() || 'jpg';

      if (outputFormat !== 'original') {
        if (outputFormat === 'image/jpeg') finalExt = 'jpg';
        if (outputFormat === 'image/png') finalExt = 'png';
        if (outputFormat === 'image/webp') finalExt = 'webp';
      } else {
        if (finalType === 'image/jpeg') finalExt = 'jpg';
        if (finalType === 'image/png') finalExt = 'png';
        if (finalType === 'image/webp') finalExt = 'webp';
      }

      // Reconstruct filename with new extension if changed
      const nameParts = fileItem.originalFile.name.split('.');
      nameParts.pop(); // remove old ext
      const baseName = nameParts.join('.');
      const newFilename = `${baseName}.${finalExt}`;

      const compressedUrl = URL.createObjectURL(finalBlob);
      const compressedFile = new File([finalBlob], newFilename, {
        type: finalBlob.type,
        lastModified: Date.now(),
      });

      // If output format is original, and compressed size is somehow larger, we could theoretically revert,
      // but since the user requested a TARGET size, we should still return the compressed one if it's converted format.
      // We will only revert to original if they wanted Original format AND it didn't save space.
      if (outputFormat === 'original' && finalBlob.size >= fileItem.originalSize * 0.98) {
        setFiles(prev => prev.map(f => f.id === fileId ? {
          ...f,
          status: 'done',
          progress: 100,
          compressedFile: fileItem.originalFile,
          compressedSize: fileItem.originalSize,
          compressedUrl: fileItem.originalUrl,
          error: 'Already optimized'
        } : f));
        return;
      }

      setFiles(prev => prev.map(f => f.id === fileId ? {
        ...f,
        status: 'done',
        progress: 100,
        compressedFile,
        compressedSize: compressedFile.size,
        compressedUrl,
        error: isPhysicalLimitReached ? 'Lowest possible size for this resolution' : undefined
      } : f));

    } catch (error: any) {
      console.error(error);
      setFiles(prev => prev.map(f => f.id === fileId ? {
        ...f,
        status: 'error',
        error: error.message || 'Compression failed',
        progress: 0
      } : f));
    }
  };

  const compressAll = async () => {
    setIsCompressingAll(true);
    const uncompressed = files.filter(f => f.status === 'idle' || f.status === 'error');

    // Process in small batches (e.g., 3 at a time) so we don't overwhelm the browser
    for (let i = 0; i < uncompressed.length; i += 3) {
      const batch = uncompressed.slice(i, i + 3);
      await Promise.all(batch.map(f => compressSingleImage(f.id)));
    }

    setIsCompressingAll(false);
    addToast('Batch compression finished!', 'success');
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.originalUrl);
        if (removed.compressedUrl) URL.revokeObjectURL(removed.compressedUrl);
      }
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.originalUrl);
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
    });
    setFiles([]);
  };

  const downloadFile = (fileItem: FileItem) => {
    if (!fileItem.compressedFile || !fileItem.compressedUrl) return;
    const a = document.createElement('a');
    a.href = fileItem.compressedUrl;

    // Add -compressed to filename
    const nameParts = fileItem.compressedFile.name.split('.');
    const ext = nameParts.pop();
    const baseName = nameParts.join('.');
    a.download = `${baseName}-compressed.${ext}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadZip = async () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.compressedFile);
    if (doneFiles.length === 0) return;

    try {
      const zip = new JSZip();
      doneFiles.forEach(f => {
        if (f.compressedFile) {
          zip.file(f.compressedFile.name, f.compressedFile);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'tooltive-compressed-images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (error) {
      addToast('Failed to create ZIP', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number) => {
    if (!compressed || original === 0) return 0;
    const savings = ((original - compressed) / original) * 100;
    return savings > 0 ? savings.toFixed(1) : 0;
  };

  const totalOriginal = files.reduce((acc, f) => acc + f.originalSize, 0);
  const totalCompressed = files.reduce((acc, f) => acc + (f.compressedSize || f.originalSize), 0);
  const totalSavings = calculateSavings(totalOriginal, totalCompressed);

  const allDone = files.length > 0 && files.every(f => f.status === 'done');
  const somePending = files.some(f => f.status === 'idle' || f.status === 'error');

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {t.message}
          </div>
        ))}
      </div>

      <div className="compressor-container">

        {/* Sidebar Settings */}
        <div className="compressor-sidebar">
          <div style={{ position: 'sticky', top: '24px' }}>
            <div className="settings-group">
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target File Size
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                We will aggressively optimize to hit this size while keeping the highest possible visual quality.
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={targetSize}
                  onChange={(e) => setTargetSize(Number(e.target.value))}
                  min="1"
                  style={{
                    flexGrow: 1,
                    minWidth: 0,
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value as 'KB' | 'MB')}
                  style={{
                    flexShrink: 0,
                    width: '75px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
            </div>

            <div className="settings-group" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Output Format
              </h3>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="original">Keep Original</option>
                <option value="image/jpeg">Convert to JPG</option>
                <option value="image/png">Convert to PNG</option>
                <option value="image/webp">Convert to WebP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="compressor-main">

          {/* Actions Bar */}
          {files.length > 0 && (
            <div className="actions-bar">
              <div className="total-stats">
                <div>Images: <span>{files.length}</span></div>
                <div>Original: <span>{formatBytes(totalOriginal)}</span></div>
                {totalCompressed > 0 && Number(totalSavings) > 0 && (
                  <div style={{ color: '#34d399' }}>Saved: <span>{totalSavings}%</span></div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={clearAll} disabled={isCompressingAll}>
                  Clear All
                </button>
                {somePending ? (
                  <button className="btn-primary" onClick={compressAll} disabled={isCompressingAll}>
                    {isCompressingAll ? 'Compressing...' : 'Compress All'}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={downloadZip}>
                    Download All (ZIP)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Zone */}
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
              onChange={handleFileInput}
            />
            <UploadCloud className="dropzone-icon" />
            <h3 className="dropzone-text">Drag & Drop Images Here</h3>
            <p className="dropzone-subtext">or click to browse from your device</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Supports JPG, PNG, WebP, GIF (Max 50MB per file)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="image-list">
              {files.map(file => (
                <div key={file.id} className="image-item">
                  <div className="image-preview-wrap">
                    <img src={file.originalUrl} alt="preview" className="image-preview" />
                  </div>

                  <div className="image-info">
                    <div className="image-name">{file.originalFile.name}</div>

                    <div className="image-stats">
                      <span>{formatBytes(file.originalSize)}</span>
                      {file.status === 'compressing' && (
                        <span style={{ color: 'var(--accent)' }}>Compressing...</span>
                      )}
                      {file.status === 'done' && (
                        <>
                          <span>→</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatBytes(file.compressedSize)}</span>
                          {Number(calculateSavings(file.originalSize, file.compressedSize)) > 0 ? (
                            <span className="stat-badge savings">-{calculateSavings(file.originalSize, file.compressedSize)}%</span>
                          ) : (
                            <span className="stat-badge">{file.error || '0%'}</span>
                          )}
                        </>
                      )}
                      {file.status === 'error' && (
                        <span className="stat-badge error">{file.error}</span>
                      )}
                    </div>

                    {file.status === 'compressing' && (
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${file.progress}%` }}></div>
                      </div>
                    )}
                  </div>

                  <div className="image-actions">
                    {file.status === 'idle' && (
                      <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); compressSingleImage(file.id); }}>
                        Compress
                      </button>
                    )}
                    {file.status === 'done' && file.compressedUrl && (
                      <button className="btn-icon" style={{ width: 'auto', padding: '0 12px', fontSize: '12px' }} title="Download" onClick={(e) => { e.stopPropagation(); downloadFile(file); }}>
                        Download
                      </button>
                    )}
                    <button className="btn-icon danger" style={{ width: 'auto', padding: '0 12px', fontSize: '12px' }} title="Remove" onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}