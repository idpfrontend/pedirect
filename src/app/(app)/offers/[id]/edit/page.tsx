import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OfferForm } from "@/components/OfferForm";
import { updateOffer } from "@/app/actions/offers";
import { prisma } from "@/lib/prisma";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) notFound();

  const action = updateOffer.bind(null, id);

  return (
    <div>
      <PageHeader
        title="Edit Offer"
        subtitle={offer.name}
        actions={
          <Link href="/offers" className="btn btn-ghost">
            Back to Offers
          </Link>
        }
      />
      <OfferForm offer={offer} action={action} />
    </div>
  );
}
