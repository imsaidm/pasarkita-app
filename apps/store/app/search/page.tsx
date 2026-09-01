import { searchProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchEntry } from "@/components/layout/SearchEntry";

/**
 * SEARCH-01/02 — hasil pencarian. Pencarian mock: cocok substring pada
 * nama/kategori/deskripsi singkat (lib/data/products.ts#searchProducts).
 * TODO integrasi: ganti ke full-text search Convex begitu backend ada.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <div className="mb-6 max-w-md">
        <SearchEntry variant="bar" />
      </div>

      {query ? (
        <>
          <h1 className="mb-1 text-xl font-semibold text-ink">
            Hasil untuk &ldquo;{query}&rdquo;
          </h1>
          <p className="mb-6 text-sm text-muted">{results.length} produk ditemukan</p>
          <ProductGrid products={results} />
        </>
      ) : (
        <p className="py-10 text-center text-sm text-muted">
          Ketik kata kunci untuk mencari produk — nama, kategori, atau deskripsi singkat.
        </p>
      )}
    </div>
  );
}
