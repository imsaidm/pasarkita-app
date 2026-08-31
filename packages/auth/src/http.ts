/**
 * Membentuk URL publik untuk pengalihan.
 *
 * Di belakang reverse proxy, request.url berisi alamat internal
 * (http://localhost:3108/...). Mengalihkan ke sana membuat pengunjung
 * mendarat di alamat yang tidak bisa dijangkau dari luar.
 *
 * Header X-Forwarded-Host dikirim klien pada dasarnya, jadi nilainya hanya
 * dipakai kalau lolos daftar host yang dikenal. Kalau tidak, jatuh kembali ke
 * request.url — salah alamat lebih baik daripada pengalihan terbuka.
 */

const ALLOWED_SUFFIXES = ['.pasarkita.net'] as const;
const ALLOWED_EXACT = ['pasarkita.net', 'localhost'] as const;

function isAllowedHost(host: string): boolean {
  const name = host.split(':')[0]?.toLowerCase() ?? '';
  if ((ALLOWED_EXACT as readonly string[]).includes(name)) return true;
  return ALLOWED_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

export function publicUrl(request: Request, path: string): URL {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host');

  if (host !== null && isAllowedHost(host)) {
    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    const scheme = proto === 'http' || proto === 'https' ? proto : 'https';
    return new URL(path, `${scheme}://${host}`);
  }

  return new URL(path, request.url);
}
