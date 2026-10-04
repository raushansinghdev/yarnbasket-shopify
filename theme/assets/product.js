/*
  Yarn Basket · product.js (docs/product-page-plan.md). Loaded only by sections/product.liquid.
  - Photos: the swipe is the browser's own; this keeps the dots, the count and the thumbnails in step with it.
  - Options: a new choice changes the price, badge, buttons, photo and the page's address, with no reload.
  - Quantity: the stepper stops at 1 and at the stock limit (cart.js only steps cart lines).
  - The sticky buy bar (phones): on screen whenever the main Add to cart isn't, and never over the footer.
  - Share: the phone's share sheet, or the link copied.
  Adding to the cart itself is cart.js. Without this file the page still shows every photo and the form still posts.
*/

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const root = document.documentElement;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('lite');

/* ---------- Photos ---------- */
const track = $('[data-gallery-track]');
const slides = track ? [...track.children] : [];
const dots = $$('[data-gallery-dots] i');
const thumbs = $$('[data-go]');
const count = $('[data-gallery-count]');
let shown = 0;

const show = (n) => {
  if (n === shown || !slides[n]) return;
  shown = n;
  dots.forEach((dot, i) => dot.classList.toggle('is-on', i === n));
  thumbs.forEach((thumb, i) => (i === n ? thumb.setAttribute('aria-current', 'true') : thumb.removeAttribute('aria-current')));
  if (count) count.textContent = n + 1;
  // A clip stops when it's swiped away.
  slides.forEach((slide, i) => i !== n && $('video', slide)?.pause());
};
const go = (n, instant) => track?.scrollTo({ left: n * track.clientWidth, behavior: instant || calm ? 'instant' : 'smooth' });

if (track && slides.length > 1) {
  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => show(Math.round(track.scrollLeft / track.clientWidth)));
  }, { passive: true });
  thumbs.forEach((thumb) => thumb.addEventListener('click', () => go(+thumb.dataset.go)));
  // A link to one variant opens on that variant's photo.
  const first = slides.findIndex((slide) => 'current' in slide.dataset);
  if (first > 0) go(first, true);
}

/* ---------- Options ---------- */
const form = $('[data-product-form]');
const variants = JSON.parse($('[data-variants]')?.textContent || '[]');
const inputs = $$('[data-option]');
const status = $('[data-variant-status]');
const adds = $$('[data-add]');
const labels = adds.map((button) => $('[data-add-label]', button));
const words = labels[0]?.dataset || {};
const qty = form && $('[data-qty]', form);
const qtyInput = qty && $('.qty__input', qty);

const swap = (el) => {
  if (!el) return;
  el.classList.remove('is-swapping');
  requestAnimationFrame(() => el.classList.add('is-swapping'));
};
const chosen = () => inputs.reduce((list, input) => (input.checked && (list[input.dataset.option - 1] = input.dataset.value), list), []);
const match = (options) => variants.find((v) => v.options.every((value, i) => value === options[i]));

const setQty = (n) => {
  if (!qty) return;
  const floor = +qty.dataset.floor || 1;
  const max = +qty.dataset.max || Infinity;
  const value = Math.min(max, Math.max(floor, Math.round(+n) || floor));
  qtyInput.value = value;
  qty.dataset.value = value;
  const toggle = (button, off) => (off ? button.setAttribute('aria-disabled', 'true') : button.removeAttribute('aria-disabled'));
  toggle($('.qty__minus', qty), value <= floor);
  toggle($('.qty__plus', qty), value >= max);
};

const update = (variant) => {
  const ok = !!variant?.available;
  adds.forEach((button, i) => {
    button.disabled = !ok;
    if (labels[i] && button.getAttribute('aria-busy') !== 'true') labels[i].textContent = ok ? words.labelAdd : words.labelOut;
  });
  const ask = $('[data-ask]');
  if (ask) {
    ask.href = ok ? ask.dataset.askUrl : ask.dataset.makeUrl;
    $('[data-ask-text]', ask).textContent = ok ? ask.dataset.askLabel : ask.dataset.makeLabel;
  }
  // Which other choices can still be made from here.
  const now = chosen();
  inputs.forEach((input) => {
    const other = [...now];
    other[input.dataset.option - 1] = input.dataset.value;
    const out = !match(other)?.available;
    input.disabled = out && !input.checked;
    input.nextElementSibling?.classList.toggle('is-out', out);
  });
  if (!variant) return;

  const id = $('[data-variant-id]', form);
  if (id) id.value = variant.id;
  $('[data-price-now]').textContent = variant.price;
  $('[data-price-was]').textContent = variant.was;
  $$('[data-price-was], [data-price-sale], [data-price-regular]').forEach((el) => (el.hidden = !variant.was));
  const badge = $('[data-badge]');
  badge.textContent = variant.badge;
  badge.hidden = !variant.badge;
  swap($('[data-price]'));
  const barPrice = $('[data-buybar-price]');
  if (barPrice) barPrice.textContent = variant.price;

  if (qty) {
    variant.max ? (qty.dataset.max = qtyInput.max = variant.max) : (delete qty.dataset.max, qtyInput.removeAttribute('max'));
    setQty(qtyInput.value);
  }

  // The link in the address bar is this exact choice; anything an ad added to it stays.
  const url = new URL(location.href);
  url.searchParams.set('variant', variant.id);
  history.replaceState(history.state, '', url);

  const photo = slides.findIndex((slide) => +slide.dataset.mediaId === variant.media);
  if (photo > -1) go(photo);

  if (status) {
    const said = ok ? status.dataset.chosen.replace('[price]', variant.price) : status.dataset.chosenOut;
    status.textContent = said.replace('[option]', variant.title);
  }
};

inputs.forEach((input) => input.addEventListener('change', () => update(match(chosen()))));

if (qty) {
  qty.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    if (step && step.getAttribute('aria-disabled') !== 'true') setQty(+qtyInput.value + +step.dataset.step);
  });
  qtyInput.addEventListener('change', () => setQty(qtyInput.value));
  setQty(qtyInput.value);
}

/* ---------- The sticky buy bar ---------- */
const bar = $('[data-buybar]');
const main = $('.pdp__add');
if (bar && main && 'IntersectionObserver' in window) {
  const footer = $('.shopify-section-group-footer-group') || $('footer');
  const phone = matchMedia('(max-width: 989px)');
  let mainSeen = true;
  let footerSeen = false;
  const set = () => {
    const on = phone.matches && !mainSeen && !footerSeen;
    bar.classList.toggle('is-on', on);
    // The added-to-cart and Saved pop-ups sit above the bar while it shows.
    root.style.setProperty('--buybar', on ? `${bar.offsetHeight}px` : '0px');
  };
  bar.hidden = false;
  new IntersectionObserver(([entry]) => ((mainSeen = entry.isIntersecting), set())).observe(main);
  if (footer) new IntersectionObserver(([entry]) => ((footerSeen = entry.isIntersecting), set())).observe(footer);
  phone.addEventListener('change', set);
}

/* ---------- Share ---------- */
const share = $('[data-share]');
if (share && (navigator.share || navigator.clipboard)) {
  const said = $('[data-share-status]');
  share.hidden = false;
  share.addEventListener('click', async () => {
    const url = $('link[rel="canonical"]')?.href || location.href;
    try {
      if (navigator.share) return await navigator.share({ title: document.title, url });
      await navigator.clipboard.writeText(url);
      said.textContent = share.dataset.copied;
      setTimeout(() => (said.textContent = ''), 2500);
    } catch {
      // Closing the share sheet is not an error.
    }
  });
}
