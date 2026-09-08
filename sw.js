/* Offline-first service worker — keeps the game playable as an installed mobile PWA. */
const CACHE = "sky-tycoon-v1";
const ASSETS = ["./", "./index.html", "./css/style.css", "./js/data.js", "./js/game.js", "./js/ui.js", "./manifest.webmanifest"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match("./index.html"))));
});
