import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import {
  getAllCategories,
  getFeaturedProducts,
  getNewProducts,
  getBestSellerProducts,
} from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/layout/SectionHeading";

/**
 * Homepage — PRD §11 HOME-01 s/d HOME-10, Fase 2 (Discovery).
 * Arah layout: Zalora/Lancôme (grid kategori bersih, satu CTA per
 * section, banyak whitespace) — BUKAN gaya marketplace padat
 * (AliExpress/Flipkart/OLX), sesuai instruksi pemilik proyek 16 Agustus
 * 2026. Lihat PROTOTYPE_STOREFRONT_PWA_README.md untuk rasionalnya.
 *
 * Data produk membaca Convex kalau sudah di-setup (lib/data/products.ts),
 * fallback ke mock kalau belum — lihat komentar header file itu.
 */
// Halaman ini membaca data milik tenant, dan tenant baru diketahui saat
// permintaan masuk. Tidak ada yang bisa di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, newArrivals, bestSellers] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(8),
    getNewProducts(4),
    getBestSellerProducts(4),
  ]);

  return (
    <div className="flex flex-col gap-14 pb-16 pt-6 md:gap-20 md:pt-10">
      {/* HOME-01 Hero */}
      <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
        <div className="relative overflow-hidden rounded-(--radius-card) bg-deep-pine">
          <div className="absolute inset-0">
            <Image
              src="/images/misc/hero-home.jpg"
              alt=""
              fill
              priority
              className="object-cover opacity-40"
            />
          </div>
          <div className="relative flex flex-col items-start gap-4 px-6 py-16 md:px-14 md:py-24">
            <span className="rounded-full bg-accent-cyan/90 px-3 py-1 text-xs font-semibold text-deep-pine">
              Koleksi Baru
            </span>
            <h1 className="max-w-md text-3xl font-semibold text-warm-white md:text-5xl">
              Fashion sehari-hari, tanpa ribet.
            </h1>
            <p className="max-w-sm text-sm text-soft-sage md:text-base">
              Belanja cepat, transparan, dan terpercaya — koleksi wanita, pria,
              sepatu, tas, dan aksesoris dalam satu tempat.
            </p>
            <Link
              href="/category"
              className="tap-target mt-2 inline-flex items-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
            >
              Belanja Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* HOME-02/03 Kategori */}
      <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
        <SectionHeading title="Belanja per Kategori" href="/category" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2 text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-(--radius-card) bg-soft-sand">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-medium text-ink md:text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOME-04 Produk unggulan */}
      <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
        <SectionHeading title="Rekomendasi Untuk Anda" href="/category" />
        <ProductGrid products={featured} />
      </section>

      {/* Promo banner tunggal — satu CTA, bukan banner bertumpuk */}
      <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
        <div className="flex flex-col items-start gap-3 rounded-(--radius-card) bg-terracotta-soft px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <h2 className="text-xl font-semibold text-deep-pine md:text-2xl">
              Diskon hingga 30% untuk item pilihan
            </h2>
            <p className="mt-1 text-sm text-ink/80">
              Berlaku untuk koleksi bertanda Sale, selama stok masih ada.
            </p>
          </div>
          <Link
            href="/promo"
            className="tap-target inline-flex shrink-0 items-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
          >
            Lihat Promo
          </Link>
        </div>
      </section>

      {/* HOME-05 Baru tiba */}
      {newArrivals.length > 0 && (
        <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
          <SectionHeading title="Baru Tiba" href="/category?sort=terbaru" />
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {/* Best seller */}
      {bestSellers.length > 0 && (
        <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
          <SectionHeading title="Paling Laris" href="/category?sort=terlaris" />
          <ProductGrid products={bestSellers} />
        </section>
      )}

      {/* Trust badges */}
      <section className="mx-auto w-full max-w-(--container-content) px-4 md:px-6">
        <div className="grid grid-cols-2 gap-6 rounded-(--radius-card) border border-border px-6 py-8 md:grid-cols-4 md:px-10">
          {[
            { icon: Truck, label: "Pengiriman ke seluruh Indonesia" },
            { icon: ShieldCheck, label: "Pembayaran aman" },
            { icon: RotateCcw, label: "Retur mudah 7 hari" },
            { icon: Headphones, label: "Layanan pelanggan responsif" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon size={26} strokeWidth={1.6} className="text-deep-pine" aria-hidden="true" />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
