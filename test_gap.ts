import { SourceItem } from './src/lib/extraction-core/model/types';

export function inferColumnBoundaries(items: SourceItem[], tableBbox: {x:number, width:number}): number[] {
    if (items.length === 0) return [];

    const fontHeights = items.map(item => item.fontSize || item.bbox.height).sort((a, b) => a - b);
    const medianFontHeight = fontHeights.length > 0 ? fontHeights[Math.floor(fontHeights.length / 2)] : 12;

    const sortedItems = [...items].sort((a, b) => a.bbox.x - b.bbox.x);
    const xIntervals: { min: number, max: number }[] = [];
    
    for (const item of sortedItems) {
        if (item.bbox.width > tableBbox.width * 0.5) continue;
        
        const itemMin = item.bbox.x;
        const itemMax = item.bbox.x + item.bbox.width;
        
        let merged = false;
        for (const interval of xIntervals) {
            const gap = Math.max(0, Math.max(itemMin, interval.min) - Math.min(itemMax, interval.max));
            
            // USING 0.3x FONT HEIGHT THRESHOLD
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
    
    xIntervals.sort((a, b) => a.min - b.min);
    const boundaries: number[] = [tableBbox.x];
    for (let i = 0; i < xIntervals.length - 1; i++) {
        boundaries.push(xIntervals[i].max + (xIntervals[i + 1].min - xIntervals[i].max) / 2);
    }
    boundaries.push(tableBbox.x + tableBbox.width);
    
    return Array.from(new Set(boundaries)).sort((a, b) => a - b);
}

const items: any[] = [
    { text: 'Col 1', bbox: { x: 50, width: 40, height: 12 } }, // end: 90
    { text: 'Col 2', bbox: { x: 95, width: 30, height: 12 } }, // gap = 5 (< 1.0*12 = 12). If 0.3, 0.3*12 = 3.6. Gap 5 > 3.6, won't merge!
    { text: 'Col 3', bbox: { x: 135, width: 30, height: 12 } } // gap = 10
];

console.log(inferColumnBoundaries(items, {x: 50, width: 130}));
