"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MENU_NAV } from "@/lib/config/navigation";
import { useSession } from "@/lib/auth/session-context";

/**
 * Menu Page — Tampilan Menu Mobile Berbasis Role & Capability.
 */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function MenuPage() {
  const { capabilities } = useSession();

  const visibleMenuNav = MENU_NAV.filter(
    (item) => !item.capability || (capabilities && capabilities[item.capability])
  );

  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      <h1 className="mb-4 text-lg font-bold text-ink sm:text-2xl">Menu Layanan</h1>
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-warm-white shadow-2xs">
        {visibleMenuNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="tap-target flex items-center justify-between px-5 py-4 text-xs font-semibold text-ink hover:bg-soft-sand transition-colors"
          >
            <span className="flex items-center gap-3">
              <item.icon size={18} className="text-deep-pine" aria-hidden="true" />
              {item.label}
            </span>
            <ChevronRight size={16} className="text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-border bg-warm-white p-4 shadow-2xs">
        <span className="text-xs font-semibold text-muted">Legalitas & Kepatuhan Platform</span>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/privacy" className="font-medium text-karyalo-green hover:underline">
            Kebijakan Privasi
          </Link>
          <span className="text-border">•</span>
          <Link href="/terms" className="font-medium text-karyalo-green hover:underline">
            Ketentuan Layanan
          </Link>
        </div>
      </div>
    </div>
  );
}
