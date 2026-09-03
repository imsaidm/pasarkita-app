/**
 * Multi-tenant storefront configuration (PRD §38 Multi-Tenant Storefront
 * Readiness).
 *
 * PENTING: nilai di bawah adalah MOCK/DEFAULT untuk pengembangan Fase 1,
 * bukan data tenant nyata. PRD §52 Codex Implementation Guidance secara
 * eksplisit mengizinkan mock data bertipe untuk kasus ini, dengan syarat
 * (1) diisolasi dari logic lain, (2) ditandai TODO integrasi secara
 * eksplisit. Ini juga berarti: JANGAN hard-code konten spesifik-tenant ke
 * dalam komponen reusable — semua komponen wajib membaca dari fungsi ini,
 * bukan mengetik ulang nilai brand secara langsung.
 *
 * TODO integrasi: ganti getTenantConfig() dari mock statis menjadi fetch
 * ke Convex (query `store.getConfig` atau setara) begitu backend Convex
 * untuk prototype ini di-deploy. Lihat convex/.env.example di
 * Karyalo_Store_Manage untuk daftar env var yang akan dibutuhkan.
 */

export interface TenantConfig {
  storeId: string;
  storeName: string;
  domain: string | null; // null = domain belum ditentukan (lihat catatan di PROTOTYPE README)
  branding: {
    logoUrl: string | null; // null = belum ada aset logo asli, lihat README
    colors: {
      primary: string;
      accent: string;
    };
  };
  contact: {
    whatsapp: string | null;
    email: string | null;
  };
  featureFlags: {
    wishlist: boolean;
    flashSale: boolean;
    reviews: boolean;
    pushNotifications: boolean;
  };
  announcement: string | null; // PRD §10 — harus dari config/API, bukan hard-coded di komponen
}

const MOCK_TENANT_CONFIG: TenantConfig = {
  storeId: "karyalo-default",
  storeName: "Karyalo",
  domain: null,
  branding: {
    logoUrl: "/logo.png", // Logo asli, diterima 16 Agustus 2026 — lihat 07_DESIGN/Logo/logo_karyalo.png
    colors: {
      primary: "#1E2F5C", // Brand Navy — diambil dari logo (lihat catatan di app/globals.css)
      accent: "#1E5AA8", // Brand Royal Blue — diambil dari logo
    },
  },
  contact: {
    whatsapp: null,
    email: null,
  },
  featureFlags: {
    wishlist: true,
    flashSale: false, // P1 — belum dibangun di Fase 1
    reviews: false, // P1 — belum dibangun di Fase 1
    pushNotifications: false, // P1/P2 — belum dibangun di Fase 1
  },
  announcement: null,
};

/**
 * Fase 1: selalu mengembalikan mock config di atas (sync, tanpa network).
 * Signature sudah async supaya pemanggil tidak perlu berubah saat nanti
 * diganti fetch sungguhan ke Convex.
 */
export async function getTenantConfig(): Promise<TenantConfig> {
  return MOCK_TENANT_CONFIG;
}
