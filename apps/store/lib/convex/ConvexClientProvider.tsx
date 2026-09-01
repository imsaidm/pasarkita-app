"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

/**
 * API client layer (PRD §52 Phase 1 — "API client layer"; §40 API Design
 * Expectations — storefront berkomunikasi lewat service boundary, bukan
 * menghitung inventory/harga/promo sendiri di frontend).
 *
 * TODO integrasi: `NEXT_PUBLIC_CONVEX_URL` masih kosong (belum ada project
 * Convex baru untuk prototype ini — lihat PROTOTYPE_STOREFRONT_PWA_README.md).
 * Selama kosong, provider ini SENGAJA tidak membuat client (children tetap
 * dirender apa adanya) supaya app shell/routing/PWA baseline Fase 1 tetap
 * bisa di-review tanpa backend nyata — bukan silent failure, ada warning
 * eksplisit di console dev.
 *
 * PENTING (diperbaiki 16 Agustus 2026): komponen ini "use client" tapi
 * tetap di-SSR (dirender di server dulu untuk HTML awal) — jadi
 * console.warn() di dalam useMemo sebelumnya ikut tercetak di terminal
 * server, BUKAN cuma di console browser. Karena setiap request dev
 * (`GET /`) me-render ulang dari nol tanpa memoization lintas-request,
 * warning-nya muncul di tiap baris log request, persis yang dilaporkan
 * pemilik proyek ("ini pesan di tiap command"). Sekarang warning HANYA
 * dicetak di browser (`typeof window !== "undefined"`) dan HANYA sekali
 * per sesi browser (flag modul `hasWarnedMissingConvexUrl`), bukan lagi
 * tiap render/request.
 */
let hasWarnedMissingConvexUrl = false;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!convexUrl) {
      if (
        process.env.NODE_ENV !== "production" &&
        typeof window !== "undefined" &&
        !hasWarnedMissingConvexUrl
      ) {
        hasWarnedMissingConvexUrl = true;
        // eslint-disable-next-line no-console
        console.warn(
          "[Karyalo] NEXT_PUBLIC_CONVEX_URL belum diisi — halaman yang butuh data " +
            "backend (katalog, cart, order, dst.) belum akan berfungsi. Ini " +
            "diharapkan pada Fase 1 (Foundation); lihat PROTOTYPE_STOREFRONT_PWA_README.md."
        );
      }
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
