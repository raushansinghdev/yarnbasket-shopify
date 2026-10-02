/*
  Yarn Basket · rewards.js (docs/offers-plan.md §5.4)
  The free gift. Shopify never adds a "Buy X get Y" item by itself, so after every cart refresh this adds the gift
  once the order reaches its amount, and takes it out again if the order drops below. "No thanks" (the gift line's
  remove button) is remembered in a hidden cart attribute, and the rewards line then offers "Add it back".
  The gift's price always comes from Shopify's automatic discount; nothing here decides what anything costs. If the
  gift arrives still charged (the discount is missing or was edited), it's taken straight back out and never re-added
  on this page: nobody should find a charged item they didn't choose in their cart.
  Loaded only when a gift is set up (sections/cart-drawer.liquid), after cart.js.
*/

const cart = window.ybCart;

if (cart) {
  const { enqueue, send, withSections, render, say, counted, box, sectionId, S } = cart;
  const info = () => box()?.querySelector('[data-rewards]')?.dataset;
  let busy = false;
  // If Shopify refuses a change (the last gift just sold out), stop asking until the next page.
  let stuck = false;

  // One request changes the gift (by variant: 1 adds it, 0 removes it) and, when asked, the "no thanks" note.
  const change = (body, spoken, focus) => {
    busy = true;
    return enqueue(() => send('cart/update.js', withSections(body)))
      .then((res) => {
        render(res.sections?.[sectionId]);
        counted(res.item_count);
        const d = info();
        if (spoken && !(d?.giftKey && +d.giftPaid > 0)) say(spoken);
        if (focus) box()?.querySelector(focus)?.focus({ preventScroll: true });
      })
      .catch(() => (stuck = true))
      .finally(() => {
        busy = false;
        check();
      });
  };

  const check = () => {
    const d = info();
    if (!d?.giftVariant || busy) return;
    const earned = +d.total >= +d.giftAt;
    if (d.giftKey && +d.giftPaid > 0) {
      stuck = true;
      console.warn('Yarn Basket: the free gift has no discount (docs/offers-plan.md §5.4), so it was taken out.');
      change({ updates: { [d.giftVariant]: 0 } });
    } else if (stuck) {
      return;
    } else if (earned && !d.giftKey && !('giftDeclined' in d) && 'giftAvailable' in d) {
      change({ updates: { [d.giftVariant]: 1 } }, S.giftAdded);
    } else if (!earned && d.giftKey) {
      change({ updates: { [d.giftVariant]: 0 } }, S.giftLost.replace('[amount]', d.giftAtMoney));
    }
  };

  // Capture: settled before the drawer's own link and form handling sees the click (it then sees defaultPrevented).
  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-gift-remove]');
    const add = event.target.closest('[data-gift-add]');
    const d = info();
    if (!d?.giftVariant || !(remove || add)) return;
    event.preventDefault();
    if (busy) return;
    if (remove) {
      // Focus goes to "Add it back", which is where the shopper can undo this.
      change({ updates: { [d.giftVariant]: 0 }, attributes: { _gift_declined: '1' } }, S.giftRemoved, '[data-gift-add]');
    } else {
      change({ updates: { [d.giftVariant]: 1 }, attributes: { _gift_declined: '' } }, S.giftAdded, '.cart-line.is-gift .cart-line__title');
    }
  }, true);

  document.addEventListener('cart:rendered', check);
  check();
}
