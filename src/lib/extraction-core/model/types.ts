export type SourceKind = "pdf" | "ocr" | "image" | "html";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SourceItem {
    pageNumber: number;
    itemIndex: number;
    text: string;

    bbox: BoundingBox;

    fontSize?: number;
    fontName?: string;
    fontWeight?: number;
    transform?: number[];

    source: SourceKind;
    confidence?: number;
}

export interface VectorSegment {
    pageNumber: number;
    orientation: "horizontal" | "vertical";
    bbox: BoundingBox;
    kind: "stroke" | "thin-rect" | "rect-edge";
}

export type DetectedDataType =
    | "text"
    | "number"
    | "currency"
    | "percentage"
    | "date"
    | "email"
    | "url"
    | "phone";

export type CellIssue =
    | "low_text_confidence"
    | "low_structure_confidence"
    | "ocr_uncertain"
    | "possible_merge"
    | "possible_wrong_column"
    | "multiline_detected";

export type TableIssue =
    | "borderless_low_confidence"
    | "possible_multipage_continuation"
    | "repeated_page_element_detected"
    | "total_row_detected"
    | "unassigned_items_present";

export interface SourceItemRef {
    pageNumber: number;
    itemIndex: number;
}

export interface TableGeometry {
    bbox: BoundingBox;
    rowBoundaries: number[];
    columnBoundaries: number[];
}

export interface ExtractedCell {
    id: string;
    tableId: string;
    row: number;
    column: number;
    text: string;
    pageNumber: number;
    bbox: BoundingBox;
    // REQUIRED for any real cell extracted from the document. Must be non-empty unless the cell is entirely blank.
    sourceItemRefs: SourceItemRef[];
    textConfidence?: number;
    structureConfidence?: number;
    detectedType?: DetectedDataType;
    typeConfidence?: number;
    typedValue?: string | number | Date;
    isHeader: boolean;
    isMerged: boolean;
    rowSpan?: number;
    colSpan?: number;
    source?: SourceKind;
    edited?: boolean;
    issues?: CellIssue[];
}

export type ConfidenceLevel = "High" | "Review Recommended" | "Low";

export interface ExtractedTable {
    id: string;
    pageNumbers: number[];
    bbox: BoundingBox;
    geometry: TableGeometry;
    cells: ExtractedCell[];
    rowCount: number;
    columnCount: number;
    
    // Independent confidence dimensions (0.0 to 1.0)
    structureConfidence?: number;
    textConfidence?: number;
    
    // Driven by the weakest dimension. Capped for borderless.
    overallConfidence: ConfidenceLevel;
    
    detectionMode: "bordered" | "borderless" | "tagged" | "manual-region" | "ocr";
    direction: "ltr" | "rtl";
    isMultiPage: boolean;
    headerRow?: number;
    unassignedItems?: SourceItemRef[];
    issues?: TableIssue[];
}
