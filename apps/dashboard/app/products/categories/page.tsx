import Link from "next/link";
import { ArrowLeft, Layers, Tag } from "lucide-react";
import { getCategories } from "@/lib/data/catalog";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke Katalog Produk</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Kategori Produk
        </h1>
        <p className="mt-0.5 text-xs text-muted sm:text-sm">
          Kategori storefront dan mapping taksonomi Shopee Category.
        </p>
      </div>

      <SampleDataBanner note="Kategori selaras dengan navigasi Karyalo Storefront PWA (Wanita, Pria, Sepatu, Tas, Aksesoris)." />

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
          className="inline-flex h-8 items-center justify-center rounded-full bg-deep-pine px-4 text-xs font-semibold text-warm-white shadow-xs"
        >
          Kategori
        </Link>
        <Link
          href="/products/inventory"
          className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-warm-white px-4 text-xs font-medium text-ink transition-colors hover:bg-soft-sand"
        >
          Ringkasan Inventori
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-warm-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-soft-sand text-xs font-semibold text-muted">
            <tr>
              <th className="px-4 py-3.5">Kategori</th>
              <th className="px-4 py-3.5">Slug URL</th>
              <th className="px-4 py-3.5 text-right">Jumlah Produk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.slug} className="hover:bg-soft-sand/40 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-ink flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-soft-sand text-karyalo-green">
                    <Tag size={13} aria-hidden="true" />
                  </div>
                  <span>{c.name}</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted">/{c.slug}</td>
                <td className="px-4 py-3.5 text-right font-bold text-ink">
                  {c.productCount} item
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
