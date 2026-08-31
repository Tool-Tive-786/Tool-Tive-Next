import { NextResponse } from "next/server";
import { checkAndConsumeRateLimit } from "@/lib/extraction-core/ai/quota";
import { AIRefineRequest } from "@/lib/extraction-core/ai/schema";
import { refineTableStructure } from "@/lib/extraction-core/ai/cloudflare";
import { AI_MAX_INPUT_CHARS, AI_MAX_CELLS_PER_REQUEST } from "@/lib/extraction-core/ai/config";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const aiBinding = getRequestContext().env.AI;
        if (!aiBinding) {
            console.error("Native AI binding is not available in the environment.");
            return NextResponse.json({ error: "AI service is not configured on the server." }, { status: 500 });
        }

        const { allowed, remaining, error } = await checkAndConsumeRateLimit();

        if (!allowed) {
            return NextResponse.json({ error }, { status: 429 });
        }

        const bodyRaw = await req.text();
        
        if (bodyRaw.length > AI_MAX_INPUT_CHARS) {
            return NextResponse.json({ error: "Payload too large." }, { status: 413 });
        }

        let body: AIRefineRequest;
        try {
            body = JSON.parse(bodyRaw);
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
        }

        if (!body.tableId || typeof body.columns !== 'number' || typeof body.rows !== 'number' || !Array.isArray(body.cells)) {
            return NextResponse.json({ error: "Malformed table data payload." }, { status: 400 });
        }

        if (body.cells.length > AI_MAX_CELLS_PER_REQUEST) {
            return NextResponse.json({ error: `Too many cells (max ${AI_MAX_CELLS_PER_REQUEST}).` }, { status: 400 });
        }

        const result = await refineTableStructure(body, aiBinding);

        return NextResponse.json({ result, remaining });

    } catch (error: any) {
        console.error("AI API Endpoint Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
