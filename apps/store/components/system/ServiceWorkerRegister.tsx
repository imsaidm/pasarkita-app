"use client";

import { useEffect } from "react";

/**
 * PWA Service Worker Registration Component.
 *
 * Mencegah auto-refresh loop:
 * Di localhost / development environment, Service Worker WAJIB dinonaktifkan
 * dan dibersihkan total dari cache browser agar tidak mengintersepsi
 * HMR / Fast Refresh chunk Next.js.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local") ||
      process.env.NODE_ENV !== "production";

    if (isLocalhost) {
      // Unregister semua Service Worker aktif di browser
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        })
        .catch(() => {});

      // Hapus seluruh cache Service Worker
      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) => {
            return Promise.all(keys.map((key) => caches.delete(key)));
          })
          .catch(() => {});
      }
      return;
    }

    // Hanya daftarkan di production live domain non-localhost
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[Karyalo] Service worker registration error:", err);
    });
  }, []);

  return null;
}
