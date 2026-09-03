"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  LayoutTemplate,
  Megaphone,
  Users,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { useSession, CapabilitySet } from "@/lib/auth/session-context";

interface FeatureModule {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  badge: string;
  color: string;
  capability?: keyof CapabilitySet;
  links: { label: string; href: string; capability?: keyof CapabilitySet }[];
}

const FEATURE_MODULES: FeatureModule[] = [
  {
    title: "Katalog & Varian Produk",
    desc: "Kelola 18 produk fesyen, varian ukuran/warna, dan matriks stok.",
    icon: Package,
    href: "/products",
    badge: "18 SKU",
    color: "text-karyalo-green bg-karyalo-green/10",
    capability: "catalogWrite",
    links: [
      { label: "Semua Produk", href: "/products" },
      { label: "Kategori", href: "/products/categories" },
      { label: "Inventori Stok", href: "/products/inventory" },
    ],
  },
  {
    title: "Manajemen Pesanan (OMS)",
    desc: "Pantau pesanan masuk dari Storefront PWA dan Shopee Marketplace.",
    icon: ShoppingBag,
    href: "/orders",
    badge: "Multi-Channel",
    color: "text-deep-pine bg-deep-pine/10",
    capability: "orderRead",
    links: [
      { label: "Semua Order", href: "/orders" },
      { label: "Pesanan Webstore", href: "/orders/webstore" },
      { label: "Pesanan Shopee", href: "/orders/shopee" },
      { label: "Fulfillment & Resi", href: "/orders/fulfillment", capability: "orderProcess" },
    ],
  },
  {
    title: "Web Storefront Builder & CMS",
    desc: "Kustomisasi tampilan homepage, banner promo, tema, dan navigasi.",
    icon: LayoutTemplate,
    href: "/storefront",
    badge: "Web PWA",
    color: "text-ink bg-soft-sand",
    capability: "cmsWrite",
    links: [
      { label: "Homepage", href: "/storefront/homepage" },
      { label: "Banner", href: "/storefront/banners" },
      { label: "Halaman", href: "/storefront/pages" },
    ],
  },
  {
    title: "Integrasi Shopee Open Platform",
    desc: "Sinkronisasi OpenAPI v2 (v2.product, v2.order, dan v2.logistics).",
    icon: ShoppingBag,
    href: "/settings/integrations/shopee",
    badge: "OpenAPI v2",
    color: "text-[#ee4d2d] bg-[#ee4d2d]/10",
    capability: "teamRoleManage",
    links: [
      { label: "Status Koneksi", href: "/settings/integrations/shopee" },
      { label: "Pesanan Shopee", href: "/orders/shopee" },
    ],
  },
  {
    title: "Promosi & Marketing",
    desc: "Atur diskon harga coret, flash sale, dan voucher belanja.",
    icon: Megaphone,
    href: "/marketing/promotions",
    badge: "Promosi",
    color: "text-status-warning bg-status-warning/10",
    capability: "promotionWrite",
    links: [
      { label: "Voucher & Promo", href: "/marketing/promotions" },
      { label: "Kampanye", href: "/marketing/campaigns" },
    ],
  },
  {
    title: "Database Pelanggan (CRM)",
    desc: "Daftar pembeli setia, riwayat transaksi, dan loyalitas pelanggan.",
    icon: Users,
    href: "/customers",
    badge: "Pelanggan",
    color: "text-ink bg-soft-sand",
    capability: "customerPii",
    links: [{ label: "Semua Pelanggan", href: "/customers" }],
  },
  {
    title: "Laporan & Analytics",
    desc: "Grafik omzet penjualan, produk terlaris, dan performa kanal toko.",
    icon: BarChart3,
    href: "/analytics",
    badge: "Laporan",
    color: "text-karyalo-green bg-soft-sage",
    capability: "analyticsExport",
    links: [{ label: "Ikhtisar Penjualan", href: "/analytics" }],
  },
  {
    title: "Pusat Notifikasi & Push",
    desc: "Notifikasi real-time pesanan baru via Web Push Notification.",
    icon: Bell,
    href: "/notifications",
    badge: "Live Alert",
    color: "text-deep-pine bg-soft-sand",
    links: [{ label: "Riwayat Notifikasi", href: "/notifications" }],
  },
  {
    title: "Pengaturan Toko & Logistik",
    desc: "Konfigurasi kurir pengiriman, profil toko, dan operasional.",
    icon: Settings,
    href: "/settings/store",
    badge: "Sistem",
    color: "text-muted bg-soft-sand",
    links: [
      { label: "Profil Toko", href: "/settings/store" },
      { label: "Kurir & Ongkir", href: "/settings/shipping" },
      { label: "Role Tim", href: "/settings/roles", capability: "teamRoleManage" },
    ],
  },
];

export function FeatureModulesGrid() {
  const { capabilities } = useSession();

  // Filter modul fitur: hanya render modul yang diizinkan untuk role saat ini
  const visibleModules = FEATURE_MODULES.filter(
    (mod) => !mod.capability || (capabilities && capabilities[mod.capability])
  );

  return (
    <section aria-labelledby="heading-all-modules" className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <h2 id="heading-all-modules" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Modul Operasional Aktif ({visibleModules.length} Modul)
        </h2>
        <span className="text-xs text-karyalo-green font-medium">
          Disesuaikan dengan Hak Akses Role
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
        {visibleModules.map((item) => {
          const visibleLinks = item.links.filter(
            (link) => !link.capability || (capabilities && capabilities[link.capability])
          );

          return (
            <div
              key={item.title}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-warm-white p-4 shadow-xs transition-all hover:border-karyalo-green/40 hover:shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex size-9 items-center justify-center rounded-xl ${item.color}`}>
                      <item.icon size={18} aria-hidden="true" />
                    </div>
                    <div>
                      <Link
                        href={item.href}
                        className="font-bold text-xs text-ink group-hover:text-karyalo-green transition-colors flex items-center gap-1"
                      >
                        <span>{item.title}</span>
                        <ChevronRight
                          size={13}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </Link>
                    </div>
                  </div>
                  <span className="rounded-full bg-soft-sand px-2 py-0.5 text-xs font-semibold text-muted">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-2.5 text-xs text-muted leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="tap-target rounded-lg bg-soft-sand/60 px-2 py-1 text-xs font-medium text-ink hover:bg-soft-sage hover:text-karyalo-green transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
