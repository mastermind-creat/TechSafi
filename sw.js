// Service Worker for TechSafi PWA
const CACHE_NAME = 'techsafi-v1.0.1';
const urlsToCache = [
    '/',
    'index.html',
    'about.html',
    'services.html',
    'portfolio.html',
    'contact.html',
    'pricing.html',
    'careers.html',
    'offline.html',
    'css/animations.css',
    'manifest.json',
    'images/icons/favicon/favicon-96x96.png',
    'images/icons/favicon/web-app-manifest-192x192.png',
    'images/icons/favicon/web-app-manifest-512x512.png',
    'images/icons/favicon/apple-touch-icon.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                // Cache files individually to avoid failure if one file is missing
                return Promise.all(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(err => {
                            console.log('[Service Worker] Failed to cache:', url, err);
                        });
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                self.skipWaiting();
            })
            .catch((error) => {
                console.log('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Strategy: Network First, falling back to Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response
                const responseToCache = response.clone();

                // Cache the fetched response
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                // If network fails, try to get from cache
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }

                    // If not in cache, return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('offline.html');
                    }
                });
            })
    );
});

// Background Sync for offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncForms());
    }
});

async function syncForms() {
    // Handle offline form submissions when back online
    console.log('[Service Worker] Syncing forms...');
}

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update from TechSafi!',
        icon: 'images/icons/favicon/web-app-manifest-192x192.png',
        badge: 'images/icons/favicon/favicon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: 'images/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: 'images/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('TechSafi', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
