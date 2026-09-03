"use client";

import Link from "next/link";
import {
  PackagePlus,
  Megaphone,
  LayoutTemplate,
  ShoppingBag,
  ImagePlus,
  ArrowUpRight,
  Truck,
  Boxes,
  PackageCheck,
  Users,
  BarChart3,
} from "lucide-react";
import { useSession } from "@/lib/auth/session-context";

/**
 * Pintasan Cepat Aksi Harian — Beradaptasi Secara Dinamis Mengikuti Role Aktif.
 */
export function QuickActions() {
  const { role } = useSession();

  const getActionsForRole = () => {
    switch (role) {
      case "AdminWarehouse":
        return [
          {
            href: "/orders/fulfillment",
            label: "Fulfillment & Packing",
            description: "Proses pesanan siap kirim",
            icon: PackageCheck,
          },
          {
            href: "/orders/fulfillment",
            label: "Input Resi Pengiriman",
            description: "Resi SPX, J&T, SiCepat",
            icon: Truck,
          },
          {
            href: "/products/inventory",
            label: "Inventori & Stok Fisik",
            description: "Update stok gudang & SKU",
            icon: Boxes,
          },
          {
            href: "/orders",
            label: "Daftar Semua Pesanan",
            description: "Monitoring status order",
            icon: ShoppingBag,
          },
        ];

      case "AdminDashboard":
        return [
          {
            href: "/products/new",
            label: "Tambah Produk Baru",
            description: "Input master SKU & foto",
            icon: PackagePlus,
          },
          {
            href: "/marketing/promotions",
            label: "Buat Promosi Diskon",
            description: "Atur voucher & sale",
            icon: Megaphone,
          },
          {
            href: "/storefront/homepage",
            label: "Edit Storefront CMS",
            description: "Kustomisasi layout web",
            icon: LayoutTemplate,
          },
          {
            href: "/orders",
            label: "Pantau Pesanan Masuk",
            description: "Webstore & Shopee",
            icon: ShoppingBag,
          },
          {
            href: "/storefront/media",
            label: "Upload Media & Banner",
            description: "Kelola aset gambar 1:1",
            icon: ImagePlus,
          },
        ];

      case "Owner":
      default:
        return [
          {
            href: "/products/new",
            label: "Tambah Produk Baru",
            description: "Input SKU & multi-varian",
            icon: PackagePlus,
          },
          {
            href: "/settings/integrations/shopee",
            label: "Integrasi Shopee OpenAPI",
            description: "Status v2.product & order",
            icon: ShoppingBag,
          },
          {
            href: "/marketing/promotions",
            label: "Buat Promosi Diskon",
            description: "Voucher harga coret",
            icon: Megaphone,
          },
          {
            href: "/settings/team",
            label: "Kelola Tim & Staf",
            description: "Hak akses & undang staf",
            icon: Users,
          },
          {
            href: "/analytics",
            label: "Laporan Omzet Bisnis",
            description: "Analisis performa penjualan",
            icon: BarChart3,
          },
        ];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {actions.map((action) => (
        <Link
          key={action.href + action.label}
          href={action.href}
          className="group tap-target flex min-w-0 flex-col justify-between rounded-2xl border border-border bg-warm-white p-4 shadow-xs transition-all duration-150 motion-reduce:transition-none hover:border-karyalo-green/40 hover:bg-soft-sage/20 hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green active:scale-[0.98]"
          aria-label={`Pintasan Cepat: ${action.label} — ${action.description}`}
        >
          <div className="flex items-center justify-between">
            <div
              className="flex size-9 items-center justify-center rounded-xl bg-soft-sand text-karyalo-green transition-colors group-hover:bg-karyalo-green group-hover:text-warm-white"
              aria-hidden="true"
            >
              <action.icon size={18} />
            </div>
            <ArrowUpRight
              size={14}
              className="text-muted/40 transition-colors group-hover:text-karyalo-green"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 min-w-0 text-left">
            <span className="block truncate text-xs font-bold text-ink transition-colors group-hover:text-karyalo-green">
              {action.label}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted">
              {action.description}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
