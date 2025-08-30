self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open('hyper-shell-v1');
    await cache.addAll([
      '/',
      '/manifest.webmanifest',
      '/favicon.ico'
    ]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic runtime cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const fetchPromise = fetch(request).then((res) => {
      const copy = res.clone();
      caches.open('hyper-shell-v1').then((c) => c.put(request, copy));
      return res;
    }).catch(()=> cached);
    return cached || fetchPromise;
  })());
});

// Push handling
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {} } catch {}
  const title = data.title || 'HYPER update';
  const body  = data.body  || 'Something completed.';
  const url   = data.url   || '/';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    data: { url }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
