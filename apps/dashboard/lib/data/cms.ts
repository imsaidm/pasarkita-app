/**
 * Data Storefront CMS CONTOH (demo) — Fase 2, PRD §11. Mensimulasikan
 * konten yang sedang mengelola homepage `Karyalo_Storefront_PWA` yang
 * sebenarnya (§11.1 hero/kategori/rekomendasi/promo/baru-tiba/terlaris —
 * cocok dengan struktur nyata `karyalo-storefront-pwa/app/page.tsx`).
 */

export type PublishStatus = "published" | "draft" | "scheduled";

export interface HomepageSection {
  id: string;
  type: string;
  label: string;
  status: PublishStatus;
}

export const HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: "sec-01", type: "Hero", label: "Hero — Fashion sehari-hari, tanpa ribet", status: "published" },
  { id: "sec-02", type: "Kategori", label: "Belanja per Kategori (5 kategori)", status: "published" },
  { id: "sec-03", type: "Produk", label: "Rekomendasi Untuk Anda", status: "published" },
  { id: "sec-04", type: "Banner Promo", label: "Diskon hingga 30% untuk item pilihan", status: "published" },
  { id: "sec-05", type: "Produk", label: "Baru Tiba", status: "published" },
  { id: "sec-06", type: "Produk", label: "Paling Laris", status: "published" },
  { id: "sec-07", type: "Trust Badge", label: "4 badge kepercayaan", status: "published" },
  { id: "sec-08", type: "Banner", label: "Promo Kemerdekaan (draft)", status: "draft" },
];

export interface Banner {
  id: string;
  title: string;
  placement: string;
  status: PublishStatus;
}

export const BANNERS: Banner[] = [
  { id: "ban-01", title: "Diskon hingga 30% Koleksi Pilihan", placement: "Homepage promo strip", status: "published" },
  { id: "ban-02", title: "Koleksi Baru Tiba", placement: "Halaman Promo", status: "published" },
  { id: "ban-03", title: "Flash Sale Payday (draft)", placement: "Homepage hero", status: "draft" },
];

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
}

export const CMS_PAGES: CmsPage[] = [
  { id: "pg-01", title: "Kebijakan Privasi", slug: "privacy", status: "draft" },
  { id: "pg-02", title: "Syarat & Ketentuan", slug: "terms", status: "draft" },
  { id: "pg-03", title: "Bantuan — Pengiriman", slug: "help/shipping", status: "published" },
  { id: "pg-04", title: "Bantuan — Retur", slug: "help/returns", status: "published" },
  { id: "pg-05", title: "Bantuan — Pembayaran", slug: "help/payment", status: "published" },
];

export interface NavTreeItem {
  label: string;
  href: string;
  children?: NavTreeItem[];
}

export const NAVIGATION_TREE: NavTreeItem[] = [
  {
    label: "Semua Produk",
    href: "/category",
    children: [
      { label: "Wanita", href: "/category/wanita" },
      { label: "Pria", href: "/category/pria" },
      { label: "Sepatu", href: "/category/sepatu" },
      { label: "Tas", href: "/category/tas" },
      { label: "Aksesoris", href: "/category/aksesoris" },
    ],
  },
  { label: "Promo", href: "/promo" },
  { label: "Bantuan", href: "/help" },
];

export interface MediaAsset {
  id: string;
  name: string;
  usedIn: string;
  sizeLabel: string;
}

export const MEDIA_ASSETS: MediaAsset[] = [
  { id: "med-01", name: "hero-home.jpg", usedIn: "Homepage hero", sizeLabel: "1600×900" },
  { id: "med-02", name: "category-wanita.jpg", usedIn: "Kategori Wanita", sizeLabel: "900×700" },
  { id: "med-03", name: "category-pria.jpg", usedIn: "Kategori Pria", sizeLabel: "900×700" },
  { id: "med-04", name: "promo-flash-sale.jpg", usedIn: "Halaman Promo", sizeLabel: "1400×500" },
  { id: "med-05", name: "logo.png", usedIn: "Header & favicon", sizeLabel: "512×512" },
];

export async function getHomepageSections(): Promise<HomepageSection[]> {
  return HOMEPAGE_SECTIONS;
}

export async function getBanners(): Promise<Banner[]> {
  return BANNERS;
}

export async function getCmsPages(): Promise<CmsPage[]> {
  return CMS_PAGES;
}

export async function getCmsPageBySlugOrId(id: string): Promise<CmsPage | null> {
  return CMS_PAGES.find((p) => p.id === id) ?? null;
}

export async function getNavigationTree(): Promise<NavTreeItem[]> {
  return NAVIGATION_TREE;
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  return MEDIA_ASSETS;
}
