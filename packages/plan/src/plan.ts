import { appsFor, hasApp, isChannel, type AppName, type Channel } from './channels.js';
import { FEATURE_SPECS, isFeature, type Feature } from './features.js';
import { isTier, limitsFor, nextTier, tierAtLeast, type Limits, type Tier } from './tiers.js';

/**
 * Satu tenant punya satu paket. Tiga aplikasi membaca paket yang sama,
 * jadi menaikkan tier cukup mengubah satu baris dan ketiganya ikut.
 */
export type Plan = {
  readonly channel: Channel;
  readonly tier: Tier;
};

export class InvalidPlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPlanError';
  }
}

/**
 * Membentuk Plan dari nilai yang belum dipercaya (baris database, klaim token,
 * body request). Selalu lewat sini di batas sistem — jangan pernah melakukan
 * cast langsung ke Plan.
 */
export function parsePlan(channel: unknown, tier: unknown): Plan {
  if (!isChannel(channel)) {
    throw new InvalidPlanError(`Channel tidak dikenal: ${String(channel)}`);
  }
  if (!isTier(tier)) {
    throw new InvalidPlanError(`Tier tidak dikenal: ${String(tier)}`);
  }
  return Object.freeze({ channel, tier });
}

/** Kode paket yang stabil untuk disimpan di database dan dibaca manusia. */
export function planCode(plan: Plan): string {
  return `${plan.channel}-${plan.tier}`;
}

export function parsePlanCode(code: unknown): Plan {
  if (typeof code !== 'string') {
    throw new InvalidPlanError(`Kode paket harus berupa string, diterima: ${typeof code}`);
  }
  const [channel, tier] = code.split('-');
  return parsePlan(channel, tier);
}

/**
 * Apakah paket ini mendapat sebuah fitur.
 *
 * Dua syarat harus terpenuhi: fitur itu punya arti di channel-nya, DAN
 * tier-nya sudah mencapai tier minimum fitur tersebut.
 */
export function can(plan: Plan, feature: Feature): boolean {
  const spec = FEATURE_SPECS[feature];
  if (!spec) return false;
  if (!spec.channels.includes(plan.channel)) return false;
  return tierAtLeast(plan.tier, spec.minTier);
}

/** Versi `can` untuk nilai yang belum divalidasi. Fitur tak dikenal berarti tertutup. */
export function canUnsafe(plan: Plan, feature: unknown): boolean {
  return isFeature(feature) && can(plan, feature);
}

/** Semua fitur yang terbuka untuk paket ini. */
export function featuresOf(plan: Plan): readonly Feature[] {
  return Object.freeze(
    (Object.keys(FEATURE_SPECS) as Feature[]).filter((feature) => can(plan, feature)),
  );
}

export function limitsOf(plan: Plan): Limits {
  return limitsFor(plan.tier);
}

export function appsOf(plan: Plan): readonly AppName[] {
  return appsFor(plan.channel);
}

export function planHasApp(plan: Plan, app: AppName): boolean {
  return hasApp(plan.channel, app);
}

/**
 * Apakah sebuah batas sudah terlampaui. `null` pada batas berarti tanpa batas.
 * Dipakai sebelum menyimpan, bukan sesudah.
 */
export function isWithinLimit(plan: Plan, key: keyof Limits, current: number): boolean {
  const limit = limitsOf(plan)[key];
  return limit === null || current < limit;
}

/**
 * Paket yang harus dituju kalau sebuah fitur ingin dibuka.
 * Mengembalikan null kalau fitur itu memang tidak ada di channel ini —
 * dalam kasus itu yang perlu diubah channel-nya, bukan tier-nya.
 */
export function upgradeTargetFor(plan: Plan, feature: Feature): Plan | null {
  const spec = FEATURE_SPECS[feature];
  if (!spec || !spec.channels.includes(plan.channel)) return null;
  if (can(plan, feature)) return null;
  return Object.freeze({ channel: plan.channel, tier: spec.minTier });
}

/** Langkah naik berikutnya dari paket ini, atau null kalau sudah paling atas. */
export function nextPlan(plan: Plan): Plan | null {
  const tier = nextTier(plan.tier);
  return tier === null ? null : Object.freeze({ channel: plan.channel, tier });
}
