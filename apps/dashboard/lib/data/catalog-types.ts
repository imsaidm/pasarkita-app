/**
 * Tipe katalog dan konstanta statis.
 *
 * Terpisah dari `catalog.ts` yang bertanda `server-only`: tabel dan form
 * produk adalah komponen klien, dan mengimpor apa pun dari modul server-only
 * akan menggagalkan build. Yang di sini aman dipakai di dua sisi.
 */
export type ProductStatus = "published" | "draft" | "archived";
export type ShopeeSyncStatus = "synced" | "pending" | "error" | "unlinked";
export type SalesChannel = "storefront" | "shopee" | "manual";

export interface ProductVariantOption {
  name: string; // e.g. "Ukuran", "Warna"
  options: string[]; // e.g. ["S", "M", "L"]
}

export interface ProductVariantItem {
  id: string;
  sku: string;
  title: string; // e.g. "Krem / S"
  price: number;
  stock: number;
  image?: string;
  shopeeVariationId?: string;
  shopeeSyncStatus?: ShopeeSyncStatus;
}

export interface AdminProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  images: string[];
  image: string;
  badge?: "Baru" | "Sale" | "Terlaris";
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  brand: string;
  condition: "BARU" | "BEKAS";
  weightGram: number;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  variants: ProductVariantOption[];
  variantMatrix: ProductVariantItem[];
  channels: SalesChannel[];
  shopeeCategoryId: string;
  shopeeCategoryName: string;
  shopeeItemId?: string;
  shopeeSyncStatus: ShopeeSyncStatus;
  shopeeLastSyncedAt?: string;
  updatedAtLabel: string;
}

export interface Category {
  slug: string;
  name: string;
  image?: string;
  shopeeCategoryId: string;
  productCount: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: ProductStatus;
}

export const CATEGORIES: Category[] = [
  { slug: "wanita", name: "Wanita", image: "/images/categories/category-wanita.jpg", shopeeCategoryId: "100017", productCount: 4 },
  { slug: "pria", name: "Pria", image: "/images/categories/category-pria.jpg", shopeeCategoryId: "100018", productCount: 4 },
  { slug: "sepatu", name: "Sepatu", image: "/images/categories/category-sepatu.jpg", shopeeCategoryId: "100025", productCount: 4 },
  { slug: "tas", name: "Tas", image: "/images/categories/category-tas.jpg", shopeeCategoryId: "100030", productCount: 3 },
  { slug: "aksesoris", name: "Aksesoris", image: "/images/categories/category-aksesoris.jpg", shopeeCategoryId: "100042", productCount: 3 },
];

export const COLLECTIONS: Collection[] = [
  { id: "col-01", name: "Baru Tiba", description: "Produk yang baru ditambahkan minggu ini.", productCount: 3, status: "published" },
  { id: "col-02", name: "Paling Laris", description: "Produk dengan penjualan tertinggi.", productCount: 3, status: "published" },
  { id: "col-03", name: "Sedang Diskon", description: "Produk dengan harga coret.", productCount: 4, status: "published" },
  { id: "col-04", name: "Koleksi Lebaran", description: "Draft untuk kampanye musiman berikutnya.", productCount: 0, status: "draft" },
];
