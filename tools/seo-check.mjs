// Yarn Basket SEO check (docs/seo-plan.md, phase 0.3): what a search engine reads on every page, held to one standard.
// Usage: npm run check:seo                    (against the local `shopify theme dev` server)
//        node tools/seo-check.mjs --url http://127.0.0.1:9393/ [--list]   (--list names every page that fails a line)
//        npm run check -- --only 26           (the same, as a section of the main check)
// No browser, only requests: it reads the HTML a crawler gets before any script runs. About two minutes.
//
// How it finds pages: it follows every link from the home page (never a nofollow link), and separately asks the store
// for every product and collection. A page the store has that no link reaches is an orphan.
// What it holds each page to: a title and description of the right length that no other page shares, one h1, a share
// image, a canonical that is the page itself, structured data that parses and carries what Google requires, alt text
// on every image, at least two ways in, and enough words. Pages that are personal or not for sale must be noindex.
// What it cannot see: how Google ranks any of it, and prices (npm run check:money compares those, JSON-LD included).
const args = process.argv.slice(2);
const BASE = (args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://127.0.0.1:9292/').replace(/\/$/, '');
const LIST = args.includes('--list');
const MAX_PAGES = 400;
const BRAND = 'Yarn Basket';
const LIMIT = { titleMax: 62, titleMin: 20, descMin: 70, descMax: 160, productWords: 80, collectionWords: 40, productLinks: 3, collectionLinks: 2 };
// Personal or endless pages: they must tell search engines to stay out.
const PRIVATE = [/^\/search/, /^\/cart/, /^\/pages\/(saved|track-order|account)/];
const NOT_FOR_SALE = ['test-product', 'free-gift'];

const results = [];
const record = (name, bad, good) => {
  const ok = bad.length === 0;
  results.push({ name, ok });
  const shown = LIST ? bad : bad.slice(0, 4);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(58)} ${ok ? good : `${bad.length}: ${shown.join(' · ')}${bad.length > shown.length ? ` · and ${bad.length - shown.length} more (--list)` : ''}`}`);
};

const decode = (s) => (s || '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&ndash;/g, '–').replace(/&#8377;/g, '₹').replace(/&nbsp;/g, ' ');
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1];
const words = (html) => decode((html || '').replace(/<[^>]+>/g, ' ')).split(/\s+/).filter(Boolean).length;
const getJson = async (path) => (await fetch(BASE + path)).json();

// A link as a crawler would keep it: on this site, without its fragment; only the page number survives of the query.
const clean = (href) => {
  let u;
  try { u = new URL(decode(href), BASE + '/'); } catch { return null; }
  if (u.origin !== new URL(BASE).origin) return null;
  if (/^\/(cdn|checkouts?|account|\.well-known|api|services)\b/.test(u.pathname) || /\.(js|css|png|jpe?g|webp|svg|woff2?|mp4|xml|txt|md|json)$/.test(u.pathname)) return null;
  const page = u.searchParams.get('page');
  const path = u.pathname.replace(/^\/collections\/[^/]+\/products\//, '/products/').replace(/(.)\/$/, '$1');
  return page && page !== '1' ? `${path}?page=${page}` : path;
};
const linksIn = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/<a\s[^>]*>/gi)) {
    const href = attr(m[0], 'href');
    if (!href || href.startsWith('#') || /nofollow/.test(attr(m[0], 'rel') || '')) continue;
    const path = clean(href);
    if (path) out.add(path);
  }
  return out;
};

const pages = new Map(); // path → what was read
const read = async (path) => {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const page = { path, status: res.status, out: new Set(), nav: new Set() };
  pages.set(path, page);
  if (res.status !== 200) return page;
  const html = await res.text();
  const head = html.slice(0, html.indexOf('</head>'));
  const body = html.slice(html.indexOf('<body'));
  const main = (body.match(/<main[\s\S]*?<\/main>/i) || [''])[0];
  const metas = head.match(/<meta\s[^>]+>/gi) || [];
  const meta = (key) => { const m = metas.find((t) => attr(t, 'name') === key || attr(t, 'property') === key); return m ? decode(attr(m, 'content')) : ''; };
  page.title = decode((head.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]).replace(/\s+/g, ' ').trim();
  page.desc = meta('description');
  page.noindex = /noindex/.test(meta('robots'));
  // The canonical names the store's own domain, which a local server is not: compare the path.
  page.canonical = (attr((head.match(/<link[^>]+rel="canonical"[^>]*>/i) || [''])[0], 'href') || '').replace(/^https?:\/\/[^/]+/, '').replace(/(.)\/$/, '$1');
  page.share = meta('og:image');
  page.h1 = (body.match(/<h1[\s>]/gi) || []).length;
  page.noAlt = (body.match(/<img\s[^>]+>/gi) || []).filter((t) => attr(t, 'alt') === undefined).length;
  page.data = [];
  page.badData = 0;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { const d = JSON.parse(m[1]); page.data.push(...(d['@graph'] || [d])); } catch { page.badData += 1; }
  }
  page.questions = (main.match(/data-good-question/g) || []).length;
  page.out = linksIn(main);
  page.nav = linksIn(body.replace(main, ''));
  return page;
};
const typesOf = (page) => page.data.flatMap((d) => [].concat(d['@type'] || []));

// 1. Read the site: follow links from the home page, six at a time (the dev server passes every request to Shopify).
const [{ products }, { collections }] = await Promise.all([getJson('/products.json?limit=250'), getJson('/collections.json?limit=250')]);
const queue = ['/'];
const queued = new Set(queue);
while (queue.length && pages.size < MAX_PAGES) {
  const batch = queue.splice(0, 6);
  for (const page of await Promise.all(batch.map(read))) {
    for (const to of [...page.out, ...page.nav]) if (!queued.has(to)) { queued.add(to); queue.push(to); }
  }
}
const reached = new Set(pages.keys());
// What the store has, whether or not a link leads there.
const hidden = new Set(products.filter((p) => p.tags.some((t) => NOT_FOR_SALE.includes(t))).map((p) => `/products/${p.handle}`));
const stock = [...products.map((p) => `/products/${p.handle}`), ...collections.filter((c) => c.products_count > 0).map((c) => `/collections/${c.handle}`)];
const unreached = stock.filter((path) => !reached.has(path));
for (let i = 0; i < unreached.length; i += 6) await Promise.all(unreached.slice(i, i + 6).map(read));

const all = [...pages.values()];
const live = all.filter((p) => p.status === 200);
const isPrivate = (p) => PRIVATE.some((re) => re.test(p.path)) || hidden.has(p.path);
const open = live.filter((p) => !p.noindex && !isPrivate(p) && !/\?page=/.test(p.path));
const productPages = open.filter((p) => p.path.startsWith('/products/'));
const collectionPages = open.filter((p) => /^\/collections\/[^/]+$/.test(p.path));
console.log(`Read ${all.length} pages: ${open.length} open to search engines (${productPages.length} products, ${collectionPages.length} collections), ${live.length - open.length} kept out.\n`);

// 2. Every link leads somewhere, and nothing the store sells is left unlinked.
record('Every link opens a page', all.filter((p) => p.status !== 200).map((p) => `${p.path} (${p.status})`), 'no dead links');
record('Nothing for sale is an orphan', unreached.filter((path) => !hidden.has(path) && !pages.get(path)?.noindex), 'every product and collection is reached by following links');
record('Nothing not for sale is linked', [...hidden].filter((path) => reached.has(path)), 'test products and the free gift are linked from nowhere');
const inbound = new Map();
const chrome = new Set(live.flatMap((p) => [...p.nav]));
for (const p of live) for (const to of p.out) if (to !== p.path) inbound.set(to, (inbound.get(to) || new Set()).add(p.path));
record('Every page has two ways in', open.filter((p) => p.path !== '/' && !chrome.has(p.path) && (inbound.get(p.path)?.size || 0) < 2).map((p) => `${p.path} (${inbound.get(p.path)?.size || 0})`), 'in the header or footer, or linked from two pages or more');

// 3. Kept out: personal pages, search, the cart, and anything not for sale.
record('Personal and not-for-sale pages are noindex', live.filter((p) => isPrivate(p) && !p.noindex).map((p) => p.path), 'search, cart, saved, track, account, test products, the gift');
record('No empty page is open to search engines', open.filter((p) => (/^\/blogs\/[^/]+$/.test(p.path) && !p.out.size) || p.path === '/collections/frontpage').map((p) => p.path), 'no empty blog or starter collection');

// 4. Head tags.
record('Title: there, and no longer than Google shows', open.filter((p) => p.title.length < LIMIT.titleMin || p.title.length > LIMIT.titleMax).map((p) => `${p.path} (${p.title.length})`), `${LIMIT.titleMin} to ${LIMIT.titleMax} characters`);
record('Title: one format, "Page | Yarn Basket"', open.filter((p) => !p.title.endsWith(`| ${BRAND}`)).map((p) => p.path), 'every title ends the same way');
record('Description: there, and the right length', open.filter((p) => p.desc.length < LIMIT.descMin || p.desc.length > LIMIT.descMax).map((p) => `${p.path} (${p.desc.length})`), `${LIMIT.descMin} to ${LIMIT.descMax} characters`);
const twice = (key) => { const seen = new Map(); for (const p of open) if (p[key]) seen.set(p[key], [...(seen.get(p[key]) || []), p.path]); return [...seen.values()].filter((v) => v.length > 1).map((v) => v.join(' = ')); };
record('No two pages share a title', twice('title'), 'all different');
record('No two pages share a description', twice('desc'), 'all different');
record('Canonical is the page itself', open.filter((p) => p.canonical !== p.path).map((p) => `${p.path} → ${p.canonical || 'none'}`), 'every page names itself');
record('Share image on every page', open.filter((p) => !p.share).map((p) => p.path), 'link previews always have a picture');

// 5. The page itself.
record('One h1', open.filter((p) => p.h1 !== 1).map((p) => `${p.path} (${p.h1})`), 'exactly one on every page');
record('Every image has alt text', live.filter((p) => p.noAlt).map((p) => `${p.path} (${p.noAlt})`), 'none missing');
const copy = new Map([...products.map((p) => [`/products/${p.handle}`, words(p.body_html)]), ...collections.map((c) => [`/collections/${c.handle}`, words(c.body_html || c.description)])]);
record(`Product description: ${LIMIT.productWords} words or more`, productPages.filter((p) => (copy.get(p.path) || 0) < LIMIT.productWords).map((p) => `${p.path} (${copy.get(p.path) || 0})`), 'every product says enough');
record(`Collection intro: ${LIMIT.collectionWords} words or more`, collectionPages.filter((p) => (copy.get(p.path) || 0) < LIMIT.collectionWords).map((p) => `${p.path} (${copy.get(p.path) || 0})`), 'every collection has one');
// A sentence used on two product pages is a page that was not written for its piece.
const said = new Map();
for (const p of products.filter((x) => !hidden.has(`/products/${x.handle}`))) {
  for (const sentence of new Set(decode((p.body_html || '').replace(/<[^>]+>/g, ' ')).split(/(?<=[.!?])\s+/).map((t) => t.replace(/\s+/g, ' ').trim().toLowerCase()).filter((t) => t.split(' ').length > 3))) {
    said.set(sentence, [...(said.get(sentence) || []), p.handle]);
  }
}
record('No two product descriptions share a sentence', [...said].filter(([, at]) => at.length > 1).map(([sentence, at]) => `"${sentence}" (${at.join(', ')})`), 'each written for its own piece');
record('Collection: Good to know, with 3 questions or more', collectionPages.filter((p) => p.questions < 3).map((p) => `${p.path} (${p.questions})`), 'what shoppers ask, answered on the page');
const count = (p, re) => [...p.out].filter((to) => re.test(to) && to !== p.path).length;
record(`Product page links to ${LIMIT.productLinks} products, ${LIMIT.collectionLinks} collections`, productPages.filter((p) => count(p, /^\/products\//) < LIMIT.productLinks || count(p, /^\/collections\//) < LIMIT.collectionLinks).map((p) => `${p.path} (${count(p, /^\/products\//)}, ${count(p, /^\/collections\//)})`), 'in the HTML, before any script');
record('Collection page links to other collections', collectionPages.filter((p) => count(p, /^\/collections\/[^/?]+$/) < LIMIT.collectionLinks).map((p) => p.path), 'each leads on to others');

// 6. Structured data.
record('Structured data parses', live.filter((p) => p.badData).map((p) => p.path), 'valid JSON on every page');
record('Every page names the shop (OnlineStore, WebSite)', open.filter((p) => !typesOf(p).includes('OnlineStore') || !typesOf(p).includes('WebSite')).map((p) => p.path), 'one shop, named everywhere');
const offersOf = (p) => p.data.flatMap((d) => [d, ...[].concat(d.hasVariant || [])]).flatMap((d) => [].concat(d.offers || []));
const badOffer = (o) => !(o.price > 0) || !o.priceCurrency || !o.availability || !o.shippingDetails?.shippingRate || !o.shippingDetails?.deliveryTime?.handlingTime || !o.shippingDetails?.deliveryTime?.transitTime || !o.shippingDetails?.shippingDestination;
record('Product: price, stock, delivery fee and time', productPages.filter((p) => !offersOf(p).length || offersOf(p).some(badOffer)).map((p) => p.path), 'everything Google requires for a shop listing');
record('Product: named, pictured, with a breadcrumb', productPages.filter((p) => { const d = p.data.find((x) => /^Product(Group)?$/.test(x['@type'])); const crumb = p.data.find((x) => x['@type'] === 'BreadcrumbList'); return !d?.name || !d.image?.length || !d.description || (crumb?.itemListElement?.length || 0) < 3; }).map((p) => p.path), 'name, photos, description, Home › collection › piece');
record('Product: no rating without real reviews', productPages.filter((p) => p.data.some((d) => d.aggregateRating) && !p.data.some((d) => [].concat(d.review || []).length)).map((p) => p.path), 'stars only where reviews are on the page');
record('Collection: list of its pieces, and a breadcrumb', collectionPages.filter((p) => !p.data.some((d) => d['@type'] === 'ItemList' || d.mainEntity?.['@type'] === 'ItemList') || !typesOf(p).includes('BreadcrumbList')).map((p) => p.path), 'on every collection');
record('Return policy is declared once, on the shop', open.filter((p) => p.path === '/').filter((p) => !p.data.find((d) => [].concat(d['@type']).includes('OnlineStore'))?.hasMerchantReturnPolicy).map((p) => p.path), 'a link to the Refund policy');

// 7. What AI engines read about us.
const agents = await fetch(`${BASE}/llms.txt`).then((r) => (r.status === 200 ? r.text() : ''));
record('llms.txt says who we are', /crochet/i.test(agents) && /Priya|handmade|made by hand/i.test(agents) ? [] : ['/llms.txt'], 'our own words, not only Shopify\'s');

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} SEO checks passed${failed.length ? `; failing: ${failed.map((f) => f.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
