const VERSION = "v32";
const CORE = `pokewereld-core-${VERSION}`;
const RUNTIME = `pokewereld-runtime-${VERSION}`;
const SHELL = [
  "./", "index.html", "style.css", "dark.css", "favicon.svg", "manifest.webmanifest",
  "i18n.js", "live.js", "nav.js", "app.js", "game.js", "items.js", "articles-more.js", "articles.js", "websites.js",
  "walkthrough-data.js", "walkthrough-extra.js", "battle-data.js", "elite.js", "secrets-guide.js", "team.js",
  "walkthrough.js", "coloring.js", "wallpapers.js", "pokemon-illustrations.js", "regions.js", "album.js", "cards.js", "tcg-deck.js", "tools.js", "news.js", "emulator.js", "home.js", "dashboard.js", "site.js", "adsense.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CORE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CORE && k !== RUNTIME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

// Eerst het netwerk, bij geen verbinding de opgeslagen versie
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !/^https?:/.test(req.url)) return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  if (sameOrigin && new URL(req.url).pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(sameOrigin ? CORE : RUNTIME).then((c) => { c.put(req, copy); if (!sameOrigin) trim(c, 600); });
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
