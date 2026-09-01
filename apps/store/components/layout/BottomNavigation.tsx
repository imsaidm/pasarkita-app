"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

/**
 * PRD §9.1 Mobile Bottom Navigation — max 5 item, active state, badge cart,
 * disembunyikan di checkout untuk mengurangi distraksi.
 *
 * Ikon: lucide-react (16 Agustus 2026) — disamakan dengan admin_dashboard
 * (Karyalo_Store_Manage/admin_dashboard/package.json, versi ^1.23.0 sama
 * persis) supaya satu bahasa visual di seluruh ekosistem Karyalo, bukan
 * lagi SVG inline hand-drawn dari Fase 1 awal.
 */
const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/category", label: "Kategori", icon: LayoutGrid },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Keranjang", icon: ShoppingCart },
  { href: "/account", label: "Akun", icon: User },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();

  // P-01/§32: sembunyikan di checkout supaya tidak mengalihkan perhatian
  // dari penyelesaian pembayaran (§19 Checkout — "Navigation dan marketing
  // distraction harus dikurangi").
  if (pathname?.startsWith("/checkout")) return null;

  return (
    <nav
      aria-label="Navigasi utama (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-warm-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch justify-between">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`tap-target relative flex w-full flex-col items-center gap-0.5 py-2 text-[11px] ${
                  active ? "text-deep-pine" : "text-muted"
                }`}
              >
                <span className="relative">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.2 : 1.8}
                    fill={href === "/wishlist" && active ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  {href === "/cart" && hydrated && itemCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-warm-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
