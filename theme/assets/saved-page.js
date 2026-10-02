/*
  Yarn Basket · saved-page.js (docs/account-plan.md §8.3–§8.5)
  The Saved page: the saved list (placeholders first, then each card from sections/saved-item), removing with Undo,
  Share, a shared list (?list=a,b,c) with "Save all to my list", and Recently viewed. The list itself is kept by
  saved.js (loaded earlier by the header), through window.ybSaved.
*/

const page = document.querySelector('[data-saved-page]');
const api = window.ybSaved;

if (page && api) {
  const $ = (selector) => page.querySelector(selector);
  const grid = $('[data-saved-grid]');
  const title = $('[data-saved-title]');
  const bar = $('[data-saved-bar]');
  const line = $('[data-saved-line]');
  const empty = $('[data-saved-empty]');
  const goneNote = $('[data-saved-gone]');
  const errorNote = $('[data-saved-error]');
  const signin = $('[data-saved-signin]');
  const recent = $('[data-saved-recent]');
  const recentList = $('[data-saved-recent-list]');
  const status = $('[data-saved-page-status]');
  const text = page.dataset;
  const root = window.Shopify?.routes?.root || '/';

  const shared = (new URLSearchParams(location.search).get('list') || '').split(',').filter((h) => /^[\w-]+$/.test(h)).slice(0, 30);
  const isShared = shared.length > 0;
  const count = (n, one, other) => (n === 1 ? one : other.replace('99', n));
  const say = (words) => {
    status.textContent = '';
    setTimeout(() => (status.textContent = words), 60);
  };
  const fadeIn = (scope) => {
    if (document.documentElement.classList.contains('lite')) return;
    scope.querySelectorAll('.media img').forEach((img) => {
      if (img.complete) return;
      img.classList.add('img-wait');
      img.addEventListener('load', () => img.classList.replace('img-wait', 'img-in'), { once: true });
      img.addEventListener('error', () => img.classList.remove('img-wait'), { once: true });
    });
  };

  // One card per product, fetched once (6 at a time). null = the product is gone; a failed request can be retried.
  const cards = new Map();
  let running = 0;
  const waiting = [];
  const slot = () => (running < 6 ? (running++, Promise.resolve()) : new Promise((go) => waiting.push(go)));
  const done = () => (waiting.length ? waiting.shift()() : running--);
  const card = (handle) => {
    if (!cards.has(handle)) {
      const job = slot()
        .then(() => fetch(`${root}products/${handle}?section_id=saved-item`))
        .then((res) => {
          if (res.status === 404) return null;
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        // A product that's gone renders without a handle (Shopify answers 200 with an empty product).
        .then((html) => (html && new DOMParser().parseFromString(html, 'text/html').querySelector('.saved-item[data-handle]:not([data-handle=""])')) || null)
        .finally(done);
      job.catch(() => cards.delete(handle));
      cards.set(handle, job);
    }
    return cards.get(handle).then((li) => li?.cloneNode(true) ?? null);
  };
  const ghost = () => {
    const li = document.createElement('li');
    li.className = 'saved-ghost';
    li.setAttribute('aria-hidden', 'true');
    li.innerHTML = '<span></span><span></span>';
    return li;
  };
  const show = (scope) => {
    api.sync();
    fadeIn(scope);
    window.ybArrive?.(scope);
  };

  const head = (n) => {
    line.textContent = isShared ? count(n, text.tCountOne, text.tCountOther) : `${count(n, text.tCountOne, text.tCountOther)} · ${text.tOnDevice}`;
  };

  let drawing = 0;
  const draw = async () => {
    const turn = ++drawing;
    const handles = isShared ? shared : api.read();
    errorNote.hidden = true;
    goneNote.hidden = true;
    if (!handles.length) {
      grid.replaceChildren();
      bar.hidden = true;
      empty.hidden = false;
      if (signin) signin.hidden = true;
      drawRecent();
      return;
    }
    empty.hidden = true;
    bar.hidden = false;
    head(handles.length);
    if (signin) signin.hidden = isShared;
    grid.setAttribute('aria-busy', 'true');
    grid.replaceChildren(...handles.map(ghost));
    let failed = false;
    const items = await Promise.all(handles.map((h) => card(h).catch(() => ((failed = true), undefined))));
    if (turn !== drawing) return;
    const gone = handles.filter((h, i) => items[i] === null);
    grid.replaceChildren(...items.filter(Boolean));
    grid.removeAttribute('aria-busy');
    show(grid);
    if (gone.length) {
      goneNote.textContent = count(gone.length, text.tGoneOne, text.tGoneOther);
      goneNote.hidden = false;
      if (!isShared) gone.forEach((h) => api.set(h, false, 0, true));
    }
    head(grid.children.length);
    errorNote.hidden = !failed;
    if (!grid.children.length && !failed && !isShared) {
      bar.hidden = true;
      empty.hidden = false;
    }
    drawRecent();
  };

  // Recently viewed: up to 6 pieces seen lately that aren't in the list.
  const drawRecent = async () => {
    if (isShared) return;
    const mine = api.read();
    const handles = api.viewed().filter((h) => !mine.includes(h)).slice(0, 6);
    if (!handles.length) {
      recent.hidden = true;
      return;
    }
    const items = (await Promise.all(handles.map((h) => card(h).catch(() => null)))).filter(Boolean);
    recentList.replaceChildren(...items);
    recent.hidden = items.length === 0;
    if (items.length) show(recentList);
  };

  /* ---------- Removing (with Undo) and adding while on the page ---------- */
  document.addEventListener('saved:change', async ({ detail }) => {
    if (isShared) return;
    const { handle, on } = detail;
    if (!handle) return draw();
    const li = grid.querySelector(`[data-handle="${handle}"]`);
    if (!on && li) {
      const items = [...grid.children];
      const at = items.indexOf(li);
      const next = items[at + 1] || items[at - 1];
      const name = li.querySelector('.card__title')?.textContent.trim() || '';
      let undone = false;
      li.classList.add('is-leaving');
      setTimeout(() => {
        if (undone) return;
        li.remove();
        li.classList.remove('is-leaving');
        head(grid.children.length);
        if (!grid.children.length) draw();
      }, 220);
      (next?.querySelector('[data-save]') || title).focus({ preventScroll: !!next });
      say(text.tSaidRemoved);
      api.toast({
        head: text.tRemoved,
        title: name,
        action: text.tUndo,
        onAction: () => {
          undone = true;
          li.classList.remove('is-leaving');
          api.set(handle, true, at, true);
          empty.hidden = true;
          bar.hidden = false;
          grid.insertBefore(li, grid.children[at] || null);
          api.sync();
          head(grid.children.length);
          li.querySelector('[data-save]')?.focus();
          say(text.tSaidRestored);
        },
      });
    } else if (on && !li) {
      // Saved from Recently viewed: it joins the top of the list.
      const fresh = await card(handle).catch(() => null);
      if (!fresh) return draw();
      empty.hidden = true;
      bar.hidden = false;
      grid.prepend(fresh);
      show(grid);
      head(grid.children.length);
      recentList.querySelector(`[data-handle="${handle}"]`)?.remove();
      recent.hidden = recentList.children.length === 0;
    }
  });

  /* ---------- Share (phones: the share sheet, so WhatsApp is one tap; desktop: copy the link) ---------- */
  $('[data-saved-share]').addEventListener('click', async () => {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('list', api.read().slice(0, 30).join(','));
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: text.tShareTitle, url: url.href });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url.href);
      api.toast({ head: text.tCopied });
      say(text.tCopied);
    } catch {
      api.toast({ head: text.tShareTitle, title: url.href });
    }
  });

  /* ---------- A list someone shared ---------- */
  if (isShared) {
    title.textContent = text.tSharedTitle;
    document.title = `${text.tSharedTitle} – ${document.title.split(' – ').pop()}`;
    $('[data-saved-shared]').hidden = false;
    $('[data-saved-share]').hidden = true;
    const all = $('[data-saved-save-all]');
    all.hidden = false;
    all.addEventListener('click', () => {
      const here = [...grid.querySelectorAll('[data-handle]')].map((li) => li.dataset.handle);
      [...here].reverse().forEach((h) => api.set(h, true));
      api.toast({ head: text.tSavedAll });
      say(text.tSavedAll);
    });
  }

  $('[data-saved-retry]').addEventListener('click', draw);
  $('[data-saved-clear]').addEventListener('click', () => {
    api.clearViewed();
    recent.hidden = true;
    title.focus();
  });
  addEventListener('pageshow', (event) => event.persisted && draw());
  draw();
}
