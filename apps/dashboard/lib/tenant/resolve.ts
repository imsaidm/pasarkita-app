import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { readSecret, readSession, type Session } from '@pasarkita/auth';

/**
 * Menentukan toko mana yang sedang dikelola.
 *
 * Berbeda dari toko online, di sini TIDAK ADA toko default. Panel kelola
 * memperlihatkan pesanan, pelanggan, dan keuangan — kalau tenant bisa
 * ditebak dari nilai bawaan, satu kekeliruan setelan berarti satu toko
 * melihat data toko lain.
 */

export class NotSignedInError extends Error {
  constructor() {
    super('Belum masuk.');
    this.name = 'NotSignedInError';
  }
}

export async function currentSession(): Promise<Session | null> {
  try {
    const cookieHeader = (await headers()).get('cookie');
    return readSession(cookieHeader, readSecret());
  } catch {
    return null;
  }
}

/**
 * Mengembalikan tenant milik sesi, atau mengalihkan ke halaman masuk.
 *
 * Mengalihkan, bukan melempar: ini pemeriksaan yang sungguhan (tanda tangan
 * dan masa berlaku diverifikasi di sini, bukan di middleware), dan setiap
 * halaman memanggilnya sebelum membaca data. Kalau ia melempar, 38 halaman
 * harus menangkapnya satu per satu — dan satu yang lupa berarti data satu
 * toko bocor atau halaman error.
 */
export async function resolveTenantId(): Promise<string> {
  const session = await currentSession();
  if (session === null) redirect('/login');
  return session.tenantId;
}

/** Untuk pemanggil yang perlu membedakan "belum masuk" tanpa mengalihkan. */
export async function requireTenantId(): Promise<string> {
  const session = await currentSession();
  if (session === null) throw new NotSignedInError();
  return session.tenantId;
}

export function outletIdFor(tenantId: string): string {
  return `${tenantId}_outlet`;
}
