import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LayoutTemplate,
  Megaphone,
  Users,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";
import type { CapabilitySet } from "@/lib/auth/session-context";

/**
 * Struktur Navigasi Operasional Toko — Berbasis Role & Capability UMKM.
 */

export interface NavChild {
  href: string;
  label: string;
  phaseLabel: string;
  capability?: keyof CapabilitySet;
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  phaseLabel: string;
  capability?: keyof CapabilitySet;
  children?: NavChild[];
}

export const PRIMARY_NAV: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: LayoutDashboard,
    phaseLabel: "Fase 1 — Foundation",
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ShoppingBag,
    phaseLabel: "Fase 4 — OMS Operations",
    capability: "orderRead",
    children: [
      { href: "/orders", label: "Semua Order", phaseLabel: "Fase 4 — OMS Operations" },
      { href: "/orders/webstore", label: "Pesanan Webstore", phaseLabel: "Web Storefront PWA" },
      { href: "/orders/shopee", label: "Pesanan Shopee", phaseLabel: "Shopee Open Platform API" },
      { href: "/orders/action-required", label: "Perlu Tindakan", phaseLabel: "Fase 4 — OMS Operations" },
      { href: "/orders/payment-issues", label: "Masalah Pembayaran", phaseLabel: "Fase 4 — OMS Operations" },
      { href: "/orders/fulfillment", label: "Fulfillment & Resi", phaseLabel: "Fase 4 — OMS Operations", capability: "orderProcess" },
      { href: "/orders/returns", label: "Retur / Refund", phaseLabel: "Fase 4 — OMS Operations", capability: "cancelRefundRequest" },
    ],
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
    phaseLabel: "Fase 3 — Catalog & Marketing",
    capability: "catalogWrite",
    children: [
      { href: "/products", label: "Semua Produk", phaseLabel: "Fase 3 — Catalog & Marketing" },
      { href: "/products/categories", label: "Kategori", phaseLabel: "Fase 3 — Catalog & Marketing" },
      { href: "/products/collections", label: "Koleksi", phaseLabel: "Fase 3 — Catalog & Marketing" },
      { href: "/products/inventory", label: "Ringkasan Inventori", phaseLabel: "Fase 3 — Catalog & Marketing" },
    ],
  },
  {
    href: "/storefront",
    label: "Storefront",
    icon: LayoutTemplate,
    phaseLabel: "Fase 2 — CMS & Media",
    capability: "cmsWrite",
    children: [
      { href: "/storefront", label: "Ringkasan", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/homepage", label: "Homepage", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/banners", label: "Banner", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/pages", label: "Halaman", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/navigation", label: "Navigasi", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/media", label: "Media", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/theme", label: "Tema", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/seo", label: "SEO", phaseLabel: "Fase 2 — CMS & Media" },
      { href: "/storefront/preview", label: "Preview", phaseLabel: "Fase 2 — CMS & Media" },
    ],
  },
];

export const MENU_NAV: NavItem[] = [
  {
    href: "/marketing",
    label: "Marketing",
    icon: Megaphone,
    phaseLabel: "Fase 3 — Catalog & Marketing",
    capability: "promotionWrite",
    children: [
      { href: "/marketing/promotions", label: "Promosi", phaseLabel: "Fase 3 — Catalog & Marketing" },
      { href: "/marketing/campaigns", label: "Kampanye", phaseLabel: "Fase 3 — Catalog & Marketing" },
    ],
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
    phaseLabel: "Fase 5 — Notifications & Customers",
    capability: "orderRead",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    phaseLabel: "Fase 6 — Dashboard, Analytics, Team",
    capability: "analyticsExport",
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    phaseLabel: "Fase 5 — Notifications & Customers",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    phaseLabel: "Fase 6-7 — Team, Settings & Hardening",
    children: [
      { href: "/settings/profile", label: "Profil Akun", phaseLabel: "Fase 6-7 — Team, Settings & Hardening" },
      { href: "/settings/store", label: "Toko", phaseLabel: "Fase 6-7 — Team, Settings & Hardening" },
      { href: "/settings/shipping", label: "Pengiriman", phaseLabel: "Fase 6-7 — Team, Settings & Hardening" },
      { href: "/settings/payments", label: "Pembayaran", phaseLabel: "Fase 6-7 — Team, Settings & Hardening", capability: "teamRoleManage" },
      { href: "/settings/notifications", label: "Notifikasi", phaseLabel: "Fase 6-7 — Team, Settings & Hardening" },
      { href: "/settings/team", label: "Tim", phaseLabel: "Fase 6-7 — Team, Settings & Hardening", capability: "teamRoleManage" },
      { href: "/settings/roles", label: "Role & Permission", phaseLabel: "Fase 6-7 — Team, Settings & Hardening", capability: "teamRoleManage" },
      { href: "/settings/audit-log", label: "Audit Log", phaseLabel: "Fase 6-7 — Team, Settings & Hardening" },
      { href: "/settings/integrations", label: "Integrasi", phaseLabel: "Fase 6-7 — Team, Settings & Hardening", capability: "teamRoleManage" },
      { href: "/settings/integrations/shopee", label: "Shopee Open Platform", phaseLabel: "Marketplace API", capability: "teamRoleManage" },
    ],
  },
];

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...MENU_NAV];
