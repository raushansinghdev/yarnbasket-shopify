/*
  Yarn Basket · cart-rows.js (docs/cart-plan.md, "One cart", 2026-10-05)
  The three swipe rows at the end of the cart, the same in the drawer and on /cart (snippets/cart-rows.liquid):
  Saved for later, Little extras ("You may also like" once every reward is earned) and Recently viewed.
  - Saved for later: this browser's saved pieces (saved.js) that can be bought now, from sections/saved-item
  - Little extras: sections/cart-extras through Shopify's product recommendations, asked again after every change
  - Recently viewed: the last product pages seen in this browser that can be bought now, from the same section,
    so each has its button too (Add, or Choose for a piece with options)
  6 cards a row at most, nothing that is in the cart, no piece twice (the shopper's own rows keep theirs and the
  suggestions give way), and a row with nothing to show is hidden.
  The drawer fetches this file with its first opening (cart.js calls the default export on every opening); the
  cart page loads it after cart-page.js and fills the rows when they come near the screen. Without it the cart
  simply ends after the price details.
*/

const { enqueue, send, withSections, render, say, counted, box, sectionId, S, fmt, why } = window.ybCart;
const scope = document.querySelector('[data-cart-page]') || document.getElementById('CartDrawer');
const inDrawer = !!scope?.matches('dialog');
const MAX = 6;
const parse = (html) => new DOMParser().parseFromString(html, 'text/html');
const handleIn = (href) => (href || '').match(/\/products\/([^/?#]+)/)?.[1] || '';
// A card's product, whichever section drew it (saved-item or cart-extras).
const handleOf = (card) => card.dataset.handle || handleIn(card.querySelector('a')?.getAttribute('href'));
const inCart = () => new Set([...scope.querySelectorAll('.cart-line .cart-line__title')].map((a) => handleIn(a.getAttribute('href'))));
const listOf = (row) => row.querySelector('[data-row-list]');
// A card's button (its link, should it ever have none).
const action = (li) => li?.querySelector('.saved-item__btn, .extra__btn') || li?.querySelector('.card__link');

/* ---------- The rows' own element ----------
   The drawer redraws all of itself after every change, with the rows empty again. The filled element is kept
   and put back in their place, so the cards, their photos and the place in each row survive. */
let rows = null;
let savedRow, extrasRow, recentRow;
const adopt = () => {
  const found = scope.querySelector('[data-cart-rows]');
  if (!found || found === rows) return;
  if (!rows) {
    rows = found;
    savedRow = rows.querySelector('[data-cart-saved]');
    extrasRow = rows.querySelector('[data-cart-extras]');
    recentRow = rows.querySelector('[data-cart-recent]');
    return;
  }
  // The suggestions follow the first piece in the cart, which may have changed.
  const url = found.querySelector('[data-cart-extras]')?.dataset.url;
  if (url && extrasRow) extrasRow.dataset.url = url;
  found.replaceWith(rows);
};

/* ---------- Cards ---------- */
// A one-tap Add is a plain button: the drawer is one form already, and a form can't sit inside a form.
const ready = (li) => {
  const form = li?.querySelector('.saved-item__form, .extra__form');
  const button = form?.querySelector('button');
  if (button) {
    button.type = 'button';
    button.dataset.rowAdd = form.elements.id.value;
    form.replaceWith(button);
  }
  return li;
};
// One card per product and section, fetched once. null = gone, sold out or the free gift.
const cards = new Map();
const card = (handle, section, pick) => {
  const key = `${section}:${handle}`;
  if (!cards.has(key)) {
    const job = fetch(`${rows.dataset.products}${handle}?section_id=${section}`)
      .then((r) => (r.ok ? r.text() : ''))
      .then((html) => (html && ready(pick(parse(html)))) || null);
    job.catch(() => cards.delete(key));
    cards.set(key, job.catch(() => null));
  }
  return cards.get(key);
};
// Pieces that can be bought now: Add to cart, or Choose for a piece with options. Saved for later and Recently
// viewed share the card, so a piece in both lists is fetched once (tidy() then shows it in one row only).
const buyCard = (handle) => card(handle, 'saved-item', (doc) => {
  const li = doc.querySelector('.saved-item[data-handle]:not([data-handle=""])');
  return li?.querySelector('.saved-item__form, .saved-item__btn[href*="/products/"]') ? li : null;
});

/* ---------- Filling the rows ---------- */
// A card that was just added stays for a moment, saying "Added".
const leaving = new Set();
// The row's cards become these, unless they already are. Focus stays on the same piece, or moves to its
// neighbour, or to the row itself.
const put = (row, next) => {
  const list = listOf(row);
  const now = [...list.children];
  if (now.length === next.length && now.every((li, i) => li === next[i])) return;
  const held = list.contains(document.activeElement) ? now.indexOf(document.activeElement.closest('[data-row-list] > li')) : -1;
  const keep = held >= 0 && next.includes(now[held]);
  // Only what changed is touched: a card that stays keeps its focus and the row keeps its place.
  now.forEach((li) => next.includes(li) || li.remove());
  next.forEach((li, i) => list.children[i] !== li && list.insertBefore(li, list.children[i] || null));
  // New pieces at the front: the row starts from them, unless someone is in the middle of it.
  if (now[0] !== next[0] && !list.contains(document.activeElement)) list.scrollLeft = 0;
  if (held >= 0 && !keep) (action(next[Math.min(held, next.length - 1)]) || row).focus({ preventScroll: true });
  window.ybSaved?.sync();
  window.ybArrive?.(list);
};
// No piece shows twice: the shopper's own rows (saved, then viewed) keep theirs and the suggestions give way.
// A row with too little to show is hidden.
const tidy = () => {
  if (!rows) return;
  const cart = inCart();
  const seen = new Set();
  [savedRow, recentRow, extrasRow].filter(Boolean).forEach((row) => {
    const keep = [...listOf(row).children].filter((li) => {
      const handle = handleOf(li);
      if (leaving.has(li)) return seen.add(handle);
      if (cart.has(handle) || seen.has(handle)) return false;
      return seen.add(handle);
    }).slice(0, MAX);
    put(row, keep);
    const hide = keep.length < (row === recentRow ? 2 : 1);
    if (hide && row.contains(document.activeElement)) scope.querySelector('.cart-line__title')?.focus({ preventScroll: true });
    row.hidden = hide;
  });
};

let turn = 0;
const draw = () => {
  if (!rows) return;
  const asked = ++turn;
  const cart = inCart();
  const free = (handle) => !cart.has(handle);
  const saved = savedRow && window.ybSaved ? window.ybSaved.read() : [];
  const viewed = recentRow && window.ybSaved ? window.ybSaved.viewed() : [];
  // A few more than a row holds, for the ones that turn out to be sold out.
  const jobs = [
    Promise.all(saved.filter(free).slice(0, MAX + 2).map(buyCard)),
    // A saved piece stays in its own row: the two rows share one card, and a card can sit in one place only.
    Promise.all(viewed.filter((handle) => free(handle) && !saved.includes(handle)).slice(0, MAX + 2).map(buyCard)),
    extrasRow
      ? fetch(extrasRow.dataset.url).then((r) => (r.ok ? r.text() : '')).then((html) => parse(html).querySelector('.extras')).catch(() => null)
      : null,
  ];
  Promise.all(jobs).then(([savedCards, recentCards, extras]) => {
    // A newer change has asked again, or a card is still saying "Added" (it asks again when it goes).
    if (asked !== turn || leaving.size) return;
    if (savedRow) {
      const shown = savedCards.filter(Boolean).slice(0, MAX);
      put(savedRow, shown);
      const all = savedRow.querySelector('[data-cart-saved-all]');
      if (all) all.hidden = saved.filter(free).length <= shown.length;
    }
    if (extrasRow) {
      // The same pieces as before keep their cards (and a button that is busy or has focus).
      const was = new Map([...listOf(extrasRow).children].map((li) => [handleOf(li), li]));
      const next = [...(extras?.querySelectorAll('.extra') || [])].map((li) => was.get(handleOf(li)) || ready(li));
      const title = extras?.querySelector('.extras__title')?.textContent;
      if (title) extrasRow.querySelector('h2').textContent = title;
      put(extrasRow, next);
    }
    if (recentRow) put(recentRow, recentCards.filter(Boolean).slice(0, MAX));
    tidy();
  });
};

/* ---------- Add ---------- */
scope?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-row-add]');
  if (!button || button.getAttribute('aria-busy') === 'true') return;
  const li = button.closest('li');
  const row = li.closest('.cart-row');
  const title = (li.querySelector('.card__title, .extra__title')?.textContent || '').trim();
  const label = button.querySelector('[data-add-label], span[aria-hidden]');
  const original = label?.textContent;
  row.querySelector('.cart-row__note')?.remove();
  button.setAttribute('aria-busy', 'true');
  // theme.js gives the Little extras button its short pulse; the Saved one gets the same here.
  if (!button.matches('.extra__btn')) navigator.vibrate?.(10);
  enqueue(() => send('cart/add.js', withSections({ items: [{ id: +button.dataset.rowAdd, quantity: 1 }] })))
    .then((res) => {
      // The card says "Added" for a moment, then goes; focus moves to the next card.
      leaving.add(li);
      if (label) label.textContent = S.addedButton;
      render(res.sections?.[sectionId]);
      const count = +box()?.dataset.count;
      counted(count);
      say(fmt(S.added, { title, count: count === 1 ? S.one : S.other.replace('99', count) }));
      setTimeout(() => {
        leaving.delete(li);
        button.removeAttribute('aria-busy');
        if (label) label.textContent = original;
        tidy();
        draw();
      }, 900);
    })
    .catch((err) => {
      const note = document.createElement('p');
      note.className = 'cart-row__note';
      note.textContent = why(err);
      row.append(note);
      button.removeAttribute('aria-busy');
      say(note.textContent);
    });
});

/* ---------- Keeping up with the cart ---------- */
let started = false;
// Where the shopper was in the rows, for after the drawer has redrawn itself.
let last = null;
let top = 0;
scope?.addEventListener('focusin', (event) => { last = rows?.contains(event.target) ? event.target : null; });
scope?.addEventListener('scroll', (event) => { if (event.target.matches?.('[data-scroll]')) top = event.target.scrollTop; }, true);

document.addEventListener('cart:rendered', () => {
  const was = rows;
  adopt();
  if (inDrawer && was && rows.isConnected) {
    const body = scope.querySelector('[data-scroll]');
    if (body && top) body.scrollTop = top;
    if (last?.isConnected && !scope.querySelector(':focus')) last.focus({ preventScroll: true });
  }
  if (!started || (inDrawer && !scope.open)) return;
  tidy();
  draw();
});
// A heart on one of the cards, or the list changed in another tab.
document.addEventListener('saved:change', () => started && (!inDrawer || scope.open) && draw());

// The drawer: called on every opening.
export default function fill() {
  adopt();
  started = true;
  draw();
}

// The cart page: fetched only when the rows are near the screen.
if (scope && !inDrawer) {
  adopt();
  if (rows && 'IntersectionObserver' in window) {
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      fill();
    }, { rootMargin: '600px 0px' });
    watch.observe(rows);
  } else fill();
}
