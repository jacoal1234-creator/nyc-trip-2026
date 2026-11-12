/* Service worker: la página funciona sin internet (metro, avión).
   - Página, scripts y estilos: se sirven de la caché y se actualizan por detrás.
   - Datos (CSV) y clima: primero la red; si no hay señal, lo último guardado.
   - Mapa: guarda los pedazos de mapa que ya vieron (máx. ~400). */
const V = "nyc26-v1";
const SHELL = [
  "./", "index.html", "city3d.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "data/itinerario.csv", "data/reservas.csv", "data/opciones.csv", "data/rutas.csv", "data/inspiracion.csv", "data/emergencia.csv",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u =>
    c.add(new Request(u, { mode: u.startsWith("http") ? "cors" : "same-origin" })).catch(() => null)
  ))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== "nyc26-tiles").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirst(req) {
  const c = await caches.open(V);
  try {
    const r = await fetch(req);
    if (r && r.ok) c.put(stripQuery(req), r.clone());
    return r;
  } catch (e) {
    const hit = await c.match(stripQuery(req)) || await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw e;
  }
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(V);
  const hit = await c.match(req, { ignoreSearch: req.mode === "navigate" });
  const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || (req.mode === "navigate" ? c.match("index.html") : Response.error());
}
async function tiles(req) {
  const c = await caches.open("nyc26-tiles");
  const hit = await c.match(req);
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r && (r.ok || r.type === "opaque")) {
      c.put(req, r.clone());
      c.keys().then(ks => { if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(k => c.delete(k)); });
    }
    return r;
  } catch (e) { return Response.error(); }
}
function stripQuery(req) { const u = new URL(req.url); u.search = ""; return u.toString(); }

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.hostname.endsWith("tile.openstreetmap.org")) return e.respondWith(tiles(req));
  if (u.hostname === "api.open-meteo.com") return e.respondWith(networkFirst(req));
  if (u.origin === location.origin && u.pathname.endsWith(".csv")) return e.respondWith(networkFirst(req));
  if (req.mode === "navigate") return e.respondWith(networkFirst(req).catch(() => caches.match("index.html")));
  if (u.origin === location.origin || /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|i\.ytimg\.com|unpkg\.com/.test(u.hostname))
    return e.respondWith(staleWhileRevalidate(req));
});
