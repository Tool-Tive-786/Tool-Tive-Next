import { BoundingBox, SourceItem, VectorSegment } from "../model/types";
import { mergeBoundingBoxes } from "../geometry/coordinates";

export function getTableRegions(
    items: SourceItem[],
    segments: VectorSegment[]
): BoundingBox[] {
    const regions: BoundingBox[] = [];

    // 1. Grid-based regions (Bordered)
    if (segments.length >= 4) {
        // Group segments that are connected or form grids
        // For simplicity, if we have enough segments to form a grid, we treat the bounding box of all segments as a region.
        const gridBbox = mergeBoundingBoxes(segments.map(s => s.bbox));
        
        // Expand slightly to catch text just inside or touching the border
        const expandedGridBbox = {
            x: gridBbox.x - 5,
            y: gridBbox.y - 5,
            width: gridBbox.width + 10,
            height: gridBbox.height + 10,
        };
        regions.push(expandedGridBbox);
    }

    // 2. Alignment-based regions (Borderless)
    // Find clusters of text that align in columns and rows.
    // If a text item spans the whole width or is isolated, it's NOT a table.
    // We do this by projecting X coordinates to find dense columns, 
    // and merging vertically if gaps are small.
    
    // Sort items vertically
    const sortedItems = [...items].sort((a, b) => a.bbox.y - b.bbox.y);
    
    let currentCluster: SourceItem[] = [];
    
    for (const item of sortedItems) {
        // If an item is very wide (e.g., > 60% of page width), it might be a paragraph or a main title.
        // But be careful: a very wide item might be a merged header inside a table.
        // We look at Y gaps. If the Y gap is large, we break the cluster.
        if (currentCluster.length === 0) {
            currentCluster.push(item);
            continue;
        }

        const prevItem = currentCluster[currentCluster.length - 1];
        const yGap = item.bbox.y - (prevItem.bbox.y + prevItem.bbox.height);

        // A large vertical gap (e.g. > 4x font size) breaks the region
        // Problem 5: Better table separation. A gap of > 3.5x font size implies a new table region,
        // but we must be careful not to detach table headers that have a ~3x gap.
        const threshold = Math.max(30, (item.fontSize || 10) * 3.5);
        
        if (yGap > threshold) {
            // Check if current cluster looks like a table (at least 2 rows, multiple columns)
            if (isValidBorderlessRegion(currentCluster)) {
                regions.push(mergeBoundingBoxes(currentCluster.map(i => i.bbox)));
            }
            currentCluster = [item];
        } else {
            currentCluster.push(item);
        }
    }
    
    if (isValidBorderlessRegion(currentCluster)) {
        regions.push(mergeBoundingBoxes(currentCluster.map(i => i.bbox)));
    }

    return regions;
}

function isValidBorderlessRegion(items: SourceItem[]): boolean {
    if (items.length < 4) return false;
    
    // Check if we have horizontal alignment (multiple columns)
    const xPoints = items.map(i => i.bbox.x);
    const uniqueX = new Set(xPoints.map(x => Math.round(x / 5) * 5)); // Group by ~5 units
    
    // A table should have at least 2 distinct X alignments and multiple items
    if (uniqueX.size < 2) return false;
    
    return true;
}

export function isInsideRegion(item: SourceItem, region: BoundingBox): boolean {
    // Check if item's center point is inside the region, or if it substantially overlaps
    const cx = item.bbox.x + item.bbox.width / 2;
    const cy = item.bbox.y + item.bbox.height / 2;

    return cx >= region.x && cx <= region.x + region.width &&
           cy >= region.y && cy <= region.y + region.height;
}
