/* Service worker de Sudoku Club : permet à l'app installée de s'ouvrir même
 * sans connexion (les grilles libres sont générées dans le navigateur).
 * Règles volontairement simples et prudentes :
 *  - uniquement les requêtes GET de notre propre domaine (jamais pubs, GA, API) ;
 *  - pages : réseau d'abord (toujours à jour en ligne), copie en cache si hors ligne ;
 *  - fichiers /_next/static et icônes : cache d'abord (leur nom change à chaque version).
 * Pour forcer un nettoyage après un gros changement, incrémenter CACHE. */
const CACHE = "sc-v15"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/jouer", "/icons/icon-192.png"]))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return

  // Fichiers statiques versionnés : cache d'abord.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  // Pages : réseau d'abord, cache si hors ligne.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/jouer"))),
    )
  }
})
