import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CampaignForm } from "@/components/CampaignForm";
import { createCampaign } from "@/app/actions/campaigns";
import { prisma } from "@/lib/prisma";

export default async function NewCampaignPage() {
  const offers = await prisma.offer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Create New Campaign"
        subtitle="Configure destination URL, geo targeting, and affiliate routing"
        actions={
          <Link href="/campaigns" className="btn btn-ghost">
            Back to Campaigns
          </Link>
        }
      />
      <CampaignForm offers={offers} action={createCampaign} />
    </div>
  );
}
