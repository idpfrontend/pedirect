import { PageHeader } from "@/components/PageHeader";
import { OfferForm } from "@/components/OfferForm";
import { createOffer } from "@/app/actions/offers";
import Link from "next/link";

export default function NewOfferPage() {
  return (
    <div>
      <PageHeader
        title="Create New Offer"
        subtitle="Configure affiliate network tracking destination and geo rules"
        actions={
          <Link href="/offers" className="btn btn-ghost">
            Back to Offers
          </Link>
        }
      />
      <OfferForm action={createOffer} />
    </div>
  );
}
