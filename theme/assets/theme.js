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
  const returnAfter = 48;

  const update = () => {
    const y = Math.max(scrollY, 0);
    const delta = y - lastY;
    root.classList.toggle('header-scrolled', y > 4);
    // Hides as soon as you head down; comes back only once you've clearly turned around (docs/fluid-feel-plan.md).
    if (delta > 6) {
      root.classList.toggle('header-hidden', y > threshold && !document.querySelector('dialog[open]'));
      lastY = y;
    } else if (delta < -returnAfter || (delta < 0 && y <= threshold)) {
      root.classList.remove('header-hidden');
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
    // The pinned top bar gets its hairline once the menu has scrolled.
    drawer.addEventListener('scroll', () => drawer.classList.toggle('is-scrolled', drawer.scrollTop > 4), { passive: true });
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
   Phones: a full-screen sheet; wider: a panel under the header. Focus moves inside the tap (the only way iOS opens
   the keyboard), so this can't wait for search.js, which loads on first touch of anything search. */
{
  const panel = document.getElementById('SearchPanel');

  if (panel) {
    const openers = [...document.querySelectorAll('[data-search-open]')];
    const pill = document.getElementById('HeaderSearch');
    const own = document.getElementById('SearchPanelInput');
    const scrim = document.querySelector('[data-search-scrim]');
    const phone = matchMedia('(max-width: 767px), (max-height: 500px)');
    let returnTo = null;
    let loading = null;
    let closing = 0;
    let quiet = false;

    // Buttons replace the plain /search links (same box: nothing moves).
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
        // Carry the text across fields.
        const other = attached ? own : pill;
        if (!field().value && other?.value) field().value = other.value;
      }
      if (document.activeElement !== field()) field().focus();
      load();
      panel.dispatchEvent(new CustomEvent('search:open'));
    };

    const finish = (refocus) => {
      // Quiet while closing: the dialog hands focus back to its opener, and the pill's focus would reopen it.
      quiet = true;
      panel.close();
      panel.classList.remove('is-leaving');
      delete panel.dataset.closing;
      scrim.hidden = true;
      setExpanded(false);
      const target = shown(returnTo) ? returnTo : openers.find(shown);
      if (refocus && target) target.focus();
      quiet = false;
    };
    // Fade out (220ms), then close.
    const close = ({ refocus = false } = {}) => {
      if (!panel.open || 'closing' in panel.dataset) return;
      if (reduceMotion.matches) return finish(refocus);
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

    // Esc clears the text, then closes (preventDefault stops the dialog's own close).
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
    // Following a link: the panel stays (dimmed) until the next page replaces it, so nothing flashes in between.
    // A page restored by Back has it shut first.
    panel.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link && !link.target && !(event.metaKey || event.ctrlKey || event.shiftKey)) panel.classList.add('is-leaving');
    });
    addEventListener('pageshow', (event) => event.persisted && panel.open && finish(false));
    phone.addEventListener('change', () => panel.open && finish(false));

    // Warm up: fetch search.js as soon as a pointer or finger heads for search.
    [...openers, pill].forEach((el) => ['pointerenter', 'touchstart'].forEach((type) => el?.addEventListener(type, load, { once: true, passive: true })));
  }
}

/* ---------- Swipe rows (.scroller): photos ready before the swipe ----------
   CSS (base.css) keeps rows still under the finger. Here: the row's lazy photos start loading as the row comes
   near, so none of them pops in mid-swipe. */
{
  const rows = new WeakSet();
  const near = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      near.unobserve(entry.target);
      entry.target.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
    });
  }, { rootMargin: '600px 0px' });
  const watch = (scope = document) => scope.querySelectorAll('.scroller').forEach((row) => {
    if (rows.has(row)) return;
    rows.add(row);
    if (near) near.observe(row);
  });
  watch();
  document.addEventListener('shopify:section:load', (event) => watch(event.target));
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
    // quiet: cart.js announces it itself
    if (status && label && !event.detail.quiet) {
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
  });
  const below = (el) => el.getBoundingClientRect().top > innerHeight;
  const wait = (el, watch = el) => { el.classList.add('is-pending'); io.observe(watch); };

  const scan = (scope = document) => {
    if (!enabled) return;
    // Stars on cards inside a swipe row just show: nothing in a row animates as you swipe it.
    const found = [...scope.querySelectorAll('[data-arrive], .stitch, .review__stars')].filter((el) => !el.matches('.scroller .review__stars'));
    if (scope.matches?.('[data-arrive]')) found.unshift(scope);
    found.forEach((el) => {
      if (el.matches('.is-pending, .is-arriving')) return;
      if (el.matches('[data-arrive~="stagger"]')) {
        const items = [...el.children];
        items.forEach((item, n) => { if (!item.style.getPropertyValue('--i')) item.style.setProperty('--i', Math.min(n, 4)); });
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

/* ---------- The cart drawer's photos are lazy: start them when a pointer heads for the cart ----------
   Here, not in cart.js, which is at its size budget. */
const warm = (event) => {
  if (!event.target.closest?.('.site-header__cart, [data-cart-view]')) return;
  document.querySelectorAll('#CartDrawer img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
};
addEventListener('pointerover', warm, { passive: true });
addEventListener('pointerdown', warm, { passive: true });
addEventListener('focusin', warm);

/* A short pulse under the finger for a tap that changes the cart: Add to cart, the stepper, Undo. Android only;
   iPhones have no vibration for web pages. The page says and shows the same without it. */
document.addEventListener('click', (event) => {
  if (event.target.closest?.('[data-step]:not([aria-disabled="true"]), [data-add], .extra__btn, [data-undo]')) navigator.vibrate?.(10);
});
