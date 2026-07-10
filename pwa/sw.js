const CACHE_NAME = 'attendora-v2';
const urlsToCache = [
  '../',
  '../index.html',
  'manifest.json',
  'sw.js',
  '../src/style/style.css',
  '../src/js/main.js',
  '../src/js/core/state.js',
  '../src/js/core/utils.js',
  '../src/js/core/firebase.js',
  '../src/js/core/firebase-config.js',
  '../src/js/ui/ui.js',
  '../src/js/ui/sidebar.js',
  '../src/js/ui/notifications.js',
  '../src/js/auth/auth.js',
  '../src/js/features/schedule.js',
  '../src/js/features/attendance.js',
  '../src/js/features/academics.js',
  '../src/js/features/gamification.js',
  '../src/js/features/scanner.js',
  '../src/js/services/cloud-sync.js',
  '../src/js/services/data.js',
  '../src/js/components/auth-html.js',
  '../src/js/components/dashboard-html.js',
  '../src/js/components/modals-html.js',
  '../src/js/components/landing-html.js',
  '../assets/images/android.png'
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
