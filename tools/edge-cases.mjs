// Edge cases behind docs/audit-2026-10-03.md: SEO tags per page type, product page, the gift product, offline cart, Back after add, header geometry.
// Usage: node tools/edge-cases.mjs   (dev server with the storefront password on :9292). Screenshots go to .stress-shots/.
import { chromium } from 'playwright';
const base = 'http://127.0.0.1:9292';
const out = new URL('../.stress-shots/', import.meta.url).pathname;
await import('node:fs').then((fs) => fs.mkdirSync(out, { recursive: true }));
const log = (k, v) => console.log(`\n## ${k}\n${typeof v === 'string' ? v : JSON.stringify(v, null, 1)}`);
const b = await chromium.launch();
const mk = async (w, h, extra = {}) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800, reducedMotion: 'reduce', ...extra });
  await ctx.addInitScript(() => { try { localStorage.setItem('yb-intro-seen', String(Date.now())); } catch {} });
  return ctx;
};
const errsOf = (p) => { const e = []; p.on('pageerror', (x) => e.push('pageerror: ' + x.message)); p.on('console', (m) => m.type() === 'error' && !/CORS|shopifysvc|monorail|shop\.app|Failed to load resource|Content Security|otlp/.test(m.text()) && e.push('console: ' + m.text().slice(0, 160))); return e; };

// 1. SEO per page type
{
  const ctx = await mk(1280, 800); const p = await ctx.newPage();
  const rows = [];
  for (const path of ['/', '/collections', '/collections/all', '/collections/shop', '/products/flower-hair-clips-set-of-8', '/products/sunflower-keychain-free-gift', '/cart', '/search?q=crochet', '/pages/contact', '/pages/saved', '/pages/account', '/blogs/news', '/policies/terms-of-service', '/nope-404', '/collections/all?page=2', '/collections/all?sort_by=price-ascending']) {
    const res = await p.goto(base + path, { waitUntil: 'domcontentloaded' });
    rows.push(await p.evaluate(([path, status]) => {
      const m = (s) => document.querySelector(s)?.getAttribute('content') || document.querySelector(s)?.getAttribute('href') || null;
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { const j = JSON.parse(s.textContent); return (j['@graph'] || [j]).map((x) => x['@type']).join('+'); } catch (e) { return 'INVALID JSON: ' + e.message.slice(0, 60); } });
      const hs = [...document.querySelectorAll('main h1, main h2, main h3, main h4')].filter((h) => !h.closest('[hidden], template, dialog')).map((h) => +h.tagName[1]);
      let skip = ''; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { skip = `h${hs[i - 1]}->h${hs[i]}`; break; }
      return { path, status, title: document.title, desc: (m('meta[name=description]') || 'NONE').slice(0, 70), canonical: (m('link[rel=canonical]') || '').replace(location.origin, ''), robots: m('meta[name=robots]'), ogimg: !!m('meta[property="og:image"]'), ld: ld.join(' | ') || 'none', h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 40)), firstHeading: hs[0], skip };
    }, [path, res.status()]));
  }
  log('SEO', rows);
  await ctx.close();
}

// 2. PDP: variant change, images, buy now, gift page
{
  const ctx = await mk(390, 844); const p = await ctx.newPage(); const errs = errsOf(p);
  await p.goto(base + '/products/red-rose-crochet-bouquet', { waitUntil: 'load' });
  const info = await p.evaluate(() => ({
    options: [...document.querySelectorAll('select[name=id] option')].map((o) => o.textContent.trim()),
    priceShown: document.querySelector('.product-info p')?.textContent.trim(),
    imgs: [...document.querySelectorAll('.product-images img')].map((i) => ({ loading: i.loading, fp: i.fetchPriority, sizes: i.sizes, cur: (i.currentSrc.match(/width=(\d+)/) || [])[1], shown: Math.round(i.getBoundingClientRect().width), alt: i.alt })),
    buyNow: !!document.querySelector('.shopify-payment-button'),
    infoLeft: Math.round(document.querySelector('.product-info h1').getBoundingClientRect().left),
    h1Size: getComputedStyle(document.querySelector('.product-info h1')).fontSize,
    descMarkup: document.querySelector('.product-info').innerHTML.replace(/\s+/g, ' ').slice(0, 300),
  }));
  const sel = p.locator('select[name=id]');
  const before = p.url();
  await sel.selectOption({ index: 1 });
  await p.waitForTimeout(500);
  info.afterVariantChange = { url: p.url() === before ? 'unchanged' : p.url(), priceShown: await p.locator('[data-price-now]').first().textContent() };
  log('PDP', info);
  // gift page
  await p.goto(base + '/products/sunflower-keychain-free-gift', { waitUntil: 'load' });
  const gift = await p.evaluate(() => ({ addBtn: document.querySelector('.pdp__add')?.textContent.trim(), disabled: document.querySelector('.pdp__add')?.disabled, robots: document.querySelector('meta[name=robots]')?.content || null }));
  // The gift's page has no buy box since 2026-10-04 (docs/product-page-plan.md); the click is for a theme that still has one.
  if (await p.locator('.pdp__add').count()) await p.locator('.pdp__add').click();
  await p.waitForTimeout(3500);
  gift.afterAdd = await p.evaluate(async () => { const c = await (await fetch('/cart.js')).json(); return { items: c.items.map((i) => `${i.title} x${i.quantity} ${i.final_line_price}`), toast: document.querySelector('.cart-toast')?.innerText.replace(/\s+/g, ' '), status: document.querySelector('[data-cart-status]')?.textContent }; });
  log('GIFT PDP', gift);
  const allHasGift = await p.evaluate(async () => { const h = await (await fetch('/collections/all')).text(); const s = await (await fetch('/collections/shop')).text(); const sm = await (await fetch('/sitemap.xml')).text(); const pm = (sm.match(/<loc>([^<]*sitemap_products[^<]*)<\/loc>/) || [])[1]; const pmx = pm ? await (await fetch(new URL(pm.replace(/&amp;/g, '&')).pathname + new URL(pm.replace(/&amp;/g, '&')).search)).text() : ''; return { all: h.includes('sunflower-keychain-free-gift'), shop: s.includes('/products/sunflower-keychain-free-gift'), sitemap: pmx.includes('sunflower-keychain-free-gift'), sitemapHasAccount: pmx.length }; });
  log('GIFT listed in', allHasGift);
  log('PDP errors', errs);
  await ctx.request.post(base + '/cart/clear.js');
  await ctx.close();
}

// 3. Offline behaviour
{
  const ctx = await mk(390, 844); const p = await ctx.newPage(); const errs = errsOf(p);
  await p.goto(base + '/products/sunflower-crochet-pot', { waitUntil: 'load' });
  await ctx.setOffline(true);
  await p.locator('.pdp__add').click();
  await p.waitForTimeout(1500);
  const off1 = await p.evaluate(() => ({ error: document.querySelector('[data-add-error]')?.textContent, hidden: document.querySelector('[data-add-error]')?.hidden, label: document.querySelector('[data-add-label]')?.textContent.trim(), busy: document.querySelector('.pdp__add').getAttribute('aria-busy') }));
  await ctx.setOffline(false);
  await p.locator('.pdp__add').click();
  await p.waitForTimeout(2500);
  await p.goto(base + '/cart', { waitUntil: 'load' });
  await ctx.setOffline(true);
  await p.locator('.cart-line .qty__plus').first().click();
  await p.waitForTimeout(2500);
  const off2 = await p.evaluate(() => { const li = document.querySelector('.cart-line'); return { qtyShown: li.querySelector('.qty__input').value, lineBusy: li.classList.contains('is-busy'), rootBusy: document.querySelector('[data-cart-root]').classList.contains('is-busy'), note: li.querySelector('[data-line-note]')?.textContent, noteHidden: li.querySelector('[data-line-note]')?.hidden, status: document.querySelector('[data-cart-status]')?.textContent }; });
  await ctx.setOffline(false);
  await p.waitForTimeout(500);
  const real = await p.evaluate(async () => (await (await fetch('/cart.js')).json()).items.map((i) => i.quantity));
  log('OFFLINE add', off1); log('OFFLINE qty step', { ...off2, realQty: real }); log('OFFLINE errors', errs);
  // 4. Back after add: is the header count stale?
  await ctx.request.post(base + '/cart/clear.js');
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.goto(base + '/products/sunflower-crochet-pot', { waitUntil: 'load' });
  await p.locator('.pdp__add').click();
  await p.waitForTimeout(2500);
  await p.goBack({ waitUntil: 'load' });
  await p.waitForTimeout(800);
  log('BACK after add', await p.evaluate(async () => ({ badge: document.querySelector('[data-cart-count]').textContent.trim(), badgeHidden: document.querySelector('[data-cart-count]').hidden, drawerCount: document.querySelector('#CartDrawer [data-cart-root]')?.dataset.count, real: (await (await fetch('/cart.js')).json()).item_count, navType: performance.getEntriesByType('navigation')[0]?.type })));
  await ctx.request.post(base + '/cart/clear.js');
  await ctx.close();
}

// 5. Header geometry + targeted screenshots
{
  for (const [w, h] of [[320, 568], [360, 740], [390, 844]]) {
    const ctx = await mk(w, h); const p = await ctx.newPage();
    await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(600);
    const g = await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.right)]; }; return { vw: innerWidth, row: r('.site-header__row'), menu: r('.site-header__menu-btn'), logo: r('.site-header__logo'), icons: r('.site-header__icons'), announceH: document.querySelector('.announce')?.offsetHeight, tags: [...document.querySelectorAll('.hero__tag')].slice(0, 3).map((t) => t.innerText.replace(/\s+/g, ' ') + ' | name ' + t.querySelector('.hero__tag-name').scrollWidth + '>' + t.querySelector('.hero__tag-name').clientWidth) }; });
    log('HEADER ' + w, g);
    await p.screenshot({ path: `${out}top-home-${w}.png` });
    await ctx.close();
  }
  // big text desktop + phone
  for (const [w, h, pct, path, name] of [[1280, 800, 130, '/', 'home'], [390, 844, 200, '/', 'home'], [390, 844, 200, '/cart', 'cart'], [390, 844, 130, '/pages/contact?view=account-demo', 'acct']]) {
    const ctx = await mk(w, h); const p = await ctx.newPage();
    if (name === 'cart') { const prods = (await (await ctx.request.get(base + '/products.json?limit=50')).json()).products.filter((x) => x.variants[0].available && !x.tags.includes('free-gift')); await ctx.request.post(base + '/cart/add.js', { data: { items: prods.slice(0, 3).map((x) => ({ id: x.variants[0].id, quantity: 2 })) } }); }
    await p.goto(base + path, { waitUntil: 'load' }); await p.addStyleTag({ content: `html{font-size:${pct}% !important}` }); await p.waitForTimeout(900);
    await p.screenshot({ path: `${out}big${pct}-${name}-${w}-top.png` });
    if (name !== 'home' || w < 800) { await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(500); await p.screenshot({ path: `${out}big${pct}-${name}-${w}-bottom.png` }); }
    await ctx.request.post(base + '/cart/clear.js');
    await ctx.close();
  }
}
await b.close();
