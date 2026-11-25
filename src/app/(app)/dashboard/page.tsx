import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatNumber } from "@/lib/utils";
import { getDashboardStats } from "@/lib/stats";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date ? new Date(sp.date) : new Date();
  const stats = await getDashboardStats(date);
  const dateValue = date.toISOString().slice(0, 10);
  const denom = Math.max(1, stats.totalClicks);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Live advertising metrics & campaign delivery status"
        actions={
          <>
            <form className="flex items-center gap-2">
              <input type="date" name="date" defaultValue={dateValue} className="field w-auto" />
              <button type="submit" className="btn btn-ghost">
                ↻ Sync
              </button>
            </form>
            <Link href="/campaigns/new" className="btn btn-primary">
              + New Campaign
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card p-5 md:col-span-1">
          <h3 className="text-sm font-semibold text-[#a5b4fc]">Traffic Analytics</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Performance & Conversion Rate</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Metric label="Total" value={stats.totalClicks} />
            <Metric label="Main" value={stats.totalMain} />
            <Metric label="Google" value={stats.totalGoogle} highlight />
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs text-[var(--muted)]">Total Delivered Google Clicks</p>
          <div className="mt-2 flex items-end gap-3">
            <h2 className="font-[family-name:var(--font-outfit)] text-4xl font-semibold">
              {formatNumber(stats.totalGoogle)}
            </h2>
            <span className="mb-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
              LIVE
            </span>
          </div>
          <div className="mt-4 h-12 overflow-hidden rounded-lg bg-[rgba(34,197,94,0.08)]">
            <svg viewBox="0 0 200 40" className="h-full w-full text-emerald-400/80">
              <path
                d="M0 30 C20 28, 30 10, 50 18 S80 35, 100 20 S140 5, 160 16 S190 28, 200 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs text-[var(--muted)]">Campaign Portfolio</p>
          <h2 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-semibold">
            {stats.campaignsCount} Campaigns
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {stats.pausedCampaigns} paused • monitored endpoints
          </p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
              <span>Active Campaign Ratio</span>
              <span>
                {Math.round((stats.activeCampaigns / Math.max(1, stats.campaignsCount)) * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{
                  width: `${(stats.activeCampaigns / Math.max(1, stats.campaignsCount)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold">{stats.offersCount} Offers</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {stats.activeOffers} active • affiliate endpoints for traffic distribution
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/offers" className="btn btn-ghost text-sm">
              View All Offers →
            </Link>
            <Link href="/offers/new" className="btn btn-primary text-sm">
              + Add Offer
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold">Device Breakdown</h3>
          {(["desktop", "mobile", "tablet"] as const).map((device) => {
            const value = stats.deviceMap[device] || 0;
            const pct = ((value / denom) * 100).toFixed(1);
            return (
              <div key={device} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize text-[var(--muted)]">{device}</span>
                  <span>
                    {value} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[var(--brand)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold">Top Geo Delivery</h3>
          {stats.topGeos.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No geo data for this date.</p>
          )}
          {stats.topGeos.map(([geo, value]) => {
            const pct = ((value / denom) * 100).toFixed(1);
            return (
              <div key={geo} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--muted)]">🌐 {geo}</span>
                  <span>
                    {value} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Total Clicks</th>
                <th>Main Clicks</th>
                <th>Google Clicks</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCampaign.slice(0, 10).map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/campaigns/${row.id}/edit`} className="font-medium text-[var(--accent)]">
                      {row.name}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>{row.total}</td>
                  <td>{row.main}</td>
                  <td>{row.google}</td>
                </tr>
              ))}
              {stats.byCampaign.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-[var(--muted)]">
                    No campaigns yet. Create one to start tracking.
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

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${highlight ? "text-[#a5b4fc]" : ""}`}>
        {formatNumber(value)}
      </div>
    </div>
  );
}
