/*
  Yarn Basket · collection.js (docs/collection-plan.md)
  The collection page only. Filters, "Clear all", Sort and the sheet's crafts (which are other collections) swap the
  results in place and add a step to the browser's history, so Back undoes the last choice. The phone's Filter and Sort buttons open their sheets, "Load more" adds
  the next page, and coming Back from a product restores the pages that were loaded and the place on the page.
  Without this script every choice is a plain link and Load more opens the next page.
*/

const page = document.querySelector('[data-collection]');
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (page) {
  const status = page.querySelector('[data-collection-status]');
  const sheet = page.querySelector('[data-filter-sheet]');
  const region = (name, scope = page) => scope.querySelector(`[data-region="${name}"]`);
  const tell = (text) => {
    status.textContent = '';
    setTimeout(() => (status.textContent = text || ''), 60);
  };

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
  const fetchSection = async (href) => {
    const url = new URL(href, location.href);
    url.searchParams.set('section_id', page.dataset.sectionId);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return new DOMParser().parseFromString(await response.text(), 'text/html');
  };
  const transition = (update) => (document.startViewTransition && !reduceMotion.matches && !root.classList.contains('lite') ? document.startViewTransition(update) : update());

  /* ---------- Filters and sort, in place ---------- */
  // Only the newest choice counts: an older reply that arrives late is dropped.
  let latest = 0;
  // Several choices made in the open sheet are one step back.
  let sheetStep = false;
  // Long groups opened with "Show all" stay open while choices are made.
  const all = new Set();
  const showAll = () => all.forEach((group) => page.querySelectorAll(`.cf-rows[data-group="${CSS.escape(group)}"]`).forEach((list) => (list.dataset.all = '')));
  const swap = async (href, { history: step = 'push', said, focus } = {}) => {
    const mine = ++latest;
    const active = document.activeElement;
    const from = focus?.[0] || active?.closest?.('[data-region]')?.dataset.region;
    const key = focus?.[1] || active?.dataset?.key;
    page.classList.add('is-busy');
    try {
      const doc = await fetchSection(href);
      if (mine !== latest) return;
      const open = [...page.querySelectorAll('details[data-dd][open]')].map((dd) => dd.dataset.dd);
      const scrolled = sheet.querySelector('.cf-sheet__body')?.scrollTop;
      const was = region('title').dataset.docTitle;
      await transition(() => {
        page.querySelectorAll('[data-region]').forEach((old) => {
          const fresh = region(old.dataset.region, doc);
          if (fresh) old.replaceWith(fresh);
        });
        open.forEach((dd) => page.querySelector(`details[data-dd="${CSS.escape(dd)}"]`)?.setAttribute('open', ''));
        showAll();
        if (scrolled) sheet.querySelector('.cf-sheet__body').scrollTop = scrolled;
      })?.updateCallbackDone;
      // A craft chosen in the sheet is another collection: the tab's title follows the heading.
      const title = region('title');
      const moved = title.dataset.docTitle !== was;
      if (moved) document.title = title.dataset.docTitle;
      if (step === 'push' && !(sheet.open && sheetStep)) history.pushState(null, '', href);
      else if (step) history.replaceState(null, '', href);
      if (sheet.open) sheetStep = true;
      remember(1);
      const results = region('results');
      fadeIn(results);
      window.ybArrive?.(results);
      // Focus stays on the control that was used; when it is gone (a chip taken off), on the next one, then the title.
      if (from) {
        const home = region(from);
        const next = (key && home?.querySelector(`[data-key="${CSS.escape(key)}"]`)) || home?.querySelector('a, button, summary') || page.querySelector('[data-collection-top]');
        next.focus({ preventScroll: true });
      }
      // Scrolled past the top of the list (the bar is stuck): bring the new list's start into view.
      if (!sheet.open && page.getBoundingClientRect().top < -200) page.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      tell(said || `${moved ? `${title.textContent.trim()}, ` : ''}${region('count')?.textContent.trim()}`);
    } catch {
      if (mine === latest) location.assign(href);
    } finally {
      if (mine === latest) page.classList.remove('is-busy');
    }
  };

  page.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-swap]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button) return;
    event.preventDefault();
    if (!link.matches('[data-sort]')) return swap(link.href);
    // One order at a time, so choosing it closes its list; focus goes back to the Sort button or pill.
    const said = page.dataset.sorted.replace('[sort]', link.textContent.trim());
    const dialog = link.closest('dialog');
    if (dialog) closeSheet(dialog);
    else link.closest('.cf-dd')?.removeAttribute('open');
    swap(link.href, { said, focus: dialog ? ['float', 'open-sort'] : ['bar', 'dd-sort'] });
  });
  page.addEventListener('click', (event) => {
    const list = event.target.closest('[data-show-all]')?.closest('.cf-rows');
    if (!list) return;
    all.add(list.dataset.group);
    showAll();
    list.querySelector('a.cf-extra')?.focus();
  });
  // Tick boxes, radio buttons and the switch are links: they answer to Space as well as Enter, and the arrow keys
  // move between the radio buttons of a group.
  page.addEventListener('keydown', (event) => {
    const item = event.target.closest?.('a[role]');
    if (!item) return;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (event.key === ' ') item.click();
    else if (step && item.matches('[role="radio"]')) {
      const radios = [...item.parentElement.querySelectorAll('a[role="radio"]')];
      radios[(radios.indexOf(item) + step + radios.length) % radios.length].focus();
    } else return;
    event.preventDefault();
  });
  addEventListener('popstate', () => swap(location.href, { history: false }));

  // Desktop drop-downs close on Esc (focus returns to the pill) and on a click anywhere else.
  document.addEventListener('click', (event) => {
    page.querySelectorAll('.cf-dd[open]').forEach((dd) => dd.contains(event.target) || dd.removeAttribute('open'));
  });
  page.addEventListener('keydown', (event) => {
    const dd = event.key === 'Escape' && event.target.closest?.('.cf-dd[open]');
    if (!dd) return;
    dd.removeAttribute('open');
    dd.querySelector('summary').focus();
  });

  /* ---------- The phone sheets (Filter, Sort) ---------- */
  const closeSheet = (dialog) => {
    if (!dialog.open || 'closing' in dialog.dataset) return;
    const finish = () => {
      delete dialog.dataset.closing;
      dialog.close();
    };
    if (reduceMotion.matches) return finish();
    dialog.dataset.closing = '';
    const fallback = setTimeout(finish, 450);
    dialog.addEventListener('transitionend', function done(event) {
      if (event.target !== dialog || event.pseudoElement || event.propertyName !== 'transform') return;
      dialog.removeEventListener('transitionend', done);
      clearTimeout(fallback);
      finish();
    });
  };
  page.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-sheet-open]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.sheetOpen);
      if (dialog === sheet) sheetStep = false;
      dialog.showModal();
    } else if (event.target.closest('[data-sheet-close]') || event.target.matches('dialog[data-sheet]')) closeSheet(event.target.closest('dialog'));
  });
  // A group opened low in the sheet moves up, so its choices are in view (`toggle` does not bubble: caught on the way down).
  sheet.addEventListener('toggle', (event) => {
    if (event.target.open && sheet.open && !page.classList.contains('is-busy')) event.target.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }, true);
  page.querySelectorAll('dialog[data-sheet]').forEach((dialog) => {
    // Esc and light dismiss (closedby="any") arrive as `cancel`: slide out instead of vanishing.
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeSheet(dialog);
    });
    // The button that opened it was replaced if the list changed, so focus goes to the one there now.
    dialog.addEventListener('close', () => page.querySelector(`[data-sheet-open="${dialog.id}"]`)?.focus({ preventScroll: true }));
  });

  /* ---------- Load more ---------- */
  const addPage = async (href, focus) => {
    const doc = await fetchSection(href);
    const added = [...doc.querySelectorAll('[data-collection-grid] > li')];
    page.querySelector('[data-collection-grid]').append(...added);
    const box = page.querySelector('[data-collection-more]');
    const nextBox = doc.querySelector('[data-collection-more]');
    if (nextBox) box.replaceWith(nextBox);
    else box.remove();
    fadeIn(region('results'));
    window.ybArrive?.(region('results'));
    // Keyboard and screen-reader users land on the first new product.
    if (focus) added[0]?.querySelector('a')?.focus();
  };
  let pages = 1;
  page.addEventListener('click', async (event) => {
    const more = event.target.closest('[data-load-more]');
    if (!more || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (more.getAttribute('aria-disabled') === 'true') return;
    more.setAttribute('aria-disabled', 'true');
    try {
      await addPage(more.href, true);
      remember(pages + 1);
    } catch {
      location.assign(more.href);
    }
  });

  /* ---------- Back from a product: the same cards, the same place ----------
     Browsers that keep the page (the back/forward cache) need nothing. For the rest, the pages loaded and the scroll
     position are noted as the shopper leaves, and put back when they return with Back or Forward. */
  const note = () => `yb-collection:${location.pathname}${location.search}`;
  const remember = (n) => (pages = n);
  addEventListener('pagehide', () => {
    try { sessionStorage.setItem(note(), JSON.stringify({ pages, y: Math.round(scrollY) })); } catch {}
  });
  const came = performance.getEntriesByType('navigation')[0]?.type;
  let kept = null;
  try { kept = JSON.parse(sessionStorage.getItem(note())); } catch {}
  if (came === 'back_forward' && kept?.pages > 1) {
    (async () => {
      try {
        while (pages < kept.pages) {
          const more = page.querySelector('[data-load-more]');
          if (!more) break;
          await addPage(more.href, false);
          pages += 1;
        }
        scrollTo({ top: kept.y, behavior: 'instant' });
      } catch {}
    })();
  }
}
