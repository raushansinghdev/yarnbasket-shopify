// Audit crawl: every page type, phone + desktop: page errors, failed own requests, Liquid errors, missing translations,
// duplicate ids, broken id references, missing alt, h1 count, sideways scroll, axe (WCAG 2.2 AA + best practice).
// Usage: npm run audit -- [chromium|webkit|firefox] [--url http://127.0.0.1:9393]
// The dev server must have the storefront password (it reads /products.json). Shopify's own noise on a local server
// (shop.app framing, test cookies, private access tokens, cross-origin scripts) is filtered out.
import { chromium, webkit, firefox, devices } from 'playwright';
import axe from 'axe-core';
const args = process.argv.slice(2);
const engine = { chromium, webkit, firefox }[args.find((a) => !a.startsWith('--') && !a.startsWith('http')) || 'chromium'];
const base = (args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://127.0.0.1:9292').replace(/\/$/, '');
const prods = (await (await fetch(base + '/products.json?limit=50')).json()).products;
const pages = ['/', '/collections', '/collections/all', ...prods.slice(0, 11).map((p) => '/products/' + p.handle), '/cart', '/search', '/search?q=bouquet&options%5Bprefix%5D=last', '/search?q=zzqx', '/pages/contact', '/blogs/news', '/account/login', '/policies/privacy-policy', '/nope-404'];
const b = await engine.launch();
const issues = [];
for (const [label, dev] of [['phone', devices[engine === webkit ? 'iPhone 13' : 'Pixel 7']], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
  if (engine === firefox && label === 'phone') { dev.isMobile = undefined; delete dev.isMobile; }
  const ctx = await b.newContext({ ...dev, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('yb-intro-seen', String(Date.now())); } catch {} });
  for (const [i, path] of pages.entries()) {
    if (path === '/cart' && label === 'desktop') await ctx.request.post(base + '/cart/add.js', { data: { items: [{ id: prods[0].variants[0].id, quantity: 1 }, { id: prods[5].variants.at(-1).id, quantity: 2 }] } });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => { if (!/Cross-origin|CORS|otlp-http|shopifysvc/i.test(e.message)) errs.push('JS: ' + e.message); });
    p.on('console', (m) => { if (m.type() === 'error' && !/CORS|cdn\.shopify|origin_trials|shop\.app|Content Security Policy|_shopify_test|Cookie|monorail|Failed to load resource|web-pixels|shopify-perf|net::ERR|otlp-http|shopifysvc|keepalive|exporting metrics|Content-Security-Policy/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 140)); });
    p.on('response', (r) => { const u = r.url(); if (u.startsWith(base) && r.status() >= 400 && !/nope-404|\/account\?locale|sf_private_access_tokens/.test(u) && !/\.map$/.test(u)) errs.push(`HTTP ${r.status()} ${u.replace(base, '')}`); });
    try { await p.goto(base + path, { waitUntil: 'load', timeout: 45000 }); } catch (e) { issues.push(`${label} ${path}: load failed ${e.message.slice(0, 80)}`); await p.close(); continue; }
    await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const html = document.documentElement.outerHTML;
      const ids = {}; document.querySelectorAll('[id]').forEach((el) => (ids[el.id] = (ids[el.id] || 0) + 1));
      const dup = Object.entries(ids).filter(([, n]) => n > 1).map(([id]) => id);
      const refs = [];
      document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls],label[for]').forEach((el) => {
        ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'].forEach((a) => (el.getAttribute(a) || '').split(/\s+/).filter(Boolean).forEach((id) => { if (!document.getElementById(id)) refs.push(`${a}=${id}`); }));
      });
      return {
        liquid: (html.match(/Liquid (error|syntax error)[^<]{0,120}/g) || []).slice(0, 3),
        missing: (html.match(/translation missing[^<"]{0,80}/gi) || []).slice(0, 3),
        dup, refs,
        side: document.documentElement.scrollWidth > innerWidth + 1,
        noAlt: [...document.querySelectorAll('img:not([alt])')].length,
        h1: document.querySelectorAll('h1').length,
      };
    });
    await p.addScriptTag({ content: axe.source }).catch(() => {});
    const v = await p.evaluate(async () => window.axe ? (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes[0].target}`) : ['axe not loaded']).catch((e) => ['axe failed ' + e.message]);
    const list = [...errs, ...r.liquid, ...r.missing, ...(r.dup.length ? ['duplicate ids: ' + r.dup.join(', ')] : []), ...(r.refs.length ? ['broken refs: ' + [...new Set(r.refs)].join(', ')] : []), ...(r.side ? ['sideways scroll'] : []), ...(r.noAlt ? [`${r.noAlt} img without alt`] : []), ...(r.h1 !== 1 ? [`${r.h1} h1`] : []), ...v.map((x) => 'axe ' + x)];
    list.forEach((x) => issues.push(`${label} ${path}: ${x}`));
    await p.close();
  }
  await ctx.request.post(base + '/cart/clear.js');
  await ctx.close();
}
await b.close();
console.log(issues.length ? issues.join('\n') : 'no issues');
