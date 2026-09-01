"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

/**
 * Cart shortcut dengan quantity badge (PRD §10 Global Header; acceptance
 * criteria §9.1 — "Badge Cart selalu merefleksikan cart state terbaru").
 * Komponen client kecil dan terisolasi — AppHeader di sekitarnya tetap
 * server component.
 *
 * Ikon: lucide-react (16 Agustus 2026), disamakan dengan admin_dashboard.
 */
export function CartLink({ className = "" }: { className?: string }) {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Keranjang belanja${itemCount > 0 ? `, ${itemCount} item` : ""}`}
      className={`tap-target relative inline-flex items-center justify-center rounded-full text-ink hover:bg-soft-sage ${className}`}
    >
      <ShoppingCart size={24} strokeWidth={1.8} aria-hidden="true" />
      {/* hydrated dicek supaya badge tidak sempat "berkedip 0" sebelum
          localStorage selesai dibaca di client (lihat cart-context.tsx). */}
      {hydrated && itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] font-semibold text-warm-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
