/* Yarn Basket brand drawing kit.
   Everything is plain SVG (no <use>, no CSS variables) so exported files open
   cleanly in Canva, Illustrator and print shops. Text is converted to outlines
   with opentype.js, so no fonts are needed to view the files. */

const C = {
  cocoa: '#6B4F43', blush: '#F2D4CC', rose: '#E3A69C', sage: '#A9B8A0',
  oat: '#F5EFE6', cream: '#FBF6EF', taupe: '#8E7468', brown: '#8C6D5E'
};

// mark palettes
const PAL = {
  colour:  { l: C.cocoa, f1: C.blush, f6: C.blush, f3: C.sage, bk: C.cream },  // on light / transparent
  blush:   { l: C.cocoa, f1: C.rose,  f6: C.cream, f3: C.sage, bk: C.cream },  // on the blush brand colour
  reverse: { l: C.cream, f1: C.rose,  f6: C.blush, f3: C.sage, bk: C.brown },  // on cocoa / dark
  mono:    { l: C.cocoa, f1: 'none',  f6: 'none',  f3: 'none', bk: 'none' }    // one-colour line version
};

let uid = 0;
const n = (v) => +v.toFixed(2);

/* ---------- the mark (2A, heart removed). Native box: x -1..119, y -4..116 ---------- */
function petals(cx, cy, s, fill, stroke, sw) {
  let out = `<g transform="translate(${cx} ${cy}) scale(${s})" fill="${fill}" stroke="${stroke}" stroke-width="${sw}">`;
  for (const a of [0, 72, 144, 216, 288]) out += `<ellipse cx="0" cy="-6.6" rx="4.4" ry="6.2"${a ? ` transform="rotate(${a})"` : ''}/>`;
  return out + '</g>';
}
function hook(transform, colour, w) {
  return `<g transform="${transform}"><path d="M8 96 V12 C8 5 4 3.5 2.6 8" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round"/><rect x="4" y="66" width="8" height="20" rx="3" fill="${colour}"/></g>`;
}
function mark(p, id) {
  id = id || 'yb' + (++uid);
  const L = p.l;
  return `<g class="mark">
  <defs><clipPath id="${id}-ball"><circle cx="50" cy="48" r="16"/></clipPath></defs>
  <g fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M78 64 C77 52 79 42 82 32"/>
    <path d="M79 50 C86 49 92 43 93 37 C86 37 80 43 79 50 Z" fill="${p.f3}"/>
  </g>
  ${petals(83, 24, 1.3, p.f6, L, 1.35)}
  <circle cx="83" cy="24" r="3.6" fill="${p.f3}" stroke="${L}" stroke-width="1.5"/>
  ${hook('translate(30 42) rotate(-26) scale(.48) translate(-8 -50)', L, 3.8)}
  <circle cx="50" cy="48" r="16" fill="${p.f1}"/>
  <g clip-path="url(#${id}-ball)" fill="none" stroke="${L}" stroke-width="1.2" opacity=".7">
    <path d="M32 42 Q50 32 68 44"/><path d="M32 50 Q50 40 68 52"/><path d="M32 58 Q50 48 68 60"/><path d="M42 30 Q34 48 44 66"/>
  </g>
  <circle cx="50" cy="48" r="16" fill="none" stroke="${L}" stroke-width="1.8"/>
  <path d="M26 66 H94 L88 100 Q87 104 83 104 H37 Q33 104 32 100 Z" fill="${p.bk}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M29 78 H91 M31 90 H89" fill="none" stroke="${L}" stroke-width="1" opacity=".45"/>
  <rect x="21" y="60" width="78" height="7" rx="3.5" fill="${p.f1}" stroke="${L}" stroke-width="1.8"/>
</g>`;
}
// place the mark so its 120×120 box (-1,-4 … 119,116) lands at (x,y) with size s
function placeMark(p, x, y, s) {
  const k = s / 120;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(k)}) translate(1 4)">${mark(p)}</g>`;
}

/* ---------- highlight-cover icons (native box 0..40) ---------- */
function hlIcon(name, p) {
  const L = p.l, w = 2;
  const heart = (tx, ty, s, sw) => `<path transform="translate(${tx} ${ty}) scale(${s})" d="M0 11 C-10 4 -12 -1 -12 -4.5 C-12 -8.5 -9 -11 -5.8 -11 C-3 -11 -1 -9.5 0 -7.2 C1 -9.5 3 -11 5.8 -11 C9 -11 12 -8.5 12 -4.5 C12 -1 10 4 0 11 Z" fill="${p.f1}" stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  switch (name) {
    case 'bouquets':
      return petals(13, 14, .6, p.f6, L, 1.8) + petals(27, 14, .6, p.f6, L, 1.8) + petals(20, 9, .7, p.f6, L, 1.6) +
        `<path d="M10 19 H30 L20 37 Z" fill="${p.bk}" stroke="${L}" stroke-width="${w}" stroke-linejoin="round"/>` +
        `<path d="M14 24 L20 28 L26 24" fill="none" stroke="${L}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'keychains':
      return `<circle cx="20" cy="8" r="4.6" fill="none" stroke="${L}" stroke-width="${w}"/><path d="M20 12.6 V16" stroke="${L}" stroke-width="${w}"/>` + heart(20, 26, .95, 2.1);
    case 'hair-clips':
      return `<circle cx="20" cy="20" r="13" fill="${p.f1}" stroke="${L}" stroke-width="${w}"/><circle cx="20" cy="20" r="5.5" fill="${p.bg}" stroke="${L}" stroke-width="${w}"/>` +
        `<path d="M20 7.5 V13 M20 27 V32.5 M7.5 20 H13 M27 20 H32.5 M11 11 L15 15 M25 25 L29 29 M29 11 L25 15 M15 25 L11 29" stroke="${L}" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'reviews':
      return `<path d="M8 8 H32 Q35 8 35 11 V25 Q35 28 32 28 H18 L11 34 V28 H8 Q5 28 5 25 V11 Q5 8 8 8 Z" fill="${p.bk}" stroke="${L}" stroke-width="${w}" stroke-linejoin="round"/>` + heart(20, 18, .5, 3);
    case 'how-to-order':
      return `<path d="M12 16 C12 6 28 6 28 16" fill="none" stroke="${L}" stroke-width="${w}" stroke-linecap="round"/>` +
        `<path d="M8 19 H32 L29 33 Q28.6 35 26.6 35 H13.4 Q11.4 35 11 33 Z" fill="${p.bk}" stroke="${L}" stroke-width="${w}" stroke-linejoin="round"/>` +
        `<rect x="6" y="15" width="28" height="5" rx="2.5" fill="${p.f1}" stroke="${L}" stroke-width="${w}"/>`;
  }
}

/* ---------- text → outlines ---------- */
const FONTS = {};
function glyphRun(font, str, size, ls) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(str);
  const items = []; let x = 0;
  glyphs.forEach((g, i) => {
    items.push({ g, x });
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale + ls;
    x += adv;
  });
  return { items, width: x, scale };
}
function cmdsToD(cmds, tf) {
  let d = '';
  for (const c of cmds) {
    if (c.type === 'Z') { d += 'Z'; continue; }
    const pts = [];
    if (c.type === 'C') pts.push(tf(c.x1, c.y1), tf(c.x2, c.y2));
    if (c.type === 'Q') pts.push(tf(c.x1, c.y1));
    pts.push(tf(c.x, c.y));
    d += c.type + pts.map(([a, b]) => `${n(a)} ${n(b)}`).join(' ');
  }
  return d;
}
// straight text. anchor: 'start' | 'middle'
function text(fontKey, str, size, x, y, fill, opts = {}) {
  const font = FONTS[fontKey];
  const ls = opts.ls || 0;
  const run = glyphRun(font, str, size, ls);
  const x0 = opts.anchor === 'middle' ? x - run.width / 2 : x;
  let d = '';
  for (const it of run.items) d += cmdsToD(it.g.getPath(x0 + it.x, y, size).commands, (a, b) => [a, b]);
  return `<path d="${d}" fill="${fill}"/>`;
}
// text on a circle. where: 'top' (reads clockwise over the top) | 'bottom' (reads left→right along the bottom)
function arcText(fontKey, str, size, cx, cy, r, fill, opts = {}) {
  const font = FONTS[fontKey];
  const run = glyphRun(font, str, size, opts.ls || 0);
  const total = run.width;
  let d = '';
  run.items.forEach((it) => {
    const adv = it.g.advanceWidth * run.scale;
    const mid = it.x + adv / 2;
    let th, rot;
    if (opts.where === 'bottom') { th = Math.PI / 2 + total / (2 * r) - mid / r; rot = th - Math.PI / 2; }
    else { th = -Math.PI / 2 - total / (2 * r) + mid / r; rot = th + Math.PI / 2; }
    const px = cx + r * Math.cos(th), py = cy + r * Math.sin(th);
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const cmds = it.g.getPath(-adv / 2, 0, size).commands;
    d += cmdsToD(cmds, (a, b) => [px + a * cs - b * sn, py + a * sn + b * cs]);
  });
  return `<path d="${d}" fill="${fill}"/>`;
}


// one outlined path per letter (spaces skipped), for staggered animation
function letters(fontKey, str, size, x, y, opts = {}) {
  const font = FONTS[fontKey];
  const run = glyphRun(font, str, size, opts.ls || 0);
  const x0 = opts.anchor === 'middle' ? x - run.width / 2 : x;
  return run.items.map(it => cmdsToD(it.g.getPath(x0 + it.x, y, size).commands, (a, b) => [a, b])).filter(d => d.length);
}

/* ---------- lockups ---------- */
const WORD = 'Yarn Basket', TAG = 'HANDMADE WITH LOVE';
function stacked(theme) {
  const p = theme === 'reverse' ? PAL.reverse : PAL.colour;
  const ink = theme === 'reverse' ? C.cream : C.cocoa;
  const sub = theme === 'reverse' ? C.rose : C.taupe;
  return placeMark(p, 140, 0, 120) +
    text('corm', WORD, 52, 200, 168, ink, { anchor: 'middle' }) +
    text('jost', TAG, 11, 200, 200, sub, { anchor: 'middle', ls: 5.5 });
}
function horizontal(theme) {
  const p = theme === 'reverse' ? PAL.reverse : PAL.colour;
  const ink = theme === 'reverse' ? C.cream : C.cocoa;
  const sub = theme === 'reverse' ? C.rose : C.taupe;
  return placeMark(p, 0, 0, 120) +
    text('corm', WORD, 50, 124, 66, ink) +
    text('jost', TAG, 10.2, 127, 92, sub, { ls: 4.6 });
}
function wordmark(theme) {
  const ink = theme === 'reverse' ? C.cream : C.cocoa;
  const sub = theme === 'reverse' ? C.rose : C.taupe;
  return text('corm', WORD, 52, 200, 60, ink, { anchor: 'middle' }) +
    text('jost', TAG, 11, 200, 92, sub, { anchor: 'middle', ls: 5.5 });
}

/* ---------- stickers (400 box) ---------- */
function stitchRing(cx, cy, r, colour, w, dash, gap) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-dasharray="${dash} ${gap}" stroke-linecap="round"/>`;
}
function stickerLogo() {
  return `<circle cx="200" cy="200" r="196" fill="${C.blush}"/>` +
    stitchRing(200, 200, 186, C.cocoa, 1.6, 5, 6) +
    `<circle cx="200" cy="200" r="140" fill="${C.cream}"/>` +
    placeMark(PAL.colour, 200 - 108, 200 - 110, 216) +
    arcText('jost', 'YARN BASKET', 23, 200, 200, 153, C.cocoa, { where: 'top', ls: 7 }) +
    arcText('jost', TAG, 13.5, 200, 200, 172, C.cocoa, { where: 'bottom', ls: 4.2 }) +
    `<circle cx="47" cy="200" r="3.2" fill="${C.rose}"/><circle cx="353" cy="200" r="3.2" fill="${C.rose}"/>`;
}
function stickerThanks() {
  return `<circle cx="200" cy="200" r="196" fill="${C.cream}"/>` +
    `<circle cx="200" cy="200" r="196" fill="none" stroke="${C.blush}" stroke-width="10"/>` +
    stitchRing(200, 200, 178, C.cocoa, 1.6, 5, 6) +
    petals(200, 92, 2.3, C.blush, C.cocoa, .9) + `<circle cx="200" cy="92" r="5.6" fill="${C.sage}" stroke="${C.cocoa}" stroke-width="2"/>` +
    text('corm', 'Thank you', 64, 200, 212, C.cocoa, { anchor: 'middle' }) +
    text('jost', 'FOR SHOPPING HANDMADE', 13, 200, 252, C.taupe, { anchor: 'middle', ls: 4 }) +
    text('corm', 'Yarn Basket', 24, 200, 305, C.rose, { anchor: 'middle' });
}

/* ---------- canvases (fixed pixel sizes) ---------- */
function igProfile() {                    // 1080 × 1080, blush, circle-safe
  return `<rect width="1080" height="1080" fill="${C.blush}"/>` + placeMark(PAL.blush, 0, 0, 1080);
}
function highlight(name) {                // 1080 × 1920
  const p = Object.assign({ bg: C.blush }, PAL.blush);
  return `<rect width="1080" height="1920" fill="${C.blush}"/><g transform="translate(260 680) scale(14)">${hlIcon(name, p)}</g>`;
}
function flowerDeco(x, y, s, o) {
  return `<g opacity="${o}">${petals(x, y, s, 'none', C.cocoa, 2.4 / s)}<circle cx="${x}" cy="${y}" r="${n(3.6 * s / 1.3)}" fill="none" stroke="${C.cocoa}" stroke-width="2.4"/></g>`;
}
function banner() {                        // 1920 × 600
  return `<rect width="1920" height="600" fill="${C.blush}"/>` +
    flowerDeco(170, 120, 5, .16) + flowerDeco(90, 430, 3.2, .12) + flowerDeco(1760, 150, 3.6, .14) + flowerDeco(1830, 470, 5.4, .16) +
    `<g transform="translate(452 64) scale(2.8)">${horizontal('colour')}</g>` +
    `<path d="M780 468 H1140" stroke="${C.cocoa}" stroke-width="1.5" opacity=".35"/>` +
    text('jost', 'CROCHET BOUQUETS  ·  KEYCHAINS  ·  HAIR CLIPS  ·  BAG CHARMS', 25, 960, 530, C.cocoa, { anchor: 'middle', ls: 5.5 });
}

window.YB = { letters, C, PAL, FONTS, mark, placeMark, hlIcon, text, arcText, stacked, horizontal, wordmark, stickerLogo, stickerThanks, igProfile, highlight, banner };
