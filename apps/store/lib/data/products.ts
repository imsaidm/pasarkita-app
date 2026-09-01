import 'server-only';
import {
  findCategoryBySlug,
  findProductBySlug,
  listBestSellers,
  listCategories,
  listNewestProducts,
  listProducts,
  searchProducts as searchProductsDb,
} from '@pasarkita/db';
import { resolveTenantId } from '@/lib/tenant/resolve';

/**
 * Lapisan data katalog.
 *
 * Tanda tangan setiap fungsi di sini sengaja dipertahankan persis seperti
 * versi sebelumnya, supaya tidak satu pun halaman di `app/**` perlu diedit.
 * Yang berubah hanya isinya: dulu data contoh, sekarang PostgreSQL.
 */

export interface ProductVariantGroup {
  name: string;
  options: string[];
}

export type ProductBadge = 'Baru' | 'Sale' | 'Terlaris';

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  variants: ProductVariantGroup[];
  stock: number;
  sku: string;
  /** Dipakai keranjang dan checkout. Harga tetap diambil ulang di server. */
  skuId: string;
}

export interface Category {
  slug: string;
  name: string;
  image: string;
}

type DbProduct = Awaited<ReturnType<typeof listProducts>>[number];

function toProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.categorySlug,
    price: p.price,
    images: [...p.images],
    rating: p.rating,
    reviewCount: p.reviewCount,
    shortDescription: p.shortDescription,
    description: p.description,
    variants: p.variants.map((v) => ({ name: v.name, options: [...v.options] })),
    stock: p.stock,
    sku: p.sku,
    skuId: p.skuId,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  return (await listProducts(await resolveTenantId())).map(toProduct);
}

export async function getAllCategories(): Promise<Category[]> {
  return (await listCategories(await resolveTenantId())).map((c) => ({ ...c }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const found = await findCategoryBySlug(await resolveTenantId(), slug);
  return found === null ? null : { ...found };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const found = await findProductBySlug(await resolveTenantId(), slug);
  return found === null ? null : toProduct(found);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return (await listBestSellers(await resolveTenantId(), limit)).map(toProduct);
}

export async function getNewProducts(limit = 4): Promise<Product[]> {
  return (await listNewestProducts(await resolveTenantId(), limit)).map(toProduct);
}

export async function getBestSellerProducts(limit = 4): Promise<Product[]> {
  return (await listBestSellers(await resolveTenantId(), limit)).map(toProduct);
}

/**
 * Belum ada sumber data diskon: tidak ada harga coret di skema, dan promo
 * terjadwal adalah fitur paket yang belum dibangun. Mengembalikan daftar
 * kosong membuat halaman menampilkan "tidak ada produk" — itu jujur.
 * Mengarang diskon di halaman belanja bukan kesalahan tampilan, itu
 * menyesatkan pembeli.
 */
export async function getSaleProducts(_limit = 20): Promise<Product[]> {
  return [];
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sameCategory = await getProductsByCategory(product.categorySlug);
  return sameCategory.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function searchProducts(term: string): Promise<Product[]> {
  return (await searchProductsDb(await resolveTenantId(), term)).map(toProduct);
}
