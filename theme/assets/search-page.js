/*
  Yarn Basket · search-page.js (docs/search-results-plan.md)
  The results page only: sort and craft chips swap the results in place, "Load more", spoken updates, and the
  header's lens jumping to the box on this page. Loaded by sections/search.liquid after search.js (which keeps
  recent searches and the panel). Without it, sort has its Apply button, chips and Load more are plain links.
*/

const page = document.querySelector('[data-search-page]');
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Photos in new results fade in as they arrive (as theme.js does at page load).
const fadeIn = (scope) => {
  if (root.classList.contains('lite')) return;
  scope.querySelectorAll('.media img').forEach((img) => {
    if (img.complete) return;
    img.classList.add('img-wait');
    img.addEventListener('load', () => img.classList.replace('img-wait', 'img-in'), { once: true });
    img.addEventListener('error', () => img.classList.remove('img-wait'), { once: true });
  });
};

if (page) {
  const status = page.querySelector('[data-search-page-status]');
  const tell = (text) => {
    status.textContent = '';
    setTimeout(() => (status.textContent = text || ''), 60);
  };

  // The header's lens jumps to the box on this page instead of opening a second one (plan §4.3). Capture phase,
  // so theme.js's panel opener never sees the click.
  const box = document.getElementById('SearchPageInput');
  document.addEventListener('click', (event) => {
    const lens = event.target.closest('[data-search-open]');
    if (!lens || !box) return;
    event.stopPropagation();
    lens.closest('dialog')?.close();
    box.focus({ preventScroll: true });
    box.select();
    box.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }, true);

  // Only the newest sort or chip counts: an older reply that arrives late is dropped.
  let latest = 0;
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
    const mine = ++latest;
    try {
      const doc = await fetchSection(href);
      if (mine !== latest) return;
      const fresh = doc.querySelector('[data-search-page-results]');
      const old = page.querySelector('[data-search-page-results]');
      if (!fresh || !old) throw new Error('missing results');
      await transition(() => old.replaceWith(fresh))?.updateCallbackDone;
      history.replaceState(history.state, '', href);
      fadeIn(fresh);
      window.ybArrive?.(fresh);
      tell(page.dataset.sorted.replace('[sort]', event.target.selectedOptions[0]?.text.trim()));
    } catch {
      if (mine === latest) location.assign(href);
    }
  });

  // Craft chips swap the count, chips and results in place; focus stays on the chip you chose.
  page.addEventListener('click', async (event) => {
    const chip = event.target.closest('[data-search-chips] a');
    if (!chip || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    page.querySelector('[data-search-page-results]')?.classList.add('is-busy');
    const mine = ++latest;
    try {
      const doc = await fetchSection(chip.href);
      if (mine !== latest) return;
      const fresh = doc.querySelector('[data-search-body]');
      const old = page.querySelector('[data-search-body]');
      if (!fresh || !old) throw new Error('missing results');
      fresh.querySelectorAll('[data-search-sort-apply]').forEach((button) => (button.hidden = true));
      await transition(() => old.replaceWith(fresh))?.updateCallbackDone;
      history.replaceState(history.state, '', chip.href);
      fadeIn(fresh);
      window.ybArrive?.(fresh);
      const now = fresh.querySelector(`[data-chip="${CSS.escape(chip.dataset.chip)}"]`);
      now?.focus({ preventScroll: true });
      tell(`${now?.getAttribute('aria-label') || now?.textContent.trim() || ''}. ${fresh.querySelector('[data-search-count]')?.textContent.trim() || ''}`);
    } catch {
      if (mine === latest) location.assign(chip.href);
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
