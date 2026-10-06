/*
  Yarn Basket · product-buy.js (docs/product-page-plan.md "Round 8"). Loaded only by sections/product.liquid.
  The product page has no quantity field. Once the chosen option is in the cart, the buy box (and the slim bar from
  750px) shows the cart's own stepper and "View cart" in place of Add to cart and Buy it now (snippets/buy-in-cart).
  This file keeps that in step with the cart, both ways: it reads the drawer's line for the chosen option after
  every cart change, and a tap on the stepper changes that line through cart.js. The server draws the right state
  on arrival. Add to cart shows the stepper the moment it's pressed, and there is no pop-up here.
*/

const cart = window.ybCart;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const form = $('[data-product-form]');
const holders = $$('[data-buy], [data-buybar]');

if (cart && form && holders.length) {
  const variants = JSON.parse($('[data-variants]')?.textContent || '[]');
  const chosen = () => +new FormData(form).get('id');
  const lineOf = (id) => cart.box()?.querySelector(`.cart-line[data-variant="${id}"]`);
  const line = () => lineOf(chosen());
  const seen = (el) => !!el?.getClientRects().length;
  // Taps not yet answered by the cart: their option and the number reached.
  let waiting = null;
  let adding = false;
  let timer;

  // Why plus has stopped: the most per order, or the stock.
  const explain = (on, max) => {
    const most = $('[data-limit]');
    const capped = on && most && max >= +most.dataset.cap;
    if (most) most.hidden = !capped;
    $('[data-limit-stock]').hidden = !on || capped;
  };

  const paint = (n) => {
    const max = variants.find((v) => v.id === chosen())?.max || Infinity;
    const had = document.activeElement;
    const holder = holders.find((h) => h.contains(had));
    holders.forEach((h) => {
      h.classList.toggle('is-in', n > 0);
      const qty = $('[data-in] [data-qty]', h);
      if (!qty) return;
      const minus = $('.qty__minus', qty);
      const plus = $('.qty__plus', qty);
      qty.dataset.value = $('input', qty).value = n;
      minus.setAttribute('aria-label', n <= 1 ? minus.dataset.labelRemove : minus.dataset.labelDecrease);
      n >= max ? plus.setAttribute('aria-disabled', 'true') : plus.removeAttribute('aria-disabled');
    });
    explain(n > 0 && n >= max, max);
    // The focused control was replaced: focus goes to what took its place.
    if (holder && !seen(had)) $(n > 0 ? '.qty__plus' : '[data-add]', holder)?.focus({ preventScroll: true });
  };
  // The cart is the truth, except while taps are still on their way.
  const sync = () => waiting || paint(+line()?.dataset.qty || 0);

  // The line is looked up when the taps go: Shopify re-keys a line when its discounts change (the free gift).
  const send = () => {
    const sent = waiting;
    // Add to cart is still on its way: these taps go when it has landed.
    if (adding) return;
    const li = lineOf(sent.id);
    const done = () => {
      if (waiting === sent) waiting = null;
      sync();
    };
    if (!li) return done();
    cart.commit(li.dataset.key, sent.n).then((res) => {
      if (res && !sent.n) cart.say(cart.fmt(cart.S.removedStatus, { title: li.dataset.title }));
      done();
    });
  };
  const step = (n) => {
    if (!waiting && !line()) return sync();
    waiting = { id: waiting?.id || chosen(), n };
    paint(n);
    clearTimeout(timer);
    timer = setTimeout(send, 350);
  };
  // Add to cart, from cart.js: 1 sent (the stepper shows at once), 0 added, -1 refused (Add to cart comes back).
  cart.adding = (state) => {
    adding = state > 0;
    // Until Shopify has answered, View cart has no tick (snippets/buy-in-cart).
    holders.forEach((h) => h.classList.toggle('is-adding', adding));
    if (adding) {
      waiting = { id: chosen(), n: 1 };
      return paint(1);
    }
    clearTimeout(timer);
    if (!state && waiting && waiting.n !== 1) return send();
    waiting = null;
    sync();
  };
  const now = () => (waiting ? waiting.n : +line()?.dataset.qty || 0);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-in] [data-step]');
    if (!button) return;
    if (button.getAttribute('aria-disabled') === 'true') return cart.say($('.pdp__limit:not([hidden])')?.textContent.replace(/\s+/g, ' ').trim());
    step(Math.max(0, now() + +button.dataset.step));
  });
  // View cart is a link to /cart; cart.js opens the drawer instead.
  document.addEventListener('click', (event) => event.target.closest('[data-in] [data-cart-view]') && event.preventDefault(), true);
  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.matches('[data-in] .qty__input')) return;
    const max = +input.max || Infinity;
    const n = Math.round(+input.value);
    step(Number.isNaN(n) || input.value === '' ? now() : Math.min(max, Math.max(0, n)));
  });
  // Enter in the number saves it; it never submits the product form.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !event.target.matches('[data-in] .qty__input')) return;
    event.preventDefault();
    event.target.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Another option: taps for the one before go now.
  document.addEventListener('variant:change', () => {
    if (waiting) {
      clearTimeout(timer);
      send();
      waiting = null;
    }
    sync();
  });
  document.addEventListener('cart:rendered', sync);
  // The drawer hands focus back to its opener, which may have been replaced meanwhile.
  document.getElementById('CartDrawer')?.addEventListener('close', () => {
    if (seen(document.activeElement) && document.activeElement !== document.body) return;
    const holder = holders.find(seen);
    (seen($('[data-in] [data-cart-view]', holder)) ? $('[data-in] [data-cart-view]', holder) : $('[data-add]', holder))?.focus({ preventScroll: true });
  });
  sync();
}
