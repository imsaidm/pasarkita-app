"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import type { Product } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";

export function WishlistClient({ products }: { products: Product[] }) {
  const { productIds, hydrated } = useWishlist();

  // Sebelum localStorage terbaca, daftar favorit belum diketahui. Menampilkan
  // "wishlist kosong" lebih dulu akan berkedip salah selama sekejap.
  if (!hydrated) {
    return <div className="mx-auto max-w-(--container-content) px-4 py-16 md:px-6" />;
  }

  const saved = products.filter((p) => productIds.includes(p.id));

  if (saved.length === 0) {
    return (
      <div className="mx-auto flex max-w-(--container-content) flex-col items-center gap-4 px-4 py-20 text-center md:px-6">
        <Heart size={40} strokeWidth={1.4} className="text-muted" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-ink">Wishlist Anda kosong</h1>
        <p className="max-w-sm text-sm text-muted">
          Tandai produk favorit dengan ikon hati supaya mudah ditemukan lagi.
        </p>
        <Link
          href="/category"
          className="tap-target mt-2 inline-flex items-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
        >
          Jelajahi Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Wishlist ({saved.length})</h1>
      <ProductGrid products={saved} />
    </div>
  );
}
