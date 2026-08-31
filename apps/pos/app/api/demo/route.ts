import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_TTL_MS,
  clearCookie,
  createDemoSession,
  issue,
  readSecret,
  serializeCookie,
} from '@pasarkita/auth';

export const dynamic = 'force-dynamic';

const DEMO_ENABLED = process.env.DEMO_ENABLED !== 'false';
const SECURE_COOKIE = process.env.NODE_ENV === 'production';

/** Keluar dari demo. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('keluar') !== '1') {
    return NextResponse.json({ error: 'Permintaan tidak dikenal.' }, { status: 400 });
  }
  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.headers.set('Set-Cookie', clearCookie());
  return response;
}

/**
 * Masuk mode demo. Tidak ada nama pengguna, tidak ada kata sandi, dan tidak ada
 * data toko sungguhan yang bisa dijangkau: sesinya terkunci ke tenant demo_pos.
 */
export async function POST(request: Request) {
  if (!DEMO_ENABLED) {
    return NextResponse.json({ error: 'Mode demo sedang dimatikan.' }, { status: 404 });
  }

  let secret: string;
  try {
    secret = readSecret();
  } catch {
    // Jangan bocorkan penyebabnya ke pengunjung.
    console.error('[pos] SESSION_SECRET belum dipasang; demo tidak bisa dibuka.');
    return NextResponse.json(
      { error: 'Demo belum siap. Coba lagi sebentar lagi.' },
      { status: 503 },
    );
  }

  const session = createDemoSession('pos');
  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.headers.set(
    'Set-Cookie',
    serializeCookie(issue(session, secret), {
      maxAgeSeconds: Math.floor(DEMO_SESSION_TTL_MS / 1000),
      secure: SECURE_COOKIE,
    }),
  );
  return response;
}
