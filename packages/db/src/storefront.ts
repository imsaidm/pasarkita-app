import { query, queryOne } from './client';

/**
 * Kueri katalog untuk toko online.
 *
 * Bentuk kembaliannya sengaja mengikuti tipe yang sudah dipakai halaman
 * storefront, supaya tidak ada satu pun berkas `app/**` yang perlu diedit.
 *
 * Yang belum punya sumber data dikembalikan kosong, bukan dikarang:
 * `rating` dan `reviewCount` nol, `badge` dan `compareAtPrice` tidak diisi.
 * Komponen sudah disesuaikan agar menyembunyikan diri saat nilainya kosong —
 * menampilkan bintang 0,0 atau harga coret palsu lebih buruk daripada tidak
 * menampilkan apa pun.
 */

export type StorefrontVariantGroup = {
  readonly name: string;
  readonly options: readonly string[];
};

export type StorefrontProduct = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly categorySlug: string;
  readonly price: number;
  readonly compareAtPrice?: number;
  readonly images: readonly string[];
  readonly rating: number;
  readonly reviewCount: number;
  readonly shortDescription: string;
  readonly description: string;
  readonly variants: readonly StorefrontVariantGroup[];
  readonly stock: number;
  readonly sku: string;
  /** SKU utama, dipakai keranjang dan checkout. Bukan bagian tipe asli. */
  readonly skuId: string;
};

export type StorefrontCategory = {
  readonly slug: string;
  readonly name: string;
  readonly image: string;
};

/** Slug yang sama dipakai migrasi 003, jadi hasilnya harus identik. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  price_cents: string | null;
  sku_code: string | null;
  sku_id: string | null;
  stock: string | null;
  variant_names: string[] | null;
  images: string[] | null;
};

// Foto diambil lewat subkueri, bukan JOIN: menggabungkannya ke agregat di
// bawah akan menggandakan baris stok sebanyak jumlah fotonya, dan angka stok
// ikut berlipat. Kesalahan seperti itu tidak kelihatan sampai ada produk yang
// punya dua foto.
const PRODUCT_SELECT = `
  SELECT p.id,
         p.slug,
         p.name,
         p.category,
         p.short_description,
         p.description,
         MIN(s.price_cents)::text            AS price_cents,
         MIN(s.code)                         AS sku_code,
         MIN(s.id)                           AS sku_id,
         coalesce(SUM(l.delta), 0)::text     AS stock,
         array_remove(array_agg(DISTINCT v.name), 'Standar') AS variant_names,
         (SELECT array_agg(pi.url ORDER BY pi.sort, pi.id)
            FROM product_image pi
           WHERE pi.product_id = p.id AND pi.tenant_id = p.tenant_id) AS images
  FROM product p
  JOIN variant v ON v.product_id = p.id
  JOIN sku s     ON s.variant_id = v.id
  LEFT JOIN stock_ledger l ON l.sku_id = s.id AND l.tenant_id = p.tenant_id
  WHERE p.tenant_id = $1
`;

const GROUP_BY = `
  GROUP BY p.id, p.slug, p.name, p.category, p.short_description, p.description
`;

function toProduct(row: ProductRow): StorefrontProduct {
  const variantNames = (row.variant_names ?? []).filter((n) => n && n.length > 0);
  return Object.freeze({
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: slugify(row.category ?? 'lainnya'),
    // Rupiah disimpan sebagai bilangan bulat sen; storefront memakai rupiah penuh.
    price: Math.round(Number(row.price_cents ?? 0) / 100),
    images: row.images ?? [],
    rating: 0,
    reviewCount: 0,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    variants: variantNames.length > 0 ? [{ name: 'Pilihan', options: variantNames }] : [],
    stock: Number(row.stock ?? 0),
    sku: row.sku_code ?? '',
    skuId: row.sku_id ?? '',
  });
}

export async function listProducts(tenantId: string): Promise<readonly StorefrontProduct[]> {
  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT} ${GROUP_BY} ORDER BY p.name`,
    [tenantId],
  );
  return rows.map(toProduct);
}

export async function findProductBySlug(
  tenantId: string,
  slug: string,
): Promise<StorefrontProduct | null> {
  const row = await queryOne<ProductRow>(
    `${PRODUCT_SELECT} AND p.slug = $2 ${GROUP_BY}`,
    [tenantId, slug],
  );
  return row === null ? null : toProduct(row);
}

export async function listCategories(tenantId: string): Promise<readonly StorefrontCategory[]> {
  const rows = await query<{ category: string }>(
    `SELECT DISTINCT category FROM product
     WHERE tenant_id = $1 AND category IS NOT NULL AND category <> ''
     ORDER BY category`,
    [tenantId],
  );
  return rows.map((row) => {
    const slug = slugify(row.category);
    return Object.freeze({
      slug,
      name: row.category,
      // Gambar kategori diturunkan dari slug-nya. Berkas yang tidak ada akan
      // gagal dimuat dan menyisakan latar polos — itu sudah ditangani kartu
      // kategorinya, jadi tidak perlu pemeriksaan tambahan di sini.
      image: `/images/categories/category-${slug}.jpg`,
    });
  });
}

export async function findCategoryBySlug(
  tenantId: string,
  slug: string,
): Promise<StorefrontCategory | null> {
  const categories = await listCategories(tenantId);
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function searchProducts(
  tenantId: string,
  term: string,
): Promise<readonly StorefrontProduct[]> {
  const needle = term.trim();
  if (needle.length === 0) return [];
  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
       AND (p.name ILIKE $2 OR p.category ILIKE $2 OR s.code ILIKE $2)
     ${GROUP_BY}     ORDER BY p.name     LIMIT 100`,
    [tenantId, `%${needle}%`],
  );
  return rows.map(toProduct);
}

/**
 * Produk terbaru menurut waktu dibuat. Ini satu-satunya urutan "baru" yang
 * benar-benar punya sumber di basis data.
 */
export async function listNewestProducts(
  tenantId: string,
  limit: number,
): Promise<readonly StorefrontProduct[]> {
  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
     ${GROUP_BY}, p.created_at
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [tenantId, Math.max(1, Math.min(limit, 60))],
  );
  return rows.map(toProduct);
}

/** Terlaris dihitung dari penjualan sungguhan, bukan dari penanda manual. */
export async function listBestSellers(
  tenantId: string,
  limit: number,
): Promise<readonly StorefrontProduct[]> {
  const rows = await query<ProductRow & { sold: string }>(
    `${PRODUCT_SELECT}
     ${GROUP_BY}     ORDER BY (
       SELECT coalesce(SUM(ol.qty), 0)
       FROM order_line ol
       JOIN sku s2 ON s2.id = ol.sku_id
       JOIN variant v2 ON v2.id = s2.variant_id
       WHERE v2.product_id = p.id
     ) DESC, p.name
     LIMIT $2`,
    [tenantId, Math.max(1, Math.min(limit, 60))],
  );
  return rows.map(toProduct);
}
