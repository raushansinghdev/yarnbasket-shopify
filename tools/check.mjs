// Yarn Basket theme checks: speed, smoothness, motion and accessibility, across Chrome, Safari (WebKit) and Firefox.
// Usage: npm run check            (full run against the local `shopify theme dev` server)
//        npm run check:quick      (Chrome only)
//        node tools/check.mjs --url https://yarnbasket-in.myshopify.com/?preview_theme_id=…
// Budgets come from docs/motion-plan.md, section 6. Exits non-zero if any check fails.
import { chromium, webkit, firefox, devices } from 'playwright';
import axe from 'axe-core';

const args = process.argv.slice(2);
const URL = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://127.0.0.1:9292/';
const QUICK = args.includes('--quick');

const BUDGET = { lcpMs: 2000, slowFrames: 0, phoneImagesKB: 1000, ownJsKB: 25, cartJsKB: 22 };
const results = [];
const record = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(46)} ${detail}`); };

// Skip the once-a-day logo intro so we measure the page itself. Sandboxed analytics frames refuse storage: ignore.
const skipIntro = () => { try { localStorage.setItem('yb-intro-seen', String(Date.now())); } catch {} };
const themeErrors = (page) => {
  const errs = [];
  page.on('pageerror', (e) => { if (!/Cross-origin|CORS|localStorage|insecure/i.test(e.message)) errs.push(e.message); });
  return errs;
};
const open = async (engine, device, opts = {}) => {
  const browser = await engine.launch();
  const ctx = await browser.newContext({ ...device, reducedMotion: opts.reducedMotion || 'no-preference' });
  if (!opts.keepIntro) await ctx.addInitScript(skipIntro);
  if (opts.init) await ctx.addInitScript(opts.init);
  const page = await ctx.newPage();
  const errors = themeErrors(page);
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  return { browser, ctx, page, errors };
};
const scrollWholePage = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 220));
  }
  await new Promise((r) => setTimeout(r, 1500));
});

const FIREFOX = { viewport: { width: 1440, height: 900 } };
const runs = QUICK
  ? [['Chrome desktop', chromium, devices['Desktop Chrome']], ['Chrome phone (Pixel 7)', chromium, devices['Pixel 7']]]
  : [
      ['Chrome desktop', chromium, devices['Desktop Chrome']],
      ['Chrome phone (Pixel 7)', chromium, devices['Pixel 7']],
      ['Safari phone (iPhone 13, WebKit)', webkit, devices['iPhone 13']],
      ['Firefox desktop', firefox, FIREFOX],
    ];

// 1. Arrivals, errors, layout, per browser
for (const [label, engine, device] of runs) {
  const { browser, page, errors } = await open(engine, device);
  const pendingAtLoad = await page.evaluate(() => document.querySelectorAll('.is-pending').length);
  await scrollWholePage(page);
  const r = await page.evaluate(() => {
    // Stars on review cards still off to the side of a swipe row wait for a swipe: that's by design.
    const stuck = [...document.querySelectorAll('.is-pending')].filter((el) => !(el.matches('.review__stars') && el.closest('.scroller')));
    const hidden = [...document.querySelectorAll('[data-arrive] > *, [data-arrive]')].filter((el) => el.getBoundingClientRect().width && +getComputedStyle(el).opacity < 0.99 && !el.closest('.is-pending'));
    return { stuck: stuck.length, hidden: hidden.length, sideways: document.documentElement.scrollWidth > innerWidth + 1, // A photo that has loaded but is still hidden is a bug. Photos not requested yet (hero slides waiting for a swipe) are fine.
      imgWaiting: [...document.querySelectorAll('img.img-wait')].filter((img) => img.complete && img.naturalWidth).length,
      notYetRequested: [...document.querySelectorAll('img.img-wait')].filter((img) => !img.complete).length };
  });
  record(`${label}: things arrive, none stuck`, pendingAtLoad > 0 && r.stuck === 0 && r.hidden === 0, `${pendingAtLoad} waited at load, ${r.stuck} stuck, ${r.hidden} left faded`);
  record(`${label}: loaded photos all shown`, r.imgWaiting === 0, `${r.imgWaiting} loaded but hidden, ${r.notYetRequested} not needed yet`);
  record(`${label}: no sideways scroll`, !r.sideways, r.sideways ? 'page scrolls sideways' : 'ok');
  record(`${label}: no theme JS errors`, errors.length === 0, errors.slice(0, 2).join(' | ') || 'none');
  await browser.close();
}

// 2. Smoothness: slow frames during a cold scroll, CPU slowed 4x (Chrome only: it exposes CPU throttling)
for (const [label, device] of [['desktop', devices['Desktop Chrome']], ['phone', devices['Pixel 7']]]) {
  const { browser, ctx, page } = await open(chromium, device);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => { window.__f = []; let last = performance.now(); const tick = (t) => { window.__f.push(t - last); last = t; if (window.__rec) requestAnimationFrame(tick); }; window.__rec = true; requestAnimationFrame(tick); });
  for (let i = 0; i < 90; i++) { await page.mouse.wheel(0, 90); await page.waitForTimeout(16); }
  await page.waitForTimeout(500);
  const slow = await page.evaluate(() => { window.__rec = false; return window.__f.slice(3).filter((d) => d > 25).length; });
  record(`Smooth scroll, ${label} (4x slower CPU)`, slow <= BUDGET.slowFrames, `${slow} slow frames`);
  await browser.close();
}

// 3. Speed: LCP and phone image weight
{
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  await ctx.addInitScript(skipIntro);
  await ctx.addInitScript(() => { window.__lcp = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push({ t: e.startTime, el: e.element?.className || e.element?.tagName }))).observe({ type: 'largest-contentful-paint', buffered: true }); });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let imgKB = 0;
  let ownJsKB = 0;
  let cartJsKB = 0;
  page.on('response', async (res) => {
    try {
      const kb = (await res.body()).length / 1024;
      if (res.request().resourceType() === 'image') imgKB += kb;
      if (/\/assets\/theme\.js/.test(res.url())) ownJsKB += kb;
      if (/\/assets\/cart\.js/.test(res.url())) cartJsKB += kb;
    } catch {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const lcp = (await page.evaluate(() => window.__lcp)).at(-1) || { t: NaN, el: '?' };
  record('LCP, phone (4x slower CPU)', lcp.t < BUDGET.lcpMs && /hero/.test(lcp.el), `${Math.round(lcp.t)}ms on "${lcp.el}" (budget ${BUDGET.lcpMs}ms, local server)`);
  record('Phone images on first load', imgKB < BUDGET.phoneImagesKB, `${Math.round(imgKB)} KB (budget ${BUDGET.phoneImagesKB} KB)`);
  record('Our JavaScript (theme.js)', ownJsKB < BUDGET.ownJsKB, `${ownJsKB.toFixed(1)} KB (budget ${BUDGET.ownJsKB} KB)`);
  record('Cart JavaScript (cart.js)', cartJsKB < BUDGET.cartJsKB, `${cartJsKB.toFixed(1)} KB (budget ${BUDGET.cartJsKB} KB)`);
  await browser.close();
}

// 4. Accessibility (axe, WCAG 2.2 AA + best practice), phone and desktop
for (const [label, device] of [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]]) {
  const { browser, page } = await open(chromium, device, { reducedMotion: 'reduce' });
  await scrollWholePage(page);
  await page.addScriptTag({ content: axe.source });
  const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  record(`Accessibility, ${label} (axe)`, v.length === 0, v.join(', ') || '0 violations');
  await browser.close();
}

// 5. Reduced motion: complete and still
{
  const { browser, page } = await open(chromium, devices['Pixel 7'], { reducedMotion: 'reduce' });
  const pending = await page.evaluate(() => document.querySelectorAll('.is-pending').length);
  record('Reduced motion: nothing waits to appear', pending === 0, `${pending} waiting`);
  await browser.close();
}

// 6. Lite mode (data saver): no loops, no intro, slideshow paused
{
  const { browser, page } = await open(chromium, devices['Pixel 7'], {
    keepIntro: true,
    init: () => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }),
  });
  const r = await page.evaluate(() => ({
    lite: document.documentElement.classList.contains('lite'),
    flower: getComputedStyle(document.querySelector('.hero__flower')).animationName,
    intro: !!document.getElementById('yb-splash'),
  }));
  record('Lite mode (data saver)', r.lite && r.flower === 'none' && !r.intro, `lite=${r.lite}, flower animation=${r.flower}, intro shown=${r.intro}`);
  await browser.close();
}

// 7. Search (docs/search-plan.md): the panel opens with focus in the field, results arrive as you type,
//    nothing in it loads before it's opened, and axe passes with results showing. Phone and desktop.
for (const [label, device] of [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]]) {
  const { browser, page, errors } = await open(chromium, device, { reducedMotion: 'reduce' });
  const before = await page.evaluate(() => ({
    imgs: [...document.querySelectorAll('#SearchPanel img')].filter((img) => img.complete && img.naturalWidth).length,
    js: performance.getEntriesByType('resource').filter((r) => /search\.js/.test(r.name)).length,
  }));
  record(`Search, ${label}: nothing loads before it opens`, before.imgs === 0 && before.js === 0, `${before.imgs} photos, ${before.js} search.js requests`);
  const pill = await page.isVisible('#HeaderSearch');
  await page.click(pill ? '#HeaderSearch' : 'button.site-header__search');
  const field = pill ? '#HeaderSearch' : '#SearchPanelInput';
  const focused = await page.evaluate((sel) => document.activeElement === document.querySelector(sel), field);
  await page.keyboard.type('flower', { delay: 40 });
  const shown = await page.waitForSelector('#SearchPanel [data-ps]', { timeout: 8000 }).then(() => true, () => false);
  record(`Search, ${label}: opens focused, results as you type`, focused && shown, `focus in field: ${focused}, results: ${shown}`);
  await page.addScriptTag({ content: axe.source });
  const v = await page.evaluate(async () => (await window.axe.run(document.getElementById('SearchPanel'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  record(`Search, ${label}: panel accessibility (axe)`, v.length === 0, v.join(', ') || '0 violations');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => !document.getElementById('SearchPanel').open);
  record(`Search, ${label}: Esc clears, then closes`, closed && errors.length === 0, `closed: ${closed}${errors.length ? `, errors: ${errors[0]}` : ''}`);
  await browser.close();
}
{
  const { browser, page } = await open(chromium, devices['Pixel 7'], { reducedMotion: 'reduce' });
  await page.goto(new globalThis.URL('/search?q=flower', URL).href, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.addScriptTag({ content: axe.source });
  const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  record('Search results page, phone (axe)', v.length === 0, v.join(', ') || '0 violations');
  await browser.close();
}
// Results page (docs/search-results-plan.md): one search box (the header's pill steps back), the lens jumps to it,
// sort works in place and is announced with focus kept, and no results still has a way on. Phone and desktop.
for (const [label, device] of [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]]) {
  const { browser, page, errors } = await open(chromium, device, { reducedMotion: 'reduce' });
  const results = (q) => new globalThis.URL(`/search?q=${q}&options%5Bprefix%5D=last`, URL).href;
  await page.goto(results('bouquet'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const boxes = await page.evaluate(() => [...document.querySelectorAll('form[role="search"]')].filter((f) => f.checkVisibility()).length);
  await page.click('.site-header__search:not([hidden])');
  await page.waitForTimeout(300);
  const lens = await page.evaluate(() => ({ focus: document.activeElement?.id, panel: !!document.getElementById('SearchPanel')?.open }));
  record(`Search page, ${label}: one box, the lens jumps to it`, boxes === 1 && lens.focus === 'SearchPageInput' && !lens.panel, `${boxes} visible box(es), focus: ${lens.focus}, panel open: ${lens.panel}`);
  const sortable = await page.isVisible('#SearchSort');
  if (sortable) {
    await page.focus('#SearchSort');
    await page.selectOption('#SearchSort', { index: 1 });
    await page.waitForTimeout(1500);
  }
  const sorted = await page.evaluate(() => ({ url: location.search, focus: document.activeElement?.id, said: document.querySelector('[data-search-page-status]')?.textContent || '' }));
  record(`Search page, ${label}: sort in place, said aloud`, !sortable || (/sort_by=/.test(sorted.url) && sorted.focus === 'SearchSort' && sorted.said.length > 0), sortable ? `focus: ${sorted.focus}, said: "${sorted.said}"` : 'skipped (fewer than 2 products)');
  await page.goto(results('zzqx'), { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const none = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent.trim(), ways: document.querySelectorAll('.search-chip, .search-custom__btn, .product-row .card__link').length, tall: Math.round(document.querySelector('.search-page .search-start').getBoundingClientRect().bottom + scrollY) }));
  record(`Search page, ${label}: no results has a way on`, /zzqx/.test(none.h1) && none.ways > 2 && errors.length === 0, `h1: "${none.h1}", ${none.ways} ways on, ends at ${none.tall}px${errors.length ? `, errors: ${errors[0]}` : ''}`);
  await browser.close();
}

// 8. Cart (docs/cart-plan.md): add from a product page → pop-up → drawer; +, bin, Undo; Back closes the drawer;
//    the stock limit says why; axe on the drawer and the page; the page works without JavaScript. Needs products:
//    import tools/test-products.csv first (skipped otherwise).
{
  const site = (path) => new globalThis.URL(path, URL).href;
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products.filter((p) => ![].concat(p.tags).join(',').includes('free-gift')), () => []);
  const single = products.find((p) => p.variants.length === 1 && p.variants[0].available && !/lily/.test(p.handle));
  const limited = products.find((p) => /lily-of-the-valley/.test(p.handle));
  if (!single) console.log('SKIP  Cart checks                                    no products in the store (import tools/test-products.csv)');
  for (const [label, device] of single ? [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]] : []) {
    const { browser, page, errors } = await open(chromium, device, { reducedMotion: 'reduce' });
    const axeOn = async (sel) => {
      await page.addScriptTag({ content: axe.source });
      return page.evaluate(async (s) => (await window.axe.run(s ? document.querySelector(s) : document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`), sel);
    };
    const count = () => page.evaluate(() => +document.querySelector('[data-cart-root]')?.dataset.count);
    await page.request.post(site('/cart/clear.js'));
    await page.goto(site(`/products/${single.handle}`), { waitUntil: 'load' });
    const url = page.url();
    await page.click('.product-form__add');
    const toast = await page.waitForSelector('.cart-toast', { timeout: 8000 }).then(() => true, () => false);
    const badge = await page.textContent('[data-cart-count]').catch(() => '');
    record(`Cart, ${label}: add shows the pop-up, stays on the page`, toast && page.url() === url && badge.trim() === '1', `pop-up: ${toast}, badge: "${badge.trim()}"`);

    await page.click('.cart-toast [data-cart-view]');
    await page.waitForTimeout(500);
    const opened = await page.evaluate(() => ({ open: document.getElementById('CartDrawer').open, focus: document.activeElement?.id }));
    record(`Cart, ${label}: View cart opens the drawer`, opened.open && opened.focus === 'CartDrawerTitle', `open: ${opened.open}, focus on: ${opened.focus}`);
    const v1 = await axeOn('#CartDrawer');
    record(`Cart, ${label}: drawer accessibility (axe)`, v1.length === 0, v1.join(', ') || '0 violations');

    await page.click('#CartDrawer .qty__plus');
    await page.waitForFunction(() => document.querySelector('#CartDrawer .cart-line')?.dataset.qty === '2', null, { timeout: 8000 }).catch(() => {});
    const two = await page.evaluate(() => ({ qty: document.querySelector('#CartDrawer .cart-line')?.dataset.qty, focus: document.activeElement?.matches('.qty__plus') }));
    await page.click('#CartDrawer .qty__minus');
    await page.waitForFunction(() => document.querySelector('#CartDrawer .cart-line')?.dataset.qty === '1', null, { timeout: 8000 }).catch(() => {});
    record(`Cart, ${label}: + and − update, focus stays put`, two.qty === '2' && two.focus, `after +: ${two.qty}, focus kept on +: ${two.focus}`);

    await page.click('#CartDrawer .qty__minus');
    const undoFocused = await page.evaluate(() => document.activeElement?.matches('.cart-undo__btn'));
    await page.waitForFunction(() => document.querySelector('#CartDrawer [data-cart-root]')?.dataset.count === '0', null, { timeout: 8000 }).catch(() => {});
    const empty = await count();
    await page.click('#CartDrawer .cart-undo__btn');
    await page.waitForFunction(() => document.querySelector('#CartDrawer [data-cart-root]')?.dataset.count === '1', null, { timeout: 8000 }).catch(() => {});
    const back = await count();
    record(`Cart, ${label}: bin removes, Undo brings it back`, undoFocused && empty === 0 && back === 1, `focus on Undo: ${undoFocused}, after remove: ${empty}, after Undo: ${back}`);

    await page.goBack();
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => !document.getElementById('CartDrawer').open);
    record(`Cart, ${label}: Back closes the drawer, page stays`, closed && page.url() === url, `closed: ${closed}, same page: ${page.url() === url}`);

    if (limited && label === 'phone') {
      await page.goto(site(`/products/${limited.handle}`), { waitUntil: 'load' });
      await page.fill('.product-form__qty', '3');
      await page.click('.product-form__add');
      await page.waitForSelector('.cart-toast', { timeout: 8000 }).catch(() => {});
      await page.click('.product-form__add');
      const msg = await page.waitForSelector('[data-add-error]:not([hidden])', { timeout: 8000 }).then((el) => el.textContent(), () => '');
      record('Cart, phone: the stock limit says why', !!msg.trim(), msg.trim() || 'no message');
    }

    await page.goto(site('/cart'), { waitUntil: 'load' });
    await page.waitForTimeout(800);
    // With a free gift set up, rewards.js may be adding it; a change on its way dims prices (not a contrast fault).
    await page.waitForFunction(() => !document.querySelector('[data-cart-root].is-busy'), null, { timeout: 10000 }).catch(() => {});
    const v2 = await axeOn();
    record(`Cart page, ${label} (axe)`, v2.length === 0 && errors.length === 0, (v2.join(', ') || '0 violations') + (errors.length ? `; errors: ${errors[0]}` : ''));
    await browser.close();
  }
  if (single) {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ ...devices['Pixel 7'], javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.request.post(site('/cart/add.js'), { data: { items: [{ id: single.variants[0].id, quantity: 1 }] } });
    await page.goto(site('/cart'), { waitUntil: 'load' });
    await page.fill('.cart-line .qty__input', '2');
    await page.click('button[name="update"]');
    await page.waitForLoadState('load');
    const qty = await page.inputValue('.cart-line .qty__input').catch(() => '');
    record('Cart page without JavaScript: update works', qty === '2', `quantity after Update: ${qty}`);
    await page.request.post(site('/cart/clear.js'));
    await browser.close();
  }
}

// 8b. Compact cart (docs/cart-compact-plan.md): the drawer's pinned bottom stays small (subtotal and Checkout on one
//     row, no "Ships in", no ₹0 discount notes), so the products get the room; the amount goes to "Price details"
//     at the end of the list, with focus;
//     the added-to-cart pop-up is one 64px pill with "Added to cart" on one line and no rewards line. One product is
//     one line even when Shopify splits it in two for the gift's discount, and its + changes the whole quantity.
//     Checked with a step ahead and with everything unlocked, on a 320, a 360 and a 390px phone. Needs products.
{
  const site = (path) => new globalThis.URL(path, URL).href;
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products.filter((p) => ![].concat(p.tags).join(',').includes('free-gift') && p.variants[0].available && !/lily/.test(p.handle)), () => []);
  const cheap = products.filter((p) => p.variants.length === 1).sort((a, b) => a.variants[0].price - b.variants[0].price)[0];
  if (!cheap) console.log('SKIP  Compact cart checks                            no products in the store (import tools/test-products.csv)');
  for (const [w, h] of cheap ? [[320, 640], [360, 640], [390, 844]] : []) {
    const { browser, page, errors } = await open(chromium, { viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { reducedMotion: 'reduce' });
    const settled = () => page.waitForFunction(() => !document.querySelector('[data-cart-root].is-busy'), null, { timeout: 10000 }).catch(() => {});
    // Add from the product page, read the pop-up, open the drawer from it and read the pinned bottom.
    const addAndOpen = async () => {
      await page.goto(site(`/products/${cheap.handle}`), { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      await settled();
      await page.click('.product-form__add');
      await page.waitForSelector('.cart-toast', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(600);
      const toast = await page.evaluate(() => {
        const t = document.querySelector('.cart-toast');
        if (!t) return null;
        const r = t.getBoundingClientRect();
        const head = t.querySelector('.cart-toast__head').getBoundingClientRect();
        return { h: Math.round(r.height), oneLine: head.height < 30 && head.right <= t.querySelector('.cart-toast__text').getBoundingClientRect().right + 1, reward: !!t.querySelector('.cart-toast__reward'), inside: r.left >= 0 && r.right <= innerWidth };
      });
      await page.click('.cart-toast [data-cart-view]').catch(() => {});
      await page.waitForTimeout(2500);
      await settled();
      const drawer = await page.evaluate(() => {
        const dr = document.getElementById('CartDrawer');
        const box = dr.getBoundingClientRect();
        const body = dr.querySelector('.cart-drawer__body').getBoundingClientRect();
        const btn = dr.querySelector('[data-checkout]').getBoundingClientRect();
        const tot = dr.querySelector('.cart-summary__amount').getBoundingClientRect();
        const rewards = dr.querySelector('[data-rewards]');
        return {
          foot: Math.round(dr.querySelector('.cart-drawer__foot').getBoundingClientRect().height),
          row: tot.right <= btn.left && tot.bottom > btn.top && tot.top < btn.bottom,
          btn: [Math.round(btn.width), Math.round(btn.height)],
          full: [...dr.querySelectorAll('.cart-line')].map((l) => l.getBoundingClientRect()).filter((r) => r.top >= body.top - 1 && r.bottom <= body.bottom + 1).length,
          text: dr.textContent,
          lines: dr.querySelectorAll('.cart-line').length,
          products: new Set([...dr.querySelectorAll('.cart-line')].map((l) => l.dataset.variant + l.dataset.properties)).size,
          state: rewards?.dataset.state || 'off',
          done: !rewards || rewards.classList.contains('is-done'),
          top: +(rewards?.dataset.giftAt || rewards?.dataset.shipAt || 0),
          side: dr.scrollWidth > dr.clientWidth + 1 || [...dr.querySelectorAll('.cart-drawer__foot *')].some((e) => e.getBoundingClientRect().right > box.right + 1),
        };
      });
      return { toast, drawer };
    };
    const judge = (name, { toast: t, drawer: d }) => {
      const limit = d.done ? 125 : 175;
      record(`Compact cart, ${w}px, ${name}: pop-up is one pill`, !!t && t.h <= 68 && t.oneLine && !t.reward && t.inside, t ? `${t.h}px tall, "Added to cart" on one line: ${t.oneLine}, rewards line: ${t.reward}, on screen: ${t.inside}` : 'no pop-up');
      record(`Compact cart, ${w}px, ${name}: small pinned bottom`, d.foot <= limit && d.row && d.btn[1] >= 48 && d.btn[0] >= 150 && !d.side, `${d.foot}px (limit ${limit}, rewards: ${d.state}), subtotal beside Checkout: ${d.row}, Checkout ${d.btn[0]}×${d.btn[1]}, sideways scroll: ${d.side}`);
      record(`Compact cart, ${w}px, ${name}: no "Ships in", no ₹0 notes`, !/Ships in/.test(d.text) && !/−₹0\)/.test(d.text), `"Ships in": ${/Ships in/.test(d.text)}, "(−₹0)": ${/−₹0\)/.test(d.text)}`);
      record(`Compact cart, ${w}px, ${name}: one product, one line`, d.lines === d.products, `${d.lines} line(s) for ${d.products} product(s)`);
    };
    // The amount beside Checkout: a tap brings the price details into view and moves focus to their heading.
    const details = async (name) => {
      await page.click('#CartDrawer [data-details]');
      await page.waitForTimeout(900);
      const r = await page.evaluate(() => {
        const dr = document.getElementById('CartDrawer');
        const card = dr.querySelector('.cart-details');
        const body = dr.querySelector('.cart-drawer__body').getBoundingClientRect();
        const box = card.getBoundingClientRect();
        const amount = dr.querySelector('[data-details]');
        return { focus: document.activeElement?.matches('[data-details-at]'), seen: box.top >= body.top - 1 && box.bottom <= body.bottom + 1, rows: [...card.querySelectorAll('dt')].map((dt) => dt.textContent.trim()).join(', '), same: card.querySelector('.cart-details__row--total dd').textContent.trim() === amount.querySelector('.cart-summary__now').textContent.trim(), name: amount.textContent.replace(/\s+/g, ' ').trim(), tap: Math.round(Math.min(amount.getBoundingClientRect().width, amount.getBoundingClientRect().height)) };
      });
      record(`Compact cart, ${w}px, ${name}: the amount goes to Price details`, r.focus && r.seen && r.same && /Shipping/.test(r.rows) && r.tap >= 44, `focus on the heading: ${r.focus}, card in view: ${r.seen}, rows: ${r.rows}, same amount: ${r.same}, button reads "${r.name}", ${r.tap}px`);
    };
    await page.request.post(site('/cart/clear.js'));
    const one = await addAndOpen();
    judge('one piece', one);
    await details('one piece');
    // Past the top step (free shipping, then the gift), so every reward is unlocked and the gift line is in the cart.
    if (one.drawer.top > 0) {
      const unit = cheap.variants[0].price * 100;
      await page.request.post(site('/cart/add.js'), { data: { items: [{ id: cheap.variants[0].id, quantity: Math.ceil(one.drawer.top / unit) }] } });
      const all = await addAndOpen();
      judge('all unlocked', all);
      await details('all unlocked');
      // The API add above and the product page's add land on two Shopify lines once the gift is in: + on the one
      // line drawn must raise Shopify's total for that product by exactly one.
      const owned = () => page.evaluate((id) => fetch('/cart.js').then((r) => r.json()).then((c) => c.items.filter((i) => i.variant_id === id)), cheap.variants[0].id);
      const before = await owned();
      await page.click(`#CartDrawer .cart-line[data-variant="${cheap.variants[0].id}"] .qty__plus`);
      await page.waitForTimeout(2500);
      await settled();
      const after = await owned();
      const sum = (items) => items.reduce((n, i) => n + i.quantity, 0);
      const shown = await page.evaluate((id) => [...document.querySelectorAll(`#CartDrawer .cart-line[data-variant="${id}"]`)].map((l) => +l.dataset.qty), cheap.variants[0].id);
      record(`Compact cart, ${w}px: + on a split product changes its total`, sum(after) === sum(before) + 1 && shown.length === 1 && shown[0] === sum(after), `Shopify: ${before.length} line(s) with ${sum(before)} → ${after.length} line(s) with ${sum(after)}; drawn: ${shown.join(' + ')}`);
      if (h >= 800) record(`Compact cart, ${w}px: two whole products above the bottom`, all.drawer.full >= 2, `${all.drawer.full} whole line(s) in view`);
      const v = await page.evaluate(async (src) => { if (!window.axe) (0, eval)(src); return (await window.axe.run(document.querySelector('#CartDrawer'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`); }, axe.source);
      record(`Compact cart, ${w}px: drawer with everything unlocked (axe)`, v.length === 0, v.join(', ') || '0 violations');
    }
    if (w === 360) {
      await page.goto(site('/cart'), { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await settled();
      const text = await page.evaluate(() => document.querySelector('.cart-page').textContent);
      record('Compact cart: cart page has no "Ships in", no ₹0 notes', !/Ships in/.test(text) && !/−₹0\)/.test(text), `"Ships in": ${/Ships in/.test(text)}, "(−₹0)": ${/−₹0\)/.test(text)}`);
      const pg = await page.evaluate(() => ({ lines: document.querySelectorAll('.cart-page .cart-line').length, products: new Set([...document.querySelectorAll('.cart-page .cart-line')].map((l) => l.dataset.variant + l.dataset.properties)).size, bar: [...document.querySelectorAll('.cart-page .rewards.is-done .rewards__track')].some((t) => getComputedStyle(t).display !== 'none') }));
      record('Compact cart: cart page draws one line per product, no finished bar', pg.lines === pg.products && !pg.bar, `${pg.lines} line(s) for ${pg.products} product(s), finished bar shown: ${pg.bar}`);
    }
    await page.request.post(site('/cart/clear.js'));
    record(`Compact cart, ${w}px: no script errors`, errors.length === 0, errors[0] || 'none');
    await browser.close();
  }
}

// 9. Account & saved (docs/account-plan.md): a heart saves and survives a reload; the drawer's account row opens
//    Shopify's sheet (phones) and Esc returns to the menu button; the Saved page draws the list, Remove + Undo work;
//    a shared link is read-only with "Save all"; axe on the Saved (full and empty) and Track pages. Until Raushan
//    creates the Saved and Track pages, they're previewed on /pages/contact with ?view=. Needs products.
{
  const site = (path) => new globalThis.URL(path, URL).href;
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products.filter((p) => ![].concat(p.tags).join(',').includes('free-gift')), () => []);
  const handles = products.filter((p) => p.variants.some((v) => v.available)).slice(0, 3).map((p) => p.handle);
  const pageUrl = async (handle, view) => ((await fetch(site(`/pages/${handle}`))).ok ? site(`/pages/${handle}`) : site(`/pages/contact?view=${view}`));
  if (handles.length < 2) console.log('SKIP  Account & saved checks                         no products in the store (import tools/test-products.csv)');
  else {
    const savedUrl = await pageUrl('saved', 'saved');
    const trackUrl = await pageUrl('track-order', 'track-order');
    const join = (url, q) => url + (url.includes('?') ? '&' : '?') + q;
    for (const [label, device] of [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]]) {
      const { browser, page, errors } = await open(chromium, device, { reducedMotion: 'reduce' });
      const axeOn = async () => {
        await page.addScriptTag({ content: axe.source });
        return page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      };
      await page.evaluate(() => localStorage.removeItem('yb-saved'));
      await page.goto(site('/collections/all'), { waitUntil: 'load' });
      const heart = page.locator('#MainContent .card [data-save]').first();
      await heart.click();
      const handle = await heart.getAttribute('data-save');
      const toast = await page.waitForSelector('.saved-toast', { timeout: 4000 }).then(() => true, () => false);
      // The same pill as the added-to-cart pop-up (docs/cart-compact-plan.md): one 64px row, the heading on one line.
      await page.waitForTimeout(500);
      const pill = await page.evaluate(() => {
        const t = document.querySelector('.saved-toast');
        if (!t) return null;
        const r = t.getBoundingClientRect();
        const head = t.querySelector('.saved-toast__head').getBoundingClientRect();
        const kids = [...t.querySelectorAll('a, button')].map((k) => k.getBoundingClientRect());
        return { h: Math.round(r.height), radius: getComputedStyle(t).borderTopLeftRadius, photo: Math.round(t.querySelector('.saved-toast__media')?.getBoundingClientRect().width || 0), oneLine: head.height < 30, clear: kids.every((b) => b.left >= head.right - 1 && b.right <= r.right + 1) };
      });
      record(`Saved, ${label}: the pop-up is the same pill as the cart's`, !!pill && pill.h <= 68 && pill.radius === '32px' && pill.oneLine && pill.clear, pill ? `${pill.h}px tall, corners ${pill.radius}, photo ${pill.photo}px, heading on one line: ${pill.oneLine}, buttons clear of it: ${pill.clear}` : 'no pop-up');
      await page.reload({ waitUntil: 'load' });
      const kept = await page.locator(`#MainContent .card [data-save="${handle}"]`).first().getAttribute('aria-pressed');
      record(`Saved, ${label}: a heart saves, with the pop-up`, toast && kept === 'true', `pop-up: ${toast}, still saved after reload: ${kept}`);

      if (label === 'phone') {
        await page.click('[data-menu-open]');
        await page.waitForTimeout(400);
        await page.click('[data-account-open]');
        const sheet = await page.waitForFunction(() => document.querySelector('[data-account]')?.shadowRoot?.querySelector('dialog')?.open, null, { timeout: 8000 }).then(() => true, () => false);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        const back = await page.evaluate(() => document.activeElement?.matches('[data-menu-open]'));
        record('Account, phone: drawer row opens the sign-in sheet', sheet && back, `sheet opened: ${sheet}, Esc returns to the menu button: ${back}`);
      }

      await page.evaluate((h) => localStorage.setItem('yb-saved', JSON.stringify(h)), handles);
      await page.goto(savedUrl, { waitUntil: 'load' });
      await page.waitForFunction((n) => document.querySelectorAll('[data-saved-grid] .saved-item').length === n, handles.length, { timeout: 10000 }).catch(() => {});
      const drawn = await page.locator('[data-saved-grid] .saved-item').count();
      const v1 = await axeOn();
      record(`Saved page, ${label}: draws the list (axe)`, drawn === handles.length && v1.length === 0, `${drawn}/${handles.length} cards; ${v1.join(', ') || '0 violations'}`);

      await page.locator('[data-saved-grid] [data-save]').first().click();
      await page.waitForTimeout(400);
      const after = await page.locator('[data-saved-grid] .saved-item').count();
      await page.click('.saved-toast [data-toast-action]');
      await page.waitForTimeout(300);
      const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('yb-saved') || '[]').length);
      record(`Saved page, ${label}: Remove, then Undo`, after === handles.length - 1 && restored === handles.length, `after remove: ${after}, after Undo: ${restored} saved`);

      if (label === 'desktop') {
        await page.evaluate(() => localStorage.removeItem('yb-saved'));
        await page.goto(join(savedUrl, `list=${handles.slice(0, 2).join(',')}`), { waitUntil: 'load' });
        await page.waitForSelector('[data-saved-grid] .saved-item', { timeout: 10000 }).catch(() => {});
        await page.click('[data-saved-save-all]');
        const all = await page.evaluate(() => JSON.parse(localStorage.getItem('yb-saved') || '[]').length);
        record('Saved page: a shared list, Save all', all === 2, `${all} saved from the shared link`);

        await page.evaluate(() => localStorage.removeItem('yb-saved'));
        await page.goto(savedUrl, { waitUntil: 'load' });
        await page.waitForTimeout(800);
        const empty = await page.isVisible('[data-saved-empty]');
        const v2 = await axeOn();
        record('Saved page: empty state (axe)', empty && v2.length === 0, `empty state shown: ${empty}; ${v2.join(', ') || '0 violations'}`);

        await page.goto(trackUrl, { waitUntil: 'load' });
        const v3 = await axeOn();
        record('Track order page (axe)', v3.length === 0, v3.join(', ') || '0 violations');
      }
      record(`Account & saved, ${label}: no script errors`, errors.length === 0, errors[0] || 'none');
      await browser.close();
    }
  }
}

// 10. Home first screen (docs/home-hero-plan.md): on a small Android phone (360 × 780) the craft circles start on the
//     first screen; the next hero photo peeks in and has loaded; one way in (decisions.md 2026-10-03, hero button): on
//     phones with a photo row the photos are the way in, no button, and the row ends in a "See all" card ≥48px (with a
//     single photo, the button: a text link on a Blush hero); on desktop a solid pill button; every photo link has a
//     name; the trust line is plain text, not a tab stop; no sideways scroll from 320 to 412 wide. A calmer first
//     screen (docs/home-calm-plan.md): on phones with a photo row the hero description is hidden, and Bestsellers ends
//     in one solid button, centred, phone and desktop.
{
  const phone = { viewport: { width: 360, height: 780 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  for (const [label, engine] of QUICK ? [['Chrome', chromium]] : [['Chrome', chromium], ['Safari', webkit]]) {
    const { browser, page, errors } = await open(engine, phone, { reducedMotion: 'reduce' });
    const r = await page.evaluate(() => {
      const slides = [...document.querySelectorAll('.hero__slide')];
      const second = slides[1]?.getBoundingClientRect();
      const img2 = slides[1]?.querySelector('img');
      const cta = document.querySelector('.hero__cta');
      const bar = document.querySelector('.announce');
      return {
        crafts: Math.round(document.querySelector('.shop__crafts')?.getBoundingClientRect().top ?? 9999),
        peeks: !!second && second.left < innerWidth && second.right > innerWidth,
        loaded: !!img2 && img2.complete && img2.naturalWidth > 0,
        row: !!document.querySelector('[data-hero-slides]'),
        textHidden: !document.querySelector('.hero__text') || document.querySelector('.hero__text').getClientRects().length === 0,
        shelf: (() => { const a = document.querySelector('[data-shop-crafts] .shop__panel:not([hidden]) .shop__all'); if (!a) return null; const r = a.getBoundingClientRect(); return { centred: Math.abs(r.left + r.width / 2 - innerWidth / 2) <= 2, solid: getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)' && !getComputedStyle(a).backgroundColor.includes('/ 0.'), h: Math.round(r.height) }; })(),
        ctaShown: !!cta && cta.getClientRects().length > 0,
        all: (() => { const a = document.querySelector('.hero__all'); return a && a.getClientRects().length ? { h: Math.round(a.getBoundingClientRect().height), name: a.textContent.trim(), last: a === a.parentElement.lastElementChild } : null; })(),
        ctaH: Math.round(cta?.getBoundingClientRect().height ?? 0),
        // Without a row: a solid pill, or a text link on a Blush hero.
        shape: cta ? ((getComputedStyle(cta).backgroundColor === 'rgba(0, 0, 0, 0)') === !!cta.closest('.hero.scheme-blush')) : false,
        unnamed: [...document.querySelectorAll('.hero__link')].filter((a) => !a.textContent.trim() && !a.querySelector('img[alt]:not([alt=""])')).length,
        bar: bar ? { arrows: bar.querySelectorAll('.announce__btn').length, tab: bar.querySelector('[data-announce-track]').tabIndex } : null,
      };
    });
    record(`Home, ${label} 360 × 780: craft circles on the first screen`, r.crafts < 780, `circles start at ${r.crafts}px`);
    record(`Home, ${label}: next hero photo peeks in, loaded`, r.peeks && r.loaded, `peeks: ${r.peeks}, loaded: ${r.loaded}`);
    if (r.row) record(`Home, ${label}: calm first screen, no description on phones`, r.textHidden, `description hidden: ${r.textHidden}`);
    record(`Home, ${label}: Bestsellers ends in one solid, centred button`, !!r.shelf && r.shelf.centred && r.shelf.solid && r.shelf.h >= 48, r.shelf ? `centred: ${r.shelf.centred}, solid: ${r.shelf.solid}, ${r.shelf.h}px` : 'missing');
    if (r.row) record(`Home, ${label}: way in is the photo row, ending in "See all"`, !r.ctaShown && !!r.all && r.all.h >= 48 && r.all.last && !!r.all.name, `button shown: ${r.ctaShown}, end card: ${r.all ? `"${r.all.name}", ${r.all.h}px, last: ${r.all.last}` : 'missing'}`);
    else record(`Home, ${label}: one way in, ≥48px, the right shape`, r.ctaShown && r.ctaH >= 48 && r.shape, `${r.ctaH}px, pill or link as expected: ${r.shape}`);
    record(`Home, ${label}: every hero photo link has a name`, r.unnamed === 0, `${r.unnamed} unnamed`);
    if (r.bar) record(`Home, ${label}: trust line is plain text`, r.bar.arrows === 0 && r.bar.tab === -1, `${r.bar.arrows} arrows, tabIndex ${r.bar.tab}`);
    const wide = [];
    for (const width of [320, 390, 412]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) wide.push(width);
    }
    record(`Home, ${label}: no sideways scroll, 320–412`, wide.length === 0, wide.length ? `scrolls at ${wide.join(', ')}` : 'ok');
    record(`Home, ${label}: no script errors`, errors.length === 0, errors[0] || 'none');
    await browser.close();
  }
  const { browser, page } = await open(chromium, devices['Desktop Chrome']);
  const d = await page.evaluate(() => {
    const cta = document.querySelector('.hero__cta');
    const all = document.querySelector('[data-shop-crafts] .shop__panel:not([hidden]) .shop__all')?.getBoundingClientRect();
    return { pill: !!cta && getComputedStyle(cta).backgroundColor !== 'rgba(0, 0, 0, 0)', h: Math.round(cta?.getBoundingClientRect().height ?? 0), ways: document.querySelectorAll('.hero__actions a').length, shelfCentred: !!all && Math.abs(all.left + all.width / 2 - innerWidth / 2) <= 2, text: getComputedStyle(document.querySelector('.hero__text')).display !== 'none' };
  });
  record('Home, desktop: one way in, a pill button', d.pill && d.ways === 1 && d.h >= 48, `${d.ways} link(s), pill: ${d.pill}, ${d.h}px`);
  record('Home, desktop: description shown, Bestsellers button centred', d.text && d.shelfCentred, `description: ${d.text}, button centred: ${d.shelfCentred}`);
  await browser.close();
}

// 11. Offers (docs/offers-plan.md): the announcement bar is one line on a 360px phone and absent on /cart; the product
//     page's delivery terms are two rows at most. With offers switched on in Theme settings → Cart, the cart's rewards
//     line is there and passes axe, and the admin agrees with the theme: Shopify's real shipping rates (Delhi) have a
//     ₹0 rate from the free-shipping amount and none below it, the flat fee matches, and the gift arrives free.
//     Needs products; the admin checks are skipped while the offers are off.
{
  const site = (path) => new globalThis.URL(path, URL).href;
  const phone = { viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const { browser, page, errors } = await open(chromium, phone, { reducedMotion: 'reduce' });
  const bar = await page.evaluate(() => {
    const b = document.querySelector('.announce');
    const line = parseFloat(getComputedStyle(b?.querySelector('.announce__msg') || document.body).lineHeight);
    return b ? { lines: Math.round(b.querySelector('.announce__msg').getBoundingClientRect().height / line), links: b.querySelectorAll('a, button').length } : null;
  });
  if (bar) record('Offers, phone 360: announcement bar is one line', bar.lines === 1, `${bar.lines} line(s)`);
  await page.goto(site('/cart'), { waitUntil: 'load' });
  record('Offers: no announcement bar on /cart', !(await page.$('.announce')), 'the rewards line says it there');

  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products.filter((p) => ![].concat(p.tags).join(',').includes('free-gift')), () => []);
  const cheap = products.filter((p) => p.variants[0].available).sort((a, b) => a.variants[0].price - b.variants[0].price);
  if (!cheap.length) console.log('SKIP  Offers checks                                   no products in the store');
  else {
    await page.goto(site(`/products/${cheap[0].handle}`), { waitUntil: 'load' });
    const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.offer-terms li')].map((li) => Math.round(li.getBoundingClientRect().top))).size);
    record('Offers, phone 360: product terms in two rows at most', rows > 0 && rows <= 2, `${rows} row(s)`);

    // A cart with one cheap piece that isn't the gift itself (rewards.js would take a charged gift straight out),
    // read once the cart has settled (a change on its way dims the prices, which axe would count as low contrast).
    const settled = () => page.waitForFunction(() => !document.querySelector('[data-cart-root].is-busy'), null, { timeout: 10000 }).catch(() => {});
    const fill = async (product) => {
      await page.request.post(site('/cart/clear.js'));
      await page.request.post(site('/cart/add.js'), { data: { items: [{ id: product.variants[0].id, quantity: 1 }] } });
      await page.goto(site('/cart'), { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await settled();
      return page.evaluate(() => ({ ...document.querySelector('[data-rewards]')?.dataset }));
    };
    let r = await fill(cheap[0]);
    // The cheapest piece may be the gift: alone it's still charged, so it's taken out and the cart ends up empty.
    while (!r.state && cheap.length > 1 && (await page.evaluate(() => !document.querySelector('.cart-line')))) cheap.shift(), (r = await fill(cheap[0]));
    if (!r.state) console.log('SKIP  Offers admin checks                             free shipping and the gift are off in Theme settings');
    else {
      await page.addScriptTag({ content: axe.source });
      const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      record('Offers: cart page with the rewards line (axe)', v.length === 0, v.join(', ') || '0 violations');
      const q = 'shipping_address[zip]=110001&shipping_address[country]=India&shipping_address[province]=Delhi';
      const rates = async () => {
        await page.request.post(site(`/cart/prepare_shipping_rates.json?${q}`));
        for (let i = 0; i < 15; i++) {
          const j = await page.request.get(site(`/cart/async_shipping_rates.json?${q}`)).then((x) => x.json(), () => null);
          if (j?.shipping_rates) return j.shipping_rates.map((x) => Math.round(+x.price * 100));
          await page.waitForTimeout(1000);
        }
        return [];
      };
      const shipAt = +r.shipAt;
      const fee = +r.fee;
      if (shipAt > 0) {
        const below = await rates();
        const unit = cheap[0].variants[0].price * 100;
        await page.request.post(site('/cart/change.js'), { data: { line: 1, quantity: Math.ceil(shipAt / unit) } });
        const above = await rates();
        const ok = below.length > 0 && !below.includes(0) && above.includes(0) && (!fee || below.includes(fee));
        record('Offers: shipping rates match Theme settings', ok, `below the amount: ₹${below.map((x) => x / 100).join(', ₹') || ' none'}; from it: ₹${above.map((x) => x / 100).join(', ₹') || ' none'}${fee ? `; theme fee ₹${fee / 100}` : ''}`);
      }
      if (r.giftVariant) {
        const unit = cheap.at(-1).variants[0].price * 100;
        await page.request.post(site('/cart/add.js'), { data: { items: [{ id: cheap.at(-1).variants[0].id, quantity: Math.ceil(+r.giftAt / unit) }] } });
        await page.goto(site('/cart'), { waitUntil: 'load' });
        await page.waitForTimeout(3000);
        await settled();
        const g = await page.evaluate(() => ({ free: !!document.querySelector('.cart-line.is-gift'), state: document.querySelector('[data-rewards]')?.dataset.state }));
        record('Offers: the free gift arrives free', g.free && g.state === 'done', `gift line free: ${g.free}, state: ${g.state}${g.free ? '' : ' (is the "Buy X get Y" discount set up?)'}`);
      }
    }
    await page.request.post(site('/cart/clear.js'));
  }
  record('Offers: no script errors', errors.length === 0, errors[0] || 'none');
  await browser.close();
}

// 12. Home media (docs/home-media-plan.md): hero photos are square on phones and desktop. The "Made by hand" video
//     downloads nothing until the section is near, plays muted while it's in view, pauses on the button and when
//     scrolled away, and never starts by itself with reduced motion or data saver (nothing is even fetched).
//     Campaign cards are tested by hand: they need a dated block and Files images (home-media-plan "As built").
{
  const phone = { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const media = async (device, opts = {}) => {
    const { browser, page, errors } = await open(chromium, device, { reducedMotion: opts.reduce ? 'reduce' : 'no-preference', init: opts.init });
    const mp4 = [];
    page.on('request', (r) => { if (/\.mp4|\.m3u8/.test(r.url())) mp4.push(r.url()); });
    const hero = await page.evaluate(() => { const r = document.querySelector('.hero__slide')?.getBoundingClientRect(); return r ? Math.abs(r.width - r.height) <= 1 : null; });
    const early = mp4.length;
    const has = await page.evaluate(() => !!document.querySelector('[data-story-video]'));
    let v = null;
    if (has) {
      // The clip waits for the yarn heading beside it to be written (§14 tests that); here the words are finished
      // with a tap first, so this tests the clip on its own.
      await page.evaluate(() => document.querySelector('.story .yarn--play')?.closest('h2').dispatchEvent(new PointerEvent('pointerdown')));
      await page.evaluate(() => document.querySelector('[data-story-video]').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(2500);
      const state = () => page.evaluate(() => { const box = document.querySelector('[data-story-video]'); const el = box.querySelector('video'); return { playing: !el.paused && el.currentTime > 0, label: box.querySelector('[data-video-toggle]').getAttribute('aria-label') }; });
      v = { inView: await state() };
      if (opts.toggle) {
        await page.click('[data-video-toggle]');
        await page.waitForTimeout(400);
        v.afterPause = await state();
        await page.click('[data-video-toggle]');
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(800);
        v.away = await page.evaluate(() => !document.querySelector('[data-story-video] video').paused);
      }
      if (opts.axe) {
        await page.evaluate(() => document.querySelector('[data-story-video]').scrollIntoView({ block: 'center' }));
        await page.addScriptTag({ content: axe.source });
        v.axe = await page.evaluate(async () => (await window.axe.run(document.querySelector('.story'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      }
    }
    await browser.close();
    return { hero, early, has, v, fetched: mp4.length, errors };
  };
  const p = await media(phone, { toggle: true, axe: true });
  record('Media, phone 360: hero photos are square', p.hero === true, `square: ${p.hero}`);
  const d = await media(devices['Desktop Chrome']);
  record('Media, desktop: hero frame is square', d.hero === true, `square: ${d.hero}`);
  if (!p.has) console.log('SKIP  Media video checks                                no video in "Made by hand" (and Demo content is off)');
  else {
    record('Media, phone: no video download on first screen', p.early === 0, `${p.early} video request(s) before scrolling`);
    record('Media, phone: video plays in view, button pauses, pauses off screen', p.v.inView.playing && !p.v.afterPause.playing && p.v.afterPause.label !== p.v.inView.label && p.v.away === false, `in view: ${p.v.inView.playing}, after Pause: ${p.v.afterPause.playing} ("${p.v.afterPause.label}"), scrolled away playing: ${p.v.away}`);
    record('Media, phone: story with video (axe)', p.v.axe.length === 0 && p.errors.length === 0, (p.v.axe.join(', ') || '0 violations') + (p.errors.length ? `; errors: ${p.errors[0]}` : ''));
    const r = await media(phone, { reduce: true });
    record('Media, reduced motion: video never starts itself', !r.v.inView.playing && r.fetched === 0, `playing: ${r.v.inView.playing}, video requests: ${r.fetched}`);
    const s = await media(phone, { init: () => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }) });
    record('Media, data saver: video never starts or downloads', !s.v.inView.playing && s.fetched === 0, `playing: ${s.v.inView.playing}, video requests: ${s.fetched}`);
  }

  // Campaign banner (docs/hero-campaign-plan.md), on the test page /?view=campaign-test (a live dummy campaign, shown
  // with Demo content on): on the shortest phone the product row still fits the first screen, the banner is the LCP
  // image, the heading stays in the page; on desktop it replaces the hero, the hidden product photos aren't fetched,
  // and Bestsellers comes up onto the first screen.
  const banner = async (device) => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext(device);
    await ctx.addInitScript(skipIntro);
    await ctx.addInitScript(() => { window.__lcp = ''; new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__lcp = e.element?.className || ''; })).observe({ type: 'largest-contentful-paint', buffered: true }); });
    const page = await ctx.newPage();
    const errors = themeErrors(page);
    await page.goto(new globalThis.URL('/?view=campaign-test', URL).href, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => {
      const box = document.querySelector('.hero__banner')?.getBoundingClientRect();
      const slide = document.querySelector('.hero__slide');
      return box && {
        h: Math.round(box.height),
        rowBottom: slide && getComputedStyle(document.querySelector('.hero__visual')).display !== 'none' ? Math.round(slide.getBoundingClientRect().bottom) : null,
        shopTop: Math.round(document.querySelector('[data-shop-crafts] .section-head')?.getBoundingClientRect().top ?? 9999),
        h1: document.querySelectorAll('h1').length === 1 && document.querySelector('h1').classList.contains('visually-hidden'),
        pill: document.querySelector('.hero__pill-title')?.textContent.trim(),
        lcp: window.__lcp,
        photos: [...document.querySelectorAll('.hero__visual img')].filter((img) => img.complete && img.naturalWidth > 0).length,
      };
    });
    let v = [];
    if (r) {
      await page.addScriptTag({ content: axe.source });
      v = await page.evaluate(async () => (await window.axe.run(document.querySelector('.hero'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
    }
    await browser.close();
    return { r, v, errors };
  };
  const se = { viewport: { width: 375, height: 548 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const bp = await banner(se);
  if (!bp.r) console.log('SKIP  Campaign banner checks                              no banner on /?view=campaign-test (Demo content is off)');
  else {
    record('Campaign, iPhone SE: banner, product row on screen', bp.r.rowBottom !== null && bp.r.rowBottom <= 548 && bp.r.h1 && !!bp.r.pill, `banner ${bp.r.h}px, row ends at ${bp.r.rowBottom}px (screen 548), hidden h1: ${bp.r.h1}, pill: "${bp.r.pill}"`);
    record('Campaign, phone: banner is the LCP image (axe)', /hero__banner-img/.test(bp.r.lcp) && bp.v.length === 0 && bp.errors.length === 0, `LCP on "${bp.r.lcp}", ${bp.v.join(', ') || '0 violations'}${bp.errors.length ? `, errors: ${bp.errors[0]}` : ''}`);
    const bd = await banner({ viewport: { width: 1280, height: 800 } });
    record('Campaign, desktop 1280: banner replaces the hero', bd.r.rowBottom === null && bd.r.h <= 460 && bd.r.shopTop < 700 && bd.r.photos === 0 && bd.v.length === 0, `banner ${bd.r.h}px, Bestsellers at ${bd.r.shopTop}px, hidden product photos loaded: ${bd.r.photos}, ${bd.v.join(', ') || '0 violations'}`);
  }
}

// 13. Account page (docs/account-hub-plan.md): axe on the signed-out page and on the signed-in demo (made-up orders;
//     signing in for real needs an email code, so it's checked by hand), phone and desktop; the signed-in menu opens
//     with Enter, Tab goes into it, Esc closes it and returns focus; Sign out is in the menu and on the page; after
//     signing out the next page says so, once. Until Raushan creates the "account" page, it's /pages/contact?view=.
//     Phones (docs/account-phone-plan.md): the greeting row goes to Your details, which is its own page there (axe,
//     one h1, the details, Edit, Sign out, a way back); desktop keeps the card and the greeting is plain. Recently
//     viewed on the account page can be cleared.
{
  const site = (path) => new globalThis.URL(path, URL).href;
  const acct = (await fetch(site('/pages/account'))).ok ? site('/pages/account') : site('/pages/contact?view=account');
  const demoUrl = site('/pages/contact?view=account-demo');
  const detailsUrl = site('/pages/contact?view=account-details-demo');
  const seen = await fetch(site('/products.json?limit=10')).then((r) => r.json()).then((d) => d.products.slice(0, 2).map((p) => p.handle), () => []);
  const hasDemo = await fetch(demoUrl).then((r) => r.text()).then((t) => t.includes('order-card'), () => false);
  for (const [label, device] of [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]]) {
    const { browser, page, errors } = await open(chromium, device, { reducedMotion: 'reduce' });
    const axeOn = async () => {
      await page.addScriptTag({ content: axe.source });
      return page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
    };
    await page.goto(acct, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const v1 = await axeOn();
    record(`Account page, ${label}: signed out (axe)`, v1.length === 0, v1.join(', ') || '0 violations');
    if (!hasDemo) console.log(`SKIP  Account page, ${label}: signed-in demo            Demo content is off`);
    else {
      await page.goto(demoUrl, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      const v2 = await axeOn();
      const out = await page.locator('.account [data-sign-out]').count();
      record(`Account page, ${label}: signed-in demo (axe)`, v2.length === 0 && out === 1, `${v2.join(', ') || '0 violations'}; Sign out on the page: ${out}`);
      const row = await page.evaluate(() => {
        const a = document.querySelector('.account__go');
        const at = (el) => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); };
        const shown = !!a && getComputedStyle(a).display !== 'none';
        return {
          shown,
          tap: shown && at(document.querySelector('.account__title')) === a && at(document.querySelector('.account__email')) === a && at(document.querySelector('.account__avatar')) === a,
          to: a?.getAttribute('href') || '',
          name: a?.textContent.trim() || '',
          card: !!document.querySelector('.account__grid .account__details')?.offsetParent,
        };
      });
      if (label === 'phone') record('Account page, phone: the greeting row goes to Your details', row.shown && row.tap && row.to.includes('account-details') && row.name.length > 0 && !row.card, `arrow shown: ${row.shown}, name, email and initial are the link: ${row.tap}, to ${row.to}, called "${row.name}"; details card on the page: ${row.card}`);
      else record('Account page, desktop: details card beside the orders, greeting plain', !row.shown && row.card, `greeting link shown: ${row.shown}, details card shown: ${row.card}`);

      if (seen.length && label === 'phone') {
        await page.evaluate((list) => localStorage.setItem('yb-recent-products', JSON.stringify(list)), seen);
        await page.reload({ waitUntil: 'load' });
        const drawn = await page.waitForSelector('[data-account-row="recent"] .saved-item', { timeout: 8000 }).then(() => true, () => false);
        const size = await page.evaluate(() => { const r = document.querySelector('[data-account-clear]').getBoundingClientRect(); return Math.round(r.height); });
        await page.click('[data-account-clear]');
        await page.waitForTimeout(300);
        const after = await page.evaluate(() => ({
          hidden: document.querySelector('[data-account-row="recent"]').hidden,
          kept: localStorage.getItem('yb-recent-products'),
          focus: document.activeElement.matches('[data-account-title]'),
        }));
        record('Account page: Clear Recently viewed', drawn && size >= 44 && after.hidden && !after.kept && after.focus, `row drawn: ${drawn}, button ${size}px tall, row hidden after: ${after.hidden}, list emptied: ${!after.kept}, focus on the heading: ${after.focus}`);
      }

      await page.goto(detailsUrl, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      const v4 = await axeOn();
      const det = await page.evaluate(() => ({
        solo: !!document.querySelector('.account--details'),
        h1: document.querySelectorAll('h1').length,
        rows: document.querySelectorAll('.account__dl > div').length,
        edit: document.querySelectorAll('.account__edit').length,
        out: document.querySelectorAll('.account [data-sign-out]').length,
        back: document.querySelector('.account__back')?.getAttribute('href') || '',
        backTall: Math.round(document.querySelector('.account__back')?.getBoundingClientRect().height || 0),
        wide: document.documentElement.scrollWidth > innerWidth,
      }));
      record(`Your details page, ${label} (axe)`, v4.length === 0 && det.solo && det.h1 === 1 && det.rows === 5 && det.edit === 1 && det.out === 1 && det.back.includes('view=account-demo') && det.backTall >= 44 && !det.wide, `${v4.join(', ') || '0 violations'}; h1: ${det.h1}, rows: ${det.rows}, Edit: ${det.edit}, Sign out: ${det.out}, back to ${det.back} (${det.backTall}px tall), scrolls sideways: ${det.wide}`);
      await page.goto(demoUrl, { waitUntil: 'load' });
      await page.waitForTimeout(600);

      if (label === 'desktop') {
        await page.focus('.account-menu__btn');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
        const opened = await page.evaluate(() => document.querySelector('#AccountMenu')?.matches(':popover-open'));
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(() => !!document.activeElement.closest('#AccountMenu'));
        const signOut = await page.locator('#AccountMenu [data-sign-out]').count();
        const v3 = await axeOn();
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        const back = await page.evaluate(() => !document.querySelector('#AccountMenu').matches(':popover-open') && document.activeElement.matches('.account-menu__btn'));
        record('Account menu: Enter, Tab inside, Esc back (axe)', opened && inside && back && signOut === 1 && v3.length === 0, `opens: ${opened}, Tab inside: ${inside}, Esc returns: ${back}, Sign out: ${signOut}; ${v3.join(', ') || '0 violations'}`);
      }
    }
    if (label === 'phone') {
      await page.evaluate(() => sessionStorage.setItem('yb-signed-out', '1'));
      await page.goto(site('/'), { waitUntil: 'load' });
      await page.waitForTimeout(600);
      const said = await page.evaluate(() => document.querySelector('.saved-toast')?.textContent.replace(/\s+/g, ' ').trim() || '');
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(600);
      const again = await page.evaluate(() => !!document.querySelector('.saved-toast'));
      record('Signed out: the next page says so, once', /signed out/.test(said) && !said.includes('&#') && !again, `"${said}"; shown again on reload: ${again}`);
    }
    record(`Account page, ${label}: no script errors`, errors.length === 0, errors[0] || 'none');
    await browser.close();
  }
}

// 14. Yarn lettering (docs/yarn-story-plan.md): the hero's "stitched with love" is drawn in yarn, still and readable
//     at once. Our story's "One stitch at a time" is blank until the whole heading is on screen, then a crochet hook
//     and a yarn ball arrive and write it, and it ends finished: nothing still moving, the strand whole, the i's
//     dotted, the hook and ball gone. A tap, or scrolling it away, finishes it at once. It waits for the logo intro.
//     The clip beside it waits for the words. With reduced motion it's simply there. The headings read as plain words.
{
  const home = await fetch(URL).then((r) => r.text()).catch(() => '');
  const hasHero = /class="hero[\s\S]*?class="yarn"/.test(home);
  const hasStory = home.includes('yarn yarn--play');
  const phone = devices['Pixel 7'];
  const state = (page, sel) => page.evaluate((sel) => {
    const svg = document.querySelector(sel);
    if (!svg) return null;
    const op = (s) => (svg.querySelector(s) ? +getComputedStyle(svg.querySelector(s)).opacity : 0);
    const draw = svg.querySelector('.yarn__draw');
    const video = document.querySelector('[data-story-video] video');
    return {
      play: document.documentElement.classList.contains('yarn-play'),
      ready: svg.classList.contains('is-ready'),
      writing: svg.classList.contains('is-writing'),
      written: svg.classList.contains('is-written'),
      shown: getComputedStyle(svg.querySelector('.yarn__strand')).visibility === 'visible',
      offset: draw ? parseFloat(getComputedStyle(draw).strokeDashoffset) || 0 : 0,
      knot: op('.yarn__knot'),
      hook: op('.yarn__hook'),
      ball: op('.yarn__ball'),
      moving: document.getAnimations().filter((a) => a.effect?.target?.closest?.(sel) && a.playState === 'running').length,
      heading: svg.closest('h1, h2').textContent.replace(/\s+/g, ' ').trim(),
      video: video ? !video.paused : null,
    };
  }, sel);
  const toHeading = (page) => page.evaluate(() => { const h = document.querySelector('.story h2'); scrollTo(0, scrollY + h.getBoundingClientRect().top - innerHeight * 0.45); });
  const STORY = '.story .yarn';

  if (!hasHero) console.log('SKIP  Yarn lettering, hero                              the hero heading isn\'t "*stitched with love*"');
  else {
    const { browser, page } = await open(chromium, phone, { reducedMotion: 'no-preference' });
    const s = await state(page, '.hero .yarn, h1 .yarn');
    record('Yarn lettering: hero is still and whole at once', s.shown && s.knot === 1 && !s.writing && !s.written && s.moving === 0 && !(await page.$('h1 .yarn__hook, h1 .yarn__ball')), `strand shown: ${s.shown}, knots: ${s.knot}, still moving: ${s.moving}`);
    record('Yarn lettering: the hero heading reads as words', s.heading.endsWith('stitched with love'), `"${s.heading}"`);
    await browser.close();
  }

  if (!hasStory) console.log('SKIP  Yarn lettering, story                             Our story\'s heading isn\'t "One stitch at a time"');
  else {
    let { browser, page, errors } = await open(chromium, phone, { reducedMotion: 'no-preference' });
    let s = await state(page, STORY);
    const blank = !s.shown && !s.ready;
    await toHeading(page);
    await page.waitForFunction((sel) => document.querySelector(sel)?.classList.contains('is-written'), STORY, { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(1800);
    s = await state(page, STORY);
    record('Yarn lettering: story blank until seen', blank, `blank before scrolling to it: ${blank}`);
    record('Yarn lettering: story writes itself, then rests', s.play && s.written && s.offset === 0 && s.knot === 1 && s.hook === 0 && s.ball === 0 && s.moving === 0, `written: ${s.written}, strand left: ${s.offset}, knots: ${s.knot}, hook: ${s.hook}, ball: ${s.ball}, still moving: ${s.moving}`);
    record('Yarn lettering: the story heading reads as words', s.heading === 'One stitch at a time', `"${s.heading}"`);
    record('Yarn lettering: no script errors', errors.length === 0, errors[0] || 'none');
    await browser.close();

    ({ browser, page } = await open(chromium, phone, { reducedMotion: 'no-preference' }));
    await toHeading(page);
    await page.waitForFunction((sel) => document.querySelector(sel)?.classList.contains('is-writing'), STORY, { timeout: 8000 }).catch(() => {});
    await page.click('.story h2');
    await page.waitForTimeout(250);
    s = await state(page, STORY);
    const tap = s.written && s.offset === 0;
    await page.close();
    page = await (await browser.newContext({ ...phone, reducedMotion: 'no-preference' })).newPage();
    await page.addInitScript(() => { try { localStorage.setItem('yb-intro-seen', String(Date.now())); } catch {} });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await toHeading(page);
    await page.waitForFunction((sel) => document.querySelector(sel)?.classList.contains('is-writing'), STORY, { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    s = await state(page, STORY);
    record('Yarn lettering: a tap, or scrolling away, finishes it', tap && s.written && s.offset === 0, `after a tap: ${tap}, after scrolling away: ${s.written}`);
    await browser.close();

    // The logo intro never plays for test browsers, so it's stood in for: the class goes on as the page starts, and
    // the splash then leaves as usual (2.7 s). The heading is put in view at once, so only the intro holds it back.
    browser = await chromium.launch();
    page = await (await browser.newContext({ ...phone, reducedMotion: 'no-preference' })).newPage();
    await page.addInitScript(() => new MutationObserver((m, o) => { if (document.documentElement) { document.documentElement.classList.add('yb-intro'); o.disconnect(); } }).observe(document, { childList: true }));
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await toHeading(page);
    await page.waitForTimeout(800);
    const early = await page.evaluate((sel) => document.documentElement.classList.contains('yb-intro') && document.querySelector(sel).classList.contains('is-ready'), STORY);
    const later = await page.waitForFunction((sel) => !document.documentElement.classList.contains('yb-intro') && document.querySelector(sel).classList.contains('is-writing'), STORY, { timeout: 8000 }).then(() => true, () => false);
    record('Yarn lettering: waits for the logo intro', !early && later, `started during the intro: ${early}, writing after it: ${later}`);
    await browser.close();

    if (home.includes('data-story-video')) {
      ({ browser, page } = await open(chromium, devices['Desktop Chrome'], { reducedMotion: 'no-preference' }));
      await toHeading(page);
      await page.waitForTimeout(2500);
      const during = await state(page, STORY);
      await page.waitForFunction((sel) => document.querySelector(sel)?.classList.contains('is-written'), STORY, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const after = await state(page, STORY);
      record('Yarn lettering: the clip waits for the words', during.writing && !during.written && during.video === false && after.video === true, `clip playing while writing: ${during.video}, after: ${after.video}`);
      await browser.close();
    }

    ({ browser, page } = await open(chromium, phone, { reducedMotion: 'reduce' }));
    s = await state(page, STORY);
    record('Yarn lettering, reduced motion: simply there', !s.play && s.shown && s.offset === 0 && s.knot === 1, `writing: ${s.play}, strand shown: ${s.shown}, knots: ${s.knot}`);
    await browser.close();
  }
}

// 15. Gifting (docs/gifting-plan.md): the occasion shelf stands apart from its neighbours (its own background), every
//     tile is a link to its own collection (or, with Demo content, to all products), phones swipe the row without the
//     page scrolling sideways, desktop shows every tile in one row, and axe finds nothing.
{
  const home = await fetch(URL).then((r) => r.text()).catch(() => '');
  if (!home.includes('class="section occasions')) console.log('SKIP  Gifting                                           no "Shop by occasion" section on the home page');
  else {
    const look = (page) => page.evaluate(() => {
      const sec = document.querySelector('.occasions');
      const wrap = sec.closest('.shopify-section');
      const bg = (el) => (el ? getComputedStyle(el.querySelector('.section') || el).backgroundColor : null);
      const row = sec.querySelector('.occasions__list');
      const tiles = [...sec.querySelectorAll('.occasion')];
      return {
        bg: getComputedStyle(sec).backgroundColor,
        before: bg(wrap.previousElementSibling),
        after: bg(wrap.nextElementSibling),
        links: tiles.map((a) => a.getAttribute('href')),
        named: tiles.every((a) => a.textContent.trim().length > 1),
        swipes: row.scrollWidth > row.clientWidth + 4,
        oneRow: new Set(tiles.map((a) => Math.round(a.getBoundingClientRect().top))).size === 1,
        sideways: document.documentElement.scrollWidth > innerWidth,
      };
    });
    let { browser, page, errors } = await open(chromium, devices['Pixel 7'], { reducedMotion: 'no-preference' });
    await page.evaluate(() => document.querySelector('.occasions').scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(1800); // the tiles' arrival has finished, so axe sees their real colours
    const p = await look(page);
    const own = p.links.every((h) => h && h !== '/collections' && (h === '/collections/all' || p.links.filter((x) => x === h).length === 1));
    record('Gifting: stands apart from its neighbours', p.bg !== p.before && p.bg !== p.after, `background ${p.bg}, before ${p.before}, after ${p.after}`);
    record('Gifting: each tile goes to its own collection', p.links.length > 0 && own && p.named, `${p.links.length} tiles: ${[...new Set(p.links)].join(', ')}`);
    record('Gifting, phone: the row swipes, the page doesn\'t', p.swipes && !p.sideways, `row swipes: ${p.swipes}, page scrolls sideways: ${p.sideways}`);
    await page.addScriptTag({ content: axe.source });
    const v = await page.evaluate(async () => (await window.axe.run(document.querySelector('.occasions'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
    record('Gifting: axe', v.length === 0 && errors.length === 0, (v.join(', ') || '0 violations') + (errors.length ? `; errors: ${errors[0]}` : ''));
    await browser.close();

    ({ browser, page } = await open(chromium, devices['Desktop Chrome'], { reducedMotion: 'no-preference' }));
    const d = await look(page);
    record('Gifting, desktop: every tile in one row', d.oneRow && !d.swipes, `one row: ${d.oneRow}, scrolls: ${d.swipes}`);
    await browser.close();
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; failing: ${failed.map((f) => f.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
