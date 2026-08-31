import { AI_PROVIDER, AI_MODEL } from "./config";
import { AIRefineRequest, AISuggestionResponse } from "./schema";
import { validateAISuggestions } from "./validator";
import { AI_SYSTEM_PROMPT } from "./prompt";

export async function refineTableStructure(payload: AIRefineRequest, aiBinding: any): Promise<AISuggestionResponse> {
    if (!aiBinding) {
        throw new Error("Cloudflare AI native binding is not available.");
    }

    // Compress payload to only essential data (drop bounding boxes and empty cells to save tokens)
    const compressedCells = payload.cells
        .filter(c => c.text.trim().length > 0)
        .map(c => ({
            id: c.id,
            r: c.row,
            c: c.column,
            t: c.text
        }));

    const aiPayload = {
        messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            {
                role: "user",
                content: JSON.stringify({
                    tableId: payload.tableId,
                    dimensions: { rows: payload.rows, columns: payload.columns },
                    issues: payload.issues,
                    cells: compressedCells
                })
            }
        ]
    };

    let aiOutputStr = "";

    try {
        const response = await aiBinding.run(AI_MODEL, aiPayload);
        aiOutputStr = response?.response || "";
    } catch (err: any) {
        console.error("Cloudflare Workers AI Native Binding Error:", err);
        throw new Error(`Workers AI Error: ${err.message}`);
    }

    // Attempt to strip out markdown JSON block wrappers if any
    const match = aiOutputStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        aiOutputStr = match[1];
    }

    let parsedJson;
    try {
        parsedJson = JSON.parse(aiOutputStr);
    } catch (e) {
        console.error("Failed to parse AI JSON response:", aiOutputStr);
        throw new Error("AI returned invalid JSON.");
    }

    return validateAISuggestions(payload, parsedJson);
}
