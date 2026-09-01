import { notFound } from "next/navigation";
import { getNewProducts, getBestSellerProducts, getSaleProducts, getAllProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const COLLECTIONS: Record<string, { title: string; fetch: () => Promise<Awaited<ReturnType<typeof getAllProducts>>> }> = {
  "baru-tiba": { title: "Baru Tiba", fetch: () => getNewProducts(20) },
  terlaris: { title: "Paling Laris", fetch: () => getBestSellerProducts(20) },
  sale: { title: "Sedang Diskon", fetch: () => getSaleProducts(20) },
};

export function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

/**
 * §12 (varian koleksi kurasi, mis. "Baru Tiba"/"Terlaris"/"Sale") — beda
 * dari /category/[slug] yang berbasis kategori produk (Wanita/Pria/dst).
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = COLLECTIONS[slug];
  if (!collection) notFound();

  const products = await collection.fetch();

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: collection.title }]} />
      <h1 className="mb-1 text-2xl font-semibold text-ink">{collection.title}</h1>
      <p className="mb-6 text-sm text-muted">{products.length} produk</p>
      <ProductGrid products={products} />
    </div>
  );
}
