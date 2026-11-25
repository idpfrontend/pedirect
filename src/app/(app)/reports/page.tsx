import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { startOfDay, subDays } from "date-fns";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = Math.min(90, Math.max(1, Number(sp.days || 7)));
  const from = startOfDay(subDays(new Date(), days - 1));

  const [campaigns, clicks] = await Promise.all([
    prisma.campaign.findMany({ select: { id: true, name: true, status: true } }),
    prisma.clickLog.findMany({
      where: { createdAt: { gte: from } },
      select: {
        campaignId: true,
        offerId: true,
        mainClicks: true,
        googleClicks: true,
        device: true,
        geo: true,
        createdAt: true,
      },
    }),
  ]);

  const offers = await prisma.offer.findMany({ select: { id: true, name: true, network: true } });

  const byCampaign = campaigns
    .map((c) => {
      const rows = clicks.filter((x) => x.campaignId === c.id);
      const main = rows.reduce((s, r) => s + r.mainClicks, 0);
      const google = rows.reduce((s, r) => s + r.googleClicks, 0);
      return { ...c, main, google, total: main + google, events: rows.length };
    })
    .sort((a, b) => b.total - a.total);

  const byOffer = offers
    .map((o) => {
      const rows = clicks.filter((x) => x.offerId === o.id);
      const main = rows.reduce((s, r) => s + r.mainClicks, 0);
      const google = rows.reduce((s, r) => s + r.googleClicks, 0);
      return { ...o, main, google, total: main + google, events: rows.length };
    })
    .filter((o) => o.events > 0)
    .sort((a, b) => b.total - a.total);

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = subDays(new Date(), days - 1 - i);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const c of clicks) {
    const key = c.createdAt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + c.mainClicks + c.googleClicks);
  }
  const daily = Array.from(dailyMap.entries());
  const maxDaily = Math.max(1, ...daily.map(([, v]) => v));

  const totals = {
    events: clicks.length,
    main: clicks.reduce((s, c) => s + c.mainClicks, 0),
    google: clicks.reduce((s, c) => s + c.googleClicks, 0),
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={`Traffic performance over the last ${days} days`}
        actions={
          <form className="flex items-center gap-2">
            <select name="days" defaultValue={String(days)} className="field w-auto">
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button type="submit" className="btn btn-ghost">
              Apply
            </button>
          </form>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Redirect Events" value={totals.events} />
        <StatCard label="Main Clicks" value={totals.main} />
        <StatCard label="Google Clicks" value={totals.google} />
      </div>

      <div className="card mb-6 p-5">
        <h3 className="mb-4 text-sm font-semibold">Daily Volume</h3>
        <div className="flex h-40 items-end gap-1">
          {daily.map(([day, value]) => (
            <div key={day} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t bg-[var(--accent)]/80 transition group-hover:bg-[var(--brand)]"
                style={{ height: `${(value / maxDaily) * 100}%`, minHeight: value ? 4 : 0 }}
                title={`${day}: ${value}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
          <span>{daily[0]?.[0]}</span>
          <span>{daily[daily.length - 1]?.[0]}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-2">
          <h3 className="px-3 py-3 text-sm font-semibold">By Campaign</h3>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Events</th>
                  <th>Main</th>
                  <th>Google</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {byCampaign.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.events}</td>
                    <td>{row.main}</td>
                    <td>{row.google}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-2">
          <h3 className="px-3 py-3 text-sm font-semibold">By Offer</h3>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Network</th>
                  <th>Events</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {byOffer.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-[var(--muted)]">
                      No offer traffic yet.
                    </td>
                  </tr>
                )}
                {byOffer.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.network}</td>
                    <td>{row.events}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-semibold">
        {formatNumber(value)}
      </div>
    </div>
  );
}
