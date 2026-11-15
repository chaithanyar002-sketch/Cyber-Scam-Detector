// Minimal service worker: makes the app installable and lets the UI shell open offline.
// API calls are never cached (a stale scam verdict would be worse than an error).
const CACHE = "scamcheck-shell-v1";
const SHELL = ["/", "/manifest.webmanifest", "/favicon.png", "/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // API lives on another origin

  if (req.mode === "navigate") {           // network first, fall back to cached shell offline
    e.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }
  e.respondWith(                            // static assets: cache first, fill cache on miss
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
