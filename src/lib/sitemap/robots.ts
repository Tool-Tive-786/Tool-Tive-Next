import robotsParser from "robots-parser";
import { normalizeUrl } from "./url";

/**
 * Validates if the given URL is safe and public to prevent SSRF.
 * In a real implementation this should include IP resolution checks.
 */
export function isSafeOrigin(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();
    
    // Basic string-based blocking for obvious private networks
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("10.") || host.endsWith(".internal")) {
      return false;
    }
    
    // Cloud metadata endpoints
    if (host === "169.254.169.254" || host === "100.100.100.200") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches the raw robots.txt file for a given origin securely.
 */
export async function fetchRobotsTxtRaw(originUrl: string, userAgent = "ToolTiveCrawler/1.0 (https://tooltive.com)"): Promise<string | null> {
  const normalizedOrigin = normalizeUrl(originUrl, { removeTrackingParams: false });
  if (!normalizedOrigin) throw new Error("Invalid origin URL");
  
  const originObj = new URL(normalizedOrigin);
  const robotsUrl = `${originObj.protocol}//${originObj.host}/robots.txt`;

  if (!isSafeOrigin(robotsUrl)) {
    throw new Error("Invalid or unsafe origin");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(robotsUrl, { 
      headers: { "User-Agent": userAgent },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.text();
    }
    return null;
  } catch (err) {
    return null;
  }
}
