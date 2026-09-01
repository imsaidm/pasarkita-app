"use client";

/**
 * Next.js mewajibkan file terpisah untuk error yang terjadi di root layout
 * itu sendiri (bukan di halaman) — harus mendefinisikan <html>/<body>
 * sendiri karena root layout dianggap sudah gagal. app/error.tsx (tanpa
 * "global") menangani error di level halaman biasa, di mana header/footer
 * dari root layout tetap tampil.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div style={{ padding: "4rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Ada yang tidak beres
          </h1>
          <p style={{ color: "#5C6962", marginTop: "0.5rem" }}>
            Aplikasi gagal dimuat. Coba muat ulang halaman ini.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              borderRadius: 9999,
              background: "#185C4D",
              color: "#FCFBF7",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
