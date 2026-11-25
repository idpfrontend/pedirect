import { PageHeader } from "@/components/PageHeader";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="System alerts and campaign activity"
        actions={
          <form action={markAllNotificationsRead}>
            <button type="submit" className="btn btn-ghost">
              Mark all read
            </button>
          </form>
        }
      />

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="card p-6 text-sm text-[var(--muted)]">No notifications yet.</div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`card flex items-start justify-between gap-4 p-4 ${
              n.read ? "opacity-70" : "ring-1 ring-[rgba(91,141,239,0.25)]"
            }`}
          >
            <div>
              <div className="font-medium">{n.title}</div>
              <p className="mt-1 text-sm text-[var(--muted)]">{n.message}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {format(n.createdAt, "yyyy-MM-dd HH:mm")}
              </p>
            </div>
            {!n.read && (
              <form action={markNotificationRead.bind(null, n.id)}>
                <button type="submit" className="btn btn-ghost text-xs">
                  Mark read
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
