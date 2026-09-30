import { NextResponse } from "next/server";
import { getScanRecord, updateScanStatus } from "@/lib/ai-search/db";
import { processBasicScan } from "@/lib/ai-search/crawler";

export const runtime = "edge";

interface StepRequest {
  scanId: string;
  url?: string;
}

export async function POST(req: Request) {
  try {
    let body: StepRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON in request body." }, { status: 400 });
    }

    if (!body.scanId || typeof body.scanId !== "string" || !body.scanId.startsWith("scan_")) {
      return NextResponse.json({ error: "A valid Scan ID is required." }, { status: 400 });
    }

    const env = process.env as any;
    const scanRecord = await getScanRecord(env, body.scanId);
    const targetUrl = scanRecord?.root_url || body.url;

    if (!targetUrl) {
      return NextResponse.json({ error: "Scan record not found and target URL was not provided." }, { status: 404 });
    }

    // 1. If scan is already completed or failed, return cached report immediately
    if (scanRecord && (scanRecord.status === "completed" || scanRecord.status === "failed")) {
      let cachedReport = null;
      if (scanRecord.report_json) {
        try {
          cachedReport = JSON.parse(scanRecord.report_json);
        } catch {}
      }
      return NextResponse.json({
        status: scanRecord.status,
        pagesDiscovered: scanRecord.pages_discovered || 0,
        pagesScanned: scanRecord.pages_scanned || 0,
        report: cachedReport,
      });
    }

    // 2. Concurrency Lock: If scan is already marked 'analyzing', avoid duplicate crawling
    if (scanRecord && scanRecord.status === "analyzing") {
      return NextResponse.json({
        status: "analyzing",
        pagesDiscovered: scanRecord.pages_discovered || 0,
        pagesScanned: scanRecord.pages_scanned || 0,
      });
    }

    // Mark as analyzing
    if (scanRecord) {
      await updateScanStatus(env, body.scanId, "analyzing", scanRecord.pages_discovered || 0, scanRecord.pages_scanned || 0);
    }

    // 3. Run the deterministic basic scan
    const result = await processBasicScan(body.scanId, targetUrl);

    if (result.error) {
      await updateScanStatus(env, body.scanId, "failed", result.pagesDiscovered, result.pagesScanned);
      return NextResponse.json({ status: "failed", error: result.error });
    }

    // 4. Save completed report
    await updateScanStatus(
      env,
      body.scanId,
      "completed",
      result.pagesDiscovered,
      result.pagesScanned,
      JSON.stringify(result.report)
    );

    return NextResponse.json({
      status: "completed",
      pagesDiscovered: result.pagesDiscovered,
      pagesScanned: result.pagesScanned,
      report: result.report,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
