import { BoundingBox, SourceItem } from "../model/types";
import { calculateOverlap } from "../geometry/coordinates";

export function inferRowBoundaries(items: SourceItem[], tableBbox: BoundingBox): number[] {
    if (items.length === 0) return [];

    // Step A: Row Clustering (Y-Axis)
    const fontHeights = items.map(item => item.fontSize || item.bbox.height).sort((a, b) => a - b);
    const medianFontHeight = fontHeights.length > 0 ? fontHeights[Math.floor(fontHeights.length / 2)] : 12;

    // Sort all text items on the page by y_min (bbox.y)
    const sorted = [...items].sort((a, b) => a.bbox.y - b.bbox.y);

    const boundaries: number[] = [tableBbox.y];
    let currentRowYMin = sorted[0].bbox.y;
    let currentRowYMax = sorted[0].bbox.y + sorted[0].bbox.height;

    for (let i = 1; i < sorted.length; i++) {
        const item = sorted[i];
        
        // Problem 3: Calculate gap between current item and previous item's bottom (currentRowYMax)
        // If we use currentRowYMin, multi-line cells will get split into separate rows!
        const deltaY = item.bbox.y - currentRowYMax;
        
        // Rule: If gap > (median_font_height * 0.5), it is a NEW ROW. Otherwise, it belongs to the CURRENT ROW.
        if (deltaY > medianFontHeight * 0.5) {
            // New row boundary
            boundaries.push(currentRowYMax + deltaY / 2);
            currentRowYMin = item.bbox.y;
            currentRowYMax = item.bbox.y + item.bbox.height;
        } else {
            // Extend current row
            currentRowYMax = Math.max(currentRowYMax, item.bbox.y + item.bbox.height);
        }
    }
    
    boundaries.push(tableBbox.y + tableBbox.height);
    return boundaries;
}
