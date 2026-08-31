import { CHANNELS, type Channel } from './channels';
import type { Tier } from './tiers';

/**
 * Katalog fitur yang bisa dikunci paket.
 *
 * Aturan yang dipegang di sini: yang dibatasi adalah SKALA, bukan KESELAMATAN.
 * Fitur yang menyangkut kepercayaan pengguna — mode offline, ekspor data,
 * cadangan — tidak pernah masuk tabel ini. Lihat ALWAYS_ON di bawah.
 */

export const FEATURES = [
  // katalog
  'variants',
  'bundles',
  // stok
  'stockOpname',
  'multiWarehouse',
  'purchaseOrders',
  // pelanggan
  'customers',
  'loyalty',
  // harga & promo
  'scheduledPromo',
  'tieredPricing',
  // laporan
  'fullReports',
  'customReports',
  'apiAccess',
  // khusus offline
  'customReceipt',
  // khusus online
  'customDomain',
  'autoPayment',
  'autoShipping',
  'storefrontTheme',
  // khusus omnichannel
  'channelPricing',
  'clickAndCollect',
  'perOutletOnlineStock',
] as const;

export type Feature = (typeof FEATURES)[number];

type FeatureSpec = {
  /** Tier paling rendah yang sudah mendapat fitur ini. */
  readonly minTier: Tier;
  /** Channel tempat fitur ini punya arti. */
  readonly channels: readonly Channel[];
  readonly label: string;
};

const ALL_CHANNELS = CHANNELS;
const OFFLINE_SIDE: readonly Channel[] = Object.freeze(['offline', 'omni'] as const);
const ONLINE_SIDE: readonly Channel[] = Object.freeze(['online', 'omni'] as const);
const OMNI_ONLY: readonly Channel[] = Object.freeze(['omni'] as const);

export const FEATURE_SPECS: Readonly<Record<Feature, FeatureSpec>> = Object.freeze({
  variants: { minTier: 'middle', channels: ALL_CHANNELS, label: 'Varian produk' },
  bundles: { minTier: 'pro', channels: ALL_CHANNELS, label: 'Paket dan bundel' },

  stockOpname: { minTier: 'middle', channels: OFFLINE_SIDE, label: 'Stock opname dan kartu stok' },
  multiWarehouse: { minTier: 'pro', channels: OFFLINE_SIDE, label: 'Multi-gudang dan transfer stok' },
  purchaseOrders: { minTier: 'pro', channels: OFFLINE_SIDE, label: 'Pesanan pembelian ke supplier' },

  customers: { minTier: 'middle', channels: ALL_CHANNELS, label: 'Database pelanggan' },
  loyalty: { minTier: 'pro', channels: ALL_CHANNELS, label: 'Poin dan membership' },

  scheduledPromo: { minTier: 'middle', channels: ALL_CHANNELS, label: 'Voucher dan diskon terjadwal' },
  tieredPricing: { minTier: 'pro', channels: ALL_CHANNELS, label: 'Harga grosir bertingkat' },

  fullReports: { minTier: 'middle', channels: ALL_CHANNELS, label: 'Laporan lengkap dan ekspor' },
  customReports: { minTier: 'pro', channels: ALL_CHANNELS, label: 'Laporan kustom' },
  apiAccess: { minTier: 'pro', channels: ALL_CHANNELS, label: 'Akses API dan webhook' },

  customReceipt: { minTier: 'middle', channels: OFFLINE_SIDE, label: 'Struk dengan logo sendiri' },

  customDomain: { minTier: 'middle', channels: ONLINE_SIDE, label: 'Domain sendiri' },
  autoPayment: { minTier: 'middle', channels: ONLINE_SIDE, label: 'Pembayaran otomatis' },
  autoShipping: { minTier: 'middle', channels: ONLINE_SIDE, label: 'Ongkir otomatis dari kurir' },
  storefrontTheme: { minTier: 'middle', channels: ONLINE_SIDE, label: 'Atur tampilan halaman toko' },

  channelPricing: { minTier: 'middle', channels: OMNI_ONLY, label: 'Harga beda per channel' },
  clickAndCollect: { minTier: 'middle', channels: OMNI_ONLY, label: 'Pesan online, ambil di toko' },
  perOutletOnlineStock: { minTier: 'pro', channels: OMNI_ONLY, label: 'Stok online per outlet' },
});

/**
 * Selalu menyala di semua paket, termasuk yang gratis.
 *
 * Ini bukan daftar fitur — ini daftar janji. Mengunci salah satunya merusak
 * kepercayaan pada produk, bukan menaikkan pendapatan. Jangan pindahkan
 * apa pun dari sini ke FEATURE_SPECS.
 */
export const ALWAYS_ON = Object.freeze([
  'offlineMode',
  'dataExport',
  'automaticBackup',
  'accountSecurity',
  'basicReturns',
  'cashAndQris',
] as const);

export type AlwaysOnFeature = (typeof ALWAYS_ON)[number];

export function isFeature(value: unknown): value is Feature {
  return typeof value === 'string' && (FEATURES as readonly string[]).includes(value);
}
