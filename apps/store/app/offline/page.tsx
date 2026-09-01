/**
 * PWA-04 Offline Behavior — fallback route yang ditampilkan service worker
 * (/public/sw.js) saat navigasi gagal karena tidak ada koneksi dan halaman
 * yang diminta belum ada di cache.
 *
 * Route ini sendiri di-precache oleh service worker saat install supaya
 * selalu tersedia offline.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-start gap-4 px-4 py-24 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Anda sedang offline</h1>
      <p className="max-w-prose text-muted">
        Koneksi terputus. Halaman yang sudah pernah dibuka mungkin masih bisa
        diakses; halaman lain dan seluruh proses pembayaran memerlukan koneksi
        internet.
      </p>
    </div>
  );
}
