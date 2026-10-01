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

const BUDGET = { lcpMs: 2000, slowFrames: 0, phoneImagesKB: 1000, ownJsKB: 25 };
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
  page.on('response', async (res) => {
    try {
      const kb = (await res.body()).length / 1024;
      if (res.request().resourceType() === 'image') imgKB += kb;
      if (/\/assets\/theme\.js/.test(res.url())) ownJsKB += kb;
    } catch {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const lcp = (await page.evaluate(() => window.__lcp)).at(-1) || { t: NaN, el: '?' };
  record('LCP, phone (4x slower CPU)', lcp.t < BUDGET.lcpMs && /hero/.test(lcp.el), `${Math.round(lcp.t)}ms on "${lcp.el}" (budget ${BUDGET.lcpMs}ms, local server)`);
  record('Phone images on first load', imgKB < BUDGET.phoneImagesKB, `${Math.round(imgKB)} KB (budget ${BUDGET.phoneImagesKB} KB)`);
  record('Our JavaScript (theme.js)', ownJsKB < BUDGET.ownJsKB, `${ownJsKB.toFixed(1)} KB (budget ${BUDGET.ownJsKB} KB)`);
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

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; failing: ${failed.map((f) => f.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
