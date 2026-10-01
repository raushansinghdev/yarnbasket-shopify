/*
  Yarn Basket · theme.js
  Small, dependency-free behaviour shared by every page. Loaded as a module (deferred).
  Anything section-specific lives in that section.
*/

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

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

/* ---------- Menu drawer (native <dialog>: focus trap, Esc and inert page come built in) ---------- */
{
  const drawer = document.getElementById('MenuDrawer');
  const openers = document.querySelectorAll('[data-menu-open]');

  if (drawer) {
    const setExpanded = (value) => openers.forEach((b) => b.setAttribute('aria-expanded', String(value)));

    openers.forEach((button) =>
      button.addEventListener('click', () => {
        drawer.showModal();
        setExpanded(true);
      })
    );
    drawer.querySelectorAll('[data-menu-close]').forEach((button) =>
      button.addEventListener('click', () => drawer.close())
    );
    // A tap on the dimmed backdrop closes it (for browsers without closedby="any").
    drawer.addEventListener('click', (event) => {
      if (event.target === drawer) drawer.close();
    });
    drawer.addEventListener('close', () => setExpanded(false));
    // Following a link closes the drawer first, so the back button returns to a clean page.
    drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => drawer.close()));
  }
}

/* ---------- Cart count: bump when it changes (other scripts dispatch 'cart:updated') ---------- */
document.addEventListener('cart:updated', (event) => {
  const count = event.detail?.item_count;
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
