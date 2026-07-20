const CACHE_NAME = "satukirjasto-v3";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Only handle same-origin app-shell requests; let ElevenLabs API calls pass straight through.
  if (new URL(event.request.url).origin !== self.location.origin) return;
  // Network-first: always try to get the freshest app code when online,
  // only fall back to the cached copy if the network request fails (offline).
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.ok){
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
