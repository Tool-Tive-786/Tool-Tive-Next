import { isSafePublicHostname } from "../robots-txt/security";

export interface UrlValidationResult {
  safe: boolean;
  url: string;
  normalizedUrl?: string;
  host?: string;
  error?: string;
}

/**
 * Validates and normalizes a target URL for the Basic Scan.
 * Follows SSRF protection rules and normalizes default ports and fragments.
 */
export function validateAndNormalizeTargetUrl(urlStr: string): UrlValidationResult {
  const trimmed = urlStr.trim();
  if (!trimmed) {
    return { safe: false, url: urlStr, error: "URL cannot be empty." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, url: urlStr, error: "Invalid URL structure." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      safe: false,
      url: urlStr,
      error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
    };
  }

  if (parsed.username || parsed.password) {
    return {
      safe: false,
      url: urlStr,
      error: "URLs containing authentication credentials are not permitted.",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const hostCheck = isSafePublicHostname(hostname);
  if (!hostCheck.safe) {
    return { safe: false, url: urlStr, error: hostCheck.error };
  }

  // Normalize default ports
  if ((parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443")) {
    parsed.port = "";
  } else if (parsed.port) {
    const portNum = parseInt(parsed.port, 10);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535 || 
        [22, 25, 3306, 5432, 6379, 27017].includes(portNum)) {
      return { safe: false, url: urlStr, error: "Target specifies an unauthorized or internal port." };
    }
  }

  // Remove URL fragments
  parsed.hash = "";

  return {
    safe: true,
    url: urlStr,
    normalizedUrl: parsed.toString(),
    host: parsed.host,
  };
}

export function isSameOrigin(url1: string, url2: string): boolean {
  try {
    const u1 = new URL(url1);
    const u2 = new URL(url2);
    const port1 = u1.port || (u1.protocol === "https:" ? "443" : "80");
    const port2 = u2.port || (u2.protocol === "https:" ? "443" : "80");
    return (
      u1.protocol === u2.protocol &&
      u1.hostname.toLowerCase() === u2.hostname.toLowerCase() &&
      port1 === port2
    );
  } catch {
    return false;
  }
}

export function validateRedirectUrl(redirectUrlStr: string, currentUrlStr: string): UrlValidationResult {
  const resolved = resolveRelativeUrl(redirectUrlStr, currentUrlStr);
  if (!resolved) {
    return { safe: false, url: redirectUrlStr, error: "Failed to resolve redirect destination URL." };
  }
  return validateAndNormalizeTargetUrl(resolved);
}

export function resolveRelativeUrl(href: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(href, baseUrl);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}
