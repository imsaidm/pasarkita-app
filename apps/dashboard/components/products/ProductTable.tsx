"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminProduct } from "@/lib/data/catalog-types";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { formatRupiah } from "@/lib/utils/currency";
import {
  ChevronRight,
  Package,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Layers,
  ShoppingBag,
  Globe,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export function ProductTable({ products }: { products: AdminProduct[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "shopee" | "low_stock" | "draft">("all");

  const filteredProducts = products.filter((p) => {
    // Tab Filter
    if (activeTab === "shopee" && !p.channels.includes("shopee")) return false;
    if (activeTab === "low_stock" && p.stock > p.lowStockThreshold) return false;
    if (activeTab === "draft" && p.status !== "draft") return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCategory = p.categorySlug.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCategory) return false;
    }

    // Category Filter
    if (selectedCategory !== "all" && p.categorySlug !== selectedCategory) {
      return false;
    }

    // Channel Filter
    if (channelFilter !== "all") {
      if (channelFilter === "shopee" && !p.channels.includes("shopee")) return false;
      if (channelFilter === "storefront" && !p.channels.includes("storefront")) return false;
    }

    return true;
  });

  const categories = Array.from(new Set(products.map((p) => p.categorySlug)));

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Sub-Header / Quick Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-warm-white p-3 sm:p-4 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`tap-target inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-deep-pine text-warm-white shadow-xs"
                : "bg-soft-sand text-muted hover:bg-soft-sage hover:text-karyalo-green"
            }`}
          >
            <span>Semua Produk</span>
            <span className="rounded-full bg-warm-white/20 px-1.5 py-0.2 text-xs">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shopee")}
            className={`tap-target inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "shopee"
                ? "bg-[#ee4d2d] text-warm-white shadow-xs"
                : "bg-[#ee4d2d]/10 text-[#ee4d2d] hover:bg-[#ee4d2d]/20"
            }`}
          >
            <ShoppingBag size={12} aria-hidden="true" />
            <span>Shopee Sync</span>
            <span className="rounded-full bg-warm-white/20 px-1.5 py-0.2 text-xs">
              {products.filter((p) => p.channels.includes("shopee")).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("low_stock")}
            className={`tap-target inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "low_stock"
                ? "bg-status-warning text-warm-white shadow-xs"
                : "bg-terracotta-soft/60 text-status-warning hover:bg-terracotta-soft"
            }`}
          >
            <AlertTriangle size={12} aria-hidden="true" />
            <span>Stok Kritis / Habis</span>
            <span className="rounded-full bg-warm-white/20 px-1.5 py-0.2 text-xs">
              {products.filter((p) => p.stock <= p.lowStockThreshold).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("draft")}
            className={`tap-target inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "draft"
                ? "bg-muted text-warm-white shadow-xs"
                : "bg-soft-sand text-muted hover:bg-soft-sage hover:text-ink"
            }`}
          >
            <span>Draft</span>
            <span className="rounded-full bg-warm-white/20 px-1.5 py-0.2 text-xs">
              {products.filter((p) => p.status === "draft").length}
            </span>
          </button>
        </div>

        {/* Search & Select Controls */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk, SKU, atau kategori..."
              className="w-full rounded-xl border border-border bg-soft-sand/40 py-2 pl-9 pr-3 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:bg-warm-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="tap-target rounded-xl border border-border bg-warm-white px-3 py-2 text-xs font-medium text-ink focus:border-karyalo-green focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="tap-target rounded-xl border border-border bg-warm-white px-3 py-2 text-xs font-medium text-ink focus:border-karyalo-green focus:outline-none"
            >
              <option value="all">Semua Kanal</option>
              <option value="shopee">Shopee Only</option>
              <option value="storefront">Web Store Only</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-border bg-soft-sand p-10 text-center text-sm text-muted">
          <Package size={32} className="mx-auto mb-2 text-muted/60" aria-hidden="true" />
          <p className="font-semibold text-ink">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-xs text-muted">
            Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Vertical Card List (md:hidden) */}
          <div className="flex w-full min-w-0 max-w-full flex-col gap-3 md:hidden">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock === 0;
              const isLowStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
              const variantCount = p.variantMatrix.length;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group box-border flex w-full min-w-0 max-w-full flex-col gap-3 rounded-2xl border border-border bg-warm-white p-4 shadow-xs transition-all hover:border-karyalo-green/40 active:scale-[0.99]"
                >
                  {/* Top Row: Thumbnail + Title + SKU + Badges */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-soft-sand shadow-2xs">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="64px"
                      />
                      {p.badge && (
                        <span className="absolute left-1 top-1 rounded bg-deep-pine/90 px-1 py-0.5 text-xs font-bold text-warm-white">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <h3 className="font-bold text-sm text-ink leading-snug line-clamp-2 transition-colors group-hover:text-karyalo-green">
                        {p.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 min-w-0">
                        <span className="rounded bg-soft-sand px-1.5 py-0.5 font-mono text-xs font-medium text-muted">
                          {p.sku}
                        </span>
                        <span className="text-xs text-muted capitalize truncate">
                          {p.categorySlug}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <Layers size={11} aria-hidden="true" />
                          <span>{variantCount > 1 ? `${variantCount} varian` : "Single SKU"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Channels & Sync Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      {p.channels.includes("shopee") && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#ee4d2d]/10 px-1.5 py-0.5 text-xs font-semibold text-[#ee4d2d]">
                          <ShoppingBag size={10} aria-hidden="true" />
                          <span>Shopee</span>
                        </span>
                      )}
                      {p.channels.includes("storefront") && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-karyalo-green/10 px-1.5 py-0.5 text-xs font-semibold text-karyalo-green">
                          <Globe size={10} aria-hidden="true" />
                          <span>Web</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {p.shopeeSyncStatus === "synced" ? (
                        <span className="inline-flex items-center gap-1 font-medium text-status-success">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          <span>Sync OK</span>
                        </span>
                      ) : p.shopeeSyncStatus === "pending" ? (
                        <span className="inline-flex items-center gap-1 font-medium text-status-warning">
                          <Clock size={12} aria-hidden="true" />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="text-muted">Unlinked</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Status, Price & Stock */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <ProductStatusBadge status={p.status} />
                      {isOutOfStock ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-critical/10 px-2.5 py-0.5 text-xs font-semibold text-status-critical">
                          <AlertTriangle size={11} aria-hidden="true" />
                          Stok Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-warning/10 px-2.5 py-0.5 text-xs font-semibold text-status-warning">
                          <AlertTriangle size={11} aria-hidden="true" />
                          Sisa {p.stock}
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-soft-sand px-2.5 py-0.5 text-xs font-medium text-ink">
                          <Package size={11} className="text-muted" aria-hidden="true" />
                          Stok {p.stock}
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div className="text-right">
                        <span className="text-sm font-bold tracking-tight text-ink">
                          {formatRupiah(p.price)}
                        </span>
                        {p.compareAtPrice && (
                          <span className="block text-xs text-muted line-through">
                            {formatRupiah(p.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex size-6 items-center justify-center rounded-full bg-soft-sand text-muted transition-colors group-hover:bg-soft-sage group-hover:text-karyalo-green">
                        <ChevronRight size={14} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-warm-white shadow-xs md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-soft-sand text-xs font-semibold text-muted">
                  <tr>
                    <th className="px-4 py-3.5">Produk</th>
                    <th className="px-4 py-3.5">SKU / Varian</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5">Kanal Penjualan</th>
                    <th className="px-4 py-3.5">Shopee Sync</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Harga</th>
                    <th className="px-4 py-3.5 text-right">Total Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((p) => {
                    const variantCount = p.variantMatrix.length;

                    return (
                      <tr key={p.id} className="transition-colors hover:bg-soft-sand/50">
                        <td className="px-4 py-3.5">
                          <Link href={`/products/${p.id}`} className="flex items-center gap-3 group">
                            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-soft-sand">
                              <Image
                                src={p.image}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-ink group-hover:text-karyalo-green group-hover:underline block truncate max-w-[220px]">
                                {p.name}
                              </span>
                              {p.badge && (
                                <span className="inline-block rounded bg-soft-sand px-1.5 py-0.2 text-xs font-semibold text-karyalo-green">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-medium text-ink">{p.sku}</span>
                            <span className="text-xs text-muted">
                              {variantCount > 1 ? `${variantCount} sub-varian` : "1 SKU Standar"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted capitalize">{p.categorySlug}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {p.channels.includes("shopee") && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#ee4d2d]/10 px-2 py-0.5 text-xs font-semibold text-[#ee4d2d]">
                                <ShoppingBag size={11} aria-hidden="true" />
                                Shopee
                              </span>
                            )}
                            {p.channels.includes("storefront") && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-karyalo-green/10 px-2 py-0.5 text-xs font-semibold text-karyalo-green">
                                <Globe size={11} aria-hidden="true" />
                                Web
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {p.shopeeSyncStatus === "synced" ? (
                            <div className="flex items-center gap-1 text-xs font-medium text-status-success">
                              <CheckCircle2 size={13} aria-hidden="true" />
                              <span>Tersinkron</span>
                            </div>
                          ) : p.shopeeSyncStatus === "pending" ? (
                            <div className="flex items-center gap-1 text-xs font-medium text-status-warning">
                              <Clock size={13} aria-hidden="true" />
                              <span>Menunggu Sync</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <ProductStatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-ink">
                          {formatRupiah(p.price)}
                          {p.compareAtPrice && (
                            <span className="block text-xs font-normal text-muted line-through">
                              {formatRupiah(p.compareAtPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold text-xs ${
                              p.stock === 0
                                ? "bg-status-critical/10 text-status-critical"
                                : p.stock <= p.lowStockThreshold
                                ? "bg-status-warning/10 text-status-warning"
                                : "text-ink"
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
