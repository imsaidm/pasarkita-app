import Link from "next/link";
import Image from "next/image";

/**
 * §28 Promotions — daftar kampanye. Data mock (2 kampanye contoh);
 * detail tiap kampanye ada di /promo/[slug].
 */
const PROMOS = [
  {
    slug: "diskon-koleksi-pilihan",
    title: "Diskon hingga 30% Koleksi Pilihan",
    description: "Berlaku untuk item bertanda Sale, selama stok masih ada.",
    image: "/images/misc/promo-flash-sale.jpg",
  },
  {
    slug: "koleksi-baru-tiba",
    title: "Koleksi Baru Tiba",
    description: "Produk-produk terbaru minggu ini.",
    image: "/images/misc/promo-new-arrival.jpg",
  },
];

export default function PromoPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Promo</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {PROMOS.map((promo) => (
          <Link
            key={promo.slug}
            href={`/promo/${promo.slug}`}
            className="group overflow-hidden rounded-(--radius-card) border border-border"
          >
            <div className="relative aspect-[2/1] w-full">
              <Image
                src={promo.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-ink">{promo.title}</h2>
              <p className="mt-1 text-sm text-muted">{promo.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
