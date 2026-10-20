// Saves today's prices and card versions for every card in data/sets into data/prices/<set>.json,
// so the app loads a whole set's prices in one small file instead of one request per card.
// Prices: Cardmarket (EUR) and TCGplayer (USD) through TCGdex. Runs daily.
import fs from "node:fs/promises";
import path from "node:path";

const API = process.env.TCGDEX_API || "https://api.tcgdex.net/v2/en";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SETS = path.join(ROOT, "data", "sets"), OUT = path.join(ROOT, "data", "prices");

async function getJSON(url, tries = 4){
  for(let i = 0; i < tries; i++){
    try{
      const r = await fetch(url, {headers:{"User-Agent":"SetDex price copy (github.com/lucenttiara2272/setdex)"}});
      if(r.status === 404) return null;
      if(r.ok) return await r.json();
    }catch(e){}
    await new Promise(ok => setTimeout(ok, 1500 * (i + 1)));
  }
  return undefined;   // gave up: keep yesterday's value
}
const round = x => typeof x === "number" && isFinite(x) && x > 0 ? Math.round(x * 100) / 100 : undefined;
const CM = ["trend", "avg", "avg30", "trend-holo", "avg-holo", "avg30-holo"];
const TPV = ["normal", "holo", "holofoil", "reverse", "reverse-holofoil", "reverseHolofoil", "1st-edition", "firstEdition", "1stEditionHolofoil", "1st-edition-holofoil"];
function compact(c){
  const out = {}, v = c.variants || {}, cm = c.pricing?.cardmarket || {}, tp = c.pricing?.tcgplayer || {};
  out.variants = Object.fromEntries(["normal", "holo", "reverse", "firstEdition"].filter(k => v[k]).map(k => [k, true]));
  if(c.rarity) out.rarity = c.rarity;
  const cmo = {}; for(const k of CM){ const x = round(cm[k]); if(x !== undefined) cmo[k] = x; }
  const tpo = {}; for(const k of TPV){ const m = round(tp[k]?.marketPrice), mid = round(tp[k]?.midPrice); if(m || mid) tpo[k] = {...(m ? {marketPrice:m} : {}), ...(mid ? {midPrice:mid} : {})}; }
  if(Object.keys(cmo).length || Object.keys(tpo).length) out.pricing = {...(Object.keys(cmo).length ? {cardmarket:cmo} : {}), ...(Object.keys(tpo).length ? {tcgplayer:tpo} : {})};
  return out;
}

const files = (await fs.readdir(SETS)).filter(f => f.endsWith(".json"));
const jobs = [];
for(const f of files){
  const set = JSON.parse(await fs.readFile(path.join(SETS, f), "utf8"));
  const prev = await fs.readFile(path.join(OUT, f), "utf8").then(JSON.parse).catch(() => ({cards:{}}));
  jobs.push({id:set.id, cards:set.cards.map(c => c.id), prev:prev.cards || {}, out:{}});
}
const all = jobs.flatMap(j => j.cards.map(id => [j, id]));
let i = 0, ok = 0, missing = 0, failed = 0;
const start = Date.now();
await Promise.all(Array.from({length:12}, async () => {
  while(i < all.length){
    const [j, id] = all[i++];
    const c = await getJSON(`${API}/cards/${encodeURIComponent(id)}`);
    if(c === undefined){ failed++; if(j.prev[id]) j.out[id] = j.prev[id]; }
    else if(c === null) missing++;
    else { ok++; j.out[id] = compact(c); }
  }
}));
if(ok < all.length * 0.5) throw new Error(`Only ${ok} of ${all.length} cards answered, keeping yesterday's prices`);
await fs.mkdir(OUT, {recursive:true});
const updated = new Date().toISOString();
for(const j of jobs) await fs.writeFile(path.join(OUT, `${j.id}.json`), JSON.stringify({updated, cards:j.out}));
for(const f of await fs.readdir(OUT)) if(!files.includes(f)) await fs.rm(path.join(OUT, f));
console.log(`${ok} cards priced, ${missing} not in the API, ${failed} failed, ${jobs.length} sets, ${Math.round((Date.now() - start) / 1000)} s`);
