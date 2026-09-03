"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Store,
  Truck,
  CreditCard,
  Bell,
  Users,
  Shield,
  FileText,
  Plug,
  ChevronLeft,
} from "lucide-react";
import { useSession, CapabilitySet } from "@/lib/auth/session-context";

interface SettingsTabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  capability?: keyof CapabilitySet;
}

const SETTINGS_TABS: SettingsTabItem[] = [
  { href: "/settings/profile", label: "Profil Akun", icon: User },
  { href: "/settings/store", label: "Toko", icon: Store },
  { href: "/settings/shipping", label: "Pengiriman", icon: Truck },
  { href: "/settings/payments", label: "Pembayaran", icon: CreditCard, capability: "teamRoleManage" },
  { href: "/settings/notifications", label: "Notifikasi", icon: Bell },
  { href: "/settings/team", label: "Tim & Staf", icon: Users, capability: "teamRoleManage" },
  { href: "/settings/roles", label: "Role & Izin", icon: Shield, capability: "teamRoleManage" },
  { href: "/settings/audit-log", label: "Audit Log", icon: FileText },
  { href: "/settings/integrations", label: "Integrasi", icon: Plug, capability: "teamRoleManage" },
];

export function SettingsSubNav() {
  const pathname = usePathname();
  const { capabilities } = useSession();

  const visibleTabs = SETTINGS_TABS.filter(
    (tab) => !tab.capability || (capabilities && capabilities[tab.capability])
  );

  return (
    <div className="mb-6 flex flex-col gap-2.5">
      {/* Tombol Kembali ke Hub Pengaturan di Layar Sempit */}
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="tap-target inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Semua Pengaturan</span>
        </Link>
      </div>

      {/* Horizontal Scrollable Tabs Bar */}
      <div className="relative -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <nav
          aria-label="Sub-navigasi Pengaturan"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
        >
          {visibleTabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/settings" && pathname.startsWith(tab.href + "/"));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`tap-target inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-deep-pine text-warm-white shadow-xs"
                    : "bg-warm-white border border-border text-ink hover:bg-soft-sand hover:border-karyalo-green"
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
