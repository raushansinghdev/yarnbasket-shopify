/*
  Yarn Basket · product.js (docs/product-page-plan.md). Loaded only by sections/product.liquid.
  - Photos: the swipe is the browser's own; this keeps the dots, the count and the thumbnails in step with it.
  - Options: a new choice changes the price, badge, buttons, photo and the page's address, with no reload.
  - Quantity: the stepper stops at 1 and at the stock limit (cart.js only steps cart lines).
  - The sticky buy bar (phones): on once the main Add to cart is scrolled past, never over the footer.
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
// The photos in the row now: with colours, the other colours' photos are hidden (data-group).
const live = () => slides.filter((slide) => !slide.hidden);
let shown = 0;

const show = (n, again) => {
  const slide = live()[n];
  if (!slide || (n === shown && !again)) return;
  shown = n;
  const at = slides.indexOf(slide);
  dots.forEach((dot, i) => dot.classList.toggle('is-on', i === at));
  thumbs.forEach((thumb, i) => (i === at ? thumb.setAttribute('aria-current', 'true') : thumb.removeAttribute('aria-current')));
  if (count) count.textContent = n + 1;
  // A clip stops when it's swiped away.
  slides.forEach((other) => other !== slide && $('video', other)?.pause());
};
const go = (n, instant) => track?.scrollTo({ left: n * track.clientWidth, behavior: instant || calm ? 'instant' : 'smooth' });
const goTo = (slide, instant) => go(Math.max(0, live().indexOf(slide)), instant);

// A new colour: its photos (and the ones every colour shares) take the row; the dots, count and thumbnails follow.
const regroup = (media) => {
  const key = slides.find((slide) => +slide.dataset.mediaId === media)?.dataset.group;
  if (!key || live().every((slide) => !slide.dataset.group || slide.dataset.group === key)) return false;
  slides.forEach((slide, i) => {
    const off = !!slide.dataset.group && slide.dataset.group !== key;
    slide.hidden = off;
    if (dots[i]) dots[i].hidden = off;
    if (thumbs[i]) thumbs[i].parentElement.hidden = off;
  });
  $('[data-gallery-total]').textContent = live().length;
  $('.gallery__meta').hidden = live().length < 2;
  return true;
};

if (track && slides.length > 1) {
  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => show(Math.round(track.scrollLeft / track.clientWidth)));
  }, { passive: true });
  thumbs.forEach((thumb) => thumb.addEventListener('click', () => goTo(slides[+thumb.dataset.go])));
  // A link to one variant opens on that variant's photo.
  const first = slides.find((slide) => 'current' in slide.dataset);
  if (first && live().indexOf(first) > 0) goTo(first, true);
}

// A closer look: the viewer's code arrives on the first tap of a photo or of the round button.
const gallery = $('[data-gallery]');
const expand = $('[data-zoom]');
if (gallery && expand) {
  const look = (slide) => import(gallery.dataset.zoomSrc).then((viewer) => viewer.open(gallery, slide, expand, (left) => goTo(left, true)));
  expand.hidden = false;
  expand.addEventListener('click', () => look($('.gallery__img', live()[shown]) ? live()[shown] : live().find((slide) => $('.gallery__img', slide))));
  track.addEventListener('click', (event) => {
    const slide = event.target.closest('.gallery__img')?.parentElement;
    if (slide) look(slide);
  });
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
  // Which other choices can still be made from here, and the chosen value beside each option's name.
  const now = chosen();
  $$('[data-option-chosen]').forEach((el) => (el.textContent = now[el.dataset.optionChosen - 1] || ''));
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
  const barChoice = $('[data-buybar-choice]');
  if (barChoice) barChoice.textContent = variant.options.join(' · ');

  if (qty) {
    variant.max ? (qty.dataset.max = qtyInput.max = variant.max) : (delete qty.dataset.max, qtyInput.removeAttribute('max'));
    setQty(qtyInput.value);
  }

  // The address is this exact choice; what an ad added to it stays.
  const url = new URL(location.href);
  url.searchParams.set('variant', variant.id);
  history.replaceState(history.state, '', url);

  const swapped = regroup(variant.media);
  const photo = slides.find((slide) => +slide.dataset.mediaId === variant.media);
  if (photo && !photo.hidden) {
    goTo(photo, swapped);
    show(live().indexOf(photo), swapped);
  }

  if (status) {
    const said = ok ? status.dataset.chosen.replace('[price]', variant.price) : status.dataset.chosenOut;
    status.textContent = said.replace('[option]', variant.title);
  }
};

// Phones: an option's pills swipe sideways in one row; the chosen pill is brought to its middle.
const reveal = (smooth) => inputs.forEach(({ checked, parentElement: pill }) => {
  const row = pill.parentElement;
  if (checked) row.scrollTo({ left: pill.offsetLeft - row.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, behavior: smooth && !calm ? 'smooth' : 'instant' });
});
reveal();

inputs.forEach((input) => input.addEventListener('change', () => (update(match(chosen())), reveal(true))));

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
  // "Seen" includes still below the screen: the bar never comes before the button.
  let mainSeen = true;
  let footerSeen = false;
  const set = () => {
    const on = phone.matches && !mainSeen && !footerSeen;
    bar.classList.toggle('is-on', on);
    // The pop-ups sit above the bar while it shows.
    root.style.setProperty('--buybar', on ? `${bar.offsetHeight}px` : '0px');
  };
  bar.hidden = false;
  new IntersectionObserver(([entry]) => ((mainSeen = entry.isIntersecting), set()), { rootMargin: '0px 0px 99999px 0px' }).observe(main);
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
