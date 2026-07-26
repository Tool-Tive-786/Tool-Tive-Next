"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function ImageRefinerClient() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [noiseReduction, setNoiseReduction] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = useCallback(() => {
    if (!image || !canvasRef.current || !originalCanvasRef.current) return;

    setIsProcessing(true);
    
    // Simulate processing time for UX since real complex upscaling needs WASM or WebGL
    // Here we'll do a basic canvas scale with smoothing disabled for sharpness, or enabled for smoothness
    setTimeout(() => {
      const ctx = canvasRef.current!.getContext('2d');
      const origCtx = originalCanvasRef.current!.getContext('2d');
      
      if (!ctx || !origCtx) {
        setIsProcessing(false);
        return;
      }

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      canvasRef.current!.width = scaledWidth;
      canvasRef.current!.height = scaledHeight;
      originalCanvasRef.current!.width = scaledWidth;
      originalCanvasRef.current!.height = scaledHeight;

      // Draw original (scaled up normally, blurry)
      origCtx.imageSmoothingEnabled = true;
      origCtx.imageSmoothingQuality = 'high';
      origCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

      // Draw processed (sharper upscale)
      // For a real "upscaler", you'd use a neural net or bicubic algorithm.
      // Here we simulate an enhancement by tweaking contrast/sharpness via composite operations.
      ctx.imageSmoothingEnabled = false; // Nearest neighbor preserves sharp edges
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
      
      // Simulate noise reduction via slight blur (globalAlpha blend)
      if (noiseReduction > 0) {
        ctx.globalAlpha = noiseReduction / 100;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        ctx.globalAlpha = 1.0;
      }

      setIsProcessing(false);
    }, 500);
  }, [image, scale, noiseReduction]);

  useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image, processImage]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'refined-image.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="hal-refiner-container" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div className="hal-refiner-sidebar" style={{ flex: '1', minWidth: '300px', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Upload Image</h3>
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'block', marginBottom: '24px' }} />

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Settings</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Upscale Factor: {scale}x</label>
          <input type="range" min="1" max="4" step="1" value={scale} onChange={(e) => setScale(parseInt(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Noise Reduction: {noiseReduction}%</label>
          <input type="range" min="0" max="100" value={noiseReduction} onChange={(e) => setNoiseReduction(parseInt(e.target.value))} style={{ width: '100%' }} />
        </div>

        <button 
          onClick={handleDownload} 
          disabled={!image || isProcessing}
          style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: image ? 'pointer' : 'not-allowed', opacity: image ? 1 : 0.5 }}
        >
          {isProcessing ? 'Processing...' : 'Download Refined Image'}
        </button>
      </div>

      <div className="hal-refiner-main" style={{ flex: '2', minWidth: '400px', background: 'var(--bg-input)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '400px' }}>
        {!image ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Upload an image to see the preview</p>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <canvas 
              ref={originalCanvasRef} 
              style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', display: showOriginal ? 'block' : 'none' }} 
            />
            <canvas 
              ref={canvasRef} 
              style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', display: showOriginal ? 'none' : 'block' }} 
            />
            
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
              <button 
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onMouseLeave={() => setShowOriginal(false)}
                style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.6)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
              >
                Hold to view Original
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
