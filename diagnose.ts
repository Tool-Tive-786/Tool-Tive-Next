import { detectTables } from './src/lib/extraction-core/detection/candidates';
import { SourceItem, VectorSegment } from './src/lib/extraction-core/model/types';

// Mock items
const items: SourceItem[] = [
    { pageNumber: 1, itemIndex: 0, text: 'Q1 2026 SALES SUMMARY', bbox: { x: 50, y: 50, width: 400, height: 15 }, fontSize: 14, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 1, text: 'Invoice ID', bbox: { x: 50, y: 100, width: 80, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 2, text: 'Customer / Description', bbox: { x: 150, y: 100, width: 150, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 3, text: 'Qty', bbox: { x: 320, y: 100, width: 30, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 4, text: 'Unit Price', bbox: { x: 370, y: 100, width: 60, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 5, text: 'Total', bbox: { x: 450, y: 100, width: 50, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    
    // Row 1
    { pageNumber: 1, itemIndex: 6, text: 'INV-1001', bbox: { x: 50, y: 130, width: 80, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 7, text: 'Acme Office Supplies', bbox: { x: 150, y: 130, width: 150, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 8, text: '12', bbox: { x: 320, y: 130, width: 20, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 9, text: '$14.50', bbox: { x: 370, y: 130, width: 50, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 10, text: '$174.00', bbox: { x: 450, y: 130, width: 50, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },

    // Blank cells row (Row 2) - Missing Customer, Qty, Unit Price
    { pageNumber: 1, itemIndex: 11, text: 'INV-1002', bbox: { x: 50, y: 160, width: 80, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 12, text: '$500.00', bbox: { x: 450, y: 160, width: 50, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },

    // Subtotal
    { pageNumber: 1, itemIndex: 13, text: 'Subtotal', bbox: { x: 150, y: 190, width: 60, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
    { pageNumber: 1, itemIndex: 14, text: '$674.00', bbox: { x: 450, y: 190, width: 50, height: 12 }, fontSize: 12, fontName: 'Helvetica', transform: [], source: 'pdf' },
];

const segments: VectorSegment[] = [
    // Outer border
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 40, width: 470, height: 1 }, orientation: 'horizontal' },
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 210, width: 470, height: 1 }, orientation: 'horizontal' },
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 40, width: 1, height: 170 }, orientation: 'vertical' },
    { pageNumber: 1, kind: 'stroke', bbox: { x: 510, y: 40, width: 1, height: 170 }, orientation: 'vertical' },

    // Inner horizontal lines
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 80, width: 470, height: 1 }, orientation: 'horizontal' }, // Under title
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 120, width: 470, height: 1 }, orientation: 'horizontal' }, // Under header
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 150, width: 470, height: 1 }, orientation: 'horizontal' }, // Under row 1
    { pageNumber: 1, kind: 'stroke', bbox: { x: 40, y: 180, width: 470, height: 1 }, orientation: 'horizontal' }, // Under row 2

    // Inner vertical lines
    { pageNumber: 1, kind: 'stroke', bbox: { x: 140, y: 80, width: 1, height: 130 }, orientation: 'vertical' }, // After ID
    { pageNumber: 1, kind: 'stroke', bbox: { x: 310, y: 80, width: 1, height: 130 }, orientation: 'vertical' }, // After Customer
    { pageNumber: 1, kind: 'stroke', bbox: { x: 360, y: 80, width: 1, height: 130 }, orientation: 'vertical' }, // After Qty
    { pageNumber: 1, kind: 'stroke', bbox: { x: 440, y: 80, width: 1, height: 130 }, orientation: 'vertical' }, // After Price
];

console.log('--- RUNNING DIAGNOSTIC ---');
console.log(`textItemCount: ${items.length}`);
console.log(`horizontalSegmentCount: ${segments.filter(s => s.orientation === 'horizontal').length}`);
console.log(`verticalSegmentCount: ${segments.filter(s => s.orientation === 'vertical').length}`);

// We will instrument the internals during the actual call
const tables = detectTables(1, items, []);

console.log(`finalTableCount: ${tables.length}`);

if (tables.length > 0) {
    const t = tables[0];
    console.log(`\nTable detected: ${t.rowCount} rows, ${t.columnCount} columns, mode: ${t.detectionMode}`);
    console.log('Cells:');
    t.cells.forEach(c => {
        console.log(`  Row ${c.row} Col ${c.column}: ${c.text}`);
    });
    console.log('\nUnassigned Items:');
    t.unassignedItems?.forEach(i => console.log(`  Index: ${i.itemIndex}`));
}
