import * as pdfjsLib from 'pdfjs-dist';
import { BoundingBox, SourceItem, VectorSegment } from '../../extraction-core/model/types';
import { pdfToNormalizedCoordinates } from '../../extraction-core/geometry/coordinates';

// Use a standardized worker for pdfjs (often hosted from CDN or next's public folder)
// In a worker environment, we can rely on standard imports if configured, but let's keep it robust.
if (typeof window !== 'undefined' && 'pdfjsWorker' in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = (window as any).pdfjsWorker;
} else {
    // Fallback CDN if not configured locally (for V1 simplicity and robustness)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function parsePdfPage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
): Promise<{ items: SourceItem[], segments: VectorSegment[], width: number, height: number, isScanned: boolean, taggedStructure?: any }> {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const ops = await page.getOperatorList();
    
    // Scanned page heuristic: no text items, but valid PDF page
    // (A real implementation would check for large Image XObjects)
    const isScanned = textContent.items.length === 0;

    let taggedStructure: any = undefined;
    
    // Tagged structure extraction
    try {
        const markInfo = await pdf.getMarkInfo();
        if (markInfo && markInfo.Marked) {
            taggedStructure = await page.getStructTree();
        }
    } catch (e) {
        console.warn("Failed to extract tagged structure tree", e);
    }
    
    const items: SourceItem[] = [];
    const segments: VectorSegment[] = [];
    const coordSystem = { width: viewport.width, height: viewport.height };

    // Extract text items
    textContent.items.forEach((item: any, index: number) => {
        if ('str' in item && item.str.trim().length > 0) {
            // pdf.js transform is [scaleX, skewY, skewX, scaleY, translateX, translateY]
            const tx = item.transform;
            const x = tx[4];
            const y = tx[5];
            const width = item.width || (tx[0] * item.str.length * 0.5); // Approximation if width is weird
            const height = item.height || tx[3] || 10;
            
            const rawBbox = { x, y, width, height };
            // Note: pdf.js text coordinates are bottom-left
            const bbox = pdfToNormalizedCoordinates(rawBbox, coordSystem, true);
            
            items.push({
                pageNumber,
                itemIndex: index,
                text: item.str,
                bbox,
                fontSize: tx[3],
                fontName: item.fontName,
                transform: tx,
                source: "pdf"
            });
        }
    });

    // We need to track the transform matrix to accurately place vectors
    let currentTransform = [1, 0, 0, 1, 0, 0];
    const transformStack: number[][] = [];

    // Utility to apply transform
    const applyTransform = (x: number, y: number, m: number[]) => {
        return {
            x: x * m[0] + y * m[2] + m[4],
            y: x * m[1] + y * m[3] + m[5]
        };
    };

    // pdf.js OPS constants
    const OPS_SAVE = 10;
    const OPS_RESTORE = 11;
    const OPS_TRANSFORM = 12;
    const OPS_CONSTRUCT_PATH = 91;
    const PATH_RECT = 19;
    const PATH_MOVE_TO = 13;
    const PATH_LINE_TO = 14;

    for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i];

        if (fn === OPS_SAVE) {
            transformStack.push([...currentTransform]);
        } else if (fn === OPS_RESTORE) {
            if (transformStack.length > 0) {
                currentTransform = transformStack.pop()!;
            }
        } else if (fn === OPS_TRANSFORM) {
            const [m1, m2, m3, m4, m5, m6] = args;
            const [c1, c2, c3, c4, c5, c6] = currentTransform;
            currentTransform = [
                c1 * m1 + c3 * m2,
                c2 * m1 + c4 * m2,
                c1 * m3 + c3 * m4,
                c2 * m3 + c4 * m4,
                c1 * m5 + c3 * m6 + c5,
                c2 * m5 + c4 * m6 + c6
            ];
        } else if (fn === OPS_CONSTRUCT_PATH) {
            const subOps = args[0];
            const subArgs = args[1];
            let argIdx = 0;
            let currentX = 0;
            let currentY = 0;

            for (let j = 0; j < subOps.length; j++) {
                const op = subOps[j];
                if (op === PATH_RECT) {
                    const x = subArgs[argIdx++];
                    const y = subArgs[argIdx++];
                    const w = subArgs[argIdx++];
                    const h = subArgs[argIdx++];

                    const pt1 = applyTransform(x, y, currentTransform);
                    const pt2 = applyTransform(x + w, y, currentTransform);
                    const pt3 = applyTransform(x + w, y + h, currentTransform);
                    const pt4 = applyTransform(x, y + h, currentTransform);

                    // Add the 4 segments of the rectangle (normalized)
                    const normPt1 = pdfToNormalizedCoordinates(pt1 as any, coordSystem, false);
                    const normPt2 = pdfToNormalizedCoordinates(pt2 as any, coordSystem, false);
                    const normPt3 = pdfToNormalizedCoordinates(pt3 as any, coordSystem, false);
                    const normPt4 = pdfToNormalizedCoordinates(pt4 as any, coordSystem, false);

                    segments.push({ bbox: { x: Math.min(normPt1.x, normPt2.x), y: normPt1.y, width: Math.abs(normPt2.x - normPt1.x), height: 1 }, orientation: 'horizontal' } as any); // Bottom
                    segments.push({ bbox: { x: normPt2.x, y: Math.min(normPt2.y, normPt3.y), width: 1, height: Math.abs(normPt3.y - normPt2.y) }, orientation: 'vertical' } as any); // Right
                    segments.push({ bbox: { x: Math.min(normPt3.x, normPt4.x), y: normPt3.y, width: Math.abs(normPt4.x - normPt3.x), height: 1 }, orientation: 'horizontal' } as any); // Top
                    segments.push({ bbox: { x: normPt4.x, y: Math.min(normPt4.y, normPt1.y), width: 1, height: Math.abs(normPt1.y - normPt4.y) }, orientation: 'vertical' } as any); // Left
                } else if (op === PATH_MOVE_TO) {
                    currentX = subArgs[argIdx++];
                    currentY = subArgs[argIdx++];
                } else if (op === PATH_LINE_TO) {
                    const nextX = subArgs[argIdx++];
                    const nextY = subArgs[argIdx++];
                    
                    const pt1 = applyTransform(currentX, currentY, currentTransform);
                    const pt2 = applyTransform(nextX, nextY, currentTransform);
                    
                    const normPt1 = pdfToNormalizedCoordinates(pt1 as any, coordSystem, false);
                    const normPt2 = pdfToNormalizedCoordinates(pt2 as any, coordSystem, false);

                    const dx = Math.abs(normPt2.x - normPt1.x);
                    const dy = Math.abs(normPt2.y - normPt1.y);

                    if (dx > 0 || dy > 0) {
                        if (dx > dy) {
                            segments.push({ bbox: { x: Math.min(normPt1.x, normPt2.x), y: normPt1.y, width: dx, height: 1 }, orientation: 'horizontal' } as any);
                        } else {
                            segments.push({ bbox: { x: normPt1.x, y: Math.min(normPt1.y, normPt2.y), width: 1, height: dy }, orientation: 'vertical' } as any);
                        }
                    }

                    currentX = nextX;
                    currentY = nextY;
                }
            }
        }
    }

    page.cleanup();

    return { items, segments, width: viewport.width, height: viewport.height, isScanned, taggedStructure };
}
