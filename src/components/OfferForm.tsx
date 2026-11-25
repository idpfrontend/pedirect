import { Offer } from "@prisma/client";
import { parseJsonArray } from "@/lib/utils";

const NETWORKS = [
  "Direct",
  "AdmitAD",
  "CJ",
  "Click Dealer",
  "CloudTraffic",
  "Involve Asia",
  "Linkbux",
  "Linkhaitao",
  "Moonrover",
  "Partnerize",
  "VIP",
  "X3",
];

export function OfferForm({
  offer,
  action,
}: {
  offer?: Offer;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const geos = offer ? parseJsonArray(offer.geos).join(", ") : "US";

  return (
    <form action={action} className="card mx-auto max-w-3xl space-y-5 p-6">
      <div>
        <label className="label" htmlFor="name">
          Offer Name *
        </label>
        <input
          id="name"
          name="name"
          required
          className="field"
          defaultValue={offer?.name || ""}
          placeholder="e.g. Summer Promo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="network">
            Network
          </label>
          <select
            id="network"
            name="network"
            className="field"
            defaultValue={offer?.network || "Direct"}
          >
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="geos">
            Geo Targeting (comma separated)
          </label>
          <input
            id="geos"
            name="geos"
            className="field"
            defaultValue={geos}
            placeholder="US, GB, AE"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="trackingUrl">
          Tracking / Destination URL *
        </label>
        <input
          id="trackingUrl"
          name="trackingUrl"
          required
          className="field"
          defaultValue={offer?.trackingUrl || ""}
          placeholder="https://network.com/click?sub1={click_id}"
        />
        <p className="mt-2 text-xs text-[var(--muted)]">
          Macros: {"{click_id}"}, {"{publisher_id}"}, {"{type}"}, {"{geo}"}, {"{device}"}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <a href="/offers" className="btn btn-ghost">
          Cancel
        </a>
        <button type="submit" className="btn btn-primary">
          {offer ? "Save Offer" : "Create Offer"}
        </button>
      </div>
    </form>
  );
}
