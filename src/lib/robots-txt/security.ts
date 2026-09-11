import { SecurityValidationResult } from "./types";

/**
 * Validates whether an input target URL is a safe, public web URL
 * suitable for remote robots.txt retrieval.
 * 
 * Normalizes any arbitrary path (e.g. /products/item) to <origin>/robots.txt
 * so the endpoint can only ever request robots.txt resources.
 * 
 * Prevents Server-Side Request Forgery (SSRF) against internal networks,
 * cloud metadata endpoints, loopback devices, and unsafe URI schemes.
 */
export function validateRobotsFetchUrl(urlStr: string): SecurityValidationResult {
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

  // Scheme verification: only http and https allowed
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      safe: false,
      url: urlStr,
      error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`
    };
  }

  // Reject credentials in URL
  if (parsed.username || parsed.password) {
    return {
      safe: false,
      url: urlStr,
      error: "URLs containing authentication credentials are not permitted."
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Validate hostname for SSRF risks
  const hostCheck = isSafePublicHostname(hostname);
  if (!hostCheck.safe) {
    return { safe: false, url: urlStr, error: hostCheck.error };
  }

  // Ensure port is standard or safe
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    const portNum = parseInt(parsed.port, 10);
    // Block common internal / dangerous ports
    if (
      isNaN(portNum) ||
      portNum <= 0 ||
      portNum > 65535 ||
      portNum === 22 ||
      portNum === 25 ||
      portNum === 3306 ||
      portNum === 5432 ||
      portNum === 6379 ||
      portNum === 27017
    ) {
      return { safe: false, url: urlStr, error: "Target specifies an unauthorized or internal port." };
    }
  }

  // Target is strictly normalized to <origin>/robots.txt
  const normalizedRobotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

  return {
    safe: true,
    url: urlStr,
    normalizedUrl: normalizedRobotsUrl,
    host: parsed.host
  };
}

/**
 * Validates a redirect destination during robots.txt retrieval.
 * Re-runs full SSRF, credential, and protocol checks on the new URL.
 * Also ensures the redirected path remains a robots.txt resource,
 * preventing open proxy abuse (e.g. redirecting to /login or /admin).
 */
export function validateRobotsRedirectUrl(
  redirectUrlStr: string,
  _currentUrlStr: string
): SecurityValidationResult {
  const trimmed = redirectUrlStr.trim();
  if (!trimmed) {
    return { safe: false, url: redirectUrlStr, error: "Redirect URL cannot be empty." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, url: redirectUrlStr, error: "Invalid redirect URL structure." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      safe: false,
      url: redirectUrlStr,
      error: "Redirect target uses an unsupported protocol."
    };
  }

  if (parsed.username || parsed.password) {
    return {
      safe: false,
      url: redirectUrlStr,
      error: "Redirect target containing credentials is not permitted."
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const hostCheck = isSafePublicHostname(hostname);
  if (!hostCheck.safe) {
    return { safe: false, url: redirectUrlStr, error: hostCheck.error };
  }

  // Redirect path policy: Must remain within the robots.txt resource context
  // Accept: /robots.txt, /dir/robots.txt, or path ending with robots.txt
  const pathname = parsed.pathname.toLowerCase();
  if (!pathname.endsWith("robots.txt") && !pathname.includes("robots.txt")) {
    return {
      safe: false,
      url: redirectUrlStr,
      error: "Redirect destination left the robots.txt resource context."
    };
  }

  return {
    safe: true,
    url: redirectUrlStr,
    normalizedUrl: parsed.toString(),
    host: parsed.host
  };
}

/**
 * Comprehensive SSRF hostname check protecting against loopbacks,
 * private networks, link-local, cloud metadata, and integer/hex IP encodings.
 */
function isSafePublicHostname(hostname: string): { safe: boolean; error?: string } {
  // Empty check
  if (!hostname) {
    return { safe: false, error: "Hostname is missing." };
  }

  // Obvious localhost and internal TLDs
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".home") ||
    hostname.endsWith(".corp") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".example")
  ) {
    return { safe: false, error: "Local or private domain names are not allowed." };
  }

  // Detect single integer IP representations (e.g. 2130706433 for 127.0.0.1)
  if (/^\d+$/.test(hostname)) {
    return { safe: false, error: "Integer-encoded IP addresses are not permitted." };
  }

  // Detect hexadecimal IP representations (e.g. 0x7f000001)
  if (/^0x[0-9a-f]+$/i.test(hostname)) {
    return { safe: false, error: "Hexadecimal-encoded IP addresses are not permitted." };
  }

  // Check IPv4 addresses (including octal with leading zeroes)
  if (isPrivateOrReservedIpv4(hostname)) {
    return {
      safe: false,
      error: "Private, loopback, or cloud metadata IP addresses are not permitted."
    };
  }

  // Check IPv6 addresses
  if (isPrivateOrReservedIpv6(hostname)) {
    return {
      safe: false,
      error: "Loopback or local IPv6 addresses are not permitted."
    };
  }

  return { safe: true };
}

/**
 * Checks if a hostname string is a private, loopback, link-local, or metadata IPv4 address.
 */
function isPrivateOrReservedIpv4(host: string): boolean {
  const ipv4Regex = /^(\d{1,4})\.(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/;
  const match = host.match(ipv4Regex);
  if (!match) return false;

  const octets = [
    parseOctet(match[1]),
    parseOctet(match[2]),
    parseOctet(match[3]),
    parseOctet(match[4])
  ];

  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
    return true; // Malformed IP or octal overflow
  }

  const [a, b] = octets;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private RFC 1918)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private RFC 1918: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private RFC 1918)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-local, includes AWS/GCP/Azure 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 100.100.100.200 (Alibaba Cloud metadata)
  if (host === "100.100.100.200") return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Safely parses an octet handling octal representations (leading 0s)
 */
function parseOctet(str: string): number {
  if (str.length > 1 && str.startsWith("0")) {
    return parseInt(str, 8);
  }
  return parseInt(str, 10);
}

/**
 * Checks if a hostname string is a private, loopback, or link-local IPv6 address.
 */
function isPrivateOrReservedIpv6(host: string): boolean {
  const clean = host.replace(/^\[|\]$/g, "").toLowerCase();

  // Loopback
  if (clean === "::1" || clean === "0:0:0:0:0:0:0:1") return true;
  // Unspecified
  if (clean === "::" || clean === "0:0:0:0:0:0:0:0") return true;

  // Unique local addresses (fc00::/7 -> fc00:: to fdff::)
  if (clean.startsWith("fc") || clean.startsWith("fd")) return true;

  // Link-local unicast (fe80::/10)
  if (
    clean.startsWith("fe8") ||
    clean.startsWith("fe9") ||
    clean.startsWith("fea") ||
    clean.startsWith("feb")
  ) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 etc)
  if (clean.startsWith("::ffff:")) {
    const ipv4Part = clean.substring(7);
    if (isPrivateOrReservedIpv4(ipv4Part)) return true;
  }

  return false;
}

// -----------------------------------------------------------------------------
// Edge Sliding-Window Rate Limiter
// -----------------------------------------------------------------------------

interface RateLimitEntry {
  timestamps: number[];
}

const RATE_LIMIT_STORE = new Map<string, RateLimitEntry>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 10; // 10 requests per window

/**
 * Edge-compatible in-memory rate limiter per client IP.
 * Cleans up expired timestamps to prevent memory growth.
 */
export function checkRobotsFetchRateLimit(clientId: string): {
  allowed: boolean;
  remaining: number;
  resetMs: number;
} {
  const now = Date.now();
  const entry = RATE_LIMIT_STORE.get(clientId) || { timestamps: [] };

  // Filter out timestamps older than the sliding window
  const validTimestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS) {
    const oldest = validTimestamps[0];
    const resetMs = Math.max(0, oldest + WINDOW_MS - now);
    return {
      allowed: false,
      remaining: 0,
      resetMs
    };
  }

  validTimestamps.push(now);
  RATE_LIMIT_STORE.set(clientId, { timestamps: validTimestamps });

  // Periodic cleanup if store exceeds 500 entries
  if (RATE_LIMIT_STORE.size > 500) {
    RATE_LIMIT_STORE.forEach((e, key) => {
      if (e.timestamps.every((ts) => now - ts >= WINDOW_MS)) {
        RATE_LIMIT_STORE.delete(key);
      }
    });
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - validTimestamps.length,
    resetMs: WINDOW_MS
  };
}
