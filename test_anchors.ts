import { SourceItem } from './src/lib/extraction-core/model/types';

export function inferColumnBoundaries(items: SourceItem[], tableBbox: {x:number, width:number}): number[] {
    if (items.length === 0) return [];

    const anchors: number[] = [];
    const numericRegex = /^[-(]?\s*[$€£¥]?\s?[\d,]+(\.\d+)?\)?%?$/;

    for (const item of items) {
        if (item.bbox.width > tableBbox.width * 0.5) continue;
        const text = item.text.trim();
        if (numericRegex.test(text)) {
            anchors.push(item.bbox.x + item.bbox.width);
        } else {
            anchors.push(item.bbox.x);
        }
    }

    anchors.sort((a, b) => a - b);

    const mergedAnchors: number[] = [];
    let currentClusterSum = 0;
    let currentClusterCount = 0;

    for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        if (currentClusterCount === 0) {
            currentClusterSum = anchor;
            currentClusterCount = 1;
        } else {
            const currentAvg = currentClusterSum / currentClusterCount;
            if (Math.abs(anchor - currentAvg) <= 15) { // 15px cluster radius
                currentClusterSum += anchor;
                currentClusterCount++;
            } else {
                mergedAnchors.push(currentClusterSum / currentClusterCount);
                currentClusterSum = anchor;
                currentClusterCount = 1;
            }
        }
    }
    if (currentClusterCount > 0) {
        mergedAnchors.push(currentClusterSum / currentClusterCount);
    }

    const boundaries: number[] = [tableBbox.x];
    for (let i = 0; i < mergedAnchors.length - 1; i++) {
        const mid = mergedAnchors[i] + (mergedAnchors[i + 1] - mergedAnchors[i]) / 2;
        boundaries.push(mid);
    }
    boundaries.push(tableBbox.x + tableBbox.width);

    return Array.from(new Set(boundaries)).sort((a, b) => a - b);
}

const items: any[] = [
    { text: 'Name', bbox: { x: 50, width: 40 } },
    { text: 'Bob', bbox: { x: 50, width: 30 } },
    { text: 'Rate', bbox: { x: 150, width: 30 } },
    { text: '$1,440.00', bbox: { x: 130, width: 50 } } // x_max = 180
];

console.log(inferColumnBoundaries(items, {x: 50, width: 130}));
