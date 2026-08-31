'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExtractedTable } from '../../../lib/extraction-core/model/types';

interface PdfDebugCanvasProps {
    file: File;
    table: ExtractedTable;
}

export default function PdfDebugCanvas({ file, table }: PdfDebugCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(1.0);
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        let renderTask: any = null;
        let isCancelled = false;

        const renderPdf = async () => {
            try {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                    'pdfjs-dist/build/pdf.worker.min.mjs',
                    window.location.origin
                ).toString();

                const arrayBuffer = await file.arrayBuffer();
                if (isCancelled) return;

                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    useWorkerFetch: false,
                    useSystemFonts: true,
                });

                const pdf = await loadingTask.promise;
                if (isCancelled) return;

                // The table has pageNumbers[0]
                const pageNum = table.pageNumbers[0] || 1;
                const page = await pdf.getPage(pageNum);
                if (isCancelled) return;

                const viewport = page.getViewport({ scale: 1.5 }); // Use a decent scale for debug
                setScale(1.5);

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                renderTask = page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas as any,
                    canvasFactory: undefined as any
                } as any);

                await renderTask.promise;
            } catch (err: any) {
                if (!isCancelled) {
                    console.error('Failed to render PDF for debug:', err);
                    setRenderError(err.message);
                }
            }
        };

        renderPdf();

        return () => {
            isCancelled = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [file, table]);

    if (renderError) {
        return <div className="debug-error text-red-500">Failed to render PDF preview: {renderError}</div>;
    }

    const { geometry } = table;
    const { bbox, rowBoundaries, columnBoundaries } = geometry;

    return (
        <div style={{ position: 'relative', display: 'inline-block', border: '1px solid #ccc', margin: '20px 0' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            
            <svg 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Table Bounding Box */}
                <rect 
                    x={bbox.x * scale} 
                    y={bbox.y * scale} 
                    width={bbox.width * scale} 
                    height={bbox.height * scale} 
                    fill="rgba(0, 0, 255, 0.1)"
                    stroke="blue"
                    strokeWidth="2"
                />

                {/* Row Bands */}
                {rowBoundaries.map((y, i) => (
                    <line 
                        key={`row-${i}`}
                        x1={bbox.x * scale} 
                        y1={y * scale} 
                        x2={(bbox.x + bbox.width) * scale} 
                        y2={y * scale} 
                        stroke="rgba(255, 0, 0, 0.6)" 
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                    />
                ))}

                {/* Column Boundaries */}
                {columnBoundaries.map((x, i) => (
                    <line 
                        key={`col-${i}`}
                        x1={x * scale} 
                        y1={bbox.y * scale} 
                        x2={x * scale} 
                        y2={(bbox.y + bbox.height) * scale} 
                        stroke="rgba(0, 255, 0, 0.6)" 
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                    />
                ))}

                {/* Cell content boxes (text elements) */}
                {table.cells.map(cell => (
                    <rect 
                        key={cell.id}
                        x={cell.bbox.x * scale} 
                        y={cell.bbox.y * scale} 
                        width={cell.bbox.width * scale} 
                        height={cell.bbox.height * scale} 
                        fill="none"
                        stroke="purple"
                        strokeWidth="1"
                        opacity="0.7"
                    />
                ))}
            </svg>
        </div>
    );
}
