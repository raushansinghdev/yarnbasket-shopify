/*
  Yarn Basket · saved.js (docs/account-plan.md)
  Saved items, kept only in this browser: the hearts on cards and the product page, the Saved counts, the "Saved"
  pop-up, recently viewed, the drawer's account row opening Shopify's account sheet, and signing out. The header loads it on
  every page; the Saved page adds saved-page.js, which uses window.ybSaved below.
*/

const KEY = 'yb-saved';
const VIEWED = 'yb-recent-products';
const MAX = 60;
const template = document.getElementById('SavedToastTemplate');
const status = document.querySelector('[data-saved-status]');
const onSavedPage = !!document.querySelector('[data-saved-page]');

const read = (key) => {
  try {
    const list = JSON.parse(localStorage.getItem(key));
    return Array.isArray(list) ? list.filter((h) => typeof h === 'string' && /^[\w-]+$/.test(h)) : [];
  } catch {
    return [];
  }
};
const write = (key, list) => {
  try {
    if (list.length) localStorage.setItem(key, JSON.stringify(list));
    else localStorage.removeItem(key);
  } catch {}
};

const say = (text) => {
  if (!status) return;
  status.textContent = '';
  setTimeout(() => (status.textContent = text), 60);
};

// Every heart and count on the page shows the list as it is now.
const sync = () => {
  const list = read(KEY);
  document.querySelectorAll('[data-save]').forEach((button) => {
    button.setAttribute('aria-pressed', String(list.includes(button.dataset.save)));
    button.hidden = false;
  });
  document.querySelectorAll('[data-saved-count]').forEach((count) => {
    count.textContent = list.length;
    count.hidden = list.length === 0;
  });
};

// Add (to the front, or back where it was) or remove one product, then tell the page (unless quiet).
const set = (handle, on, at = 0, quiet = false) => {
  const list = read(KEY).filter((h) => h !== handle);
  if (on) list.splice(Math.min(at, list.length), 0, handle);
  write(KEY, list.slice(0, MAX));
  sync();
  if (!quiet) document.dispatchEvent(new CustomEvent('saved:change', { detail: { handle, on } }));
};

/* ---------- The pop-up: "Saved · View saved" (and the Saved page's "Removed · Undo") ---------- */
let toastEl = null;
let toastTimer;
const hideToast = () => {
  const t = toastEl;
  if (!t) return;
  toastEl = null;
  clearTimeout(toastTimer);
  t.classList.add('is-leaving');
  setTimeout(() => t.remove(), 320);
};
const toast = ({ head, title = '', image, action, onAction, plain = false, link = true }) => {
  if (!template) return;
  toastEl?.remove();
  clearTimeout(toastTimer);
  const t = template.content.firstElementChild.cloneNode(true);
  t.querySelector('[data-toast-head]').textContent = head;
  t.querySelector('.saved-toast__title').textContent = title;
  const img = t.querySelector('img');
  if (image) {
    img.src = image;
    img.hidden = false;
  } else t.querySelector('.saved-toast__media').remove();
  // plain: a message that isn't about one product (signed out), so no heart.
  if (plain) t.querySelector('.saved-toast__head .icon')?.remove();
  const view = t.querySelector('[data-toast-view]');
  const button = t.querySelector('[data-toast-action]');
  if (!link) view.remove();
  if (action) {
    view.remove();
    button.textContent = action;
    button.addEventListener('click', () => {
      onAction();
      hideToast();
    });
  } else button.remove();
  t.querySelector('[data-saved-toast-close]').addEventListener('click', hideToast);
  // It waits while a finger, pointer or keyboard is on it, like the cart's pop-up.
  const run = () => (toastTimer = setTimeout(hideToast, 5000));
  t.addEventListener('pointerenter', () => clearTimeout(toastTimer));
  t.addEventListener('pointerleave', run);
  t.addEventListener('focusin', () => clearTimeout(toastTimer));
  t.addEventListener('focusout', (e) => !t.contains(e.relatedTarget) && run());
  t.addEventListener('keydown', (e) => e.key === 'Escape' && hideToast());
  document.querySelectorAll('.cart-toast, .saved-toast').forEach((old) => old.remove());
  document.body.append(t);
  toastEl = t;
  run();
};

/* ---------- Hearts ---------- */
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-save]');
  if (!button) return;
  const on = button.getAttribute('aria-pressed') !== 'true';
  set(button.dataset.save, on);
  if (on) {
    button.classList.remove('is-popping');
    requestAnimationFrame(() => button.classList.add('is-popping'));
    button.addEventListener('animationend', () => button.classList.remove('is-popping'), { once: true });
  }
  // The Saved page answers its own changes (a card folds away, with Undo).
  if (onSavedPage) return;
  say(on ? template?.dataset.saidSaved : template?.dataset.saidRemoved);
  if (on) toast({ head: template?.dataset.head, title: button.dataset.title, image: button.dataset.image });
  else hideToast();
});

// Another tab changed the list.
addEventListener('storage', (event) => {
  if (event.key === KEY || event.key === null) {
    sync();
    document.dispatchEvent(new CustomEvent('saved:change', { detail: {} }));
  }
});
// A page restored by Back shows the list as it is now, not as it was.
addEventListener('pageshow', (event) => event.persisted && sync());

/* ---------- Recently viewed: the last 8 product pages ---------- */
const viewed = document.querySelector('[data-viewed]')?.dataset.viewed;
if (viewed) write(VIEWED, [viewed, ...read(VIEWED).filter((h) => h !== viewed)].slice(0, 8));

/* ---------- The drawer's account row opens Shopify's account sheet ----------
   On phones the header doesn't show the account button, so its host is "summoned" (present, not visible) while the
   sheet is open; the sheet itself is in the top layer. Without the component the row is a plain link. */
const account = document.querySelector('[data-account]');
if (account) {
  const rows = document.querySelectorAll('[data-account-open]');
  customElements.whenDefined('shopify-account').then(() => rows.forEach((row) => row.setAttribute('aria-haspopup', 'dialog')));
  rows.forEach((row) => row.addEventListener('click', (event) => {
    if (!customElements.get('shopify-account') || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    row.closest('dialog')?.close();
    if (getComputedStyle(account).display === 'none') account.classList.add('is-summoned');
    account.showModal();
  }));
  account.addEventListener('close', () => {
    if (!account.classList.contains('is-summoned')) return;
    account.classList.remove('is-summoned');
    document.querySelector('[data-menu-open]')?.focus();
  });
}

/* ---------- Signing out (docs/account-hub-plan.md §6) ----------
   Recently viewed is cleared, so a shared family phone doesn't show the last person's browsing; Saved stays (guests
   save too). The page Shopify brings them back to says "You're signed out", once nobody is signed in there. */
const OUT = 'yb-signed-out';
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-sign-out]');
  if (!link || link.getAttribute('href') === '#') return;
  write(VIEWED, []);
  try {
    sessionStorage.setItem(OUT, '1');
  } catch {}
});
try {
  if (sessionStorage.getItem(OUT)) {
    sessionStorage.removeItem(OUT);
    if (!document.querySelector('[data-signed-in]') && template) {
      const has = read(KEY).length > 0;
      const { signedOut, signedOutText } = template.dataset;
      say(has ? `${signedOut}. ${signedOutText}` : signedOut);
      toast({ head: signedOut, title: has ? signedOutText : '', plain: true, link: has });
    }
  }
} catch {}

window.ybSaved = { read: () => read(KEY), set, sync, viewed: () => read(VIEWED), clearViewed: () => write(VIEWED, []), toast, hideToast, say };
sync();
