// Yarn Basket money check: no wrong price and nothing that isn't for sale can reach a shopper.
// Usage: npm run check:money                 (against the local `shopify theme dev` server)
//        node tools/money-check.mjs --url http://127.0.0.1:9393/
// No browser, only requests, so it takes a minute or two. Exits non-zero if any check fails.
// Why it exists (docs/decisions.md, 2026-10-05): a ₹599 test "Daisy Crochet Flower Pot" sat in the cart's Saved row
// beside the real one at ₹229, and nothing we ran looked at prices.
//
// What it proves:
//   1. The price rule (tools/catalog/costs.json through catalog_pricing.py) = the store's price, for every variant.
//   2. Every price the theme shows is the store's: product pages (each variant, and the JSON-LD sent to Google),
//      and every card on every page it can reach by following links from the home page, plus search, the cart's
//      suggestions and the cards the Saved page and the swipe rows ask for. A new section that lists products is
//      covered without adding it here.
//   3. Nothing that isn't for sale (tag "test-product" or "free-gift") is linked from any of those pages.
//   4. The cart charges the store's price, and the money-off steps and free delivery start where Theme settings say.
//   5. One name, one product; one SKU, one variant.
// What it cannot see: Shopify's checkout page itself, and a price typed by hand in the admin until the next run.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const BASE = (args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://127.0.0.1:9292/').replace(/\/$/, '');
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const MAX_PAGES = 260;

const results = [];
const record = (name, ok, detail) => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(58)} ${detail}`); };
const warn = (text) => console.log(`WARN  ${text}`);
const few = (list, n = 6) => (list.length ? `${list.slice(0, n).join('; ')}${list.length > n ? `; and ${list.length - n} more` : ''}` : 'none');

/* ---------- Requests ---------- */
const jar = new Map();
const get = async (path, opts = {}) => {
  for (let tries = 0; ; tries++) {
    try {
      const res = await fetch(BASE + path, { redirect: 'follow', ...opts, headers: { ...(opts.headers || {}), ...(opts.cart ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {}) } });
      if (opts.cart) res.headers.getSetCookie().forEach((c) => { const [pair] = c.split(';'); const at = pair.indexOf('='); jar.set(pair.slice(0, at), pair.slice(at + 1)); });
      if (res.status === 429 || res.status >= 500) throw new Error(`status ${res.status}`);
      return res;
    } catch (err) {
      if (tries >= 3) throw new Error(`${path}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500 * (tries + 1)));
    }
  }
};
const text = (path) => get(path).then((r) => (r.ok ? r.text() : ''));
const json = (path, opts) => get(path, opts).then((r) => r.json());
const post = (path, body) => get(path, { method: 'POST', cart: true, headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body || {}) }).then((r) => r.json().catch(() => ({})));
const pool = async (items, work, size = 5) => {
  const out = [];
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (next < items.length) { const i = next++; out[i] = await work(items[i], i); } }));
  return out;
};

/* ---------- What the store sells ---------- */
const reachable = await get('/products.json?limit=1').then((r) => r.ok, () => false);
if (!reachable) {
  console.error(`Money check: nothing answers at ${BASE}. Start \`shopify theme dev\` first (in theme/), or pass --url.`);
  process.exit(2);
}
const rupees = (n) => Math.round(+n * 100);
const all = [];
for (let page = 1; ; page++) {
  const batch = (await json(`/products.json?limit=250&page=${page}`)).products;
  all.push(...batch);
  if (batch.length < 250) break;
}
const tags = (p) => [].concat(p.tags).flatMap((t) => String(t).split(',')).map((t) => t.trim());
const settings = JSON.parse(readFileSync(join(ROOT, 'theme/config/settings_data.json'), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, '')).current;
const isGift = (p) => tags(p).includes('free-gift') || p.handle === settings.gift_product;
const isTest = (p) => tags(p).includes('test-product');
const real = all.filter((p) => !isGift(p) && !isTest(p));
const offSale = all.filter((p) => isGift(p) || isTest(p));
const byHandle = new Map(all.map((p) => [p.handle, p]));
const offHandles = new Set(offSale.map((p) => p.handle));
const realHandles = new Set(real.map((p) => p.handle));
console.log(`Money check against ${BASE}: ${real.length} products for sale, ${offSale.length} not for sale (test products and the free gift)\n`);

/* ---------- 1. The price rule = the store's price ---------- */
const rule = JSON.parse(execFileSync('python3', ['-B', '-c', `
import json, sys
sys.path.insert(0, 'tools')
from catalog_pricing import price_of
d = json.load(open('tools/catalog/catalog.json'))
print(json.dumps({p['handle']: {v['sku']: price_of(d, p, v) for v in p['variants']} for p in d['products']}))
`], { cwd: ROOT, encoding: 'utf8' }));
{
  const wrong = [];
  for (const p of real) {
    if (!rule[p.handle]) { wrong.push(`${p.handle} is in the store but not in tools/catalog/catalog.json`); continue; }
    for (const v of p.variants) {
      const want = rule[p.handle][v.sku];
      if (want === undefined) wrong.push(`${p.handle} ${v.sku || v.title}: not in the catalogue`);
      else if (rupees(v.price) !== want * 100) wrong.push(`${p.handle} ${v.sku}: store ₹${+v.price}, rule ₹${want}`);
      if (v.compare_at_price) wrong.push(`${p.handle} ${v.sku}: has a compare-at price (₹${+v.compare_at_price}) the catalogue doesn't declare`);
    }
    Object.keys(rule[p.handle]).filter((sku) => !p.variants.some((v) => v.sku === sku)).forEach((sku) => wrong.push(`${p.handle} ${sku}: in the catalogue, not in the store`));
  }
  Object.keys(rule).filter((h) => !realHandles.has(h)).forEach((h) => wrong.push(`${h}: in the catalogue, not on sale in the store`));
  const count = real.reduce((n, p) => n + p.variants.length, 0);
  record('Store price = the price rule, every variant', wrong.length === 0, wrong.length ? few(wrong) : `${count} variants of ${real.length} products`);
}

/* ---------- 5. One name, one product ---------- */
{
  const names = new Map();
  all.forEach((p) => names.set(p.title.trim().toLowerCase(), [...(names.get(p.title.trim().toLowerCase()) || []), p]));
  const clashes = [...names.values()].filter((list) => list.length > 1);
  const realClash = clashes.filter((list) => list.filter((p) => !isTest(p)).length > 1).map((list) => `"${list[0].title}" (${list.map((p) => p.handle).join(', ')})`);
  clashes.filter((list) => list.filter((p) => !isTest(p)).length === 1).forEach((list) => warn(`a test product shares the name "${list[0].title}" (${list.map((p) => p.handle).join(', ')}): hidden by the theme, delete or rename it before launch`));
  record('No two products for sale share a name', realClash.length === 0, few(realClash));
  const skus = new Map();
  real.forEach((p) => p.variants.forEach((v) => skus.set(v.sku, [...(skus.get(v.sku) || []), p.handle])));
  const blank = real.filter((p) => p.variants.some((v) => !v.sku)).map((p) => p.handle);
  const shared = [...skus].filter(([sku, list]) => sku && list.length > 1).map(([sku, list]) => `${sku} (${list.join(', ')})`);
  record('Every variant for sale has its own SKU', shared.length === 0 && blank.length === 0, shared.length || blank.length ? few([...shared, ...blank.map((h) => `${h}: no SKU`)]) : `${skus.size} SKUs`);
}

/* ---------- 2. Every price shown is the store's ---------- */
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const amounts = (s) => (s.match(/[\d][\d,]*(?:\.\d+)?/g) || []).map((n) => rupees(n.replace(/,/g, '')));
const handleIn = (s) => s.match(/\/products\/([a-z0-9][a-z0-9-]*)/)?.[1];
// What a card should say (snippets/price.liquid): "From" and the lowest price when prices differ, else the price.
const cardPrice = (p) => {
  const prices = p.variants.map((v) => rupees(v.price));
  const first = p.variants.find((v) => v.available) || p.variants[0];
  return { from: new Set(prices).size > 1, amount: new Set(prices).size > 1 ? Math.min(...prices) : rupees(first.price) };
};
// Every card price on a page, with the product link that comes before it.
const cardsOn = (html) => {
  const found = [];
  const price = /<p class="price[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
  for (let m; (m = price.exec(html)); ) {
    const before = html.slice(Math.max(0, m.index - 6000), m.index);
    const links = before.match(/href="[^"]*\/products\/[a-z0-9][a-z0-9-]*/g);
    found.push({ handle: links ? handleIn(links.at(-1)) : '', shown: strip(m[1]) });
  }
  return found;
};
const linksOn = (html) => [...new Set((html.match(/(?:href|data-url|action)="[^"]*\/products\/[a-z0-9][a-z0-9-]*/g) || []).map(handleIn))];

const cardFaults = [];
const offLinks = [];
let cardCount = 0;
const surfaces = new Set();
const inspect = (path, html, { own } = {}) => {
  linksOn(html).filter((h) => offHandles.has(h) && h !== own).forEach((h) => offLinks.push(`${path} links to ${h}`));
  for (const card of cardsOn(html)) {
    const p = byHandle.get(card.handle);
    if (!p || offHandles.has(card.handle)) { if (card.handle !== own) cardFaults.push(`${path}: a price (${card.shown}) for ${card.handle || 'no product'}`); continue; }
    cardCount++;
    surfaces.add(path.replace(/[?].*$/, '').replace(/\/[^/]+$/, '/…'));
    const want = cardPrice(p);
    const got = amounts(card.shown);
    const says = /from/i.test(card.shown);
    if (got[0] !== want.amount || says !== want.from) cardFaults.push(`${path}: ${card.handle} shows "${card.shown}", should be "${want.from ? 'From ' : ''}₹${want.amount / 100}"`);
  }
};

// Product pages: the price for each variant, the price sent to Google, and the rows the page asks for afterwards.
const later = new Set();
{
  const faults = [];
  let pages = 0;
  const jobs = real.flatMap((p) => [{ p, v: null }, ...(p.variants.length > 1 ? p.variants.map((v) => ({ p, v })) : [])]);
  await pool(jobs, async ({ p, v }) => {
    const path = `/products/${p.handle}${v ? `?variant=${v.id}` : ''}`;
    const html = await text(path);
    pages++;
    const chosen = v || p.variants.find((x) => x.available) || p.variants[0];
    const shown = [...html.matchAll(/data-price-now[^>]*>([^<]*)/g)].map((m) => amounts(m[1])[0]);
    if (!shown.length) faults.push(`${path}: no price on the page`);
    else if (shown.some((n) => n !== rupees(chosen.price))) faults.push(`${path}: shows ₹${shown.map((n) => n / 100).join(' and ₹')}, the store charges ₹${+chosen.price}`);
    if (!v) {
      const offers = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { try { const j = JSON.parse(m[1]); return [].concat(j['@graph'] || j); } catch { return [{ '@type': 'unparsable' }]; } })
        .filter((g) => g['@type'] === 'Product' || g['@type'] === 'ProductGroup').flatMap((g) => [].concat(g.offers || [], ...[].concat(g.hasVariant || []).map((x) => x.offers || [])));
      const sent = new Set(offers.flatMap((o) => [o.price, o.lowPrice, o.highPrice]).filter((n) => n !== undefined).map(rupees));
      const store = new Set(p.variants.map((x) => rupees(x.price)));
      if (!sent.size) faults.push(`${path}: no price in the data sent to Google`);
      else if ([...sent].some((n) => !store.has(n))) faults.push(`${path}: sends Google ₹${[...sent].map((n) => n / 100).join(', ₹')}, the store charges ₹${[...store].map((n) => n / 100).join(', ₹')}`);
      (html.match(/\/recommendations\/products\?[^"' ]+/g) || []).forEach((u) => later.add(u.replace(/&amp;/g, '&')));
      inspect(path, html);
    }
  });
  record('Product page price = the store\'s, every variant', faults.length === 0, faults.length ? few(faults) : `${pages} pages, with the price sent to Google`);
}

// Follow links from the home page, two steps deep, so a list nobody remembered is still read.
const seen = new Set();
const queue = [];
const add = (path, depth) => {
  const clean = path.replace(/#.*$/, '').replace(/&amp;/g, '&');
  if (!clean.startsWith('/') || clean.startsWith('//') || seen.has(clean) || seen.size >= MAX_PAGES) return;
  if (/^\/(cart\/|checkout|account|cdn|customer_authentication|policies|challenge|password|apps\/|tools\/|services\/|recommendations)/.test(clean) || /\.(js|css|json|xml|png|jpe?g|webp|svg|ico|woff2?|atom|oembed)(\?|$)/.test(clean)) return;
  if (/^\/products\//.test(clean)) return; // read above (for sale) or below (not for sale)
  seen.add(clean);
  queue.push({ path: clean, depth });
};
const collections = (await json('/collections.json?limit=250')).collections.map((c) => c.handle);
['/', '/collections', '/collections/all', '/collections/frontpage', ...collections.map((h) => `/collections/${h}`), '/search', '/pages/saved', '/cart'].forEach((p) => add(p, 0));
// Search, by every name: the real ones must show the right price, the others must not show at all.
all.forEach((p) => add(`/search?q=${encodeURIComponent(p.title)}&type=product`, 2));
all.forEach((p) => add(`/search/suggest?q=${encodeURIComponent(p.title.split(' ').slice(0, 2).join(' '))}&section_id=predictive-search`, 2));
let crawled = 0;
while (queue.length) {
  const batch = queue.splice(0, queue.length);
  await pool(batch, async ({ path, depth }) => {
    const html = await text(path);
    crawled++;
    inspect(path, html);
    if (depth < 2) (html.match(/href="\/[^"]*"/g) || []).forEach((h) => add(h.slice(6, -1), depth + 1));
  });
}
// The cards other scripts ask for: the Saved page and the cart's rows, the product page's rows, the cart's suggestions.
const asked = [
  ...real.flatMap((p) => [`/products/${p.handle}?section_id=saved-item`, `/products/${p.handle}?section_id=product-tile`, `/recommendations/products?product_id=${p.id}&limit=10&section_id=cart-extras`]),
  ...later,
];
await pool(asked, async (path) => inspect(path, await text(path)));
record('Every card shows the store\'s price', cardFaults.length === 0 && cardCount > 0, cardFaults.length ? few(cardFaults) : `${cardCount} cards on ${crawled + asked.length} pages and answers (${surfaces.size} kinds)`);

/* ---------- 3. Nothing that isn't for sale is listed ---------- */
record('No list links to a test product or the free gift', offLinks.length === 0, offLinks.length ? few([...new Set(offLinks)]) : `${crawled + asked.length} pages and answers read`);
{
  const leaks = [];
  await pool(offSale, async (p) => {
    for (const section of ['saved-item', 'product-tile']) {
      const html = await text(`/products/${p.handle}?section_id=${section}`);
      if (/<li[\s>]/.test(html)) leaks.push(`${p.handle} gives a ${section} card`);
    }
    if (isTest(p) && !/<meta name="robots" content="noindex/.test(await text(`/products/${p.handle}`))) leaks.push(`${p.handle}: its page is not noindex`);
  });
  record('Test products and the gift give no card; test pages are noindex', leaks.length === 0, leaks.length ? few(leaks) : `${offSale.length} products`);
}

/* ---------- 4. The cart charges the store's price ---------- */
{
  const variants = real.flatMap((p) => p.variants.filter((v) => v.available).map((v) => ({ ...v, handle: p.handle })));
  await post('/cart/clear.js');
  await post('/cart/add.js', { items: variants.map((v) => ({ id: v.id, quantity: 1 })) });
  const cart = await json('/cart.js', { cart: true });
  const faults = [];
  for (const v of variants) {
    const line = cart.items.find((i) => i.variant_id === v.id);
    if (!line) faults.push(`${v.handle} ${v.sku}: could not be added`);
    else if (line.original_price !== rupees(v.price) || line.price !== rupees(v.price)) faults.push(`${v.handle} ${v.sku}: the cart charges ₹${line.price / 100}, the store price is ₹${+v.price}`);
  }
  const sum = variants.reduce((n, v) => n + rupees(v.price), 0);
  if (cart.original_total_price !== sum) faults.push(`cart total before discounts ₹${cart.original_total_price / 100}, the prices add up to ₹${sum / 100}`);
  if (cart.items.length !== variants.length) faults.push(`${cart.items.length} lines in the cart for ${variants.length} variants`);
  record('The cart charges the store\'s price, every variant', faults.length === 0, faults.length ? few(faults) : `${variants.length} variants, ₹${sum / 100} in all`);

  // The money-off steps (Theme settings → Cart; the discounts themselves live in Shopify admin).
  const cheap = [...variants].sort((a, b) => a.price - b.price)[0];
  const unit = rupees(cheap.price);
  const steps = [[settings.discount_1_from, settings.discount_1_amount], [settings.discount_2_from, settings.discount_2_amount]].filter(([from, off]) => from > 0 && off > 0).map(([from, off]) => [from * 100, off * 100]);
  const owed = (total) => steps.filter(([from]) => total >= from).map(([, off]) => off).at(-1) || 0;
  const tries = [...new Set(steps.flatMap(([from]) => [Math.ceil(from / unit) - 1, Math.ceil(from / unit)]))].filter((q) => q > 0);
  const off = [];
  const told = [];
  for (const quantity of tries) {
    await post('/cart/clear.js');
    await post('/cart/add.js', { items: [{ id: cheap.id, quantity }] });
    const c = await json('/cart.js', { cart: true });
    const taken = c.original_total_price - c.total_price;
    told.push(`₹${(unit * quantity) / 100} → ₹${taken / 100} off`);
    if (c.original_total_price !== unit * quantity || taken !== owed(unit * quantity)) off.push(`₹${(unit * quantity) / 100} in the cart: ₹${taken / 100} off, Theme settings say ₹${owed(unit * quantity) / 100}`);
  }
  if (steps.length) record('Money-off steps start where Theme settings say', off.length === 0, off.length ? few(off) : told.join(', '));

  // Free delivery (Theme settings → Cart; the rate itself lives in Shopify admin).
  const shipAt = (settings.free_shipping_threshold || 0) * 100;
  if (shipAt > 0) {
    const q = 'shipping_address[zip]=110001&shipping_address[country]=India&shipping_address[province]=Delhi';
    const rates = async (quantity) => {
      await post('/cart/clear.js');
      await post('/cart/add.js', { items: [{ id: cheap.id, quantity }] });
      await get(`/cart/prepare_shipping_rates.json?${q}`, { method: 'POST', cart: true });
      for (let i = 0; i < 15; i++) {
        const j = await get(`/cart/async_shipping_rates.json?${q}`, { cart: true }).then((r) => r.json(), () => null);
        if (j?.shipping_rates) return j.shipping_rates.map((x) => rupees(x.price));
        await new Promise((r) => setTimeout(r, 1000));
      }
      return [];
    };
    const under = Math.ceil(shipAt / unit) - 1;
    const below = under > 0 ? await rates(under) : [1];
    const above = await rates(under + 1);
    const ok = below.length > 0 && !below.includes(0) && above.includes(0);
    record('Free delivery starts where Theme settings say', ok, `₹${(unit * under) / 100}: delivery ₹${below.map((n) => n / 100).join(', ₹') || ' no rate'}; ₹${(unit * (under + 1)) / 100}: ₹${above.map((n) => n / 100).join(', ₹') || ' no rate'}`);
  }
  await post('/cart/clear.js');
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} money checks passed${failed.length ? `. FAILED: ${failed.map((r) => r.name).join(' · ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
