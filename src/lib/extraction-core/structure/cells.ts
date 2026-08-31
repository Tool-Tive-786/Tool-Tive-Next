import { BoundingBox, ExtractedCell, SourceItem, SourceItemRef, TableGeometry } from "../model/types";
import { calculateOverlap, mergeBoundingBoxes } from "../geometry/coordinates";

export function shouldMergeWithNewline(prevBbox: BoundingBox, currentBbox: BoundingBox, fontSize: number): boolean {
    const gap = currentBbox.y - (prevBbox.y + prevBbox.height);
    
    // Check X-axis overlap > 60% (Algorithm 3)
    const overlap = Math.max(0, Math.min(prevBbox.x + prevBbox.width, currentBbox.x + currentBbox.width) - Math.max(prevBbox.x, currentBbox.x));
    const overlapPercentage = overlap / Math.min(prevBbox.width, currentBbox.width);
    
    // Problem 7: Use \n when vertically stacked. Two items on the same line won't overlap by 60% in X.
    // So if they overlap in X, they must be a vertical stack.
    // Check if the current item is significantly lower than the previous item's top.
    const isLower = currentBbox.y > prevBbox.y + fontSize * 0.2;
    
    return overlapPercentage > 0.6 && isLower && gap < fontSize * 1.5;
}

export function assignCells(
    tableId: string,
    items: SourceItem[],
    geometry: TableGeometry,
    pageNumber: number,
    direction: "ltr" | "rtl" = "ltr"
): { cells: ExtractedCell[]; unassigned: SourceItemRef[] } {
    const cells: ExtractedCell[] = [];
    const unassigned: SourceItemRef[] = [];
    const cellMap = new Map<string, ExtractedCell>();

    // Helper to get or create a cell for a given row and column
    const getCell = (r: number, c: number): ExtractedCell => {
        const visualCol = direction === "rtl" ? geometry.columnBoundaries.length - 2 - c : c;
        const key = `${r}-${visualCol}`;
        if (!cellMap.has(key)) {
            cellMap.set(key, {
                id: `${tableId}-${r}-${visualCol}`,
                tableId,
                row: r,
                column: visualCol,
                text: "",
                pageNumber,
                bbox: { x: 0, y: 0, width: 0, height: 0 },
                sourceItemRefs: [],
                isHeader: false,
                isMerged: false,
            });
        }
        return cellMap.get(key)!;
    };

    // Pre-populate all cells so empty cells exist
    for (let r = 0; r < geometry.rowBoundaries.length - 1; r++) {
        for (let c = 0; c < geometry.columnBoundaries.length - 1; c++) {
            getCell(r, c);
        }
    }

    const { rowBoundaries, columnBoundaries } = geometry;

    for (const item of items) {
        // Step C: Text-to-Cell Assignment (Spatial Mapping) using center point
        const cx = item.bbox.x + item.bbox.width / 2;
        const cy = item.bbox.y + item.bbox.height / 2;
        
        let bestRow = -1;
        for (let r = 0; r < rowBoundaries.length - 1; r++) {
            if (cy >= rowBoundaries[r] && cy <= rowBoundaries[r + 1]) {
                bestRow = r;
                break;
            }
        }

        let bestCol = -1;
        let startCol = -1;
        let endCol = -1;

        for (let c = 0; c < columnBoundaries.length - 1; c++) {
            if (cx >= columnBoundaries[c] && cx <= columnBoundaries[c + 1]) {
                bestCol = c;
            }
            
            // For colspan/rowspan detection (spanning multiple cells)
            const colLeft = columnBoundaries[c];
            const colRight = columnBoundaries[c + 1];
            const itemLeft = item.bbox.x;
            const itemRight = item.bbox.x + item.bbox.width;
            const overlap = Math.max(0, Math.min(colRight, itemRight) - Math.max(colLeft, itemLeft));
            
            if (overlap > 2) { // Item significantly overlaps this column
                if (startCol === -1) startCol = c;
                endCol = c;
            }
        }

        // Problem 8: For merged cells, the "best" column (where its center falls) might not be the start column.
        // It must be anchored to the left-most column it spans.
        const targetCol = startCol !== -1 ? startCol : bestCol;

        if (bestRow !== -1 && targetCol !== -1) {
            const cell = getCell(bestRow, targetCol);
            
            if (cell.text.length > 0) {
                // Adaptive multi-line gap checking
                const fontSize = item.fontSize || item.bbox.height;
                const isNewline = shouldMergeWithNewline(cell.bbox, item.bbox, fontSize);
                
                cell.text += (isNewline ? "\n" : " ") + item.text;
                cell.bbox = mergeBoundingBoxes([cell.bbox, item.bbox]);
                
                if (isNewline) {
                    cell.issues = cell.issues || [];
                    if (!cell.issues.includes("multiline_detected")) cell.issues.push("multiline_detected");
                }
            } else {
                cell.text = item.text;
                cell.bbox = { ...item.bbox };
            }
            
            cell.sourceItemRefs.push({ pageNumber: item.pageNumber, itemIndex: item.itemIndex });
            
            // Check for merged span (Problem 5)
            // If the item spans multiple columns, record it for later post-processing
            if (startCol !== -1 && endCol !== -1 && startCol !== endCol) {
                cell.isMerged = true;
                cell.colSpan = (endCol - startCol) + 1;
                // If we're right-to-left, we need to adjust startCol mapping later, but colSpan is absolute size.
            }

        } else {
            console.log('UNASSIGNED:', item.text, {bestRow, bestCol});
            unassigned.push({ pageNumber: item.pageNumber, itemIndex: item.itemIndex });
        }
    }

    // Post-process to detect spanning rows (merged headers)
    const finalCells = Array.from(cellMap.values());
    for (let r = 0; r < geometry.rowBoundaries.length - 1; r++) {
        const rowCells = finalCells.filter(c => c.row === r && c.text.trim().length > 0);
        // If there's exactly 1 cell in the row
        if (rowCells.length === 1) {
            const cell = rowCells[0];
            const tableWidth = geometry.columnBoundaries[geometry.columnBoundaries.length - 1] - geometry.columnBoundaries[0];
            
            // Problem 4: Detect as header if it's explicitly merged across columns OR covers > 50% of table width
            if (cell.isMerged || cell.bbox.width > tableWidth * 0.5) {
                cell.isHeader = true;
                // Force colSpan to cover everything if it wasn't already merged
                if (!cell.isMerged) {
                    cell.isMerged = true;
                    cell.colSpan = geometry.columnBoundaries.length - 1;
                    cell.column = 0; // anchor to start
                }
            }
        }
    }

    return {
        cells: finalCells,
        unassigned
    };
}
