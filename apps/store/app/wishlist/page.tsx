"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { MOCK_PRODUCTS, Product } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";

/**
 * PRD §16 Wishlist. Client component — bergantung wishlist-context yang
 * hanya tersedia di client (localStorage-backed, sama pola dengan cart).
 *
 * **Diperbarui 16 Agustus 2026 (wiring Convex):** halaman ini beda dari
 * page.tsx lain (yang server component, pakai fetchQuery dari
 * lib/data/products.ts) karena wishlist-context hanya jalan di client.
 * Convex punya hook client-side reactive sendiri (`useQuery`), tapi hook
 * TIDAK BOLEH dipanggil kondisional — jadi dipecah jadi dua komponen kecil
 * (WishlistPageConvex / WishlistPageMock) yang dipilih sekali berdasarkan
 * ada-tidaknya `NEXT_PUBLIC_CONVEX_URL` (nilai ini tetap sama sepanjang
 * sesi browser, jadi aman bukan pelanggaran Rules of Hooks). ID produk yang
 * tersimpan di wishlist localStorage sekarang adalah Convex `_id` (bukan
 * lagi "p01" dst.) begitu Convex aktif — makanya daftar produk untuk
 * pencocokan ID juga harus dari Convex, bukan `MOCK_PRODUCTS` yang idnya beda.
 */
const CONVEX_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function WishlistPage() {
  return CONVEX_CONFIGURED ? <WishlistPageConvex /> : <WishlistPageMock />;
}

function WishlistPageConvex() {
  const { productIds, hydrated } = useWishlist();
  const allProducts = useQuery(api.products.list);

  if (!hydrated || allProducts === undefined) {
    return <div className="mx-auto max-w-(--container-content) px-4 py-16 md:px-6" />;
  }

  const products: Product[] = allProducts
    .filter((p) => productIds.includes(p._id))
    .map((p) => ({ id: p._id, ...p }));

  return <WishlistBody products={products} />;
}

function WishlistPageMock() {
  const { productIds, hydrated } = useWishlist();
  const products = MOCK_PRODUCTS.filter((p) => productIds.includes(p.id));

  if (!hydrated) {
    return <div className="mx-auto max-w-(--container-content) px-4 py-16 md:px-6" />;
  }

  return <WishlistBody products={products} />;
}

function WishlistBody({ products }: { products: Product[] }) {
  if (products.length === 0) {
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
      <h1 className="mb-6 text-2xl font-semibold text-ink">
        Wishlist ({products.length})
      </h1>
      <ProductGrid products={products} />
    </div>
  );
}
