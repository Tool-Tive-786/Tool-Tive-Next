import { BoundingBox } from "../model/types";

export interface CoordinateSystem {
    width: number;
    height: number;
    scale?: number;
}

/**
 * Normalizes a PDF bounding box (typically bottom-left origin in pure PDF context, 
 * though pdf.js viewport can adjust it). 
 * We enforce a Top-Left origin normalized system, matching typical Web Canvas geometry.
 */
export function pdfToNormalizedCoordinates(
    pdfBbox: BoundingBox,
    pdfSystem: CoordinateSystem,
    isBottomLeftOrigin: boolean = true
): BoundingBox {
    return {
        x: pdfBbox.x,
        y: isBottomLeftOrigin ? pdfSystem.height - pdfBbox.y - pdfBbox.height : pdfBbox.y,
        width: pdfBbox.width,
        height: pdfBbox.height,
    };
}

export function normalizedToPdfCoordinates(
    normalizedBbox: BoundingBox,
    pdfSystem: CoordinateSystem,
    isBottomLeftOrigin: boolean = true
): BoundingBox {
    return {
        x: normalizedBbox.x,
        y: isBottomLeftOrigin ? pdfSystem.height - normalizedBbox.y - normalizedBbox.height : normalizedBbox.y,
        width: normalizedBbox.width,
        height: normalizedBbox.height,
    };
}

/**
 * Converts normalized (Top-Left, PDF unit) coordinates to display Canvas coordinates
 */
export function normalizedToCanvas(
    normalizedBbox: BoundingBox,
    scale: number
): BoundingBox {
    return {
        x: normalizedBbox.x * scale,
        y: normalizedBbox.y * scale,
        width: normalizedBbox.width * scale,
        height: normalizedBbox.height * scale,
    };
}

/**
 * Converts Canvas coordinates back to normalized coordinates
 */
export function canvasToNormalized(
    canvasBbox: BoundingBox,
    scale: number
): BoundingBox {
    return {
        x: canvasBbox.x / scale,
        y: canvasBbox.y / scale,
        width: canvasBbox.width / scale,
        height: canvasBbox.height / scale,
    };
}

export function mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox {
    if (!boxes || boxes.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const b of boxes) {
        if (b.x < minX) minX = b.x;
        if (b.y < minY) minY = b.y;
        if (b.x + b.width > maxX) maxX = b.x + b.width;
        if (b.y + b.height > maxY) maxY = b.y + b.height;
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

export function calculateOverlap(a: BoundingBox, b: BoundingBox): number {
    const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    const overlapArea = xOverlap * yOverlap;
    
    if (overlapArea === 0) return 0;
    
    const aArea = a.width * a.height;
    const bArea = b.width * b.height;
    
    // Return overlap as a percentage of the smaller box
    return overlapArea / Math.min(aArea, bArea);
}

export function getIoU(a: BoundingBox, b: BoundingBox): number {
    const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    const overlapArea = xOverlap * yOverlap;
    
    if (overlapArea === 0) return 0;
    
    const unionArea = (a.width * a.height) + (b.width * b.height) - overlapArea;
    return overlapArea / unionArea;
}
