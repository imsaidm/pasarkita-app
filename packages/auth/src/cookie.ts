import { verify, type Session } from './session';

/**
 * Pembungkus cookie yang tidak terikat framework, supaya ketiga aplikasi
 * memakai nama, atribut keamanan, dan cara baca yang sama persis.
 */

export const COOKIE_NAME = 'pk_session';

export type CookieOptions = {
  readonly maxAgeSeconds: number;
  /** Dimatikan hanya saat pengembangan lokal tanpa https. */
  readonly secure?: boolean;
};

export function serializeCookie(token: string, options: CookieOptions): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
  ];
  if (options.secure !== false) parts.push('Secure');
  return parts.join('; ');
}

export function clearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function extractToken(cookieHeader: string): string | null {
  for (const piece of cookieHeader.split(';')) {
    const [name, ...rest] = piece.trim().split('=');
    if (name === COOKIE_NAME) return rest.join('=') || null;
  }
  return null;
}

/**
 * Mengembalikan null untuk semua kegagalan — tidak ada cookie, tanda tangan
 * tidak cocok, atau sudah kedaluwarsa. Pemanggil memperlakukan null sebagai
 * belum masuk, bukan sebagai kesalahan yang perlu ditampilkan.
 */
export function readSession(
  cookieHeader: string | null | undefined,
  secret: string,
): Session | null {
  if (!cookieHeader) return null;
  const token = extractToken(cookieHeader);
  if (token === null) return null;
  try {
    return verify(token, secret);
  } catch {
    return null;
  }
}
