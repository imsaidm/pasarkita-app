import Link from "next/link";
import { ArrowLeft, AlertTriangle, AlertCircle, RefreshCw, Package } from "lucide-react";
import { getAllProducts, getLowStockProducts, getOutOfStockProducts } from "@/lib/data/catalog";
import { ProductTable } from "@/components/products/ProductTable";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { formatRupiah } from "@/lib/utils/currency";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [allProducts, lowStock, outOfStock] = await Promise.all([
    getAllProducts(),
    getLowStockProducts(),
    getOutOfStockProducts(),
  ]);

  const totalStockCount = allProducts.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValuation = allProducts.reduce((acc, p) => acc + p.price * p.stock, 0);

  return (
    <div className="mx-auto w-full max-w-(--container-wide) px-3.5 py-5 sm:px-6 sm:py-8">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke Katalog Produk</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Ringkasan Inventori & Stok
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Pantau ketersediaan stok fisik gudang dan sinkronisasi multi-channel (Web & Shopee).
          </p>
        </div>
      </div>

      <SampleDataBanner note="Proyeksi inventori gudang disinkronkan real-time dengan Shopee OpenAPI v2 (v2.product.update_stock)." />

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-warm-white p-4 shadow-xs">
          <span className="text-xs font-medium text-muted">Total Unit Stok</span>
          <p className="mt-1 text-xl font-bold text-ink sm:text-2xl">{totalStockCount}</p>
          <span className="mt-0.5 block text-xs text-muted">Di seluruh 18 SKU</span>
        </div>

        <div className="rounded-2xl border border-border bg-warm-white p-4 shadow-xs">
          <span className="text-xs font-medium text-muted">Estimasi Nilai Stok</span>
          <p className="mt-1 text-base font-bold text-ink sm:text-xl truncate">
            {formatRupiah(totalStockValuation)}
          </p>
          <span className="mt-0.5 block text-xs text-muted">Valuasi harga jual</span>
        </div>

        <div className="rounded-2xl border border-border bg-warm-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Stok Menipis</span>
            <AlertTriangle size={14} className="text-status-warning" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xl font-bold text-status-warning sm:text-2xl">{lowStock.length}</p>
          <span className="mt-0.5 block text-xs text-muted">Perlu restock segera</span>
        </div>

        <div className="rounded-2xl border border-border bg-warm-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Stok Habis (OOS)</span>
            <AlertCircle size={14} className="text-status-critical" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xl font-bold text-status-critical sm:text-2xl">{outOfStock.length}</p>
          <span className="mt-0.5 block text-xs text-muted">Listing dinonaktifkan</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/products"
          className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-warm-white px-4 text-xs font-medium text-ink transition-colors hover:bg-soft-sand"
        >
          Semua Produk
        </Link>
        <Link
          href="/products/categories"
          className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-warm-white px-4 text-xs font-medium text-ink transition-colors hover:bg-soft-sand"
        >
          Kategori
        </Link>
        <Link
          href="/products/inventory"
          className="inline-flex h-8 items-center justify-center rounded-full bg-deep-pine px-4 text-xs font-semibold text-warm-white shadow-xs"
        >
          Ringkasan Inventori
        </Link>
      </div>

      {/* Section Alert: Stok Habis */}
      {outOfStock.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-status-critical/10 text-status-critical font-bold text-xs">
              !
            </span>
            <h2 className="text-sm font-bold text-ink sm:text-base">
              Perlu Restock Segera — Stok Habis ({outOfStock.length})
            </h2>
          </div>
          <ProductTable products={outOfStock} />
        </section>
      )}

      {/* Section Alert: Stok Menipis */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-status-warning/10 text-status-warning font-bold text-xs">
            ▲
          </span>
          <h2 className="text-sm font-bold text-ink sm:text-base">
            Mendekati Batas Minimum — Stok Rendah ({lowStock.length})
          </h2>
        </div>
        <ProductTable products={lowStock} />
      </section>
    </div>
  );
}
