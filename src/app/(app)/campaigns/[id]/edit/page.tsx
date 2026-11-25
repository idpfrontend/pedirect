import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CampaignForm } from "@/components/CampaignForm";
import { updateCampaign } from "@/app/actions/campaigns";
import { prisma } from "@/lib/prisma";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, offers] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: { offers: true },
    }),
    prisma.offer.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!campaign) notFound();

  const action = updateCampaign.bind(null, id);
  const linked = campaign.offers.map((o) => ({ offerId: o.offerId, weight: o.weight }));

  return (
    <div>
      <PageHeader
        title="Edit Campaign"
        subtitle={`Mapping key: ${campaign.mappingKey}`}
        actions={
          <Link href="/campaigns" className="btn btn-ghost">
            Back to Campaigns
          </Link>
        }
      />
      <CampaignForm
        campaign={campaign}
        offers={offers}
        linked={linked}
        action={action}
      />
    </div>
  );
}
