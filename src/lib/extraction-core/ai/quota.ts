import { AI_USER_DAILY_LIMIT, DEFAULT_AI_DAILY_GLOBAL_LIMIT } from "./config";
import { cookies } from "next/headers";

let globalUsageCount = 0;
let globalUsageDate = new Date().toISOString().split('T')[0];

const SECRET_KEY_STR = process.env.AI_SESSION_SECRET || "default_tooltive_ai_secret_fallback";

async function getCryptoKey() {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET_KEY_STR);
    return await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

function bufferToHex(buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function signCookie(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await getCryptoKey();
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
    return `${value}.${bufferToHex(signature)}`;
}

async function verifyCookie(cookie: string): Promise<string | null> {
    const parts = cookie.split(".");
    if (parts.length !== 2) return null;
    
    const [value, signatureHex] = parts;
    const encoder = new TextEncoder();
    const key = await getCryptoKey();
    
    // We can just sign the value and compare the hex
    const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
    if (bufferToHex(expectedSignature) === signatureHex) {
        return value;
    }
    return null;
}

export async function checkAndConsumeRateLimit(): Promise<{ allowed: boolean, remaining: number, error?: string }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check Global Limit
    const maxGlobal = process.env.AI_DAILY_GLOBAL_LIMIT 
        ? parseInt(process.env.AI_DAILY_GLOBAL_LIMIT, 10) 
        : DEFAULT_AI_DAILY_GLOBAL_LIMIT;

    if (globalUsageDate !== today) {
        globalUsageDate = today;
        globalUsageCount = 0;
    }

    if (globalUsageCount >= maxGlobal) {
        return { allowed: false, remaining: 0, error: "Daily global AI capacity reached." };
    }

    // Check User Limit via secure cookie
    const cookieStore = await cookies();
    const usageCookie = cookieStore.get("ai_session_usage")?.value;
    
    let userUsage = 0;
    
    if (usageCookie) {
        const verifiedValue = await verifyCookie(usageCookie);
        if (verifiedValue) {
            try {
                const data = JSON.parse(verifiedValue);
                if (data.date === today && typeof data.count === 'number') {
                    userUsage = data.count;
                }
            } catch (e) {
                // Invalid JSON in cookie, reset usage
            }
        }
    }

    if (userUsage >= AI_USER_DAILY_LIMIT) {
        return { allowed: false, remaining: 0, error: "You have reached your daily AI limit." };
    }

    // Consume limits
    globalUsageCount++;
    userUsage++;
    const remaining = Math.max(0, AI_USER_DAILY_LIMIT - userUsage);

    // Set updated cookie
    const newValue = JSON.stringify({ date: today, count: userUsage });
    const signedValue = await signCookie(newValue);
    
    cookieStore.set({
        name: "ai_session_usage",
        value: signedValue,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return { allowed: true, remaining };
}
