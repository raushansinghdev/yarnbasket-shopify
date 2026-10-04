/*
  Yarn Basket · product-zoom.js (docs/product-page-plan.md "Photos"). The full-screen photo viewer. product.js loads
  this file on the first tap of a photo, so it costs nothing until someone wants a closer look.
  Swipe between photos (the browser's own scroll), pinch or double-tap to zoom, drag to move around when zoomed.
  Closes with the button, Esc or Back, and hands focus back to where it came from.
  Zoom works by making the photo wider inside its own scroll box, so moving around it is native scrolling too.
*/

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('lite');
const MAX = 4;
let dialog;
let track;
let opener;
let onClose;
let current = 0;

const zoom = (slide, to, x = slide.clientWidth / 2, y = slide.clientHeight / 2) => {
  const img = slide.firstElementChild;
  const from = +slide.dataset.zoom || 1;
  const z = Math.min(MAX, Math.max(1, to));
  // The point under the fingers stays under the fingers.
  const px = (slide.scrollLeft + x) / from;
  const py = (slide.scrollTop + y) / from;
  slide.dataset.zoom = z;
  slide.style.setProperty('--zoom', z);
  slide.classList.toggle('is-zoomed', z > 1);
  if (z > 1) img.sizes = '300vw';
  slide.scrollLeft = px * z - x;
  slide.scrollTop = py * z - y;
};
const index = () => Math.round(track.scrollLeft / track.clientWidth);
const at = (slide, point) => {
  const box = slide.getBoundingClientRect();
  return [point.clientX - box.left, point.clientY - box.top];
};

const build = (gallery) => {
  dialog = gallery.querySelector('[data-zoom-template]').content.firstElementChild.cloneNode(true);
  track = dialog.querySelector('.zoom__track');
  gallery.querySelectorAll('.gallery__img').forEach((photo) => {
    const slide = document.createElement('div');
    const img = photo.cloneNode();
    slide.className = 'zoom__slide';
    img.className = 'zoom__img';
    img.sizes = '100vw';
    img.loading = 'lazy';
    img.removeAttribute('fetchpriority');
    slide.append(img);
    track.append(slide);

    // Double-click, or double-tap: in to 2.5 times at that point, and back out.
    let last = 0;
    const toggle = (point) => zoom(slide, slide.classList.contains('is-zoomed') ? 1 : 2.5, ...at(slide, point));
    slide.addEventListener('dblclick', toggle);
    slide.addEventListener('touchend', (event) => {
      if (event.touches.length || event.changedTouches.length !== 1) return;
      const now = Date.now();
      if (now - last < 300) {
        event.preventDefault();
        toggle(event.changedTouches[0]);
        last = 0;
      } else last = now;
    });

    // Pinch.
    let start = 0;
    let base = 1;
    const spread = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    slide.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 2) return;
      start = spread(event.touches);
      base = +slide.dataset.zoom || 1;
      last = 0;
    }, { passive: true });
    slide.addEventListener('touchmove', (event) => {
      if (event.touches.length !== 2 || !start) return;
      event.preventDefault();
      const [a, b] = event.touches;
      zoom(slide, base * (spread(event.touches) / start), ...at(slide, { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 }));
    }, { passive: false });
  });

  // A photo that's swiped away goes back to its normal size.
  let settle = 0;
  track.addEventListener('scroll', () => {
    clearTimeout(settle);
    settle = setTimeout(() => {
      current = index();
      [...track.children].forEach((slide, i) => i !== current && slide.dataset.zoom > 1 && zoom(slide, 1));
    }, 150);
  }, { passive: true });

  dialog.querySelector('.zoom__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (history.state?.zoom) history.back();
    [...track.children].forEach((slide) => zoom(slide, 1));
    onClose?.(current);
    opener?.focus({ preventScroll: true });
  });
  addEventListener('popstate', () => dialog.open && dialog.close());
  document.body.append(dialog);
};

export const open = (gallery, n, from, done) => {
  if (!dialog) build(gallery);
  opener = from;
  onClose = done;
  current = n;
  const show = () => {
    dialog.showModal();
    track.children[n]?.firstElementChild.setAttribute('loading', 'eager');
    track.scrollTo({ left: n * track.clientWidth, behavior: 'instant' });
  };
  // Where the browser can, the photo grows from its place on the page into the viewer.
  const small = gallery.querySelectorAll('.gallery__img')[n];
  const big = dialog.querySelectorAll('.zoom__img')[n];
  if (!calm && document.startViewTransition && small && big) {
    gallery.querySelectorAll('.gallery__img').forEach((img) => (img.style.viewTransitionName = 'none'));
    small.style.viewTransitionName = 'zoom-photo';
    document.startViewTransition(() => {
      small.style.viewTransitionName = 'none';
      big.style.viewTransitionName = 'zoom-photo';
      show();
    }).finished.finally(() => {
      big.style.viewTransitionName = '';
      gallery.querySelectorAll('.gallery__img').forEach((img) => (img.style.viewTransitionName = ''));
    });
  } else show();
  history.pushState({ ...history.state, zoom: true }, '');
};
