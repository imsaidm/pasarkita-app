import Link from "next/link";
import { Heart, User } from "lucide-react";
import { getTenantConfig } from "@/lib/config/tenant";
import { SearchEntry } from "./SearchEntry";
import { CartLink } from "./CartLink";

/**
 * PRD §10 Global Header.
 * Mobile: logo, search entry point, cart shortcut.
 * Desktop (md+): logo, main navigation, search bar, wishlist, account, cart.
 *
 * Wishlist/Account link di desktop menunjuk ke rute yang masih stub
 * (Fase 1) — link tetap dipasang sekarang supaya struktur navigasi PRD
 * §8 sudah benar sejak awal, kontennya menyusul di fase berikutnya.
 *
 * Ikon wishlist/akun: lucide-react (16 Agustus 2026), disamakan dengan
 * admin_dashboard.
 */
export async function AppHeader() {
  const tenant = await getTenantConfig();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-warm-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-(--container-content) items-center gap-3 px-4 py-3 md:gap-6 md:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-deep-pine"
        >
          {tenant.branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.branding.logoUrl}
              alt={tenant.storeName}
              className="h-8 w-auto"
            />
          ) : (
            // Fallback teks brand — dipakai hanya bila logoUrl kosong
            // (mis. tenant lain di masa depan yang belum unggah logo).
            <span>{tenant.storeName}</span>
          )}
        </Link>

        {/* Search bar penuh di desktop, ikon saja di mobile (search bar
            mobile ditampilkan sebagai section terpisah bila diperlukan
            oleh halaman spesifik, mis. Homepage HOME-02). */}
        <nav
          aria-label="Navigasi utama"
          className="hidden flex-1 items-center gap-6 md:flex"
        >
          <Link href="/category" className="text-sm text-ink hover:text-deep-pine">
            Kategori
          </Link>
          <Link href="/promo" className="text-sm text-ink hover:text-deep-pine">
            Promo
          </Link>
          <div className="max-w-md flex-1">
            <SearchEntry variant="bar" />
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
          <div className="md:hidden">
            <SearchEntry variant="icon" />
          </div>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="tap-target hidden items-center justify-center rounded-full text-ink hover:bg-soft-sage md:inline-flex"
          >
            <Heart size={22} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <Link
            href="/account"
            aria-label="Akun"
            className="tap-target hidden items-center justify-center rounded-full text-ink hover:bg-soft-sage md:inline-flex"
          >
            <User size={22} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
