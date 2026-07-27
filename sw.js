// Service Worker for Attendora Push Notifications & PWA Offline Caching

const CACHE_VERSION = 'v5';
const CACHE_NAME = `attendora-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/pwa/manifest.json',
  '/sw.js',
  '/src/style/style.css',
  '/src/js/main.js',
  '/src/js/core/state.js',
  '/src/js/core/utils.js',
  '/src/js/core/cache.js',
  '/src/js/ui/ui.js',
  '/src/js/ui/sidebar.js',
  '/src/js/ui/notifications.js',
  '/src/js/auth/auth.js',
  '/src/js/features/schedule.js',
  '/src/js/features/attendance.js',
  '/src/js/features/academics.js',
  '/src/js/features/gamification.js',
  '/src/js/features/scanner.js',
  '/src/js/services/cloud-sync.js',
  '/src/js/services/data.js',
  '/src/js/services/app-helpers.js',
  '/src/js/components/auth-html.js',
  '/src/js/components/dashboard-html.js',
  '/src/js/components/modals-html.js',
  '/src/js/components/landing-html.js',
  '/assets/images/fevicon.png',
  '/assets/images/fevicon-192.png',
  '/assets/images/fevicon-512.png',
  '/assets/images/logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
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
  if (url.origin !== location.origin) return;
  // Network-first: try fresh content, fall back to cache for offline
  e.respondWith(
    fetch(e.request).then(res => {
      return caches.open(CACHE_NAME).then(cache => {
        try { cache.put(e.request, res.clone()); } catch (err) {}
        return res;
      });
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
  );
});

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    let data = { title: 'Class Reminder', body: 'You have a class starting soon.', url: '/' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const title = data.title;
    const options = {
        body: data.body,
        icon: '/assets/images/fevicon.png',
        badge: '/assets/images/fevicon.png',
        data: { url: data.url || '/' },
        vibrate: [200, 100, 200, 100, 200, 100, 200]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
