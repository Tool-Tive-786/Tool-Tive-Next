import { NextResponse } from "next/server";
import { fetchRobotsTxtRaw, isSafeOrigin } from "@/lib/sitemap/robots";

export const runtime = "edge";

interface RobotsRequest {
  origin: string;
}

export async function POST(req: Request) {
  try {
    const body: RobotsRequest = await req.json();

    if (!body.origin || !isSafeOrigin(body.origin)) {
      return NextResponse.json({ error: "Invalid or unsafe origin" }, { status: 400 });
    }

    const robotsTxt = await fetchRobotsTxtRaw(body.origin);
    
    return NextResponse.json({ robotsTxt: robotsTxt || "" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
