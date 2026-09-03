import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductEditorForm } from "@/components/products/ProductEditorForm";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function NewProductPage() {
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
          Tambah Produk Baru
        </h1>
        <p className="mt-0.5 text-xs text-muted sm:text-sm">
          Buat listing produk baru untuk Web Storefront dan Shopee OpenAPI v2.
        </p>
      </div>

      <SampleDataBanner note="Produk baru akan disimulasikan dan diselaraskan ke dalam ekosistem katalog multi-channel Karyalo." />

      <ProductEditorForm isNew />
    </div>
  );
}
