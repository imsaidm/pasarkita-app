"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { PRIMARY_NAV, MENU_NAV } from "@/lib/config/navigation";
import { useSession } from "@/lib/auth/session-context";

/**
 * Desktop Side Navigation — Beradaptasi Berdasarkan Role & Permission Aktif.
 * Menyembunyikan modul/fitur yang tidak diizinkan untuk role saat ini.
 */
export function DesktopSideNavigation() {
  const pathname = usePathname();
  const { capabilities, role } = useSession();

  // Filter menu utama sesuai hak akses role
  const visiblePrimaryNav = PRIMARY_NAV.filter(
    (item) => !item.capability || (capabilities && capabilities[item.capability])
  );

  // Filter menu layanan & pengaturan sesuai hak akses role
  const visibleMenuNav = MENU_NAV.filter(
    (item) => !item.capability || (capabilities && capabilities[item.capability])
  );

  return (
    <aside
      aria-label="Navigasi Utama Admin"
      className="desktop-sidebar sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col justify-between overflow-y-auto border-r border-border bg-warm-white p-3.5 xl:flex"
    >
      <div className="flex flex-col gap-5">
        {/* Kelompok Modul Utama */}
        {visiblePrimaryNav.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="px-3 text-xs font-bold uppercase tracking-wider text-muted">
              Menu Utama
            </span>

            <nav className="flex flex-col gap-1">
              {visiblePrimaryNav.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                // Filter submenu sesuai capability
                const visibleChildren = item.children?.filter(
                  (child) => !child.capability || (capabilities && capabilities[child.capability])
                );

                return (
                  <div key={item.href} className="flex flex-col">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`tap-target flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-deep-pine text-warm-white shadow-xs"
                          : "text-ink hover:bg-soft-sand"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={16} aria-hidden="true" />
                        <span>{item.label}</span>
                      </div>
                      {visibleChildren && visibleChildren.length > 0 && (
                        <ChevronRight size={13} className="opacity-60" aria-hidden="true" />
                      )}
                    </Link>

                    {/* Submenu links */}
                    {active && visibleChildren && visibleChildren.length > 0 && (
                      <div className="my-1 ml-6 flex flex-col gap-0.5 border-l border-border pl-3">
                        {visibleChildren.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`tap-target rounded-lg px-2 py-1 text-xs transition-colors ${
                              pathname === child.href
                                ? "font-bold text-karyalo-green bg-soft-sage/50"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}

        {/* Kelompok Modul Tambahan / Operasional */}
        {visibleMenuNav.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border/80 pt-4">
            <span className="px-3 text-xs font-bold uppercase tracking-wider text-muted">
              Layanan & Pengaturan
            </span>

            <nav className="flex flex-col gap-1">
              {visibleMenuNav.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                const visibleChildren = item.children?.filter(
                  (child) => !child.capability || (capabilities && capabilities[child.capability])
                );

                return (
                  <div key={item.href} className="flex flex-col">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`tap-target flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-deep-pine text-warm-white shadow-xs"
                          : "text-ink hover:bg-soft-sand"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={16} aria-hidden="true" />
                        <span>{item.label}</span>
                      </div>
                      {visibleChildren && visibleChildren.length > 0 && (
                        <ChevronRight size={13} className="opacity-60" aria-hidden="true" />
                      )}
                    </Link>

                    {active && visibleChildren && visibleChildren.length > 0 && (
                      <div className="my-1 ml-6 flex flex-col gap-0.5 border-l border-border pl-3">
                        {visibleChildren.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`tap-target rounded-lg px-2 py-1 text-xs transition-colors ${
                              pathname === child.href
                                ? "font-bold text-karyalo-green bg-soft-sage/50"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Shopee Integration Card Footer — Hanya Tampil untuk Owner / Admin dengan akses Integrasi */}
      {role === "Owner" && (
        <div className="mt-6 rounded-2xl border border-[#ee4d2d]/30 bg-[#ee4d2d]/10 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#ee4d2d]">
            <ShoppingBag size={14} aria-hidden="true" />
            <span>Shopee OpenAPI</span>
          </div>
          <p className="mt-1 text-xs text-[#ee4d2d]/80 leading-tight">
            v2.product, order & logistics
          </p>
          <Link
            href="/settings/integrations/shopee"
            className="mt-2.5 inline-flex w-full items-center justify-center rounded-lg bg-[#ee4d2d] py-1 text-xs font-semibold text-warm-white hover:bg-[#d43f22]"
          >
            Buka Integrasi
          </Link>
        </div>
      )}
    </aside>
  );
}
