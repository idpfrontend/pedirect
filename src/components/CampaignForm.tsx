import { Campaign, Offer } from "@prisma/client";
import { parseJsonArray } from "@/lib/utils";

type Linked = { offerId: string; weight: number };

export function CampaignForm({
  campaign,
  offers,
  linked = [],
  action,
}: {
  campaign?: Campaign;
  offers: Offer[];
  linked?: Linked[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const geos = campaign ? parseJsonArray(campaign.geos).join(", ") : "";
  const referrers = campaign ? parseJsonArray(campaign.referrers).join("\n") : "https://google.com\nhttps://facebook.com";
  const weightMap = Object.fromEntries(linked.map((l) => [l.offerId, l.weight]));

  return (
    <form action={action} className="card mx-auto max-w-3xl space-y-5 p-6">
      <div>
        <label className="label" htmlFor="name">
          Campaign Name *
        </label>
        <input
          id="name"
          name="name"
          required
          className="field"
          defaultValue={campaign?.name || ""}
          placeholder="e.g. Summer Promo 2026"
        />
      </div>

      <div>
        <label className="label" htmlFor="destinationUrl">
          Final Destination URL *
        </label>
        <input
          id="destinationUrl"
          name="destinationUrl"
          required
          className="field"
          defaultValue={campaign?.destinationUrl || ""}
          placeholder="https://example.com/landing"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="clickRateMultiplier">
            Click Rate Multiplier
          </label>
          <input
            id="clickRateMultiplier"
            name="clickRateMultiplier"
            type="number"
            min={1}
            className="field"
            defaultValue={campaign?.clickRateMultiplier ?? 3}
          />
        </div>
        <div>
          <label className="label" htmlFor="maxClicks">
            Max Clicks (0 = Unlimited)
          </label>
          <input
            id="maxClicks"
            name="maxClicks"
            type="number"
            min={0}
            className="field"
            defaultValue={campaign?.maxClicks ?? 0}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="googleAdsMccId">
            Google Ads MCC ID
          </label>
          <input
            id="googleAdsMccId"
            name="googleAdsMccId"
            className="field"
            defaultValue={campaign?.googleAdsMccId || ""}
            placeholder="123-456-7890"
          />
        </div>
        <div>
          <label className="label" htmlFor="customerAccountId">
            Customer / Account ID
          </label>
          <input
            id="customerAccountId"
            name="customerAccountId"
            className="field"
            defaultValue={campaign?.customerAccountId || ""}
            placeholder="987-654-3210"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="geos">
          Geo Targeting Countries
        </label>
        <input
          id="geos"
          name="geos"
          className="field"
          defaultValue={geos}
          placeholder="US, GB, CA"
        />
      </div>

      <div>
        <label className="label" htmlFor="referrers">
          Referrers (one per line)
        </label>
        <textarea
          id="referrers"
          name="referrers"
          rows={3}
          className="field"
          defaultValue={referrers}
        />
      </div>

      <div>
        <label className="label">Assign Offers & Click Weightage</label>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Distribute clicks across mapped offers based on assigned weights. Leave weight 0 to skip.
        </p>
        {offers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
            No offers available. Create an offer first to link it.
          </div>
        ) : (
          <div className="space-y-2">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-black/20 p-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{offer.name}</div>
                  <div className="truncate text-xs text-[var(--muted)]">
                    {offer.network} · {offer.trackingUrl}
                  </div>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    min={0}
                    name={`weight_${offer.id}`}
                    className="field"
                    defaultValue={weightMap[offer.id] || 0}
                    placeholder="Weight"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <a href="/campaigns" className="btn btn-ghost">
          Cancel
        </a>
        <button type="submit" className="btn btn-primary">
          {campaign ? "Save Campaign" : "Create Campaign"}
        </button>
      </div>
    </form>
  );
}
