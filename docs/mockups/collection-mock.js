// Collection page mock-ups, injected into the live preview page (Phase A of docs/collection-plan.md).
// mock({ desk: 'bar' | 'side' | 'button', phone: 'pill' | 'row', state: 'plain' | 'applied' | 'open' | 'none' })
window.mock = async ({ desk, phone, state = 'plain' }) => {
  const isPhone = innerWidth < 768;
  const page = document.querySelector('.collection-page');
  const h1 = page.querySelector('h1');
  const grid = page.querySelector('.collection-page__grid');
  const I = {
    filter: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    sort: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5v14m0 0-3-3m3 3 3-3M17 19V5m0 0-3 3m3-3 3 3"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    tick: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  };
  const css = `
  .collection-page { padding-top: clamp(1.25rem, 1rem + 1.5vw, 2.5rem) !important; }
  .cp-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
  .cp-head h1 { margin: 0 !important; font-size: var(--fs-h2); line-height: 1.05; }
  .cp-count { color: var(--color-muted); font-size: .9375rem; white-space: nowrap; }
  .cp-intro { max-width: 40rem; margin: -4px 0 16px; color: var(--color-muted); }
  .cp-crafts { display: flex; gap: 8px; margin-bottom: 16px; }
  .cp-chip { display: inline-flex; align-items: center; gap: 8px; flex: none; min-height: 44px; padding: 0 16px 0 6px; border: 1px solid var(--color-line-strong); border-radius: 999px; background: #fff; color: var(--color-heading); font-size: .9375rem; white-space: nowrap; }
  .cp-chip img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: var(--blush); }
  .cp-chip--all { padding-left: 18px; padding-right: 18px; }
  .cp-chip[aria-current] { background: var(--cocoa-deep); border-color: var(--cocoa-deep); color: var(--cream); }
  .cp-pill { display: inline-flex; align-items: center; gap: 6px; flex: none; min-height: 44px; padding: 0 12px 0 16px; border: 1px solid var(--color-line-strong); border-radius: 999px; background: #fff; color: var(--color-heading); font: 500 .9375rem var(--font-sans); white-space: nowrap; }
  .cp-pill.is-on { border-color: var(--cocoa-deep); background: var(--blush-soft); }
  .cp-pill b { display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px; background: var(--cocoa-deep); color: var(--cream); font-size: .75rem; font-weight: 500; }
  .cp-sort { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 12px 0 16px; border: 1px solid color-mix(in srgb, var(--cocoa) 75%, transparent); border-radius: 999px; background: #fff; font-size: .9375rem; color: var(--color-muted); white-space: nowrap; }
  .cp-sort strong { font-weight: 500; color: var(--color-heading); }
  .cp-switch { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 6px; font-size: .9375rem; color: var(--color-heading); white-space: nowrap; }
  .cp-switch i { position: relative; width: 40px; height: 24px; border-radius: 12px; background: var(--color-line-strong); }
  .cp-switch i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgb(78 58 49 / .3); }
  .cp-switch.is-on i { background: var(--cocoa-deep); } .cp-switch.is-on i::after { left: 19px; }
  .cp-bar { display: flex; align-items: center; gap: 8px; padding: 10px 0; margin-bottom: 16px; border-block: 1px solid var(--color-line); position: relative; }
  .cp-bar .cp-sort { margin-left: auto; }
  .cp-bar .cp-count { margin-left: auto; } .cp-bar .cp-count + .cp-sort { margin-left: 8px; }
  .cp-applied { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 16px; }
  .cp-tag { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 10px 0 14px; border-radius: 999px; background: var(--blush-soft); border: 1px solid var(--color-line-strong); color: var(--color-heading); font-size: .875rem; }
  .cp-clear { margin-left: 4px; font-size: .875rem; color: var(--color-heading); text-decoration: underline; text-decoration-color: var(--rose); text-underline-offset: 4px; }
  .cp-pop { position: absolute; top: calc(100% - 2px); left: 96px; z-index: 6; width: 340px; padding: 16px; border: 1px solid var(--color-line-strong); border-radius: 18px; background: #fff; box-shadow: 0 18px 40px -18px rgb(78 58 49 / .35); }
  .cp-opts { display: flex; flex-wrap: wrap; gap: 8px; }
  .cp-opt { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border: 1px solid var(--color-line-strong); border-radius: 999px; background: #fff; color: var(--color-heading); font-size: .9375rem; }
  .cp-opt small { font-size: .8125rem; color: var(--color-muted); }
  .cp-opt.is-on { background: var(--cocoa-deep); border-color: var(--cocoa-deep); color: var(--cream); } .cp-opt.is-on small { color: inherit; }
  .cp-group { display: grid; gap: 10px; } .cp-group + .cp-group { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--color-line); }
  .cp-label { font: 500 .75rem var(--font-sans); letter-spacing: .2em; text-transform: uppercase; color: var(--color-muted); }
  .cp-layout { display: grid; grid-template-columns: 232px minmax(0, 1fr); gap: 40px; align-items: start; }
  .cp-side { position: sticky; top: 88px; padding-top: 4px; }
  .cp-side .cp-opts { display: grid; gap: 0; }
  .cp-check { display: flex; align-items: center; gap: 10px; min-height: 40px; font-size: .9375rem; color: var(--color-heading); }
  .cp-check i { display: grid; place-items: center; width: 20px; height: 20px; border: 1.5px solid var(--taupe); border-radius: 6px; color: var(--cream); }
  .cp-check.is-radio i { border-radius: 50%; }
  .cp-check.is-on i { background: var(--cocoa-deep); border-color: var(--cocoa-deep); }
  .cp-check small { margin-left: auto; font-size: .8125rem; color: var(--color-muted); }
  .cp-more { display: grid; justify-items: center; gap: 12px; margin-top: 48px; } .cp-more p { font-size: .9375rem; color: var(--color-muted); }
  .cp-scrim { position: fixed; inset: 0; z-index: 90; background: rgb(78 58 49 / .45); }
  .cp-sheet { position: fixed; z-index: 91; background: #fff; display: flex; flex-direction: column; }
  .cp-sheet--bottom { left: 0; right: 0; bottom: 0; max-height: 86vh; border-radius: 28px 28px 0 0; }
  .cp-sheet--right { top: 0; right: 0; bottom: 0; width: 420px; }
  .cp-sheet__top { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 10px; }
  .cp-sheet__top h2 { font-size: 1.625rem; margin: 0; }
  .cp-sheet__x { display: grid; place-items: center; width: 44px; height: 44px; margin-right: -10px; color: var(--color-heading); } .cp-sheet__x svg { width: 22px; height: 22px; }
  .cp-sheet__body { padding: 8px 20px 20px; overflow: auto; }
  .cp-sheet__foot { display: flex; gap: 10px; padding: 12px 20px 16px; border-top: 1px solid var(--color-line); }
  .cp-sheet__foot .btn { min-height: 50px; flex: 1; } .cp-sheet__foot .btn--ghost { flex: 0 0 auto; }
  .cp-grab { width: 40px; height: 4px; margin: 8px auto 0; border-radius: 2px; background: var(--color-line-strong); }
  .cp-float { position: fixed; left: 50%; bottom: 18px; z-index: 40; translate: -50% 0; display: flex; align-items: center; height: 48px; border-radius: 999px; background: var(--cocoa-deep); color: var(--cream); box-shadow: 0 10px 24px -10px rgb(78 58 49 / .6); font: 500 .9375rem var(--font-sans); }
  .cp-float span { display: inline-flex; align-items: center; gap: 8px; height: 100%; padding: 0 18px; }
  .cp-float span + span { border-left: 1px solid rgb(251 246 239 / .28); }
  .cp-float b { display: inline-grid; place-items: center; min-width: 20px; height: 20px; border-radius: 10px; background: var(--cream); color: var(--cocoa-deep); font-size: .75rem; }
  .cp-none { display: grid; justify-items: start; gap: 12px; padding: 24px 0 8px; } .cp-none h2 { font-size: 1.625rem; } .cp-none p { color: var(--color-muted); }
  .cp-iconbtn { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border: 1px solid var(--color-line-strong); border-radius: 50%; background: #fff; color: var(--color-heading); }
  .cp-div { flex: none; width: 1px; align-self: stretch; margin: 6px 2px; background: var(--color-line-strong); }
  @media (max-width: 767px) {
    .cp-crafts { overflow-x: auto; scrollbar-width: none; margin-inline: calc(var(--gutter) * -1); padding-inline: var(--gutter); }
    .cp-applied { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: calc(var(--gutter) * -1); padding-inline: var(--gutter); } .cp-tag, .cp-clear { flex: none; white-space: nowrap; }
  }
  @media (min-width: 1100px) { .collection-page .collection-page__grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; } }
  @media (min-width: 768px) { .cp-layout .collection-page__grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const covers = {};
  try { (await (await fetch('/collections.json?limit=50')).json()).collections.forEach((c) => (covers[c.handle] = c.image?.src)); } catch {}
  const thumb = (h) => (covers[h] ? `<img src="${covers[h].replace(/(\.\w+)\?/, '_96x96_crop_center$1?')}" alt="">` : '<img alt="">');
  const applied = state === 'applied' || state === 'none';
  const total = state === 'none' ? 0 : applied ? 12 : 55;

  // Heading row, craft row
  const head = document.createElement('div');
  head.className = 'cp-head';
  h1.before(head);
  head.append(h1);
  head.insertAdjacentHTML('beforeend', `<p class="cp-count">${total} pieces</p>`);
  const crafts = [['bouquets', 'Bouquets'], ['keychains', 'Keychains'], ['hair-accessories', 'Hair accessories'], ['bag-charms', 'Bag charms'], ['flower-pots', 'Flower pots']];
  const craftChips = `<a class="cp-chip cp-chip--all" aria-current="page">All</a>` + crafts.map(([h, t]) => `<a class="cp-chip">${thumb(h)}${t}</a>`).join('');
  const sortPill = `<span class="cp-sort">Sort: <strong>Featured</strong>${I.chev}</span>`;
  const tags = applied ? `<div class="cp-applied"><span class="cp-tag">Under ₹200 ${I.x}</span><span class="cp-tag">Birthday ${I.x}</span><a class="cp-clear">Clear all</a></div>` : '';
  const opt = (t, n, on) => `<span class="cp-opt${on ? ' is-on' : ''}">${on ? I.tick : ''}${t}${n ? ` <small>${n}</small>` : ''}</span>`;
  const groups = (asList) => {
    const o = asList
      ? (t, n, on, radio) => `<span class="cp-check${on ? ' is-on' : ''}${radio ? ' is-radio' : ''}"><i>${on ? I.tick : ''}</i>${t}<small>${n || ''}</small></span>`
      : opt;
    return `
    <div class="cp-group"><p class="cp-label">Price</p><div class="cp-opts">${o('Under ₹200', '', applied, 1)}${o('₹200 to ₹399', '', 0, 1)}${o('₹400 and above', '', 0, 1)}</div></div>
    <div class="cp-group"><p class="cp-label">Occasion</p><div class="cp-opts">${o('Birthday', 33, applied)}${o('Anniversary', 7)}${o('Thank you', 26)}${o('For her', 32)}${o('For him', 10)}</div></div>
    <div class="cp-group"><p class="cp-label">Flower &amp; motif</p><div class="cp-opts">${o('Sunflower', 23)}${o('Daisy', 20)}${o('Rose', 8)}${o('Tulip', 6)}${o('Evil eye', 8)}${o('Bee', 4)}${o('Chick', 4)}${o('Octopus', 4)}</div></div>
    <div class="cp-group"><span class="cp-switch"><i></i>In stock only</span></div>`;
  };

  let before = '';
  if (isPhone) {
    if (phone === 'row') {
      before = `<div class="cp-crafts"><span class="cp-pill${applied ? ' is-on' : ''}" style="padding-right:16px">${I.filter}Filter${applied ? ' <b>2</b>' : ''}</span><span class="cp-iconbtn">${I.sort}</span><span class="cp-div"></span>${craftChips}</div>${tags}`;
    } else {
      before = `<div class="cp-crafts">${craftChips}</div>${tags}`;
      document.body.insertAdjacentHTML('beforeend', `<div class="cp-float"><span>${I.filter}Filter${applied ? ' <b>2</b>' : ''}</span><span>${I.sort}Sort</span></div>`);
    }
  } else if (desk === 'bar') {
    const dd = (t, on, n) => `<span class="cp-pill${on ? ' is-on' : ''}">${t}${n ? ` <b>${n}</b>` : ''}${I.chev}</span>`;
    const pop = state === 'open' ? `<div class="cp-pop"><div class="cp-opts">${opt('Birthday', 33, 1)}${opt('Anniversary', 7)}${opt('Thank you', 26)}${opt('For her', 32)}${opt('For him', 10)}</div></div>` : '';
    before = `<div class="cp-crafts">${craftChips}</div><div class="cp-bar">${dd('Price', applied, applied ? 1 : 0)}${dd('Occasion', applied || state === 'open', applied || state === 'open' ? 1 : 0)}${dd('Flower &amp; motif')}<span class="cp-switch"><i></i>In stock only</span>${sortPill}${pop}</div>${tags}`;
  } else if (desk === 'button') {
    before = `<div class="cp-crafts">${craftChips}</div><div class="cp-bar"><span class="cp-pill${applied ? ' is-on' : ''}" style="padding-right:16px">${I.filter}Filter${applied ? ' <b>2</b>' : ''}</span>${sortPill}</div>${tags}`;
    if (state === 'open') document.body.insertAdjacentHTML('beforeend', `<div class="cp-scrim"></div><div class="cp-sheet cp-sheet--right"><div class="cp-sheet__top"><h2>Filter</h2><span class="cp-sheet__x">${I.x}</span></div><div class="cp-sheet__body">${groups(false)}</div><div class="cp-sheet__foot"><span class="btn btn--ghost">Clear all</span><span class="btn">Show 55 pieces</span></div></div>`);
  } else if (desk === 'side') {
    before = `<div class="cp-crafts">${craftChips}</div><div class="cp-bar" style="border-top:0;padding-top:0">${tags ? tags.replace('cp-applied"', 'cp-applied" style="margin:0"') : ''}${sortPill}</div>`;
    const layout = document.createElement('div');
    layout.className = 'cp-layout';
    grid.before(layout);
    layout.innerHTML = `<aside class="cp-side">${groups(true)}</aside><div class="cp-main"></div>`;
    layout.querySelector('.cp-main').append(grid, ...page.querySelectorAll('.collection-page__pages'));
  }
  (page.querySelector('.cp-layout') || grid).insertAdjacentHTML('beforebegin', before);

  // The phone sheet
  if (isPhone && state === 'open') {
    document.body.insertAdjacentHTML('beforeend', `<div class="cp-scrim"></div><div class="cp-sheet cp-sheet--bottom"><div class="cp-grab"></div><div class="cp-sheet__top"><h2>Filter</h2><span class="cp-sheet__x">${I.x}</span></div><div class="cp-sheet__body">${groups(false).replace('Under ₹200', 'Under ₹200').replace('cp-opt">Birthday', 'cp-opt is-on">' + I.tick + 'Birthday')}</div><div class="cp-sheet__foot"><span class="btn btn--ghost">Clear all</span><span class="btn">Show 33 pieces</span></div></div>`);
    document.querySelector('.cp-float')?.remove();
  }

  // Grid: 24 a page (12 when filtered), wider photos, Load more
  const items = [...grid.children];
  const keep = state === 'none' ? 0 : applied ? 12 : 24;
  items.slice(keep).forEach((li) => li.remove());
  grid.querySelectorAll('img').forEach((img) => { img.sizes = innerWidth >= 1100 ? '302px' : img.sizes; img.loading = 'eager'; });
  page.querySelectorAll('.collection-page__pages').forEach((n) => n.remove());
  if (state === 'none') {
    grid.insertAdjacentHTML('afterend', `<div class="cp-none"><h2>No pieces match these filters</h2><p>Try taking one off, or see everything we make.</p><span class="btn btn--ghost">Clear filters</span></div>`);
  } else if (!applied) {
    (page.querySelector('.cp-main') || page).insertAdjacentHTML('beforeend', `<div class="cp-more"><p>Showing 24 of 55</p><span class="btn btn--ghost">Load more</span></div>`);
  }
  await new Promise((r) => setTimeout(r, 1800));
  const first = grid.querySelector('.card__media')?.getBoundingClientRect();
  return { firstProductTop: first && Math.round(first.top + scrollY), photo: first && Math.round(first.width), sideScroll: document.documentElement.scrollWidth > innerWidth };
};
