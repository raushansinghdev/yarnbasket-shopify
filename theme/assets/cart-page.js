/*
  Yarn Basket · cart-page.js (docs/cart-plan.md §4.2)
  The cart page's pinned Checkout bar on phones, kept out of cart.js so other pages don't download it. Loaded by
  sections/cart.liquid, after cart.js. Without it the bar stays hidden and the summary's own Checkout is the way
  on. The rows at the end of the cart are assets/cart-rows.js, shared with the drawer.
*/

const page = document.querySelector('[data-cart-page]');

/* ---------- Pinned Checkout bar ---------- */
let barWatch;
const setupBar = () => {
  barWatch?.disconnect();
  const bar = page?.querySelector('[data-cart-bar]');
  const button = page?.querySelector('.cart-summary__checkout');
  document.documentElement.style.removeProperty('--buybar');
  if (!bar || !button) return;
  // Shown whenever the summary's own Checkout is off screen, above or below. --buybar lifts the added-to-cart
  // pop-up over the bar and leaves room for it at the end of the page.
  barWatch = new IntersectionObserver(([entry]) => {
    bar.classList.toggle('is-shown', !entry.isIntersecting);
    document.documentElement.style.setProperty('--buybar', `${entry.isIntersecting ? 0 : bar.offsetHeight}px`);
  });
  barWatch.observe(button);
};
setupBar();

// The redraw also replaces the bar and the summary's button.
document.addEventListener('cart:rendered', setupBar);
