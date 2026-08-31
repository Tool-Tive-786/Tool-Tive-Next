import { detectTables } from '../src/lib/extraction-core/detection/candidates';
import { SourceItem, VectorSegment } from '../src/lib/extraction-core/model/types';
import { pdfToNormalizedCoordinates } from '../src/lib/extraction-core/geometry/coordinates';

console.log('--- RUNNING ENGINE V2 TESTS ---\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passCount++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failCount++;
    }
}

// 1. Coordinate Normalization
const rawBbox = { x: 10, y: 100, width: 50, height: 20 };
const system = { width: 600, height: 800 };
const normalized = pdfToNormalizedCoordinates(rawBbox, system);
assert(normalized.y === 800 - 100 - 20, 'Coordinate normalization flips Y correctly');

// 2. RTL Detection
const rtlItems: SourceItem[] = [
    { pageNumber: 1, itemIndex: 0, text: 'مرحبا', bbox: { x: 50, y: 50, width: 40, height: 10 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 1, text: '123', bbox: { x: 150, y: 50, width: 20, height: 10 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 2, text: 'العالم', bbox: { x: 50, y: 70, width: 40, height: 10 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 3, text: '456', bbox: { x: 150, y: 70, width: 20, height: 10 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 4, text: 'مرحبا', bbox: { x: 50, y: 90, width: 40, height: 10 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 5, text: '789', bbox: { x: 150, y: 90, width: 20, height: 10 }, source: 'pdf' }
];
const rtlTables = detectTables(1, rtlItems, []);
assert(rtlTables.length > 0 && rtlTables[0].direction === 'rtl', 'RTL text correctly infers RTL table direction');

// 3. Merged Header / Boundary Stability (Borderless)
const items: SourceItem[] = [
    { pageNumber: 1, itemIndex: 0, text: 'A VERY WIDE MERGED HEADER TITLE SPANNING ALL COLUMNS', bbox: { x: 50, y: 50, width: 400, height: 15 }, source: 'pdf' },
    // Row 1
    { pageNumber: 1, itemIndex: 1, text: 'ID', bbox: { x: 50, y: 100, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 2, text: 'Name', bbox: { x: 150, y: 100, width: 40, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 3, text: 'Qty', bbox: { x: 300, y: 100, width: 20, height: 12 }, source: 'pdf' },
    // Row 2
    { pageNumber: 1, itemIndex: 4, text: '001', bbox: { x: 50, y: 120, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 5, text: 'Bob', bbox: { x: 150, y: 120, width: 30, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 6, text: '5', bbox: { x: 300, y: 120, width: 10, height: 12 }, source: 'pdf' },
    // Row 3
    { pageNumber: 1, itemIndex: 7, text: '002', bbox: { x: 50, y: 140, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 8, text: 'Alice', bbox: { x: 150, y: 140, width: 35, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 9, text: '10', bbox: { x: 300, y: 140, width: 15, height: 12 }, source: 'pdf' }
];

const borderless = detectTables(1, items, []);
assert(borderless.length === 1, 'Borderless table detected');
if (borderless.length === 1) {
    const t = borderless[0];
    assert(t.columnCount === 3, `Columns inferred correctly despite merged header (found ${t.columnCount})`);
    assert(t.overallConfidence === 'Review Recommended', 'Borderless confidence capped at Review Recommended');
    
    // Check cell assignment logic handles the header
    console.log('Available cells:', t.cells.map(c => ({text: c.text, row: c.row, col: c.column})));
    const headerCell = t.cells.find(c => c.text.includes('MERGED HEADER'));
    assert(!!headerCell, 'Wide header was assigned to a cell');
}

// 4. Phantom Column Elimination
const phantomItems: SourceItem[] = [
    { pageNumber: 1, itemIndex: 0, text: 'ID', bbox: { x: 50, y: 100, width: 20, height: 12 }, source: 'pdf' },
    // Notice huge gap between ID and Name
    { pageNumber: 1, itemIndex: 1, text: 'Name', bbox: { x: 250, y: 100, width: 40, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 2, text: '001', bbox: { x: 50, y: 120, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 3, text: 'Bob', bbox: { x: 250, y: 120, width: 30, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 4, text: '002', bbox: { x: 50, y: 140, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 5, text: 'Alice', bbox: { x: 250, y: 140, width: 35, height: 12 }, source: 'pdf' },
    // A stray item that creates a column gap
    { pageNumber: 1, itemIndex: 6, text: 'stray', bbox: { x: 150, y: 160, width: 30, height: 12 }, source: 'pdf' }
];

const phantomTables = detectTables(1, phantomItems, []);
if (phantomTables.length > 0) {
    const t = phantomTables[0];
    // With phantom column elimination, the stray item might be unassigned or dropped if it doesn't form a row.
    // At the very least, it shouldn't force an empty column across all data rows.
    const emptyCols = new Array(t.columnCount).fill(true);
    for (const c of t.cells) {
        if (c.text.trim().length > 0) emptyCols[c.column] = false;
    }
    assert(!emptyCols.includes(true), 'No phantom (all-empty) columns in output');
}

// 5. Region Isolation
const regionItems: SourceItem[] = [
    { pageNumber: 1, itemIndex: 0, text: 'PAGE FOOTER DO NOT INCLUDE', bbox: { x: 50, y: 700, width: 200, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 1, text: 'ID', bbox: { x: 50, y: 100, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 2, text: 'Name', bbox: { x: 150, y: 100, width: 40, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 3, text: '001', bbox: { x: 50, y: 120, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 4, text: 'Bob', bbox: { x: 150, y: 120, width: 30, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 5, text: '002', bbox: { x: 50, y: 140, width: 20, height: 12 }, source: 'pdf' },
    { pageNumber: 1, itemIndex: 6, text: 'Alice', bbox: { x: 150, y: 140, width: 35, height: 12 }, source: 'pdf' }
];
const regionTables = detectTables(1, regionItems, []);
if (regionTables.length > 0) {
    const footerCell = regionTables[0].cells.find(c => c.text.includes('PAGE FOOTER'));
    assert(!footerCell, 'Out-of-region text was successfully isolated and excluded');
}

// 6. Data Types Inference
import { inferColumnTypes } from '../src/lib/extraction-core/export/types-inference';
const typeCells = [
    { id: '1', tableId: '1', row: 1, column: 0, text: '$1,234.56', pageNumber: 1, bbox: rawBbox, sourceItemRefs: [], isHeader: false, isMerged: false },
    { id: '2', tableId: '1', row: 2, column: 0, text: '$789.00', pageNumber: 1, bbox: rawBbox, sourceItemRefs: [], isHeader: false, isMerged: false },
    { id: '3', tableId: '1', row: 1, column: 1, text: '42.5%', pageNumber: 1, bbox: rawBbox, sourceItemRefs: [], isHeader: false, isMerged: false },
    { id: '4', tableId: '1', row: 2, column: 1, text: '10%', pageNumber: 1, bbox: rawBbox, sourceItemRefs: [], isHeader: false, isMerged: false },
];
const { types } = inferColumnTypes(typeCells, 2);
assert(types[0] === 'currency', 'Currency type inferred correctly');
assert(types[1] === 'percentage', 'Percentage type inferred correctly');

// 7. Canonical Validation
import { validateCanonicalTable } from '../src/lib/extraction-core/validation';

const validTable = {
    id: 'test-1',
    pageNumbers: [1],
    bbox: { x: 0, y: 0, width: 100, height: 100 },
    geometry: { bbox: { x: 0, y: 0, width: 100, height: 100 }, rowBoundaries: [0, 50, 100], columnBoundaries: [0, 50, 100] },
    rowCount: 2,
    columnCount: 2,
    detectionMode: 'borderless' as const,
    direction: 'ltr' as const,
    isMultiPage: false,
    overallConfidence: 'Review Recommended' as const,
    cells: [
        { id: 'c1', tableId: 'test-1', row: 0, column: 0, text: 'A', pageNumber: 1, bbox: { x: 0, y: 0, width: 50, height: 50 }, sourceItemRefs: [{ pageNumber: 1, itemIndex: 1 }], isHeader: false, isMerged: false },
        { id: 'c2', tableId: 'test-1', row: 0, column: 1, text: 'B', pageNumber: 1, bbox: { x: 50, y: 0, width: 50, height: 50 }, sourceItemRefs: [{ pageNumber: 1, itemIndex: 2 }], isHeader: false, isMerged: false },
        { id: 'c3', tableId: 'test-1', row: 1, column: 0, text: 'C', pageNumber: 1, bbox: { x: 0, y: 50, width: 50, height: 50 }, sourceItemRefs: [{ pageNumber: 1, itemIndex: 3 }], isHeader: false, isMerged: false },
        { id: 'c4', tableId: 'test-1', row: 1, column: 1, text: 'D', pageNumber: 1, bbox: { x: 50, y: 50, width: 50, height: 50 }, sourceItemRefs: [{ pageNumber: 1, itemIndex: 4 }], isHeader: false, isMerged: false },
    ]
};

try {
    validateCanonicalTable(validTable);
    assert(true, 'Valid table passes canonical validation');
} catch (e) {
    assert(false, `Valid table failed validation: ${e}`);
}

// 7b. Canonical Validation - Fabrication Check
const fabricatedTable = JSON.parse(JSON.stringify(validTable));
fabricatedTable.cells[0].sourceItemRefs = []; // Remove source trace
fabricatedTable.cells[0].edited = false;

try {
    validateCanonicalTable(fabricatedTable);
    assert(false, 'Fabricated table passed validation (should have failed)');
} catch (e: any) {
    assert(e.message.includes('Fabrication Check Failed'), 'Fabricated cell correctly rejected by validation');
}

console.log(`\nTests finished: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
