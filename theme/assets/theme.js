/*
  Yarn Basket · theme.js
  Small, dependency-free behaviour shared by every page. Loaded as a module (deferred).
  Anything section-specific lives in that section.
*/

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Photos fade in as they arrive ----------
   Only images still loading are held back; ones already painted (and the hero's main photo) are left alone.
   If this script never runs, every image simply shows as normal. */
document.querySelectorAll(root.classList.contains('lite') ? ':not(*)' : '.media img:not([fetchpriority="high"])').forEach((img) => {
  if (img.complete) return;
  img.classList.add('img-wait');
  img.addEventListener('load', () => { img.classList.remove('img-wait'); img.classList.add('img-in'); }, { once: true });
  img.addEventListener('error', () => img.classList.remove('img-wait'), { once: true });
});

/* ---------- Header: hide while scrolling down, return on scroll up ---------- */
{
  let lastY = scrollY;
  let ticking = false;
  const threshold = 160;

  const update = () => {
    const y = Math.max(scrollY, 0);
    const delta = y - lastY;
    root.classList.toggle('header-scrolled', y > 4);
    if (Math.abs(delta) > 6) {
      root.classList.toggle('header-hidden', delta > 0 && y > threshold && !document.querySelector('dialog[open]'));
      lastY = y;
    }
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

/* ---------- Desktop nav: the stitch mark and dropdowns ---------- */
{
  const nav = document.querySelector('[data-header-nav]');

  if (nav) {
    const items = [...nav.querySelectorAll('[data-nav-item]')];
    const home = items.findIndex((item) => item.classList.contains('is-here'));
    let lit = -1;

    // Move the mark to item i (or nowhere, -1). The old mark shrinks toward the new link and the new one grows from the old side.
    const light = (i) => {
      if (i === lit) return;
      const prev = items[lit];
      const next = items[i];
      if (prev) {
        prev.style.setProperty('--mark-from', i === -1 ? 'center' : i > lit ? 'right' : 'left');
        prev.classList.remove('is-lit');
      }
      if (next) {
        next.style.setProperty('--mark-from', lit === -1 ? 'center' : i > lit ? 'left' : 'right');
        next.classList.add('is-lit');
      }
      lit = i;
    };
    light(home);
    nav.classList.add('is-ready');

    const openItem = () => items.findIndex((item) => item.classList.contains('is-open'));
    const settle = () => {
      if (nav.matches(':hover') || nav.contains(document.activeElement)) return;
      const open = openItem();
      light(open > -1 ? open : home);
    };

    items.forEach((item, i) => {
      item.addEventListener('pointerenter', () => light(i));
      item.addEventListener('focusin', () => light(i));
    });
    nav.addEventListener('pointerleave', () => requestAnimationFrame(settle));
    nav.addEventListener('focusout', () => requestAnimationFrame(settle));

    // Dropdowns: a disclosure button (not an ARIA menu), so Tab moves through the links as usual.
    const timers = new WeakMap();
    const setOpen = (item, open, by = 'click') => {
      clearTimeout(timers.get(item));
      const button = item.querySelector('[data-sub-toggle]');
      if (open) items.forEach((other) => other !== item && other.classList.contains('is-open') && setOpen(other, false));
      item.classList.toggle('is-open', open);
      item.dataset.openedBy = open ? by : '';
      button.setAttribute('aria-expanded', String(open));
      if (open) light(items.indexOf(item));
      else requestAnimationFrame(settle);
    };
    const closeAll = () => items.forEach((item) => item.classList.contains('is-open') && setOpen(item, false));

    nav.querySelectorAll('[data-sub-toggle]').forEach((button) => {
      const item = button.closest('[data-nav-item]');
      button.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        // A hover already opened it: the click confirms, it doesn't slam it shut.
        if (open && item.dataset.openedBy === 'hover') item.dataset.openedBy = 'click';
        else setOpen(item, !open);
      });
      item.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        clearTimeout(timers.get(item));
        if (!item.classList.contains('is-open')) timers.set(item, setTimeout(() => setOpen(item, true, 'hover'), 90));
      });
      item.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'mouse') return;
        clearTimeout(timers.get(item));
        if (item.dataset.openedBy === 'hover') timers.set(item, setTimeout(() => setOpen(item, false), 220));
      });
      item.addEventListener('focusout', (event) => {
        if (!item.contains(event.relatedTarget) && item.classList.contains('is-open')) setOpen(item, false);
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && item.classList.contains('is-open')) {
          event.stopPropagation();
          setOpen(item, false);
          button.focus();
        }
      });
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) closeAll();
    });
    // When the header slides away on scroll, any open panel goes with it.
    addEventListener('scroll', () => root.classList.contains('header-hidden') && closeAll(), { passive: true });
  }
}

/* ---------- Tooltips (.tip): Esc hides them until the pointer or focus moves to something else (WCAG 1.4.13) ---------- */
if (document.querySelector('.tip')) {
  let owner = null;
  addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    owner = document.querySelector('.icon-btn:hover, .icon-btn:focus-visible');
    if (owner?.querySelector('.tip')) root.classList.add('tips-off');
  });
  const wake = (event) => {
    if (owner && !owner.contains(event.target)) {
      root.classList.remove('tips-off');
      owner = null;
    }
  };
  addEventListener('pointerover', wake, { passive: true });
  addEventListener('focusin', wake);
}

/* ---------- Menu drawer (native <dialog>: focus trap, Esc and inert page come built in) ---------- */
{
  const drawer = document.getElementById('MenuDrawer');
  const openers = document.querySelectorAll('[data-menu-open]');

  if (drawer) {
    const setExpanded = (value) => openers.forEach((b) => b.setAttribute('aria-expanded', String(value)));

    const finish = () => {
      drawer.close();
      delete drawer.dataset.closing;
      drawer.style.translate = '';
      drawer.style.removeProperty('--backdrop');
    };
    // Slide out first, then close, so every browser gets the exit animation (not just those with `overlay`).
    const closeDrawer = () => {
      if (!drawer.open || 'closing' in drawer.dataset) return;
      drawer.dataset.closing = '';
      const fallback = setTimeout(finish, 450);
      drawer.addEventListener('transitionend', function done(event) {
        if (event.target !== drawer || event.pseudoElement || event.propertyName !== 'transform') return;
        drawer.removeEventListener('transitionend', done);
        clearTimeout(fallback);
        finish();
      });
    };

    openers.forEach((button) =>
      button.addEventListener('click', () => {
        drawer.showModal();
        setExpanded(true);
      })
    );
    drawer.querySelectorAll('[data-menu-close]').forEach((button) => button.addEventListener('click', closeDrawer));
    // Esc and light dismiss (closedby="any") arrive as `cancel`: animate instead of vanishing.
    drawer.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDrawer();
    });
    // A tap on the dimmed backdrop closes it (for browsers without closedby="any").
    drawer.addEventListener('click', (event) => {
      if (event.target === drawer) closeDrawer();
    });
    drawer.addEventListener('close', () => setExpanded(false));
    // Following a link closes the drawer at once, so the back button returns to a clean page.
    drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => drawer.close()));

    // Swipe left to close: the panel follows the finger, then either closes or springs back.
    let startX = null;
    let startY = 0;
    let startT = 0;
    let dx = 0;
    let dragging = false;
    drawer.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') return;
      startX = event.clientX;
      startY = event.clientY;
      startT = event.timeStamp;
      dx = 0;
      dragging = false;
    });
    drawer.addEventListener('pointermove', (event) => {
      if (startX === null) return;
      const moveX = event.clientX - startX;
      if (!dragging) {
        // Only a mostly sideways, leftward move counts; anything else is a scroll.
        if (Math.abs(event.clientY - startY) > Math.abs(moveX)) { startX = null; return; }
        if (moveX > -10) return;
        dragging = true;
        drawer.classList.add('is-dragging');
      }
      dx = Math.min(0, moveX);
      drawer.style.translate = `${dx}px 0`;
      drawer.style.setProperty('--backdrop', String(1 + dx / drawer.offsetWidth));
    });
    const release = (event) => {
      if (startX === null) return;
      startX = null;
      if (!dragging) return;
      drawer.classList.remove('is-dragging');
      const speed = dx / (event.timeStamp - startT);
      if (dx < -drawer.offsetWidth / 3 || speed < -0.5) closeDrawer();
      else {
        drawer.style.translate = '';
        drawer.style.removeProperty('--backdrop');
      }
      // The lift-off after a drag shouldn't count as a tap on a link.
      const swallow = (e) => { e.preventDefault(); e.stopImmediatePropagation(); };
      drawer.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => drawer.removeEventListener('click', swallow, { capture: true }), 80);
    };
    drawer.addEventListener('pointerup', release);
    drawer.addEventListener('pointercancel', release);
  }
}

/* ---------- Search panel: open and close (docs/search-plan.md §5–§7) ----------
   Phones get a full-screen modal sheet; wider screens a panel under the header, with the page dimmed behind it.
   The field gets focus inside the tap itself, the only way iOS opens the keyboard, so this part can't wait for
   search.js. search.js (results as you type, recent searches) loads on first touch of anything search. */
{
  const panel = document.getElementById('SearchPanel');

  if (panel) {
    const openers = [...document.querySelectorAll('[data-search-open]')];
    const pill = document.getElementById('HeaderSearch');
    const own = document.getElementById('SearchPanelInput');
    const scrim = document.querySelector('[data-search-scrim]');
    const phone = matchMedia('(max-width: 767px)');
    let returnTo = null;
    let loading = null;
    let closing = 0;
    let quiet = false;

    // The real buttons replace the plain /search links (same box, so nothing moves).
    document.querySelectorAll('[data-search-fallback]').forEach((link) => (link.hidden = true));
    openers.forEach((button) => (button.hidden = false));

    const load = () => (loading ||= import(panel.dataset.searchSrc).catch(() => (loading = null)));
    const shown = (el) => !!el && (el.checkVisibility ? el.checkVisibility() : el.offsetParent !== null);
    const setExpanded = (value) => openers.forEach((button) => button.setAttribute('aria-expanded', String(value)));
    const field = () => (panel.classList.contains('is-attached') ? pill : own);
    const inside = (node) => panel.contains(node) || pill?.form.contains(node) || openers.some((button) => button.contains(node));

    const open = (from) => {
      clearTimeout(closing);
      delete panel.dataset.closing;
      if (!panel.open) {
        returnTo = from;
        const attached = !phone.matches && shown(pill);
        panel.classList.toggle('is-attached', attached);
        if (phone.matches) panel.showModal();
        else {
          panel.show();
          scrim.hidden = false;
        }
        setExpanded(true);
        // Carry the text across when the other field was used last.
        const other = attached ? own : pill;
        if (!field().value && other?.value) field().value = other.value;
      }
      if (document.activeElement !== field()) field().focus();
      load();
      panel.dispatchEvent(new CustomEvent('search:open'));
    };

    const finish = (refocus) => {
      panel.close();
      panel.classList.remove('is-leaving');
      delete panel.dataset.closing;
      scrim.hidden = true;
      setExpanded(false);
      const target = shown(returnTo) ? returnTo : openers.find(shown);
      if (refocus && target) {
        quiet = true; // don't let the pill's focus reopen the panel
        target.focus();
        quiet = false;
      }
    };
    // Fade out first (220ms), then close; instantly when the layout switches or with reduced motion.
    const close = ({ refocus = false, instant = false } = {}) => {
      if (!panel.open || 'closing' in panel.dataset) return;
      if (instant || reduceMotion.matches) return finish(refocus);
      panel.dataset.closing = '';
      scrim.hidden = true;
      closing = setTimeout(() => finish(refocus), 220);
    };

    openers.forEach((button) => {
      button.addEventListener('click', () => {
        if (panel.open) return close({ refocus: true });
        // From the menu drawer: the drawer goes, and focus later returns to the menu button.
        const drawer = button.closest('dialog');
        drawer?.close();
        open(drawer ? document.querySelector('[data-menu-open]') : button);
      });
    });
    pill?.addEventListener('focus', () => !quiet && open(pill));
    pill?.addEventListener('input', () => !panel.open && open(pill));
    panel.querySelectorAll('[data-search-close]').forEach((button) => button.addEventListener('click', () => close({ refocus: true })));

    // Esc: clears the text first, then closes. preventDefault also stops the dialog's own close.
    const onKey = (event) => {
      if (event.key !== 'Escape' || !panel.open) return;
      event.preventDefault();
      const input = event.target.closest?.('[data-search-input]');
      if (input?.value) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else close({ refocus: true });
    };
    panel.addEventListener('keydown', onKey);
    pill?.addEventListener('keydown', onKey);
    panel.addEventListener('cancel', (event) => {
      event.preventDefault();
      close({ refocus: true });
    });

    // The wider panel isn't modal: a click or focus anywhere else closes it.
    const away = (event) => panel.open && !panel.matches(':modal') && !inside(event.target) && close();
    document.addEventListener('pointerdown', away);
    document.addEventListener('focusin', away);
    // Following a link: the panel stays until the next page replaces it, so the page underneath never flashes
    // in between; it dims so the tap is acknowledged. If Back restores this page from the back-forward cache,
    // the panel is shut before it shows.
    panel.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link && !link.target && !(event.metaKey || event.ctrlKey || event.shiftKey)) panel.classList.add('is-leaving');
    });
    addEventListener('pageshow', (event) => event.persisted && panel.open && finish(false));
    phone.addEventListener('change', () => close({ instant: true }));

    // Warm up: fetch search.js as soon as a pointer or finger heads for search.
    [...openers, pill].forEach((el) => el?.addEventListener('pointerenter', load, { once: true, passive: true }));
    [...openers, pill].forEach((el) => el?.addEventListener('touchstart', load, { once: true, passive: true }));
  }
}

/* ---------- Shop by craft: the circles switch the product grid below (sections/shop-crafts.liquid) ----------
   Toggle buttons (aria-pressed), not ARIA tabs: Tab reaches each one, Enter or Space picks it, and focus stays put.
   The new cards rise in turn while the grid's height eases to fit; a status line says what is showing. */
{
  const initShop = (section) => {
    const tabs = [...section.querySelectorAll('[data-shop-tab]')];
    const wrap = section.querySelector('[data-shop-panels]');
    const status = section.querySelector('[data-shop-status]');
    if (!tabs.length || !wrap) return;
    section.classList.add('is-enhanced');

    const pick = (tab) => {
      if (tab.getAttribute('aria-pressed') === 'true') return;
      const next = document.getElementById(tab.getAttribute('aria-controls'));
      if (!next) return;
      const animate = !reduceMotion.matches;
      const from = wrap.offsetHeight;
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
      wrap.querySelectorAll('.shop__panel:not([hidden])').forEach((panel) => { panel.hidden = true; panel.classList.remove('is-switching'); });
      next.hidden = false;
      if (animate) {
        next.classList.add('is-switching');
        const to = wrap.offsetHeight;
        if (Math.abs(to - from) > 1) {
          const done = () => { wrap.style.height = ''; wrap.classList.remove('is-sizing'); };
          wrap.classList.add('is-sizing');
          wrap.style.height = `${from}px`;
          void wrap.offsetHeight;
          wrap.style.height = `${to}px`;
          wrap.addEventListener('transitionend', done, { once: true });
          setTimeout(done, 500);
        }
      }
      if (status) {
        const { label, shown, total } = next.dataset;
        status.textContent = '';
        setTimeout(() => (status.textContent = status.dataset.template.replace('[craft]', label).replace('[shown]', shown).replace('[total]', total)), 60);
      }
      // In the phone swipe row, bring the chosen circle fully into view.
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: animate ? 'smooth' : 'auto' });
    };
    tabs.forEach((tab) => tab.addEventListener('click', () => pick(tab)));
  };
  document.querySelectorAll('[data-shop-crafts]').forEach(initShop);
  document.addEventListener('shopify:section:load', (event) => event.target.querySelectorAll('[data-shop-crafts]').forEach(initShop));
}

/* ---------- Cart count: bump when it changes (other scripts dispatch 'cart:updated') ---------- */
document.addEventListener('cart:updated', (event) => {
  const count = event.detail?.item_count;
  if (typeof count === 'number') {
    document.querySelectorAll('[data-cart-label]').forEach((label) => {
      const { zero, one, other } = label.dataset;
      label.textContent = count === 0 ? zero : count === 1 ? one : other.replace('99', count);
    });
    // Say it out loud: the badge is aria-hidden, so the status line is how screen readers hear the change.
    const status = document.querySelector('[data-cart-status]');
    const label = document.querySelector('[data-cart-label]');
    if (status && label) {
      status.textContent = '';
      setTimeout(() => (status.textContent = label.textContent.trim()), 60);
    }
  }
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    if (typeof count === 'number') {
      badge.textContent = count > 99 ? '99+' : count;
      badge.hidden = count === 0;
    }
    if (!reduceMotion.matches) {
      badge.classList.remove('is-bumped');
      void badge.offsetWidth;
      badge.classList.add('is-bumped');
    }
  });
});

/* ---------- Arrivals: data-arrive (CSS in base.css) ----------
   Things rise, stagger, settle, sew and pop into place as they come into view, once, the same in every browser.
   Only what is still below the screen when scanned waits to arrive, so nothing already visible blinks out.
   A swipe row arrives as a whole, so cards off to the side don't wait for a swipe. Stagger order (--i) is set
   here unless the markup sets it. Call window.ybArrive(element) after injecting new content (filters, load more);
   sections re-rendered by the theme editor are rescanned automatically. */
{
  const enabled = 'IntersectionObserver' in window && !reduceMotion.matches;
  const io = enabled && new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      const items = el.matches('[data-arrive~="stagger"].scroller') ? [...el.children] : [el];
      items.forEach((item) => item.classList.replace('is-pending', 'is-arriving'));
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  const below = (el) => el.getBoundingClientRect().top > innerHeight * 0.9;
  const wait = (el, watch = el) => { el.classList.add('is-pending'); io.observe(watch); };

  const scan = (scope = document) => {
    if (!enabled) return;
    const found = [...scope.querySelectorAll('[data-arrive], .stitch, .review__stars')];
    if (scope.matches?.('[data-arrive]')) found.unshift(scope);
    found.forEach((el) => {
      if (el.matches('.is-pending, .is-arriving')) return;
      if (el.matches('[data-arrive~="stagger"]')) {
        const items = [...el.children];
        items.forEach((item, n) => { if (!item.style.getPropertyValue('--i')) item.style.setProperty('--i', Math.min(n, 6)); });
        if (el.matches('.scroller')) {
          if (below(el)) { items.forEach((item) => item.classList.add('is-pending')); io.observe(el); }
        } else {
          items.forEach((item) => below(item) && !item.matches('.is-pending, .is-arriving') && wait(item));
        }
      } else if (below(el)) {
        wait(el);
      }
    });
  };
  scan();
  window.ybArrive = scan;
  document.addEventListener('shopify:section:load', (event) => scan(event.target));
}

/* ---------- Next page, sooner, where Speculation Rules aren't supported ----------
   Chrome and Edge prerender on hover via the speculationrules script in theme.liquid. Firefox gets a
   <link rel="prefetch"> when the pointer rests on a link (80ms) or a finger lands on it. Safari supports neither,
   so it is skipped. Same exclusions as the rules: other sites, cart, checkout, account, query strings, nofollow. */
if (!HTMLScriptElement.supports?.('speculationrules') && document.createElement('link').relList.supports?.('prefetch') && !root.classList.contains('lite')) {
  const done = new Set();
  const want = (a) => a && a.origin === location.origin && !a.search && !a.hasAttribute('download')
    && !/^\/(cart|checkout|account)/.test(a.pathname) && !a.matches('[rel~="nofollow"], [data-no-prerender]')
    && !(a.pathname === location.pathname && a.hash) && !done.has(a.href);
  const prefetch = (a) => {
    if (!want(a)) return;
    done.add(a.href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = a.href;
    document.head.append(link);
  };
  let timer = 0;
  document.addEventListener('pointerover', (event) => {
    const a = event.target.closest?.('a[href]');
    clearTimeout(timer);
    if (a) timer = setTimeout(() => prefetch(a), 80);
  }, { passive: true });
  document.addEventListener('touchstart', (event) => prefetch(event.target.closest?.('a[href]')), { passive: true });
}

/* ---------- Story strand fallback ----------
   The story's yarn strand draws with the scroll where scroll timelines exist; elsewhere it draws once on arrival. */
if (!CSS.supports('animation-timeline: view()') && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -15% 0px' });
  document.querySelectorAll('[data-inview]').forEach((el) => io.observe(el));
}
