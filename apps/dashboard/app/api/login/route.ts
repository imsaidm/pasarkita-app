import { NextResponse } from 'next/server';
import {
  publicUrl,
  issue,
  readSecret,
  serializeCookie,
  verifyPassword,
  type Session,
} from '@pasarkita/auth';
import { queryOne } from '@pasarkita/db';
import { parsePlan } from '@pasarkita/plan';

export const dynamic = 'force-dynamic';

const SESSION_TTL_SECONDS = 12 * 60 * 60;
const SECURE_COOKIE = process.env.NODE_ENV === 'production';

type UserRow = {
  id: string;
  tenant_id: string;
  password_hash: string;
  role: string;
  channel: string;
  tier: string;
  is_demo: boolean;
};

function failed(request: Request) {
  // Satu pesan untuk email tidak ada maupun sandi salah — jangan bocorkan
  // email mana yang terdaftar.
  return NextResponse.redirect(publicUrl(request, '/login?gagal=1'), 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  if (email.length === 0 || password.length === 0) return failed(request);

  let row: UserRow | null;
  try {
    row = await queryOne<UserRow>(
      `SELECT u.id, u.tenant_id, u.password_hash, u.role,
              t.channel, t.tier, t.is_demo
       FROM app_user u
       JOIN tenant t ON t.id = u.tenant_id
       WHERE lower(u.email) = $1`,
      [email],
    );
  } catch (error) {
    console.error('[dashboard] gagal membaca pengguna:', error);
    return NextResponse.redirect(publicUrl(request, '/login?gagal=1'), 303);
  }

  if (row === null) return failed(request);
  if (!(await verifyPassword(password, row.password_hash))) return failed(request);

  // Akun sungguhan tidak boleh masuk ke tenant demo.
  if (row.is_demo) {
    console.warn(`[dashboard] akun ${row.id} menunjuk tenant demo; ditolak.`);
    return failed(request);
  }

  const session: Session = Object.freeze({
    kind: 'user',
    tenantId: row.tenant_id,
    userId: row.id,
    role: row.role === 'owner' ? 'owner' : 'staff',
    plan: parsePlan(row.channel, row.tier),
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });

  // Tujuan setelah masuk hanya boleh jalur di dalam aplikasi ini. Tanpa
  // penyaringan, nilai `lanjut` dari form mengubah halaman masuk menjadi
  // pengalih terbuka ke situs mana pun.
  const requested = String(form.get('lanjut') ?? '/');
  const target =
    requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';

  const response = NextResponse.redirect(publicUrl(request, target), 303);
  response.headers.set(
    'Set-Cookie',
    serializeCookie(issue(session, readSecret()), {
      maxAgeSeconds: SESSION_TTL_SECONDS,
      secure: SECURE_COOKIE,
    }),
  );
  return response;
}
