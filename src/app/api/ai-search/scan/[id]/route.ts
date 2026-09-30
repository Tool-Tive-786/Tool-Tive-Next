import { NextResponse } from "next/server";
import { getScanRecord } from "@/lib/ai-search/db";
import { BASIC_MAX_PAGES } from "@/lib/ai-search/constants";

export const runtime = "edge";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const env = process.env as any;
    const { id: scanId } = await params;
    
    if (!scanId) {
      return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });
    }

    const scanRecord = await getScanRecord(env, scanId);

    if (!scanRecord) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    let report = null;
    if (scanRecord.status === 'completed' && scanRecord.report_json) {
      try {
        report = JSON.parse(scanRecord.report_json);
      } catch {}
    }

    return NextResponse.json({
      scanId: scanRecord.id,
      rootUrl: scanRecord.root_url,
      status: scanRecord.status,
      pagesDiscovered: scanRecord.pages_discovered || 0,
      pagesScanned: scanRecord.pages_scanned || 0,
      maxPages: BASIC_MAX_PAGES,
      report,
      error: scanRecord.status === "failed" ? "Scan failed to complete" : undefined,
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
