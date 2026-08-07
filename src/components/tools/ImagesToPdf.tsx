'use client';

import React, { useState } from 'react';
import { UploadCloud, FileType, FileDown, Trash2, Image as ImageIcon, FileArchive, Loader2 } from 'lucide-react';
import '@/styles/images-to-pdf.css';

const MAX_IMAGES = 100;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];

export default function ImagesToPdf() {
    const [images, setImages] = useState<File[]>([]);
    const [pdfCount, setPdfCount] = useState<number | string>(1);
    const [outputFileName, setOutputFileName] = useState<string>('images');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files).filter(file => SUPPORTED_FORMATS.includes(file.type));
        setImages(prev => {
            const newImages = [...prev, ...files].slice(0, MAX_IMAGES);
            return newImages;
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePdfCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setPdfCount('');
            return;
        }
        const count = parseInt(val);
        setPdfCount(isNaN(count) ? '' : count);
    };

    const getValidPdfCount = () => {
        let count = typeof pdfCount === 'number' ? pdfCount : parseInt(pdfCount as string) || 1;
        if (count < 1) count = 1;
        if (images.length > 0 && count > images.length) count = images.length;
        return count;
    };

    const processImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                }
                resolve(canvas.toDataURL('image/jpeg', 0.95));
                URL.revokeObjectURL(objectUrl);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load image'));
            };

            img.src = objectUrl;
        });
    };

    const generatePDFs = async () => {
        if (images.length === 0) return;
        setIsGenerating(true);
        setProgress('Loading modules...');

        const safeFileName = outputFileName.trim() || 'images';

        try {
            const jsPDFModule = await import('jspdf');
            const jsPDF = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;
            const JSZip = (await import('jszip')).default;

            let actualPdfCount = getValidPdfCount();

            const chunks: File[][] = [];
            const baseSize = Math.floor(images.length / actualPdfCount);
            let remainder = images.length % actualPdfCount;

            let startIndex = 0;
            for (let i = 0; i < actualPdfCount; i++) {
                const chunkSize = baseSize + (remainder > 0 ? 1 : 0);
                if (remainder > 0) remainder--;
                chunks.push(images.slice(startIndex, startIndex + chunkSize));
                startIndex += chunkSize;
            }

            const A4_WIDTH = 210;
            const A4_HEIGHT = 297;

            const generatedPdfs: { name: string; blob: Blob }[] = [];

            for (let i = 0; i < chunks.length; i++) {
                setProgress(`Generating PDF ${i + 1} of ${chunks.length}...`);
                const chunk = chunks[i];
                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                for (let j = 0; j < chunk.length; j++) {
                    if (j > 0) doc.addPage();

                    const file = chunk[j];
                    const imgData = await processImage(file);

                    const img = new Image();
                    img.src = imgData;
                    await new Promise(r => { img.onload = r; });

                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    const ratio = Math.min(A4_WIDTH / imgWidth, A4_HEIGHT / imgHeight);
                    const printWidth = (imgWidth * ratio) * 0.95;
                    const printHeight = (imgHeight * ratio) * 0.95;

                    const x = (A4_WIDTH - printWidth) / 2;
                    const y = (A4_HEIGHT - printHeight) / 2;

                    doc.addImage(imgData, 'JPEG', x, y, printWidth, printHeight);
                }

                const blob = doc.output('blob');
                generatedPdfs.push({ name: `${safeFileName}-part-${i + 1}.pdf`, blob });
            }

            setProgress('Preparing download...');

            if (generatedPdfs.length === 1) {
                const url = URL.createObjectURL(generatedPdfs[0].blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${safeFileName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else {
                const zip = new JSZip();
                generatedPdfs.forEach(pdf => {
                    zip.file(pdf.name, pdf.blob);
                });
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${safeFileName}.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred while generating the PDF. Please try again.');
        } finally {
            setIsGenerating(false);
            setProgress('');
        }
    };

    return (
        <div className="ipdf-root">
            <div className="ipdf-layout">

                {/* Left Column: Header + Upload */}
                <div className="ipdf-panel" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0 24px 0 0' }}>

                    <div className="ipdf-upload-zone">
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg, image/png, image/svg+xml, image/gif, image/webp"
                            className="ipdf-upload-input"
                            onChange={handleFileChange}
                            disabled={isGenerating}
                        />
                        <div className="ipdf-icon-wrap">
                            <UploadCloud size={32} />
                        </div>
                        <h3>Drop your images here</h3>
                        <p>or click to browse from your computer</p>
                    </div>

                    <div className="ipdf-formats">
                        <FileType />
                        <span>
                            <b>Supported Formats:</b> JPEG, PNG, SVG, GIF, WebP. <br />Max {MAX_IMAGES} images per batch.
                        </span>
                    </div>

                </div>

                {/* Right Column: Grid and Controls */}
                <div className="ipdf-panel" style={{ padding: '32px' }}>
                    {images.length > 0 ? (
                        <div>
                            <div className="ipdf-controls">
                                <div className="ipdf-inputs">
                                    <div className="ipdf-input-group">
                                        <label>Split into PDFs</label>
                                        <div className="ipdf-input-wrap">
                                            <input
                                                type="number"
                                                min="1"
                                                max={images.length}
                                                value={pdfCount}
                                                onChange={handlePdfCountChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="ipdf-input-group">
                                        <label>File Name</label>
                                        <div className="ipdf-input-wrap">
                                            <input
                                                type="text"
                                                value={outputFileName}
                                                onChange={(e) => setOutputFileName(e.target.value)}
                                                placeholder="images"
                                            />
                                            <span className="ipdf-input-suf">
                                                {getValidPdfCount() > 1 ? '.zip' : '.pdf'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={generatePDFs}
                                    disabled={isGenerating}
                                    className="ipdf-btn"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="ipdf-spinner" size={20} />
                                            {progress}
                                        </>
                                    ) : (
                                        <>
                                            {getValidPdfCount() > 1 ? <FileArchive size={20} /> : <FileDown size={20} />}
                                            Generate {getValidPdfCount() > 1 ? 'ZIP' : 'PDF'}
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="ipdf-grid-header">
                                <h3>
                                    Selected Images
                                    <span className="ipdf-badge">{images.length}</span>
                                </h3>
                                <button
                                    onClick={() => setImages([])}
                                    className="ipdf-clear-btn"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="ipdf-grid">
                                {images.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="ipdf-item">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index}`}
                                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="ipdf-item-remove"
                                            title="Remove image"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="ipdf-item-name">
                                            {index + 1}. {file.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="ipdf-empty">
                            <ImageIcon />
                            <h4>No images selected</h4>
                            <p>Upload images from the left panel to preview them here and generate your PDFs.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}