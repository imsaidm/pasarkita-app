import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getCategoryBySlug, getAllProducts } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { Metadata } from "next";

// dynamicParams default true — produk yang tidak masuk daftar build-time
// ini tetap bisa diakses on-demand, lihat catatan sama di category/[slug].
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? product.name : "Produk tidak ditemukan" };
}

/**
 * PDP-01..18. Bagian interaktif ada di components/product/ProductDetail.tsx
 * (client component) — halaman ini sendiri tetap server component supaya
 * data produk/related products di-render di server.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getRelatedProducts(product, 4),
  ]);

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb
        items={[
          { label: category?.name ?? product.categorySlug, href: `/category/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <ProductDetail product={product} />

      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading title="Produk Serupa" />
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
