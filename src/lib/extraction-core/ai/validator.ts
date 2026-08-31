import { AIRefineRequest, AISuggestionResponse, AIOperation } from "./schema";

export function validateAISuggestions(payload: AIRefineRequest, aiResponse: any): AISuggestionResponse {
    if (!aiResponse || typeof aiResponse !== 'object') {
        throw new Error("AI returned malformed or non-object response.");
    }

    const validOperations: AIOperation[] = [];
    const warnings: string[] = Array.isArray(aiResponse.warnings) ? aiResponse.warnings.map(String) : [];

    // Helper to verify a cell ID actually exists in the payload
    const cellExists = (id: string) => payload.cells.some(c => c.id === id);

    if (Array.isArray(aiResponse.operations)) {
        for (const op of aiResponse.operations) {
            if (op.type === "move-cell") {
                if (
                    typeof op.cellId === 'string' && cellExists(op.cellId) &&
                    typeof op.toRow === 'number' && op.toRow >= 0 && op.toRow < payload.rows &&
                    typeof op.toColumn === 'number' && op.toColumn >= 0 && op.toColumn < payload.columns
                ) {
                    validOperations.push({
                        type: "move-cell",
                        cellId: op.cellId,
                        toRow: op.toRow,
                        toColumn: op.toColumn,
                        reason: typeof op.reason === 'string' ? op.reason : "AI suggestion",
                        confidence: typeof op.confidence === 'number' ? op.confidence : 1
                    });
                } else {
                    console.warn("AI hallucinated or returned invalid move-cell operation", op);
                }
            } else if (op.type === "merge-cells") {
                if (
                    typeof op.primaryCellId === 'string' && cellExists(op.primaryCellId) &&
                    Array.isArray(op.mergeWithCellIds) && op.mergeWithCellIds.every((id: any) => typeof id === 'string' && cellExists(id))
                ) {
                    validOperations.push({
                        type: "merge-cells",
                        primaryCellId: op.primaryCellId,
                        mergeWithCellIds: op.mergeWithCellIds,
                        reason: typeof op.reason === 'string' ? op.reason : "AI suggestion",
                        confidence: typeof op.confidence === 'number' ? op.confidence : 1
                    });
                } else {
                    console.warn("AI hallucinated or returned invalid merge-cells operation", op);
                }
            }
        }
    }

    let headerSuggestion;
    if (aiResponse.headerSuggestion && typeof aiResponse.headerSuggestion === 'object') {
        const row = aiResponse.headerSuggestion.row;
        if (typeof row === 'number' && row >= 0 && row < payload.rows) {
            headerSuggestion = {
                row,
                confidence: typeof aiResponse.headerSuggestion.confidence === 'number' ? aiResponse.headerSuggestion.confidence : 1
            };
        }
    }

    return {
        operations: validOperations,
        headerSuggestion,
        warnings
    };
}
