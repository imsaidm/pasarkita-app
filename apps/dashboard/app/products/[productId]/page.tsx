import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Globe, CheckCircle2 } from "lucide-react";
import { getProductById, getAllProducts } from "@/lib/data/catalog";
import { ProductEditorForm } from "@/components/products/ProductEditorForm";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";


// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) notFound();

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

      {/* Header Info */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              {product.name}
            </h1>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="mt-1 text-xs text-muted">
            SKU: <span className="font-mono font-medium text-ink">{product.sku}</span> • Terakhir diperbarui {product.updatedAtLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {product.channels.includes("shopee") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ee4d2d]/10 px-2.5 py-1 text-xs font-semibold text-[#ee4d2d]">
              <ShoppingBag size={12} aria-hidden="true" />
              <span>Shopee Synced</span>
            </span>
          )}
          {product.channels.includes("storefront") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-karyalo-green/10 px-2.5 py-1 text-xs font-semibold text-karyalo-green">
              <Globe size={12} aria-hidden="true" />
              <span>Web Store</span>
            </span>
          )}
        </div>
      </div>

      <SampleDataBanner note="Data katalog disinkronkan dengan Karyalo Storefront PWA dan simulasi Shopee OpenAPI v2." />

      <ProductEditorForm product={product} />
    </div>
  );
}
