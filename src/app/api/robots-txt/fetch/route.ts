import { NextResponse } from "next/server";
import {
  validateRobotsFetchUrl,
  validateRobotsRedirectUrl,
  checkRobotsFetchRateLimit
} from "@/lib/robots-txt/security";

export const runtime = "edge";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MiB limit
const MAX_REQUEST_SIZE = 2048; // 2 KB input limit
const MAX_REDIRECT_HOPS = 3;

interface RobotsFetchRequestBody {
  url?: string;
}

export async function POST(req: Request) {
  // 1. Request Body Size Guard
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "REQUEST_TOO_LARGE",
          message: "Request body exceeds maximum permitted size of 2 KB."
        }
      },
      {
        status: 413,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  }

  // 2. Safe JSON Parsing
  let body: RobotsFetchRequestBody;
  try {
    const rawText = await req.text();
    if (rawText.length > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "REQUEST_TOO_LARGE",
            message: "Request body exceeds maximum permitted size of 2 KB."
          }
        },
        {
          status: 413,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }
    body = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON."
        }
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  }

  // 3. Input Validation
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "MISSING_URL",
          message: "A target URL string is required."
        }
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  }

  if (body.url.length > 1024) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "URL_TOO_LONG",
          message: "Target URL exceeds maximum length of 1024 characters."
        }
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  }

  // 4. Rate Limiting (Edge-compatible sliding window)
  const clientIp =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";

  const rateCheck = checkRobotsFetchRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many live fetch requests. Please wait a few minutes before trying again."
        }
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );
  }

  // 5. Initial SSRF & Security Validation
  const validationResult = validateRobotsFetchUrl(body.url);
  if (!validationResult.safe || !validationResult.normalizedUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SECURITY_POLICY_BLOCKED",
          message: validationResult.error || "The requested URL is not allowed by the security policy."
        }
      },
      {
        status: 403,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  }

  // 6. Controlled Network Fetch Loop with Manual Redirect Policy
  let currentUrl = validationResult.normalizedUrl;
  const sourceUrl = validationResult.normalizedUrl;
  const redirects: Array<{ status: number; from: string; to: string }> = [];
  const visitedUrls = new Set<string>();

  let hops = 0;

  while (hops <= MAX_REDIRECT_HOPS) {
    // Check for redirect loop
    if (visitedUrls.has(currentUrl)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "REDIRECT_LOOP",
            message: "Redirect loop detected while retrieving robots.txt."
          }
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }
    visitedUrls.add(currentUrl);

    // Setup Timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": "ToolTive Robots.txt Tester/1.0 (+https://tooltive.com)",
          Accept: "text/plain, */*"
        },
        redirect: "manual",
        signal: controller.signal
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "TIMEOUT",
              message: "Target server took longer than 8 seconds to respond."
            }
          },
          {
            status: 504,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
          }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UPSTREAM_UNREACHABLE",
            message: "Could not establish a connection to the target server."
          }
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    clearTimeout(timeoutId);

    // Handle Redirects (301, 302, 303, 307, 308)
    if (
      res.status === 301 ||
      res.status === 302 ||
      res.status === 303 ||
      res.status === 307 ||
      res.status === 308
    ) {
      hops++;
      if (hops > MAX_REDIRECT_HOPS) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "TOO_MANY_REDIRECTS",
              message: "Exceeded maximum redirect limit (3 hops) while retrieving robots.txt."
            }
          },
          {
            status: 502,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
          }
        );
      }

      const location = res.headers.get("location");
      if (!location) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_REDIRECT",
              message: "Redirect response missing Location header."
            }
          },
          {
            status: 502,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
          }
        );
      }

      // Resolve relative redirect against currentUrl
      let nextUrl: string;
      try {
        nextUrl = new URL(location, currentUrl).toString();
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_REDIRECT_URL",
              message: "Malformed redirect destination URL."
            }
          },
          {
            status: 502,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
          }
        );
      }

      // Full SSRF & path validation on the redirect target
      const redirectSecurity = validateRobotsRedirectUrl(nextUrl, currentUrl);
      if (!redirectSecurity.safe) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "UNSAFE_REDIRECT",
              message:
                redirectSecurity.error ||
                "Redirect destination was blocked by the security policy."
            }
          },
          {
            status: 403,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
          }
        );
      }

      redirects.push({
        status: res.status,
        from: currentUrl,
        to: nextUrl
      });

      currentUrl = nextUrl;
      continue; // Follow redirect
    }

    // Handle 404 Not Found (Common and valid scenario for robots.txt)
    if (res.status === 404) {
      return NextResponse.json(
        {
          ok: true,
          status: "not_found",
          sourceUrl,
          finalUrl: currentUrl,
          httpStatus: 404,
          redirects,
          message: "robots.txt was not found at the target origin."
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    // Handle Target Rate Limit (429)
    if (res.status === 429) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UPSTREAM_RATE_LIMITED",
            message: "The target website rate-limited our request."
          }
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    // Handle Non-200 / Non-Success responses
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: `UPSTREAM_HTTP_${res.status}`,
            message: `Target server responded with HTTP status ${res.status}.`
          }
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    // Content-Type Check
    const rawContentType = res.headers.get("content-type") || "";
    const lowerContentType = rawContentType.toLowerCase();

    // Reject obvious binary types
    if (
      lowerContentType.includes("image/") ||
      lowerContentType.includes("video/") ||
      lowerContentType.includes("audio/") ||
      lowerContentType.includes("application/pdf") ||
      lowerContentType.includes("application/zip") ||
      lowerContentType.includes("application/octet-stream")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNSUPPORTED_CONTENT",
            message: `Target responded with unsupported binary content type: ${rawContentType}`
          }
        },
        {
          status: 422,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    // Check upstream Content-Length header before reading body
    const upstreamContentLength = res.headers.get("content-length");
    if (
      upstreamContentLength &&
      parseInt(upstreamContentLength, 10) > MAX_BODY_BYTES
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "RESPONSE_TOO_LARGE",
            message: "The remote robots.txt file exceeds the 1 MiB size limit."
          }
        },
        {
          status: 413,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        }
      );
    }

    // Read body safely with chunk size inspection
    let bodyText = "";
    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8", { fatal: false });
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalBytes += value.byteLength;
        if (totalBytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return NextResponse.json(
            {
              ok: false,
              error: {
                code: "RESPONSE_TOO_LARGE",
                message: "The remote robots.txt file exceeds the 1 MiB size limit."
              }
            },
            {
              status: 413,
              headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
            }
          );
        }

        bodyText += decoder.decode(value, { stream: true });
      }
      bodyText += decoder.decode();
    } else {
      bodyText = await res.text();
    }

    // Successful Result
    return NextResponse.json(
      {
        ok: true,
        status: "found",
        sourceUrl,
        finalUrl: currentUrl,
        httpStatus: res.status,
        contentType: rawContentType || "text/plain",
        redirects,
        body: bodyText,
        bytes: bodyText.length
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/json"
        }
      }
    );
  }

  // Fallback if loop finishes without terminal response
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "FETCH_FAILED",
        message: "Failed to complete robots.txt fetch."
      }
    },
    {
      status: 502,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    }
  );
}
