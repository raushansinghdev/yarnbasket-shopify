/*
  Yarn Basket · search.js (docs/search-plan.md)
  Results as you type in the search panel, recent searches, and the results page's in-place sort and "Load more".
  theme.js opens and closes the panel and loads this file on first touch of anything search; the search page loads
  it directly. Without it, every search form still submits to /search.
*/

const panel = document.getElementById('SearchPanel');
const page = document.querySelector('[data-search-page]');
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const phone = matchMedia('(max-width: 767px), (max-height: 500px)');
const searchPath = document.querySelector('form[role="search"]')?.getAttribute('action') || '/search';
const MIN = 2;
const RECENT = 'yb-recent-searches';

/* ---------- Photos in new results fade in as they arrive (as theme.js does at page load) ---------- */
const fadeIn = (scope) => {
  if (root.classList.contains('lite')) return;
  scope.querySelectorAll('.media img').forEach((img) => {
    if (img.complete) return;
    img.classList.add('img-wait');
    img.addEventListener('load', () => img.classList.replace('img-wait', 'img-in'), { once: true });
    img.addEventListener('error', () => img.classList.remove('img-wait'), { once: true });
  });
};

/* ---------- The × in every search field ---------- */
document.querySelectorAll('[data-search-clear]').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
});

/* ---------- Recent searches: kept only in this browser, newest first, at most 4 ---------- */
const tidy = (text) => text.trim().replace(/\s+/g, ' ');
const readRecent = () => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT));
    return Array.isArray(list) ? list.filter((term) => typeof term === 'string').slice(0, 4) : [];
  } catch {
    return [];
  }
};
const writeRecent = (list) => {
  try {
    if (list.length) localStorage.setItem(RECENT, JSON.stringify(list));
    else localStorage.removeItem(RECENT);
  } catch {}
};
const remember = (text) => {
  const term = tidy(text).slice(0, 80);
  if (term.length < MIN) return;
  writeRecent([term, ...readRecent().filter((old) => old.toLowerCase() !== term.toLowerCase())].slice(0, 4));
};
const showRecent = () => {
  const box = panel?.querySelector('[data-search-recent]');
  if (!box) return;
  const template = box.querySelector('[data-search-recent-item]');
  const terms = readRecent();
  box.querySelector('[data-search-recent-list]').replaceChildren(...terms.map((term) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const link = item.querySelector('a');
    link.href = `${searchPath}?q=${encodeURIComponent(term)}&options%5Bprefix%5D=last`;
    link.querySelector('span').textContent = term;
    return item;
  }));
  box.hidden = terms.length === 0;
};
document.addEventListener('submit', (event) => {
  if (event.target.matches('form[role="search"]')) remember(event.target.elements.q?.value || '');
});

/* ---------- Results as you type ---------- */
if (panel) {
  const body = panel.querySelector('[data-search-body]');
  const start = panel.querySelector('[data-search-start]');
  const results = panel.querySelector('[data-search-results]');
  const note = panel.querySelector('[data-search-note]');
  const status = panel.querySelector('[data-search-status]');
  const inputs = [...document.querySelectorAll('[data-search-input]')];
  const field = () => document.getElementById(panel.classList.contains('is-attached') ? 'HeaderSearch' : 'SearchPanelInput');
  const cache = new Map();
  let current = '';
  let request = null;
  let typing = 0;
  let speaking = 0;

  // The status line speaks once typing has paused, so screen readers don't chatter on every letter.
  const say = (text, delay = 0) => {
    clearTimeout(speaking);
    speaking = setTimeout(() => {
      status.textContent = '';
      setTimeout(() => (status.textContent = text), 40);
    }, delay);
  };

  const suggestUrl = (q) => `${panel.dataset.suggestUrl}?${new URLSearchParams({
    q,
    section_id: 'predictive-search',
    'resources[type]': 'product,collection,page,query',
    'resources[limit]': phone.matches ? 4 : 6,
    'resources[limit_scope]': 'each',
    'resources[options][unavailable_products]': 'last',
    // Not the description: every one says "gift" and "handmade", which would match everything (plan §9).
    'resources[options][fields]': 'title,product_type,variants.title,tag',
  })}`;

  const reset = () => {
    request?.abort();
    request = null;
    current = '';
    clearTimeout(speaking);
    status.textContent = '';
    body.removeAttribute('aria-busy');
    results.hidden = true;
    results.replaceChildren();
    note.hidden = true;
    start.hidden = false;
    showRecent();
  };

  const show = (html) => {
    const found = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-ps]');
    if (!found) return fail();
    results.replaceChildren(found);
    fadeIn(results);
    body.removeAttribute('aria-busy');
    note.hidden = true;
    start.hidden = true;
    results.hidden = false;
    say(found.dataset.status, 900);
  };

  const fail = () => {
    body.removeAttribute('aria-busy');
    note.textContent = panel.dataset.error;
    note.hidden = false;
    say(panel.dataset.error);
  };

  const run = async (text) => {
    const q = tidy(text);
    if (q.length < MIN) return reset();
    if (q === current && (!results.hidden || request)) return;
    current = q;
    const url = suggestUrl(q);
    if (cache.has(url)) {
      request?.abort();
      request = null;
      return requestAnimationFrame(() => q === current && show(cache.get(url)));
    }
    request?.abort();
    const controller = (request = new AbortController());
    const timeout = setTimeout(() => controller.abort(), 5000);
    const slow = setTimeout(() => results.hidden && say(panel.dataset.loading), 400);
    body.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      cache.set(url, html);
      if (request === controller) requestAnimationFrame(() => q === current && show(html));
    } catch {
      // A newer search replaced this one: say nothing. A timeout or network error: say so; Enter still works.
      if (request === controller && q === current) fail();
    } finally {
      clearTimeout(timeout);
      clearTimeout(slow);
      if (request === controller) request = null;
    }
  };

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      clearTimeout(typing);
      clearTimeout(speaking);
      if (tidy(input.value).length < MIN) return run(input.value);
      typing = setTimeout(() => run(input.value), 150);
    });
    // ↓ from the field moves into the results (Tab works too).
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' || !panel.open) return;
      const first = targets()[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    });
  });

  // ↑ and ↓ step through the results; ↑ from the first one goes back to the field.
  const targets = () => [...body.querySelectorAll('a[href], button')].filter((el) => (el.checkVisibility ? el.checkVisibility() : el.offsetParent !== null));
  body.addEventListener('keydown', (event) => {
    if ((event.key !== 'ArrowDown' && event.key !== 'ArrowUp') || !event.target.matches('a, button')) return;
    event.preventDefault();
    const list = targets();
    const next = list[list.indexOf(event.target) + (event.key === 'ArrowDown' ? 1 : -1)];
    (next || (event.key === 'ArrowUp' ? field() : null))?.focus();
  });

  body.addEventListener('click', (event) => {
    if (event.target.closest('[data-search-recent-clear]')) {
      writeRecent([]);
      showRecent();
      field().focus();
    } else if (event.target.closest('a[href]') && current) {
      remember(current);
    }
  });

  // Phones: starting to scroll the results puts the keyboard away, so more of them fit on screen.
  body.addEventListener('scroll', () => {
    if (phone.matches && document.activeElement?.matches('[data-search-input]')) document.activeElement.blur();
  }, { passive: true });

  panel.addEventListener('search:open', () => {
    showRecent();
    run(field().value);
  });
  showRecent();
  if (panel.open) run(field().value);
}

/* ---------- Results page: sort in place, "Load more" ---------- */
if (page) {
  const q = new URLSearchParams(location.search).get('q');
  if (q) remember(q);

  const fetchSection = async (href) => {
    const url = new URL(href, location.href);
    url.searchParams.set('section_id', page.dataset.sectionId);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return new DOMParser().parseFromString(await response.text(), 'text/html');
  };
  const transition = (update) => (document.startViewTransition && !reduceMotion.matches && !root.classList.contains('lite') ? document.startViewTransition(update) : update());

  // Sorting swaps the results in place (no reload), so the Apply button is only for when this script isn't running.
  page.querySelectorAll('[data-search-sort-apply]').forEach((button) => (button.hidden = true));
  page.addEventListener('change', async (event) => {
    const form = event.target.closest('[data-search-sort]');
    if (!form) return;
    const href = `${form.action}?${new URLSearchParams(new FormData(form))}`;
    try {
      const doc = await fetchSection(href);
      const fresh = doc.querySelector('[data-search-page-results]');
      const old = page.querySelector('[data-search-page-results]');
      if (!fresh || !old) throw new Error('missing results');
      transition(() => old.replaceWith(fresh));
      history.replaceState(history.state, '', href);
      fadeIn(fresh);
      window.ybArrive?.(fresh);
    } catch {
      location.assign(href);
    }
  });

  page.addEventListener('click', async (event) => {
    const more = event.target.closest('[data-load-more]');
    if (!more || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (more.getAttribute('aria-disabled') === 'true') return;
    more.setAttribute('aria-disabled', 'true');
    try {
      const doc = await fetchSection(more.href);
      const results = page.querySelector('[data-search-page-results]');
      const box = more.closest('[data-search-more]');
      const added = [...doc.querySelectorAll('[data-search-grid] > li')];
      const grid = page.querySelector('[data-search-grid]');
      if (grid) grid.append(...added);
      else if (added.length) box.before(doc.querySelector('[data-search-grid]'));
      const help = [...doc.querySelectorAll('[data-search-help] > li')];
      const list = page.querySelector('[data-search-help]');
      if (list) list.append(...help);
      else if (help.length) results.append(doc.querySelector('.search-page__help'));
      const nextBox = doc.querySelector('[data-search-more]');
      if (nextBox) box.replaceWith(nextBox);
      else box.remove();
      fadeIn(results);
      window.ybArrive?.(results);
      // Keyboard and screen-reader users land on the first new product.
      (added[0] || help[0])?.querySelector('a')?.focus();
    } catch {
      location.assign(more.href);
    }
  });
}
