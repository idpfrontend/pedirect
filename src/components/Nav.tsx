import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";

export async function Nav() {
  const session = await auth();
  const unread = session?.user?.id
    ? await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      })
    : 0;

  const initial = (session?.user?.name || session?.user?.email || "P").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(18,20,28,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <Link href="/dashboard" className="mr-2 flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(61,214,198,0.15)] text-[var(--brand)] ring-1 ring-[rgba(61,214,198,0.35)]">
            ↪
          </span>
          <span className="font-[family-name:var(--font-outfit)] text-lg font-semibold tracking-tight">
            pe<span className="text-[var(--brand)]">direct</span>
          </span>
        </Link>

        <NavLinks className="hidden flex-1 md:flex" />

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full text-[var(--warning)] hover:bg-white/5"
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--danger)]" />
            )}
          </Link>
          <div className="relative grid h-9 w-9 place-items-center rounded-full bg-[#7c5cfc] text-sm font-bold">
            {initial}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg)] bg-[var(--success)]" />
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost text-sm">
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-3 py-2 md:hidden">
        <NavLinks className="flex" compact />
      </div>
    </header>
  );
}
