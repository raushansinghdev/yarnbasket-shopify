/*
  Yarn Basket · cart.js (docs/cart-plan.md)
  Add to cart without leaving the page, the added-to-cart pop-up, the cart drawer, the instant stepper, Undo and
  gift-note autosave. Without it every form still works: Add to cart and the header's cart button go to /cart,
  which is a plain form.
  Every change asks Shopify for the cart's fresh HTML in the same request, so prices, stock and discounts always
  come from Shopify. Changes go one at a time through a queue.
*/

const base = window.Shopify?.routes?.root || '/';
const drawer = document.getElementById('CartDrawer');
const page = document.querySelector('[data-cart-page]');
const sectionId = page ? page.dataset.sectionId : 'cart-drawer';
const S = JSON.parse(document.getElementById('CartStrings')?.textContent || '{}');
// Undo the t filter's &#39; escapes (these go into textContent).
for (const k in S) S[k] = new DOMParser().parseFromString(S[k], 'text/html').body.textContent;
// What went wrong, in the shop's words: Shopify's own reason, or ours when the request never arrived.
const why = (err) => (err instanceof Error ? S.offline : err?.description || err?.message) || S.error;
// A refusal is a double pulse (theme.js has the single one).
const no = () => navigator.vibrate?.([30, 60, 30]);
const fmt = (s = '', o = {}) => s.replace(/\[(\w+)\]/g, (_, k) => o[k] ?? '');
const countLabel = (n) => (n === 1 ? S.one : S.other.replace('99', n));
const box = () => (page || drawer)?.querySelector('[data-cart-root]');
const total = () => box()?.querySelector('.cart-summary__now, .cart-bar__now')?.textContent.trim() || '';

/* ---------- Saying what happened ----------
   While the drawer is open everything behind it is inert, the header's status line included, so it has its own. */
// A reward step that changed is said after the change itself (offers-plan §5.6).
let rewardNews = '';
const say = (msg) => {
  if (msg && rewardNews) msg += ` ${rewardNews}`;
  rewardNews = '';
  const live = drawer?.open ? drawer.querySelector('[data-cart-live]') : document.querySelector('[data-cart-status]');
  if (!live || !msg) return;
  live.textContent = '';
  setTimeout(() => (live.textContent = msg), 80);
};
// The header's count and badge (theme.js). quiet: we say something better ourselves.
const counted = (count) => document.dispatchEvent(new CustomEvent('cart:updated', { detail: { item_count: count, quiet: true } }));

/* ---------- Requests, one at a time ---------- */
let chain = Promise.resolve();
let pending = 0;
const enqueue = (job, quiet) => {
  pending++;
  if (!quiet) box()?.classList.add('is-busy');
  const run = chain.then(job).finally(() => {
    if (--pending === 0) box()?.classList.remove('is-busy');
  });
  chain = run.catch(() => {});
  return run;
};
const send = (url, body) =>
  fetch(base + url, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw data;
    return data;
  });
const withSections = (body) => Object.assign(body, { sections: sectionId, sections_url: location.pathname });
// A product form as one item, sent as `items`: only that shape keeps Shopify's stock limit.
const asItems = (form) => {
  const data = new FormData(form);
  const item = { id: +data.get('id'), quantity: +data.get('quantity') || 1 };
  const properties = {};
  for (const [k, v] of data) {
    const m = k.match(/^properties\[(.+)\]$/);
    if (m && v !== '') properties[m[1]] = v;
  }
  if (Object.keys(properties).length) item.properties = properties;
  if (data.get('selling_plan')) item.selling_plan = +data.get('selling_plan');
  return { items: [item] };
};
const fresh = () => fetch(`${location.pathname}?sections=${sectionId}`).then((r) => r.json()).then((s) => render(s[sectionId]));

/* ---------- Refreshing the cart in place ----------
   Lines with taps not yet sent keep their own element; other lines keep their photo (no flash). Undo rows stay
   after the line they followed. Focus is put back and nothing on screen moves (cart-rows.js). */
const dirty = new Set();
// Where focus is, in a form that survives the refresh ("this line's +", or an id).
const PARTS = ['.qty__minus', '.qty__plus', '.qty__input', '.cart-line__title', '.cart-undo__btn'];
const focusPath = (el) => {
  const line = el.closest?.('.cart-line, .cart-undo');
  const part = line && PARTS.find((sel) => el.matches(sel));
  if (part) return `[data-key="${CSS.escape(line.dataset.key)}"] ${part}`;
  return el.id ? `#${CSS.escape(el.id)}` : '';
};
const render = (html) => {
  const root = box();
  const next = html && new DOMParser().parseFromString(html, 'text/html').querySelector('[data-cart-root]');
  if (!root || !next) return;
  const active = document.activeElement;
  const focusAt = root.contains(active) ? focusPath(active) : '';
  const top = root.querySelector('[data-scroll]')?.scrollTop;
  window.ybCart.before?.();
  const oldList = root.querySelector('[data-lines]');
  const list = next.querySelector('[data-lines]');
  if (oldList && list) {
    // Shopify re-keys a line when its discounts change: then found by its variant.
    let prev;
    [...oldList.children].forEach((was) => {
      let now = was;
      if (was.matches('.cart-undo')) prev ? prev.after(was) : list.prepend(was);
      else if ((now = list.querySelector(`:scope > [data-key="${CSS.escape(was.dataset.key)}"]`) || list.querySelector(`:scope > [data-variant="${was.dataset.variant}"]`))) {
        if (dirty.has(was.dataset.key)) now.replaceWith((now = was));
        else now.firstElementChild.replaceWith(was.firstElementChild);
      }
      prev = now;
    });
  }
  const was = root.querySelector('[data-rewards]');
  const wasPct = was?.querySelector('[data-rewards-fill]')?.style.getPropertyValue('--pct');
  const note = root.querySelector('[data-cart-note]');
  const nextNote = next.querySelector('[data-cart-note]');
  if (note && nextNote) nextNote.replaceWith(note);
  root.replaceChildren(...next.childNodes);
  root.dataset.count = next.dataset.count;
  const scroller = root.querySelector('[data-scroll]');
  scroller?.scrollTo({ top, behavior: 'instant' });
  if (focusAt) root.querySelector(focusAt)?.focus({ preventScroll: true });
  if (!pending) root.classList.remove('is-busy');
  // Rewards: the bar moves from where it was, or from empty for a new goal; a goal reached or lost is said.
  const now = root.querySelector('[data-rewards]');
  const moved = now && now.dataset.state !== was?.dataset.state;
  if (moved) rewardNews = now.querySelector('[data-rewards-text]').textContent;
  const fill = wasPct && now?.querySelector('[data-rewards-fill]');
  if (fill) {
    fill.style.width = moved ? 0 : wasPct;
    fill.offsetWidth;
    fill.style.width = '';
  }
  document.dispatchEvent(new CustomEvent('cart:rendered'));
};

/* ---------- Quantity ---------- */
const timers = new Map();
const lineOf = (key) => box()?.querySelector(`.cart-line[data-key="${CSS.escape(key)}"]`);
const showQty = (li, n) => {
  const qty = li.querySelector('[data-qty]');
  const minus = qty.querySelector('.qty__minus');
  const plus = qty.querySelector('.qty__plus');
  qty.querySelector('input').value = n;
  qty.dataset.value = n;
  // Minus stops at 1, plus at the limit.
  [[minus, n <= 1], [plus, n >= (+qty.dataset.max || Infinity)]].forEach(([b, off]) => (off ? b.setAttribute('aria-disabled', 'true') : b.removeAttribute('aria-disabled')));
};
const lineNote = (li, msg, error) => {
  const note = li?.querySelector('[data-line-note]');
  if (!note) return;
  note.textContent = msg;
  note.hidden = !msg;
  note.classList.toggle('is-error', !!error);
};
// Why a line can't go higher: the stock, or the most one order can hold (Theme settings → Cart).
const limitNote = (li) => ('capped' in li.dataset ? S.cap : S.max);
const failed = (key, err) => {
  const msg = why(err);
  no();
  const tell = () => {
    lineNote(lineOf(key), msg, true);
    say(msg);
  };
  // No fresh cart either (offline): put the lines back as Shopify last had them, a removed one included.
  return fresh().then(tell, () => {
    const row = box()?.querySelector(`.cart-undo[data-key="${CSS.escape(key)}"]`);
    if (row?.line) {
      row.line.gone = 0;
      row.replaceWith(row.line);
    }
    box()?.querySelectorAll('.cart-line').forEach((li) => {
      li.classList.remove('is-busy');
      if (li.querySelector('[data-qty]')) showQty(li, +li.dataset.qty);
    });
    dirty.clear();
    tell();
  });
};
// gone: the twin lines' keys, once the line has left the page.
const commit = (key, quantity, gone) => {
  clearTimeout(timers.get(key));
  timers.delete(key);
  dirty.delete(key);
  const li = lineOf(key);
  const { title, variant, properties } = li?.dataset || {};
  li?.classList.add('is-busy');
  // Shopify re-keys a line when its discounts change: find it by what it is.
  let more;
  return enqueue(() => {
    const d = (lineOf(key) || [...box().querySelectorAll(`.cart-line[data-variant="${variant}"]`)].find((l) => l.dataset.properties === properties))?.dataset;
    key = d?.key || key;
    more = d ? d.more : gone;
    if (!more) return send('cart/change.js', withSections({ id: key, quantity }));
    // One product on several lines (snippets/cart-line): the total here, 0 for the rest.
    const updates = { [key]: quantity };
    more.split(' ').forEach((k) => (updates[k] = 0));
    return send('cart/update.js', withSections({ updates }));
  })
    .then((cart) => {
      render(cart.sections?.[sectionId]);
      counted(cart.item_count);
      // As the cart now shows it (the key may have changed).
      if (quantity > 0) say(fmt(S.updated, { title, quantity: box().querySelector(`.cart-line[data-variant="${variant}"]`)?.dataset.qty || quantity, subtotal: total() }));
      return cart;
    })
    .catch((err) => failed(key, err));
};

/* ---------- Remove, and Undo ---------- */
const remove = (li) => {
  // Removing a focused field fires its change again.
  if (li.gone) return;
  li.gone = 1;
  const { key, title, variant, properties, plan } = li.dataset;
  const row = document.createElement('li');
  const text = document.createElement('span');
  const undo = document.createElement('button');
  row.className = 'cart-undo';
  row.line = li;
  Object.assign(row.dataset, { key, title, variant, properties, qty: Math.max(1, +li.dataset.qty || 1) });
  if (plan) row.dataset.plan = plan;
  text.textContent = fmt(S.removed, { title });
  Object.assign(undo, { type: 'button', className: 'cart-undo__btn', textContent: S.undo });
  undo.dataset.undo = '';
  undo.setAttribute('aria-label', fmt(S.undoLabel, { title }));
  row.append(text, undo);
  // The line folds down into the slim Undo row.
  const from = li.offsetHeight;
  li.replaceWith(row);
  undo.focus({ preventScroll: true });
  row.animate?.([{ height: `${from}px` }, { height: `${row.offsetHeight}px` }], { duration: 300, easing: 'cubic-bezier(.65, 0, .35, 1)' });
  commit(key, 0, li.dataset.more).then((cart) => cart && say(fmt(S.removedStatus, { title })));
};
const restore = (row) => {
  // One Undo adds the line once, however many taps.
  if (row.hasAttribute('aria-busy')) return;
  const d = row.dataset;
  const item = { id: +d.variant, quantity: +d.qty || 1 };
  const props = JSON.parse(d.properties || 'null');
  if (props && Object.keys(props).length) item.properties = props;
  if (d.plan) item.selling_plan = +d.plan;
  row.setAttribute('aria-busy', 'true');
  enqueue(() => send('cart/add.js', withSections({ items: [item] })))
    .then((res) => {
      row.remove();
      render(res.sections?.[sectionId]);
      counted(+box()?.dataset.count);
      const li = lineOf(d.key) || box()?.querySelector(`.cart-line[data-variant="${d.variant}"]`);
      li?.querySelector('.cart-line__title')?.focus();
      say(fmt(S.restored, { title: d.title }));
    })
    .catch((err) => {
      row.removeAttribute('aria-busy');
      say(why(err));
    });
};

/* ---------- Gift note: saved as you type ---------- */
let noteTimer;
const saveNote = (field) => {
  clearTimeout(noteTimer);
  noteTimer = null;
  return enqueue(() => send('cart/update.js', { note: field.value }), true)
    .then(() => {
      const saved = field.closest('[data-cart-note]')?.querySelector('[data-note-saved]');
      if (!saved) return;
      saved.hidden = false;
      setTimeout(() => (saved.hidden = true), 2400);
    })
    .catch(() => {});
};

document.addEventListener('input', (event) => {
  const field = event.target;
  if (field.matches('[data-note]')) {
    const left = field.closest('[data-cart-note]').querySelector('[data-note-left]');
    const n = field.maxLength - field.value.length;
    left.textContent = left.dataset.template.replace('999', n);
    if (n === 20 || n === 10 || n === 0) say(left.textContent);
    field.closest('[data-cart-note]').querySelector('[data-note-saved]').hidden = true;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => saveNote(field), 600);
  } else if (field.matches('.cart-line .qty__input')) dirty.add(field.closest('.cart-line').dataset.key);
});

document.addEventListener('change', (event) => {
  const input = event.target;
  if (!input.matches('.cart-line .qty__input')) return;
  const li = input.closest('.cart-line');
  const max = +input.max || Infinity;
  let n = Math.round(+input.value);
  if (Number.isNaN(n) || input.value === '') n = +li.dataset.qty;
  if (n <= 0) return remove(li);
  if (n > max) {
    n = max;
    lineNote(li, limitNote(li));
  }
  showQty(li, n);
  if (n !== +li.dataset.qty) commit(li.dataset.key, n);
  else dirty.delete(li.dataset.key);
});

document.addEventListener('keydown', (event) => {
  // Enter in a quantity saves it; never submits the form (that goes to checkout).
  if (event.key === 'Enter' && event.target.matches('.cart-line .qty__input')) {
    event.preventDefault();
    event.target.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

/* ---------- The added-to-cart pop-up (decision D2): assets/cart-toast.js, fetched with the first add ---------- */
let returnFocus = null;
let pop = null;
const popSrc = document.getElementById('CartToastTemplate')?.dataset.src;
const loadPop = () => (pop ||= popSrc ? import(popSrc).catch(() => (pop = null)) : null);
const toast = (title, image, error) => loadPop()?.then((m) => m?.toast(title, image, error, returnFocus));
const hideToast = () => pop?.then((m) => m?.hideToast());

// Checkout with the cart as it is now: a change can redraw it and replace the pressed button.
const checkout = () => {
  const form = box()?.querySelector('[data-cart-form]');
  form?.requestSubmit(form.querySelector('[name="checkout"]'));
};

/* ---------- Add to cart, anywhere (product page, Little extras) ---------- */
document.addEventListener('submit', (event) => {
  const form = event.target;

  // Cart forms: queued changes land first, so a removed line can't reach checkout.
  if (form.matches('[data-cart-form]')) {
    if (event.defaultPrevented) return;
    if (pending || timers.size || noteTimer) {
      event.preventDefault();
      timers.forEach((_, key) => commit(key, +lineOf(key)?.querySelector('.qty__input').value || 0));
      const note = form.querySelector('[data-note]');
      if (noteTimer && note) saveNote(note);
      chain.then(checkout);
    }
    return;
  }

  if (!form.matches('form[action*="/cart/add"]') || event.defaultPrevented) return;
  event.preventDefault();
  const button = event.submitter || form.querySelector('[type="submit"]');
  if (button?.getAttribute('aria-busy') === 'true') return;
  const label = button?.querySelector('[data-add-label]');
  const original = label?.textContent;
  const error = form.querySelector('[data-add-error]');
  // The product page shows its stepper at once (product-buy.js).
  const own = form.matches('[data-product-form]') && window.ybCart.adding;
  // The most of one piece per order counts what the cart already holds.
  const adding = asItems(form).items[0];
  const have = +box()?.querySelector(`.cart-line[data-variant="${adding.id}"]`)?.dataset.qty || 0;
  if (S.capCount && have + adding.quantity > S.capCount) {
    const msg = have ? fmt(S.capHave, { have }) : S.cap;
    toast(msg, null, true);
    say(msg);
    return no();
  }
  button?.setAttribute('aria-busy', 'true');
  if (label) {
    button.style.minWidth = `${button.offsetWidth}px`;
    label.textContent = S.adding;
  }
  if (error) error.hidden = true;
  returnFocus = button;
  own ? own(1) : loadPop();

  enqueue(() => send('cart/add.js', withSections(asItems(form))))
    .then((res) => {
      const item = res.items[0];
      render(res.sections?.[sectionId]);
      const count = +box()?.dataset.count;
      counted(count);
      const variant = item.product_has_only_default_variant ? '' : item.variant_title;
      say(fmt(S.added, { title: item.product_title, count: countLabel(count) }));
      if (own) own(0);
      else toast(variant ? `${item.product_title} · ${variant}` : item.product_title, item.image);
      if (label) {
        label.textContent = own ? original : S.addedButton;
        setTimeout(() => (label.textContent = original), 2000);
      }
      // A "Little extras" card goes once it's in the cart.
      const extra = form.closest('.extra');
      if (extra) {
        const grid = extra.parentElement;
        extra.remove();
        if (!grid.children.length) grid.closest('.extras')?.remove();
      }
    })
    .catch((err) => {
      const msg = why(err);
      no();
      own?.(-1);
      if (label) label.textContent = original;
      if (error) {
        error.textContent = msg;
        error.hidden = false;
      } else {
        toast(msg, null, true);
        say(msg);
      }
    })
    .finally(() => {
      button?.removeAttribute('aria-busy');
      setTimeout(() => button && (button.style.minWidth = ''), 2000);
    });
});

/* ---------- The drawer ----------
   Opening adds a history entry, so the phone's Back button closes it instead of leaving the page. */
let opener = null;
let goTo = null;
// again: its history entry is already there (Forward).
const openDrawer = (from, again) => {
  if (!drawer || drawer.open) return;
  opener = from || (again ? document.querySelector('.site-header__cart') : document.activeElement);
  hideToast();
  drawer.showModal();
  drawer.querySelector('#CartDrawerTitle')?.focus();
  if (!again) history.pushState({ cartDrawer: true }, '');
  // The drawer's product rows (assets/cart-rows.js), fetched with the first opening.
  if (drawer.dataset.addons) import(drawer.dataset.addons).then((m) => m.default()).catch(() => {});
};
const closeDrawer = (fromHistory) => {
  if (!drawer?.open || 'closing' in drawer.dataset) return;
  drawer.dataset.closing = '';
  const finish = () => {
    clearTimeout(fallback);
    drawer.close();
    delete drawer.dataset.closing;
    drawer.querySelectorAll('.cart-undo').forEach((row) => row.remove());
    opener?.focus?.({ preventScroll: true });
  };
  const fallback = setTimeout(finish, 450);
  drawer.addEventListener('transitionend', function done(event) {
    if (event.target !== drawer || event.pseudoElement || event.propertyName !== 'transform') return;
    drawer.removeEventListener('transitionend', done);
    finish();
  });
  if (!fromHistory && history.state?.cartDrawer) history.back();
};
addEventListener('popstate', () => {
  if (goTo) {
    const [where] = goTo;
    goTo = null;
    if (where) location.href = where;
    else checkout();
  } else if (history.state?.cartDrawer) openDrawer(0, 1);
  else if (drawer?.open) closeDrawer(true);
});
// A page loaded on an entry that was "drawer open" (a reload, bfcache): start closed.
addEventListener('pageshow', (event) => {
  if (history.state?.cartDrawer) history.replaceState(null, '');
  // Restored by Back with the cart it had when it was left: fetch it as it is now.
  if (event.persisted) fresh().then(() => counted(+box()?.dataset.count)).catch(() => {});
});

if (drawer) {
  drawer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDrawer();
  });
  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) closeDrawer();
  });
  // Leaving from the drawer (a link, Checkout): step back over its history entry.
  drawer.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || !history.state?.cartDrawer) return;
    event.preventDefault();
    goTo = [link.href];
    history.back();
  });
  drawer.addEventListener('submit', (event) => {
    if (event.defaultPrevented || !history.state?.cartDrawer) return;
    event.preventDefault();
    goTo = [null];
    history.back();
  });
}

document.addEventListener('click', (event) => {
  const target = event.target;
  const step = target.closest('.cart-line [data-step]');
  if (step) {
    const li = step.closest('.cart-line');
    const key = li.dataset.key;
    if (step.getAttribute('aria-disabled') === 'true') return step.dataset.step > 0 && lineNote(li, limitNote(li));
    const n = Math.max(0, (+li.querySelector('.qty__input').value || 0) + +step.dataset.step);
    if (n === 0) return remove(li);
    showQty(li, n);
    dirty.add(key);
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => commit(key, n), 350));
    return;
  }
  if (target.closest('[data-undo]')) return restore(target.closest('.cart-undo'));
  if (target.closest('[data-cart-close]')) return closeDrawer();
  // The amount beside Checkout: on to the price details, with focus, so keyboards and screen readers arrive too.
  if (target.closest('[data-details]')) {
    const at = box().querySelector('[data-details-at]');
    at.scrollIntoView();
    return at.focus({ preventScroll: true });
  }
  if (target.closest('[data-cart-view]')) return openDrawer(returnFocus || document.querySelector('.site-header__cart'));
  // A plain click on the header's cart opens the drawer; new-tab clicks go to /cart.
  const cartLink = target.closest('.site-header__cart');
  if (cartLink && drawer && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    openDrawer(cartLink);
  }
});

// For rewards.js, cart-rows.js, product-buy.js.
window.ybCart = { enqueue, send, withSections, render, say, counted, box, sectionId, S, fmt, why, commit };
