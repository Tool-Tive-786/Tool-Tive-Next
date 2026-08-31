import { ExtractedCell, DetectedDataType } from "../model/types";

// Patterns for common numerical and date formats (Algorithm 6)
const PATTERNS = {
    integer: /^\d+$/,
    // Problem 3: Only match currency if a currency symbol is actually present
    currency: /^\(?[$€£¥]\s?-?\d{1,3}(,\d{3})*(\.\d+)?\)?$/,
    number: /^-?[\d,]+(\.\d+)?$/, // fallback for general decimals
    percentage: /^\d+(\.\d+)?%$/,
    date: /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}$|^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]{7,20}$/
};

export function inferColumnTypes(
    cells: ExtractedCell[],
    columnCount: number
): { types: (DetectedDataType | undefined)[]; confidences: number[] } {
    const types: (DetectedDataType | undefined)[] = new Array(columnCount).fill(undefined);
    const confidences: number[] = new Array(columnCount).fill(0);

    for (let c = 0; c < columnCount; c++) {
        // Collect all non-empty data cells for this column (skip headers and merged spans if possible)
        const colCells = cells.filter(cell => cell.column === c && cell.text.trim().length > 0 && !cell.isHeader && !cell.isMerged);
        
        if (colCells.length === 0) continue;

        const typeCounts = {
            currency: 0,
            number: 0,
            percentage: 0,
            date: 0,
            text: 0
        };

        for (const cell of colCells) {
            const text = cell.text.trim();
            if (PATTERNS.currency.test(text)) typeCounts.currency++;
            else if (PATTERNS.percentage.test(text)) typeCounts.percentage++;
            else if (PATTERNS.date.test(text)) typeCounts.date++;
            else if (PATTERNS.number.test(text)) typeCounts.number++;
            else typeCounts.text++;
        }

        const total = colCells.length;
        
        // Find dominant type
        let dominantType: DetectedDataType = "text";
        let maxCount = typeCounts.text;

        for (const [type, count] of Object.entries(typeCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantType = type as DetectedDataType;
            }
        }

        // Only assign the type if a strong majority of data cells in the column match the pattern.
        // We use an 80% threshold to account for potential OCR errors or anomalies (e.g. 'N/A')
        const confidence = maxCount / total;
        if (confidence >= 0.8 && dominantType !== "text") {
            types[c] = dominantType;
            confidences[c] = confidence;
            
            // Back-propagate the detected type to individual cells in this column
            for (const cell of cells) {
                if (cell.column === c && !cell.isHeader) {
                    cell.detectedType = dominantType;
                    cell.typeConfidence = confidence;
                    
                    // Populate typedValue (Algorithm 6)
                    const text = cell.text.trim();
                    if (dominantType === "currency" || dominantType === "number" || dominantType === "percentage") {
                        const numericString = text.replace(/[^\d.-]/g, '');
                        const num = parseFloat(numericString);
                        if (!isNaN(num)) {
                            // Handle negative currency in parens like ($120.00)
                            const isNegative = text.includes('(') && text.includes(')');
                            let finalNum = isNegative ? -Math.abs(num) : num;
                            
                            if (dominantType === "percentage") {
                                finalNum = finalNum / 100;
                            }
                            cell.typedValue = finalNum;
                        }
                    } else if (dominantType === "date") {
                        const date = new Date(text);
                        if (!isNaN(date.getTime())) {
                            cell.typedValue = date;
                        }
                    } else {
                        cell.typedValue = text;
                    }
                }
            }
        }
    }

    return { types, confidences };
}
