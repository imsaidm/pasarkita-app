import 'server-only';
import { headers } from 'next/headers';
import { readSecret, readSession } from '@pasarkita/auth';

/**
 * Menentukan toko mana yang sedang dilihat.
 *
 * Urutannya:
 *   1. Sesi di cookie — dipakai tombol demo, dan nanti oleh pemilik toko
 *      yang melihat tokonya sendiri.
 *   2. STORE_DEFAULT_TENANT dari lingkungan.
 *
 * Pemetaan domain ke tenant belum ada; itu butuh kolom `tenant.domain`
 * dan fitur `customDomain` pada paket. Sampai saat itu, satu server
 * melayani satu toko default ditambah sesi demo.
 */

const DEFAULT_TENANT = process.env.STORE_DEFAULT_TENANT ?? 'demo_store';

export async function resolveTenantId(): Promise<string> {
  try {
    const cookieHeader = (await headers()).get('cookie');
    const session = readSession(cookieHeader, readSecret());
    if (session !== null) return session.tenantId;
  } catch {
    // Tanpa sesi yang sah, toko default tetap bisa dilihat publik.
  }
  return DEFAULT_TENANT;
}

/** Outlet tunggal per tenant, sesuai bentuk seed sekarang. */
export function outletIdFor(tenantId: string): string {
  return `${tenantId}_outlet`;
}
