self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("chat-in-v2").then((cache) => cache.addAll([
      "./",
      "./index.html",
      "./app.js",
      "./styles.css",
      "./manifest.json",
      "./icon-192.png",
      "./icon-512.png"
    ]))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
