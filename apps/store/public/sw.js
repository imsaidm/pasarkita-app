/**
 * Karyalo Storefront — Service Worker (Production Only)
 */

const CACHE_VERSION = "v2";
const CACHE_NAME = `karyalo-shell-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.json"];

self.addEventListener("install", (event) => {
  // Bypassed on localhost
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("karyalo-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Jangan pernah intersepsi jika di localhost / dev atau API / checkout / HMR
  if (
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1" ||
    url.pathname.startsWith("/checkout") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("webpack-hmr") ||
    url.pathname.includes("_next/webpack") ||
    url.pathname.includes("__nextjs")
  ) {
    return;
  }

  // Navigasi halaman: network-first, fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((res) => res ?? Response.error())
      )
    );
    return;
  }

  // Aset statis pada production live domain
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
