/**
 * PRD §27.3/§27.4 — fallback route yang ditampilkan service worker
 * (/public/sw.js) saat navigasi gagal karena tidak ada koneksi. Di-precache
 * saat install supaya selalu tersedia offline.
 */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-start gap-4 px-4 py-24 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Anda sedang offline</h1>
      <p className="max-w-prose text-muted">
        Koneksi terputus. Halaman yang sudah pernah dibuka mungkin masih bisa
        diakses dalam mode baca saja. Tindakan yang mengubah data (proses
        order, publish, simpan produk, dst.) memerlukan koneksi internet —
        Karyalo Manage tidak akan menampilkan perubahan sensitif sebagai
        berhasil saat offline (§27.4 Offline Write).
      </p>
    </div>
  );
}
