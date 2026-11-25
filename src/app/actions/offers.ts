"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toJsonArray } from "@/lib/utils";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

function parseGeos(raw: FormDataEntryValue | null): string[] {
  const text = String(raw || "");
  return text
    .split(/[\s,]+/)
    .map((g) => g.trim().toUpperCase())
    .filter(Boolean);
}

export async function createOffer(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "").trim();
  const network = String(formData.get("network") || "Direct").trim();
  const trackingUrl = String(formData.get("trackingUrl") || "").trim();
  const geos = parseGeos(formData.get("geos"));

  if (!name || !trackingUrl) {
    throw new Error("Name and tracking URL are required");
  }

  await prisma.offer.create({
    data: {
      name,
      network,
      trackingUrl,
      geos: toJsonArray(geos),
      status: "ACTIVE",
    },
  });

  revalidatePath("/offers");
  redirect("/offers");
}

export async function updateOffer(id: string, formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") || "").trim();
  const network = String(formData.get("network") || "Direct").trim();
  const trackingUrl = String(formData.get("trackingUrl") || "").trim();
  const geos = parseGeos(formData.get("geos"));

  if (!name || !trackingUrl) {
    throw new Error("Name and tracking URL are required");
  }

  await prisma.offer.update({
    where: { id },
    data: {
      name,
      network,
      trackingUrl,
      geos: toJsonArray(geos),
    },
  });

  revalidatePath("/offers");
  redirect("/offers");
}

export async function toggleOfferStatus(id: string) {
  await requireUser();
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return;
  await prisma.offer.update({
    where: { id },
    data: { status: offer.status === "ACTIVE" ? "PAUSED" : "ACTIVE" },
  });
  revalidatePath("/offers");
}

export async function duplicateOffer(id: string) {
  await requireUser();
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return;
  await prisma.offer.create({
    data: {
      name: `${offer.name}-copy`,
      network: offer.network,
      trackingUrl: offer.trackingUrl,
      geos: offer.geos,
      status: "PAUSED",
    },
  });
  revalidatePath("/offers");
}
