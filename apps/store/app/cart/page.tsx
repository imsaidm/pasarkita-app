"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatRupiah } from "@/lib/utils/currency";

/**
 * CART-01..07 — halaman keranjang. Client component penuh (bergantung
 * pada cart-context yang cuma tersedia di client, lihat catatan hydration
 * di file itu).
 *
 * Ringkasan harga di sini TIDAK otoritatif (§40) — checkout sungguhan
 * (Fase 5+) wajib validasi ulang harga/stok/ongkir di backend.
 */
export default function CartPage() {
  const { items, hydrated, removeItem, updateQuantity } = useCart();

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (!hydrated) {
    // Hindari flash "keranjang kosong" sebelum localStorage selesai dibaca.
    return <div className="mx-auto max-w-(--container-content) px-4 py-16 md:px-6" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-(--container-content) flex-col items-center gap-4 px-4 py-20 text-center md:px-6">
        <ShoppingBag size={40} strokeWidth={1.4} className="text-muted" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-ink">Keranjang Anda kosong</h1>
        <p className="max-w-sm text-sm text-muted">
          Yuk mulai belanja — jelajahi koleksi fashion terbaru kami.
        </p>
        <Link
          href="/category"
          className="tap-target mt-2 inline-flex items-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">
        Keranjang ({items.length} item)
      </h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-4 rounded-(--radius-card) border border-border p-3"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-soft-sand">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-muted">{item.variantLabel}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                      aria-label="Kurangi jumlah"
                      className="tap-target inline-flex items-center justify-center text-ink"
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center text-sm text-ink">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      aria-label="Tambah jumlah"
                      className="tap-target inline-flex items-center justify-center text-ink"
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-deep-pine">
                    {formatRupiah(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.variantId)}
                aria-label={`Hapus ${item.name} dari keranjang`}
                className="tap-target self-start text-muted hover:text-terracotta"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-(--radius-card) border border-border p-5">
          <p className="mb-3 text-sm font-medium text-ink">Ringkasan Belanja</p>
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className="text-ink">{formatRupiah(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Ongkos kirim dihitung saat checkout.
          </p>
          <Link
            href="/checkout"
            className="tap-target mt-4 flex w-full items-center justify-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
