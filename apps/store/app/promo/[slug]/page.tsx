import { notFound } from "next/navigation";
import Image from "next/image";
import { getSaleProducts, getNewProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const PROMOS: Record<string, { title: string; description: string; image: string }> = {
  "diskon-koleksi-pilihan": {
    title: "Diskon hingga 30% Koleksi Pilihan",
    description: "Berlaku untuk item bertanda Sale, selama stok masih ada.",
    image: "/images/misc/promo-flash-sale.jpg",
  },
  "koleksi-baru-tiba": {
    title: "Koleksi Baru Tiba",
    description: "Produk-produk terbaru minggu ini.",
    image: "/images/misc/promo-new-arrival.jpg",
  },
};

export function generateStaticParams() {
  return Object.keys(PROMOS).map((slug) => ({ slug }));
}

export default async function PromoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promo = PROMOS[slug];
  if (!promo) notFound();

  const products = slug === "koleksi-baru-tiba" ? await getNewProducts(12) : await getSaleProducts(12);

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Promo", href: "/promo" }, { label: promo.title }]} />
      <div className="relative mb-6 aspect-[3/1] w-full overflow-hidden rounded-(--radius-card)">
        <Image src={promo.image} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <h1 className="mb-1 text-2xl font-semibold text-ink">{promo.title}</h1>
      <p className="mb-6 text-sm text-muted">{promo.description}</p>
      <ProductGrid products={products} />
    </div>
  );
}
