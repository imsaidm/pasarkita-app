import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-start gap-4 px-4 py-24 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Halaman tidak ditemukan</h1>
      <p className="max-w-prose text-muted">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="tap-target rounded-full bg-karyalo-green px-5 py-2.5 text-sm font-medium text-warm-white"
      >
        Kembali ke Home
      </Link>
    </div>
  );
}
