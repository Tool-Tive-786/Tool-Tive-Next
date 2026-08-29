export const KNOWN_TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "_ga",
  "igshid",
];

export interface NormalizeOptions {
  removeTrackingParams?: boolean;
}

/**
 * Normalizes a URL safely.
 * Lowercases scheme and host, removes default ports, removes fragments.
 * Optionally removes known tracking parameters.
 */
export function normalizeUrl(
  input: string,
  options: NormalizeOptions = { removeTrackingParams: true }
): string | null {
  try {
    const url = new URL(input.trim());

    // Only allow http and https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    // Lowercase host
    url.hostname = url.hostname.toLowerCase();

    // Remove fragments
    url.hash = "";

    // Remove known tracking params if requested
    if (options.removeTrackingParams) {
      const keysToDelete: string[] = [];
      url.searchParams.forEach((value, key) => {
        if (KNOWN_TRACKING_PARAMS.includes(key.toLowerCase())) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => url.searchParams.delete(key));
    }

    // Preserve trailing slash exactly as it was
    // URL.toString() naturally normalizes standard cases (like removing default ports)
    return url.toString();
  } catch (e) {
    return null; // Invalid URL
  }
}

/**
 * Checks if a string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(input: string): boolean {
  return normalizeUrl(input, { removeTrackingParams: false }) !== null;
}

/**
 * Deduplicates a list of raw URLs, categorizing into exact duplicates and normalized duplicates.
 */
export function processUrlList(rawUrls: string[], options: NormalizeOptions = { removeTrackingParams: true }) {
  const exactSeen = new Set<string>();
  const normalizedSeen = new Set<string>();
  
  const results = {
    valid: [] as { raw: string; normalized: string }[],
    exactDuplicates: 0,
    normalizedDuplicates: 0,
    invalid: 0,
  };

  for (const raw of rawUrls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (exactSeen.has(trimmed)) {
      results.exactDuplicates++;
      continue;
    }
    exactSeen.add(trimmed);

    const normalized = normalizeUrl(trimmed, options);
    if (!normalized) {
      results.invalid++;
      continue;
    }

    if (normalizedSeen.has(normalized)) {
      results.normalizedDuplicates++;
      continue;
    }
    normalizedSeen.add(normalized);

    results.valid.push({ raw: trimmed, normalized });
  }

  return results;
}
