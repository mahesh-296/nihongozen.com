// ─── NihongoZen Service Worker ───────────────────────
// Uses RELATIVE paths so it works on GitHub Pages,
// Firebase Hosting, Netlify, and custom domains equally.

const CACHE_NAME = 'nihongozen-v3';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './onboarding-language.html',
  './onboarding-level.html',
  './manifest.json',
  './css/tokens.css',
  './css/layout.css',
  './css/components.css',
  './css/dashboard.css',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll fails if even one file 404s — we use individual adds
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only cache same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // Offline: serve the cached copy if we have one. For page
        // navigations with no cached copy, fall back to the cached
        // dashboard shell so the app still opens instead of showing
        // the browser's default offline error page.
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') return caches.match('./index.html');
        });
      })
  );
});

