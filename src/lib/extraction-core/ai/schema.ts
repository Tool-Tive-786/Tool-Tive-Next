export interface AICellMoveOperation {
    type: "move-cell";
    cellId: string;
    toRow: number;
    toColumn: number;
    reason: string;
    confidence: number;
}

export interface AICellMergeOperation {
    type: "merge-cells";
    primaryCellId: string;
    mergeWithCellIds: string[];
    reason: string;
    confidence: number;
}

export interface AIHeaderSuggestion {
    row: number; // the row index that should be marked as header
    confidence: number;
}

export type AIOperation = AICellMoveOperation | AICellMergeOperation;

export interface AISuggestionResponse {
    operations: AIOperation[];
    headerSuggestion?: AIHeaderSuggestion;
    warnings: string[];
}

// Payload sent to the API
export interface AIRefineRequest {
    tableId: string;
    columns: number;
    rows: number;
    cells: Array<{
        id: string;
        row: number;
        column: number;
        text: string;
        isMerged?: boolean;
        colSpan?: number;
    }>;
    issues: string[];
}
