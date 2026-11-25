import { NextRequest, NextResponse } from "next/server";
import { resolveRedirect } from "@/lib/redirect-engine";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ mappingKey: string }> }
) {
  const { mappingKey } = await ctx.params;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || req.nextUrl.searchParams.get("ref") || "";
  const geoHint =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.nextUrl.searchParams.get("geo") ||
    undefined;

  const result = await resolveRedirect({
    mappingKey,
    ip,
    userAgent,
    referrer,
    geoHint: geoHint || undefined,
    publisherId: req.nextUrl.searchParams.get("pub") || undefined,
    type: req.nextUrl.searchParams.get("type") || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.redirect(result.url, 302);
}
