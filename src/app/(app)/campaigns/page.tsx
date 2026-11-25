import Link from "next/link";
import { headers } from "next/headers";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { toggleCampaignStatus } from "@/app/actions/campaigns";
import { prisma } from "@/lib/prisma";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const status = sp.status || "ALL";
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;

  const campaigns = await prisma.campaign.findMany({ orderBy: { name: "asc" } });
  const filtered = campaigns.filter((c) => {
    if (status !== "ALL" && c.status !== status) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.destinationUrl.toLowerCase().includes(q) ||
      c.mappingKey.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage routing destinations and linked offers"
        actions={
          <>
            <Link href="/campaigns" className="btn btn-ghost">
              ↻ Sync
            </Link>
            <Link href="/campaigns/new" className="btn btn-primary">
              + New Campaign
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
              placeholder="Search campaigns, URLs, keys..."
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
                <th>Campaign Name</th>
                <th>Mapping Key</th>
                <th>Rate / Max</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((campaign) => {
                const trackUrl = `${base}/r/${campaign.mappingKey}`;
                return (
                  <tr key={campaign.id}>
                    <td>
                      <Link
                        href={`/campaigns/${campaign.id}/edit`}
                        className="font-medium text-white hover:text-[var(--accent)]"
                      >
                        {campaign.name}
                      </Link>
                      <div className="max-w-sm truncate text-xs text-[var(--muted)]">
                        {campaign.destinationUrl}
                      </div>
                    </td>
                    <td>
                      <code className="text-sm text-[var(--accent)]">{campaign.mappingKey}</code>
                      <div className="max-w-xs truncate text-[10px] text-[var(--muted)]">
                        {trackUrl}
                      </div>
                    </td>
                    <td>
                      {campaign.clickRateMultiplier}x /{" "}
                      {campaign.maxClicks === 0 ? "Unlimited" : campaign.maxClicks}
                    </td>
                    <td>
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`${trackUrl}?geo=US`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost text-xs text-[var(--accent)]"
                        >
                          🧪 Test
                        </a>
                        <Link
                          href={`/campaigns/${campaign.id}/edit`}
                          className="btn btn-ghost text-xs"
                        >
                          Edit
                        </Link>
                        <form action={toggleCampaignStatus.bind(null, campaign.id)}>
                          <button
                            type="submit"
                            className={`btn text-xs ${
                              campaign.status === "ACTIVE" ? "btn-danger" : "btn-success"
                            }`}
                          >
                            {campaign.status === "ACTIVE" ? "Pause" : "Activate"}
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
                    No campaigns found.
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
