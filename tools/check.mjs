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
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products, () => []);
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

// 9. Account & saved (docs/account-plan.md): a heart saves and survives a reload; the drawer's account row opens
//    Shopify's sheet (phones) and Esc returns to the menu button; the Saved page draws the list, Remove + Undo work;
//    a shared link is read-only with "Save all"; axe on the Saved (full and empty) and Track pages. Until Raushan
//    creates the Saved and Track pages, they're previewed on /pages/contact with ?view=. Needs products.
{
  const site = (path) => new globalThis.URL(path, URL).href;
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products, () => []);
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

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; failing: ${failed.map((f) => f.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
