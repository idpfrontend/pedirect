import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const key = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 16);
const clickId = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  24
);

async function main() {
  await prisma.clickLog.deleteMany();
  await prisma.campaignOffer.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo@1226", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@pedirect.com",
      name: "Demo",
      passwordHash,
    },
  });

  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        name: "Agoda Direct",
        network: "Direct",
        trackingUrl: "https://www.agoda.com/?cid={click_id}",
        geos: JSON.stringify(["US", "AE", "IN"]),
        status: "ACTIVE",
      },
    }),
    prisma.offer.create({
      data: {
        name: "Travel VIP",
        network: "VIP",
        trackingUrl:
          "https://example-affiliate.com/click?campaign_id=100&sub1={click_id}&sub2={publisher_id}",
        geos: JSON.stringify(["US", "GB"]),
        status: "ACTIVE",
      },
    }),
    prisma.offer.create({
      data: {
        name: "Shop Moonrover",
        network: "Moonrover",
        trackingUrl:
          "https://example-tracker.com/click?pid=1&offer_id=99&sub1={click_id}&sub2={type}",
        geos: JSON.stringify(["US"]),
        status: "ACTIVE",
      },
    }),
    prisma.offer.create({
      data: {
        name: "Paused Demo Offer",
        network: "X3",
        trackingUrl: "https://example.com/paused?sid={click_id}",
        geos: JSON.stringify(["US"]),
        status: "PAUSED",
      },
    }),
  ]);

  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: "Visible",
        destinationUrl: "https://www.agoda.com/",
        mappingKey: key(),
        clickRateMultiplier: 3,
        maxClicks: 0,
        geos: JSON.stringify(["US"]),
        referrers: JSON.stringify([]),
        status: "ACTIVE",
        offers: {
          create: [
            { offerId: offers[0].id, weight: 2 },
            { offerId: offers[1].id, weight: 1 },
          ],
        },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Shein Feed",
        destinationUrl: "https://www.shein.com/",
        mappingKey: key(),
        clickRateMultiplier: 1,
        maxClicks: 0,
        geos: JSON.stringify(["US", "GB"]),
        referrers: JSON.stringify([]),
        status: "ACTIVE",
        offers: {
          create: [{ offerId: offers[2].id, weight: 1 }],
        },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Paused Test",
        destinationUrl: "https://example.com/",
        mappingKey: key(),
        clickRateMultiplier: 1,
        status: "PAUSED",
        geos: JSON.stringify([]),
        referrers: JSON.stringify([]),
      },
    }),
  ]);

  const devices = ["mobile", "mobile", "mobile", "desktop", "tablet"] as const;
  const geos = ["US", "US", "US", "GB", "AE"];

  for (let i = 0; i < 40; i++) {
    const campaign = campaigns[i % 2];
    const google = i % 3 !== 0;
    await prisma.clickLog.create({
      data: {
        clickId: clickId(),
        campaignId: campaign.id,
        offerId: offers[i % 3].id,
        destination: offers[i % 3].trackingUrl.replace("{click_id}", "seed"),
        ip: `203.0.113.${(i % 200) + 1}`,
        userAgent: google
          ? "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile"
          : "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0",
        device: devices[i % devices.length],
        geo: geos[i % geos.length],
        referrer: google ? "https://www.google.com/" : "https://facebook.com/",
        mainClicks: google ? 0 : 1,
        googleClicks: google ? campaign.clickRateMultiplier : 0,
        createdAt: new Date(Date.now() - i * 3600_000),
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Welcome to Pedirect",
        message: "Your redirect workspace is ready. Create campaigns and share /r/{mappingKey} links.",
      },
      {
        userId: user.id,
        title: "Sample campaigns seeded",
        message: `Try testing ${campaigns[0].name} via /r/${campaigns[0].mappingKey}?geo=US`,
      },
    ],
  });

  console.log("Seed complete");
  console.log("Login: demo@pedirect.com / demo@1226");
  console.log(`Sample redirect: /r/${campaigns[0].mappingKey}?geo=US`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
