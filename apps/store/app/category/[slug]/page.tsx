import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategory, getAllCategories } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * PLP-01..05 — produk dalam satu kategori. PRD §12.
 * `dynamicParams` default Next.js adalah true, jadi kategori yang tidak
 * masuk daftar di bawah (mis. ditambah langsung di Convex tanpa rebuild)
 * tetap bisa diakses on-demand, bukan 404 — daftar ini cuma hint build-time.
 */

// Katalog dan pesanan milik tenant, dan tenant baru diketahui saat
// permintaan masuk. Tidak ada yang bisa di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Semua Produk", href: "/category" }, { label: category.name }]} />
      <h1 className="mb-1 text-2xl font-semibold text-ink">{category.name}</h1>
      <p className="mb-6 text-sm text-muted">{products.length} produk</p>
      <ProductGrid products={products} />
    </div>
  );
}
