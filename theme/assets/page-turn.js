/*
  Yarn Basket · page-turn.js (docs/fluid-feel-plan.md, phase B)
  Every tap on a link gets an answer: pressed states work on iPhones, likely next pages are fetched ahead, and a
  thin line shows under the top edge when a page takes longer than a moment to arrive.
*/

const root = document.documentElement;
const lite = root.classList.contains('lite');

// iOS Safari only shows :active styles when the page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });

// Same exclusions as the Speculation Rules in theme.liquid: other sites, cart, checkout, account, query strings, nofollow.
const done = new Set();
const want = (a) => a && a.origin === location.origin && !a.search && !a.hasAttribute('download')
  && !/^\/(cart|checkout|account)/.test(a.pathname) && !a.matches('[rel~="nofollow"], [data-no-prerender]')
  && a.pathname !== location.pathname && !done.has(a.href);

/* ---------- Next page, sooner ----------
   A mouse: Chrome and Edge prerender on hover (theme.liquid); Firefox gets a <link rel="prefetch"> when the pointer
   rests on a link (80ms) or a finger lands on it. Safari supports neither, so it is skipped.
   A touch screen has no hover, so in Chrome the links a shopper is looking at (at least half on screen for 400ms)
   are fetched ahead, six a page at most. Never in lite mode or with data saver. */
if (!lite && HTMLScriptElement.supports?.('speculationrules')) {
  if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    const timers = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target: a, isIntersecting }) => {
        clearTimeout(timers.get(a));
        if (!isIntersecting) return;
        timers.set(a, setTimeout(() => {
          io.unobserve(a);
          if (!want(a)) return;
          done.add(a.href);
          const rules = document.createElement('script');
          rules.type = 'speculationrules';
          rules.textContent = JSON.stringify({ prefetch: [{ urls: [a.href] }] });
          document.head.append(rules);
          if (done.size >= 6) io.disconnect();
        }, 400));
      });
    }, { threshold: 0.5 });
    const watch = (scope) => scope.querySelectorAll('main a[href]').forEach((a) => want(a) && io.observe(a));
    watch(document);
    document.addEventListener('shopify:section:load', (event) => watch(event.target));
  }
} else if (!lite && document.createElement('link').relList.supports?.('prefetch')) {
  const prefetch = (a) => {
    if (!want(a)) return;
    done.add(a.href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = a.href;
    document.head.append(link);
  };
  let timer = 0;
  document.addEventListener('pointerover', (event) => {
    const a = event.target.closest?.('a[href]');
    clearTimeout(timer);
    if (a) timer = setTimeout(() => prefetch(a), 80);
  }, { passive: true });
  document.addEventListener('touchstart', (event) => prefetch(event.target.closest?.('a[href]')), { passive: true });
}

/* ---------- The page is on its way ----------
   A link or form that leaves this page adds html.is-turning after 300ms (the line is drawn in base.css), so a fast
   page shows nothing and a slow one is never met with silence. Cleared when the page is left or comes back. */
{
  let timer = 0;
  const clear = () => { clearTimeout(timer); root.classList.remove('is-turning'); };
  const turn = () => {
    clear();
    timer = setTimeout(() => {
      root.classList.add('is-turning');
      timer = setTimeout(clear, 10000);
    }, 300);
  };
  addEventListener('click', (event) => {
    const a = event.target.closest?.('a[href]');
    if (!a || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || !/^https?:$/.test(a.protocol)) return;
    if (a.origin === location.origin && a.pathname === location.pathname && a.search === location.search) return;
    turn();
  });
  addEventListener('submit', (event) => {
    if (!event.defaultPrevented && event.target.target !== '_blank') turn();
  });
  addEventListener('pageshow', clear);
  addEventListener('pagehide', clear);
}
