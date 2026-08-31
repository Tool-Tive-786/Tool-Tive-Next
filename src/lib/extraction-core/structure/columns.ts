import { BoundingBox, SourceItem } from "../model/types";

import { inferRowBoundaries } from "./rows";

export function inferColumnBoundaries(items: SourceItem[], tableBbox: BoundingBox): number[] {
    if (items.length === 0) return [];

    const fontHeights = items.map(item => item.fontSize || item.bbox.height).sort((a, b) => a - b);
    const medianFontHeight = fontHeights.length > 0 ? fontHeights[Math.floor(fontHeights.length / 2)] : 12;

    // Project all items onto the X-axis
    // We represent each item as an interval [x, x + width]
    // To ensure columns don't randomly merge, we will cluster their center points,
    // or better, find contiguous blocks of X-coordinates where text exists.
    
    // Sort items by their left edge
    const sortedItems = [...items].sort((a, b) => a.bbox.x - b.bbox.x);
    
    // Merge overlapping/nearby X intervals to find "text columns"
    // Two items belong to the same column if the horizontal gap between them is small
    const xIntervals: { min: number, max: number }[] = [];
    
    for (const item of sortedItems) {
        // Ignore items that span more than 50% of the table width when inferring column gaps,
        // otherwise a single wide title will bridge all columns and merge them into one!
        if (item.bbox.width > tableBbox.width * 0.5) {
            continue;
        }
        
        const itemMin = item.bbox.x;
        const itemMax = item.bbox.x + item.bbox.width;
        
        let merged = false;
        // Check if it overlaps or is very close to an existing interval
        for (const interval of xIntervals) {
            // Distance between intervals
            const gap = Math.max(0, Math.max(itemMin, interval.min) - Math.min(itemMax, interval.max));
            
            // If they overlap or the gap is very small (e.g. 0.3x font size, which is roughly the size of a space character)
            // they belong to the same logical visual column.
            // Using 1.0x was too aggressive and merged distinct columns in dense tables.
            if (gap <= medianFontHeight * 0.3) {
                interval.min = Math.min(interval.min, itemMin);
                interval.max = Math.max(interval.max, itemMax);
                merged = true;
                break;
            }
        }
        
        if (!merged) {
            xIntervals.push({ min: itemMin, max: itemMax });
        }
    }
    
    // Sort intervals left to right
    xIntervals.sort((a, b) => a.min - b.min);
    
    // The boundaries are the midpoints of the gaps between these intervals
    const boundaries: number[] = [tableBbox.x];
    
    for (let i = 0; i < xIntervals.length - 1; i++) {
        const curr = xIntervals[i];
        const next = xIntervals[i + 1];
        
        // Midpoint of the gap between column intervals
        const gapMidpoint = curr.max + (next.min - curr.max) / 2;
        boundaries.push(gapMidpoint);
    }
    
    boundaries.push(tableBbox.x + tableBbox.width);
    
    // Remove duplicates and sort
    const finalBoundaries = Array.from(new Set(boundaries)).sort((a, b) => a - b);
    return finalBoundaries;
}

export function detectTableDirection(items: SourceItem[]): "ltr" | "rtl" {
    let rtlCount = 0;
    let ltrCount = 0;
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const ltrRegex = /[A-Za-z]/;
    
    for (const item of items) {
        if (rtlRegex.test(item.text)) rtlCount++;
        else if (ltrRegex.test(item.text)) ltrCount++;
    }
    
    return rtlCount > ltrCount ? "rtl" : "ltr";
}
