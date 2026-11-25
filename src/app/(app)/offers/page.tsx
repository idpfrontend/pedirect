import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { duplicateOffer, toggleOfferStatus } from "@/app/actions/offers";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; network?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const status = sp.status || "ALL";
  const network = sp.network || "ALL";

  const offers = await prisma.offer.findMany({ orderBy: { name: "asc" } });
  const networks = Array.from(new Set(offers.map((o) => o.network))).sort();

  const filtered = offers.filter((o) => {
    if (status !== "ALL" && o.status !== status) return false;
    if (network !== "ALL" && o.network !== network) return false;
    if (!q) return true;
    const geos = parseJsonArray(o.geos).join(" ").toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.network.toLowerCase().includes(q) ||
      o.trackingUrl.toLowerCase().includes(q) ||
      geos.includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Offers"
        subtitle="Manage affiliate networks, tracking destinations, and geo targeting rules"
        actions={
          <>
            <Link href="/offers" className="btn btn-ghost">
              ↻ Sync
            </Link>
            <Link href="/offers/new" className="btn btn-primary">
              + New Offer
            </Link>
          </>
        }
      />

      <div className="card mb-4 p-4">
        <form className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="label">Search</label>
            <input
              name="q"
              defaultValue={sp.q || ""}
              className="field"
              placeholder="Search offers, networks, URLs, geos..."
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={status} className="field">
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="PAUSED">Paused Only</option>
            </select>
          </div>
          <div>
            <label className="label">Network</label>
            <select name="network" defaultValue={network} className="field">
              <option value="ALL">All Networks</option>
              {networks.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-ghost">
            Filter
          </button>
        </form>
      </div>

      <div className="card p-2">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Offer Name</th>
                <th>Network</th>
                <th>Geo Targeting</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((offer) => {
                const geos = parseJsonArray(offer.geos);
                return (
                  <tr key={offer.id}>
                    <td>
                      <div className="font-medium">{offer.name}</div>
                      <div className="max-w-md truncate text-xs text-[var(--muted)]">
                        {offer.trackingUrl}
                      </div>
                    </td>
                    <td>{offer.network}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {geos.slice(0, 6).map((g) => (
                          <span
                            key={g}
                            className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--muted)]"
                          >
                            {g}
                          </span>
                        ))}
                        {geos.length > 6 && (
                          <span className="text-xs text-[var(--muted)]">+{geos.length - 6}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={offer.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <form action={duplicateOffer.bind(null, offer.id)}>
                          <button type="submit" className="btn btn-ghost text-xs text-[var(--accent)]">
                            Duplicate
                          </button>
                        </form>
                        <Link href={`/offers/${offer.id}/edit`} className="btn btn-ghost text-xs">
                          Edit
                        </Link>
                        <form action={toggleOfferStatus.bind(null, offer.id)}>
                          <button
                            type="submit"
                            className={`btn text-xs ${
                              offer.status === "ACTIVE" ? "btn-danger" : "btn-success"
                            }`}
                          >
                            {offer.status === "ACTIVE" ? "Pause" : "Activate"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-[var(--muted)]">
                    No offers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
