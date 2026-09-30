import { ExtractedPageSignals } from "./types";
import { discoverSite } from "./discovery";
import { extractSignalsFromHtml } from "./extractor";
import { analyzeScanResults, AnalyzerResult } from "./analyzer";
import { 
  BASIC_MAX_PAGES, 
  BASIC_MAX_DEPTH, 
  BASIC_MAX_REDIRECT_HOPS, 
  BASIC_MAX_RESPONSE_BYTES, 
  BASIC_REQUEST_TIMEOUT_MS 
} from "./constants";
import { 
  validateAndNormalizeTargetUrl, 
  validateRedirectUrl, 
  resolveRelativeUrl, 
  isSameOrigin 
} from "./url-validation";

export interface ScanRunResult {
  scanId: string;
  pagesScanned: number;
  pagesDiscovered: number;
  report: AnalyzerResult | null;
  error?: string;
}

interface SafeFetchResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  redirects: string[];
  html: string;
  response: Response;
  error?: string;
}

/**
 * Safely reads a response body stream with a hard byte cutoff limit.
 * Prevents memory exhaustion / buffer overflow from oversized bodies.
 */
async function readStreamWithLimit(res: Response, limitBytes: number): Promise<string | null> {
  if (!res.body) {
    try {
      const text = await res.text();
      return text.length <= limitBytes ? text : null;
    } catch {
      return null;
    }
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > limitBytes) {
          try { await reader.cancel(); } catch {}
          return null; // Exceeded max response bytes
        }
        chunks.push(value);
      }
    }
  } catch {
    return null;
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

/**
 * Executes a safe HTTP GET with manual redirect following, SSRF revalidation
 * on every redirect hop, hop limits (max 3), and response size enforcement (1 MiB).
 */
export async function safeFetchHtml(
  targetUrl: string
): Promise<SafeFetchResult | null> {
  let currentUrl = targetUrl;
  const redirects: string[] = [];
  const visitedRedirects = new Set<string>([targetUrl]);

  for (let hop = 0; hop <= BASIC_MAX_REDIRECT_HOPS; hop++) {
    const val = validateAndNormalizeTargetUrl(currentUrl);
    if (!val.safe || !val.normalizedUrl) {
      return null; // SSRF or invalid URL blocked
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BASIC_REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(currentUrl, {
        headers: {
          "User-Agent": "ToolTiveCrawler/1.0 (+https://tooltive.com)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
        redirect: "manual",
      });
      clearTimeout(timeoutId);

      // Handle HTTP redirects: 301, 302, 303, 307, 308
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) {
          return null; // Redirect missing Location header
        }

        if (hop >= BASIC_MAX_REDIRECT_HOPS) {
          // Exceeded BASIC_MAX_REDIRECT_HOPS
          return null;
        }

        const nextUrl = resolveRelativeUrl(location, currentUrl);
        if (!nextUrl) return null;

        // Redirect loop check
        if (visitedRedirects.has(nextUrl)) {
          return null; // Loop blocked
        }
        visitedRedirects.add(nextUrl);

        // Revalidate redirect destination against SSRF
        const redirectCheck = validateRedirectUrl(nextUrl, currentUrl);
        if (!redirectCheck.safe || !redirectCheck.normalizedUrl) {
          return null; // SSRF redirect blocked
        }

        redirects.push(nextUrl);
        currentUrl = redirectCheck.normalizedUrl;
        continue;
      }

      // Final response reached
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("text/html")) {
        return null; // Non-HTML resource
      }

      const contentLengthStr = res.headers.get("content-length");
      if (contentLengthStr) {
        const cl = parseInt(contentLengthStr, 10);
        if (!isNaN(cl) && cl > BASIC_MAX_RESPONSE_BYTES) {
          return null; // Oversized content-length header
        }
      }

      const html = await readStreamWithLimit(res, BASIC_MAX_RESPONSE_BYTES);
      if (html === null) {
        return null; // Body exceeded BASIC_MAX_RESPONSE_BYTES
      }

      return {
        ok: true,
        status: res.status,
        finalUrl: currentUrl,
        redirects,
        html,
        response: res,
      };
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }

  return null;
}

interface QueueItem {
  url: string;
  depth: number;
}

export async function processBasicScan(scanId: string, rootUrl: string): Promise<ScanRunResult> {
  try {
    const valRoot = validateAndNormalizeTargetUrl(rootUrl);
    if (!valRoot.safe || !valRoot.normalizedUrl || !valRoot.host) {
      return { scanId, pagesScanned: 0, pagesDiscovered: 0, report: null, error: valRoot.error || "Invalid target URL" };
    }
    const rootNorm = valRoot.normalizedUrl;
    const originHost = valRoot.host;

    // 1. Discovery (robots.txt, sitemaps, llms.txt)
    const discovery = await discoverSite(rootNorm);

    // Queue initialized with root page at depth 0
    const queue: QueueItem[] = [{ url: rootNorm, depth: 0 }];
    const queuedSet = new Set<string>([rootNorm]);

    // Seed sitemap URLs of the same origin at depth 1
    for (const smUrl of discovery.discoveredUrls) {
      if (isSameOrigin(smUrl, rootNorm) && !queuedSet.has(smUrl) && queue.length < BASIC_MAX_PAGES * 3) {
        queue.push({ url: smUrl, depth: 1 });
        queuedSet.add(smUrl);
      }
    }

    const visited = new Set<string>();
    const extractedPages: ExtractedPageSignals[] = [];
    let fetchAttempts = 0;
    const MAX_FETCH_ATTEMPTS = BASIC_MAX_PAGES * 3; // Bound total requests to prevent infinite loops

    // 2. Bounded Fetch Loop: strictly enforces BASIC_MAX_PAGES (10) and BASIC_MAX_DEPTH (2)
    while (queue.length > 0 && extractedPages.length < BASIC_MAX_PAGES && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      const item = queue.shift()!;
      if (visited.has(item.url)) continue;
      visited.add(item.url);

      // Verify same origin
      if (!isSameOrigin(item.url, rootNorm)) continue;

      // Verify depth boundary
      if (item.depth > BASIC_MAX_DEPTH) continue;

      fetchAttempts++;
      const fetchResult = await safeFetchHtml(item.url);
      if (!fetchResult) {
        continue; // Gracefully skip unreachable or non-HTML pages
      }

      const signals = await extractSignalsFromHtml(
        fetchResult.finalUrl,
        fetchResult.html,
        fetchResult.response,
        originHost
      );
      signals.redirects = fetchResult.redirects;
      extractedPages.push(signals);

      // Enforce BASIC_MAX_DEPTH: Only discover new internal links if child depth <= BASIC_MAX_DEPTH (2)
      if (item.depth + 1 <= BASIC_MAX_DEPTH && extractedPages.length < BASIC_MAX_PAGES) {
        for (const link of signals.internalLinks) {
          if (!visited.has(link) && !queuedSet.has(link) && isSameOrigin(link, rootNorm)) {
            queue.push({ url: link, depth: item.depth + 1 });
            queuedSet.add(link);
          }
        }
      }
    }

    // 3. Deterministic Analysis
    const report = analyzeScanResults(extractedPages, discovery);

    return {
      scanId,
      pagesScanned: extractedPages.length,
      pagesDiscovered: queuedSet.size,
      report
    };

  } catch (error: any) {
    return { scanId, pagesScanned: 0, pagesDiscovered: 0, report: null, error: error?.message || "Scan processing failed" };
  }
}
