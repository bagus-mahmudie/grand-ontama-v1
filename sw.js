const CACHE_VERSION = "grand-ontama-v1.0.3";
const STATIC_CACHE = CACHE_VERSION;

const FILES_TO_CACHE = [
  "/",
  "/beranda.html",
  "/navbar.html",
  "/footer.html",
  "/assets/css/tailwind.css",
  "/assets/js/app.js",
  "/assets/img/favicon.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(async (cache) => {
        for (const file of FILES_TO_CACHE) {
          try {
            const response = await fetch(file, {
              cache: "reload",
            });

            if (response.ok) {
              await cache.put(file, response);
            } else {
              console.warn("Gagal cache:", file, response.status);
            }
          } catch (error) {
            console.warn("Gagal cache:", file, error);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  const isAudioOrVideo =
    request.destination === "audio" ||
    request.destination === "video" ||
    /\.(mp3|mp4|webm|ogg|wav|m4a)$/i.test(url.pathname);

  if (isAudioOrVideo) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          !response ||
          response.status !== 200 ||
          response.type === "opaque" ||
          response.type === "opaqueredirect"
        ) {
          return response;
        }

        const responseClone = response.clone();

        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, responseClone).catch(() => { });
        });

        return response;
      })
      .catch(() => caches.match(request))
  );
});