// Yarn Basket theme checks: speed, smoothness, motion and accessibility, across Chrome, Safari (WebKit) and Firefox.
// Usage: npm run check            (full run against the local `shopify theme dev` server)
//        npm run check:quick      (Chrome only)
//        npm run check -- --only 4,5,18   (only those sections; add --quick for Chrome only)
//        npm run check:money      (prices and what is on sale, no browser: tools/money-check.mjs; part of the full run,
//                                  --only money runs it here, and git runs it before every push that touches the theme)
//        node tools/check.mjs --url https://yarnbasket-in.myshopify.com/?preview_theme_id=…
// Budgets come from docs/motion-plan.md, section 6. Exits non-zero if any check fails.
import { chromium, webkit, firefox, devices } from 'playwright';
import axe from 'axe-core';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const URL = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://127.0.0.1:9292/';
const QUICK = args.includes('--quick');
// --only 4,5,18 runs just those sections (the numbers in the comments below): enough to verify the work in hand.
// The full run is for now and then, after a batch of work (Raushan, 2026-10-04).
const ONLY = args.includes('--only') ? new Set(String(args[args.indexOf('--only') + 1] || '').split(',').map((s) => s.trim()).filter(Boolean)) : null;
const ran = new Set();
const want = (id) => { const yes = !ONLY || ONLY.has(id); if (yes) ran.add(id); return yes; };

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
  await page.goto(opts.path ? new globalThis.URL(opts.path, URL).href : URL, { waitUntil: 'load' });
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
for (const [label, engine, device] of want('1') ? runs : []) {
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

// 1b. Arrivals never keep the shopper waiting (docs/fluid-feel-plan.md): 700ms after landing on any screen of the
//     home page, nothing in view is still hidden or faded by an arrival.
for (const [label, device] of want('1b') ? [['desktop', devices['Desktop Chrome']], ['phone', devices['Pixel 7']]] : []) {
  const { browser, page } = await open(chromium, device);
  const late = await page.evaluate(async () => {
    const worst = [];
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
    for (let y = innerHeight; y < document.documentElement.scrollHeight - innerHeight; y += innerHeight * 0.9) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 700));
      const faded = [...document.querySelectorAll('.is-pending, .is-pending > *, .is-arriving, .is-arriving > *, .is-arriving .media, .is-arriving .review__star')]
        .filter((el) => inView(el) && !(el.closest('.review__stars') && el.closest('.scroller')) && +getComputedStyle(el).opacity < 0.9);
      if (faded.length) worst.push(`${faded.length} at ${Math.round(y)}px (${faded[0].className.toString().slice(0, 40)})`);
    }
    return worst;
  });
  record(`Arrivals settle within 700ms, ${label}`, late.length === 0, late.slice(0, 2).join('; ') || 'every screen settled');
  await browser.close();
}

// 1c. Swipe rows arrive without shaking (docs/decisions.md, 2026-10-07): on a phone and a tablet the items slide in
//     from the side once. The row never scrolls by itself while they do, and no item changes direction.
for (const [label, device] of want('1c') ? [['phone', devices['Pixel 7']], ['tablet', { viewport: { width: 820, height: 1100 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]] : []) {
  const { browser, page } = await open(chromium, device);
  await page.evaluate(() => {
    window.__rows = [...document.querySelectorAll('[data-arrive~="stagger"].scroller')].map((row) => ({ row, name: row.className.split(' ')[0], left: [row.scrollLeft], x: [[], []] }));
    const tick = () => {
      for (const r of window.__rows) {
        if (r.left.at(-1) !== r.row.scrollLeft) r.left.push(r.row.scrollLeft);
        r.x.forEach((seen, i) => { const el = r.row.children[i]; if (!el) return; const x = Math.round(el.getBoundingClientRect().left * 10) / 10; if (seen.at(-1) !== x) seen.push(x); });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const steps = Math.ceil(await page.evaluate(() => document.documentElement.scrollHeight) / 30);
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, 30); await page.waitForTimeout(16); }
  await page.waitForTimeout(1200);
  const rows = await page.evaluate(() => {
    const turns = (a) => a.filter((v, i) => i > 1 && (v - a[i - 1]) * (a[i - 1] - a[i - 2]) < 0).length;
    return window.__rows.map((r) => ({ name: r.name, scrolled: r.left.length > 1 || r.left[0] !== 0, turns: Math.max(...r.x.map(turns)), snap: getComputedStyle(r.row).scrollSnapType }));
  });
  const bad = rows.filter((r) => r.scrolled || r.turns > 0 || r.snap === 'none');
  record(`Swipe rows arrive without shaking, ${label}`, rows.length > 0 && bad.length === 0, bad.map((r) => `${r.name}: scrolled by itself ${r.scrolled}, direction changes ${r.turns}, snapping after ${r.snap}`).join('; ') || `${rows.length} rows still`);
  await browser.close();
}

// 2. Smoothness: slow frames during a cold scroll, CPU slowed 4x (Chrome only: it exposes CPU throttling)
for (const [label, device] of want('2') ? [['desktop', devices['Desktop Chrome']], ['phone', devices['Pixel 7']]] : []) {
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
if (want('3')) {
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
for (const [label, device] of want('4') ? [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]] : []) {
  const { browser, page } = await open(chromium, device, { reducedMotion: 'reduce' });
  await scrollWholePage(page);
  // Back to the top first: where the scroll ends the header is slid off above the screen, and axe counts whatever
  // sits behind it up there as a covered tap target (an FAQ row, 68px tall, came out as 22px).
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.addScriptTag({ content: axe.source });
  const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  record(`Accessibility, ${label} (axe)`, v.length === 0, v.join(', ') || '0 violations');
  await browser.close();
}

// 5. Reduced motion: complete and still
if (want('5')) {
  const { browser, page } = await open(chromium, devices['Pixel 7'], { reducedMotion: 'reduce' });
  const pending = await page.evaluate(() => document.querySelectorAll('.is-pending').length);
  record('Reduced motion: nothing waits to appear', pending === 0, `${pending} waiting`);
  await browser.close();
}

// 6. Lite mode (data saver): no loops, no intro, slideshow paused
if (want('6')) {
  const { browser, page } = await open(chromium, devices['Pixel 7'], {
    keepIntro: true,
    init: () => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }),
  });
  const r = await page.evaluate(() => ({
    lite: document.documentElement.classList.contains('lite'),
    arrival: getComputedStyle(document.querySelector('.hero__img')).animationName,
    intro: !!document.getElementById('yb-splash'),
  }));
  record('Lite mode (data saver)', r.lite && r.arrival === 'none' && !r.intro, `lite=${r.lite}, hero arrival animation=${r.arrival}, intro shown=${r.intro}`);
  await browser.close();
}

// 6b. No backdrop blur anywhere (docs/fluid-feel-plan.md phase C): it is redrawn on every frame of a scroll
for (const path of want('6b') ? ['', 'collections/all', 'cart', 'search?q=flower'] : []) {
  const { browser, page } = await open(chromium, devices['Pixel 7']);
  if (path) await page.goto(new globalThis.URL('/' + path, URL).href, { waitUntil: 'load' });
  const blurred = await page.evaluate(() => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).backdropFilter !== 'none').map((el) => el.className || el.tagName));
  record(`No backdrop blur: /${path}`, blurred.length === 0, blurred.length ? blurred.join(', ') : 'none');
  await browser.close();
}

// 6c. Our story on a phone (docs/story-phone-plan.md): the whole Blush panel fits one 360 × 800 screen, the clip is
//     landscape, and the icon shares a row with the small label.
if (want('6c')) {
  const { browser, page } = await open(chromium, { viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { reducedMotion: 'reduce' });
  const s = await page.evaluate(() => {
    const box = (sel) => document.querySelector(sel)?.getBoundingClientRect();
    const panel = box('.story__grid'); const media = box('.story__media--video'); const icon = box('.story__copy > .story__icon'); const label = box('.story__copy > .eyebrow');
    if (!panel) return null;
    return {
      panel: Math.round(panel.height),
      screen: innerHeight,
      shape: media ? +(media.width / media.height).toFixed(2) : null,
      sameRow: icon && label ? icon.top < label.bottom && label.top < icon.bottom : null,
    };
  });
  if (!s) console.log('SKIP  Story, phone                                       no story section on the home page');
  else {
    record('Story, phone 360: the panel fits one screen', s.panel <= s.screen, `panel ${s.panel}px of ${s.screen}px`);
    if (s.shape !== null) record('Story, phone 360: the clip is landscape (4:3)', Math.abs(s.shape - 4 / 3) < 0.02, `width / height ${s.shape}`);
    if (s.sameRow !== null) record('Story, phone 360: icon beside the label', s.sameRow, `same row: ${s.sameRow}`);
  }
  await browser.close();
}

// 7. Search (docs/search-plan.md): the panel opens with focus in the field, results arrive as you type,
//    nothing in it loads before it's opened, and axe passes with results showing. Phone and desktop.
for (const [label, device] of want('7') ? [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]] : []) {
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
if (want('7')) {
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
for (const [label, device] of want('7') ? [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]] : []) {
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
if (want('8')) {
  const site = (path) => new globalThis.URL(path, URL).href;
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products.filter((p) => ![].concat(p.tags).join(',').includes('free-gift')), () => []);
  const single = products.find((p) => p.variants.length === 1 && p.variants[0].available && !/lily/.test(p.handle));
  const limited = products.find((p) => p.handle === 'lily-of-the-valley-bag-charm');
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
    await page.click('.pdp__add');
    // The product page shows the stepper and View cart in place of the button, with no pop-up (round 8).
    await page.waitForSelector('#CartDrawer .cart-line', { state: 'attached', timeout: 8000 }).catch(() => {});
    const swapped = await page.evaluate(() => !!document.querySelector('[data-buy].is-in') && !document.querySelector('.cart-toast'));
    const badge = await page.textContent('[data-cart-count]').catch(() => '');
    record(`Cart, ${label}: add shows the stepper and no pop-up, stays on the page`, swapped && page.url() === url && badge.trim() === '1', `stepper, no pop-up: ${swapped}, badge: "${badge.trim()}"`);

    await page.locator('[data-in] [data-cart-view]:visible').first().click();
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

    // At 1 the minus stops (greyed out, no stock note): the bin beside the stepper is the way out.
    await page.click('#CartDrawer .qty__minus', { force: true });
    await page.waitForTimeout(700);
    const stop = await page.evaluate(() => { const li = document.querySelector('#CartDrawer .cart-line'); return { off: li?.querySelector('.qty__minus').getAttribute('aria-disabled') === 'true', qty: li?.dataset.qty, note: li?.querySelector('[data-line-note]').hidden, minus: getComputedStyle(li.querySelector('.qty__minus .icon--bin')).display === 'none' }; });
    record(`Cart, ${label}: minus stops at 1`, stop.off && stop.qty === '1' && stop.note && stop.minus, `greyed out: ${stop.off}, quantity after a tap: ${stop.qty}, no note: ${stop.note}, still a minus: ${stop.minus}`);

    // The bin takes the whole piece in one tap, whatever its quantity, and Undo brings all of it back. Three of a
    // piece can earn the free gift, which comes and goes on its own: wait for the cart to rest, and count the piece.
    const rest = async () => { await page.waitForTimeout(1500); await page.waitForFunction(() => !document.querySelector('#CartDrawer [data-cart-root].is-busy'), null, { timeout: 10000 }).catch(() => {}); await page.waitForTimeout(1500); };
    const piece = () => page.evaluate(() => +(document.querySelector('#CartDrawer .cart-line:not(.is-gift)')?.dataset.qty || 0));
    await page.click('#CartDrawer .cart-line:not(.is-gift) .qty__plus');
    await page.click('#CartDrawer .cart-line:not(.is-gift) .qty__plus');
    await rest();
    const three = await piece();
    await page.click('#CartDrawer .cart-line__remove');
    const undoFocused = await page.evaluate(() => document.activeElement?.matches('.cart-undo__btn'));
    await rest();
    const empty = await piece();
    await page.click('#CartDrawer .cart-undo__btn');
    await rest();
    const back = await piece();
    record(`Cart, ${label}: bin removes all of a piece, Undo brings it back`, undoFocused && three === 3 && empty === 0 && back === 3, `focus on Undo: ${undoFocused}, before: ${three}, after the bin: ${empty}, after Undo: ${back}`);
    // Back to one, for the checks below.
    await page.click('#CartDrawer .cart-line:not(.is-gift) .qty__minus');
    await page.click('#CartDrawer .cart-line:not(.is-gift) .qty__minus');
    await rest();

    await page.goBack();
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => !document.getElementById('CartDrawer').open);
    record(`Cart, ${label}: Back closes the drawer, page stays`, closed && page.url() === url, `closed: ${closed}, same page: ${page.url() === url}`);

    // Forward opens it again, as Back closed it. A reload is a fresh page: the drawer starts closed (2026-10-05).
    await page.goForward();
    await page.waitForTimeout(800);
    const again = await page.evaluate(() => document.getElementById('CartDrawer').open);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const fresh = await page.evaluate(() => !document.getElementById('CartDrawer').open && !history.state?.cartDrawer);
    record(`Cart, ${label}: Forward reopens the drawer, a reload starts closed`, again && fresh && page.url() === url, `Forward opened: ${again}, closed after reload: ${fresh}`);

    if (limited && label === 'phone') {
      await page.goto(site(`/products/${limited.handle}`), { waitUntil: 'load' });
      // No quantity field on the product page: the piece goes in, and its stepper stops at the stock and says why.
      await page.waitForTimeout(1500);
      await page.click('.pdp__add');
      await page.locator('.pdp__cta .qty__input').waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      await page.fill('.pdp__cta .qty__input', '99');
      await page.locator('.pdp__cta .qty__input').dispatchEvent('change');
      await page.waitForTimeout(2500);
      const stop = await page.evaluate(async () => ({ msg: document.querySelector('.pdp__limit:not([hidden])')?.textContent.replace(/\s+/g, ' ').trim() || '', off: document.querySelector('.pdp__cta .qty__plus').getAttribute('aria-disabled') === 'true', shown: document.querySelector('.pdp__cta .qty__input').value, held: (await (await fetch('/cart.js')).json()).items.reduce((n, i) => n + i.quantity, 0) }));
      record('Cart, phone: the stock limit says why', !!stop.msg && stop.off && +stop.shown < 99 && stop.held >= +stop.shown, `typing 99 gives ${stop.shown}, cart holds ${stop.held}, plus off: ${stop.off}; "${stop.msg || 'no message'}"`);
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
if (want('8b')) {
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
      await page.click('.pdp__add');
      await page.waitForSelector('#CartDrawer .cart-line', { state: 'attached', timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(600);
      // No pop-up on the product page any more (round 8): the bar itself turns into the stepper and View cart.
      const toast = await page.evaluate(() => ({ none: !document.querySelector('.cart-toast'), bar: !!document.querySelector('[data-buy].is-in') }));
      await page.locator('[data-in] [data-cart-view]:visible').first().click().catch(() => {});
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
          // Lines with nothing extra to say (no note, the name's block at its reserved two lines) are one height,
          // and the bin shares the stepper's row.
          // A long name never makes a line taller: it is cut with "…" inside the two reserved lines (2026-10-06).
          // Only a discount line or a second line of options may add to the block.
          tallNames: [...dr.querySelectorAll('.cart-line')].filter((l) => { const info = l.querySelector('.cart-line__info'); return !info.querySelector('.cart-line__deal') && info.querySelectorAll('.cart-line__meta').length <= 1 && info.getBoundingClientRect().height > parseFloat(getComputedStyle(info).minHeight) + 1; }).length,
          heights: [...new Set([...dr.querySelectorAll('.cart-line')].filter((l) => l.querySelector('[data-line-note]').hidden && l.querySelector('.cart-line__info').getBoundingClientRect().height <= parseFloat(getComputedStyle(l.querySelector('.cart-line__info')).minHeight) + 1).map((l) => Math.round(l.querySelector('.cart-line__body').getBoundingClientRect().height)))],
          binRow: [...dr.querySelectorAll('.cart-line__remove')].every((b) => { const q = b.parentElement.querySelector('.qty').getBoundingClientRect(); const r = b.getBoundingClientRect(); return Math.abs(r.top - q.top) < 2 && r.left >= q.right && r.width >= 44 && r.height >= 44; }),
          lines: dr.querySelectorAll('.cart-line').length,
          products: new Set([...dr.querySelectorAll('.cart-line')].map((l) => l.dataset.variant + l.dataset.properties)).size,
          state: rewards?.dataset.state || 'off',
          done: !rewards || rewards.classList.contains('is-done'),
          top: +(rewards?.dataset.top || 0),
          // Rewards (round 4): one line of words, the progress bar on the pinned bottom's top edge, and every step
          // on a path in "Your rewards", a card of its own before the price details.
          edge: (() => { const t = dr.querySelector('.cart-drawer__foot .rewards__track')?.getBoundingClientRect(); const f = dr.querySelector('.cart-drawer__foot').getBoundingClientRect(); return !!t && Math.abs(t.top - f.top) <= 1 && Math.abs(t.width - f.width) <= 1 && t.height <= 4; })(),
          words: (() => { const t = dr.querySelector('[data-rewards-text]'); return t ? Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight)) : 0; })(),
          ladder: dr.querySelectorAll('.ladder li').length,
          reached: dr.querySelectorAll('.ladder li.is-reached').length,
          side: dr.scrollWidth > dr.clientWidth + 1 || [...dr.querySelectorAll('.cart-drawer__foot *')].some((e) => e.getBoundingClientRect().right > box.right + 1),
        };
      });
      return { toast, drawer };
    };
    const judge = (name, { toast: t, drawer: d }) => {
      const limit = d.done ? 125 : 120;
      record(`Compact cart, ${w}px, ${name}: the bar changes, no pop-up`, t.none && t.bar, `no pop-up: ${t.none}, stepper in the bar: ${t.bar}`);
      record(`Compact cart, ${w}px, ${name}: small pinned bottom`, d.foot <= limit && d.row && d.btn[1] >= 48 && d.btn[0] >= 150 && !d.side, `${d.foot}px (limit ${limit}, rewards: ${d.state}), subtotal beside Checkout: ${d.row}, Checkout ${d.btn[0]}×${d.btn[1]}, sideways scroll: ${d.side}`);
      if (d.state !== 'off') record(`Compact cart, ${w}px, ${name}: rewards are one line, the bar is the top edge, the steps are a card of their own`, d.words === 1 && d.edge === !d.done && d.ladder > 0 && (!d.done || d.reached === d.ladder), `${d.words} line(s) of words, bar on the edge: ${d.edge} (a step ahead: ${!d.done}), ${d.reached} of ${d.ladder} step(s) ticked`);
      record(`Compact cart, ${w}px, ${name}: no "Ships in", no ₹0 notes`, !/Ships in/.test(d.text) && !/−₹0\)/.test(d.text), `"Ships in": ${/Ships in/.test(d.text)}, "(−₹0)": ${/−₹0\)/.test(d.text)}`);
      record(`Compact cart, ${w}px, ${name}: lines are one height, bin beside the stepper`, d.heights.length <= 1 && d.binRow && d.tallNames === 0, `line heights: ${d.heights.join(', ') || 'none'}px, bin in the stepper's row: ${d.binRow}, lines made taller by a name: ${d.tallNames}`);
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
        const x = dr.querySelector('[data-cart-close]').getBoundingClientRect();
        // The drawer itself never scrolls (only its list does): the × stays where it is, and can be tapped.
        const pinned = dr.scrollTop === 0 && dr.scrollHeight <= dr.clientHeight + 1 && !!document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2)?.closest('[data-cart-close]');
        return { pinned, focus: document.activeElement?.matches('[data-details-at]'), seen: box.top >= body.top - 1 && box.bottom <= body.bottom + 1, rows: [...card.querySelectorAll('dt')].map((dt) => dt.textContent.trim()).join(', '), same: card.querySelector('.cart-details__row--total dd').textContent.trim() === amount.querySelector('.cart-summary__now').textContent.trim(), name: amount.textContent.replace(/\s+/g, ' ').trim(), tap: Math.round(Math.min(amount.getBoundingClientRect().width, amount.getBoundingClientRect().height)) };
      });
      // The card is money only and adds up (2026-10-08): Item total less the minus rows is the Subtotal; the free gift
      // is a row like Shipping (its price struck through beside "Free") and in no other row; "You save" is every
      // minus and struck amount; the amount struck through beside Checkout is the Subtotal before the minus rows.
      const m = await page.evaluate(() => {
        const dr = document.getElementById('CartDrawer');
        const card = dr.querySelector('.cart-details');
        const n = (t) => +(t || '').replace(/[^\d.]/g, '');
        const rows = [...card.querySelectorAll('.cart-details__row')].map((r) => ({ label: r.querySelector('dt').textContent.trim(), text: r.querySelector('dd').textContent.replace(/\s+/g, ' ').trim(), struck: n(r.querySelector('s')?.textContent) }));
        const minus = rows.filter((r) => r.text.startsWith('−')).reduce((a, r) => a + n(r.text), 0);
        const item = rows.find((r) => r.label === 'Item total');
        return { minus, struck: rows.reduce((a, r) => a + r.struck, 0), item: item ? n(item.text) : null, sub: n(card.querySelector('.cart-details__row--total dd').textContent), save: n(card.querySelector('.cart-details__saved')?.textContent), strike: n(dr.querySelector('.cart-summary__amount s')?.textContent), giftLine: !!dr.querySelector('.cart-line.is-gift'), giftRow: !!card.querySelector('[data-gift-row] s'), inside: !!card.querySelector('.ladder'), text: rows.map((r) => `${r.label} ${r.text}`).join(', ') };
      });
      record(`Compact cart, ${w}px, ${name}: Price details is money only and adds up`, !m.inside && (m.item === null ? m.minus === 0 : m.item - m.minus === m.sub) && m.save === m.minus + m.struck && m.strike === (m.minus > 0 ? m.sub + m.minus : 0) && m.giftLine === m.giftRow, `${m.text}; you save ₹${m.save}; struck beside Checkout: ₹${m.strike}; gift line: ${m.giftLine}, gift row: ${m.giftRow}`);
      record(`Compact cart, ${w}px, ${name}: the amount goes to Price details`, r.pinned && r.focus && r.seen && r.same && /Shipping/.test(r.rows) && r.tap >= 44, `the × still in reach: ${r.pinned}, focus on the heading: ${r.focus}, card in view: ${r.seen}, rows: ${r.rows}, same amount: ${r.same}, button reads "${r.name}", ${r.tap}px`);
    };
    await page.request.post(site('/cart/clear.js'));
    const one = await addAndOpen();
    judge('one piece', one);
    // The rewards line: a tap brings Little extras into view, with focus, and stays in the cart.
    if (!one.drawer.done && (await page.$('#CartDrawer [data-cart-extras]:not([hidden])'))) {
      await page.click('#CartDrawer [data-rewards-more]');
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => { const dr = document.getElementById('CartDrawer'); const row = dr.querySelector('[data-cart-extras]').getBoundingClientRect(); const body = dr.querySelector('.cart-drawer__body').getBoundingClientRect(); const a = dr.querySelector('[data-rewards-more]').getBoundingClientRect(); return { open: dr.open, focus: document.activeElement?.matches('[data-cart-extras]'), seen: row.top >= body.top - 1 && row.top < body.bottom, tap: Math.round(parseFloat(getComputedStyle(dr.querySelector('[data-rewards-more]'), '::after').height) || a.height) }; });
      record(`Compact cart, ${w}px, one piece: the rewards line goes to Little extras`, m.open && m.focus && m.seen && m.tap >= 44, `drawer still open: ${m.open}, focus on the row: ${m.focus}, row in view: ${m.seen}, tap area ${m.tap}px tall`);
    }
    await details('one piece');
    // Past the top step (free shipping, then the gift), so every reward is unlocked and the gift line is in the cart.
    if (one.drawer.top > 0) {
      const unit = cheap.variants[0].price * 100;
      // A dearer piece to pass the step (the cap of 9 per piece rules out many cheap ones), then the cheap piece from
      // its page again. The cart is emptied first: a piece that's in the cart has a stepper there, not Add to cart.
      const dear = products.filter((p) => p !== cheap).sort((a, b) => b.variants[0].price - a.variants[0].price)[0];
      await page.request.post(site('/cart/clear.js'));
      await page.request.post(site('/cart/add.js'), { data: { items: [{ id: dear.variants[0].id, quantity: Math.min(9, Math.ceil(Math.max(0, one.drawer.top - unit) / (dear.variants[0].price * 100)) || 1) }] } });
      const all = await addAndOpen();
      judge('all unlocked', all);
      await details('all unlocked');
      // Shopify may split a product over two lines once the gift is in: + on the one line drawn must raise Shopify's
      // total for that product by exactly one.
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
      // A sale price ("compare at") is not a Shopify discount, so the price details count it themselves: the item total is
      // at list prices, "Product discount" takes the sale off, and the rows add up to the subtotal.
      const sale = products.find((p) => +p.variants[0].compare_at_price > +p.variants[0].price);
      if (sale) {
        await page.request.post(site('/cart/add.js'), { data: { items: [{ id: sale.variants[0].id, quantity: 2 }] } });
        await page.goto(site('/cart'), { waitUntil: 'load' });
        await page.waitForTimeout(1500);
        const off = Math.round((sale.variants[0].compare_at_price - sale.variants[0].price) * 2);
        const rows = await page.evaluate(() => [...document.querySelectorAll('#CartDetails-page .cart-details__row')].map((r) => [r.querySelector('dt').textContent.trim(), r.querySelector('dd').textContent.replace(/\s+/g, ' ').trim()]));
        const num = (label) => +(rows.find((r) => r[0] === label)?.[1] || '').replace(/[^\d.]/g, '');
        const taken = rows.filter((r) => r[1].startsWith('−')).reduce((n, r) => n + +r[1].replace(/[^\d.]/g, ''), 0);
        // "You save" is everything taken off, plus what is struck through beside "Free": the shipping fee (when it is set) and the gift.
        const save = await page.evaluate(() => ({ line: document.querySelector('#CartDetails-page .cart-details__saved')?.textContent.trim() || '', fee: [...document.querySelectorAll('#CartDetails-page .cart-details__row s')].reduce((n, s) => n + +s.textContent.replace(/[^\d.]/g, ''), 0) }));
        record('Compact cart: price details count a sale price', num('Product discount') === off && num('Item total') - taken === num('Subtotal') && +save.line.replace(/[^\d.]/g, '') === taken + save.fee, `${rows.map((r) => r.join(' ')).join(', ')}; "${save.line}"`);
      } else console.log('SKIP  Compact cart: price details count a sale price   no product with a compare-at price');
    }
    await page.request.post(site('/cart/clear.js'));
    record(`Compact cart, ${w}px: no script errors`, errors.length === 0, errors[0] || 'none');
    await browser.close();
  }
}

// 8d. One cart (docs/cart-plan.md "One cart", 2026-10-05; replaces 8c): the drawer and the cart page show the same,
//     in the same order: the pieces, the gift note, the price details, then three swipe rows: Saved for later,
//     Little extras ("You may also like" once every reward is earned) and Recently viewed. No piece shows twice or
//     is already in the cart; a row with nothing to show is hidden; an Add in a row puts the piece in the cart and
//     its card stays, with a tick in place of the "+" and every row as it was (2026-10-08); taken out of the cart,
//     it has its "+" back. The drawer has no form inside its form, keeps focus
//     inside and its pinned bottom no taller; the page pins Checkout whenever the card's own is off screen.
//     axe on both. Needs products.
if (want('8d')) {
  const site = (path) => new globalThis.URL(path, URL).href;
  const tagged = (p, tag) => [].concat(p.tags).join(',').includes(tag);
  const everything = await fetch(site('/products.json?limit=250')).then((r) => r.json()).then((d) => d.products.filter((p) => p.variants[0].available), () => []);
  const products = everything.filter((p) => !tagged(p, 'free-gift') && !tagged(p, 'test-product'));
  // A test product this browser saved and viewed before the real catalogue: it must never show in a row (2026-10-05,
  // a ₹599 test "Daisy Crochet Flower Pot" sat in Saved for later beside the real one at ₹229).
  const test = everything.find((p) => tagged(p, 'test-product'))?.handle;
  const singles = products.filter((p) => p.variants.length === 1).sort((x, y) => x.variants[0].price - y.variants[0].price);
  const enough = singles.length >= 6;
  if (!enough) console.log('SKIP  One cart checks                                too few products in the store (import tools/test-products.csv)');
  const base = singles[0];
  const saved = singles.slice(1, 5).map((p) => p.handle);
  const viewed = products.filter((p) => p.handle !== base?.handle && !saved.includes(p.handle)).slice(0, 4).map((p) => p.handle);
  const seed = ([s, v]) => {
    try {
      if (localStorage.getItem('yb-check-rows') === String(s.length)) return;
      localStorage.setItem('yb-check-rows', String(s.length));
      localStorage.setItem('yb-saved', JSON.stringify(s));
      localStorage.setItem('yb-recent-products', JSON.stringify(v));
    } catch {}
  };
  const seeded = `(${seed})(${JSON.stringify([test ? [test, ...saved] : saved, test ? [test, ...viewed] : viewed])})`;
  const ROOT = { drawer: '#CartDrawer', page: '.cart-page' };
  const read = (page, place) => page.evaluate((root) => {
    const cart = document.querySelector(root);
    const name = (li) => (li.querySelector('.card__title, .extra__title')?.textContent || '').trim();
    const rows = [...cart.querySelectorAll('.cart-row')].map((r) => ({ title: r.querySelector('h2').textContent.trim(), hidden: r.hidden, top: Math.round(r.getBoundingClientRect().top), cards: r.hidden ? [] : [...r.querySelectorAll('[data-row-list] > li')].map(name) }));
    const shown = rows.flatMap((r) => r.cards);
    const up = [...cart.querySelectorAll('.cart-row:not([hidden]) [data-row-list] > li')];
    const white = getComputedStyle(cart.querySelector('.cart-line .qty') || cart).backgroundColor;
    const lines = [...cart.querySelectorAll('.cart-line')].map((l) => l.querySelector('.cart-line__title').textContent.trim());
    const y = (sel) => Math.round(cart.querySelector(sel)?.getBoundingClientRect().top ?? -1e6);
    const active = document.activeElement;
    const scroller = cart.matches('dialog') ? cart : document.documentElement;
    return {
      rows, lines,
      handles: up.map((li) => li.dataset.handle || (li.querySelector('a')?.getAttribute('href') || '').match(/\/products\/([^/?#]+)/)?.[1] || ''),
      bare: up.filter((li) => !li.querySelector('.saved-item__btn, .extra__btn')).length,
      // What the buttons are called (the "+" has no visible word), by their first word: one-tap buttons, then links
      // to a piece with options.
      words: ['button', 'a'].map((el) => [...new Set(up.flatMap((li) => [...li.querySelectorAll(`${el}:is(.saved-item__btn, .extra__btn)`)]).map((b) => (b.getAttribute('aria-label') || b.textContent).trim().split(/[\s:]/)[0]))]),
      // The white is drawn 36px inside the 48px tap area (snippets/cart-rows: .row-add::before).
      offWhite: up.flatMap((li) => [...li.querySelectorAll('.saved-item__btn, .extra__btn')]).filter((b) => getComputedStyle(b, '::before').backgroundColor !== white).length,
      // On the photo's corner: inside the photo (2px of the tap area may hang over its edge), clear of the heart.
      offPhoto: up.filter((li) => {
        const b = li.querySelector('.saved-item__btn, .extra__btn')?.getBoundingClientRect();
        const ph = li.querySelector('.card__media, .extra__media')?.getBoundingClientRect();
        return !b || !ph || b.left < ph.left - 1 || b.top < ph.top - 1 || b.right > ph.right + 3 || b.bottom > ph.bottom + 3;
      }).length,
      onHeart: up.filter((li) => {
        const b = li.querySelector('.saved-item__btn, .extra__btn')?.getBoundingClientRect();
        const heart = li.querySelector('.save-btn:not([hidden])')?.getBoundingClientRect();
        return b && heart && heart.width > 0 && b.top < heart.bottom && b.left < heart.right && b.right > heart.left;
      }).length,
      wrapped: [...cart.querySelectorAll('.cart-row:not([hidden]) a:is(.saved-item__btn, .extra__btn)')].filter((b) => b.getClientRects().length > 1 || b.scrollWidth > b.clientWidth + 1).length,
      twice: shown.filter((n, i) => shown.indexOf(n) !== i).length,
      inCart: shown.filter((n) => lines.includes(n)).length,
      order: [y('.cart-line'), y('[data-cart-note]'), y('.cart-details'), ...rows.filter((r) => !r.hidden).map((r) => r.top)],
      low: [...cart.querySelectorAll('.cart-row:not([hidden]) :is(.saved-item__btn, .extra__btn)')].filter((b) => { const r = b.getBoundingClientRect(); return r.height < 48 || r.width < 48; }).length,
      peek: [...cart.querySelectorAll('.cart-row:not([hidden]) [data-row-list]')].every((l) => l.children.length < 3 || l.scrollWidth > l.clientWidth + 8),
      nested: cart.querySelectorAll('form form').length,
      foot: Math.round(cart.querySelector('.cart-drawer__foot')?.getBoundingClientRect().height || 0),
      count: +cart.querySelector('[data-cart-root]').dataset.count,
      top: +cart.querySelector('[data-rewards]')?.dataset.top || 0,
      focusIn: cart.contains(active) && active !== cart,
      focusRow: active.closest('.cart-row')?.querySelector('h2').textContent.trim() || '',
      focus: (active.getAttribute('aria-label') || active.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      sideways: scroller.scrollWidth > scroller.clientWidth + 1,
    };
  }, ROOT[place]);
  const rising = (list) => list.every((n, i) => n > -1e6 && (i === 0 || n > list[i - 1]));
  // The cart with one small piece in it, shown in the drawer (opened from the header) or on the page.
  const show = async (page, place, wait) => {
    await page.goto(site(place === 'page' ? '/cart' : '/'), { waitUntil: 'load' });
    if (place === 'drawer') {
      await page.waitForTimeout(2000);
      await page.click('.site-header__cart');
    }
    await page.waitForSelector(`${ROOT[place]} ${wait}`, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  };
  const fresh = async (page) => {
    await page.request.post(site('/cart/clear.js'));
    await page.request.post(site('/cart/add.js'), { data: { items: [{ id: base.variants[0].id, quantity: 1 }] } });
  };
  const phone = (w, h) => ({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const [w, h] of enough ? [[360, 640], [390, 844]] : []) {
    const same = {};
    for (const place of ['drawer', 'page']) {
      const tag = `One cart, ${place} ${w}px`;
      // Nothing saved, nothing viewed: only the suggestions.
      {
        const { browser, page } = await open(chromium, phone(w, h), { reducedMotion: 'reduce' });
        await fresh(page);
        await show(page, place, '[data-cart-extras]:not([hidden])');
        const up = (await read(page, place)).rows.filter((r) => !r.hidden).map((r) => r.title);
        record(`${tag}: only suggestions when nothing is saved or viewed`, up.length === 1 && up[0] === 'Little extras', `rows showing: ${up.join(', ') || 'none'}`);
        await browser.close();
      }
      const { browser, page, errors } = await open(chromium, phone(w, h), { reducedMotion: 'reduce', init: seeded });
      await fresh(page);
      await show(page, place, '[data-cart-recent]:not([hidden])');
      const first = await read(page, place);
      const titles = first.rows.filter((r) => !r.hidden).map((r) => r.title);
      same[place] = `${titles.join()} | ${first.rows.map((r) => r.cards.join()).join(' | ')}`;
      record(`${tag}: pieces, gift note, price details, then the rows`, rising(first.order) && titles.join() === 'Saved for later,Little extras,Recently viewed', `tops ${first.order.join(' < ')}; rows: ${titles.join(', ')}`);
      record(`${tag}: no piece twice, none from the cart`, first.twice === 0 && first.inCart === 0 && first.rows.every((r) => r.cards.length <= 6) && first.low === 0 && first.nested === 0 && first.peek && !first.sideways, `${first.rows.map((r) => `${r.title} ${r.cards.length}`).join(', ')}; twice: ${first.twice}, in the cart: ${first.inCart}, buttons under 48px: ${first.low}, form in a form: ${first.nested}, rows swipe: ${first.peek}, sideways scroll: ${first.sideways}`);
      record(`${tag}: every card has a button, white like the stepper`, first.bare === 0 && first.offWhite === 0 && first.handles.length > 0, `cards: ${first.handles.length}, without a button: ${first.bare}, buttons not white: ${first.offWhite}`);
      record(`${tag}: one wording on the buttons`, first.words.every((w) => w.length <= 1) && first.words[0][0] === 'Add' && (first.words[1][0] || 'Choose') === 'Choose', `one tap: ${first.words[0].join(' / ') || 'none'}; with options: ${first.words[1].join(' / ') || 'none'}`);
      record(`${tag}: the button sits on the photo's corner`, first.offPhoto === 0 && first.onHeart === 0 && first.wrapped === 0, `off the photo: ${first.offPhoto}, on the heart: ${first.onHeart}, "Choose" cut or wrapped: ${first.wrapped}`);
      record(`${tag}: a saved or viewed test product never shows`, !!test && !first.handles.includes(test), test ? `${test} in the rows: ${first.handles.includes(test)}` : 'the store has no test product to try this with');
      await page.addScriptTag({ content: axe.source });
      const v = await page.evaluate(async (root) => (await window.axe.run(document.querySelector(root), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`), place === 'page' ? 'main' : ROOT.drawer);
      record(`${tag}: accessibility (axe)`, v.length === 0, v.join(', ') || '0 violations');

      if (place === 'page') {
        // Checkout is in reach while the rows are being browsed.
        const bar = () => page.evaluate(() => { const b = document.querySelector('.cart-summary__checkout').getBoundingClientRect(); return { on: b.top < innerHeight && b.bottom > 0, bar: document.querySelector('.cart-bar').classList.contains('is-shown') }; });
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(500);
        const atTop = await bar();
        await page.evaluate(() => document.querySelector('[data-cart-recent]').scrollIntoView({ block: 'end' }));
        await page.waitForTimeout(600);
        const inRows = await bar();
        record(`${tag}: pinned Checkout whenever the card's is off screen`, atTop.on !== atTop.bar && inRows.on !== inRows.bar && (inRows.bar || h > 700), `at the top: button on screen ${atTop.on}, bar ${atTop.bar}; in the rows: button on screen ${inRows.on}, bar ${inRows.bar}`);
      }

      // Add from Saved for later: the keyboard reaches the button, the piece lands in the cart; the rows stay as
      // they are, the card keeps its place with a tick, and focus stays on it.
      const cardsOf = (r) => r.rows.map((x) => x.cards.join()).join(' | ');
      const button = () => page.evaluate(([root, name]) => { const b = [...document.querySelectorAll(`${root} [data-cart-saved] li`)].find((li) => li.querySelector('.card__title').textContent.trim() === name)?.querySelector('[data-row-add]'); return b ? { ticked: 'added' in b.dataset && getComputedStyle(b.querySelector('.row-add__done')).display !== 'none', off: b.getAttribute('aria-disabled') === 'true', label: b.getAttribute('aria-label') || '', focus: b === document.activeElement } : {}; }, [ROOT[place], added]);
      const added = await page.evaluate((root) => document.querySelector(`${root} [data-cart-saved] [data-row-add]`).closest('li').querySelector('.card__title').textContent.trim(), ROOT[place]);
      await page.focus(`${ROOT[place]} [data-cart-saved] [data-row-add]`);
      await page.keyboard.press('Enter');
      await page.waitForFunction(([root, n]) => +document.querySelector(`${root} [data-cart-root]`).dataset.count === n, [ROOT[place], first.count + 1], { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2500);
      const after = await read(page, place);
      const said = await page.textContent(place === 'drawer' ? '#CartDrawer [data-cart-live]' : '[data-cart-status]').catch(() => '');
      const on = await button();
      record(`${tag}: Add in Saved puts it in the cart, the card stays with a tick`, after.count === first.count + 1 && after.lines.includes(added) && cardsOf(after) === cardsOf(first) && on.ticked && on.off && /in your cart/.test(on.label) && on.focus && (said || '').includes(added) && after.foot <= first.foot + 1, `"${added}" in the cart: ${after.lines.includes(added)}, rows as they were: ${cardsOf(after) === cardsOf(first)}, ticked: ${on.ticked}, a button no more: ${on.off}, reads "${on.label}", focus stays: ${on.focus}, said: ${(said || '').includes(added)}, pinned bottom ${first.foot} → ${after.foot}px`);
      // A second tap adds nothing.
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      const twice = (await read(page, place)).count;
      record(`${tag}: the tick adds nothing more`, twice === first.count + 1, `count ${after.count} → ${twice}`);

      // Taken out again, the rows are still as they were and the card has its "+" back.
      await page.evaluate(([root, name]) => [...document.querySelectorAll(`${root} .cart-line`)].find((l) => l.querySelector('.cart-line__title').textContent.trim() === name).querySelector('.cart-line__remove').click(), [ROOT[place], added]);
      await page.waitForFunction(([root, n]) => +document.querySelector(`${root} [data-cart-root]`).dataset.count === n, [ROOT[place], first.count], { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2500);
      const back = await read(page, place);
      const off = await button();
      record(`${tag}: a piece taken out of the cart has its "+" back`, back.count === first.count && cardsOf(back) === cardsOf(first) && off.ticked === false && !off.off && !/in your cart/.test(off.label), `count ${back.count}, rows as they were: ${cardsOf(back) === cardsOf(first)}, ticked: ${off.ticked}, reads "${off.label || 'its own words'}"`);

      // Every reward earned: the same row is "You may also like".
      const dear = [...products].sort((x, y) => y.variants[0].price - x.variants[0].price)[0];
      await page.request.post(site('/cart/add.js'), { data: { items: [{ id: dear.variants[0].id, quantity: Math.ceil((first.top / 100) / +dear.variants[0].price) + 1 }] } });
      await show(page, place, '[data-cart-extras]:not([hidden])');
      const done = await read(page, place);
      const also = done.rows.filter((r) => !r.hidden).map((r) => r.title);
      record(`${tag}: "You may also like" once every reward is earned`, also.includes('You may also like') && !also.includes('Little extras') && done.twice === 0 && done.inCart === 0, `rows: ${also.join(', ')}`);
      await page.request.post(site('/cart/clear.js'));
      record(`${tag}: no script errors`, errors.length === 0, errors[0] || 'none');
      await browser.close();
    }
    record(`One cart, ${w}px: the drawer and the page show the same rows`, same.drawer === same.page, same.drawer === same.page ? same.page.slice(0, 90) : `drawer: ${same.drawer} · page: ${same.page}`);
  }
  if (enough) {
    const { browser, page } = await open(chromium, { viewport: { width: 1280, height: 800 } }, { reducedMotion: 'reduce', init: seeded });
    await fresh(page);
    await show(page, 'page', '[data-cart-recent]:not([hidden])');
    const d = await read(page, 'page');
    const wide = await page.evaluate(() => {
      const side = document.querySelector('.cart-page__side').getBoundingClientRect();
      const lists = [...document.querySelectorAll('.cart-row:not([hidden]) [data-row-list]')];
      return { beside: side.left > document.querySelector('.cart-page__lines').getBoundingClientRect().right, under: lists.every((l) => l.getBoundingClientRect().top > side.bottom), oneLine: lists.every((l) => new Set([...l.children].map((c) => Math.round(c.getBoundingClientRect().top))).size === 1), scrolls: lists.some((l) => getComputedStyle(l).overflowX !== 'visible'), bar: getComputedStyle(document.querySelector('.cart-bar')).display };
    });
    record('One cart, page desktop: card beside the pieces, rows full width below', wide.beside && wide.under && wide.oneLine && !wide.scrolls && wide.bar === 'none' && d.twice === 0 && d.inCart === 0 && !d.sideways, `card beside: ${wide.beside}, rows under it: ${wide.under}, each on one line: ${wide.oneLine}, a row scrolls: ${wide.scrolls}, bar: ${wide.bar}`);
    await show(page, 'drawer', '[data-cart-recent]:not([hidden])');
    const dd = await read(page, 'drawer');
    const narrow = await page.evaluate(() => [...document.querySelectorAll('#CartDrawer .cart-row:not([hidden]) [data-row-list]')].every((l) => getComputedStyle(l).overflowX === 'auto' && new Set([...l.children].map((c) => Math.round(c.getBoundingClientRect().top))).size === 1 && l.getBoundingClientRect().right <= innerWidth));
    record('One cart, drawer desktop: swipe rows inside the 440px drawer', narrow && rising(dd.order) && dd.twice === 0 && dd.inCart === 0 && !dd.sideways, `rows swipe on one line: ${narrow}, tops ${dd.order.join(' < ')}, sideways scroll: ${dd.sideways}`);
    await page.request.post(site('/cart/clear.js'));
    await browser.close();
  }
  // The narrowest phone: the photo is about 110px wide, and "Choose" and the heart still fit on it.
  if (enough) {
    const { browser, page } = await open(chromium, phone(320, 640), { reducedMotion: 'reduce', init: seeded });
    await fresh(page);
    await show(page, 'drawer', '[data-cart-recent]:not([hidden])');
    const s = await read(page, 'drawer');
    record('One cart, drawer 320px: the button fits on the photo', s.bare === 0 && s.offPhoto === 0 && s.onHeart === 0 && s.wrapped === 0 && s.low === 0 && !s.sideways, `cards: ${s.handles.length}, off the photo: ${s.offPhoto}, on the heart: ${s.onHeart}, "Choose" cut or wrapped: ${s.wrapped}, under 48px: ${s.low}`);
    await page.request.post(site('/cart/clear.js'));
    await browser.close();
  }
}

// 8e. The cart holds still (docs/decisions.md, 2026-10-08): adding a piece from the swipe rows or removing a line
//     redraws the cart, and nothing on screen may move: the list never runs back to the top, the tapped card stays
//     under the finger and the Undo row sits where its line was. With motion on: that is where the glide showed.
if (want('8e')) {
  const site = (path) => new globalThis.URL(path, URL).href;
  const products = await fetch(site('/products.json?limit=50')).then((r) => r.json()).then((d) => d.products.filter((p) => !/free-gift|test-product/.test(`${p.handle},${[].concat(p.tags).join(',')}`) && p.variants.length === 1 && p.variants[0].available), () => []);
  if (products.length < 5) console.log('SKIP  Cart holds still                               needs five products that can be bought');
  for (const [label, device] of products.length < 5 ? [] : [['phone', devices['Pixel 7']], ['desktop', devices['Desktop Chrome']]]) {
    const { browser, page, errors } = await open(chromium, device);
    await page.request.post(site('/cart/clear.js'));
    await page.request.post(site('/cart/add.js'), { data: { items: products.slice(0, 5).map((p) => ({ id: p.variants[0].id, quantity: 1 })) } });
    await page.reload({ waitUntil: 'load' });
    await page.click('.site-header__cart');
    await page.waitForSelector('#CartDrawer [data-row-add]', { state: 'visible', timeout: 10000 }).catch(() => {});
    // The rows fill one after another, and the free gift arrives on its own: start from a cart at rest.
    await page.waitForTimeout(2500);
    // Every frame until stop(): how far the list has run, and where the watched piece is while it is on the page.
    const watch = (pick) => page.evaluate((pick) => {
      const body = () => document.querySelector('#CartDrawer [data-scroll]');
      const el = new Function(`return ${pick}`)()();
      if (!el) return false;
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const key = el.dataset.key;
      const seen = { from: body().scrollTop, low: Infinity, at: el.getBoundingClientRect().top, drift: 0, on: true };
      const tick = () => {
        const now = el.isConnected ? el : key && document.querySelector(`#CartDrawer .cart-undo[data-key="${CSS.escape(key)}"]`);
        seen.low = Math.min(seen.low, body().scrollTop);
        // The Undo row is measured from where it first sits (it has its own margin inside the line's place).
        if (now && now !== el && !seen.undo) seen.undo = seen.at = now.getBoundingClientRect().top;
        if (now) seen.drift = Math.max(seen.drift, Math.abs(now.getBoundingClientRect().top - seen.at));
        if (seen.on) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      window.__still = seen;
      return true;
    }, pick);
    const rest = async () => { await page.waitForTimeout(1200); await page.waitForFunction(() => !document.querySelector('#CartDrawer [data-cart-root].is-busy'), null, { timeout: 10000 }).catch(() => {}); await page.waitForTimeout(1800); return page.evaluate(() => { window.__still.on = false; return window.__still; }); };
    const verdict = (s) => [s.low >= s.from - 1 && s.drift <= 1, `the list ran from ${Math.round(s.from)}px to as low as ${Math.round(s.low)}px, the piece moved ${Math.round(s.drift)}px`];

    const had = await page.evaluate(() => +document.querySelector('#CartDrawer [data-cart-root]').dataset.count);
    if (await watch(`() => document.querySelector('#CartDrawer [data-row-add]')?.closest('li')`)) {
      await page.evaluate(() => document.querySelector('#CartDrawer [data-row-add]').click());
      const s = await rest();
      const has = await page.evaluate(() => +document.querySelector('#CartDrawer [data-cart-root]').dataset.count);
      const [ok, detail] = verdict(s);
      record(`Cart holds still, ${label}: "+" in a swipe row`, ok && has > had && s.from > 0, `${detail}; items ${had} → ${has}`);
    } else record(`Cart holds still, ${label}: "+" in a swipe row`, false, 'no card with a "+" in the drawer');

    await watch(`() => document.querySelectorAll('#CartDrawer .cart-line:not(.is-gift)')[3]`);
    await page.evaluate(() => document.querySelectorAll('#CartDrawer .cart-line:not(.is-gift)')[3].querySelector('.cart-line__remove').click());
    const gone = await rest();
    const undo = await page.evaluate(() => !!document.querySelector('#CartDrawer .cart-undo'));
    const [ok, detail] = verdict(gone);
    record(`Cart holds still, ${label}: removing a line`, ok && undo && gone.from > 0, `${detail}; Undo row there: ${undo}`);
    record(`Cart holds still, ${label}: no script errors`, errors.length === 0, errors.join('; ') || 'none');
    await page.request.post(site('/cart/clear.js'));
    await browser.close();
  }
}

// 9. Account & saved (docs/account-plan.md): a heart saves and survives a reload; the drawer's account row opens
//    Shopify's sheet (phones) and Esc returns to the menu button; the Saved page draws the list, Remove + Undo work;
//    a shared link is read-only with "Save all"; axe on the Saved (full and empty) and Track pages. Until Raushan
//    creates the Saved and Track pages, they're previewed on /pages/contact with ?view=. Needs products.
if (want('9')) {
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

      // Every vibration the page asks for from here on: the heart and Undo each get the short pulse (theme.js).
      await page.evaluate(() => { window.__buzz = []; Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: (p) => { window.__buzz.push(String(p)); return true; } }); });
      await page.locator('[data-saved-grid] [data-save]').first().click();
      await page.waitForTimeout(400);
      const after = await page.locator('[data-saved-grid] .saved-item').count();
      await page.click('.saved-toast [data-toast-action]');
      await page.waitForTimeout(300);
      const pulses = await page.evaluate(() => window.__buzz.join(' | '));
      record(`Saved page, ${label}: a pulse for the heart and for Undo`, pulses === '10 | 10', `asked for: ${pulses || 'none'}`);
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

// 10. Home first screen (docs/home-hero-v2-plan.md): the hero is one photo the full width of the screen with the
//     heading, one line and one solid button (≥48px) over its dissolving edge. On a small Android phone (360 × 780)
//     the button and the craft circles are on the first screen; the photo's tap link is hidden from keyboards and
//     screen readers (the button is the one way in) and the price label is a link with a name; the trust line is
//     plain text, not a tab stop; no sideways scroll from 320 to 430 wide; Bestsellers ends in one solid button,
//     centred, phone and desktop. On desktop the hero is a band no taller than 560px with Bestsellers below it.
if (want('10')) {
  const phone = { viewport: { width: 360, height: 780 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  for (const [label, engine] of QUICK ? [['Chrome', chromium]] : [['Chrome', chromium], ['Safari', webkit]]) {
    const { browser, page, errors } = await open(engine, phone, { reducedMotion: 'reduce' });
    const r = await page.evaluate(() => {
      const cta = document.querySelector('.hero__cta');
      const bar = document.querySelector('.announce');
      const photo = document.querySelector('.hero__photo');
      const box = photo?.getBoundingClientRect();
      return {
        crafts: Math.round(document.querySelector('.shop__crafts')?.getBoundingClientRect().top ?? 9999),
        photo: box ? { left: Math.round(box.left), w: Math.round(box.width), vw: innerWidth, hidden: photo.tabIndex === -1 && photo.getAttribute('aria-hidden') === 'true' } : null,
        shelf: (() => { const a = document.querySelector('[data-shop-crafts] .shop__panel:not([hidden]) .shop__all'); if (!a) return null; const r = a.getBoundingClientRect(); return { centred: Math.abs(r.left + r.width / 2 - innerWidth / 2) <= 2, solid: getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)' && !getComputedStyle(a).backgroundColor.includes('/ 0.'), h: Math.round(r.height) }; })(),
        ways: document.querySelectorAll('.hero__copy a').length,
        ctaSolid: !!cta && getComputedStyle(cta).backgroundColor !== 'rgba(0, 0, 0, 0)',
        ctaH: Math.round(cta?.getBoundingClientRect().height ?? 0),
        ctaBottom: Math.round(cta?.getBoundingClientRect().bottom ?? 9999),
        unnamed: [...document.querySelectorAll('.hero a:not([aria-hidden="true"])')].filter((a) => !a.textContent.trim()).length,
        bar: bar ? { arrows: bar.querySelectorAll('.announce__btn').length, tab: bar.querySelector('[data-announce-track]').tabIndex } : null,
      };
    });
    record(`Home, ${label} 360 × 780: craft circles on the first screen`, r.crafts < 780, `circles start at ${r.crafts}px`);
    record(`Home, ${label}: hero photo runs edge to edge`, !!r.photo && r.photo.left === 0 && r.photo.w === r.photo.vw && r.photo.hidden, r.photo ? `left ${r.photo.left}px, ${r.photo.w} of ${r.photo.vw}px, tap link hidden from keyboards: ${r.photo.hidden}` : 'no photo');
    record(`Home, ${label}: Bestsellers ends in one solid, centred button`, !!r.shelf && r.shelf.centred && r.shelf.solid && r.shelf.h >= 48, r.shelf ? `centred: ${r.shelf.centred}, solid: ${r.shelf.solid}, ${r.shelf.h}px` : 'missing');
    record(`Home, ${label}: one way in, a solid button ≥48px on the first screen`, r.ways === 1 && r.ctaSolid && r.ctaH >= 48 && r.ctaBottom <= 780, `${r.ways} link(s), solid: ${r.ctaSolid}, ${r.ctaH}px, ends at ${r.ctaBottom}px`);
    record(`Home, ${label}: every hero link has a name`, r.unnamed === 0, `${r.unnamed} unnamed`);
    if (r.bar) record(`Home, ${label}: trust line is plain text`, r.bar.arrows === 0 && r.bar.tab === -1, `${r.bar.arrows} arrows, tabIndex ${r.bar.tab}`);
    // Swipe rows (docs/decisions.md, 2026-10-05): the only sign to swipe is the next item cut off by the screen edge,
    // so on every phone width each row that overflows shows about a fifth to three quarters of that item.
    const wide = [];
    const cuts = [];
    const shown = [];
    for (const width of [320, 360, 390, 412, 430]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) wide.push(width);
      const rows = await page.evaluate(() => [...document.querySelectorAll('#MainContent .scroller')].filter((row) => row.offsetParent && row.scrollWidth > row.clientWidth + 2).map((row) => {
        row.scrollLeft = 0;
        const cut = [...row.children].map((el) => el.getBoundingClientRect()).find((r) => r.left < innerWidth && r.right > innerWidth);
        return { name: row.className.split(' ')[0], pct: cut ? Math.round(((innerWidth - cut.left) / cut.width) * 100) : 0 };
      }));
      rows.forEach((row) => { shown.push(row.pct); if (row.pct < 18 || row.pct > 78) cuts.push(`${row.name} ${row.pct}% at ${width}`); });
    }
    record(`Home, ${label}: no sideways scroll, 320–430`, wide.length === 0, wide.length ? `scrolls at ${wide.join(', ')}` : 'ok');
    record(`Home, ${label}: every swipe row shows part of the next item, 320–430`, shown.length > 0 && cuts.length === 0, cuts.length ? cuts.join('; ') : `${Math.min(...shown)}–${Math.max(...shown)}% of the next item across ${shown.length} row readings`);
    record(`Home, ${label}: no script errors`, errors.length === 0, errors[0] || 'none');
    await browser.close();
  }
  const { browser, page } = await open(chromium, devices['Desktop Chrome']);
  const d = await page.evaluate(() => {
    const cta = document.querySelector('.hero__cta');
    const all = document.querySelector('[data-shop-crafts] .shop__panel:not([hidden]) .shop__all')?.getBoundingClientRect();
    return { pill: !!cta && getComputedStyle(cta).backgroundColor !== 'rgba(0, 0, 0, 0)', h: Math.round(cta?.getBoundingClientRect().height ?? 0), ways: document.querySelectorAll('.hero__copy a').length, shelfCentred: !!all && Math.abs(all.left + all.width / 2 - innerWidth / 2) <= 2,
      band: Math.round(document.querySelector('.hero__stage')?.getBoundingClientRect().height ?? 9999), shopTop: Math.round(document.querySelector('[data-shop-crafts] .section-head')?.getBoundingClientRect().top ?? 9999), vh: innerHeight };
  });
  record('Home, desktop: one way in, a pill button', d.pill && d.ways === 1 && d.h >= 48, `${d.ways} link(s), pill: ${d.pill}, ${d.h}px`);
  record('Home, desktop: hero band ≤560px, Bestsellers on the first screen, its button centred', d.band <= 560 && d.shopTop < d.vh && d.shelfCentred, `band ${d.band}px, Bestsellers at ${d.shopTop}px of ${d.vh}, button centred: ${d.shelfCentred}`);
  await browser.close();
}

// 11. Offers (docs/offers-plan.md): the announcement bar is one line on a 360px phone and absent on /cart; the product
//     page's delivery terms are two rows at most. With offers switched on in Theme settings → Cart, the cart's rewards
//     line is there and passes axe, and the admin agrees with the theme: Shopify's real shipping rates (Delhi) have a
//     ₹0 rate from the free-shipping amount and none below it, the flat fee matches, and the gift arrives free.
//     Needs products; the admin checks are skipped while the offers are off.
if (want('11')) {
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
  // Test products are outside the Shop collection, so they don't count towards the gift's "Buy X get Y" discount.
  const cheap = products.filter((p) => p.variants[0].available && !/ Test$/.test(p.vendor)).sort((a, b) => a.variants[0].price - b.variants[0].price);
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
        record('Offers: the free gift arrives free', g.free && /^(done|save)/.test(g.state), `gift line free: ${g.free}, state: ${g.state}${g.free ? '' : ' (is the "Buy X get Y" discount set up?)'}`);
      }
    }
    await page.request.post(site('/cart/clear.js'));
  }
  record('Offers: no script errors', errors.length === 0, errors[0] || 'none');
  await browser.close();
}

// 12. Home media (docs/home-media-plan.md): the "Made by hand" video
//     downloads nothing until the section is near, plays muted while it's in view, pauses on the button and when
//     scrolled away, and never starts by itself with reduced motion or data saver (nothing is even fetched).
//     Then the hero itself (docs/home-hero-v2-plan.md), in a campaign and on a normal day, on its two test pages.
if (want('12')) {
  const phone = { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const media = async (device, opts = {}) => {
    const { browser, page, errors } = await open(chromium, device, { reducedMotion: opts.reduce ? 'reduce' : 'no-preference', init: opts.init });
    const mp4 = [];
    page.on('request', (r) => { if (/\.mp4|\.m3u8/.test(r.url())) mp4.push(r.url()); });
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
    return { early, has, v, fetched: mp4.length, errors };
  };
  const p = await media(phone, { toggle: true, axe: true });
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

  // The hero (docs/home-hero-v2-plan.md) on its test pages: /?view=campaign-test (a live dummy campaign, shown with
  // Demo content on) and /?view=hero-test (a normal day). On the shortest phone the button is on the first screen;
  // the photo runs edge to edge and is the LCP image; in a campaign the page's own heading stays, unseen, and the
  // campaign's words show; the words keep 4.5:1 against the darkest spot of the photo behind them (measured from the
  // pixels, with the words hidden: axe can't judge text over a photo); on desktop the band is ≤560px with Bestsellers
  // on the first screen. And a campaign past its "Show until" day gives the normal hero back.
  const lumOf = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const hero = async (path, device) => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ ...device, reducedMotion: 'reduce' });
    await ctx.addInitScript(skipIntro);
    await ctx.addInitScript(() => { window.__lcp = ''; new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__lcp = e.element?.className || ''; })).observe({ type: 'largest-contentful-paint', buffered: true }); });
    const page = await ctx.newPage();
    const errors = themeErrors(page);
    await page.goto(new globalThis.URL(path, URL).href, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => {
      const box = document.querySelector('.hero__photo')?.getBoundingClientRect();
      const ink = getComputedStyle(document.querySelector('.hero__title') || document.body).color.match(/[\d.]+/g).slice(0, 3).map(Number);
      return box && {
        w: Math.round(box.width), h: Math.round(box.height), left: Math.round(box.left), vw: innerWidth,
        band: Math.round(document.querySelector('.hero__stage').getBoundingClientRect().height),
        ctaBottom: Math.round(document.querySelector('.hero__cta')?.getBoundingClientRect().bottom ?? 9999),
        shopTop: Math.round(document.querySelector('[data-shop-crafts] .section-head')?.getBoundingClientRect().top ?? 9999),
        h1: document.querySelectorAll('h1').length, h1Hidden: !!document.querySelector('h1.visually-hidden'),
        words: document.querySelector('.hero__title')?.textContent.replace(/\s+/g, ' ').trim(),
        lcp: window.__lcp, ink,
        // The centred label (a normal day with a centred photo): the lead, the yarn lettering and the button share
        // the screen's centre line, a square photo is shown whole, and the description waits for desktop.
        label: (() => {
          if (!document.querySelector('.hero--centred')) return null;
          const mid = (q) => { const e = document.querySelector(q); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return Math.round(b.left + b.width / 2 - innerWidth / 2); };
          const img = document.querySelector('.hero__img');
          const text = document.querySelector('.hero__text');
          return { off: [mid('.hero__lead'), mid('.hero .yarn'), mid('.hero__cta')], whole: !!img.naturalWidth && Math.abs(img.naturalWidth / img.naturalHeight - box.width / box.height) < 0.02, text: !!text && !!text.textContent.trim(), textShown: !!text && text.getClientRects().length > 0, yarnTop: Math.round(document.querySelector('.hero .yarn')?.getBoundingClientRect().top ?? 0), photoBottom: Math.round(box.bottom) };
        })(),
      };
    });
    let v = [];
    let contrast = null;
    if (r) {
      await page.addScriptTag({ content: axe.source });
      v = await page.evaluate(async () => (await window.axe.run(document.querySelector('.hero'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      const boxes = [];
      for (const q of ['.hero__title', '.hero__text']) { const b = await page.locator(q).first().boundingBox().catch(() => null); if (b) boxes.push(b); }
      await page.addStyleTag({ content: '.hero__copy, .hero__copy * { opacity: 0 !important; }' });
      await page.waitForTimeout(200);
      let darkest = 1;
      for (const clip of boxes) {
        const png = (await page.screenshot({ clip })).toString('base64');
        const px = await page.evaluate(async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let m = [255, 255, 255], sum = 766; for (let p = 0; p < d.length; p += 4) { const s = d[p] * 0.21 + d[p + 1] * 0.72 + d[p + 2] * 0.07; if (s < sum) { sum = s; m = [d[p], d[p + 1], d[p + 2]]; } } return m; }, png);
        darkest = Math.min(darkest, lumOf(...px));
      }
      contrast = +((darkest + 0.05) / (lumOf(...r.ink) + 0.05)).toFixed(1);
    }
    await browser.close();
    return { r, v, errors, contrast };
  };
  const se = { viewport: { width: 375, height: 548 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const small = { viewport: { width: 360, height: 660 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  for (const [name, path] of [['Campaign', '/?view=campaign-test'], ['Normal day', '/?view=hero-ended-test']]) {
    const campaign = name === 'Campaign';
    const bp = await hero(path, se);
    if (!bp.r) { console.log(`SKIP  Hero checks, ${name.padEnd(38)} no hero on ${path}`); continue; }
    record(`Hero, ${name}, iPhone SE: edge to edge, button on the first screen`, bp.r.left === 0 && bp.r.w === bp.r.vw && bp.r.ctaBottom <= 548, `photo ${bp.r.w} × ${bp.r.h} of ${bp.r.vw}px wide, button ends at ${bp.r.ctaBottom}px (screen 548)`);
    record(`Hero, ${name}, phone: one h1, the right words`, bp.r.h1 === 1 && bp.r.h1Hidden === campaign && !!bp.r.words, `${bp.r.h1} h1, hidden: ${bp.r.h1Hidden}, shown: "${bp.r.words}"`);
    record(`Hero, ${name}, phone: photo is the LCP image (axe)`, /hero__img/.test(bp.r.lcp) && bp.v.length === 0 && bp.errors.length === 0, `LCP on "${bp.r.lcp}", ${bp.v.join(', ') || '0 violations'}${bp.errors.length ? `, errors: ${bp.errors[0]}` : ''}`);
    const bs = await hero(path, small);
    if (bs.r.label) {
      const l = bs.r.label;
      record(`Hero, ${name}, 360 × 660: centred label, square photo whole, no description`, l.off.every((o) => o !== null && Math.abs(o) <= 2) && l.whole && l.text && !l.textShown, `lead, yarn, button off centre by ${l.off.join(', ')}px; photo whole: ${l.whole}; description in the page: ${l.text}, shown: ${l.textShown}`);
    }
    record(`Hero, ${name}, 360 × 660: words ≥4.5:1 on the photo, Bestsellers heading on the first screen`, bs.contrast >= 4.5 && bp.contrast >= 4.5 && bs.r.shopTop < 660, `darkest spot behind the words ${bs.contrast}:1 (iPhone SE ${bp.contrast}:1), Bestsellers at ${bs.r.shopTop}px`);
    const bd = await hero(path, { viewport: { width: 1280, height: 800 } });
    record(`Hero, ${name}, desktop 1280: band ≤560px, Bestsellers on the first screen`, bd.r.band <= 560 && bd.r.shopTop < 800 && bd.contrast >= 4.5 && bd.v.length === 0, `band ${bd.r.band}px, Bestsellers at ${bd.r.shopTop}px, words ${bd.contrast}:1, ${bd.v.join(', ') || '0 violations'}`);
  }
  // The day a campaign ends (/?view=hero-ended-test, "Show until" long past): the normal hero is back by itself.
  const ended = await open(chromium, small, { reducedMotion: 'reduce', path: '/?view=hero-ended-test' });
  const e = await ended.page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim(), shown: !document.querySelector('h1.visually-hidden'), campaign: !!document.querySelector('.hero__title--plain'), cta: document.querySelector('.hero__cta')?.textContent.trim() }));
  record('Hero, campaign ended: the normal heading and button are back', e.shown && /stitched with love$/.test(e.h1 || '') && !e.campaign && !!e.cta && !/Diwali/.test(e.cta) && ended.errors.length === 0, `h1 "${e.h1}" shown: ${e.shown}, campaign words: ${e.campaign}, button "${e.cta}"`);
  await ended.browser.close();
}

// 13. Account page (docs/account-hub-plan.md): axe on the signed-out page and on the signed-in demo (made-up orders;
//     signing in for real needs an email code, so it's checked by hand), phone and desktop; the signed-in menu opens
//     with Enter, Tab goes into it, Esc closes it and returns focus; Sign out is in the menu and on the page; after
//     signing out the next page says so, once. Until Raushan creates the "account" page, it's /pages/contact?view=.
//     Phones (docs/account-phone-plan.md): the greeting row goes to Your details, which is its own page there (axe,
//     one h1, the details, Edit, Sign out, a way back); desktop keeps the card and the greeting is plain. Recently
//     viewed on the account page can be cleared. Help isn't repeated on the page (docs/decisions.md, 2026-10-08):
//     no help panel, the phones' Help shortcut and the signed-out link both go to the Contact page.
if (want('13')) {
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
    const guest = await page.evaluate(() => {
      const a = document.querySelector('.account__signin a[href="/pages/contact"]');
      return { tall: Math.round(a?.getBoundingClientRect().height || 0), panel: !!document.querySelector('.account #help'), side: !!document.querySelector('.account__side'), wide: document.documentElement.scrollWidth > innerWidth };
    });
    record(`Account page, ${label}: signed out, one link to the Contact page, no help panel`, guest.tall >= 44 && !guest.panel && !guest.side && !guest.wide, `link ${guest.tall}px tall, help panel: ${guest.panel}, empty side column: ${guest.side}, scrolls sideways: ${guest.wide}`);
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
      const help = await page.evaluate(() => {
        const tile = [...document.querySelectorAll('.account__jump a')].find((a) => a.querySelector('.icon--help, [class*="help"]') || /help/i.test(a.textContent));
        return { panel: !!document.querySelector('.account #help'), dead: document.querySelectorAll('.account a[href="#help"]').length, shown: !!tile?.offsetParent, to: tile?.getAttribute('href') || '', cards: document.querySelectorAll('.order-card a[href*="wa.me"], .order-card a[href*="/pages/contact"]').length };
      });
      record(`Account page, ${label}: no help panel; Help ${label === 'phone' ? 'shortcut goes to the Contact page' : 'is the header\'s'}; order cards keep theirs`, !help.panel && help.dead === 0 && help.to === '/pages/contact' && help.shown === (label === 'phone') && help.cards >= 3, `help panel: ${help.panel}, links to #help: ${help.dead}, Help shortcut shown: ${help.shown}, to ${help.to}, order cards with "Need help?": ${help.cards}`);

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
if (want('14')) {
  const home = await fetch(URL).then((r) => r.text()).catch(() => '');
  const heroPath = '/?view=hero-test';
  const hasHero = /class="[^"]*hero[\s\S]*?class="yarn"/.test(await fetch(new globalThis.URL(heroPath, URL)).then((r) => r.text()).catch(() => ''));
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
    const { browser, page } = await open(chromium, phone, { reducedMotion: 'no-preference', path: heroPath });
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
if (want('15')) {
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
        // Where "Shop all" goes (Theme settings → Shop all): demo tiles all go there.
        all: document.querySelector('.shop__all')?.getAttribute('href'),
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
    const own = p.links.every((h) => h && h !== '/collections' && (h === '/collections/all' || h === p.all || p.links.filter((x) => x === h).length === 1));
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

// 16. Audit 2026-10-03 (docs/audit-2026-10-03.md): the free gift is never offered as something to shop; with the
//     browser's text size at 130% (desktop) and 200% (phone) nothing is pushed past the screen and the cart button
//     can still be reached; hero photo labels show whole names on a 360px phone; and when the network drops, the
//     cart says so in its own words and goes back to the quantity Shopify has.
if (want('16')) {
  const base = URL.replace(/\/$/, '').replace(/\/\?.*$/, '');
  const big = async (device, size, path = '/') => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ ...device, reducedMotion: 'reduce' });
    await ctx.addInitScript(skipIntro);
    const page = await ctx.newPage();
    await (await ctx.newCDPSession(page)).send('Page.setFontSizes', { fontSizes: { standard: size } });
    await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    return { browser, ctx, page };
  };
  const edges = (page) => page.evaluate(() => {
    const cart = document.querySelector('.site-header__cart').getBoundingClientRect();
    return { sideways: document.documentElement.scrollWidth - innerWidth, cartIn: cart.left >= -1 && cart.right <= innerWidth + 1 };
  });

  // The gift
  let { browser, ctx, page } = await big(devices['Pixel 7'], 16, '/search');
  const gift = await page.evaluate(async () => {
    const chips = [...document.querySelectorAll('.search-page .search-chip')].map((c) => c.textContent.trim());
    const home = new DOMParser().parseFromString(await (await fetch('/')).text(), 'text/html');
    const shopAll = home.querySelector('.shop__all')?.getAttribute('href');
    const gifts = (await (await fetch('/products.json?limit=250')).json()).products.filter((p) => p.tags.includes('free-gift'));
    const listing = shopAll ? await (await fetch(shopAll)).text() : '';
    return { chips, shopAll, types: gifts.map((p) => p.product_type), listed: gifts.filter((p) => listing.includes(`/products/${p.handle}`)).map((p) => p.handle) };
  });
  if (!gift.types.length) console.log('SKIP  Audit: the free gift                              no product tagged free-gift');
  else {
    record('Audit: no "Free gift" chip in Popular searches', !gift.chips.some((c) => gift.types.includes(c)), gift.chips.join(', ') || 'no chips');
    record('Audit: "Shop all" doesn\'t list the free gift', !!gift.shopAll && gift.listed.length === 0, `${gift.shopAll}: ${gift.listed.join(', ') || 'gift not listed'}`);
  }
  await browser.close();

  // Large text
  ({ browser, ctx, page } = await big({ viewport: { width: 1280, height: 800 } }, 21));
  let e = await edges(page);
  record('Audit, desktop at 130% text: header fits', e.sideways <= 1 && e.cartIn, `sideways ${e.sideways}px, cart button on screen: ${e.cartIn}`);
  await browser.close();
  ({ browser, ctx, page } = await big(devices['iPhone 13'], 32));
  e = await edges(page);
  let opened = false;
  try { await page.locator('.site-header__cart').click({ timeout: 4000 }); await page.waitForTimeout(700); opened = await page.evaluate(() => document.getElementById('CartDrawer').open); } catch {}
  record('Audit, phone at 200% text: the cart button works', e.sideways <= 1 && e.cartIn && opened, `sideways ${e.sideways}px, on screen: ${e.cartIn}, drawer opened: ${opened}`);
  await browser.close();

  // Hero labels on a 360px phone
  ({ browser, ctx, page } = await big({ ...devices['Pixel 7'], viewport: { width: 360, height: 780 } }, 16));
  const cut = await page.evaluate(() => [...document.querySelectorAll('.hero__tag-name')].filter((n) => n.scrollHeight > n.clientHeight + 4).map((n) => n.textContent.trim()));
  record('Audit, phone 360: hero labels show whole names', cut.length === 0, cut.join(', ') || 'none cut');
  await browser.close();

  // The network drops
  ({ browser, ctx, page } = await big(devices['Pixel 7'], 16));
  const prods = (await (await ctx.request.get(base + '/products.json?limit=50')).json()).products.filter((p) => p.variants[0].available && !p.tags.includes('free-gift'));
  if (!prods.length) console.log('SKIP  Audit: cart offline                               no product to add');
  else {
    await ctx.request.post(base + '/cart/add.js', { data: { items: [{ id: prods[0].variants[0].id, quantity: 1 }] } });
    await page.goto(base + '/cart', { waitUntil: 'load' });
    // Shopify's own scripts fail to load offline too; only the theme's errors count.
    const errors = [];
    page.on('pageerror', (err) => { if (!/cdn\.shopify\.com|dynamically imported|Cross-origin|CORS/i.test(err.message)) errors.push(err.message); });
    await ctx.setOffline(true);
    await page.locator('.cart-line .qty__plus').first().click();
    await page.waitForTimeout(2500);
    const off = await page.evaluate(() => {
      const li = document.querySelector('.cart-line');
      return { qty: li.querySelector('.qty__input').value, busy: li.classList.contains('is-busy'), note: li.querySelector('[data-line-note]').textContent.trim(), offline: JSON.parse(document.getElementById('CartStrings').textContent).offline };
    });
    await ctx.setOffline(false);
    record('Audit: offline, the cart keeps the saved quantity', off.qty === '1' && !off.busy && errors.length === 0, `shows ${off.qty}, busy: ${off.busy}${errors.length ? `, errors: ${errors[0]}` : ''}`);
    record('Audit: offline, the message is the shop\'s own', off.note.length > 0 && !/fetch|load failed|network/i.test(off.note), off.note || 'no message');
    await ctx.request.post(base + '/cart/clear.js');
  }
  await browser.close();
}

// 17. A tap is always answered (docs/fluid-feel-plan.md, phase B): when the next page takes longer than a moment a
//     thin line shows at the top (after 300ms, never for a link within the page, gone on the new page; with reduced
//     motion it appears without moving), and on a phone in Chrome the links in view are fetched ahead, so the tapped
//     page comes from that fetch.
if (want('17')) {
  const line = async (label, engine, device, reducedMotion) => {
    const { browser, page } = await open(engine, device, { reducedMotion });
    await page.route('**/collections/**', async (route) => { if (route.request().isNavigationRequest()) await new Promise((r) => setTimeout(r, 1500)); route.continue(); });
    const hash = await page.evaluate(async () => {
      const a = document.createElement('a'); a.href = '#MainContent'; document.body.append(a); a.click();
      await new Promise((r) => setTimeout(r, 450));
      return document.documentElement.classList.contains('is-turning');
    });
    // Sampled from inside the page and read back on the next one: the old page can't be asked once it has gone.
    await page.evaluate(() => {
      const t0 = performance.now(); const out = [];
      const iv = setInterval(() => {
        const s = getComputedStyle(document.body, '::after');
        out.push([Math.round(performance.now() - t0), document.documentElement.classList.contains('is-turning'), s.height, s.transform === 'none' ? 0 : new DOMMatrix(s.transform).a]);
        sessionStorage.setItem('yb-line', JSON.stringify(out));
      }, 100);
      addEventListener('pagehide', () => clearInterval(iv));
      [...document.querySelectorAll('main a[href*="/collections/"]')].find((x) => x.offsetParent).click();
    }).catch(() => {});
    await page.waitForURL('**/collections/**', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({ samples: JSON.parse(sessionStorage.getItem('yb-line') || '[]'), left: document.documentElement.classList.contains('is-turning') }));
    const at = (ms) => r.samples.filter((x) => x[0] <= ms).pop() || [];
    const early = at(250), mid = at(700), late = at(1400);
    const moves = reducedMotion === 'reduce' ? late[3] === mid[3] : true;
    record(`Page turn, ${label}: a line when the page is slow`, !hash && early[1] === false && mid[1] === true && mid[2] === '3px' && mid[3] >= 0.29 && moves && !r.left,
      `in-page link: ${hash ? 'shown' : 'quiet'}; 250ms: ${early[1] ? 'shown' : 'not yet'}; 700ms: ${mid[1] ? `shown, ${Math.round(mid[3] * 100)}% across` : 'missing'}; next page: ${r.left ? 'still there' : 'gone'}`);
    await browser.close();
  };
  await line('desktop', chromium, devices['Desktop Chrome']);
  await line('reduced motion', chromium, devices['Desktop Chrome'], 'reduce');
  if (!QUICK) {
    await line('iPhone (WebKit)', webkit, devices['iPhone 13']);
    await line('Firefox', firefox, FIREFOX);
  }

  const { browser, page } = await open(chromium, devices['Pixel 7']);
  await page.evaluate(() => scrollTo({ top: innerHeight * 1.2, behavior: 'instant' }));
  await page.waitForTimeout(2500);
  const ahead = await page.evaluate(() => [...document.querySelectorAll('script[type=speculationrules]')].map((el) => JSON.parse(el.textContent).prefetch?.[0]?.urls?.[0]).filter(Boolean).map((u) => new URL(u).pathname));
  let delivery = 'nothing fetched ahead';
  if (ahead[0]) {
    await Promise.all([page.waitForURL('**' + ahead[0]), page.locator(`main a[href="${ahead[0]}"]`).locator('visible=true').first().tap()]);
    delivery = await page.evaluate(() => performance.getEntriesByType('navigation')[0].deliveryType || 'network');
  }
  record('Page turn, phone: links in view are fetched ahead', ahead.length > 0 && ahead.length <= 6 && delivery === 'navigational-prefetch', `${ahead.length} fetched ahead (6 at most); the tapped page came from: ${delivery}`);
  await browser.close();

  const lite = await open(chromium, devices['Pixel 7'], { init: () => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }) });
  await lite.page.evaluate(() => scrollTo({ top: innerHeight * 1.2, behavior: 'instant' }));
  await lite.page.waitForTimeout(1500);
  const none = await lite.page.evaluate(() => [...document.querySelectorAll('script[type=speculationrules]')].filter((el) => /"prefetch"/.test(el.textContent)).length);
  record('Page turn, data saver: nothing is fetched ahead', none === 0, `${none} fetched ahead`);
  await lite.browser.close();
}

// 18. Our promise (docs/promise-strip-plan.md): on a 360px phone the promises sit in one row (2 × 2 when there are
//     four) in a card no taller than 180px, titles only; no title is cut off down to 320 wide; a desktop still shows
//     the sentences.
if (want('18')) {
  const measure = async (engine, viewport, phone = true) => {
    const { browser, page } = await open(engine, { viewport, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone }, { reducedMotion: 'reduce' });
    const r = await page.evaluate(() => {
      const box = document.querySelector('.promise__box');
      if (!box) return null;
      const items = [...box.querySelectorAll('.promise__item')];
      const texts = [...box.querySelectorAll('.promise__text')];
      return {
        count: items.length,
        rows: new Set(items.map((li) => Math.round(li.getBoundingClientRect().top))).size,
        height: Math.round(box.getBoundingClientRect().height),
        texts: texts.length,
        shown: texts.filter((p) => p.getClientRects().length).length,
        cut: [...box.querySelectorAll('.promise__title')].filter((p) => p.scrollWidth > p.clientWidth + 1).length,
        sideways: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    await browser.close();
    return r;
  };
  for (const [label, engine] of QUICK ? [['Chrome', chromium]] : [['Chrome', chromium], ['Safari', webkit]]) {
    const p = await measure(engine, { width: 360, height: 800 });
    if (!p) { record(`Promise, ${label}`, true, 'no promise section on the home page: skipped'); continue; }
    const rows = p.count === 4 ? 2 : 1;
    record(`Promise, ${label} 360: one slim row, titles only`, p.rows === rows && p.height <= (rows === 2 ? 280 : 180) && p.shown === 0, `${p.count} promises in ${p.rows} row(s), card ${p.height}px, ${p.shown} sentence(s) shown`);
    const s = await measure(engine, { width: 320, height: 640 });
    record(`Promise, ${label} 320: no title cut off`, s.cut === 0 && !s.sideways, `${s.cut} cut off, sideways scroll: ${s.sideways}, card ${s.height}px`);
  }
  const d = await measure(chromium, { width: 1280, height: 800 }, false);
  if (d && d.texts) record('Promise, desktop: one row with the sentences', d.rows === 1 && d.shown === d.texts, `${d.rows} row(s), ${d.shown} of ${d.texts} sentence(s) shown`);
}

// 19. The footer (docs/footer-plan.md): on a 360px phone the Shop and Help lists sit side by side, every list, the
//     signature and the last lines share one left edge, it is at most 540px tall and every link is at least 32px
//     tall; no sideways scroll and no link cut off down to 320. A desktop has the signature and the list headings
//     on one line, at most 440px tall. Payment icons and Help lines beyond seven add their own height to the limits.
if (want('19')) {
  const measure = async (engine, viewport, phone = true) => {
    const { browser, page } = await open(engine, { viewport, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone }, { reducedMotion: 'reduce' });
    const r = await page.evaluate(() => {
      const f = document.querySelector('.footer');
      if (!f) return null;
      const box = (s) => f.querySelector(s)?.getBoundingClientRect();
      const lists = [...f.querySelectorAll('.footer__list')].map((el) => el.getBoundingClientRect());
      const heads = [...f.querySelectorAll('.footer__list h2')].map((el) => Math.round(el.getBoundingClientRect().top));
      const help = f.querySelectorAll('.footer__list--help li').length, shop = f.querySelectorAll('.footer__list--shop li').length;
      return {
        height: Math.round(f.getBoundingClientRect().height),
        link: Math.min(...[...f.querySelectorAll('a')].map((a) => Math.round(a.getBoundingClientRect().height))),
        // Shop and Help start on the same line, in two columns.
        sideBySide: lists.length < 2 || (Math.abs(lists[0].top - lists[1].top) < 2 && lists[1].left > lists[0].right - 1),
        // The first list, the name's row and the last lines start at the same left edge.
        edges: [lists[0]?.left, box('.footer__sign')?.left, box('.footer__base')?.left].filter((n) => n !== undefined).map(Math.round),
        // Desktop: the list headings on one line, beside the signature.
        headsLevel: heads.length > 0 && Math.max(...heads) - Math.min(...heads) < 2,
        signBeside: lists.length > 0 && box('.footer__sign').right <= lists[0].left && box('.footer__sign').top < lists[0].bottom,
        cut: [...f.querySelectorAll('a, h2, p')].filter((el) => el.scrollWidth > el.clientWidth + 1).length,
        extra: Math.round(f.querySelector('.footer__payments')?.getBoundingClientRect().height ?? 0) + 36 * Math.max(0, help - 7, shop - 7),
        sideways: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    await browser.close();
    return r;
  };
  for (const [label, engine] of QUICK ? [['Chrome', chromium]] : [['Chrome', chromium], ['Safari', webkit]]) {
    const p = await measure(engine, { width: 360, height: 800 });
    if (!p) { record(`Footer, ${label}`, false, 'no footer on the home page'); continue; }
    record(`Footer, ${label} 360: at most 540px`, p.height <= 540 + p.extra, `${p.height}px (limit ${540 + p.extra})`);
    record(`Footer, ${label} 360: lists side by side, one left edge`, p.sideBySide && new Set(p.edges).size === 1, `side by side: ${p.sideBySide}, left edges ${p.edges.join(', ')}px`);
    record(`Footer, ${label} 360: links at least 32px tall`, p.link >= 32, `smallest ${p.link}px`);
    for (const width of [320, 360, 390]) {
      const s = width === 360 ? p : await measure(engine, { width, height: 800 });
      record(`Footer, ${label} ${width}: nothing cut off`, s.cut === 0 && !s.sideways, `${s.cut} cut off, sideways scroll: ${s.sideways}`);
    }
  }
  const d = await measure(chromium, { width: 1280, height: 800 }, false);
  if (d) record('Footer, desktop 1280: one row, at most 440px', d.height <= 440 + d.extra && d.headsLevel && d.signBeside, `${d.height}px (limit ${440 + d.extra}), headings level: ${d.headsLevel}, signature beside the lists: ${d.signBeside}`);
}

// 20. The product page (docs/product-page-plan.md): a landing page for ad traffic, so it is measured on a short phone
//     screen (360 x 640, an in-app browser) as well as 360 x 800 and desktop. Uses the store's test products.
if (want('20')) {
  const at = (path) => new globalThis.URL(path, URL).href;
  const PHONE = { viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const SHORT = { ...PHONE, viewport: { width: 360, height: 640 } };
  const DESK = { viewport: { width: 1280, height: 800 } };
  const visit = async (path, device, opts = {}) => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ ...device, reducedMotion: opts.reducedMotion || 'reduce', javaScriptEnabled: opts.js !== false });
    await ctx.addInitScript(() => {
      window.__lcp = [];
      window.__cls = 0;
      // Every vibration the page asks for (the pulse under a cart tap).
      window.__buzz = [];
      try { Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: (p) => { window.__buzz.push(String(p)); return true; } }); } catch {}
      try {
        new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push({ t: e.startTime, el: e.element?.className || '' }))).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      } catch {}
    });
    const page = await ctx.newPage();
    const errors = themeErrors(page);
    const sizes = {};
    page.on('response', async (res) => {
      const m = res.url().match(/\/assets\/(product(?:-zoom|-rows|-buy)?|cart|theme)\.js/);
      if (m) try { sizes[m[1]] = (await res.body()).length / 1024; } catch {}
    });
    if (opts.throttle) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(at(path), { waitUntil: 'load' });
    await page.waitForTimeout(opts.js === false ? 300 : 1500);
    return { browser, page, errors, sizes };
  };
  const ROSE = 'products/red-rose-crochet-bouquet';

  // First screen, speed and layout.
  {
    const { browser, page, errors, sizes } = await visit(`${ROSE}?utm_source=ig`, PHONE, { throttle: true });
    const first = await page.evaluate(() => {
      const box = (sel) => document.querySelector(sel)?.getBoundingClientRect();
      const lcp = window.__lcp.at(-1) || { t: 0, el: '' };
      return {
        lcp,
        cls: window.__cls,
        intro: !!document.querySelector('.splash'),
        title: box('.pdp__title')?.bottom,
        price: box('[data-price]')?.bottom,
        sideways: document.documentElement.scrollWidth > innerWidth + 1,
        open: document.querySelectorAll('.pdp__details details[open]').length,
        closed: document.querySelectorAll('.pdp__details details').length,
        detailsEnd: Math.round(box('.pdp__details').bottom + scrollY),
        zoomLoaded: performance.getEntriesByType('resource').some((r) => /product-zoom/.test(r.name)),
        second: document.querySelectorAll('.gallery__img')[1]?.complete,
        buy: (() => {
          const a = box('.pdp__add'); const n = box('.pdp__now-btn'); const pill = box('.options__pills .pill'); const bar = box('.pdp__cta');
          // Phones: the two buttons are pinned to the bottom, side by side, on the page's own margins. No quantity
          // field (round 8): the stepper only shows once the piece is in the cart, and the form leaves no gap.
          return { field: !!document.querySelector('[data-product-form] [name="quantity"]'), stepper: document.querySelector('.pdp__cta .qty').getClientRects().length, form: Math.round(box('.pdp__form').height), rowTop: Math.abs(a.top - n.top), rowH: Math.abs(a.height - n.height), left: Math.abs(a.left - pill.left), right: Math.abs(n.right - (innerWidth - a.left)), pills: Math.abs(bar.bottom - innerHeight), h: Math.min(a.height, n.height), w: Math.min(a.width, n.width) };
        })(),
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => { try { return JSON.parse(el.textContent); } catch { return null; } }),
        shownPrice: document.querySelector('[data-price-now]').textContent.replace(/[^\d.]/g, ''),
      };
    });
    record('Product: photo is the LCP, phone (4x slower CPU)', first.lcp.t < BUDGET.lcpMs && /gallery__img/.test(first.lcp.el), `${Math.round(first.lcp.t)}ms on "${first.lcp.el}" (budget ${BUDGET.lcpMs}ms)`);
    record('Product: nothing jumps on load (CLS)', first.cls < 0.1, first.cls.toFixed(3));
    record('Product: no logo intro', !first.intro, first.intro ? 'the intro is on the page' : 'none');
    record('Product: name and price on the first screen', first.title < 800 && first.price < 800 && !first.sideways, `name ends ${Math.round(first.title)}px, price ${Math.round(first.price)}px of 800; sideways scroll: ${first.sideways}`);
    record('Product: photos to details within two screens', first.detailsEnd <= 1600, `details end at ${first.detailsEnd}px (limit 1600)`);
    record('Product: every text block closed', first.open === 0 && first.closed >= 2, `${first.closed} blocks, ${first.open} open`);
    const b = first.buy;
    record('Product: buy buttons pinned to the bottom, lined up', Math.max(b.rowTop, b.rowH, b.left, b.right, b.pills) <= 1 && b.h >= 48 && b.w >= 140, `tops ${b.rowTop.toFixed(1)}, heights ${b.rowH.toFixed(1)}, left edge ${b.left.toFixed(1)}, right edge ${b.right.toFixed(1)}, off the bottom ${b.pills.toFixed(1)} (px off); each ${Math.round(b.w)} x ${Math.round(b.h)}px`);
    record('Product: no quantity field, nothing of the buy box in the page', !b.field && b.stepper === 0 && b.form === 0, `quantity field in the form: ${b.field}; stepper showing: ${b.stepper > 0}; form ${b.form}px tall in the page`);
    record('Product: second photo ready, viewer not loaded', first.second === true && !first.zoomLoaded, `second photo loaded: ${first.second}; product-zoom.js fetched: ${first.zoomLoaded}`);
    const graph = first.ld.flatMap((d) => (d ? d['@graph'] || [d] : [{ '@type': 'unparsable' }]));
    const products = graph.filter((g) => g['@type'] === 'Product');
    const prices = (products[0]?.offers || []).map((o) => String(o.price).replace(/\.0$/, ''));
    record('Product: one Product in the JSON-LD, price matches', products.length === 1 && prices.includes(first.shownPrice) && !graph.some((g) => /FAQPage|unparsable/.test(g['@type'])), `types: ${graph.map((g) => g['@type']).join(', ')}; offers ${prices.join(', ')}; page shows ${first.shownPrice}`);

    // Swiping the photos keeps the dots and the count in step.
    await page.evaluate(() => { const t = document.querySelector('[data-gallery-track]'); t.scrollTo({ left: t.clientWidth, behavior: 'instant' }); });
    await page.waitForTimeout(400);
    const swiped = await page.evaluate(() => ({ count: document.querySelector('[data-gallery-count]').textContent, dot: [...document.querySelectorAll('[data-gallery-dots] i')].findIndex((d) => d.classList.contains('is-on')) }));
    record('Product: swipe moves dots and count', swiped.count === '2' && swiped.dot === 1, `count ${swiped.count}, dot ${swiped.dot + 1}`);

    // A new choice: price, button, address (the ad's parameters stay), and one announcement.
    await page.locator('.pill__label', { hasText: '6 roses' }).click();
    await page.waitForTimeout(400);
    const picked = await page.evaluate(() => ({
      price: document.querySelector('[data-price-now]').textContent,
      search: location.search,
      said: document.querySelector('[data-variant-status]').textContent,
    }));
    record('Product: variant changes price and address', /1,999/.test(picked.price) && /utm_source=ig/.test(picked.search) && /variant=\d+/.test(picked.search) && /6 roses/.test(picked.said), `${picked.price}; ${picked.search}; said "${picked.said}"`);

    // Add to cart: the count, and no pop-up (the buy box itself changes).
    await page.locator('.pdp__add').click();
    await page.waitForSelector('#CartDrawer .cart-line', { state: 'attached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(400);
    const added = await page.evaluate(() => ({ toast: !!document.querySelector('.cart-toast:not([hidden])'), count: document.querySelector('[data-cart-count]')?.textContent?.trim() }));
    record('Product: Add to cart counts the piece, with no pop-up', !added.toast && +added.count >= 1, `pop-up: ${added.toast}, cart count: ${added.count}`);

    // The viewer: opens on a tap, zooms, closes with Esc and gives focus back.
    await page.keyboard.press('Escape');
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('[data-zoom]').click();
    await page.waitForSelector('dialog.zoom[open]', { timeout: 5000 }).catch(() => {});
    const viewer = await page.evaluate(async () => {
      const d = document.querySelector('dialog.zoom');
      if (!d?.open) return { open: false };
      const t = d.querySelector('.zoom__track');
      const s = t.children[Math.round(t.scrollLeft / t.clientWidth)];
      const img = s.firstElementChild;
      const before = img.getBoundingClientRect().width;
      img.dispatchEvent(new MouseEvent('dblclick', { clientX: 180, clientY: 400, bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      const grew = img.getBoundingClientRect().width / before;
      img.dispatchEvent(new MouseEvent('dblclick', { clientX: 180, clientY: 400, bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      // A tap on the photo keeps the viewer open; a tap on the empty space around it closes it.
      img.click();
      const stays = d.open;
      const box = img.getBoundingClientRect();
      return { open: true, grew, stays, count: d.querySelector('.zoom__count')?.textContent.trim(), gapY: Math.max(20, box.top / 2), room: box.top > 40 };
    });
    if (viewer.room) await page.mouse.click(180, viewer.gapY);
    else await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ open: !!document.querySelector('dialog.zoom')?.open, focus: document.activeElement?.matches('[data-zoom]') }));
    record('Product: photo viewer opens, zooms, closes', viewer.open && viewer.grew > 2 && viewer.stays && !after.open && after.focus, `opened: ${viewer.open}, zoom ${viewer.grew?.toFixed(1)}x, tap on photo keeps it open: ${viewer.stays}, tap outside closes: ${viewer.room && !after.open}, count "${viewer.count}", focus back: ${after.focus}`);

    record('Product: script sizes', sizes.product < 10 && (sizes['product-buy'] ?? 0) < 6 && (sizes['product-zoom'] ?? 0) < 7 && (sizes['product-rows'] ?? 0) < 4 && sizes.cart < BUDGET.cartJsKB && sizes.theme < BUDGET.ownJsKB, Object.entries(sizes).map(([k, v]) => `${k}.js ${v.toFixed(1)} KB`).join(', ') + ' (budgets: product 10, buy 6, zoom 7, rows 4)');
    record('Product: no script errors', errors.length === 0, errors.join(' | ') || 'none');

    // Rows under the details load when reached; tap targets; axe.
    await scrollWholePage(page);
    const rows = await page.evaluate(() => ({
      titles: [...document.querySelectorAll('.product-row__title')].filter((h) => h.getClientRects().length).map((h) => h.textContent.trim()),
      self: [...document.querySelectorAll('.recs .card__link')].some((a) => a.getAttribute('href').split('?')[0] === location.pathname),
      small: [...document.querySelectorAll('.pdp button, .pdp a, .pdp summary, .pdp .pill__label')].filter((el) => el.getClientRects().length && !el.closest('.rte')).map((el) => { const r = el.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width), c: el.className || el.tagName }; }).filter((r) => r.h < 44).map((r) => `${r.c} ${r.w}x${r.h}`),
    }));
    record('Product: "You may also like" loads, without this piece', rows.titles.some((t) => /also like/i.test(t)) && !rows.self, `rows: ${rows.titles.join(', ') || 'none'}; shows itself: ${rows.self}`);
    record('Product: tap targets at least 44px', rows.small.length === 0, rows.small.join(', ') || 'all fine');
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: axe.source });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
    record('Product: accessibility, phone (axe)', v.length === 0, v.join(', ') || '0 violations');
    await browser.close();
  }

  // A short screen (in-app browser): Add to cart and Buy it now are on screen from arrival to the end of the page,
  // one set of buttons, with the name and price above them and the footer's last line clear of them.
  {
    const { browser, page } = await visit(ROSE, SHORT);
    const bar = async () => page.evaluate(() => {
      const seen = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return r.height >= 44 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; };
      const top = document.querySelector('.pdp__cta').getBoundingClientRect().top;
      return { add: seen('.pdp__add'), now: seen('.pdp__now-btn'), top, price: document.querySelector('[data-price-now]').getBoundingClientRect().bottom, lift: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--buybar')) || getComputedStyle(document.body).paddingBottom, pad: parseFloat(getComputedStyle(document.body).paddingBottom), adds: [...document.querySelectorAll('[data-add]')].filter((el) => el.getClientRects().length).length };
    });
    const start = await bar();
    await page.evaluate(() => scrollTo(0, 900));
    await page.waitForTimeout(500);
    const middle = await bar();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(900);
    const end = await bar();
    const footer = await page.evaluate(() => { const f = (document.querySelector('.shopify-section-group-footer-group') || document.querySelector('footer')); return Math.round(f.getBoundingClientRect().bottom); });
    record('Product 360 x 640: buy buttons on screen the whole page', [start, middle, end].every((b) => b.add && b.now) && start.adds === 1, `arrival ${start.add && start.now}, middle ${middle.add && middle.now}, end ${end.add && end.now}; Add to cart buttons on the page: ${start.adds}`);
    record('Product 360 x 640: name and price above the buttons', start.price <= start.top, `price ends ${Math.round(start.price)}px, buttons start ${Math.round(start.top)}px`);
    record('Product 360 x 640: footer and pop-ups clear the buttons', footer <= end.top + 1 && start.pad >= 60, `footer ends ${footer}px, buttons start ${Math.round(end.top)}px; page padded ${start.pad}px`);
    await browser.close();
  }

  // Round 9: the collection and the rating are one line above the name, so on a 360 x 740 screen the options are
  // above the pinned buttons on arrival. The collection is the piece's craft (its product type), never whichever
  // collection comes first in the alphabet, and the breadcrumb given to search engines names the same one.
  {
    const { browser, page } = await visit('products/sunflower-crochet-bouquet', { ...PHONE, viewport: { width: 360, height: 740 } });
    const top = await page.evaluate(() => {
      const box = (sel) => document.querySelector(sel)?.getBoundingClientRect();
      let crumb = '';
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try { const list = (JSON.parse(s.textContent)['@graph'] || []).find((x) => x['@type'] === 'BreadcrumbList'); if (list) crumb = new URL(list.itemListElement[1].item).pathname; } catch {}
      }
      const where = box('.pdp__crumb'); const rating = box('.pdp__rating'); const title = box('.pdp__title');
      return {
        href: document.querySelector('.pdp__crumb')?.getAttribute('href'), crumb,
        line: !rating || (Math.abs(rating.top - where.top) < 2 && rating.left >= where.right - 1 && Math.abs(rating.right - title.right) < 2 && rating.bottom - 8 <= title.top),
        name: title.height < 40 && Math.abs(title.width - box('.pdp__head').width) < 2,
        pills: Math.round(box('.pill').bottom), bar: Math.round(box('.pdp__cta').top), from: Math.round(box('.pill').top - box('.pdp__head').top),
      };
    });
    record('Product: the collection is the craft, breadcrumb too', top.href === '/collections/bouquets' && top.crumb === top.href, `link ${top.href}, breadcrumb ${top.crumb || 'none'}`);
    record('Product: collection and rating on one line', top.line && top.name, `one line above the name: ${top.line}; name on one full-width line: ${top.name}`);
    record('Product 360 x 740: options above the buttons', top.pills <= top.bar, `pills end ${top.pills}px, buttons start ${top.bar}px; ${top.from}px from the top of the block`);
    await browser.close();
  }

  // No quantity field (round 8): Add to cart turns into the cart's own stepper and a ticked View cart, and the two
  // stay in step with the cart both ways. Checked at 320, 360 and 390 wide.
  for (const [w, h] of [[320, 640], [360, 640], [390, 844]]) {
    const { browser, page, errors } = await visit(ROSE, { ...PHONE, viewport: { width: w, height: h } });
    await page.context().request.post(at('cart/clear.js'));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const bar = () => page.evaluate(() => {
      const vis = (sel) => { const el = document.querySelector(sel); const r = el.getBoundingClientRect(); return el.getClientRects().length ? { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) } : null; };
      const a = document.activeElement;
      return {
        add: vis('.pdp__add'), now: vis('.pdp__now-btn'), qty: vis('.pdp__cta .qty'), minus: vis('.pdp__cta .qty__minus'), plus: vis('.pdp__cta .qty__plus'), view: vis('.pdp__cta .incart__view'),
        value: document.querySelector('.pdp__cta .qty__input').value,
        bin: getComputedStyle(document.querySelector('.pdp__cta .qty__minus .icon--bin')).display !== 'none',
        tick: !!document.querySelector('.pdp__cta .incart__view .icon'),
        line: +document.querySelector('#CartDrawer .cart-line:not(.is-gift)')?.dataset.qty || 0,
        badge: (document.querySelector('[data-cart-count]')?.textContent || '').trim(),
        focus: a.matches('.qty__plus') ? 'plus' : a.matches('.pdp__add') ? 'Add to cart' : a.tagName.toLowerCase(),
        off: document.querySelector('.pdp__cta .qty__plus').getAttribute('aria-disabled') === 'true',
        limit: [...document.querySelectorAll('.pdp__limit:not([hidden])')].map((l) => l.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
        toast: !!document.querySelector('.cart-toast:not([hidden])'),
        pending: document.querySelector('[data-buy]').classList.contains('is-adding'),
        // Painted, not only laid out: a class on the buy box once faded the whole bar out while the add was on its way.
        faded: [...document.querySelectorAll('[data-buy], .pdp__cta')].some((el) => +getComputedStyle(el).opacity < 0.99),
        tickOn: getComputedStyle(document.querySelector('.pdp__cta .incart__view .icon')).opacity,
        buzz: window.__buzz.splice(0).join(' | '),
        sideways: document.documentElement.scrollWidth > innerWidth + 1,
        cls: window.__cls,
      };
    });
    const settle = () => page.waitForTimeout(2500);
    const s0 = await bar();
    record(`Product ${w}px: not in the cart, Add to cart and Buy it now`, !!s0.add && !!s0.now && !s0.qty && !s0.view, `Add to cart: ${!!s0.add}, Buy it now: ${!!s0.now}, stepper: ${!!s0.qty}, View cart: ${!!s0.view}`);

    // The stepper shows the moment Add to cart is pressed. Here Shopify answers late and says no: Add to cart comes
    // back with focus, and the reason is shown.
    await page.route('**/cart/add.js', (route) => setTimeout(() => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ status: 422, message: 'Cart Error', description: 'This piece just sold out.' }) }), 1200), { times: 1 });
    await page.focus('.pdp__add');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const r1 = await bar();
    await page.waitForTimeout(2200);
    const r2 = await bar();
    const reason = await page.evaluate(() => document.querySelector('.cart-toast.is-error .cart-toast__title')?.textContent.trim() || '');
    record(`Product ${w}px: the stepper shows at once, before the cart answers`, !!r1.qty && !r1.add && r1.value === '1' && r1.focus === 'plus' && !r1.line && r1.pending && !r1.faded && r1.tickOn === '0' && r1.buzz === '10', `stepper within 200ms: ${!!r1.qty}, faded out: ${r1.faded}, shows ${r1.value}, focus on ${r1.focus}, cart had answered: ${!!r1.line}; tick held back: ${r1.pending && r1.tickOn === '0'}; pulse: ${r1.buzz || 'none'}`);
    record(`Product ${w}px: a refused add brings Add to cart back, with the reason`, !!r2.add && !r2.qty && r2.focus === 'Add to cart' && /sold out/.test(reason) && !r2.pending && r2.buzz === '30,60,30', `Add to cart: ${!!r2.add}, stepper: ${!!r2.qty}, focus on ${r2.focus}, reason: "${reason}", pulse: ${r2.buzz || 'none'}`);
    await page.click('[data-toast-close]').catch(() => {});
    await page.waitForTimeout(500);

    await page.focus('.pdp__add');
    await page.keyboard.press('Enter');
    await page.waitForSelector('#CartDrawer .cart-line', { state: 'attached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(800);
    const s1 = await bar();
    const fits = s1.qty && s1.view && s1.minus && s1.plus && Math.min(s1.minus.w, s1.minus.h, s1.plus.w, s1.plus.h) >= 44 && s1.qty.h === 48 && s1.view.h === 48 && s1.qty.top === s1.view.top && Math.abs(s1.qty.w - s1.view.w) <= 2 && !s1.sideways;
    record(`Product ${w}px: added, the bar is the stepper and a ticked View cart`, !s1.add && !s1.now && !!fits && s1.value === '1' && s1.bin && s1.tick && s1.tickOn === '1' && !s1.pending && s1.focus === 'plus' && !s1.toast, s1.qty && s1.view ? `stepper ${s1.qty.w} x ${s1.qty.h} (buttons ${s1.minus.w} x ${s1.minus.h}), View cart ${s1.view.w} x ${s1.view.h}; shows ${s1.value} with the bin: ${s1.bin}; tick: ${s1.tick}; focus on ${s1.focus}; pop-up: ${s1.toast}; sideways scroll: ${s1.sideways}` : 'the stepper or View cart is missing');

    await page.locator('.pdp__cta .qty__plus').click();
    await page.locator('.pdp__cta .qty__plus').click();
    await settle();
    const s2 = await bar();
    record(`Product ${w}px: a pulse for each tap on plus`, s2.buzz === '10 | 10', `asked for: ${s2.buzz || 'none'}`);
    record(`Product ${w}px: plus changes the cart`, s2.value === '3' && s2.line === 3 && s2.badge === '3' && !s2.bin, `bar ${s2.value}, cart line ${s2.line}, header count "${s2.badge}", minus is a minus: ${!s2.bin}`);

    if (w === 360) {
      await page.addScriptTag({ content: axe.source });
      const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      record('Product, in the cart: accessibility, phone (axe)', v.length === 0, v.join(', ') || '0 violations');

      // The other way: a change in the drawer shows in the bar.
      await page.locator('.pdp__cta .incart__view').click();
      await page.waitForTimeout(700);
      const opened = await page.evaluate(() => document.getElementById('CartDrawer').open);
      await page.locator('#CartDrawer .cart-line .qty__minus').first().click();
      await settle();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
      const s3 = await bar();
      record('Product: View cart opens the drawer, and a change there shows in the bar', opened && s3.value === '2' && s3.line === 2, `drawer opened: ${opened}; after minus in the drawer the bar shows ${s3.value}`);

      // Arriving with the piece in the cart: the stepper is there at once, and nothing jumps.
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1200);
      const s4 = await bar();
      record('Product: in the cart on arrival, drawn by the server', !!s4.qty && !s4.add && s4.value === '2' && s4.cls < 0.1, `stepper on arrival: ${!!s4.qty} showing ${s4.value}; CLS ${s4.cls.toFixed(3)}`);

      // Another option of the same piece is not in the cart; back on the first, the stepper returns.
      await page.locator('.pill__label', { hasText: '6 roses' }).click();
      await page.waitForTimeout(400);
      const other = await bar();
      // Its own limit: typing far past it stops at the most there is, and says why.
      const most = await page.evaluate(() => { const id = +new FormData(document.querySelector('[data-product-form]')).get('id'); return JSON.parse(document.querySelector('[data-variants]').textContent).find((x) => x.id === id).max; });
      await page.locator('.pdp__add').click();
      await page.locator('.pdp__cta .qty__input').waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      await page.locator('.pdp__cta .qty__input').fill('99');
      await page.locator('.pdp__cta .qty__input').dispatchEvent('change');
      await settle();
      const top = await bar();
      await page.locator('.pdp__cta .qty__input').fill('0');
      await page.locator('.pdp__cta .qty__input').dispatchEvent('change');
      await settle();
      await page.locator('.pill__label', { hasText: '3 roses' }).click();
      await page.waitForTimeout(400);
      const back = await bar();
      record('Product: the bar follows the chosen option', !!other.add && !other.qty && !!back.qty && back.value === '2', `"6 roses": Add to cart ${!!other.add}; back on "3 roses": stepper showing ${back.value}`);
      record('Product: the stepper stops at the most there is, and says why', most > 0 && top.value === String(most) && top.off && top.limit.length > 0, `typing 99 gives ${top.value} (limit ${most}); plus off: ${top.off}; "${top.limit}"`);
    }

    // Down to one, then the bin: out of the cart, Add to cart is back and has focus.
    while (+(await page.locator('.pdp__cta .qty__input').inputValue()) > 1) await page.locator('.pdp__cta .qty__minus').click();
    await settle();
    await page.focus('.pdp__cta .qty__minus');
    await page.keyboard.press('Enter');
    await settle();
    const s5 = await bar();
    const left = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).item_count);
    record(`Product ${w}px: the bin takes it out, Add to cart is back`, !!s5.add && !!s5.now && !s5.qty && left === 0 && s5.focus === 'Add to cart', `Add to cart: ${!!s5.add}; cart holds ${left}; focus on ${s5.focus}`);
    record(`Product ${w}px, in the cart: no script errors`, errors.length === 0, errors[0] || 'none');
    await browser.close();
  }

  // Sold out, sale, one-photo, the free gift.
  {
    const { browser, page } = await visit('products/daisy-crochet-headband', PHONE);
    const r = await page.evaluate(() => ({ off: document.querySelector('.pdp__add').disabled, label: document.querySelector('.pdp__add [data-add-label]').textContent.trim(), ask: document.querySelector('[data-ask-text]').textContent.trim(), lifted: !!document.querySelector('.pdp__info > .recs'), qty: document.querySelector('.pdp .qty').getClientRects().length, now: document.querySelector('.pdp__now-btn').getClientRects().length, make: (() => { const m = document.querySelector('.pdp__make'); const r = m.getBoundingClientRect(); return r.height >= 44 && r.bottom <= innerHeight && /wa\.me|contact/.test(m.href); })() }));
    record('Product, sold out: says so, offers to make one', r.off && /sold out/i.test(r.label) && /make one/i.test(r.ask) && r.lifted && !r.qty && !r.now && r.make, `button off: ${r.off} "${r.label}"; "${r.ask}"; similar pieces under the buy box: ${r.lifted}; quantity shown: ${!!r.qty}; Buy it now shown: ${!!r.now}; "Ask us to make one" in the bar: ${r.make}`);
    await page.goto(at('products/pink-tulip-daisy-bouquet'), { waitUntil: 'load' });
    const sale = await page.evaluate(() => document.querySelector('[data-price]').textContent.replace(/\s+/g, ' ').trim());
    const saleBadge = await page.evaluate(() => document.querySelector('[data-badge]').textContent.trim());
    const ogPrice = await page.evaluate(() => document.querySelector('meta[property="og:price:amount"]').content);
    record('Product, on sale: both prices, named, and the saving', /Sale price ?₹999 ?Regular price ?₹1,199/.test(sale) && /Save ₹200/.test(saleBadge), `${sale}; badge "${saleBadge}"`);
    record('Product: the shared price is a plain number', /^\d+(\.\d+)?$/.test(ogPrice), `og:price:amount "${ogPrice}"`);
    await page.goto(at('products/sunflower-daisy-keychain'), { waitUntil: 'load' });
    const one = await page.evaluate(() => ({ photos: document.querySelectorAll('.gallery__slide').length, meta: !!document.querySelector('.gallery__meta') }));
    record('Product, one photo: no dots or count', one.photos === 1 && !one.meta, `${one.photos} photo, dots/count: ${one.meta}`);
    await page.goto(at('products/sunflower-keychain-free-gift'), { waitUntil: 'load' });
    const gift = await page.evaluate(() => ({ form: !!document.querySelector('[data-product-form]'), note: !!document.querySelector('.pdp__gift') }));
    record('Product, the free gift: no buy box', !gift.form && gift.note, `form: ${gift.form}, note: ${gift.note}`);
    await browser.close();
  }

  // Size pills have photos too when each size has its own (docs/decisions.md, 2026-10-06); sizes that share one
  // photo stay text.
  {
    const { browser, page } = await visit('products/sunflower-crochet-bouquet', PHONE);
    const pills = await page.evaluate(() => {
      const labels = [...document.querySelectorAll('.options__group .pill__label')];
      const src = labels.map((l) => l.querySelector('img.pill__photo')?.currentSrc.split('?')[0] || '');
      return { n: labels.length, withPhoto: src.filter(Boolean).length, different: new Set(src).size, heights: labels.map((l) => Math.round(l.getBoundingClientRect().height)), sideways: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    await page.goto(at('products/heart-crochet-hair-pins'), { waitUntil: 'load' });
    const plain = await page.evaluate(() => ({ n: document.querySelectorAll('.options__group .pill__label').length, photos: document.querySelectorAll('.options__group .pill__photo').length }));
    record('Product: each size shows its own photo on its pill', pills.n > 1 && pills.withPhoto === pills.n && pills.different === pills.n && pills.heights.every((h) => h === 48) && !pills.sideways, `${pills.withPhoto}/${pills.n} pills with a photo, ${pills.different} different; heights ${pills.heights.join(', ')}px; sideways scroll: ${pills.sideways}`);
    record('Product: choices that share one photo stay text', plain.n > 1 && plain.photos === 0, `${plain.n} pills, ${plain.photos} photos`);
    await browser.close();
  }

  {
    const { browser, page, errors } = await visit('products/rose-crochet-bouquet-colour-test', PHONE);
    if (!(await page.locator('.options').count())) record('Product, colours: the colour test product', false, 'products/rose-crochet-bouquet-colour-test is missing');
    else {
      const pick = (name) => page.locator('.pill__label', { hasText: name }).click();
      const state = () => page.evaluate(() => ({
        legends: [...document.querySelectorAll('.options__name')].map((l) => l.textContent.replace(/\s+/g, ' ').trim()),
        price: document.querySelector('[data-price-now]').textContent,
        photos: [...document.querySelectorAll('.gallery__slide')].filter((el) => !el.hidden).map((el) => (el.querySelector('img')?.alt || '').split(' ')[0]),
        thumbs: [...document.querySelectorAll('.gallery__thumbs li')].filter((el) => !el.hidden).length,
        dots: [...document.querySelectorAll('[data-gallery-dots] i')].filter((el) => !el.hidden).length,
        total: document.querySelector('[data-gallery-total]').textContent,
        meta: !document.querySelector('.gallery__meta').hidden,
        six: [...document.querySelectorAll('.pill__input')].find((i) => i.dataset.value === '6 roses').disabled,
        search: location.search,
        swatches: [...document.querySelectorAll('.options__group')].map((g) => g.querySelectorAll('.pill__photo').length),
        id: new FormData(document.querySelector('[data-product-form]')).get('id'),
      }));
      const start = await state();
      const b = await page.evaluate(() => {
        const box = (sel) => document.querySelector(sel).getBoundingClientRect();
        const a = box('.pdp__add'); const n = box('.pdp__now-btn'); const pill = box('.options__pills .pill');
        return { rowTop: Math.abs(a.top - n.top), rowH: Math.abs(a.height - n.height), left: Math.abs(a.left - pill.left), right: Math.abs(n.right - (innerWidth - a.left)), pills: 0 };
      });
      record('Product, no stock limit: buy box lines up', Math.max(b.rowTop, b.rowH, b.left, b.right, b.pills) <= 1, `row top ${b.rowTop.toFixed(1)}, heights ${b.rowH.toFixed(1)}, left ${b.left.toFixed(1)}, right ${b.right.toFixed(1)} (px off)`);
      await pick('Pink');
      await page.waitForTimeout(500);
      const pink = await state();
      await pick('Yellow');
      await page.waitForTimeout(500);
      const yellow = await state();
      // Phones: each option is one row that swipes sideways; nothing wraps, the page itself doesn't scroll sideways.
      const rows = await page.evaluate(async () => {
        const groups = [...document.querySelectorAll('.options__pills')];
        const colour = groups[0];
        const last = colour.lastElementChild;
        colour.scrollLeft = colour.scrollWidth;
        await new Promise((done) => setTimeout(done, 300));
        const r = last.getBoundingClientRect();
        return {
          heights: groups.map((g) => new Set([...g.children].map((pill) => Math.round(pill.getBoundingClientRect().top))).size),
          sideways: document.documentElement.scrollWidth > innerWidth + 1,
          lastIn: r.left >= 0 && r.right <= innerWidth,
        };
      });
      record('Product 360, options: one swipe row each', rows.heights.every((n) => n === 1) && !rows.sideways && rows.lastIn, `pill rows per option: ${rows.heights.join(', ')}; page scrolls sideways: ${rows.sideways}; last colour reachable: ${rows.lastIn}`);
      record('Product, colours: a photo swatch per colour, none on sizes', start.swatches[0] === 3 && start.swatches[1] === 0, `colour pills with a photo: ${start.swatches[0]} of 3, size pills: ${start.swatches[1]}`);
      record('Product, colours: the label names the choice', start.legends[0] === 'Colour: Red' && yellow.legends[0] === 'Colour: Yellow' && /Size: 3 roses/.test(yellow.legends[1]), `${start.legends.join(' | ')} → ${yellow.legends.join(' | ')}`);
      record('Product, colours: price and link follow', /1,299/.test(yellow.price) && /variant=\d+/.test(yellow.search) && yellow.id !== start.id, `${yellow.price}, ${yellow.search}`);
      // Only the chosen colour's photos are in the row; the dots, count and thumbnails match.
      const only = (st, colour, n) => st.photos.length === n && st.photos.every((p) => p === colour) && st.thumbs === n && st.dots === n && st.total === String(n) && st.meta === n > 1;
      record('Product, colours: only the chosen colour\'s photos', only(start, 'Red', 2) && only(pink, 'Pink', 1) && only(yellow, 'Yellow', 1), `Red: ${start.photos.join(', ')} (count ${start.total}); Pink: ${pink.photos.join(', ')}; Yellow: ${yellow.photos.join(', ')} (dots and count shown: ${yellow.meta})`);
      await pick('Red');
      await page.waitForTimeout(500);
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('[data-zoom]').click();
      await page.waitForSelector('dialog.zoom[open]', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      const inViewer = await page.evaluate(() => ({ photos: [...document.querySelectorAll('.zoom__slide')].filter((el) => !el.hidden).map((el) => el.firstElementChild.alt.split(' ')[0]), total: document.querySelector('[data-zoom-total]')?.textContent }));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      record('Product, colours: the viewer shows that colour only', inViewer.photos.length === 2 && inViewer.photos.every((p) => p === 'Red') && inViewer.total === '2', `viewer: ${inViewer.photos.join(', ')} of ${inViewer.total}`);
      record('Product, colours: a sold-out pair is off, then back', pink.six === true && yellow.six === false, `Pink: "6 roses" disabled ${pink.six}; Yellow: disabled ${yellow.six}`);

      // No stock limit here, so the cap of 9 is the limit: in the cart, plus stops there and the line about larger
      // orders shows. Then the piece is taken out again.
      {
        const plus = page.locator('.pdp__cta .qty__plus');
        const field = page.locator('.pdp__cta .qty__input');
        const limit = () => page.evaluate(() => { const l = document.querySelector('[data-limit]'); return { shown: !l.hidden, text: l.textContent.replace(/\s+/g, ' ').trim(), href: l.querySelector('a').href }; });
        await page.locator('.pdp__add').click();
        await plus.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
        const before = await limit();
        // At the limit plus is aria-disabled, which Playwright won't click; a shopper still can, so force it.
        for (let i = 0; i < 12; i++) await plus.click({ force: true });
        const at9 = await field.inputValue();
        const after = await limit();
        await page.waitForTimeout(2500);
        // This piece only: the free gift may be in the cart for a moment too.
        const held = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).items.filter((i) => location.pathname.endsWith(i.handle)).reduce((n, i) => n + i.quantity, 0));
        await field.fill('0');
        await field.dispatchEvent('change');
        await page.waitForTimeout(2500);
        record('Product: at most 9, larger orders go to WhatsApp', at9 === '9' && held === 9 && !before.shown && after.shown && /wa\.me|contact/.test(after.href), `plus stops at ${at9}, cart holds ${held}; line shown before: ${before.shown}, at 9: ${after.shown} ("${after.text}")`);
        const rating = await page.evaluate(() => Math.round(document.querySelector('a.pdp__rating').getBoundingClientRect().height));
        record('Product: the rating link is 44px tall', rating >= 44, `${rating}px`);
      }

      // The rating by the name takes you down to the reviews.
      await page.evaluate(() => scrollTo(0, 0));
      const link = page.locator('a.pdp__rating');
      const has = await link.count();
      if (has) await link.click();
      await page.waitForTimeout(900);
      const landed = await page.evaluate(() => { const r = document.querySelector('#reviews'); return r ? { top: Math.round(r.getBoundingClientRect().top), hash: location.hash } : null; });
      record('Product: the rating links to the reviews', has === 1 && !!landed && landed.hash === '#reviews' && landed.top >= 0 && landed.top < 200, landed ? `reviews ${landed.top}px from the top, ${landed.hash}` : `rating shown: ${has}, no #reviews on the page`);
      const pinkId = await page.evaluate(() => JSON.parse(document.querySelector('[data-variants]').textContent).find((v) => v.options[0] === 'Pink' && v.available)?.id);
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(at(`products/rose-crochet-bouquet-colour-test?variant=${pinkId}`), { waitUntil: 'load' });
      await page.waitForTimeout(800);
      const linked = await page.evaluate(() => {
        const input = document.querySelector('.pill__input:checked');
        const r = input.parentElement.getBoundingClientRect();
        const row = input.closest('.options__pills');
        return { value: input.dataset.value, inView: r.left >= 0 && r.right <= innerWidth, scrolls: row.scrollWidth > row.clientWidth + 1, pageTop: scrollY };
      });
      record('Product 320, options: a linked colour opens in view', linked.value === 'Pink' && linked.inView && linked.pageTop === 0, `chosen: ${linked.value}; fully in view: ${linked.inView}; row needs swiping: ${linked.scrolls}; page scrolled ${linked.pageTop}px`);
      record('Product, colours: no script errors', errors.length === 0, errors.join(' | ') || 'none');
    }
    await page.goto(at(ROSE), { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const plain = await page.evaluate(() => {
      const lines = (el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
      const circle = (sel) => { const el = document.querySelector(sel); const i = parseFloat(getComputedStyle(el, '::before').inset) || 0; return Math.round(el.getBoundingClientRect().width - i * 2); };
      return {
        rating: !!document.querySelector('.pdp__rating'),
        terms: [...document.querySelectorAll('.offer-terms li > :last-child')].map(lines),
        termRows: new Set([...document.querySelectorAll('.offer-terms li')].map((li) => Math.round(li.getBoundingClientRect().top))).size,
        termClip: [...document.querySelectorAll('.offer-terms li')].filter((li) => li.scrollWidth > li.clientWidth + 1).length,
        card: Math.round(document.querySelector('.assure').getBoundingClientRect().height),
        ask: Math.round(document.querySelector('[data-ask]').getBoundingClientRect().height),
        reviews: Math.round(document.querySelector('#reviews').getBoundingClientRect().height),
        faq: [...document.querySelectorAll('.faq--compact summary')].map((s) => Math.round(s.getBoundingClientRect().height)),
        circles: [circle('.gallery [data-save]'), circle('[data-share]')],
        look: getComputedStyle(document.querySelector('[data-zoom]')).opacity,
      };
    });
    record('Product: no rating line without real ratings', !plain.rating, `rating shown: ${plain.rating}`);
    record('Product 360: delivery terms and ask line are one compact card', plain.terms.length >= 2 && plain.terms.every((n) => n <= 2) && plain.termRows <= 2 && plain.termClip === 0 && plain.ask >= 44 && plain.card <= 150, `lines per term: ${plain.terms.join(', ')}; ${plain.termRows} row(s); clipped: ${plain.termClip}; ask row ${plain.ask}px; card ${plain.card}px tall`);
    record('Product 360: reviews block is compact', plain.reviews > 100 && plain.reviews < 500, `${plain.reviews}px tall (was 559)`);
    record('Product 360: compact FAQ rows', plain.faq.length >= 2 && plain.faq.every((h) => h >= 48 && h <= 60), `row heights: ${plain.faq.join(', ')}px`);
    record('Product 360: photo buttons are 40px circles, no look-closer button on show', plain.circles.every((n) => n >= 40) && plain.look === '0', `save ${plain.circles[0]}px, share ${plain.circles[1]}px; look closer opacity ${plain.look}`);
    await browser.close();
  }

  // A tablet: two columns, so the name, price and buttons are on the first screen. A phone on its side: the photo
  // fits the screen's height.
  {
    const { browser, page } = await visit('products/rose-crochet-bouquet-colour-test', { viewport: { width: 768, height: 1024 }, hasTouch: true });
    const t = await page.evaluate(() => {
      const g = document.querySelector('.pdp__gallery').getBoundingClientRect(); const i = document.querySelector('.pdp__info').getBoundingClientRect(); const a = document.querySelector('.pdp__add').getBoundingClientRect();
      return { beside: i.left >= g.right - 1, add: Math.round(a.bottom), fixed: getComputedStyle(document.querySelector('.pdp__cta')).position === 'fixed', sideways: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    record('Product, tablet 768: two columns, buy box on the first screen', t.beside && t.add <= 1024 && !t.fixed && !t.sideways, `beside: ${t.beside}; Add to cart ends ${t.add}px of 1024; sideways: ${t.sideways}`);
    // The buy bar names the choice: a new colour changes its text and price, and it is out of reach until it shows.
    const barText = () => page.evaluate(() => { const bar = document.querySelector('.buybar'); return { choice: bar.querySelector('.buybar__choice').textContent.replace(/\s+/g, ' ').trim(), price: bar.querySelector('[data-price-now]').textContent.trim(), hidden: getComputedStyle(bar).visibility === 'hidden' }; });
    const tb0 = await barText();
    await page.locator('.pill__label', { hasText: 'Yellow' }).click();
    await page.waitForTimeout(500);
    const tb1 = await barText();
    record('Product, tablet 768: the buy bar follows the choice', tb0.hidden && /^Red · /.test(tb0.choice) && /^Yellow · /.test(tb1.choice) && /1,299/.test(tb1.price), `on arrival hidden: ${tb0.hidden}, "${tb0.choice}" ${tb0.price}; after Yellow: "${tb1.choice}" ${tb1.price}`);
    await page.setViewportSize({ width: 740, height: 360 });
    await page.waitForTimeout(400);
    const l = await page.evaluate(() => ({ photo: Math.round(document.querySelector('.gallery__slide').getBoundingClientRect().height), name: Math.round(document.querySelector('.pdp__title').getBoundingClientRect().top) }));
    record('Product, phone on its side: the photo fits the screen', l.photo <= 360 && l.name <= 720, `photo ${l.photo}px tall of 360; name starts ${l.name}px down`);
    await browser.close();
  }

  // The most of one piece per order (Theme settings → Cart, 9) counts what the cart already holds, and the cart's
  // own stepper stops there too.
  {
    const { browser, page } = await visit('products/rose-crochet-bouquet-colour-test', PHONE);
    await page.locator('.pdp__add').click();
    await page.locator('.pdp__cta .qty__input').waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await page.locator('.pdp__cta .qty__input').fill('99');
    await page.locator('.pdp__cta .qty__input').dispatchEvent('change');
    // The add, the nine and the free gift are three requests, one after another.
    await page.waitForTimeout(5000);
    const nine = await page.evaluate(() => document.querySelector('[data-cart-status]')?.textContent || '');
    record('Product: a typed number is said with the number and the subtotal', /quantity 9\. Subtotal .?\d/.test(nine), `said "${nine.trim()}"`);
    // A tenth can't be asked for: plus is off, and a tap on it says why (aloud too), with no pulse.
    await page.evaluate(() => window.__buzz.splice(0));
    await page.locator('.pdp__cta .qty__plus').click({ force: true });
    await page.waitForTimeout(300);
    const quiet = await page.evaluate(() => window.__buzz.join(' | '));
    const said = await page.evaluate(() => `${document.querySelector('.pdp__cta .qty__plus').getAttribute('aria-disabled')}: ${document.querySelector('[data-cart-status]')?.textContent || ''}`);
    const held = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).items.filter((i) => /colour test/.test(i.product_title)).reduce((n, i) => n + i.quantity, 0));
    await page.goto(at('cart'), { waitUntil: 'load' });
    const line = await page.evaluate(() => { const li = document.querySelector('.cart-line:not(.is-gift)'); return { plus: li.querySelector('.qty__plus').getAttribute('aria-disabled'), note: li.querySelector('[data-line-note]').textContent.trim() }; });
    record('Product: a tenth of one piece is refused, and says why', held === 9 && /^true: .*9 is the most/.test(said), `cart holds ${held}; plus off and said "${said.trim()}"`);
    record('Cart: the stepper stops at 9 and points to WhatsApp', line.plus === 'true' && /9 is the most/.test(line.note), `plus off: ${line.plus}; "${line.note}"`);
    record('Product: no pulse for a tap on a plus that is off', quiet === '', `asked for: ${quiet || 'none'}`);
    // Add to cart, then straight to another page: the request is finished anyway (keepalive).
    await page.context().request.post(at('cart/clear.js'));
    await page.goto(at('products/rose-crochet-bouquet-colour-test'), { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.locator('.pdp__add').click();
    await page.goto(at('pages/contact'), { waitUntil: 'commit' }).catch(() => {});
    await page.waitForTimeout(3000);
    const left = await page.context().request.get(at('cart.js')).then((r) => r.json()).then((c) => c.items.filter((i) => /colour test/.test(i.product_title)).length).catch(() => -1);
    record('Product: Add to cart then leaving at once still adds', left === 1, `lines of the piece in the cart: ${left}`);
    await page.context().request.post(at('cart/clear.js'));
    await browser.close();
  }

  // Without JavaScript the form still posts the chosen variant.
  {
    const { browser, page } = await visit(ROSE, PHONE, { js: false });
    const r = await page.evaluate(() => {
      const f = document.querySelector('[data-product-form]');
      const data = new FormData(f);
      return { id: data.get('id'), action: f.getAttribute('action'), photos: document.querySelectorAll('.gallery__img').length, bar: getComputedStyle(document.querySelector('.pdp__cta')).position === 'fixed' && document.querySelector('.pdp__add').getBoundingClientRect().bottom <= innerHeight };
    });
    record('Product, no JavaScript: form posts a variant', /^\d+$/.test(r.id || '') && /\/cart\/add/.test(r.action) && r.bar === true, `id ${r.id} to ${r.action}; ${r.photos} photos; buttons still pinned: ${r.bar}`);
    // In the cart, without JavaScript: a line says how many, and View cart is a plain link to the cart.
    await page.context().request.post(at('cart/add.js'), { data: { items: [{ id: +r.id, quantity: 2 }] } });
    await page.reload({ waitUntil: 'load' });
    const n = await page.evaluate(() => {
      const shown = (sel) => document.querySelector(sel).getClientRects().length > 0;
      return { note: shown('.pdp__cta .incart__note') ? document.querySelector('.pdp__cta .incart__note').textContent.trim() : '', stepper: shown('.pdp__cta .qty'), add: shown('.pdp__add'), href: document.querySelector('.pdp__cta .incart__view').getAttribute('href') };
    });
    record('Product, no JavaScript: in the cart says how many, links to the cart', /^2 in your cart/.test(n.note) && !n.stepper && !n.add && /\/cart$/.test(n.href), `"${n.note}"; stepper shown: ${n.stepper}; Add to cart shown: ${n.add}; View cart goes to ${n.href}`);
    await page.context().request.post(at('cart/clear.js'));
    await browser.close();
  }

  // Desktop: two columns, thumbnails, keyboard order, axe.
  {
    const { browser, page, errors } = await visit(ROSE, DESK);
    const d = await page.evaluate(() => {
      const g = document.querySelector('.pdp__gallery').getBoundingClientRect();
      const i = document.querySelector('.pdp__info').getBoundingClientRect();
      return { beside: i.left >= g.right - 1 && Math.abs(i.top - g.top) < 40, thumbs: document.querySelectorAll('.gallery__thumb').length, bar: getComputedStyle(document.querySelector('.pdp__cta')).position, sideways: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    await page.locator('.gallery__thumb').nth(1).click();
    await page.waitForTimeout(500);
    const count = await page.evaluate(() => document.querySelector('[data-gallery-count]').textContent);
    record('Product, desktop: two columns, thumbnails work', d.beside && d.thumbs >= 2 && d.bar !== 'fixed' && !d.sideways && count === '2', `beside: ${d.beside}, ${d.thumbs} thumbnails, second shows photo ${count}, buttons in the page: ${d.bar !== 'fixed'}`);
    // The photo stays in view while the details scroll (it is the shorter column).
    await page.evaluate(() => document.querySelector('.pdp__details').lastElementChild.scrollIntoView({ block: 'end' }));
    await page.waitForTimeout(300);
    const stuck = await page.evaluate(() => { const g = document.querySelector('.gallery__track').getBoundingClientRect(); return { y: Math.round(scrollY), top: Math.round(g.top), bottom: Math.round(g.bottom) }; });
    record('Product, desktop: the photo stays beside the details', stuck.bottom > 200 && stuck.top < 800, `scrolled ${stuck.y}px, photo from ${stuck.top}px to ${stuck.bottom}px`);
    // The buy box is one 48px row. The buy bar: off on arrival, on once Add to cart is scrolled past, off at the footer.
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    const barState = () => page.evaluate(() => {
      const bar = document.querySelector('.buybar'); const r = bar.getBoundingClientRect();
      return { on: bar.classList.contains('is-on'), shown: getComputedStyle(bar).visibility === 'visible' && r.top < innerHeight - 40, top: Math.round(r.top), h: Math.round(r.height) };
    });
    const row = await page.evaluate(() => {
      const box = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }; };
      return [box('.pdp__add'), box('.pdp__now-btn .shopify-payment-button__button--unbranded')];
    });
    const nowOff = await page.evaluate(() => { const btn = document.querySelector('.pdp__now-btn .shopify-payment-button__button--unbranded'); const range = document.createRange(); range.selectNodeContents(btn); const t = range.getBoundingClientRect(); const r = btn.getBoundingClientRect(); return Math.abs((t.top + t.bottom) / 2 - (r.top + r.bottom) / 2); });
    record('Product, desktop: "Buy it now" words in the middle of the button', nowOff <= 1, `${nowOff.toFixed(1)}px off centre`);
    record('Product, desktop: Add to cart and Buy it now on one 48px row', row.every((b) => b.h === 48 && Math.abs(b.top - row[0].top) <= 1 && b.w >= 128), row.map((b) => `${b.w} x ${b.h} at ${b.top}`).join(', '));
    const bar0 = await barState();
    await page.evaluate(() => scrollTo(0, document.querySelector('.pdp__add').getBoundingClientRect().bottom + scrollY + 40));
    await page.waitForTimeout(700);
    const bar1 = await barState();
    await page.locator('.buybar__add').click();
    await page.waitForTimeout(200);
    const barAdd = await page.evaluate(() => ({ toast: !!document.querySelector('.cart-toast:not([hidden])'), swapped: !!document.querySelector('.buybar.is-in .qty')?.getClientRects().length }));
    await page.waitForSelector('#CartDrawer .cart-line', { state: 'attached', timeout: 8000 }).catch(() => {});
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(700);
    const bar2 = await barState();
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(700);
    const bar3 = await barState();
    record('Product, desktop: buy bar only after Add to cart is scrolled past', !bar0.shown && bar1.shown && bar1.h <= 72 && !bar2.shown && !bar3.shown, `arrival: ${bar0.shown}; scrolled past: ${bar1.shown} (${bar1.h}px tall); at the footer: ${bar2.shown}; back at the top: ${bar3.shown}`);
    record('Product, desktop: Add to cart in the bar turns it into the stepper at once, no pop-up', !barAdd.toast && barAdd.swapped, `pop-up: ${barAdd.toast}, stepper in the bar within 200ms: ${barAdd.swapped}`);
    // In the cart now: the buy box is the stepper and View cart as two halves of one 48px row, and so is the bar.
    {
      const boxes = (scope) => page.evaluate((sc) => {
        const box = (sel) => { const el = document.querySelector(`${sc} ${sel}`); const r = el.getBoundingClientRect(); return el.getClientRects().length ? { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) } : null; };
        return { qty: box('.qty'), view: box('.incart__view'), add: box('[data-add]'), value: document.querySelector(`${sc} .qty__input`).value };
      }, scope);
      const inBox = await boxes('.pdp__buy');
      await page.evaluate(() => scrollTo(0, document.querySelector('[data-buy]').getBoundingClientRect().bottom + scrollY + 40));
      await page.waitForTimeout(700);
      const inBar = await boxes('.buybar');
      await page.locator('.buybar .qty__plus').click();
      await page.waitForTimeout(2500);
      const after = await page.evaluate(() => ({ bar: document.querySelector('.buybar .qty__input').value, box: document.querySelector('.pdp__buy .qty__input').value, line: document.querySelector('#CartDrawer .cart-line:not(.is-gift)')?.dataset.qty }));
      await page.evaluate(() => scrollTo(0, 0));
      record('Product, desktop: in the cart, stepper and View cart are two halves of one row', !!inBox.qty && !!inBox.view && !inBox.add && inBox.qty.h === 48 && inBox.view.h === 48 && inBox.qty.top === inBox.view.top && Math.abs(inBox.qty.w - inBox.view.w) <= 2, inBox.qty && inBox.view ? `stepper ${inBox.qty.w} x ${inBox.qty.h}, View cart ${inBox.view.w} x ${inBox.view.h}, Add to cart shown: ${!!inBox.add}` : 'the stepper or View cart is missing');
      record('Product, desktop: the bar has the stepper too, and it changes the cart', !!inBar.qty && !!inBar.view && !inBar.add && inBar.value === '1' && after.bar === '2' && after.box === '2' && after.line === '2', `bar stepper: ${!!inBar.qty}, View cart: ${!!inBar.view}, Add to cart: ${!!inBar.add}; after plus: bar ${after.bar}, buy box ${after.box}, cart ${after.line}`);
      // Out of the cart again, so the keyboard pass below meets Add to cart and Buy it now.
      await page.locator('.pdp__buy .qty__input').fill('0');
      await page.locator('.pdp__buy .qty__input').dispatchEvent('change');
      await page.waitForTimeout(2500);
    }
    await page.evaluate(() => scrollTo(0, 0));
    const circle = (sel) => page.evaluate((s) => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); const i = parseFloat(getComputedStyle(el, '::before').inset) || 0; return Math.round(r.width - i * 2); }, sel);
    const sizes = [await circle('.gallery [data-save]'), await circle('[data-share]')];
    record('Product, desktop: photo buttons are 44px circles', sizes.every((n) => n >= 44), `save ${sizes[0]}px, share ${sizes[1]}px`);
    // The look-closer button shows only for the keyboard; a click on the photo opens the viewer and Esc hands focus back to the photos.
    const lookOff = await page.evaluate(() => getComputedStyle(document.querySelector('.gallery__expand')).opacity);
    await page.locator('[data-gallery-track]').evaluate((t) => t.scrollTo({ left: 0, behavior: 'instant' }));
    await page.locator('.gallery__slide[data-first] .gallery__img').click({ position: { x: 300, y: 200 } });
    await page.waitForSelector('dialog.zoom[open]', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
    const byPhoto = await page.evaluate(() => !!document.querySelector('dialog.zoom')?.open);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const back = await page.evaluate(() => ({ track: document.activeElement?.matches('[data-gallery-track]'), look: getComputedStyle(document.querySelector('.gallery__expand')).opacity }));
    await page.locator('[data-gallery-track]').evaluate((t) => t.scrollTo({ left: 0, behavior: 'instant' }));
    await page.locator('.gallery__expand').click();
    await page.waitForSelector('dialog.zoom[open]', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
    const stepper = async () => page.evaluate(() => ({ count: document.querySelector('[data-zoom-count]')?.textContent, prev: document.querySelector('.zoom__arrow--prev')?.hidden, next: getComputedStyle(document.querySelector('.zoom__arrow--next')).display }));
    const z0 = await stepper();
    await page.locator('.zoom__arrow--next').click();
    await page.waitForTimeout(700);
    const z1 = await stepper();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(700);
    const z2 = await stepper();
    await page.keyboard.press('Escape');
    record('Product, desktop: viewer arrows and arrow keys', z0.count === '1' && z0.prev === true && z0.next !== 'none' && z1.count === '2' && z2.count === '1', `starts at ${z0.count} (no "previous": ${z0.prev}), arrow → ${z1.count}, left key → ${z2.count}`);
    const below = await page.evaluate(() => [...document.querySelectorAll('main > .shopify-section')].map((s) => s.id.split('__').pop()));
    record('Product: "You may also like" before the reviews', below.indexOf('related') > -1 && below.indexOf('related') < below.indexOf('reviews'), below.join(' → '));
    await page.evaluate(() => { scrollTo(0, 0); document.querySelector('#MainContent').focus(); });
    const order = [];
    let lookOn = 'not reached';
    for (let i = 0; i < 26; i++) {
      await page.keyboard.press('Tab');
      // With reduced motion every change still runs a 0.01ms transition, so the button is read a moment after it takes focus.
      lookOn = await page.evaluate(async (was) => {
        const el = document.activeElement;
        if (!el.matches('.gallery__expand')) return was;
        await new Promise((done) => setTimeout(done, 60));
        return getComputedStyle(el).opacity;
      }, lookOn);
      order.push(await page.evaluate(() => { const el = document.activeElement; return el.closest('.gallery__thumbs') ? 'thumb' : el.matches('[data-gallery-track]') ? 'photos' : el.matches('[data-save]') ? 'save' : el.matches('[data-share]') ? 'share' : el.matches('[data-zoom]') ? 'zoom' : el.matches('.pill__input') ? 'option' : el.closest('.qty') ? 'qty' : el.matches('.pdp__add') ? 'add' : el.closest('.pdp__now-btn') ? 'buy-now' : el.closest('.offer-terms') ? 'terms' : el.matches('[data-ask]') ? 'ask' : el.matches('summary') ? 'detail' : el.matches('.pdp__crumb') ? 'crumb' : 'other'; }));
    }
    record('Product, desktop: look-closer button only for the keyboard', lookOff === '0' && byPhoto && back.track && back.look === '0' && lookOn === '1', `hidden to a mouse: ${lookOff === '0'}; photo click opens the viewer: ${byPhoto}; focus back on the photos: ${back.track}, button still hidden: ${back.look === '0'}; shown when tabbed to: ${lookOn === '1' ? true : lookOn}`);
    const seen = [...new Set(order)];
    const rank = ['photos', 'option', 'add', 'buy-now', 'ask', 'detail'].map((k) => seen.indexOf(k));
    record('Product, keyboard: photos, options, buy, details in order', rank.every((n, i) => n > -1 && (i === 0 || n > rank[i - 1])), seen.join(' → '));
    await page.evaluate(() => scrollTo(0, 0));
    await page.addScriptTag({ content: axe.source });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
    record('Product: accessibility, desktop (axe)', v.length === 0 && errors.length === 0, (v.join(', ') || '0 violations') + (errors.length ? `; errors: ${errors.join(' | ')}` : ''));
    await browser.close();
  }

  // 200% text at 320px: nothing runs off the side, the buttons keep their words.
  {
    const { browser, page } = await visit(ROSE, { ...PHONE, viewport: { width: 320, height: 640 } });
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(400);
    const big = await page.evaluate(() => ({ sideways: document.documentElement.scrollWidth > innerWidth + 1, clipped: [...document.querySelectorAll('.pdp__add, .pill__label, .detail summary')].filter((el) => el.scrollWidth > el.clientWidth + 1).length }));
    record('Product: 200% text at 320px', !big.sideways && big.clipped === 0, `sideways scroll: ${big.sideways}, clipped controls: ${big.clipped}`);
    await browser.close();
  }
}

// 21. Phone menu (docs/nav-plan.md, "As built", 2026-10-04): Shop is the one open photo grid with "Shop all" in its
//     heading row; a later list of collections (Gifts) folds into a row with an arrow. Every link fits one
//     390 x 844 screen, a 360 x 740 phone scrolls a little, and no group links to the same place twice.
if (want('21')) {
  const menu = (page) => page.evaluate(() => {
    const d = document.querySelector('#MenuDrawer');
    const panel = d.querySelector('.drawer__panel');
    const sc = [d, panel].find((e) => e.scrollHeight > e.clientHeight + 1) || panel;
    const groups = [...d.querySelectorAll('.drawer__nav > ul > li')].map((li) => [...li.querySelectorAll('a')].map((a) => a.getAttribute('href')));
    const last = [...d.querySelectorAll('.drawer__secondary :is(a, button)')].filter((e) => e.offsetParent).pop();
    const all = d.querySelector('.drawer__shop-all');
    return {
      height: sc.scrollHeight,
      lastBottom: Math.round(last.getBoundingClientRect().bottom),
      grids: d.querySelectorAll('.drawer__tiles').length,
      tiles: d.querySelectorAll('.drawer__tiles > li').length,
      repeats: groups.filter((g) => new Set(g).size !== g.length).length,
      all: all ? Math.round(all.getBoundingClientRect().height) : 0,
      folded: [...d.querySelectorAll('.drawer__group')].map((g) => g.open),
      sideways: [...d.querySelectorAll('.drawer__nav *')].some((e) => e.getBoundingClientRect().right > panel.getBoundingClientRect().right + 1),
    };
  });
  for (const [w, h] of [[390, 844], [360, 740]]) {
    const { browser, page } = await open(chromium, { viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { reducedMotion: 'reduce' });
    await page.click('[data-menu-open]');
    await page.waitForTimeout(600);
    const m = await menu(page);
    if (h === 844) record('Menu, 390 × 844: every link on one screen', m.lastBottom <= h, `last link ends at ${m.lastBottom}px of ${h}; content ${m.height}px`);
    else record('Menu, 360 × 740: a short scroll at most', m.height - h <= 160, `${m.height - h}px to scroll (content ${m.height}px)`);
    if (h === 844) {
      record('Menu: one photo grid, the rest folded', m.grids === 1 && m.folded.length >= 1 && m.folded.every((o) => !o), `grids: ${m.grids} (${m.tiles} tiles), folded groups open: ${m.folded.join(', ') || 'none found'}`);
      record('Menu: no link twice in a group, Shop all 44px', m.repeats === 0 && m.all >= 44, `groups with a repeat: ${m.repeats}, Shop all link: ${m.all}px tall`);
      await page.addScriptTag({ content: axe.source });
      const run = () => page.evaluate(async () => (await window.axe.run('#MenuDrawer', { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      const v1 = await run();
      // Keyboard: Enter on the folded row opens it and its links can be reached; Esc closes the menu, focus returns.
      await page.focus('.drawer__group summary');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      const opened = await page.evaluate(() => { const g = document.querySelector('.drawer__group'); return { open: g.open, links: [...g.querySelectorAll('.drawer__sub a')].filter((a) => a.offsetHeight >= 44).length }; });
      // Opened, a list of collections is pills (2026-10-07): a few to a line, so Gifts takes about a third of the height of rows.
      const pills = await page.evaluate(() => {
        const ul = document.querySelector('#MenuDrawer .drawer__sub--pills');
        if (!ul) return null;
        const box = ul.getBoundingClientRect();
        const as = [...ul.querySelectorAll('a')].map((a) => a.getBoundingClientRect());
        return { count: as.length, height: Math.round(box.height), lines: new Set(as.map((r) => Math.round(r.top))).size, short: as.filter((r) => r.height < 44).length, wide: as.filter((r) => r.right > box.right + 1 || r.left < box.left - 1).length };
      });
      record('Menu: Gifts opens as pills, several to a line', !!pills && pills.count >= 2 && pills.lines < pills.count && pills.height <= 220 && pills.short === 0 && pills.wide === 0, pills ? `${pills.count} pills on ${pills.lines} lines, ${pills.height}px tall (limit 220), under 44px: ${pills.short}, wider than the list: ${pills.wide}` : 'no pill list found');
      const v2 = await run();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
      const back = await page.evaluate(() => !document.querySelector('#MenuDrawer').open && document.activeElement?.matches('[data-menu-open]'));
      record('Menu: Enter opens Gifts, Esc returns to the button', opened.open && opened.links >= 2 && back, `opened: ${opened.open}, links 44px or taller: ${opened.links}, focus back on the menu button: ${back}`);
      record('Menu: accessibility, folded and open (axe)', v1.length === 0 && v2.length === 0, [...v1, ...v2].join(', ') || '0 violations');
    }
    await browser.close();
  }
  // The lower list (2026-10-07): Saved items and Custom & bulk orders are two tiles of one height side by side under
  // the account row; the heart is filled once something is saved and the count shows.
  for (const w of [390, 360]) {
    const { browser, page } = await open(chromium, { viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { reducedMotion: 'reduce', init: () => { try { localStorage.setItem('yb-saved', JSON.stringify(['a-saved-piece'])); } catch {} } });
    await page.click('[data-menu-open]');
    await page.waitForTimeout(600);
    const t = await page.evaluate(() => {
      const d = document.querySelector('#MenuDrawer');
      const tiles = [...d.querySelectorAll('.drawer__quick > a')].map((a) => a.getBoundingClientRect());
      const count = d.querySelector('.drawer__quick [data-saved-count]');
      const panel = d.querySelector('.drawer__panel').getBoundingClientRect();
      return {
        n: tiles.length,
        row: new Set(tiles.map((r) => Math.round(r.top))).size === 1,
        heights: [...new Set(tiles.map((r) => Math.round(r.height)))],
        inside: tiles.every((r) => r.left >= panel.left && r.right <= panel.right + 1),
        heart: getComputedStyle(d.querySelector('.drawer__quick .icon__fill')).fill,
        count: count && !count.hidden ? count.textContent : '',
      };
    });
    record(`Menu, ${w}px: two tiles of one height under the account row`, t.n === 2 && t.row && t.heights.length === 1 && t.heights[0] >= 48 && t.inside && t.heart !== 'none' && t.count === '1', `${t.n} tiles, one row: ${t.row}, heights: ${t.heights.join(', ')}px, inside the panel: ${t.inside}, heart fill: ${t.heart}, count: "${t.count}"`);
    await browser.close();
  }
  // A folding list opens and closes in one smooth move (2026-10-07): what is below it moves only as much as the
  // list's own height changes, frame by frame. A margin escaping the folding box shows up as a step here.
  {
    const { browser, page } = await open(chromium, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.click('[data-menu-open]');
    await page.waitForTimeout(1200);
    const steps = await page.evaluate(async () => {
      const below = document.querySelector('#MenuDrawer .drawer__secondary');
      const out = [];
      for (const g of document.querySelectorAll('#MenuDrawer .drawer__group')) {
        for (let k = 0; k < 2; k++) {
          g.querySelector('summary').scrollIntoView({ block: 'center' });
          await new Promise((r) => setTimeout(r, 200));
          const rows = [];
          let on = true;
          const tick = () => { const top = g.getBoundingClientRect().top; rows.push([g.getBoundingClientRect().height, below.getBoundingClientRect().top - top]); if (on) requestAnimationFrame(tick); };
          requestAnimationFrame(tick);
          g.querySelector('summary').click();
          await new Promise((r) => setTimeout(r, 900));
          on = false;
          const step = Math.max(...rows.map((r, i) => (i ? Math.abs(Math.abs(r[1] - rows[i - 1][1]) - Math.abs(r[0] - rows[i - 1][0])) : 0)));
          out.push({ name: g.querySelector('summary').textContent.trim(), open: g.open, moved: Math.abs(rows.at(-1)[0] - rows[0][0]) > 20, step: Math.round(step * 10) / 10 });
        }
      }
      return out;
    });
    record('Menu: folding lists open and close without a jump', steps.length > 0 && steps.every((s) => s.moved && s.step <= 1), steps.map((s) => `${s.name} ${s.open ? 'opening' : 'closing'}: ${s.step}px step`).join(', ') || 'no folding list found');
    await browser.close();
  }
  // Desktop: the photo panels stay on screen at the narrowest desktop layout (1100px) and the page never scrolls sideways.
  for (const w of [1100, 1280]) {
    const { browser, page } = await open(chromium, { viewport: { width: w, height: 800 } }, { reducedMotion: 'reduce' });
    const d = await page.evaluate(() => ({ sideways: document.documentElement.scrollWidth - innerWidth, past: [...document.querySelectorAll('.site-header__sub')].filter((s) => s.getBoundingClientRect().right > innerWidth).length }));
    record(`Menu, desktop ${w}px: panels stay on screen`, d.sideways <= 1 && d.past === 0, `sideways scroll: ${d.sideways}px, panels past the edge: ${d.past}`);
    await browser.close();
  }
  // 200% text on a 360px phone: the grid drops a column and nothing runs off the side.
  {
    const { browser, page } = await open(chromium, { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { reducedMotion: 'reduce' });
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.click('[data-menu-open]');
    await page.waitForTimeout(600);
    const m = await menu(page);
    record('Menu: 200% text', !m.sideways, `anything past the panel's edge: ${m.sideways}`);
    await browser.close();
  }
}

// 22. Level cards (docs/decisions.md, 2026-10-06): in every product list, cards that share a row (or a swipe row) are
//     one height and their prices sit on one line, whether a name takes one line or two. No name takes more than
//     two lines, a row of short names carries no empty line, phone grids have 24px between rows, and in the cart
//     every row's prices are the same distance (30 to 40px) from the next row's heading.
if (want('22')) {
  const site = (path) => new globalThis.URL(path, URL).href;
  const tagged = (p, tag) => [].concat(p.tags).join(',').includes(tag);
  const products = await fetch(site('/products.json?limit=250')).then((r) => r.json()).then((d) => d.products.filter((p) => p.variants[0].available && !tagged(p, 'free-gift') && !tagged(p, 'test-product')), () => []);
  const byLength = [...products].sort((x, y) => x.title.length - y.title.length);
  const collection = await fetch(site('/collections.json')).then((r) => r.json()).then((d) => d.collections.sort((x, y) => y.products_count - x.products_count)[0]?.handle, () => null);
  const enough = byLength.length >= 8 && collection;
  if (!enough) console.log('SKIP  Level cards                                    too few products in the store (import tools/test-products.csv)');
  // Short and long names side by side, so a mixed row is certain.
  const mixed = enough ? [byLength[0], byLength.at(-1), byLength[1], byLength.at(-2), byLength[2]].map((p) => p.handle) : [];
  const viewed = enough ? [byLength[5], byLength.at(-4), byLength[6], byLength.at(-5)].map((p) => p.handle) : [];
  const seeded = `(${(s, v) => { try { if (!localStorage.getItem('yb-check-level')) { localStorage.setItem('yb-check-level', '1'); localStorage.setItem('yb-saved', JSON.stringify(s)); localStorage.setItem('yb-recent-products', JSON.stringify(v)); } } catch {} }})(${JSON.stringify(mixed)}, ${JSON.stringify(viewed)})`;
  const measure = (root) => {
    const R = (e) => e.getBoundingClientRect();
    const scope = document.querySelector(root) || document;
    const lists = [...scope.querySelectorAll('ul')].filter((u) => u.querySelector(':scope > li :is(.card--compact, .extra__title)') && R(u).width > 0 && R(u).height > 0);
    const out = { rows: 0, cards: 0, unevenHeight: 0, unevenPrice: 0, over2: 0, holes: 0, gaps: [], sideways: document.documentElement.scrollWidth > innerWidth + 1 };
    for (const u of lists) {
      const lis = [...u.children].filter((l) => l.querySelector('.price') && R(l).width > 0);
      const byTop = new Map();
      lis.forEach((l) => { const t = Math.round(R(l).top); byTop.set(t, [...(byTop.get(t) || []), l]); });
      if (byTop.size > 1) out.gaps.push(getComputedStyle(u).rowGap);
      for (const group of byTop.values()) {
        const name = (l) => l.querySelector('.card__title, .extra__title');
        const lines = group.map((l) => Math.round(R(name(l)).height / parseFloat(getComputedStyle(name(l)).lineHeight)));
        const heights = group.map((l) => R(l).height);
        const prices = group.map((l) => R(l.querySelector('.price')).top);
        out.rows++;
        out.cards += group.length;
        if (Math.max(...heights) - Math.min(...heights) > 1) out.unevenHeight++;
        if (Math.max(...prices) - Math.min(...prices) > 1) out.unevenPrice++;
        out.over2 += lines.filter((n) => n > 2).length;
        if (Math.max(...lines) === 1 && group.some((l) => R(l.querySelector('.price')).top - R(name(l)).bottom > 10)) out.holes++;
      }
    }
    out.gaps = [...new Set(out.gaps)];
    return out;
  };
  const phone = (w) => ({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const places = enough ? [['home', '/'], ['collection', `/collections/${collection}`], ['search results', '/search?q=crochet'], ['Saved page', '/pages/saved'], ['product page rows', `/products/${byLength.at(-3).handle}`]] : [];
  for (const w of enough ? [360, 390] : []) {
    for (const [name, path] of places) {
      const { browser, page } = await open(chromium, phone(w), { reducedMotion: 'reduce', path, init: seeded });
      await scrollWholePage(page);
      const m = await page.evaluate(measure, 'main');
      const grid = name === 'product page rows' || m.gaps.every((g) => g === '24px');
      record(`Level cards, ${name} ${w}px`, m.rows > 0 && m.unevenHeight === 0 && m.unevenPrice === 0 && m.over2 === 0 && m.holes === 0 && grid && !m.sideways, `${m.cards} cards in ${m.rows} rows; uneven height: ${m.unevenHeight}, prices off the line: ${m.unevenPrice}, names over two lines: ${m.over2}, empty lines under short names: ${m.holes}, row gap: ${m.gaps.join(', ') || 'one row'}`);
      await browser.close();
    }
    // The cart's three rows, with short and long names saved and viewed.
    const { browser, page } = await open(chromium, phone(w), { reducedMotion: 'reduce', init: seeded });
    await page.request.post(site('/cart/clear.js'));
    await page.request.post(site('/cart/add.js'), { data: { items: [{ id: byLength[3].variants[0].id, quantity: 1 }] } });
    await page.goto(site('/'), { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await page.click('.site-header__cart');
    await page.waitForSelector('#CartDrawer [data-cart-recent]:not([hidden])', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const m = await page.evaluate(measure, '#CartDrawer');
    const under = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#CartDrawer .cart-row:not([hidden])')];
      return rows.slice(0, -1).map((r, i) => Math.round(rows[i + 1].querySelector('h2').getBoundingClientRect().top - Math.max(...[...r.querySelectorAll('.price')].map((p) => p.getBoundingClientRect().bottom))));
    });
    record(`Level cards, cart rows ${w}px`, m.rows === 3 && m.unevenHeight === 0 && m.unevenPrice === 0 && m.over2 === 0 && under.length > 0 && under.every((g) => g >= 30 && g <= 40) && Math.max(...under) - Math.min(...under) <= 2, `${m.cards} cards in ${m.rows} rows; uneven height: ${m.unevenHeight}, prices off the line: ${m.unevenPrice}, price to the next heading: ${under.join(', ') || 'none'}px`);
    await page.request.post(site('/cart/clear.js'));
    await browser.close();
  }
}

// 23. Contact page (docs/contact-plan.md): axe on the page as it opens and with every message showing; nothing runs
//     off a 320px screen; every control is 44px tall with 16px text; an empty send goes nowhere, names each wrong
//     field and puts focus on the first; the topic is a row of pills that work as one radio group; no phone number
//     or hours on the page; the order number shows only for the topics that have one; a link with
//     ?topic=&order=&about= arrives filled in; without JavaScript every field is there and the form still posts.
//     Nothing is sent: a real send emails the shop, so that is tried by hand.
if (want('23')) {
  const path = (more = '') => `/pages/contact?view=contact${more}`;
  const axeRun = async (page) => {
    await page.addScriptTag({ content: axe.source });
    return page.evaluate(async () => (await window.axe.run(document.querySelector('main'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  };
  for (const [label, device] of [['phone 360', { ...devices['Pixel 7'], viewport: { width: 360, height: 800 } }], ['phone 320', { ...devices['Pixel 7'], viewport: { width: 320, height: 640 } }], ['desktop 1280', { viewport: { width: 1280, height: 900 } }]]) {
    const { browser, page, errors } = await open(chromium, device, { reducedMotion: 'reduce', path: path() });
    if (!(await page.locator('[data-contact-form]').count())) { record(`Contact, ${label}`, false, 'no contact form on /pages/contact'); await browser.close(); continue; }
    const v0 = await axeRun(page);
    const m = await page.evaluate(() => {
      const controls = [...document.querySelectorAll('.contact a, .contact button, .contact input:not([type="radio"]), .contact textarea, .contact-pill')].filter((el) => el.getBoundingClientRect().width);
      // A link inside a sentence is measured with its line, as WCAG 2.5.8 does.
      const small = controls.filter((el) => !el.closest('p') && el.getBoundingClientRect().height < 44).map((el) => el.id || el.textContent.trim().slice(0, 20));
      const fields = [...document.querySelectorAll('.contact__field :is(input:not([type="radio"]), textarea)')];
      const pills = [...document.querySelectorAll('.contact-pill')];
      const text = document.querySelector('.contact').innerText;
      return { sideways: document.documentElement.scrollWidth > innerWidth + 1, small, tiny: fields.filter((f) => parseFloat(getComputedStyle(f).fontSize) < 16).length, unlabelled: fields.filter((f) => !f.labels.length).length,
        pills: pills.length, pillsOut: pills.filter((el) => el.getBoundingClientRect().right > innerWidth - 16).length, number: /\+91|\d{5} ?\d{5}/.test(text), hours: /\d ?[ap]m\b/i.test(text),
        h1: document.querySelectorAll('main h1').length, order: !document.querySelector('[data-order]').closest('[hidden]'), faq: !!document.querySelector('main .faq') };
    });
    record(`Contact, ${label}: fits, one heading, quick answers`, !m.sideways && m.h1 === 1 && m.faq, `sideways: ${m.sideways}, h1: ${m.h1}, quick answers: ${m.faq}`);
    record(`Contact, ${label}: controls 44px, fields 16px and labelled`, m.small.length === 0 && m.tiny === 0 && m.unlabelled === 0, `under 44px: ${m.small.join(', ') || 'none'}; under 16px: ${m.tiny}; no label: ${m.unlabelled}`);
    record(`Contact, ${label}: six topic pills inside the card, no number or hours on the page`, m.pills === 6 && m.pillsOut === 0 && !m.number && !m.hours, `${m.pills} pills, ${m.pillsOut} past the edge; a phone number: ${m.number}; hours: ${m.hours}`);
    // An empty send.
    const before = page.url();
    await page.locator('[data-send]').click();
    await page.waitForTimeout(400);
    const e = await page.evaluate(() => {
      const wrong = [...document.querySelectorAll('.contact [aria-invalid="true"]')];
      return { focus: document.activeElement.id, wrong: wrong.map((f) => f.id), told: wrong.every((f) => { const out = document.getElementById(`${f.id}-error`); return out && !out.hidden && out.textContent.trim() && f.getAttribute('aria-describedby').includes(out.id); }) };
    });
    // Back to the top first: lower down the sticky header covers part of a row, and axe counts that as a small target.
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    const v1 = await axeRun(page);
    record(`Contact, ${label}: an empty send names each wrong field`, page.url() === before && e.focus === 'Contact-name' && e.wrong.length === 4 && e.told, `stayed: ${page.url() === before}; focus on ${e.focus}; wrong: ${e.wrong.join(', ')}; each told: ${e.told}`);
    // A fixed field loses its message as it is typed.
    await page.locator('#Contact-name').fill('Asha');
    const cleared = await page.evaluate(() => !document.getElementById('Contact-name').hasAttribute('aria-invalid') && document.getElementById('Contact-name-error').hidden);
    // The order number follows the topic.
    const shown = async (key) => page.evaluate((k) => { document.querySelector(`[data-topic] input[data-key="${k}"]`).closest('label').click(); return { told: document.getElementById('Contact-topic-error').hidden, order: !document.querySelector('[data-order]').closest('[hidden]'), note: !document.querySelector('[data-topic-note]').hidden }; }, key);
    const [o, d, x] = [await shown('order'), await shown('damaged'), await shown('else')];
    // The pills are one radio group: an arrow key moves the choice.
    await page.locator('[data-topic] input[data-key="order"]').focus();
    await page.keyboard.press('ArrowRight');
    const arrow = await page.evaluate(() => document.querySelector('[data-topic] input:checked').dataset.key);
    record(`Contact, ${label}: messages clear, order number follows the topic`, cleared && o.told && arrow === 'custom' && !m.order && o.order && !o.note && d.order && d.note && !x.order && !x.note, `cleared: ${cleared}, topic message gone once picked: ${o.told}; right arrow from the first pill picks "${arrow}"; order number at first: ${m.order}, order help: ${o.order}, damaged: ${d.order} (video note: ${d.note}), something else: ${x.order}`);
    record(`Contact, ${label} (axe, as it opens and with messages)`, v0.length === 0 && v1.length === 0 && errors.length === 0, `${v0.join(', ') || '0 violations'}; ${v1.join(', ') || '0 violations'}${errors.length ? `; errors: ${errors[0]}` : ''}`);
    await browser.close();
  }
  {
    // Arriving from a link elsewhere in the shop.
    const { browser, page } = await open(chromium, devices['Pixel 7'], { reducedMotion: 'reduce', path: path('&topic=order&order=1042&about=Rose%20%26%20Daisy') });
    const f = await page.evaluate(() => ({ topic: document.querySelector('[data-topic] input:checked')?.dataset.key, order: document.querySelector('[data-order]').value, shown: !document.querySelector('[data-order]').closest('[hidden]'), body: document.querySelector('[data-body]').value, left: document.querySelector('[data-left]').textContent.trim() }));
    record('Contact: a link with a topic arrives filled in', f.topic === 'order' && f.order === '1042' && f.shown && /Rose & Daisy/.test(f.body) && /^\d+ left$/.test(f.left) && !/^1000/.test(f.left), `topic ${f.topic}, order "${f.order}" (shown: ${f.shown}), message "${f.body.trim()}", "${f.left}"`);
    const wa = await page.evaluate(() => [...document.querySelectorAll('.contact a[href*="wa.me"]')].map((a) => decodeURIComponent(a.href.split('text=')[1] || '').replace(/\+/g, ' ')));
    if (wa.length) record('Contact: WhatsApp links say what they are about', wa.length === 4 && wa.some((t) => /custom or bulk/.test(t)) && wa.filter((t) => /damaged/.test(t)).length === 2 && wa.every((t) => t.length > 10 && !/&#/.test(t)), `${wa.length} links: ${wa.map((t) => `"${t.slice(0, 34)}…"`).join(', ')}`);
    else record('Contact: WhatsApp links say what they are about', true, 'no WhatsApp number set: skipped');
    await browser.close();
  }
  {
    // Without JavaScript.
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ ...devices['Pixel 7'], javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(new globalThis.URL(path(), URL).href, { waitUntil: 'load' });
    const n = await page.evaluate(() => { const form = document.querySelector('[data-contact-form]'); return { fields: [...form.querySelectorAll('input:not([type="hidden"]):not([type="radio"]), textarea')].filter((f) => f.getBoundingClientRect().height > 0).length, pills: form.querySelectorAll('input[type="radio"][required]').length, action: form.getAttribute('action'), method: form.method, native: !form.noValidate }; }).catch(() => null);
    record('Contact: works without JavaScript', !!n && n.fields === 4 && n.pills === 6 && /\/contact/.test(n.action) && n.method === 'post' && n.native, n ? `${n.fields} fields and ${n.pills} topic pills shown, posts to ${n.action}, browser's own checks: ${n.native}` : 'no form');
    await browser.close();
  }
}

// Money (tools/money-check.mjs, docs/decisions.md 2026-10-05): every price shown is the store's and follows the price
// rule, nothing that isn't for sale is listed, and the cart charges what the page said. Its own lines print above ours.
// 24. Collection page (docs/collection-plan.md): 2 / 3 / 4 across with nothing running off the screen; on a phone the
//     first product is on the first screen and Filter and Sort float at the thumb; a price filter chosen in the sheet
//     narrows the list in place, is one step Back, and leaves focus where it was; Sort is our own list (a sheet on
//     phones, a drop-down on desktop), never the browser's, and a tap on Filter or Sort never moves the page; "Load more"
//     adds the next page with no repeats and coming Back from a product keeps the cards and the place; no focused
//     card hides under the floating pill or the sticky bar; on desktop the bar's drop-down works by mouse and keys
//     and the bar moves with the header; a filtered page is kept out of search engines; without JavaScript every
//     choice is still a link or a form. Uses the price filter only, which every store has.
if (want('24')) {
  const site = (path) => new globalThis.URL(path, URL).href;
  const shop = '/collections/shop';
  const axeRun = async (page) => {
    await page.addScriptTag({ content: axe.source });
    // The floating pill always lies over some card as the list runs under it; a heart it covers is reached by scrolling, so that one is not a small target.
    return page.evaluate(async () => {
      const pill = document.querySelector('.cf-float')?.getBoundingClientRect();
      const under = (sel) => { const r = document.querySelector(sel)?.getBoundingClientRect(); return !!r && !!pill && pill.height > 0 && r.bottom > pill.top && r.top < pill.bottom && r.right > pill.left && r.left < pill.right; };
      const found = (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations;
      return found.map((x) => ({ id: x.id, nodes: x.id === 'target-size' ? x.nodes.filter((n) => !under(n.target[0])) : x.nodes })).filter((x) => x.nodes.length).map((x) => `${x.id} (${x.nodes.length}: ${x.nodes[0].target})`);
    });
  };
  const cards = (page) => page.evaluate(() => [...document.querySelectorAll('[data-collection-grid] > li')].map((li) => ({ href: li.querySelector('a').pathname, price: +li.querySelector('.price').textContent.match(/₹\s*([\d,]+)/)[1].replace(/,/g, '') })));
  const settle = (page) => page.waitForFunction(() => !document.querySelector('[data-collection].is-busy'), null, { timeout: 15000 }).then(() => page.waitForTimeout(700));
  const phone = (width, height = 780) => ({ ...devices['Pixel 7'], viewport: { width, height } });

  // Columns and edges at every width.
  for (const [w, cols] of [[320, 2], [360, 2], [768, 3], [1100, 4], [1280, 4], [1440, 4]]) {
    const { browser, page, errors } = await open(chromium, w < 768 ? phone(w) : { viewport: { width: w, height: 900 } }, { reducedMotion: 'reduce', path: shop });
    const m = await page.evaluate(() => {
      const media = [...document.querySelectorAll('[data-collection-grid] .card__media')].map((el) => el.getBoundingClientRect());
      const shown = (sel) => { const el = document.querySelector(sel); return !!el && el.getBoundingClientRect().height > 0; };
      return { cols: media.filter((r) => Math.abs(r.top - media[0].top) < 2).length, first: Math.round(media[0].top + scrollY), photo: Math.round(media[0].width), n: media.length,
        sideways: document.documentElement.scrollWidth > innerWidth + 1, bar: shown('.cf-bar'), pill: shown('.cf-float'), h1: document.querySelectorAll('main h1').length, crafts: document.querySelectorAll('.cf-craft').length };
    });
    const right = w < 768 ? m.pill && !m.bar && m.first <= (w === 360 ? 235 : 250) : m.bar && !m.pill && (w < 1280 || m.photo >= 270);
    record(`Collection ${w}px: ${cols} across, fits`, m.cols === cols && m.n === 24 && !m.sideways && m.h1 === 1 && m.crafts >= 2 && right && errors.length === 0, `${m.cols} across, ${m.n} cards, photo ${m.photo}px, first product at ${m.first}px, bar: ${m.bar}, pill: ${m.pill}, sideways: ${m.sideways}${errors.length ? `, errors: ${errors[0]}` : ''}`);
    await browser.close();
  }

  {
    // Phone: the sheet, a filter, Back and Forward, Sort.
    const { browser, page, errors } = await open(chromium, phone(360), { reducedMotion: 'reduce', path: shop });
    const v0 = await axeRun(page);
    const whole = +(await page.evaluate(() => document.querySelector('[data-region="count"]').textContent.match(/\d+/)[0]));
    const pill = await page.evaluate(() => { const r = document.querySelector('.cf-float').getBoundingClientRect(); return { inView: r.top > innerHeight / 2 && r.bottom <= innerHeight, h: Math.round(r.height), names: [...document.querySelectorAll('.cf-float__btn')].map((b) => b.textContent.trim().replace(/\s+/g, ' ')) }; });
    await page.locator('[data-sheet-open="CollectionFilters"]').click();
    await page.waitForTimeout(500);
    const opened = await page.evaluate(() => { const d = document.getElementById('CollectionFilters'); return { open: d.open, modal: d.matches(':modal'), focusIn: d.contains(document.activeElement), small: [...d.querySelectorAll('a, button, summary')].filter((el) => { const h = el.getBoundingClientRect().height; return h > 0 && h < 44; }).length,
      heads: [...d.querySelectorAll('.cf-acc__head')].map((h) => h.textContent.trim().replace(/\s+/g, ' ')), openGroups: d.querySelectorAll('details[open]').length, scrolls: d.querySelector('[data-region="sheet"]').scrollHeight > d.querySelector('[data-region="sheet"]').clientHeight + 1, top: Math.round(d.getBoundingClientRect().top) }; });
    // The groups open one at a time; the choices are tick boxes (several) or radio buttons (one), and the heading says what is applied.
    await page.locator('#CollectionFilters [data-key="acc-filter.p.m.custom.occasion"]').click();
    const box = page.locator('#CollectionFilters [data-dd="sheet:filter.p.m.custom.occasion"] a.cf-row').first();
    const boxName = (await box.locator('.cf-row__name').textContent()).trim();
    await box.focus();
    await page.keyboard.press('Space');
    await settle(page);
    const ticked = await page.evaluate(() => { const g = document.querySelector('#CollectionFilters [data-dd="sheet:filter.p.m.custom.occasion"]'); const a = document.activeElement; const rows = [...g.querySelectorAll('.cf-row')];
      return { open: g.open, role: a.getAttribute('role'), checked: a.getAttribute('aria-checked'), inGroup: g.contains(a), now: g.querySelector('.cf-acc__now').textContent.trim(), group: g.querySelector('.cf-rows').getAttribute('role'), named: !!g.querySelector('.cf-rows').getAttribute('aria-label'), small: rows.filter((r) => r.getBoundingClientRect().height < 44).length, narrow: rows.filter((r) => r.getBoundingClientRect().width < 130).length, cols: new Set(rows.map((r) => Math.round(r.getBoundingClientRect().left))).size, tops: new Set(rows.map((r) => Math.round(r.getBoundingClientRect().top))).size, n: rows.length, counts: g.querySelectorAll('.cf-row__count').length,
        downFirst: rows.length > 2 && rows[1].getBoundingClientRect().left === rows[0].getBoundingClientRect().left && rows[1].getBoundingClientRect().top > rows[0].getBoundingClientRect().top, scrolls: g.closest('[data-region="sheet"]').scrollHeight > g.closest('[data-region="sheet"]').clientHeight + 1 }; });
    const v6 = await axeRun(page);
    await page.keyboard.press('Space');
    await settle(page);
    const unticked = await page.evaluate(() => ({ checked: document.activeElement.getAttribute('aria-checked'), url: location.search }));
    await page.locator('#CollectionFilters [data-key="acc-filter.v.price"]').click();
    await page.waitForTimeout(300);
    const one = await page.evaluate(() => [...document.querySelectorAll('#CollectionFilters details[open]')].map((d) => d.dataset.dd));
    await page.locator('#CollectionFilters [data-key="price-any"]').focus();
    await page.keyboard.press('ArrowDown');
    const arrow = await page.evaluate(() => ({ key: document.activeElement.dataset.key, role: document.activeElement.getAttribute('role'), any: document.querySelector('#CollectionFilters [data-key="price-any"]').getAttribute('aria-checked'), url: location.search }));
    record('Collection, phone: the sheet opens short, one group at a time', opened.heads.length >= 3 && opened.heads.every((h) => /(Any|All)$/.test(h)) && opened.openGroups === 0 && !opened.scrolls && opened.top > 200 && one.length === 1 && one[0] === 'sheet:filter.v.price',
      `${opened.heads.join(' | ')}; open at first: ${opened.openGroups}; scrolls: ${opened.scrolls}; sheet starts at ${opened.top}px of 780; after opening a second group, open: ${one.join()}`);
    record('Collection, phone: tick boxes and radio buttons', ticked.open && ticked.role === 'checkbox' && ticked.checked === 'true' && ticked.inGroup && ticked.now === boxName && ticked.group === 'group' && ticked.named && ticked.small === 0 && ticked.narrow === 0 && ticked.cols === 2 && ticked.tops === Math.ceil(ticked.n / 2) && ticked.downFirst && ticked.counts === 0 && !ticked.scrolls && unticked.checked === 'false' && unticked.url === '' && arrow.key === 'price-0' && arrow.role === 'radio' && arrow.any === 'true' && arrow.url === '' && v6.length === 0,
      `Space ticks "${boxName}": ${ticked.role} ${ticked.checked}, group stays open: ${ticked.open}, heading says "${ticked.now}", rows under 44px: ${ticked.small}, ${ticked.n} choices in ${ticked.cols} columns and ${ticked.tops} rows, read down first: ${ticked.downFirst}, numbers beside them: ${ticked.counts}; Space again: ${unticked.checked}; arrow down from "Any price": focus on ${arrow.key} (${arrow.role}), nothing applied: ${arrow.url === ''}; ${v6.length} violations${v6.length ? `: ${v6.join('; ')}` : ''}`);
    // Price bands follow the prices: only those in use show, and the last one has no upper end.
    const bands = await page.evaluate(() => [...document.querySelectorAll('#CollectionFilters [data-dd="sheet:filter.v.price"] a.cf-row')].map((r) => ({ name: r.textContent.trim(), q: new URL(r.href).search })));
    const lastBand = bands[bands.length - 1];
    record('Collection: price bands in use only, the last open-ended', bands.length >= 3 && bands.length <= 6 && bands[0].q === '' && /lte=/.test(bands[1].q) && !/gte=/.test(bands[1].q) && /gte=/.test(lastBand.q) && !/lte=/.test(lastBand.q) && /above/.test(lastBand.name), bands.map((b) => `${b.name} (${b.q || 'none'})`).join(' | '));
    const v1 = await axeRun(page);
    const preset = page.locator('#CollectionFilters [data-key="price-0"]');
    await preset.click();
    await settle(page);
    const list = await cards(page);
    const f = await page.evaluate(() => ({ url: location.search, open: document.getElementById('CollectionFilters').open, focus: document.activeElement.dataset.key, current: document.activeElement.getAttribute('aria-checked'), group: document.querySelector('#CollectionFilters [data-dd="sheet:filter.v.price"]').open,
      show: document.querySelector('#CollectionFilters [data-key="show"]').textContent.trim(), count: document.querySelector('[data-region="count"]').textContent.trim(), said: document.querySelector('[data-collection-status]').textContent.trim() }));
    const total = +f.count.match(/\d+/)[0];
    record('Collection, phone: Filter and Sort float at the thumb', pill.inView && pill.h >= 44 && pill.names.length === 2 && /Filter/.test(pill.names[0]) && /Sort/.test(pill.names[1]), `in view: ${pill.inView}, ${pill.h}px tall, "${pill.names.join('" "')}"`);
    record('Collection, phone: the sheet is a modal with focus inside', opened.open && opened.modal && opened.focusIn && opened.small === 0, `open: ${opened.open}, modal: ${opened.modal}, focus inside: ${opened.focusIn}, controls under 44px: ${opened.small}`);
    record('Collection, phone: a price filter narrows in place', /filter\.v\.price\.lte=199/.test(f.url) && f.open && list.length > 0 && total < whole && list.every((c) => c.price < 200) && f.focus === 'price-0' && f.current === 'true' && f.group && f.show.includes(String(total)) && list.length === Math.min(24, total) && f.said === f.count,
      `${f.url}; sheet open: ${f.open}; ${list.length} cards, dearest ₹${Math.max(...list.map((c) => c.price))}; focus on ${f.focus}; "${f.show}"; said "${f.said}"`);
    await page.locator('#CollectionFilters [data-key="show"]').click();
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => ({ open: document.getElementById('CollectionFilters').open, focus: document.activeElement.dataset.key, badge: document.querySelector('.cf-float .cf-badge')?.textContent.trim(), tags: [...document.querySelectorAll('.cf-tag')].map((a) => a.textContent.trim()) }));
    const robots = (await fetch(site(`${shop}?filter.v.price.lte=199`)).then((r) => r.text())).match(/<meta name="robots" content="([^"]*)"/)?.[1];
    const v2 = await axeRun(page);
    record('Collection, phone: closing shows what is applied', !closed.open && closed.focus === 'open' && closed.badge === '1' && closed.tags.length === 1 && /Under ₹200/.test(closed.tags[0]), `open: ${closed.open}, focus on ${closed.focus}, badge ${closed.badge}, chips: ${closed.tags.join(', ')}`);
    await page.goBack();
    await settle(page);
    const back = { url: page.url(), n: (await cards(page)).length, sheet: await page.evaluate(() => document.getElementById('CollectionFilters').open) };
    await page.goForward();
    await settle(page);
    const fwd = { url: page.url(), n: (await cards(page)).length };
    record('Collection, phone: Back undoes the filter, Forward redoes it', !/filter/.test(back.url) && /collections\/shop/.test(back.url) && back.n === 24 && !back.sheet && /lte=199/.test(fwd.url) && fwd.n === list.length, `back: ${back.url.split('/').pop()} (${back.n} cards), forward: ${fwd.url.split('/').pop()} (${fwd.n} cards)`);
    // Taking the chip off.
    await page.locator('.cf-tag').click();
    await settle(page);
    const off = await page.evaluate(() => ({ url: location.search, tags: document.querySelectorAll('.cf-tag').length, focus: document.activeElement.matches('[data-collection-top], [data-region] *') }));
    // Sort: its own sheet, one choice, which closes it.
    await page.locator('[data-sheet-open="CollectionSort"]').click();
    await page.waitForTimeout(500);
    const sortSheet = await page.evaluate(() => { const d = document.getElementById('CollectionSort'); const rows = [...d.querySelectorAll('.cf-sort__opt')]; return { modal: d.matches(':modal'), focusIn: d.contains(document.activeElement), rows: rows.length, ticked: rows.filter((a) => a.getAttribute('aria-current') === 'true').length, small: rows.filter((a) => a.getBoundingClientRect().height < 44).length, selects: document.querySelectorAll('[data-collection] select').length }; });
    const v4 = await axeRun(page);
    await page.locator('#CollectionSort [data-key="sort-price-ascending"]').click();
    await settle(page);
    const up = await cards(page);
    const said = await page.evaluate(() => document.querySelector('[data-collection-status]').textContent.trim());
    const afterSort = await page.evaluate(() => ({ open: document.getElementById('CollectionSort').open, focus: document.activeElement.dataset.key, ticked: document.querySelector('#CollectionSort [aria-current="true"]')?.dataset.key }));
    await page.locator('[data-sheet-open="CollectionSort"]').click();
    await page.waitForTimeout(500);
    await page.locator('#CollectionSort [data-key="sort-price-descending"]').click();
    await settle(page);
    const down = await cards(page);
    record('Collection, phone: Sort is its own sheet, closed by a choice', sortSheet.modal && sortSheet.focusIn && sortSheet.rows >= 3 && sortSheet.ticked === 1 && sortSheet.small === 0 && sortSheet.selects === 0 && !afterSort.open && afterSort.focus === 'open-sort' && afterSort.ticked === 'sort-price-ascending' && v4.length === 0,
      `modal: ${sortSheet.modal}, focus inside: ${sortSheet.focusIn}, ${sortSheet.rows} orders, ${sortSheet.ticked} ticked, rows under 44px: ${sortSheet.small}, browser drop-downs: ${sortSheet.selects}; after a choice open: ${afterSort.open}, focus on ${afterSort.focus}, ticked ${afterSort.ticked}; ${v4.join(', ') || '0 violations'}`);
    const ordered = (a, dir) => a.every((c, i) => !i || (c.price - a[i - 1].price) * dir >= 0);
    record('Collection, phone: a chip comes off; Sort orders by price', off.url === '' && off.tags === 0 && off.focus && ordered(up, 1) && ordered(down, -1) && up[0].price < down[0].price && /Sorted by Price: low to high/.test(said) && /sort_by=price-descending/.test(page.url()),
      `after the chip: "${off.url}", focus kept: ${off.focus}; low to high starts ₹${up[0].price}, high to low starts ₹${down[0].price}; said "${said}"`);
    // The sheet's Craft group: the craft row again (the row scrolls away, the Filter pill does not). A craft is
    // another collection, swapped in behind the open sheet with the filters kept; Back undoes it.
    await page.goto(site(shop), { waitUntil: 'load' });
    await settle(page);
    await page.locator('[data-sheet-open="CollectionFilters"]').click();
    await page.waitForTimeout(500);
    await page.locator('#CollectionFilters [data-key="acc-filter.v.price"]').click();
    await page.locator('#CollectionFilters [data-key="price-0"]').click();
    await settle(page);
    await page.locator('#CollectionFilters [data-key="acc-craft"]').click();
    await page.waitForTimeout(300);
    const craftKeys = await page.evaluate(() => ({ row: [...document.querySelectorAll('.cf-crafts a')].map((a) => a.pathname), sheet: [...document.querySelectorAll('#CollectionFilters [data-key^="craft-"]')].map((a) => a.pathname), first: document.querySelector('#CollectionFilters .cf-acc__name')?.textContent.trim() }));
    await page.locator(`#CollectionFilters [data-key^="craft-"] >> nth=2`).click();
    await settle(page);
    const craft = await page.evaluate(() => ({ url: location.pathname + location.search, h1: document.querySelector('h1').textContent.trim(), tab: document.title, row: document.querySelector('.cf-crafts [aria-current]')?.pathname, ticked: document.querySelector('#CollectionFilters [data-key^="craft-"][aria-checked="true"]')?.pathname, now: document.querySelector('#CollectionFilters [data-dd="sheet:craft"] .cf-acc__now').textContent.trim(), open: document.getElementById('CollectionFilters').open, focusIn: document.getElementById('CollectionFilters').contains(document.activeElement), said: document.querySelector('[data-collection-status]').textContent.trim() }));
    craft.dear = Math.max(...(await cards(page)).map((c) => c.price));
    const serverTab = (await fetch(site(craft.url)).then((r) => r.text())).match(/<title>\s*([^<]*?)\s*<\/title>/)?.[1].replace(/&ndash;/g, '–').replace(/&amp;/g, '&');
    const v5 = await axeRun(page);
    await page.goBack();
    await settle(page);
    const craftBack = await page.evaluate(() => ({ url: location.pathname + location.search, h1: document.querySelector('h1').textContent.trim(), row: document.querySelector('.cf-crafts [aria-current]')?.pathname }));
    record('Collection, phone: the sheet lists the crafts; choosing one keeps the filters', craftKeys.first === 'Craft' && craftKeys.sheet.length > 2 && craftKeys.sheet.join() === craftKeys.row.join() && craft.url === `${craftKeys.sheet[2]}?filter.v.price.lte=199` && craft.row === craftKeys.sheet[2] && craft.ticked === craftKeys.sheet[2] && craft.h1.includes(craft.now) && craft.open && craft.focusIn && craft.tab === serverTab && craft.dear <= 199 && craft.said.startsWith(craft.h1) && v5.length === 0 && craftBack.url === shop.replace(/^\/?/, '/') && craftBack.row === craftKeys.sheet[0],
      `${craftKeys.sheet.length} crafts, same as the row: ${craftKeys.sheet.join() === craftKeys.row.join()}; chose ${craft.url}: "${craft.h1}", tab "${craft.tab}" (server: "${serverTab}"), row and sheet agree: ${craft.row === craft.ticked}, sheet open: ${craft.open}, dearest ₹${craft.dear}, said "${craft.said}"; ${v5.length} violations; Back: ${craftBack.url} "${craftBack.h1}"`);
    record('Collection, phone (axe: plain, sheet open, filtered)', v0.length === 0 && v1.length === 0 && v2.length === 0 && errors.length === 0, `${v0.join(', ') || '0 violations'}; ${v1.join(', ') || '0 violations'}; ${v2.join(', ') || '0 violations'}${errors.length ? `; errors: ${errors[0]}` : ''}`);
    record('Collection: a filtered page stays out of search engines', /noindex/.test(robots || ''), `robots on the filtered page: ${robots || 'none'}`);

    // Nothing matches.
    await page.goto(site(`${shop}?filter.v.price.gte=99999`), { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const none = await page.evaluate(() => ({ title: document.querySelector('.collection-page__none-title')?.textContent.trim(), clear: !!document.querySelector('.collection-page__none [data-swap]'), tags: document.querySelectorAll('.cf-tag').length, pill: (() => { const r = document.querySelector('.cf-float').getBoundingClientRect(); return r.height > 0; })(), sideways: document.documentElement.scrollWidth > innerWidth + 1 }));
    const v3 = await axeRun(page);
    await page.locator('.collection-page__none [data-swap]').click();
    await settle(page);
    const cleared = (await cards(page)).length;
    record('Collection, phone: nothing matches is not a dead end', !!none.title && none.clear && none.tags === 1 && none.pill && !none.sideways && v3.length === 0 && cleared === 24, `"${none.title}", Clear filters: ${none.clear}, Filter still there: ${none.pill}; ${v3.join(', ') || '0 violations'}; cleared to ${cleared} cards`);
    await browser.close();
  }

  {
    // Load more, then Back from a product.
    const { browser, page } = await open(chromium, phone(360), { reducedMotion: 'reduce', path: shop });
    const robots = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content || '');
    const all = +(await page.evaluate(() => document.querySelector('[data-region="count"]').textContent.match(/\d+/)[0]));
    await page.locator('[data-load-more]').click();
    await page.waitForFunction(() => document.querySelectorAll('[data-collection-grid] > li').length > 24, null, { timeout: 15000 });
    await page.waitForTimeout(500);
    const two = await cards(page);
    const focus = await page.evaluate(() => [...document.querySelectorAll('[data-collection-grid] > li')].findIndex((li) => li.contains(document.activeElement)));
    const showing = await page.evaluate(() => document.querySelector('.collection-page__showing')?.textContent.trim() || 'all shown');
    record('Collection: Load more adds the next page', two.length === Math.min(48, all) && new Set(two.map((c) => c.href)).size === two.length && focus === 24 && !/noindex/.test(robots), `${two.length} cards of ${all}, repeats: ${two.length - new Set(two.map((c) => c.href)).size}, focus on card ${focus + 1}, "${showing}"`);
    // A tap on Filter or Sort never moves the page (2026-10-10: page-wide scroll padding made Sort jump 350px).
    const moved = [];
    for (const y of [0, 700, 1e6]) {
      for (const id of ['CollectionFilters', 'CollectionSort']) {
        await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), y);
        await page.waitForTimeout(300);
        const before = await page.evaluate(() => Math.round(scrollY));
        await page.locator(`[data-sheet-open="${id}"]`).tap();
        await page.waitForTimeout(500);
        const during = await page.evaluate(() => Math.round(scrollY));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        const after = await page.evaluate(() => Math.round(scrollY));
        if (during !== before || after !== before) moved.push(`${id} at ${before}px: ${during}px, then ${after}px`);
      }
    }
    record('Collection, phone: a tap on Filter or Sort leaves the page where it is', moved.length === 0, moved.join('; ') || 'top, mid-list and the end: no movement');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('[data-collection-grid] > li').nth(24).locator('a.card__link').focus();
    // No focused card under the pill: Tab through a screenful.
    let hidden = 0;
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      hidden += await page.evaluate(() => { const a = document.activeElement.getBoundingClientRect(); const p = document.querySelector('.cf-float').getBoundingClientRect(); const name = document.activeElement.querySelector?.('.card__info')?.getBoundingClientRect(); return name && name.bottom > p.top && name.top < p.bottom && a.left < p.right && a.right > p.left ? 1 : 0; });
    }
    record('Collection, phone: no focused card hides under the pill', hidden === 0, `${hidden} of 14 focused cards had the name or price under the pill`);
    await page.evaluate(() => scrollTo({ top: document.querySelectorAll('[data-collection-grid] > li')[30].getBoundingClientRect().top + scrollY - 200, behavior: 'instant' }));
    await page.waitForTimeout(300);
    const y = await page.evaluate(() => Math.round(scrollY));
    await page.locator('[data-collection-grid] > li').nth(30).locator('a.card__link').click();
    await page.waitForURL('**/products/**', { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.goBack();
    await page.waitForURL('**/collections/**', { timeout: 20000 });
    await page.waitForFunction(() => document.querySelectorAll('[data-collection-grid] > li').length > 24, null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const again = { n: (await cards(page)).length, y: await page.evaluate(() => Math.round(scrollY)) };
    record('Collection: Back from a product keeps the cards and the place', again.n === two.length && Math.abs(again.y - y) < 80, `${again.n} cards (had ${two.length}), at ${again.y}px (was ${y}px)`);
    await browser.close();
  }

  {
    // Desktop: the bar.
    const { browser, page, errors } = await open(chromium, { viewport: { width: 1280, height: 900 } }, { path: shop });
    const v0 = await axeRun(page);
    const summary = page.locator('.cf-bar .cf-dd summary').first();
    await summary.click();
    const pop = await page.evaluate(() => { const p = document.querySelector('.cf-dd[open] .cf-pop'); const r = p?.getBoundingClientRect(); return !!r && r.height > 0 && r.right <= innerWidth && [...p.querySelectorAll('a')].every((a) => a.getBoundingClientRect().height >= 44); });
    const v1 = await axeRun(page);
    await page.locator('.cf-bar [data-key="price-0"]').click();
    await settle(page);
    const list = await cards(page);
    const after = await page.evaluate(() => ({ open: !!document.querySelector('.cf-bar .cf-dd[open]'), focus: document.activeElement.dataset.key, inBar: !!document.activeElement.closest('.cf-bar'), badge: document.querySelector('.cf-bar .cf-badge')?.textContent.trim() }));
    await page.keyboard.press('Escape');
    const esc = await page.evaluate(() => ({ open: !!document.querySelector('.cf-bar .cf-dd[open]'), focus: document.activeElement.tagName }));
    await summary.click();
    await page.mouse.click(640, 700);
    const outside = await page.evaluate(() => !document.querySelector('.cf-bar .cf-dd[open]'));
    record('Collection, desktop: a drop-down filters and stays open', pop && list.length > 0 && list.every((c) => c.price < 200) && after.open && after.focus === 'price-0' && after.inBar && after.badge === '1', `panel fits: ${pop}; ${list.length} cards under ₹200; still open: ${after.open}; focus on ${after.focus}; badge ${after.badge}`);
    record('Collection, desktop: Esc and a click outside close it', !esc.open && esc.focus === 'SUMMARY' && outside, `Esc closed: ${!esc.open}, focus on ${esc.focus}; click outside closed: ${outside}`);
    // Sort from its drop-down, then the bar while scrolling.
    await page.locator('.cf-bar [data-key="dd-sort"]').click();
    const sortPop = await page.evaluate(() => { const r = document.querySelector('.cf-sort[open] .cf-pop')?.getBoundingClientRect(); return !!r && r.height > 0 && r.right <= innerWidth && r.left >= 0; });
    await page.locator('.cf-bar [data-key="sort-price-ascending"]').click();
    await settle(page);
    const sorted = await cards(page);
    const focusSort = await page.evaluate(() => `${document.activeElement.dataset.key}${document.querySelector('.cf-sort[open]') ? ' (still open)' : ''}: ${document.activeElement.textContent.trim().replace(/\s+/g, ' ')}`);
    await page.goto(site(shop), { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(900);
    const down = await page.evaluate(() => ({ top: Math.round(document.querySelector('.cf-bar').getBoundingClientRect().top), hidden: document.documentElement.classList.contains('header-hidden') }));
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(900);
    const upAgain = await page.evaluate(() => ({ top: Math.round(document.querySelector('.cf-bar').getBoundingClientRect().top), header: Math.round(document.querySelector('.header-section').getBoundingClientRect().bottom) }));
    let under = 0;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      under += await page.evaluate(() => { const el = document.activeElement; if (!el.closest('[data-collection-grid]')) return 0; return el.getBoundingClientRect().top < document.querySelector('.cf-bar').getBoundingClientRect().bottom - 1 ? 1 : 0; });
    }
    record('Collection, desktop: Sort orders, focus stays on it', sortPop && sorted.every((c, i) => !i || c.price >= sorted[i - 1].price) && /^dd-sort: Sort: ?Price: low to high$/.test(focusSort), `panel fits: ${sortPop}; low to high from ₹${sorted[0]?.price} to ₹${sorted.at(-1)?.price}; focus on ${focusSort}`);
    record('Collection, desktop: the bar sticks and moves with the header', down.hidden && down.top === 0 && Math.abs(upAgain.top - upAgain.header) <= 1 && under === 0, `scrolling down: bar at ${down.top}px (header hidden: ${down.hidden}); up again: bar at ${upAgain.top}px under a ${upAgain.header}px header; focused cards under the bar: ${under}`);
    record('Collection, desktop (axe: plain, drop-down open)', v0.length === 0 && v1.length === 0 && errors.length === 0, `${v0.join(', ') || '0 violations'}; ${v1.join(', ') || '0 violations'}${errors.length ? `; errors: ${errors[0]}` : ''}`);
    await browser.close();
  }

  {
    // Without JavaScript, on a phone.
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ ...phone(360), javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(site(shop), { waitUntil: 'load' });
    const n = await page.evaluate(() => {
      const shown = (el) => !!el && el.getBoundingClientRect().height > 0;
      const bar = document.querySelector('.cf-bar');
      return { bar: shown(bar), pill: shown(document.querySelector('.cf-float')), links: [...bar.querySelectorAll('a[href*="filter.v.price"]')].length, sorts: bar.querySelectorAll('.cf-sort a[href]').length,
        more: document.querySelector('[data-load-more]')?.getAttribute('href') || '', sideways: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    await page.locator('.cf-bar summary').first().click();
    await page.locator('.cf-bar [data-key="price-0"]').click();
    await page.waitForLoadState('load');
    const prices = await cards(page);
    record('Collection: works without JavaScript', n.bar && !n.pill && n.links >= 2 && n.sorts >= 3 && /page=2/.test(n.more) && !n.sideways && prices.length > 0 && prices.every((c) => c.price < 200), `bar shown: ${n.bar}, pill: ${n.pill}, ${n.links} price links, ${n.sorts} sort links, Load more → ${n.more}; after the price link: ${prices.length} cards under ₹200`);
    await browser.close();
  }

  {
    const js = await fetch(site('/collections/shop')).then((r) => r.text()).then((html) => html.match(/[^"']+collection\.js[^"']*/)?.[0]);
    const kb = js ? await fetch(js.startsWith('//') ? `https:${js}` : new globalThis.URL(js, URL).href).then((r) => r.arrayBuffer()).then(async (b) => (await new Response(new Blob([b]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()).byteLength / 1024) : 99;
    record('Collection: script size', kb < 4.5, `collection.js ${kb.toFixed(1)} KB gzipped (budget 4.5 KB)`);
  }
}

if (want('money')) {
  const run = spawnSync(process.execPath, [fileURLToPath(new globalThis.URL('./money-check.mjs', import.meta.url)), '--url', URL], { stdio: 'inherit' });
  record('Money check (prices, what is on sale, the cart)', run.status === 0, run.status === 0 ? 'see its lines above' : 'failed: see its lines above, or run npm run check:money');
}

const failed = results.filter((r) => !r.ok);
if (ONLY) {
  const missing = [...ONLY].filter((id) => !ran.has(id));
  if (missing.length || !results.length) { console.log(`\nNo section numbered ${missing.join(', ') || '(none given)'}; nothing to trust here.`); process.exit(1); }
  console.log(`\nOnly sections ${[...ran].join(', ')} ran; the rest were skipped.`);
}
console.log(`${ONLY ? '' : '\n'}${results.length - failed.length}/${results.length} checks passed${failed.length ? `; failing: ${failed.map((f) => f.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
