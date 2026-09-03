import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_TTL_MS,
  clearCookie,
  createDemoSession,
  issue,
  publicUrl,
  readSecret,
  serializeCookie,
} from '@pasarkita/auth';

export const dynamic = 'force-dynamic';

const DEMO_ENABLED = process.env.DEMO_ENABLED !== 'false';
const SECURE_COOKIE = process.env.NODE_ENV === 'production';

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('keluar') !== '1') {
    return NextResponse.json({ error: 'Permintaan tidak dikenal.' }, { status: 400 });
  }
  const response = NextResponse.redirect(publicUrl(request, '/login'), 303);
  response.headers.set('Set-Cookie', clearCookie());
  return response;
}

/**
 * Masuk mode demo tanpa akun.
 *
 * Memakai tenant demo yang sama dengan toko online, supaya pesanan yang
 * dibuat di demo toko benar-benar muncul di sini — itu inti yang ingin
 * diperlihatkan: satu stok, satu pesanan, dilihat dari dua aplikasi.
 *
 * Sesinya tetap sesi demo: terkunci ke tenant demo_, tanpa userId, berumur
 * pendek, dan aksi yang keluar dari kotak pasir tetap ditolak guard().
 */
export async function POST(request: Request) {
  if (!DEMO_ENABLED) {
    return NextResponse.json({ error: 'Mode demo sedang dimatikan.' }, { status: 404 });
  }

  let secret: string;
  try {
    secret = readSecret();
  } catch {
    console.error('[dashboard] SESSION_SECRET belum dipasang; demo tidak bisa dibuka.');
    return NextResponse.json(
      { error: 'Demo belum siap. Coba lagi sebentar lagi.' },
      { status: 503 },
    );
  }

  const session = createDemoSession('store');
  const response = NextResponse.redirect(publicUrl(request, '/'), 303);
  response.headers.set(
    'Set-Cookie',
    serializeCookie(issue(session, secret), {
      maxAgeSeconds: Math.floor(DEMO_SESSION_TTL_MS / 1000),
      secure: SECURE_COOKIE,
    }),
  );
  return response;
}
