import { can, planHasApp, type AppName, type Feature } from '@pasarkita/plan';
import { DEMO_FORBIDDEN, assertDemoSessionSane, isDemoTenantId, type ForbiddenAction } from './demo';
import type { Session } from './session';

/**
 * Satu pintu untuk semua keputusan "boleh atau tidak".
 *
 * Rutenya selalu sama: sesi masuk akal → tenant cocok → aplikasi termasuk
 * paket → fitur terbuka → aksi tidak terlarang untuk demo.
 */

export class ForbiddenError extends Error {
  readonly reason: string;
  constructor(message: string, reason: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.reason = reason;
  }
}

const FORBIDDEN_FOR_DEMO: ReadonlySet<string> = new Set(DEMO_FORBIDDEN);

export function isForbiddenForDemo(action: string): action is ForbiddenAction {
  return FORBIDDEN_FOR_DEMO.has(action);
}

/** Sesi harus konsisten sebelum dipakai untuk apa pun. */
export function assertSessionUsable(session: Session, now: number = Date.now()): void {
  if (session.expiresAt <= now) {
    throw new ForbiddenError('Sesi sudah berakhir. Silakan masuk lagi.', 'session_expired');
  }
  assertDemoSessionSane(session);

  // Sesi pengguna biasa tidak boleh menyentuh tenant demo, dan sebaliknya.
  if (session.kind === 'user' && isDemoTenantId(session.tenantId)) {
    throw new ForbiddenError('Akun biasa tidak bisa memakai tenant demo.', 'tenant_mismatch');
  }
}

/** Data yang diminta harus milik tenant pada sesi. Ini penjaga kebocoran antar toko. */
export function assertOwnsTenant(session: Session, tenantId: string): void {
  if (session.tenantId !== tenantId) {
    throw new ForbiddenError('Data ini bukan milik toko Anda.', 'tenant_mismatch');
  }
}

export function assertHasApp(session: Session, app: AppName): void {
  if (!planHasApp(session.plan, app)) {
    throw new ForbiddenError(
      `Paket Anda belum mencakup aplikasi ini. Ganti paket untuk membukanya.`,
      'app_not_in_plan',
    );
  }
}

export function assertHasFeature(session: Session, feature: Feature): void {
  if (!can(session.plan, feature)) {
    throw new ForbiddenError('Fitur ini tersedia di paket yang lebih tinggi.', 'feature_locked');
  }
}

export function assertActionAllowed(session: Session, action: string): void {
  if (session.kind === 'demo' && isForbiddenForDemo(action)) {
    throw new ForbiddenError(
      'Tindakan ini dimatikan dalam mode demo. Buat akun untuk memakainya.',
      'demo_forbidden',
    );
  }
}

export type GuardInput = {
  readonly session: Session;
  readonly app: AppName;
  readonly tenantId?: string;
  readonly feature?: Feature;
  readonly action?: string;
  readonly now?: number;
};

/** Pemeriksaan lengkap dalam satu panggilan. Dipakai di batas request. */
export function guard(input: GuardInput): void {
  const { session, app, tenantId, feature, action, now } = input;
  assertSessionUsable(session, now ?? Date.now());
  assertHasApp(session, app);
  if (tenantId !== undefined) assertOwnsTenant(session, tenantId);
  if (feature !== undefined) assertHasFeature(session, feature);
  if (action !== undefined) assertActionAllowed(session, action);
}
