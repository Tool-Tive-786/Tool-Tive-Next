import { NextResponse } from "next/server";
import { crawlSingleUrl } from "@/lib/sitemap/crawler";
import { isSafeOrigin } from "@/lib/sitemap/robots";

export const runtime = "edge"; // Run on Cloudflare Edge

interface CrawlBatchRequest {
  urls: string[];
  origin: string;
}

export async function POST(req: Request) {
  try {
    const body: CrawlBatchRequest = await req.json();

    if (!body.urls || !Array.isArray(body.urls) || !body.origin) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    if (body.urls.length > 20) {
      return NextResponse.json({ error: "Batch size too large" }, { status: 400 });
    }

    const originObj = new URL(body.origin);
    const originHost = originObj.hostname;

    if (!isSafeOrigin(body.origin)) {
      return NextResponse.json({ error: "Unsafe origin" }, { status: 403 });
    }

    // Crawl concurrently
    const promises = body.urls.map(url => crawlSingleUrl(url, originHost));
    const results = await Promise.allSettled(promises);

    const successfulResults = results
      .map(r => r.status === "fulfilled" ? r.value : null)
      .filter(Boolean);

    return NextResponse.json({ results: successfulResults });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
