import { ExtractedTable } from "../model/types";

export function serializeToCsv(table: ExtractedTable): string {
    const { cells, rowCount, columnCount } = table;
    const grid: string[][] = Array.from({ length: rowCount }, () => Array(columnCount).fill(""));

    for (const cell of cells) {
        if (cell.row >= 0 && cell.row < rowCount && cell.column >= 0 && cell.column < columnCount) {
            grid[cell.row][cell.column] = cell.text;
        }
    }

    // Protection against formula injection and proper CSV escaping
    const escapeCsvValue = (value: string): string => {
        let escaped = value;
        
        // Formula injection protection
        if (/^[=+\-@]/.test(escaped)) {
            escaped = "'" + escaped;
        }

        // Quotes and newlines require enclosing the value in quotes
        if (escaped.includes('"') || escaped.includes(',') || escaped.includes('\n')) {
            escaped = `"${escaped.replace(/"/g, '""')}"`;
        }
        
        return escaped;
    };

    return grid.map(row => row.map(escapeCsvValue).join(",")).join("\n");
}
