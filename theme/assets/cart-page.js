/*
  Yarn Basket · cart-page.js (docs/cart-plan.md §4.2)
  The cart page's own extras, kept out of cart.js so other pages don't download them: the pinned Checkout bar on
  phones, and "Little extras". Loaded by sections/cart.liquid, after cart.js. Without it the page still works:
  the bar stays hidden and the summary's own Checkout is the way on.
*/

const page = document.querySelector('[data-cart-page]');

let barWatch;
const setupBar = () => {
  barWatch?.disconnect();
  const bar = page?.querySelector('[data-cart-bar]');
  const button = page?.querySelector('.cart-summary__checkout');
  if (!bar || !button) return;
  // Shown only while the summary's own Checkout is still below the screen.
  barWatch = new IntersectionObserver(([entry]) => bar.classList.toggle('is-shown', !entry.isIntersecting && entry.boundingClientRect.top > 0));
  barWatch.observe(button);
};
setupBar();
// cart.js redraws the cart after every change, which replaces the bar and the button.
document.addEventListener('cart:rendered', setupBar);

const slot = page?.querySelector('[data-cart-extras]');
if (slot) {
  fetch(slot.dataset.url)
    .then((r) => (r.ok ? r.text() : ''))
    .then((html) => {
      const extras = new DOMParser().parseFromString(html, 'text/html').querySelector('.extras');
      if (extras) slot.replaceChildren(extras);
    })
    .catch(() => {});
}
