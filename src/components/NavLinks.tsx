"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/campaigns", label: "Campaigns", icon: "📢" },
  { href: "/offers", label: "Offers", icon: "🏷️" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/click-logs", label: "Click Logs", icon: "🖱️" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
];

export function NavLinks({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={`items-center gap-1 overflow-x-auto ${className}`}>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg transition ${
              compact ? "px-3 py-1.5 text-xs" : "px-3 py-2 text-sm"
            } ${
              active
                ? "bg-[rgba(91,141,239,0.2)] text-white"
                : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
            }`}
          >
            {!compact && <span className="mr-1.5 opacity-80">{link.icon}</span>}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
