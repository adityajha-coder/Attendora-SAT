const CACHE_NAME = 'attendora-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/style/style.css',
  '/src/js/main.js',
  '/src/js/utils.js',
  '/src/js/state.js',
  '/src/js/ui.js',
  '/src/js/auth.js',
  '/src/js/schedule.js',
  '/src/js/attendance.js',
  '/src/js/academics.js',
  '/src/js/gamification.js',
  '/src/js/badge.js',
  '/android.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Only handle same-origin requests
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
    return caches.open(CACHE_NAME).then(cache => {
      try { cache.put(e.request, res.clone()); } catch(e){}
      return res;
    });
  }).catch(() => caches.match('/index.html'))));
});
