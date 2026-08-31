import * as ExcelJS from "exceljs";
import { ExtractedTable } from "../model/types";
import { inferColumnTypes } from "./types-inference";

export async function serializeToXlsx(table: ExtractedTable): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Extracted Table");

    const { cells, rowCount, columnCount } = table;
    
    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    // Infer column types to apply correct number formats
    inferColumnTypes(cells, columnCount);
    
    for (const cell of cells) {
        if (cell.text === null || cell.text === undefined) continue;

        // ExcelJS is 1-indexed for rows and columns
        const excelCell = worksheet.getCell(cell.row + 1, cell.column + 1);
        
        let value: any = cell.text;
        
        // Problem 4: Clear cells that are just asterisks
        if (typeof value === 'string' && /^[\*\s]+$/.test(value)) {
            value = null;
        }
        
        // Handle data types
        if (cell.detectedType && !cell.isHeader) {
            const rawText = cell.text.trim();
            if (cell.detectedType === "currency" || cell.detectedType === "number") {
                const numericString = rawText.replace(/[^\d.-]/g, '');
                const num = parseFloat(numericString);
                if (!isNaN(num)) {
                    value = num;
                    excelCell.numFmt = cell.detectedType === "currency" ? "$#,##0.00" : "#,##0.00";
                    excelCell.alignment = { horizontal: 'right' };
                }
            } else if (cell.detectedType === "percentage") {
                const numericString = rawText.replace(/[^\d.-]/g, '');
                const num = parseFloat(numericString);
                if (!isNaN(num)) {
                    value = num / 100;
                    excelCell.numFmt = "0.00%";
                    excelCell.alignment = { horizontal: 'right' };
                }
            } else if (cell.detectedType === "date") {
                const date = new Date(rawText);
                if (!isNaN(date.getTime())) {
                    value = date;
                    excelCell.numFmt = "yyyy-mm-dd";
                }
            }
        }
        
        excelCell.value = value;
        
        // Check if row has actual content before applying header styles (Section 29.3)
        const rowHasContent = cells.some(c => c.row === cell.row && c.text && c.text.trim().length > 0);
        
        // Styling for headers
        if (cell.isHeader && rowHasContent) {
            excelCell.font = { bold: true };
            excelCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2F2F2' }
            };
        }
        
        // Handle multiline text wrapping
        if (typeof value === 'string' && value.includes("\n")) {
            excelCell.alignment = { ...excelCell.alignment, wrapText: true };
        }
        
        // Handle Merged Cells
        if (cell.isMerged && cell.colSpan && cell.colSpan > 1) {
            try {
                worksheet.mergeCells(cell.row + 1, cell.column + 1, cell.row + 1, cell.column + cell.colSpan);
                // Center text in merged headers
                excelCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            } catch (e) {
                console.warn('Failed to merge cells:', e);
            }
        }
    }

    // Auto-fit column widths (basic approximation)
    worksheet.columns.forEach((col, index) => {
        let maxLength = 10;
        cells.filter(c => c.column === index).forEach(c => {
            const lines = (c.text || '').split('\n');
            lines.forEach(line => {
                if (line.length > maxLength) maxLength = line.length;
            });
        });
        // Problem 6: Better column padding for Excel export
        col.width = Math.min(maxLength + 4, 60); // cap width at 60
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
