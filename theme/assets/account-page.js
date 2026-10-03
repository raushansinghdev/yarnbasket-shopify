/*
  Yarn Basket · account-page.js (docs/account-hub-plan.md §4)
  The account page: the Saved and Recently viewed rows (this browser's lists, kept by saved.js; Recently viewed can be
  cleared), and Buy again on an order card (adds what's still for sale through cart.js's queue, then says so in the
  card). Without it the rows stay hidden and Buy again is a plain /cart/add form.
*/

const page = document.querySelector('[data-account-page]');
const saved = window.ybSaved;
const cart = window.ybCart;

if (page) {
  const text = page.dataset;
  const root = window.Shopify?.routes?.root || '/';
  const count = (n, one, other) => (n === 1 ? one : other.replace('99', n));

  /* ---------- Saved and Recently viewed: the same cards as the Saved page, without their buttons ---------- */
  const card = (handle) =>
    fetch(`${root}products/${handle}?section_id=saved-item`)
      .then((res) => (res.ok ? res.text() : ''))
      .then((html) => {
        const li = html && new DOMParser().parseFromString(html, 'text/html').querySelector('.saved-item[data-handle]:not([data-handle=""])');
        li?.querySelector('.saved-item__actions')?.remove();
        return li || null;
      })
      .catch(() => null);
  const ghost = () => {
    const li = document.createElement('li');
    li.className = 'saved-ghost';
    li.setAttribute('aria-hidden', 'true');
    li.innerHTML = '<span></span><span></span>';
    return li;
  };
  const fill = (name, handles) => {
    const row = page.querySelector(`[data-account-row="${name}"]`);
    if (!row || !handles.length) return;
    const list = row.querySelector('[data-account-list]');
    // Placeholders first (the count is known now), so the page doesn't jump when the cards arrive.
    list.replaceChildren(...handles.map(ghost));
    row.hidden = false;
    Promise.all(handles.map(card)).then((cards) => {
      const found = cards.filter(Boolean);
      list.replaceChildren(...found);
      row.hidden = found.length === 0;
      saved.sync();
      window.ybArrive?.(row);
    });
  };
  if (saved) {
    const mine = saved.read().slice(0, 8);
    fill('saved', mine);
    fill('recent', saved.viewed().filter((h) => !mine.includes(h)).slice(0, 8));

    // Clear Recently viewed, as on the Saved page: the row goes, and focus moves to the page's heading.
    page.querySelector('[data-account-clear]')?.addEventListener('click', () => {
      saved.clearViewed();
      page.querySelector('[data-account-row="recent"]').hidden = true;
      page.querySelector('[data-account-title]')?.focus();
      saved.say(text.tCleared);
    });
  }

  /* ---------- Buy again ----------
     Capture phase, so this runs before cart.js's own Add to cart (which only knows one-item product forms). */
  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target.closest?.('[data-buy-again]');
      if (!form || !page.contains(form)) return;
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      const label = form.querySelector('[data-buy-label]');
      const note = form.closest('.order-card').querySelector('[data-buy-note]');
      if (button.getAttribute('aria-busy') === 'true') return;

      if ('demo' in text) {
        note.textContent = 'Preview only: nothing was added.';
        return;
      }
      if (!cart) return form.submit();

      const ids = form.querySelectorAll('[name="items[][id]"]');
      const qtys = form.querySelectorAll('[name="items[][quantity]"]');
      const items = [...ids].map((input, i) => ({ id: +input.value, quantity: +qtys[i].value || 1 }));
      const skipped = +form.dataset.skipped || 0;
      const original = label.textContent;
      button.setAttribute('aria-busy', 'true');
      button.style.minWidth = `${button.offsetWidth}px`;
      label.textContent = text.tAdding;
      note.textContent = '';

      cart
        .enqueue(() => cart.send('cart/add.js', cart.withSections({ items })))
        .then((res) => {
          cart.render(res.sections?.[cart.sectionId]);
          cart.counted(+cart.box()?.dataset.count);
          const added = res.items.reduce((n, item) => n + item.quantity, 0);
          let words = count(added, text.tAddedOne, text.tAddedOther);
          if (skipped) words += ` ${count(skipped, text.tSkippedOne, text.tSkippedOther)}`;
          // "Added 2 pieces to your cart. View cart": the link opens the cart drawer (cart.js).
          const view = document.createElement('a');
          view.href = `${root}cart`;
          view.dataset.cartView = '';
          view.textContent = text.tViewCart;
          note.replaceChildren(`${words} `, view);
        })
        // The card's note is a status line, so screen readers hear this too.
        .catch((err) => (note.textContent = err?.description || err?.message || ''))
        .finally(() => {
          label.textContent = original;
          button.removeAttribute('aria-busy');
          button.style.minWidth = '';
        });
    },
    true
  );
}
