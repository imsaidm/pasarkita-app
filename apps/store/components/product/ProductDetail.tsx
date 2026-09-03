"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, ShoppingBag, Check, Truck, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/data/products";
import { formatRupiah, discountPercent } from "@/lib/utils/currency";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { RatingStars } from "./RatingStars";

/**
 * PDP-01..18 — bagian interaktif Product Detail Page: galeri, pemilihan
 * varian, kuantitas, add-to-cart, wishlist toggle.
 */
export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle, hydrated } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((v) => [v.name, v.options[0]]))
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const wished = hydrated && has(product.id);

  const variantId = useMemo(() => {
    if (product.variants.length === 0) return "default";
    return product.variants.map((v) => selected[v.name]).join("|");
  }, [product.variants, selected]);

  const variantLabel = useMemo(() => {
    if (product.variants.length === 0) return "";
    return product.variants.map((v) => selected[v.name]).join(" / ");
  }, [product.variants, selected]);

  function handleAddToCart() {
    addItem({
      productId: product.id,
      skuId: product.skuId,
      variantId,
      name: product.name,
      variantLabel,
      unitPrice: product.price,
      quantity,
      imageUrl: product.images[0] ?? null,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      {/* Galeri Foto */}
      <div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-soft-sand shadow-2xs">
          <Image
            src={product.images[activeImage] ?? product.images[0]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-3.5 top-3.5 rounded-full bg-terracotta px-3.5 py-1 text-xs font-semibold text-warm-white shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="mt-3.5 flex items-center gap-2.5 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Lihat foto produk ${i + 1}`}
                className={`group relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  activeImage === i
                    ? "border-deep-pine ring-2 ring-deep-pine/20 ring-offset-1 scale-102"
                    : "border-transparent opacity-75 hover:opacity-100 hover:border-border"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info, Varian & Aksi Belanja */}
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-karyalo-green">
            {product.categorySlug}
          </span>
          <h1 className="mt-1 text-xl font-bold text-ink md:text-2xl">{product.name}</h1>
          <div className="mt-2.5">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={16} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-deep-pine">
            {formatRupiah(product.price)}
          </span>
          {product.compareAtPrice && (
            <>
              <span className="text-sm text-muted line-through">
                {formatRupiah(product.compareAtPrice)}
              </span>
              {discount && (
                <span className="rounded-full bg-terracotta-soft px-2.5 py-0.5 text-xs font-bold text-terracotta">
                  Hemat {discount}%
                </span>
              )}
            </>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted">{product.shortDescription}</p>

        {/* Pemilihan Varian */}
        {product.variants.map((group) => (
          <div key={group.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">
                Pilih {group.name}: <span className="font-bold text-deep-pine">{selected[group.name]}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isSelected = selected[group.name] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [group.name]: opt }))}
                    aria-pressed={isSelected}
                    className={`tap-target inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? "border-deep-pine bg-deep-pine text-warm-white shadow-xs"
                        : "border-border bg-warm-white text-ink hover:border-deep-pine hover:bg-soft-sand"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Kuantitas & Info Stok */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-ink">Jumlah Pembelian</span>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-warm-white shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Kurangi jumlah barang"
                className="tap-target inline-flex size-9 items-center justify-center rounded-l-full text-ink transition-colors hover:bg-soft-sand active:scale-90"
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <span className="w-9 text-center text-xs font-bold text-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                aria-label="Tambah jumlah barang"
                className="tap-target inline-flex size-9 items-center justify-center rounded-r-full text-ink transition-colors hover:bg-soft-sand active:scale-90"
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
            <span className="text-xs text-muted">
              Sisa stok: <strong className="text-ink">{product.stock}</strong> pcs
            </span>
          </div>
        </div>

        {/* Aksi Tambah ke Keranjang & Wishlist */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`tap-target flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold text-warm-white shadow-sm transition-all duration-200 active:scale-98 ${
              justAdded
                ? "bg-karyalo-green scale-101 ring-2 ring-karyalo-green/40"
                : "bg-deep-pine hover:bg-karyalo-green"
            }`}
          >
            {justAdded ? (
              <>
                <Check size={16} className="text-warm-white transition-transform duration-200 scale-110" aria-hidden="true" />
                <span>Berhasil Ditambahkan!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} aria-hidden="true" />
                <span>Tambah ke Keranjang</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggle(product.id)}
            aria-label={wished ? "Hapus dari wishlist" : "Tambah ke wishlist"}
            aria-pressed={wished}
            className={`tap-target inline-flex size-12 items-center justify-center rounded-full border border-border bg-warm-white transition-all duration-200 active:scale-90 hover:border-deep-pine ${
              wished ? "border-terracotta bg-terracotta-soft/30" : ""
            }`}
          >
            <Heart
              size={18}
              strokeWidth={1.8}
              fill={wished ? "#A5482D" : "none"}
              color={wished ? "#A5482D" : "currentColor"}
              className="transition-transform duration-200"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Trust Badges & Logistics */}
        <div className="mt-1 flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-soft-sand/50 p-3 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Truck size={14} className="text-karyalo-green shrink-0" aria-hidden="true" />
            <span>Pengiriman Cepat (SPX, J&T, JNE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-karyalo-green shrink-0" aria-hidden="true" />
            <span>Garansi Produk Original 100%</span>
          </div>
        </div>

        {/* Detail Bahan & Deskripsi */}
        <div className="mt-3 border-t border-border pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink">
            Deskripsi & Spesifikasi Produk
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted">
            {product.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span>SKU: <strong className="font-mono text-ink">{product.sku}</strong></span>
            <span>Kategori: <strong className="capitalize text-ink">{product.categorySlug}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
