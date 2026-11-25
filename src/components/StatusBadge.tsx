export function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span className={`badge ${active ? "badge-active" : "badge-paused"}`}>
      {status}
    </span>
  );
}
