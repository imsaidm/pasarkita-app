import { describe, expect, it } from 'vitest';
import { parsePlan } from '@pasarkita/plan';
import {
  DEMO_FORBIDDEN,
  DemoError,
  ForbiddenError,
  SessionError,
  assertDemoSessionSane,
  createDemoSession,
  guard,
  isDemoTenantId,
  issue,
  readSecret,
  verify,
  type Session,
} from '../src/index.js';

const SECRET = 'rahasia-uji-yang-panjangnya-lebih-dari-tiga-puluh-dua-karakter';

function userSession(overrides: Partial<Session> = {}): Session {
  return {
    kind: 'user',
    tenantId: 'toko_001',
    userId: 'user_001',
    role: 'owner',
    plan: parsePlan('offline', 'startup'),
    expiresAt: Date.now() + 60_000,
    ...overrides,
  } as Session;
}

describe('secret', () => {
  it('menolak secret kosong atau terlalu pendek', () => {
    expect(() => readSecret({} as NodeJS.ProcessEnv)).toThrow(SessionError);
    expect(() => readSecret({ SESSION_SECRET: 'pendek' } as NodeJS.ProcessEnv)).toThrow(SessionError);
  });

  it('menerima secret yang cukup panjang', () => {
    expect(readSecret({ SESSION_SECRET: SECRET } as NodeJS.ProcessEnv)).toBe(SECRET);
  });
});

describe('token sesi', () => {
  it('bolak-balik utuh', () => {
    const session = userSession();
    expect(verify(issue(session, SECRET), SECRET)).toEqual(session);
  });

  it('menolak token yang diubah isinya', () => {
    const token = issue(userSession(), SECRET);
    const [payload, signature] = token.split('.');
    const tampered = Buffer.from(
      JSON.stringify({ ...userSession(), tenantId: 'toko_lain' }),
      'utf8',
    ).toString('base64url');
    expect(() => verify(`${tampered}.${signature}`, SECRET)).toThrow(SessionError);
    expect(payload).not.toBe(tampered);
  });

  it('menolak token yang ditandatangani secret lain', () => {
    const token = issue(userSession(), SECRET);
    expect(() => verify(token, `${SECRET}-beda`)).toThrow(SessionError);
  });

  it('menolak token kedaluwarsa', () => {
    const token = issue(userSession({ expiresAt: Date.now() - 1 }), SECRET);
    expect(() => verify(token, SECRET)).toThrow(SessionError);
  });

  it('menolak bentuk token yang aneh', () => {
    for (const bad of ['', 'tanpa-titik', null, undefined, 42]) {
      expect(() => verify(bad, SECRET)).toThrow(SessionError);
    }
  });
});

describe('sesi demo', () => {
  it('tidak membawa manusia dan terkunci ke tenant demo', () => {
    const session = createDemoSession('pos');
    expect(session.userId).toBeNull();
    expect(session.role).toBe('demo');
    expect(isDemoTenantId(session.tenantId)).toBe(true);
  });

  it('pos dan store punya tenant demo yang berbeda', () => {
    expect(createDemoSession('pos').tenantId).not.toBe(createDemoSession('store').tenantId);
  });

  it('berumur pendek', () => {
    const now = 1_000_000;
    expect(createDemoSession('pos', now).expiresAt - now).toBeLessThanOrEqual(60 * 60 * 1000);
  });

  it('menolak sesi demo yang menunjuk tenant sungguhan', () => {
    const smuggled = { ...createDemoSession('pos'), tenantId: 'toko_001' } as Session;
    expect(() => assertDemoSessionSane(smuggled)).toThrow(DemoError);
  });

  it('menolak sesi demo yang menyelundupkan userId', () => {
    const smuggled = { ...createDemoSession('pos'), userId: 'user_001' } as Session;
    expect(() => assertDemoSessionSane(smuggled)).toThrow(DemoError);
  });

  it('token demo yang diubah jadi sesi pengguna ditolak saat verifikasi', () => {
    const forged = { ...createDemoSession('pos'), kind: 'user' as const, role: 'demo' as const };
    expect(() => verify(issue(forged as Session, SECRET), SECRET)).toThrow(SessionError);
  });
});

describe('guard', () => {
  it('meloloskan permintaan yang wajar', () => {
    expect(() =>
      guard({ session: userSession(), app: 'pos', tenantId: 'toko_001' }),
    ).not.toThrow();
  });

  it('menolak aplikasi di luar paket', () => {
    expect(() => guard({ session: userSession(), app: 'store' })).toThrow(ForbiddenError);
  });

  it('menolak data milik tenant lain', () => {
    expect(() =>
      guard({ session: userSession(), app: 'pos', tenantId: 'toko_002' }),
    ).toThrow(ForbiddenError);
  });

  it('menolak fitur yang belum terbuka di paketnya', () => {
    expect(() =>
      guard({ session: userSession(), app: 'pos', feature: 'multiWarehouse' }),
    ).toThrow(ForbiddenError);
  });

  it('menolak semua aksi terlarang untuk sesi demo', () => {
    const session = createDemoSession('pos');
    for (const action of DEMO_FORBIDDEN) {
      expect(() => guard({ session, app: 'pos', action }), action).toThrow(ForbiddenError);
    }
  });

  it('mengizinkan aksi biasa untuk sesi demo', () => {
    expect(() =>
      guard({ session: createDemoSession('pos'), app: 'pos', action: 'createOrder' }),
    ).not.toThrow();
  });

  it('mengizinkan aksi yang sama untuk sesi pengguna', () => {
    const session = userSession({ plan: parsePlan('omni', 'pro') });
    expect(() => guard({ session, app: 'pos', action: 'dataExport' })).not.toThrow();
  });

  it('menolak akun biasa yang menunjuk tenant demo', () => {
    const session = userSession({ tenantId: 'demo_pos' });
    expect(() => guard({ session, app: 'pos' })).toThrow(ForbiddenError);
  });
});
