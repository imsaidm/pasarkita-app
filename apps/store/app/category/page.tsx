import Link from "next/link";
import { getAllCategories, getAllProducts, Product } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * PLP-01..05 — semua produk (bukan per-kategori, itu ada di
 * /category/[slug]/page.tsx). Berfungsi juga sebagai halaman tujuan CTA
 * "Belanja Sekarang" dan link "Lihat semua" dari Homepage.
 *
 * Sort disederhanakan sengaja (query param, server-rendered, tanpa client
 * JS tambahan) — sesuai arahan pemilik proyek: mudah dipahami orang awam,
 * bukan filter kompleks ala marketplace besar.
 */
function sortProducts(products: Product[], sort?: string): Product[] {
  if (sort === "terbaru") {
    return [...products].filter((p) => p.badge === "Baru").concat(
      products.filter((p) => p.badge !== "Baru")
    );
  }
  if (sort === "terlaris") {
    return [...products].filter((p) => p.badge === "Terlaris").concat(
      products.filter((p) => p.badge !== "Terlaris")
    );
  }
  if (sort === "harga-terendah") {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sort === "harga-tertinggi") {
    return [...products].sort((a, b) => b.price - a.price);
  }
  return products;
}

const SORT_OPTIONS = [
  { value: "", label: "Rekomendasi" },
  { value: "terbaru", label: "Terbaru" },
  { value: "terlaris", label: "Terlaris" },
  { value: "harga-terendah", label: "Harga Terendah" },
  { value: "harga-tertinggi", label: "Harga Tertinggi" },
];

export default async function CategoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const [allProducts, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const products = sortProducts(allProducts, sort);

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Semua Produk" }]} />
      <h1 className="mb-4 text-2xl font-semibold text-ink">Semua Produk</h1>

      {/* Chip kategori cepat */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="rounded-full border border-border px-4 py-2 text-sm text-ink hover:border-deep-pine hover:text-deep-pine"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/category?sort=${opt.value}` : "/category"}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
              (sort ?? "") === opt.value
                ? "bg-deep-pine text-warm-white"
                : "bg-soft-sand text-ink hover:bg-soft-sage"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">{products.length} produk</p>
      <ProductGrid products={products} />
    </div>
  );
}
