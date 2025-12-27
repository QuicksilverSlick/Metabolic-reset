// Metabolic Reset Service Worker
// PWA installability + Push Notifications + Asset Caching

const CACHE_VERSION = 'v8';
const STATIC_CACHE = `metabolic-reset-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `metabolic-reset-dynamic-${CACHE_VERSION}`;

// Static assets to precache (shell)
const PRECACHE_ASSETS = [
  '/',
  '/app',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// File extensions that should use cache-first strategy (immutable assets)
const CACHE_FIRST_EXTENSIONS = ['.js', '.css', '.woff2', '.woff', '.ttf', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes(CACHE_VERSION))
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Helper: Check if request is for a static asset (hashed filename)
function isStaticAsset(url) {
  return CACHE_FIRST_EXTENSIONS.some(ext => url.includes(ext)) &&
         (url.includes('/assets/') || url.includes('-') && url.match(/\.[a-f0-9]{8}\./));
}

// Fetch event - smart caching strategies
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests - always go to network
  if (url.includes('/api/')) return;

  // Skip WebSocket and extension requests
  if (url.startsWith('ws') || url.includes('chrome-extension')) return;

  // STRATEGY 1: Cache-first for static assets (JS/CSS with hashes, fonts, images)
  // These have content hashes in filenames, so they're immutable
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // STRATEGY 2: Stale-while-revalidate for HTML pages
  // Show cached version immediately, update cache in background
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // STRATEGY 3: Network-first for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// ==========================================
// PUSH NOTIFICATION HANDLING
// ==========================================

// Handle push notification received
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: '28 Day Reset',
    body: 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    url: '/app'
  };

  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        url: payload.url || payload.data?.url || data.url,
        tag: payload.tag || 'default',
        data: payload.data || {}
      };
    } catch (e) {
      // If not JSON, use text
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: { url: data.url, ...data.data },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/app';

  // Handle action buttons
  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close (for analytics if needed)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Send new subscription to server
        return fetch('/api/push/resubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldEndpoint: event.oldSubscription.endpoint,
            newSubscription: subscription.toJSON()
          })
        });
      })
  );
});
