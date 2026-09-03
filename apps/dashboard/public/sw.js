/**
 * Karyalo Manage — service worker (PRD §27 PWA and Offline Behavior).
 *
 * §27.1 PWA Baseline — P0: installable, offline read fallback.
 * §27.4 Offline Write — "no silent critical sync": mutation (POST/PUT/
 * PATCH/DELETE) TIDAK PERNAH dilayani dari cache atau dianggap berhasil
 * di sini — hanya method GET yang disentuh SW ini sama sekali (lihat
 * guard `request.method !== "GET"` di bawah), method lain selalu lolos
 * langsung ke network asli tanpa campur tangan.
 *
 * Strategi sama dengan Karyalo_Storefront_PWA/public/sw.js (network-first
 * untuk navigasi HTML, stale-while-revalidate untuk aset statis
 * ter-hash) — lihat komentar di file itu untuk rasional lengkap.
 *
 * **Diperbarui 16 Agustus 2026 — event `push`/`notificationclick` (di
 * bagian bawah file):** ini bagian yang membuat push notification order
 * baru (PRD §16.3/16.4) benar-benar muncul sebagai notifikasi OS, bahkan
 * kalau app Manage sedang tertutup total — service worker tetap dibangunkan
 * browser saat ada push masuk, terlepas dari status app. Payload dikirim
 * dari `Karyalo_Storefront_PWA/convex/notificationActions.ts`.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `karyalo-manage-shell-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [OFFLINE_URL, "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("karyalo-manage-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Mutation (write) TIDAK PERNAH disentuh SW — selalu langsung ke network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((res) => res ?? Response.error())
      )
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? networkFetch;
      })
    );
  }
});

// --- Push notification (PRD §16.3/16.4 New-Order Push Notification) ---
//
// Payload dikirim dari convex/notificationActions.ts sebagai JSON:
// { title, body, orderId }. `orderId` null untuk tes notifikasi
// (lihat sendTestPushNotification), berisi Convex order ID sungguhan
// untuk order asli — dipakai untuk deep link.
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Payload bukan JSON valid — jangan crash SW, tampilkan notifikasi
    // generik supaya admin tetap tahu ada sesuatu, daripada silent fail.
    payload = { title: "Karyalo Manage", body: event.data.text() || "Ada pembaruan baru." };
  }

  const title = payload.title || "Karyalo Manage";
  const url = payload.orderId ? `/orders/live/${payload.orderId}` : "/notifications";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
      // Deep link tetap butuh auth ulang di sisi app (§16.4) — SW hanya
      // membuka URL-nya, bukan melakukan otorisasi apa pun di sini.
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        // Kalau app sudah terbuka di tab/window manapun, fokuskan &
        // navigasi ke situ (jangan buka tab baru berkali-kali).
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(targetUrl);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
