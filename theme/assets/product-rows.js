/*
  Yarn Basket · product-rows.js (docs/product-page-plan.md). The rows of other pieces under a product:
  "Pairs well with" and "You may also like" (sections/product-recommendations) and "Recently viewed"
  (sections/recently-viewed). Each row is fetched only when it is near the screen. Without this file the page
  simply ends after the details and the FAQ.
*/

const parse = (html) => new DOMParser().parseFromString(html, 'text/html');
const here = location.pathname;
// saved.js shows the hearts on cards it finds at load; this asks it to look again (it listens for storage changes).
const hearts = () => dispatchEvent(new StorageEvent('storage', { key: null }));
const near = (el, run) => {
  if (!('IntersectionObserver' in window)) return run();
  const watch = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    watch.disconnect();
    run();
  }, { rootMargin: '600px 0px' });
  watch.observe(el);
};

/* ---------- Recommendations ---------- */
document.querySelectorAll('[data-recs]').forEach((box) => {
  // A sold-out piece on a phone: "You may also like" moves up under the buy box, and loads straight away.
  const lift = 'recsLift' in box.dataset && matchMedia('(max-width: 989px)').matches && document.querySelector('.pdp__details');
  const load = () => fetch(box.dataset.url)
    .then((response) => (response.ok ? response.text() : ''))
    .then((html) => {
      const row = parse(html).querySelector('[data-recs-ready]');
      if (!row) return;
      // Never this product itself (the Bestsellers stand-in can hold it), and no more than the row asks for.
      row.querySelectorAll('.card__link').forEach((link) => link.getAttribute('href').split('?')[0] === here && link.closest('li').remove());
      if (!row.querySelector('li')) return;
      // Someone who just jumped to the reviews (the rating link) keeps them in place when a row arrives above.
      const held = document.querySelector(':target');
      const top = held?.getBoundingClientRect().top;
      if (lift) lift.before(row);
      else box.replaceWith(row);
      if (held && top >= 0 && top < innerHeight / 2 && row.compareDocumentPosition(held) & 4) scrollBy({ top: held.getBoundingClientRect().top - top, behavior: 'instant' });
      hearts();
    })
    .catch(() => {});
  lift ? load() : near(box, load);
});

/* ---------- Recently viewed ---------- */
const recent = document.querySelector('[data-recent]');
if (recent) {
  let handles = [];
  try {
    handles = JSON.parse(localStorage.getItem('yb-recent-products')) || [];
  } catch {
    // No storage (private mode): no row.
  }
  handles = handles.filter((handle) => /^[\w-]+$/.test(handle) && handle !== recent.dataset.handle).slice(0, 6);
  if (handles.length >= 2) {
    near(recent.previousElementSibling || document.querySelector('footer') || recent, () => {
      Promise.all(handles.map((handle) => fetch(`${recent.dataset.url}${handle}?section_id=product-tile`)
        .then((response) => (response.ok ? response.text() : ''))
        .then((html) => parse(html).querySelector('[data-tile]'))
        .catch(() => null)))
        .then((tiles) => {
          tiles = tiles.filter(Boolean);
          if (tiles.length < 2) return;
          recent.querySelector('[data-row-list]').replaceChildren(...tiles);
          recent.hidden = false;
          hearts();
        });
    });
  }
}
