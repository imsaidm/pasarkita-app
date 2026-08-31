import { parsePlan, type Plan } from '@pasarkita/plan';
import type { Session } from './session.js';

/**
 * Sesi demo: pengunjung menekan satu tombol, langsung masuk, tanpa mengisi
 * apa pun. Yang dilihatnya adalah tenant demo berisi data palsu.
 *
 * Aturan yang membuat ini aman, dan tidak boleh dilonggarkan:
 *   1. Sesi demo hanya boleh menunjuk tenant ber-prefix demo.
 *   2. Sesi demo tidak membawa userId — tidak ada manusia di baliknya.
 *   3. Sesi demo berumur pendek.
 *   4. Aksi yang keluar dari kotak pasir selalu ditolak (lihat DEMO_FORBIDDEN).
 */

export const DEMO_TENANT_PREFIX = 'demo_';
export const DEMO_SESSION_TTL_MS = 45 * 60 * 1000;

/**
 * Aksi yang tidak pernah boleh dijalankan sesi demo.
 *
 * Semuanya punya alasan yang sama: keluar dari kotak pasir. Mengirim pesan
 * menyentuh orang sungguhan, pembayaran menyentuh uang sungguhan, dan ekspor
 * memindahkan data keluar. Menambah entri di sini aman; mengurangi tidak.
 */
export const DEMO_FORBIDDEN = Object.freeze([
  'sendEmail',
  'sendWhatsapp',
  'realPayment',
  'dataExport',
  'accountSettings',
  'billing',
  'inviteUser',
  'deleteTenant',
  'apiToken',
] as const);

export type ForbiddenAction = (typeof DEMO_FORBIDDEN)[number];

export class DemoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoError';
  }
}

export function isDemoTenantId(tenantId: string): boolean {
  return tenantId.startsWith(DEMO_TENANT_PREFIX);
}

/**
 * Tenant demo tetap per aplikasi supaya Pos dan Store bisa punya data contoh
 * yang berbeda tanpa saling mengganggu.
 */
export function demoTenantIdFor(app: 'pos' | 'store'): string {
  return `${DEMO_TENANT_PREFIX}${app}`;
}

/** Paket yang dipakai tenant demo. Omni supaya semua layar bisa dilihat. */
export function demoPlan(): Plan {
  return parsePlan('omni', 'middle');
}

export function createDemoSession(
  app: 'pos' | 'store',
  now: number = Date.now(),
  ttlMs: number = DEMO_SESSION_TTL_MS,
): Session {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new DemoError('Umur sesi demo harus lebih besar dari nol.');
  }
  return Object.freeze({
    kind: 'demo',
    tenantId: demoTenantIdFor(app),
    userId: null,
    role: 'demo',
    plan: demoPlan(),
    expiresAt: now + ttlMs,
  });
}

/**
 * Pemeriksaan terakhir sebelum sesi demo dipakai.
 *
 * Dipanggil di sisi baca juga, bukan hanya saat pembuatan — token yang
 * ditandatangani versi lama bisa saja membawa bentuk yang sudah tidak sah.
 */
export function assertDemoSessionSane(session: Session): void {
  if (session.kind !== 'demo') return;
  if (!isDemoTenantId(session.tenantId)) {
    throw new DemoError(
      `Sesi demo menunjuk tenant bukan demo: ${session.tenantId}. Permintaan ditolak.`,
    );
  }
  if (session.userId !== null) {
    throw new DemoError('Sesi demo tidak boleh membawa userId.');
  }
  if (session.role !== 'demo') {
    throw new DemoError('Sesi demo tidak boleh berperan selain demo.');
  }
}
