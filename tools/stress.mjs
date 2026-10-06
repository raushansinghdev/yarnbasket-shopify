// Layout stress test: every page type x widths x text modes. Reports overflow, clipped text, small targets, tiny text.
// Usage: node tools/stress.mjs [mode=normal|big130|big200|long] [--shots]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base = 'http://127.0.0.1:9292';
const mode = process.argv[2] || 'normal';
const shots = process.argv.includes('--shots');
const out = new URL('../.stress-shots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const pages = [
  ['home', '/'], ['campaign', '/?view=campaign-test'], ['collections', '/collections'], ['all', '/collections/all'],
  ['pdp', '/products/flower-hair-clips-set-of-8'], ['pdp-soldout', '/products/daisy-crochet-headband'], ['pdp-gift', '/products/sunflower-keychain-free-gift'],
  ['cart-empty', '/cart'], ['cart-full', '/cart'], ['search', '/search'], ['search-q', '/search?q=crochet&options%5Bprefix%5D=last'], ['search-none', '/search?q=zzqx'],
  ['contact', '/pages/contact'], ['saved', '/pages/saved'], ['track', '/pages/track-order'], ['account', '/pages/account'],
  ['account-demo', '/pages/contact?view=account-demo'], ['details-demo', '/pages/contact?view=account-details-demo'],
  ['blog', '/blogs/news'], ['terms', '/policies/terms-of-service'], ['404', '/nope-404'],
];
const sizes = mode === 'normal'
  ? [[320, 568], [360, 740], [390, 844], [768, 1024], [1024, 768], [1100, 800], [1280, 800], [1440, 900], [1920, 1080]]
  : mode === 'big200' ? [[390, 844], [1280, 800]] : [[320, 568], [390, 844], [1280, 800]];

const LONG = 'Extra Large Handmade Crochet Sunflower and Daisy Bouquet with Kraft Wrapping, Satin Ribbon and a Handwritten Gift Card';
const inject = () => {
  const LONG = window.__LONG;
  document.querySelectorAll('.card__title, .cart-line__title, .search-result__title, .hero__tag-name, h1').forEach((el, i) => {
    if (el.closest('.hero__title')) return;
    const t = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()) || el.querySelector('a') || el;
    t.textContent = i % 3 === 2 ? 'Supercalifragilisticexpialidocious-handcrocheted-keychain' : LONG;
  });
  document.querySelectorAll('.price > span:not(.visually-hidden), .price').forEach((el) => { if (!el.children.length) el.textContent = '₹1,24,999.00'; });
  document.querySelectorAll('.price__compare').forEach((el) => (el.textContent = '₹1,49,999.00'));
  document.querySelectorAll('.card__badge').forEach((el) => (el.textContent = 'Only a few left'));
  document.querySelectorAll('[data-cart-count]').forEach((el) => { el.hidden = false; el.textContent = '99+'; });
  document.querySelectorAll('.site-header__nav-link, .shop__label, .footer__list a').forEach((el) => {
    const t = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (t) t.textContent = t.textContent.trim() + ' and more gifts';
  });
};

const probe = () => {
  const vw = innerWidth;
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && +s.opacity > 0.05 && (!el.checkVisibility || el.checkVisibility()); };
  const inScroller = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth + 1) return true; } return false; };
  const clippedBy = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if (/hidden|clip/.test(s.overflowX)) return p; } return null; };
  const name = (el) => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')).slice(0, 60);
  const over = []; const clip = []; const small = []; const tiny = new Map();
  const all = [...document.body.querySelectorAll('*')].filter((el) => !el.closest('dialog:not([open]), [hidden], template, .visually-hidden, .splash, noscript'));
  const overSet = new Set();
  for (const el of all) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if ((r.right > vw + 1.5 || r.left < -1.5) && !inScroller(el) && s.position !== 'fixed' && !el.closest('[aria-hidden="true"]') && !(el.parentElement && overSet.has(el.parentElement))) {
      const c = clippedBy(el);
      // only report when it carries text or is interactive (decorative flowers etc. are fine)
      if (el.innerText?.trim() || el.matches('a,button,input,img')) { over.push(`${name(el)} [${Math.round(r.left)}..${Math.round(r.right)}]${c ? ' clipped-by ' + name(c) : ''}`); }
      overSet.add(el);
    } else if (el.parentElement && overSet.has(el.parentElement)) overSet.add(el);
    // clipped text: own text, overflow hidden, content wider/taller than box
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      if (/hidden|clip/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 1) clip.push(`${name(el)} "${el.textContent.trim().slice(0, 30)}" x:${el.scrollWidth}>${el.clientWidth}`);
      else if (/hidden|clip/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2 && s.webkitLineClamp === 'none') clip.push(`${name(el)} "${el.textContent.trim().slice(0, 30)}" y:${el.scrollHeight}>${el.clientHeight}`);
      const fs = parseFloat(s.fontSize);
      if (fs < 12 && !el.closest('[aria-hidden="true"]')) tiny.set(name(el) + ' ' + fs + 'px', 1);
      // text spilling out of its own box horizontally (nowrap) without overflow hidden
      if (s.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 2 && s.display !== 'inline') clip.push(`SPILL ${name(el)} "${el.textContent.trim().slice(0, 30)}" ${el.scrollWidth}>${el.clientWidth}`);
    }
    if (el.matches('a[href], button, input:not([type=hidden]), select, textarea, summary') ) {
      const inline = s.display === 'inline' && el.closest('p, li, .rte');
      if (!inline && (r.width < 24 || r.height < 24)) small.push(`${name(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  // overlapping interactive elements (centre point of one covered by another interactive)
  const hits = [];
  const inter = all.filter((el) => el.matches('a[href], button') && vis(el));
  for (const el of inter) {
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > vw) continue;
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (top && !el.contains(top) && !top.contains(el) && !top.closest('.announce, .header-section') ) { const o = top.closest('a,button') || top; if (!el.contains(o)) hits.push(`${name(el)} covered by ${name(o)}`); }
  }
  return { over: [...new Set(over)].slice(0, 8), clip: [...new Set(clip)].slice(0, 10), small: [...new Set(small)].slice(0, 8), tiny: [...tiny.keys()].slice(0, 8), hits: [...new Set(hits)].slice(0, 6), sw: document.documentElement.scrollWidth, vw };
};

const FONT = { big130: 21, big200: 32 }[mode];
const b = await chromium.launch();
const agg = new Map();
const add = (kind, page, size, msg) => { const k = `${kind} | ${page} | ${msg}`; (agg.get(k) || agg.set(k, []).get(k)).push(size); };
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(([L]) => { window.__LONG = L; try { localStorage.setItem('yb-intro-seen', String(Date.now())); } catch {} }, [LONG]);
  for (const [label, path] of pages) {
    if (label === 'cart-full') {
      await ctx.request.post(base + '/cart/add.js', { data: { items: [{ id: 0 }] } }).catch(() => {});
      const prods = (await (await ctx.request.get(base + '/products.json?limit=50')).json()).products.filter((p) => p.variants.some((v) => v.available) && !p.tags.includes('free-gift'));
      await ctx.request.post(base + '/cart/add.js', { data: { items: prods.slice(0, 4).map((p, i) => ({ id: p.variants.find((v) => v.available).id, quantity: i + 1 })) } });
    }
    const p = await ctx.newPage();
    if (FONT) await (await ctx.newCDPSession(p)).send('Page.setFontSizes', { fontSizes: { standard: FONT } });
    try { await p.goto(base + path, { waitUntil: 'load', timeout: 60000 }); } catch (e) { add('LOAD', label, w, e.message.slice(0, 60)); await p.close(); continue; }
    await p.waitForTimeout(700);
    if (mode === 'long') await p.evaluate(inject);
    await p.waitForTimeout(400);
    const r = await p.evaluate(probe);
    const root = await p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    if (FONT && Math.abs(root - FONT) > 1) add('SETUP', label, w, `root font is ${root}px, wanted ${FONT}px`);
    const cart = await p.evaluate(() => { const c = document.querySelector('.site-header__cart'); if (!c) return true; const r = c.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1; });
    if (!cart) add('OVER', label, w, 'the header cart button is past the screen edge');
    if (r.sw > r.vw + 1) add('SIDEWAYS', label, w, `scrollWidth ${r.sw - r.vw}px over`);
    r.over.forEach((m) => add('OVER', label, w, m.replace(/\[.*?\]/, '')));
    r.clip.forEach((m) => add('CLIP', label, w, m.replace(/ [xy]:.*$/, '').replace(/ \d+>\d+$/, '')));
    r.small.forEach((m) => add('SMALL', label, w, m));
    r.tiny.forEach((m) => add('TINY', label, w, m));
    r.hits.forEach((m) => add('COVERED', label, w, m));
    if (shots) await p.screenshot({ path: `${out}${mode}-${label}-${w}.png`, fullPage: true }).catch(() => {});
    await p.close();
  }
  await ctx.request.post(base + '/cart/clear.js').catch(() => {});
  await ctx.close();
}
await b.close();
const lines = [...agg.entries()].map(([k, v]) => `${k}  @ ${[...new Set(v)].join(',')}`).sort();
console.log(`# mode=${mode}  ${lines.length} findings`);
console.log(lines.join('\n'));
