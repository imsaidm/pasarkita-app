"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration — PWA Baseline
 * Hanya diaktifkan saat Production untuk mencegah HMR conflict di lokal.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[Karyalo Manage] Service worker registration:", err);
      });
    }
  }, []);

  return null;
}
