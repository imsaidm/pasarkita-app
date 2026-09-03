"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/orders", label: "Semua" },
  { href: "/orders/webstore", label: "🌐 Web Storefront" },
  { href: "/orders/shopee", label: "🛒 Shopee" },
  { href: "/orders/action-required", label: "Perlu Tindakan" },
  { href: "/orders/payment-issues", label: "Masalah Bayar" },
  { href: "/orders/fulfillment", label: "Fulfillment" },
  { href: "/orders/returns", label: "Retur" },
];

export function OrderFilterTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-4 flex w-full max-w-full min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 overscroll-x-contain">
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href === "/orders/webstore" && pathname === "/orders/storefront");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-semibold transition-all ${
              isActive
                ? "bg-deep-pine text-warm-white shadow-xs"
                : "border border-border bg-warm-white text-ink hover:border-karyalo-green hover:bg-soft-sand"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
