import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function getDashboardStats(date = new Date()) {
  const from = startOfDay(date);
  const to = endOfDay(date);

  const [campaigns, offers, clicks] = await Promise.all([
    prisma.campaign.findMany({ select: { id: true, name: true, status: true } }),
    prisma.offer.findMany({ select: { id: true, status: true } }),
    prisma.clickLog.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        campaignId: true,
        mainClicks: true,
        googleClicks: true,
        device: true,
        geo: true,
      },
    }),
  ]);

  const totalMain = clicks.reduce((s, c) => s + c.mainClicks, 0);
  const totalGoogle = clicks.reduce((s, c) => s + c.googleClicks, 0);
  const totalClicks = totalMain + totalGoogle;

  const deviceMap: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
  const geoMap: Record<string, number> = {};

  for (const c of clicks) {
    const weight = c.mainClicks + c.googleClicks;
    deviceMap[c.device] = (deviceMap[c.device] || 0) + weight;
    const g = c.geo || "XX";
    geoMap[g] = (geoMap[g] || 0) + weight;
  }

  const byCampaign = campaigns.map((camp) => {
    const rows = clicks.filter((c) => c.campaignId === camp.id);
    const main = rows.reduce((s, c) => s + c.mainClicks, 0);
    const google = rows.reduce((s, c) => s + c.googleClicks, 0);
    return {
      id: camp.id,
      name: camp.name,
      status: camp.status,
      total: main + google,
      main,
      google,
    };
  });

  byCampaign.sort((a, b) => b.google - a.google || b.total - a.total);

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const pausedCampaigns = campaigns.length - activeCampaigns;
  const activeOffers = offers.filter((o) => o.status === "ACTIVE").length;

  const topGeos = Object.entries(geoMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalClicks,
    totalMain,
    totalGoogle,
    campaignsCount: campaigns.length,
    activeCampaigns,
    pausedCampaigns,
    offersCount: offers.length,
    activeOffers,
    deviceMap,
    topGeos,
    byCampaign,
  };
}
