import { getAllProducts } from "@/lib/data/products";
import { WishlistClient } from "./WishlistClient";

export const dynamic = "force-dynamic";

/**
 * Wishlist — PRD §16.
 *
 * Daftar favorit tersimpan di perangkat (localStorage), jadi penyaringannya
 * harus terjadi di klien. Katalognya sendiri datang dari basis data, dan itu
 * hanya bisa dibaca di server. Jadi halaman ini server component yang
 * memuat katalog, lalu menyerahkan penyaringan ke komponen klien.
 */
export default async function WishlistPage() {
  const products = await getAllProducts();
  return <WishlistClient products={products} />;
}
