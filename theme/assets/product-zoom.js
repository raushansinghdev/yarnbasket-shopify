/*
  Yarn Basket · product-zoom.js (docs/product-page-plan.md "Photos"). The full-screen photo viewer; product.js loads
  it on the first tap of a photo. Swipe, or use the arrows and arrow keys; pinch, double-tap or double-click to zoom.
  Closes with the button, a tap on the empty space around the photo, Esc or Back, and hands focus back.
  Zoom makes the photo wider inside its own scroll box, so moving around it is native scrolling.
*/

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('lite');
let dialog;
let track;
let opener;
let onClose;
let current = 0;
// The photos showing in the page's row (a colour's photos); the others stay hidden here too.
const live = () => [...track.children].filter((slide) => !slide.hidden);

const zoom = (slide, to, x = slide.clientWidth / 2, y = slide.clientHeight / 2) => {
  const from = +slide.dataset.zoom || 1;
  const z = Math.min(4, Math.max(1, to));
  const px = (slide.scrollLeft + x) / from;
  const py = (slide.scrollTop + y) / from;
  slide.dataset.zoom = z;
  slide.style.setProperty('--zoom', z);
  slide.classList.toggle('is-zoomed', z > 1);
  if (z > 1) {
    slide.firstElementChild.sizes = '300vw';
    dialog.classList.add('is-used');
  }
  slide.scrollLeft = px * z - x;
  slide.scrollTop = py * z - y;
};
const at = (slide, point) => {
  const box = slide.getBoundingClientRect();
  return [point.clientX - box.left, point.clientY - box.top];
};
const mark = () => {
  const count = dialog.querySelector('[data-zoom-count]');
  if (count) count.textContent = current + 1;
  dialog.querySelectorAll('[data-zoom-step]').forEach((arrow) => (arrow.hidden = !live()[current + +arrow.dataset.zoomStep]));
};
const move = (step) => live()[current + step] && track.scrollTo({ left: (current + step) * track.clientWidth, behavior: calm ? 'instant' : 'smooth' });

const build = (gallery) => {
  dialog = gallery.querySelector('[data-zoom-template]').content.firstElementChild.cloneNode(true);
  track = dialog.querySelector('.zoom__track');
  gallery.querySelectorAll('.gallery__img').forEach((photo) => {
    const slide = document.createElement('div');
    const img = photo.cloneNode();
    slide.className = 'zoom__slide';
    slide.from = photo.parentElement;
    img.className = 'zoom__img';
    img.sizes = '100vw';
    img.loading = 'lazy';
    img.removeAttribute('fetchpriority');
    slide.append(img);
    track.append(slide);

    // The empty space around the photo closes the viewer; the photo itself never does.
    slide.addEventListener('click', (event) => event.target === slide && dialog.close());

    // Double-click or double-tap: in to 2.5 times at that point, and back out.
    let last = 0;
    const toggle = (point) => zoom(slide, slide.classList.contains('is-zoomed') ? 1 : 2.5, ...at(slide, point));
    img.addEventListener('dblclick', toggle);
    img.addEventListener('touchend', (event) => {
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

  // Once a swipe settles: the count and arrows follow, and a photo swiped away returns to normal size.
  let settle = 0;
  track.addEventListener('scroll', () => {
    clearTimeout(settle);
    settle = setTimeout(() => {
      current = Math.round(track.scrollLeft / track.clientWidth);
      mark();
      live().forEach((slide, i) => i !== current && slide.dataset.zoom > 1 && zoom(slide, 1));
    }, 120);
  }, { passive: true });

  dialog.addEventListener('click', (event) => {
    const arrow = event.target.closest('[data-zoom-step]');
    if (arrow) move(+arrow.dataset.zoomStep);
    else if (event.target.closest('.zoom__close')) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step || live()[current].classList.contains('is-zoomed')) return;
    event.preventDefault();
    move(step);
  });
  dialog.addEventListener('close', () => {
    if (history.state?.zoom) history.back();
    [...track.children].forEach((slide) => zoom(slide, 1));
    onClose?.(live()[current]?.from);
    opener?.focus({ preventScroll: true });
  });
  addEventListener('popstate', () => dialog.open && dialog.close());
  document.body.append(dialog);
};

export const open = (gallery, photo, from, done) => {
  if (!dialog) build(gallery);
  opener = from;
  onClose = done;
  [...track.children].forEach((slide) => (slide.hidden = slide.from.hidden));
  const n = Math.max(0, live().findIndex((slide) => slide.from === photo));
  current = n;
  const many = live().length > 1;
  const total = dialog.querySelector('[data-zoom-total]');
  if (total) {
    total.textContent = live().length;
    total.parentElement.hidden = !many;
  }
  const show = () => {
    dialog.showModal();
    live()[n]?.firstElementChild.setAttribute('loading', 'eager');
    track.scrollTo({ left: n * track.clientWidth, behavior: 'instant' });
    mark();
  };
  // Where the browser can, the photo grows from its place on the page into the viewer.
  const photos = [...gallery.querySelectorAll('.gallery__img')];
  const small = photo?.querySelector('.gallery__img');
  const big = live()[n]?.firstElementChild;
  const name = (img, value) => (img.style.viewTransitionName = value);
  if (!calm && document.startViewTransition && small && big) {
    photos.forEach((img) => name(img, img === small ? 'zoom-photo' : 'none'));
    document.startViewTransition(() => {
      name(small, 'none');
      name(big, 'zoom-photo');
      show();
    }).finished.finally(() => [big, ...photos].forEach((img) => name(img, '')));
  } else show();
  history.pushState({ ...history.state, zoom: true }, '');
};
