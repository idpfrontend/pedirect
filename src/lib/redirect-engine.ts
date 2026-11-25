import { prisma } from "@/lib/prisma";
import {
  detectDevice,
  generateClickId,
  isGoogleTraffic,
  parseJsonArray,
} from "@/lib/utils";

function hostFromUrl(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return value.toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  }
}

function applyMacros(
  url: string,
  vars: Record<string, string>
): string {
  let out = url;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, encodeURIComponent(value));
  }
  return out;
}

function pickWeightedOffer<T extends { weight: number }>(items: T[]): T | null {
  if (!items.length) return null;
  const total = items.reduce((sum, i) => sum + Math.max(0, i.weight), 0);
  if (total <= 0) return items[0];
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, item.weight);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export type RedirectResult =
  | { ok: true; url: string; clickId: string }
  | { ok: false; status: number; message: string };

export async function resolveRedirect(params: {
  mappingKey: string;
  ip: string;
  userAgent: string;
  referrer: string;
  geoHint?: string;
  publisherId?: string;
  type?: string;
}): Promise<RedirectResult> {
  const campaign = await prisma.campaign.findUnique({
    where: { mappingKey: params.mappingKey },
    include: {
      offers: {
        include: { offer: true },
      },
    },
  });

  if (!campaign) {
    return { ok: false, status: 404, message: "Campaign not found" };
  }

  if (campaign.status !== "ACTIVE") {
    return { ok: false, status: 403, message: "Campaign is paused" };
  }

  if (campaign.maxClicks > 0) {
    const count = await prisma.clickLog.count({ where: { campaignId: campaign.id } });
    if (count >= campaign.maxClicks) {
      return { ok: false, status: 429, message: "Max clicks reached" };
    }
  }

  const campaignGeos = parseJsonArray(campaign.geos);
  const geo = (params.geoHint || "").toUpperCase() || "XX";
  if (campaignGeos.length && geo !== "XX" && !campaignGeos.includes(geo)) {
    return { ok: false, status: 403, message: "Geo not allowed" };
  }

  const allowedReferrers = parseJsonArray(campaign.referrers);
  if (allowedReferrers.length && params.referrer) {
    const refHost = hostFromUrl(params.referrer);
    const ok = allowedReferrers.some((allowed) => {
      const a = allowed.toLowerCase();
      return (
        params.referrer.toLowerCase().includes(a) ||
        refHost.includes(hostFromUrl(allowed)) ||
        hostFromUrl(allowed).includes(refHost)
      );
    });
    if (!ok) {
      return { ok: false, status: 403, message: "Referrer not allowed" };
    }
  }

  const activeLinks = campaign.offers.filter((co) => co.offer.status === "ACTIVE");
  let eligible = activeLinks.filter((co) => {
    const offerGeos = parseJsonArray(co.offer.geos);
    if (!offerGeos.length || geo === "XX") return true;
    return offerGeos.includes(geo);
  });
  if (!eligible.length) eligible = activeLinks;

  const picked = pickWeightedOffer(eligible);
  const clickId = generateClickId();
  const device = detectDevice(params.userAgent);
  const google = isGoogleTraffic(params.referrer, params.userAgent);

  let destination = campaign.destinationUrl;
  let offerId: string | null = null;

  if (picked) {
    offerId = picked.offer.id;
    destination = applyMacros(picked.offer.trackingUrl, {
      click_id: clickId,
      publisher_id: params.publisherId || "pedirect",
      type: params.type || "click",
      campaign_id: campaign.id,
      mapping_key: campaign.mappingKey,
      geo,
      device,
    });
  } else {
    destination = applyMacros(campaign.destinationUrl, {
      click_id: clickId,
      publisher_id: params.publisherId || "pedirect",
      type: params.type || "click",
      campaign_id: campaign.id,
      mapping_key: campaign.mappingKey,
      geo,
      device,
    });
  }

  await prisma.clickLog.create({
    data: {
      clickId,
      campaignId: campaign.id,
      offerId,
      destination,
      ip: params.ip,
      userAgent: params.userAgent,
      device,
      geo: geo === "XX" ? "" : geo,
      referrer: params.referrer,
      mainClicks: google ? 0 : 1,
      googleClicks: google ? Math.max(1, campaign.clickRateMultiplier) : 0,
    },
  });

  return { ok: true, url: destination, clickId };
}
