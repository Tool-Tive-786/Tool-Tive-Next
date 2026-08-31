import { ExtractedTable, ConfidenceLevel } from "./model/types";

export function validateCanonicalTable(table: ExtractedTable): void {
    if (!table.id) throw new Error("Table is missing unique ID.");
    if (table.rowCount < 1 || table.columnCount < 1) throw new Error("Table has invalid dimensions.");
    if (!table.geometry.bbox || table.geometry.bbox.width <= 0 || table.geometry.bbox.height <= 0) {
        throw new Error("Table bounding box is invalid.");
    }
    
    // Check cell continuity and boundaries
    const cellIds = new Set<string>();
    
    for (const cell of table.cells) {
        if (!cell.id) throw new Error("Cell is missing unique ID.");
        if (cellIds.has(cell.id)) throw new Error(`Duplicate cell ID detected: ${cell.id}`);
        cellIds.add(cell.id);
        
        if (cell.tableId !== table.id) {
            throw new Error(`Cell ${cell.id} belongs to wrong tableId: ${cell.tableId}`);
        }
        
        if (cell.row < 0 || cell.row >= table.rowCount) {
            throw new Error(`Cell ${cell.id} has out-of-bounds row index: ${cell.row}`);
        }
        
        if (cell.column < 0 || cell.column >= table.columnCount) {
            throw new Error(`Cell ${cell.id} has out-of-bounds column index: ${cell.column}`);
        }
        
        // Fabrication Check (Section 1): Any cell with text MUST have a valid source trace.
        // Exception: Cells created manually via the editor (`cell.edited === true`)
        if (cell.text.trim().length > 0 && (!cell.sourceItemRefs || cell.sourceItemRefs.length === 0) && !cell.edited) {
            throw new Error(`Fabrication Check Failed: Cell ${cell.id} contains text "${cell.text}" but has no sourceItemRefs.`);
        }
        
        // Type consistency check (Section 28)
        if (cell.detectedType && cell.text.trim().length > 0) {
            const colType = table.cells.find(c => c.column === cell.column && c.detectedType && !c.isHeader)?.detectedType;
            if (colType && cell.detectedType !== colType && !cell.isHeader && !cell.isMerged) {
                throw new Error(`Type consistency failed: Column ${cell.column} has mixed types.`);
            }
        }
    }
    
    // Validate monotonic row ordering (Section 19)
    // Calculate the mean Y of each row's cells (using their bounding boxes)
    const rowMeanY: number[] = new Array(table.rowCount).fill(undefined);
    for (let r = 0; r < table.rowCount; r++) {
        let sumY = 0;
        let count = 0;
        for (const cell of table.cells) {
            if (cell.row === r && cell.bbox.height > 0) {
                sumY += cell.bbox.y;
                count++;
            }
        }
        if (count > 0) {
            rowMeanY[r] = sumY / count;
        }
    }
    
    let lastY = -Infinity;
    for (let r = 0; r < table.rowCount; r++) {
        const currentY = rowMeanY[r];
        if (currentY !== undefined) {
            // Allow a small tolerance for wrapped lines or noise
            if (currentY < lastY - 5) {
                throw new Error(`Row order violation: Row ${r} is geometrically above Row ${r-1} (Y=${currentY} < Y=${lastY})`);
            }
            lastY = currentY;
        }
    }
    
    // Check boundary sorting
    for (let i = 1; i < table.geometry.rowBoundaries.length; i++) {
        if (table.geometry.rowBoundaries[i] < table.geometry.rowBoundaries[i - 1]) {
            throw new Error("Row boundaries are not strictly ascending.");
        }
    }
    for (let i = 1; i < table.geometry.columnBoundaries.length; i++) {
        if (table.geometry.columnBoundaries[i] < table.geometry.columnBoundaries[i - 1]) {
            throw new Error("Column boundaries are not strictly ascending.");
        }
    }
}

export function computeOverallConfidence(table: ExtractedTable): ConfidenceLevel {
    // Determine confidence based on weakest dimension
    const sConf = table.structureConfidence ?? 0.5;
    const tConf = table.textConfidence ?? 1.0; // Assume 1.0 for digital pdf
    
    const minConf = Math.min(sConf, tConf);
    
    if (table.detectionMode === 'borderless') {
        // Borderless is capped at Review Recommended
        if (minConf > 0.4) return "Review Recommended";
        return "Low";
    }
    
    if (minConf > 0.85) return "High";
    if (minConf > 0.5) return "Review Recommended";
    return "Low";
}
