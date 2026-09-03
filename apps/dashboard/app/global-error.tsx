"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="mx-auto max-w-xl px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-ink">
            Ada yang tidak beres
          </h1>
          <p className="mt-2 text-sm text-muted">
            Aplikasi gagal dimuat. Coba muat ulang halaman ini.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-deep-pine px-5 py-2.5 text-sm font-semibold text-warm-white hover:bg-karyalo-green"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
