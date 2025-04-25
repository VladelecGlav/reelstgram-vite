const CACHE_NAME = 'reelstgram-vite-cache-v3'; // Обновляем имя кэша

const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Установка сервис-воркера и кэширование ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  // Заставляем сервис-воркер сразу активироваться
  self.skipWaiting();
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Если ресурс есть в кэше, возвращаем его
      if (response) {
        // Проверяем, не устарел ли ресурс, делая запрос к сети
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          }
          return response;
        }).catch(() => response); // Если сети нет, возвращаем кэшированный ресурс
      }
      // Если ресурса нет в кэше, делаем запрос к сети
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Если запрос не удался (например, оффлайн), возвращаем fallback
        return caches.match('/index.html');
      });
    })
  );
});

// Очистка старых кэшей при активации нового сервис-воркера
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Заставляем сервис-воркер взять контроль над страницей сразу после активации
      return self.clients.claim();
    })
  );
});