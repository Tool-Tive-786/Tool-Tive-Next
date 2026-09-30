import { NextResponse } from "next/server";
import { validateAndNormalizeTargetUrl } from "@/lib/ai-search/url-validation";
import { BASIC_SCANS_PER_DAY } from "@/lib/ai-search/constants";
import { createScanRecord, incrementQuota, getQuota } from "@/lib/ai-search/db";

export const runtime = "edge";

async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface StartScanRequest {
  mode?: "basic" | "deep";
  url: string;
  turnstileToken?: string;
}

/**
 * Validates Cloudflare Turnstile token server-side.
 */
async function verifyTurnstileToken(
  token: string | undefined,
  ip: string,
  secretKey?: string
): Promise<{ success: boolean; error?: string }> {
  // If secret key is not set or token is dummy testing token in local development
  if (!secretKey) {
    if (!token || token.startsWith("1x") || token.startsWith("2x") || token === "test-token") {
      return { success: true };
    }
  }

  if (!token) {
    return { success: false, error: "Cloudflare Turnstile verification token is required." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey || "1x0000000000000000000000000000000AA");
    formData.append("response", token);
    formData.append("remoteip", ip);

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await verifyRes.json();
    if (!data.success) {
      return { success: false, error: "Turnstile verification failed or token expired." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Turnstile verification service unreachable." };
  }
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((pair) => {
    const [name, ...val] = pair.trim().split("=");
    if (name) {
      cookies[name.trim()] = decodeURIComponent(val.join("=").trim());
    }
  });
  return cookies;
}

export async function POST(req: Request) {
  try {
    let body: StartScanRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON request body." }, { status: 400 });
    }

    if (!body || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "A valid website URL is required." }, { status: 400 });
    }

    // 1. Strict URL and SSRF Validation
    const validation = validateAndNormalizeTargetUrl(body.url);
    if (!validation.safe || !validation.normalizedUrl) {
      return NextResponse.json({ error: validation.error || "URL failed security validation." }, { status: 400 });
    }

    // Enforce Basic Scan Boundary: Reject any premature Deep Scan requests
    if (body.mode && body.mode !== "basic") {
      return NextResponse.json(
        { error: "Deep Scan is not supported in this phase. Only Basic Scan is available." },
        { status: 400 }
      );
    }

    const env = process.env as any;
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1";

    // 2. Turnstile Verification
    const turnstileSecret = env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
    const turnstileCheck = await verifyTurnstileToken(body.turnstileToken, ip, turnstileSecret);
    if (!turnstileCheck.success) {
      return NextResponse.json({ error: turnstileCheck.error }, { status: 400 });
    }

    // 3. Anonymous Session & Quota Management
    // Read or establish secure anonymous session cookie (tooltive_ais_sid)
    const cookies = parseCookies(req.headers.get("cookie"));
    let sessionId = cookies["tooltive_ais_sid"];
    let isNewSession = false;

    if (!sessionId || !/^[a-zA-Z0-9_-]{16,64}$/.test(sessionId)) {
      sessionId = crypto.randomUUID().replace(/-/g, "");
      isNewSession = true;
    }

    // Double-bind quota to both session cookie and salted IP hash
    const identityHash = await sha256Hex(`${sessionId}:${ip}:tooltive_basic_salt`);
    const today = new Date().toISOString().split("T")[0];

    const currentUsage = await getQuota(env, identityHash, today);
    if (currentUsage >= BASIC_SCANS_PER_DAY) {
      return NextResponse.json(
        {
          error: "Daily scan limit reached (3 of 3 scans used today). Please try again tomorrow.",
          quota: {
            used: BASIC_SCANS_PER_DAY,
            limit: BASIC_SCANS_PER_DAY,
            remaining: 0,
          },
        },
        { status: 429 }
      );
    }

    // 4. Create Scan Record in D1 / local store
    const scanId = "scan_" + crypto.randomUUID().replace(/-/g, "");
    await createScanRecord(env, scanId, identityHash, validation.normalizedUrl, "basic");
    await incrementQuota(env, identityHash, today);

    const response = NextResponse.json({
      scanId,
      mode: "basic",
      status: "queued",
      quota: {
        used: currentUsage + 1,
        limit: BASIC_SCANS_PER_DAY,
        remaining: Math.max(0, BASIC_SCANS_PER_DAY - (currentUsage + 1)),
      },
    });

    // Set secure anonymous session cookie if newly generated
    if (isNewSession) {
      response.cookies.set("tooltive_ais_sid", sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
