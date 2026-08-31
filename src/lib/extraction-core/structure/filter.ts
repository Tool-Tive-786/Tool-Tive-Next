import { ExtractedCell } from "../model/types";

/**
 * Scans the complete grid. If a column is empty across ALL data rows, 
 * it is a phantom column (e.g., an artifact of vertical whitespace projection) 
 * and is dropped. Legitimate blank cells (where only some rows are empty) 
 * are preserved as `null`/`""`.
 * 
 * Returns a new array of cells with their column indices remapped.
 */
export function dropPhantomColumns(
    cells: ExtractedCell[],
    columnCount: number,
    rowCount: number
): { cells: ExtractedCell[]; newColumnCount: number } {
    if (cells.length === 0 || columnCount === 0 || rowCount === 0) {
        return { cells, newColumnCount: columnCount };
    }

    // A column is phantom if all cells in that column have empty text.
    // (Merged headers spanning the column don't necessarily make it non-phantom,
    // but if it's a true merged cell, its text lives in its base cell. We will
    // just check if ANY cell strictly inside this column has text).
    
    const columnHasData = new Array(columnCount).fill(false);
    
    for (const cell of cells) {
        if (cell.text.trim().length > 0 && !cell.isHeader && !cell.isMerged) {
            columnHasData[cell.column] = true;
        }
    }

    // Calculate new column indices mapping
    const colMapping = new Array(columnCount).fill(-1);
    let newColIdx = 0;
    
    for (let c = 0; c < columnCount; c++) {
        if (columnHasData[c]) {
            colMapping[c] = newColIdx++;
        }
    }

    const newColumnCount = newColIdx;

    // Map cells to new columns and drop cells that belonged to phantom columns
    const filteredCells: ExtractedCell[] = [];
    
    for (const cell of cells) {
        if (columnHasData[cell.column]) {
            filteredCells.push({
                ...cell,
                column: colMapping[cell.column],
                // If it spans columns, reduce colSpan if it covers phantom columns
                colSpan: cell.colSpan ? calculateNewColSpan(cell.column, cell.colSpan, columnHasData) : undefined
            });
        } else if (cell.isHeader && cell.text.trim().length > 0) {
            // Preserve headers even if their primary column was dropped
            // Assign it to the first valid column it spans, or column 0
            let newCol = 0;
            if (cell.colSpan) {
                for (let c = cell.column; c >= 0; c--) {
                    if (columnHasData[c]) {
                        newCol = colMapping[c];
                        break;
                    }
                }
            }
            filteredCells.push({
                ...cell,
                column: newCol,
                colSpan: newColumnCount // headers span the whole table
            });
        }
    }

    return { cells: filteredCells, newColumnCount };
}

function calculateNewColSpan(startCol: number, originalColSpan: number, columnHasData: boolean[]): number {
    let newSpan = 0;
    for (let c = startCol; c < startCol + originalColSpan && c < columnHasData.length; c++) {
        if (columnHasData[c]) {
            newSpan++;
        }
    }
    return Math.max(1, newSpan);
}
