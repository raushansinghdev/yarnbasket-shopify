/*
  Yarn Basket · cart-toast.js (docs/cart-plan.md §6.1, decision D2)
  The added-to-cart pop-up: photo, "Added to cart", the name, View cart and ×. cart.js fetches this file with the first
  add, so pages where nothing is added never download it. It never takes focus; it stays about 8 seconds and pauses
  while a finger, pointer or focus is on it.
*/

let toastEl = null;
let toastTimer;
let toastLeft = 0;
let toastStart = 0;
let returnFocus = null;
const holds = new Set();
export const hideToast = () => {
  const t = toastEl;
  if (!t) return;
  toastEl = null;
  clearTimeout(toastTimer);
  holds.clear();
  if (t.contains(document.activeElement)) returnFocus?.focus({ preventScroll: true });
  t.classList.add('is-leaving');
  setTimeout(() => t.remove(), 320);
};
const runToast = () => {
  toastStart = Date.now();
  toastTimer = setTimeout(hideToast, toastLeft);
};
const hold = (why, on) => {
  if (on) {
    if (!holds.size) {
      clearTimeout(toastTimer);
      toastLeft -= Date.now() - toastStart;
    }
    holds.add(why);
  } else if (holds.delete(why) && !holds.size) runToast();
};
export const toast = (title, image, error, back) => {
  returnFocus = back;
  const template = document.getElementById('CartToastTemplate');
  if (!template) return;
  toastEl?.remove();
  clearTimeout(toastTimer);
  holds.clear();
  const t = template.content.firstElementChild.cloneNode(true);
  t.classList.toggle('is-error', !!error);
  t.querySelector('.cart-toast__title').textContent = title;
  const img = t.querySelector('img');
  if (image) {
    const url = new URL(image, location.href);
    url.searchParams.set('width', '112');
    img.src = url.href;
    img.hidden = false;
  }
  t.addEventListener('pointerenter', () => hold('pointer', true));
  t.addEventListener('pointerleave', () => hold('pointer', false));
  t.addEventListener('focusin', () => hold('focus', true));
  t.addEventListener('focusout', (e) => !t.contains(e.relatedTarget) && hold('focus', false));
  t.addEventListener('keydown', (e) => e.key === 'Escape' && hideToast());
  document.body.append(t);
  toastEl = t;
  toastLeft = error ? 10000 : 8000;
  runToast();
};

document.addEventListener('click', (event) => event.target.closest('[data-toast-close]') && hideToast());
