"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMappingKey, toJsonArray } from "@/lib/utils";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

function parseList(raw: FormDataEntryValue | null, upper = false): string[] {
  const text = String(raw || "");
  return text
    .split(/[\n,]+/)
    .map((v) => (upper ? v.trim().toUpperCase() : v.trim()))
    .filter(Boolean);
}

function parseOfferWeights(formData: FormData): Array<{ offerId: string; weight: number }> {
  const entries: Array<{ offerId: string; weight: number }> = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("weight_")) continue;
    const offerId = key.replace("weight_", "");
    const weight = Number(value);
    if (offerId && weight > 0) entries.push({ offerId, weight });
  }
  return entries;
}

export async function createCampaign(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "").trim();
  const destinationUrl = String(formData.get("destinationUrl") || "").trim();
  const clickRateMultiplier = Math.max(1, Number(formData.get("clickRateMultiplier") || 1));
  const maxClicks = Math.max(0, Number(formData.get("maxClicks") || 0));
  const googleAdsMccId = String(formData.get("googleAdsMccId") || "").trim();
  const customerAccountId = String(formData.get("customerAccountId") || "").trim();
  const geos = parseList(formData.get("geos"), true);
  const referrers = parseList(formData.get("referrers"));
  const links = parseOfferWeights(formData);

  if (!name || !destinationUrl) {
    throw new Error("Name and destination URL are required");
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      destinationUrl,
      mappingKey: generateMappingKey(),
      clickRateMultiplier,
      maxClicks,
      googleAdsMccId,
      customerAccountId,
      geos: toJsonArray(geos),
      referrers: toJsonArray(referrers),
      status: "ACTIVE",
      offers: {
        create: links.map((l) => ({ offerId: l.offerId, weight: l.weight })),
      },
    },
  });

  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Campaign created",
        message: `${campaign.name} is live. Tracking key: ${campaign.mappingKey}`,
      },
    });
  }

  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  redirect("/campaigns");
}

export async function updateCampaign(id: string, formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "").trim();
  const destinationUrl = String(formData.get("destinationUrl") || "").trim();
  const clickRateMultiplier = Math.max(1, Number(formData.get("clickRateMultiplier") || 1));
  const maxClicks = Math.max(0, Number(formData.get("maxClicks") || 0));
  const googleAdsMccId = String(formData.get("googleAdsMccId") || "").trim();
  const customerAccountId = String(formData.get("customerAccountId") || "").trim();
  const geos = parseList(formData.get("geos"), true);
  const referrers = parseList(formData.get("referrers"));
  const links = parseOfferWeights(formData);

  if (!name || !destinationUrl) {
    throw new Error("Name and destination URL are required");
  }

  await prisma.$transaction([
    prisma.campaignOffer.deleteMany({ where: { campaignId: id } }),
    prisma.campaign.update({
      where: { id },
      data: {
        name,
        destinationUrl,
        clickRateMultiplier,
        maxClicks,
        googleAdsMccId,
        customerAccountId,
        geos: toJsonArray(geos),
        referrers: toJsonArray(referrers),
        offers: {
          create: links.map((l) => ({ offerId: l.offerId, weight: l.weight })),
        },
      },
    }),
  ]);

  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  redirect("/campaigns");
}

export async function toggleCampaignStatus(id: string) {
  await requireUser();
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return;
  await prisma.campaign.update({
    where: { id },
    data: { status: campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE" },
  });
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
}
