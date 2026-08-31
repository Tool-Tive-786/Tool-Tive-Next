import { BoundingBox, ExtractedTable, SourceItem } from "../model/types";
import { mergeBoundingBoxes } from "../geometry/coordinates";
import { inferRowBoundaries } from "../structure/rows";
import { inferColumnBoundaries, detectTableDirection } from "../structure/columns";
import { assignCells } from "../structure/cells";
import { dropPhantomColumns } from "../structure/filter";
import { computeOverallConfidence } from "../validation";

export function detectBorderlessTables(
    pageNumber: number,
    items: SourceItem[]
): ExtractedTable[] {
    if (items.length < 4) return [];

    const tableBbox = mergeBoundingBoxes(items.map(i => i.bbox));
    const rowBoundaries = inferRowBoundaries(items, tableBbox);
    const columnBoundaries = inferColumnBoundaries(items, tableBbox);
    
    if (rowBoundaries.length < 3 || columnBoundaries.length < 3) {
        return [];
    }

    const direction = detectTableDirection(items);
    const geometry = { bbox: tableBbox, rowBoundaries, columnBoundaries };
    const tableId = `tbl-borderless-p${pageNumber}-${Date.now()}`;
    const { cells: initialCells, unassigned } = assignCells(tableId, items, geometry, pageNumber, direction);
    const { cells, newColumnCount } = dropPhantomColumns(initialCells, columnBoundaries.length - 1, rowBoundaries.length - 1);

    const table: ExtractedTable = {
        id: tableId,
        pageNumbers: [pageNumber],
        bbox: tableBbox,
        geometry,
        cells,
        rowCount: rowBoundaries.length - 1,
        columnCount: newColumnCount,
        structureConfidence: 0.6,
        textConfidence: 1.0,
        overallConfidence: "Review Recommended",
        detectionMode: "borderless",
        direction,
        isMultiPage: false,
        unassignedItems: unassigned.length > 0 ? unassigned : undefined,
        issues: unassigned.length > 0 ? ["unassigned_items_present"] : undefined
    };

    table.overallConfidence = computeOverallConfidence(table);
    return [table];
}
