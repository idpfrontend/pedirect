import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function ClickLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    q?: string;
    limit?: string;
    sort?: string;
    range?: string;
  }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 6);

  let from = sp.from ? new Date(sp.from) : defaultFrom;
  let to = sp.to ? new Date(sp.to) : today;

  if (sp.range === "today") {
    from = today;
    to = today;
  } else if (sp.range === "yesterday") {
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    from = y;
    to = y;
  } else if (sp.range === "7") {
    from = defaultFrom;
    to = today;
  } else if (sp.range === "14") {
    from = new Date(today);
    from.setDate(today.getDate() - 13);
    to = today;
  } else if (sp.range === "30") {
    from = new Date(today);
    from.setDate(today.getDate() - 29);
    to = today;
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const limit = Math.min(5000, Math.max(100, Number(sp.limit || 500)));
  const sort = sp.sort === "asc" ? "asc" : "desc";
  const q = (sp.q || "").trim().toLowerCase();

  const logs = await prisma.clickLog.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      campaign: { select: { name: true, mappingKey: true } },
      offer: { select: { name: true, network: true } },
    },
    orderBy: { createdAt: sort },
    take: limit,
  });

  const filtered = q
    ? logs.filter((log) => {
        const hay = [
          log.campaign.name,
          log.campaign.mappingKey,
          log.offer?.name || "",
          log.destination,
          log.geo,
          log.device,
          log.clickId,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : logs;

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const csvHref = `/api/click-logs/export?from=${fromStr}&to=${toStr}&q=${encodeURIComponent(q)}`;

  return (
    <div>
      <PageHeader
        title="Click Logs Explorer"
        subtitle="View real-time clicks or export raw redirect records to CSV"
        actions={
          <a href={csvHref} className="btn btn-ghost">
            📥 Download CSV
          </a>
        }
      />

      <div className="card mb-4 p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["7", "Last 7 Days"],
            ["14", "Last 14 Days"],
            ["30", "Last 30 Days"],
          ].map(([value, label]) => (
            <Link key={value} href={`/click-logs?range=${value}`} className="btn btn-ghost text-sm">
              {label}
            </Link>
          ))}
        </div>

        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="label">Start Date</label>
            <input type="date" name="from" defaultValue={fromStr} className="field" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" name="to" defaultValue={toStr} className="field" />
          </div>
          <div>
            <label className="label">View Limit</label>
            <select name="limit" defaultValue={String(limit)} className="field">
              <option value="500">Top 500</option>
              <option value="1000">Top 1,000</option>
              <option value="2500">Top 2,500</option>
              <option value="5000">Top 5,000</option>
            </select>
          </div>
          <div>
            <label className="label">Sort Order</label>
            <select name="sort" defaultValue={sort} className="field">
              <option value="desc">Descending (Newest First)</option>
              <option value="asc">Ascending (Oldest First)</option>
            </select>
          </div>
          <div>
            <label className="label">Filter</label>
            <input
              name="q"
              defaultValue={sp.q || ""}
              className="field"
              placeholder="Filter by campaign, offer, url..."
            />
          </div>
          <div className="xl:col-span-5">
            <button type="submit" className="btn btn-primary">
              🔍 View Logs
            </button>
          </div>
        </form>
      </div>

      <div className="card p-2">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Time</th>
                <th>Click ID</th>
                <th>Campaign</th>
                <th>Offer</th>
                <th>Device</th>
                <th>Geo</th>
                <th>Main</th>
                <th>Google</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap text-xs text-[var(--muted)]">
                    {format(log.createdAt, "yyyy-MM-dd HH:mm:ss")}
                  </td>
                  <td>
                    <code className="text-xs">{log.clickId.slice(0, 12)}…</code>
                  </td>
                  <td>{log.campaign.name}</td>
                  <td>{log.offer?.name || "—"}</td>
                  <td className="capitalize">{log.device}</td>
                  <td>{log.geo || "—"}</td>
                  <td>{log.mainClicks}</td>
                  <td>{log.googleClicks}</td>
                  <td>
                    <div className="max-w-[220px] truncate text-xs text-[var(--muted)]">
                      {log.destination}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-[var(--muted)]">
                    No click logs in this range.
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
