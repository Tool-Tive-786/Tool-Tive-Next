import { BoundingBox, ExtractedTable, SourceItem, VectorSegment } from "../model/types";
import { mergeBoundingBoxes } from "../geometry/coordinates";
import { assignCells } from "../structure/cells";
import { inferRowBoundaries } from "../structure/rows";
import { inferColumnBoundaries, detectTableDirection } from "../structure/columns";
import { dropPhantomColumns } from "../structure/filter";
import { computeOverallConfidence } from "../validation";

export function detectBorderedTables(
    pageNumber: number,
    items: SourceItem[],
    segments: VectorSegment[]
): ExtractedTable[] {
    if (segments.length < 4) return [];
    
    const tableBbox = mergeBoundingBoxes(segments.map(s => s.bbox));
    
    const tableItems = items.filter(item => 
        item.bbox.x >= tableBbox.x - 5 &&
        item.bbox.y >= tableBbox.y - 5 &&
        item.bbox.x + item.bbox.width <= tableBbox.x + tableBbox.width + 5 &&
        item.bbox.y + item.bbox.height <= tableBbox.y + tableBbox.height + 5
    );
    
    if (tableItems.length === 0) return [];
    
    // Calculate median font height
    const fontHeights = tableItems.map(item => item.fontSize || item.bbox.height).sort((a, b) => a - b);
    const medianFontHeight = fontHeights.length > 0 ? fontHeights[Math.floor(fontHeights.length / 2)] : 12;

    // Step A: Vector Line Extraction & Noise Filtering
    // Filter out lines with length < 2x median font height. (Assume thickness > 0.5pt is checked upstream or we check if available, but segment doesn't have thickness right now)
    const validSegments = segments.filter(s => {
        const length = s.orientation === 'horizontal' ? s.bbox.width : s.bbox.height;
        return length >= medianFontHeight * 2.0;
    });

    const horizSegments = validSegments.filter(s => s.orientation === 'horizontal').map(s => s.bbox.y);
    horizSegments.push(tableBbox.y);
    horizSegments.push(tableBbox.y + tableBbox.height);
    const sortedRowBoundaries = Array.from(new Set(horizSegments)).sort((a, b) => a - b);
    
    // Snap nearby lines < 2px
    const rowBoundaries: number[] = [];
    for (const y of sortedRowBoundaries) {
        if (rowBoundaries.length === 0 || y - rowBoundaries[rowBoundaries.length - 1] > 2) {
            rowBoundaries.push(y);
        }
    }

    const vertSegments = validSegments.filter(s => s.orientation === 'vertical').map(s => s.bbox.x);
    vertSegments.push(tableBbox.x);
    vertSegments.push(tableBbox.x + tableBbox.width);
    const sortedColBoundaries = Array.from(new Set(vertSegments)).sort((a, b) => a - b);
    
    const columnBoundaries: number[] = [];
    for (const x of sortedColBoundaries) {
        if (columnBoundaries.length === 0 || x - columnBoundaries[columnBoundaries.length - 1] > 2) {
            columnBoundaries.push(x);
        }
    }
    
    if (rowBoundaries.length < 3 || columnBoundaries.length < 2) {
        return [];
    }
    
    const direction = detectTableDirection(tableItems);
    const geometry = { bbox: tableBbox, rowBoundaries, columnBoundaries };
    const tableId = `tbl-bordered-p${pageNumber}-${Date.now()}`;
    const { cells: initialCells, unassigned } = assignCells(tableId, tableItems, geometry, pageNumber, direction);
    const { cells, newColumnCount } = dropPhantomColumns(initialCells, columnBoundaries.length - 1, rowBoundaries.length - 1);

    const table: ExtractedTable = {
        id: tableId,
        pageNumbers: [pageNumber],
        bbox: tableBbox,
        geometry,
        cells,
        rowCount: rowBoundaries.length - 1,
        columnCount: newColumnCount,
        structureConfidence: 0.9,
        textConfidence: 1.0,
        overallConfidence: "High", // Temporary, will be computed
        detectionMode: "bordered",
        direction,
        isMultiPage: false,
        unassignedItems: unassigned.length > 0 ? unassigned : undefined,
        issues: unassigned.length > 0 ? ["unassigned_items_present"] : undefined
    };

    table.overallConfidence = computeOverallConfidence(table);
    return [table];
}
