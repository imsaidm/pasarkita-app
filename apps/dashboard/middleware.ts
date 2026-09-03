import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Pengalihan ke halaman masuk.
 *
 * PENTING — ini BUKAN lapisan keamanan.
 *
 * Middleware berjalan di runtime edge yang tidak punya node:crypto, jadi
 * tanda tangan sesi tidak bisa diperiksa di sini. Yang dilakukan hanya
 * melihat ADA atau TIDAK cookie sesi, murni supaya pengunjung yang belum
 * masuk mendarat di halaman masuk alih-alih halaman kosong.
 *
 * Pemeriksaan yang sungguhan terjadi di setiap halaman lewat
 * `resolveTenantId()`, yang memverifikasi tanda tangan dan masa berlaku
 * sebelum satu baris data pun dibaca. Cookie palsu akan lolos middleware
 * ini, lalu ditolak di sana.
 *
 * Versi sebelumnya memeriksa `karyalo_auth === "true"` — cookie yang
 * dipasang sendiri oleh sisi klien. Siapa pun bisa menuliskannya dan masuk.
 */

const SESSION_COOKIE = "pk_session";

const ALLOWED_HOST_SUFFIX = ".pasarkita.net";
const ALLOWED_HOSTS = ["pasarkita.net", "localhost"];

/**
 * Membentuk URL yang benar-benar bisa dibuka pengunjung.
 *
 * Di belakang Caddy, `request.url` berisi alamat internal
 * (http://localhost:3111/...). Mengalihkan ke sana melempar pengunjung ke
 * alamat yang hanya ada di dalam server.
 *
 * X-Forwarded-Host dikirim klien pada dasarnya, jadi hanya dipakai kalau
 * lolos daftar host yang dikenal. Kalau tidak, jatuh kembali ke request.url —
 * salah alamat lebih baik daripada pengalihan terbuka ke situs mana pun.
 */
function publicUrl(request: NextRequest, path: string): URL {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded ?? request.headers.get("host");
  const name = host?.split(":")[0]?.toLowerCase() ?? "";

  if (host && (ALLOWED_HOSTS.includes(name) || name.endsWith(ALLOWED_HOST_SUFFIX))) {
    const proto = request.headers.get("x-forwarded-proto");
    const scheme = proto === "http" || proto === "https" ? proto : "https";
    return new URL(path, `${scheme}://${host}`);
  }
  return new URL(path, request.url);
}

const PUBLIC_PREFIXES = [
  "/_next",
  "/api",
  "/images",
  "/icons",
  "/offline",
] as const;

const PUBLIC_PATHS = ["/login", "/favicon.ico", "/manifest.json", "/logo.png"] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    (PUBLIC_PATHS as readonly string[]).includes(pathname)
  ) {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = publicUrl(request, "/login");
    // Supaya setelah masuk pengguna kembali ke halaman yang dia tuju.
    // Beranda tidak perlu ditandai — itu memang tujuan bawaannya.
    if (pathname !== "/") loginUrl.searchParams.set("lanjut", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
