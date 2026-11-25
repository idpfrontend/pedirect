import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fromStr = req.nextUrl.searchParams.get("from");
  const toStr = req.nextUrl.searchParams.get("to");
  const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase();

  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 7 * 86400000);
  const to = toStr ? new Date(toStr) : new Date();
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const logs = await prisma.clickLog.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      campaign: { select: { name: true, mappingKey: true } },
      offer: { select: { name: true, network: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100000,
  });

  const rows = logs.filter((log) => {
    if (!q) return true;
    const hay = [
      log.campaign.name,
      log.campaign.mappingKey,
      log.offer?.name || "",
      log.destination,
      log.geo,
      log.clickId,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const header = [
    "createdAt",
    "clickId",
    "campaign",
    "mappingKey",
    "offer",
    "network",
    "device",
    "geo",
    "ip",
    "referrer",
    "mainClicks",
    "googleClicks",
    "destination",
  ];

  const escape = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;

  const csv = [
    header.join(","),
    ...rows.map((log) =>
      [
        log.createdAt.toISOString(),
        log.clickId,
        log.campaign.name,
        log.campaign.mappingKey,
        log.offer?.name || "",
        log.offer?.network || "",
        log.device,
        log.geo,
        log.ip,
        log.referrer,
        log.mainClicks,
        log.googleClicks,
        log.destination,
      ]
        .map(escape)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedirect-clicks-${fromStr || "export"}.csv"`,
    },
  });
}
