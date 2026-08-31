import { createHmac, timingSafeEqual } from 'node:crypto';
import { parsePlan, type Plan } from '@pasarkita/plan';

/**
 * Sesi bertanda tangan, tanpa dependensi luar.
 *
 * Token hanya ditandatangani, bukan dienkripsi — jangan pernah menaruh apa pun
 * di dalamnya yang tidak boleh dibaca pemiliknya sendiri.
 */

export const ROLES = ['owner', 'staff', 'demo'] as const;
export type Role = (typeof ROLES)[number];

export const SESSION_KINDS = ['user', 'demo'] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export type Session = {
  readonly kind: SessionKind;
  readonly tenantId: string;
  /** null untuk sesi demo — tidak ada manusia di baliknya. */
  readonly userId: string | null;
  readonly role: Role;
  readonly plan: Plan;
  /** Epoch milidetik. */
  readonly expiresAt: number;
};

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

const MIN_SECRET_LENGTH = 32;

/**
 * Dibaca sekali saat modul dimuat supaya proses gagal cepat ketika secret
 * belum dipasang, bukan diam-diam menerbitkan token yang lemah.
 */
export function readSecret(env: NodeJS.ProcessEnv = process.env): string {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new SessionError(
      `SESSION_SECRET wajib diisi dan minimal ${MIN_SECRET_LENGTH} karakter. ` +
        'Buat dengan: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    );
  }
  return secret;
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function signaturesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function issue(session: Session, secret: string): string {
  const payload = encode(session);
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Memverifikasi tanda tangan lalu memvalidasi ulang isinya.
 *
 * Tanda tangan yang sah tidak membuat isinya otomatis dipercaya — token bisa
 * saja diterbitkan versi lama dengan bentuk yang sudah tidak berlaku.
 */
export function verify(token: unknown, secret: string, now: number = Date.now()): Session {
  if (typeof token !== 'string' || token.length === 0) {
    throw new SessionError('Token sesi kosong.');
  }

  const separator = token.lastIndexOf('.');
  if (separator <= 0) {
    throw new SessionError('Bentuk token sesi tidak dikenal.');
  }

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!signaturesMatch(signature, sign(payload, secret))) {
    throw new SessionError('Tanda tangan sesi tidak cocok.');
  }

  const session = parseSession(decodePayload(payload));
  if (session.expiresAt <= now) {
    throw new SessionError('Sesi sudah kedaluwarsa.');
  }
  return session;
}

function decodePayload(payload: string): unknown {
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new SessionError('Isi token sesi tidak bisa dibaca.');
  }
}

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

function isKind(value: unknown): value is SessionKind {
  return typeof value === 'string' && (SESSION_KINDS as readonly string[]).includes(value);
}

/** Validasi bentuk sesi dari sumber yang belum dipercaya. */
export function parseSession(raw: unknown): Session {
  if (typeof raw !== 'object' || raw === null) {
    throw new SessionError('Sesi bukan objek.');
  }
  const value = raw as Record<string, unknown>;

  if (!isKind(value.kind)) throw new SessionError('Jenis sesi tidak dikenal.');
  if (!isRole(value.role)) throw new SessionError('Peran tidak dikenal.');
  if (typeof value.tenantId !== 'string' || value.tenantId.length === 0) {
    throw new SessionError('tenantId wajib ada.');
  }
  if (typeof value.expiresAt !== 'number' || !Number.isFinite(value.expiresAt)) {
    throw new SessionError('expiresAt tidak sah.');
  }

  const userId = value.userId === null ? null : value.userId;
  if (userId !== null && typeof userId !== 'string') {
    throw new SessionError('userId harus string atau null.');
  }

  const planValue = value.plan;
  if (typeof planValue !== 'object' || planValue === null) {
    throw new SessionError('Paket pada sesi tidak ada.');
  }
  const plan = parsePlan(
    (planValue as Record<string, unknown>).channel,
    (planValue as Record<string, unknown>).tier,
  );

  // Sesi demo tidak boleh membawa identitas manusia, dan hanya boleh berperan demo.
  if (value.kind === 'demo' && (userId !== null || value.role !== 'demo')) {
    throw new SessionError('Sesi demo tidak boleh membawa pengguna atau peran biasa.');
  }
  if (value.kind === 'user' && value.role === 'demo') {
    throw new SessionError('Sesi pengguna tidak boleh berperan demo.');
  }

  return Object.freeze({
    kind: value.kind,
    tenantId: value.tenantId,
    userId,
    role: value.role,
    plan,
    expiresAt: value.expiresAt,
  });
}
