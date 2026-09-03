import Link from "next/link";
import { getAllProducts } from "@/lib/data/catalog";
import { ProductTable } from "@/components/products/ProductTable";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { PermissionGate } from "@/components/system/PermissionGate";
import { Plus } from "lucide-react";

/** PRD §12.1 Product List — Polished, Pixel-Perfect & Mobile First. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto w-full max-w-(--container-wide) min-w-0 px-3.5 py-5 sm:px-6 sm:py-8 box-border">
      {/* Header Halaman dengan alignment presisi */}
      <div className="mb-4 flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl truncate">Katalog Produk</h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">{products.length} produk terdaftar</p>
        </div>
        <PermissionGate capability="catalogWrite">
          <Link
            href="/products/new"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-karyalo-green px-3.5 text-xs font-semibold text-warm-white shadow-xs transition-all hover:bg-deep-pine active:scale-95 sm:px-4"
          >
            <Plus size={15} className="stroke-[2.5]" aria-hidden="true" />
            <span>Tambah Produk</span>
          </Link>
        </PermissionGate>
      </div>

      <SampleDataBanner />

      {/* Filter Tabs Scrollable dengan tinggi seragam h-8 & containment */}
      <div className="mb-4 flex w-full max-w-full min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 overscroll-x-contain">
        <Link
          href="/products"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-deep-pine px-4 text-xs font-semibold text-warm-white shadow-xs"
        >
          Semua Produk
        </Link>
        <Link
          href="/products/categories"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-border bg-warm-white px-4 text-xs font-medium text-ink transition-colors hover:border-karyalo-green hover:bg-soft-sand"
        >
          Kategori
        </Link>
        <Link
          href="/products/collections"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-border bg-warm-white px-4 text-xs font-medium text-ink transition-colors hover:border-karyalo-green hover:bg-soft-sand"
        >
          Koleksi
        </Link>
        <Link
          href="/products/inventory"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-border bg-warm-white px-4 text-xs font-medium text-ink transition-colors hover:border-karyalo-green hover:bg-soft-sand"
        >
          Ringkasan Inventori
        </Link>
      </div>

      {/* List Produk (Vertical Cards di Mobile, Table di Desktop) */}
      <ProductTable products={products} />
    </div>
  );
}
