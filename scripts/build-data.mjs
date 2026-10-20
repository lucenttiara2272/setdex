// Copies the card database into data/ so SetDex can load it from its own site.
//   data/sets.json          all physical sets (no TCG Pocket)
//   data/sets/<id>.json     the card list of each set
//   data/logos, data/symbols  set logos and symbols
// Card data: TCGdex (MIT license, see data/LICENSE-TCGdex.txt).
// Logos/symbols that TCGdex lacks come from the Pokémon TCG API.
// Card pictures and prices are NOT copied; the app loads those live.
import fs from "node:fs/promises";
import path from "node:path";

const API = process.env.TCGDEX_API || "https://api.tcgdex.net/v2/en";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "data");

// the Pokémon TCG API set ids live in index.html, so there is one list to keep up to date
const html = await fs.readFile(path.join(ROOT, "index.html"), "utf8");
const PTCG = JSON.parse(html.match(/const PTCG = (\{.*?\});/)[1]);
const SCRYDEX = new Set(JSON.parse(html.match(/const PTCG_SCRYDEX = new Set\((\[.*?\])\);/)[1]));
const ptcgArt = (id, kind) => { const pid = PTCG[id]; if(!pid) return null;
  return SCRYDEX.has(pid) ? `https://images.scrydex.com/pokemon/${pid}-${kind}/${kind}` : `https://images.pokemontcg.io/${pid}/${kind}.png`; };

async function get(url, tries = 4){
  for(let i = 0; i < tries; i++){
    try{
      const r = await fetch(url, {headers:{"User-Agent":"SetDex data mirror (github.com/lucenttiara2272/setdex)"}});
      if(r.status === 404) return null;
      if(r.ok) return r;
    }catch(e){}
    await new Promise(ok => setTimeout(ok, 1000 * (i + 1)));
  }
  throw new Error("Failed: " + url);
}
const getJSON = async url => { const r = await get(url); return r ? r.json() : null; };
async function writeIfChanged(file, data){
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  try{ if(Buffer.compare(await fs.readFile(file), buf) === 0) return false; }catch(e){}
  await fs.mkdir(path.dirname(file), {recursive:true});
  await fs.writeFile(file, buf); return true;
}
async function image(urls, base){
  for(const u of urls.filter(Boolean)){
    let r; try{ r = await get(u, 2); }catch(e){ continue; }
    if(!r) continue;
    const type = r.headers.get("content-type") || "";
    if(!type.startsWith("image/")) continue;
    const ext = type.includes("webp") ? "webp" : type.includes("svg") ? "svg" : type.includes("jpeg") ? "jpg" : "png";
    const buf = Buffer.from(await r.arrayBuffer());
    if(buf.length < 100) continue;
    // remove an older copy with another extension
    for(const e of ["webp", "png", "jpg", "svg"]) if(e !== ext) await fs.rm(`${base}.${e}`, {force:true});
    await writeIfChanged(`${base}.${ext}`, buf);
    return path.relative(ROOT, `${base}.${ext}`).split(path.sep).join("/");
  }
  return "";
}
async function pool(items, n, fn){
  const out = []; let i = 0;
  await Promise.all(Array.from({length:n}, async () => { while(i < items.length){ const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

// TCGdex's source files (cloned by the workflow) are sometimes ahead of its live API,
// e.g. the RGB Mews in 30th Celebration. Cards found there but not in the API are added.
const repoCards = {};
if(process.env.TCGDEX_REPO){
  const base = path.join(process.env.TCGDEX_REPO, "data");
  for(const serie of await fs.readdir(base, {withFileTypes:true})){
    if(!serie.isDirectory()) continue;
    for(const f of await fs.readdir(path.join(base, serie.name))){
      if(!f.endsWith(".ts")) continue;
      const src = await fs.readFile(path.join(base, serie.name, f), "utf8");
      const id = (src.match(/\bid:\s*["']([^"']+)["']/) || [])[1];
      const dir = path.join(base, serie.name, f.slice(0, -3));
      if(!id) continue;
      const files = await fs.readdir(dir).catch(() => []);
      repoCards[id] = [];
      for(const cf of files){
        if(!cf.endsWith(".ts")) continue;
        const cs = await fs.readFile(path.join(dir, cf), "utf8");
        const name = (cs.match(/\bname:\s*\{[^}]*?\ben:\s*(["'])(.*?)\1/s) || [])[2];
        if(name) repoCards[id].push({localId:cf.slice(0, -3), name});
      }
    }
  }
  console.log(`Read ${Object.keys(repoCards).length} sets from the TCGdex source files`);
}
const byNumber = (a, b) => (parseInt(a.localId, 10) || 1e9) - (parseInt(b.localId, 10) || 1e9) || a.localId.localeCompare(b.localId);

const list = await getJSON(API + "/sets");
if(!Array.isArray(list) || list.length < 100) throw new Error("Set list looks wrong, stopping so nothing gets deleted");
let changed = 0;
const sets = (await pool(list, 6, async s => {
  const d = await getJSON(`${API}/sets/${encodeURIComponent(s.id)}`);
  if(!d || d.serie?.id === "tcgp") return null;   // TCG Pocket is a phone game, not physical cards
  const cards = (d.cards || []).map(c => ({id:c.id, localId:String(c.localId), name:c.name, ...(c.image ? {image:c.image} : {})}));
  const have = new Set(cards.map(c => c.localId));
  const extra = (repoCards[d.id] || []).filter(c => !have.has(c.localId)).sort(byNumber).map(c => ({id:`${d.id}-${c.localId}`, localId:c.localId, name:c.name}));
  if(extra.length){ cards.push(...extra); console.log(`${d.id}: added ${extra.length} cards from the source files (${extra.map(c => c.localId).join(", ")})`); }
  const set = {id:d.id, name:d.name, logo:d.logo || "", symbol:d.symbol || "", serie:{id:d.serie?.id || "", name:d.serie?.name || ""},
    releaseDate:d.releaseDate || "", cardCount:{total:Math.max(d.cardCount?.total ?? 0, cards.length), official:d.cardCount?.official ?? 0}, cards};
  if(await writeIfChanged(path.join(OUT, "sets", `${d.id}.json`), JSON.stringify(set))) changed++;
  const logoFile = await image([d.logo && d.logo + ".webp", d.logo && d.logo + ".png", ptcgArt(d.id, "logo")], path.join(OUT, "logos", d.id));
  const symbolFile = await image([d.symbol && d.symbol + ".webp", d.symbol && d.symbol + ".png", ptcgArt(d.id, "symbol")], path.join(OUT, "symbols", d.id));
  return {id:d.id, name:d.name, logo:d.logo || "", symbol:d.symbol || "", logoFile, symbolFile, total:set.cardCount.total, official:set.cardCount.official, serie:set.serie.id, releaseDate:set.releaseDate};
})).filter(Boolean);

// keep the database's own order (oldest first), like the API
const order = new Map(list.map((s, i) => [s.id, i]));
sets.sort((a, b) => order.get(a.id) - order.get(b.id));
const index = {source:"TCGdex (MIT license)", sets};
const prev = await fs.readFile(path.join(OUT, "sets.json"), "utf8").then(JSON.parse).catch(() => null);
if(!prev || JSON.stringify(prev.sets) !== JSON.stringify(sets) || changed){
  await writeIfChanged(path.join(OUT, "sets.json"), JSON.stringify({...index, updated:new Date().toISOString()}));
}
// drop files for sets the database removed
const keep = new Set(sets.map(s => s.id));
for(const dir of ["sets", "logos", "symbols"]){
  for(const f of await fs.readdir(path.join(OUT, dir)).catch(() => [])){
    const id = f.replace(/\.(json|webp|png|jpg|svg)$/, "");
    if(!keep.has(id)) await fs.rm(path.join(OUT, dir, f));
  }
}
console.log(`${sets.length} sets, ${sets.reduce((a, s) => a + s.total, 0)} cards, ${changed} set files changed, ` +
  `${sets.filter(s => s.logoFile).length} logos, ${sets.filter(s => s.symbolFile).length} symbols`);
