import { describe, expect, it } from 'vitest';
import {
  ALWAYS_ON,
  CHANNELS,
  FEATURE_SPECS,
  InvalidPlanError,
  TIERS,
  appsOf,
  can,
  featuresOf,
  isWithinLimit,
  limitsOf,
  nextPlan,
  parsePlan,
  parsePlanCode,
  planCode,
  planHasApp,
  upgradeTargetFor,
  type Feature,
} from '../src/index';

describe('parsePlan', () => {
  it('menerima kombinasi yang sah', () => {
    expect(parsePlan('offline', 'startup')).toEqual({ channel: 'offline', tier: 'startup' });
  });

  it('menolak channel dan tier yang tidak dikenal', () => {
    expect(() => parsePlan('warung', 'startup')).toThrow(InvalidPlanError);
    expect(() => parsePlan('offline', 'enterprise')).toThrow(InvalidPlanError);
  });

  it('bolak-balik lewat kode paket', () => {
    for (const channel of CHANNELS) {
      for (const tier of TIERS) {
        const plan = parsePlan(channel, tier);
        expect(parsePlanCode(planCode(plan))).toEqual(plan);
      }
    }
  });
});

describe('akses aplikasi per channel', () => {
  it('offline dapat pos dan dashboard, bukan store', () => {
    const plan = parsePlan('offline', 'startup');
    expect(appsOf(plan)).toEqual(['pos', 'dashboard']);
    expect(planHasApp(plan, 'store')).toBe(false);
  });

  it('online dapat store dan dashboard, bukan pos', () => {
    const plan = parsePlan('online', 'pro');
    expect(planHasApp(plan, 'pos')).toBe(false);
    expect(planHasApp(plan, 'store')).toBe(true);
  });

  it('omni dapat ketiganya', () => {
    expect(appsOf(parsePlan('omni', 'startup'))).toEqual(['pos', 'store', 'dashboard']);
  });

  it('dashboard terbuka di semua channel', () => {
    for (const channel of CHANNELS) {
      expect(planHasApp(parsePlan(channel, 'startup'), 'dashboard')).toBe(true);
    }
  });
});

describe('gating fitur', () => {
  it('startup tidak dapat varian, middle dapat', () => {
    expect(can(parsePlan('offline', 'startup'), 'variants')).toBe(false);
    expect(can(parsePlan('offline', 'middle'), 'variants')).toBe(true);
  });

  it('fitur khusus online tertutup untuk channel offline pada tier mana pun', () => {
    for (const tier of TIERS) {
      expect(can(parsePlan('offline', tier), 'customDomain')).toBe(false);
    }
  });

  it('fitur khusus offline tertutup untuk channel online pada tier mana pun', () => {
    for (const tier of TIERS) {
      expect(can(parsePlan('online', tier), 'stockOpname')).toBe(false);
    }
  });

  it('fitur khusus omni tertutup untuk channel satuan', () => {
    expect(can(parsePlan('offline', 'pro'), 'clickAndCollect')).toBe(false);
    expect(can(parsePlan('online', 'pro'), 'clickAndCollect')).toBe(false);
    expect(can(parsePlan('omni', 'middle'), 'clickAndCollect')).toBe(true);
  });

  it('fitur tidak pernah hilang saat tier naik', () => {
    for (const channel of CHANNELS) {
      const startup = featuresOf(parsePlan(channel, 'startup'));
      const middle = featuresOf(parsePlan(channel, 'middle'));
      const pro = featuresOf(parsePlan(channel, 'pro'));
      expect(middle).toEqual(expect.arrayContaining([...startup]));
      expect(pro).toEqual(expect.arrayContaining([...middle]));
    }
  });

  it('omni mendapat semua fitur channel satuan pada tier yang sama', () => {
    for (const tier of TIERS) {
      const omni = featuresOf(parsePlan('omni', tier));
      const offline = featuresOf(parsePlan('offline', tier));
      const online = featuresOf(parsePlan('online', tier));
      expect(omni).toEqual(expect.arrayContaining([...offline, ...online]));
    }
  });
});

describe('batas paket', () => {
  it('memakai angka SKU dari rencana: 10, 100, 1000', () => {
    expect(limitsOf(parsePlan('offline', 'startup')).skus).toBe(10);
    expect(limitsOf(parsePlan('offline', 'middle')).skus).toBe(100);
    expect(limitsOf(parsePlan('offline', 'pro')).skus).toBe(1000);
  });

  it('menolak penyimpanan tepat di batas', () => {
    const plan = parsePlan('offline', 'startup');
    expect(isWithinLimit(plan, 'skus', 9)).toBe(true);
    expect(isWithinLimit(plan, 'skus', 10)).toBe(false);
  });

  it('null berarti tanpa batas', () => {
    const pro = parsePlan('omni', 'pro');
    expect(limitsOf(pro).users).toBeNull();
    expect(isWithinLimit(pro, 'users', 10_000)).toBe(true);
  });
});

describe('jalur upgrade', () => {
  it('menunjuk tier minimum yang membuka fitur', () => {
    const plan = parsePlan('offline', 'startup');
    expect(upgradeTargetFor(plan, 'variants')).toEqual({ channel: 'offline', tier: 'middle' });
    expect(upgradeTargetFor(plan, 'multiWarehouse')).toEqual({ channel: 'offline', tier: 'pro' });
  });

  it('mengembalikan null kalau fitur memang bukan milik channel ini', () => {
    expect(upgradeTargetFor(parsePlan('offline', 'startup'), 'customDomain')).toBeNull();
  });

  it('mengembalikan null kalau fiturnya sudah terbuka', () => {
    expect(upgradeTargetFor(parsePlan('offline', 'middle'), 'variants')).toBeNull();
  });

  it('pro adalah tier teratas', () => {
    expect(nextPlan(parsePlan('offline', 'pro'))).toBeNull();
    expect(nextPlan(parsePlan('offline', 'startup'))).toEqual({ channel: 'offline', tier: 'middle' });
  });
});

describe('janji yang tidak boleh dikunci', () => {
  it('fitur ALWAYS_ON tidak pernah muncul di tabel gating', () => {
    const gated = new Set(Object.keys(FEATURE_SPECS));
    for (const promise of ALWAYS_ON) {
      expect(gated.has(promise)).toBe(false);
    }
  });

  it('setiap fitur yang di-gate punya minimal satu channel', () => {
    for (const [name, spec] of Object.entries(FEATURE_SPECS)) {
      expect(spec.channels.length, `${name} tidak punya channel`).toBeGreaterThan(0);
    }
  });

  it('setiap fitur terbuka di suatu tempat', () => {
    const names = Object.keys(FEATURE_SPECS) as Feature[];
    for (const feature of names) {
      const reachable = CHANNELS.some((channel) =>
        TIERS.some((tier) => can(parsePlan(channel, tier), feature)),
      );
      expect(reachable, `${feature} tidak terbuka di paket mana pun`).toBe(true);
    }
  });
});
