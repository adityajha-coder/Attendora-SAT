const CACHE_NAME = 'attendora-v2';
const urlsToCache = [
  '',
  'index.html',
  'src/style/style.css',
  'src/js/main.js',
  'src/js/utils.js',
  'src/js/state.js',
  'src/js/ui.js',
  'src/js/auth.js',
  'src/js/schedule.js',
  'src/js/attendance.js',
  'src/js/academics.js',
  'src/js/gamification.js',
  'src/js/badge.js',
  'assets/images/android.png',
  'manifest.json'
];

const toScopedUrl = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener('install', (e) => {
  const scopedUrls = urlsToCache.map(toScopedUrl);
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(scopedUrls)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Only handle same-origin requests
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      return caches.open(CACHE_NAME).then(cache => {
        try { cache.put(e.request, res.clone()); } catch (err) {}
        return res;
      });
    }).catch(() => caches.match(toScopedUrl('index.html')) || caches.match(toScopedUrl(''))))
  );
});
