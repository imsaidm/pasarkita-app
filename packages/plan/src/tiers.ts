/**
 * Tier menentukan seberapa besar toko yang muat dalam sebuah paket.
 * Ini sumbu datar dari matriks paket.
 *
 * `null` pada sebuah batas berarti tanpa batas. Sengaja tidak memakai
 * Infinity supaya nilainya aman dibawa lewat JSON dan disimpan di database.
 */

export const TIERS = ['startup', 'middle', 'pro'] as const;
export type Tier = (typeof TIERS)[number];

export type Limits = {
  readonly skus: number;
  readonly outlets: number;
  readonly users: number | null;
  readonly historyDays: number | null;
};

const LIMITS: Readonly<Record<Tier, Limits>> = Object.freeze({
  startup: Object.freeze({ skus: 10, outlets: 1, users: 1, historyDays: 30 }),
  middle: Object.freeze({ skus: 100, outlets: 2, users: 5, historyDays: 365 }),
  pro: Object.freeze({ skus: 1000, outlets: 5, users: null, historyDays: null }),
});

export const TIER_LABELS: Readonly<Record<Tier, string>> = Object.freeze({
  startup: 'Startup',
  middle: 'Middle',
  pro: 'Pro',
});

/** Urutan tier, dipakai untuk membandingkan "minimal tier". */
const TIER_RANK: Readonly<Record<Tier, number>> = Object.freeze({
  startup: 0,
  middle: 1,
  pro: 2,
});

export function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && (TIERS as readonly string[]).includes(value);
}

export function limitsFor(tier: Tier): Limits {
  return LIMITS[tier];
}

/** True jika `tier` berada pada atau di atas `minimum`. */
export function tierAtLeast(tier: Tier, minimum: Tier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minimum];
}

/** Tier berikutnya, atau null jika sudah paling atas. */
export function nextTier(tier: Tier): Tier | null {
  const index = TIERS.indexOf(tier);
  if (index < 0) return null;
  return TIERS[index + 1] ?? null;
}
