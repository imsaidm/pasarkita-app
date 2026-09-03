"use client";

import { useEffect } from "react";

/**
 * Global error boundary (PRD §52 Phase 1 — "Error boundary"; §41 Error
 * States — jangan tampilkan raw backend error ke customer).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[Karyalo] Unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-start gap-4 px-4 py-24 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Ada yang tidak beres</h1>
      <p className="max-w-prose text-muted">
        Terjadi kesalahan yang tidak terduga. Coba muat ulang halaman ini.
      </p>
      <button
        onClick={reset}
        className="tap-target rounded-full bg-karyalo-green px-5 py-2.5 text-sm font-medium text-warm-white"
      >
        Coba Lagi
      </button>
    </div>
  );
}
