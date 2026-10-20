/* SetDex offline support.
   - The app itself is saved on the device, so it opens without internet.
     When online, the newest version of the page is loaded; other files refresh in the background.
   - Card pictures you've seen are kept, so sets still look complete offline.
   - GitHub (your sync) and price/exchange-rate requests are never cached here. */
const VERSION = "setdex-v2";
const SHELL = "shell-" + VERSION, IMAGES = "images-v1", MAX_IMAGES = 4000;
const SHELL_FILES = ["./", "index.html", "qrcode.js", "manifest.webmanifest",
  "fonts/outfit-400.woff2", "fonts/outfit-500.woff2", "fonts/outfit-600.woff2", "fonts/outfit-700.woff2", "fonts/outfit-800.woff2",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-64.png"];
const IMAGE_HOSTS = ["assets.tcgdex.net", "images.scrydex.com", "images.pokemontcg.io"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("shell-") && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function shell(req){
  const cache = await caches.open(SHELL);
  if(req.mode === "navigate"){
    // the app page: get the newest version when online (wait at most 3 s), otherwise use the saved one
    try{
      const r = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 3000))]);
      if(r.ok){ cache.put("index.html", r.clone()); return r; }
    }catch(e){}
    return (await cache.match("index.html")) || fetch(req);
  }
  const key = req;
  const hit = await cache.match(key, {ignoreSearch:true});
  const fresh = fetch(req).then(r => { if(r.ok) cache.put(key, r.clone()); return r; }).catch(() => null);
  return hit || (await fresh) || new Response("Offline", {status:503});
}
let trimming = false;
async function trim(cache){
  if(trimming) return; trimming = true;
  try{ const keys = await cache.keys(); for(let i = 0; i < keys.length - MAX_IMAGES; i++) await cache.delete(keys[i]); }
  finally{ trimming = false; }
}
async function image(req){
  const cache = await caches.open(IMAGES);
  const hit = await cache.match(req.url);
  if(hit) return hit;
  try{
    // ask with CORS so the stored copy isn't an "opaque" blob that eats storage
    const r = await fetch(req.url, {mode:"cors", credentials:"omit"});
    if(r.ok){ cache.put(req.url, r.clone()); trim(cache); }
    return r;
  }catch(e){
    try{ return await fetch(req); }catch(e2){ return new Response("", {status:504}); }
  }
}
self.addEventListener("fetch", e => {
  const req = e.request; if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin === location.origin) e.respondWith(shell(req));
  else if(IMAGE_HOSTS.includes(url.hostname)) e.respondWith(image(req));
  // everything else (TCGdex API, GitHub, exchange rates) goes straight to the network
});
