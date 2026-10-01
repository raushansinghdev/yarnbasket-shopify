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
document.querySelectorAll('.media img:not([fetchpriority="high"])').forEach((img) => {
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

/* ---------- Cart count: bump when it changes (other scripts dispatch 'cart:updated') ---------- */
document.addEventListener('cart:updated', (event) => {
  const count = event.detail?.item_count;
  if (typeof count === 'number') {
    document.querySelectorAll('[data-cart-label]').forEach((label) => {
      const { zero, one, other } = label.dataset;
      label.textContent = count === 0 ? zero : count === 1 ? one : other.replace('99', count);
    });
  }
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    if (typeof count === 'number') {
      badge.textContent = count;
      badge.hidden = count === 0;
    }
    if (!reduceMotion.matches) {
      badge.classList.remove('is-bumped');
      void badge.offsetWidth;
      badge.classList.add('is-bumped');
    }
  });
});

/* ---------- Scroll timelines fallback ----------
   Browsers with CSS scroll-driven animations need nothing here. Others get a light
   IntersectionObserver that adds .is-inview, which sections can use for one-off reveals. */
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
