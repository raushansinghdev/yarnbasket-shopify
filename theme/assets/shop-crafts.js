/*
  Yarn Basket · shop-crafts.js
  Bestsellers by craft on the home page: the circles switch the product grid below (sections/shop-crafts.liquid, which
  loads this file). Toggle buttons (aria-pressed), not ARIA tabs: Tab reaches each one, Enter or Space picks it, and
  focus stays put. The new cards rise in turn while the grid's height eases to fit; a status line says what is showing.
  Without it every craft is still in the page; the section's <noscript> lists them one after another.
*/

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

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
