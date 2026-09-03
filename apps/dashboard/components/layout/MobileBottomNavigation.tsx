"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon } from "lucide-react";
import { PRIMARY_NAV } from "@/lib/config/navigation";
import { useSession } from "@/lib/auth/session-context";

/**
 * Mobile Bottom Navigation — Mengikuti Role & Capability Pengguna.
 */
export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { capabilities } = useSession();

  const visiblePrimaryNav = PRIMARY_NAV.filter(
    (item) => !item.capability || (capabilities && capabilities[item.capability])
  );

  return (
    <nav
      aria-label="Navigasi bawah"
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-warm-white pb-[env(safe-area-inset-bottom)] xl:hidden"
    >
      {visiblePrimaryNav.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium ${
              active ? "text-karyalo-green" : "text-muted"
            }`}
          >
            <item.icon size={20} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/menu"
        aria-current={pathname.startsWith("/menu") ? "page" : undefined}
        className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium ${
          pathname.startsWith("/menu") ? "text-karyalo-green" : "text-muted"
        }`}
      >
        <MenuIcon size={20} aria-hidden="true" />
        Menu
      </Link>
    </nav>
  );
}
