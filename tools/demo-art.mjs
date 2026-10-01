// Draws brand-style demo illustrations for the theme (theme/assets/demo-*.svg).
// They stand in for product photos until real ones are uploaded, and use the brand kit's
// palette, line weight and five-petal flower so the page can be judged as a whole.
// Run: node tools/demo-art.mjs
import { writeFileSync } from 'node:fs';

const C = {
  cocoa: '#6B4F43', blush: '#F2D4CC', rose: '#E3A69C', sage: '#A9B8A0',
  oat: '#F5EFE6', cream: '#FBF6EF', kraft: '#EAD7C7', kraftDark: '#DCC3AF', metal: '#B8A79D',
};
const BG = {
  blush: ['#F8E4DE', '#FCF1EE'],
  oat: ['#F2EADF', '#FAF5EF'],
  sage: ['#E5EBE0', '#F4F6F1'],
  rose: ['#F3D9D2', '#FBEDE9'],
  cream: ['#F6EEE6', '#FDF9F5'],
};
const L = C.cocoa;
const SW = 3.2;
const n = (v) => +v.toFixed(1);

const petals = (cx, cy, s, fill, centre = C.sage) =>
  `<g transform="translate(${n(cx)} ${n(cy)}) scale(${s})" fill="${fill}" stroke="${L}" stroke-width="${n(SW / s)}">` +
  [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6.6" rx="4.4" ry="6.2"${a ? ` transform="rotate(${a})"` : ''}/>`).join('') +
  `<circle r="2.6" fill="${centre}"/></g>`;

const leaf = (x, y, rot, len = 70, fill = C.sage) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C ${len * 0.35} -${len * 0.32}, ${len * 0.75} -${len * 0.28}, ${len} 0 C ${len * 0.75} ${len * 0.28}, ${len * 0.35} ${len * 0.32}, 0 0 Z" fill="${fill}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M6 0 H${len - 10}" stroke="${L}" stroke-width="1.6" opacity=".5"/></g>`;

const outlineFlower = (x, y, s, o) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${L}" stroke-width="${n(1.4 / s)}" opacity="${o}">` +
  [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6.6" rx="4.4" ry="6.2" transform="rotate(${a})"/>`).join('') +
  `<circle r="2.2"/></g>`;

function frame(bg, body, deco = true) {
  const [a, b] = BG[bg];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">` +
    `<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs>` +
    `<rect width="800" height="1000" fill="url(#g)"/>` +
    `<ellipse cx="400" cy="880" rx="210" ry="26" fill="${L}" opacity=".07"/>` +
    (deco ? outlineFlower(110, 150, 4.2, 0.16) + outlineFlower(690, 820, 3.2, 0.14) : '') +
    `<g stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

/* ---------- subjects ---------- */
function bouquet(fills) {
  let s = '';
  s += leaf(300, 420, -150, 90) + leaf(500, 420, -30, 90) + leaf(330, 330, -120, 80) + leaf(470, 330, -60, 80);
  const spots = [[400, 300, 5.6], [318, 360, 5], [482, 360, 5], [360, 250, 4.6], [440, 250, 4.6], [280, 290, 4.2], [520, 290, 4.2], [400, 400, 5]];
  // Spread the flower heads out from the centre and enlarge them so the bouquet reads as full.
  spots.forEach(([x, y, k], i) => {
    s += petals(400 + (x - 400) * 1.3, 330 + (y - 330) * 1.3, k * 1.45, fills[i % fills.length], i % 2 ? C.sage : C.rose);
  });
  // kraft wrap
  s += `<path d="M228 420 L572 420 L428 860 Q400 884 372 860 Z" fill="${C.kraft}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<path d="M228 420 L400 520 L572 420" fill="none" stroke="${L}" stroke-width="2" opacity=".45"/>`;
  s += `<path d="M300 430 L392 845 M500 430 L408 845" stroke="${C.kraftDark}" stroke-width="3"/>`;
  // ribbon
  s += `<path d="M400 640 C 340 590, 300 640, 330 670 C 350 690, 380 670, 400 640 Z" fill="${C.rose}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<path d="M400 640 C 460 590, 500 640, 470 670 C 450 690, 420 670, 400 640 Z" fill="${C.rose}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<path d="M396 650 C 380 700, 360 730, 340 760 M404 650 C 420 700, 444 730, 466 752" fill="none" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<circle cx="400" cy="642" r="12" fill="${C.blush}" stroke="${L}" stroke-width="${SW}"/>`;
  return s;
}

function tulips() {
  const tulip = (x, y, rot, fill) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    `<path d="M0 30 C -4 120, 4 220, 0 320" fill="none" stroke="${L}" stroke-width="${SW}"/>` +
    `<path d="M-46 -10 C -50 -70, -22 -96, 0 -70 C 22 -96, 50 -70, 46 -10 C 40 34, -40 34, -46 -10 Z" fill="${fill}" stroke="${L}" stroke-width="${SW}"/>` +
    `<path d="M0 -70 C -14 -40, -14 -10, 0 24 C 14 -10, 14 -40, 0 -70" fill="none" stroke="${L}" stroke-width="2" opacity=".55"/></g>`;
  let s = leaf(380, 640, -110, 150) + leaf(420, 640, -70, 150);
  s += tulip(300, 330, -16, C.blush) + tulip(500, 330, 16, C.cream) + tulip(400, 270, 0, C.rose);
  s += `<path d="M300 600 L500 600 L460 820 Q400 846 340 820 Z" fill="${C.cream}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<path d="M318 660 H482" stroke="${C.rose}" stroke-width="10"/>`;
  return s;
}

function keychainStrawberry() {
  let s = `<circle cx="400" cy="190" r="62" fill="none" stroke="${C.metal}" stroke-width="12"/><circle cx="400" cy="190" r="62" fill="none" stroke="${L}" stroke-width="2" opacity=".5"/>`;
  for (let i = 0; i < 4; i++) s += `<ellipse cx="400" cy="${270 + i * 30}" rx="10" ry="16" fill="none" stroke="${C.metal}" stroke-width="7"/>`;
  s += `<g transform="translate(400 600)">` +
    `<path d="M0 -150 C 130 -150, 170 -40, 118 86 C 76 190, 20 236, 0 240 C -20 236, -76 190, -118 86 C -170 -40, -130 -150, 0 -150 Z" fill="${C.rose}" stroke="${L}" stroke-width="${SW}"/>`;
  [[-60, -60], [0, -80], [60, -60], [-80, 20], [-20, 0], [40, 10], [90, 30], [-50, 90], [10, 80], [60, 110], [-10, 160]].forEach(([x, y]) => {
    s += `<ellipse cx="${x}" cy="${y}" rx="6" ry="10" fill="${C.cream}" stroke="${L}" stroke-width="2"/>`;
  });
  [-60, -30, 0, 30, 60].forEach((a) => { s += `<ellipse cx="0" cy="-160" rx="22" ry="44" transform="rotate(${a} 0 -150)" fill="${C.sage}" stroke="${L}" stroke-width="${SW}"/>`; });
  s += `<path d="M0 -190 V -150" stroke="${L}" stroke-width="${SW}"/></g>`;
  return s;
}

function keychainHeart() {
  let s = `<circle cx="400" cy="190" r="62" fill="none" stroke="${C.metal}" stroke-width="12"/>`;
  for (let i = 0; i < 4; i++) s += `<ellipse cx="400" cy="${270 + i * 30}" rx="10" ry="16" fill="none" stroke="${C.metal}" stroke-width="7"/>`;
  s += `<path transform="translate(400 590) scale(13)" d="M0 11 C-10 4 -12 -1 -12 -4.5 C-12 -8.5 -9 -11 -5.8 -11 C-3 -11 -1 -9.5 0 -7.2 C1 -9.5 3 -11 5.8 -11 C9 -11 12 -8.5 12 -4.5 C12 -1 10 4 0 11 Z" fill="${C.rose}" stroke="${L}" stroke-width="${n(SW / 13)}"/>`;
  s += petals(470, 520, 3.4, C.cream);
  for (let r = 0; r < 5; r++) s += `<path d="M${310 + r * 6} ${500 + r * 34} Q 400 ${470 + r * 34} ${490 - r * 6} ${500 + r * 34}" fill="none" stroke="${L}" stroke-width="1.6" opacity=".35"/>`;
  return s;
}

function hairClip() {
  let s = `<rect x="170" y="520" width="460" height="56" rx="28" fill="${C.metal}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<path d="M200 548 H600" stroke="${L}" stroke-width="2" opacity=".4"/>`;
  s += leaf(250, 470, -160, 80) + leaf(550, 470, -20, 80);
  s += petals(280, 470, 7, C.blush) + petals(520, 470, 7, C.blush) + petals(400, 440, 8.6, C.rose, C.cream);
  return `<g transform="translate(400 500) scale(1.3) translate(-400 -500)">${s}</g>`;
}

function scrunchie() {
  let s = '';
  const R = 190;
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    s += `<circle cx="${n(400 + Math.cos(a) * R)}" cy="${n(500 + Math.sin(a) * R)}" r="62" fill="${i % 2 ? C.rose : C.blush}" stroke="${L}" stroke-width="${SW}"/>`;
  }
  s += `<circle cx="400" cy="500" r="128" fill="url(#g)" stroke="${L}" stroke-width="${SW}"/>`;
  return s;
}

function bagCharm() {
  let s = `<path d="M400 120 C 360 120, 350 170, 380 190 L 380 230 H 420 V 190 C 450 170, 440 120, 400 120 Z" fill="${C.metal}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<circle cx="400" cy="280" r="40" fill="none" stroke="${C.metal}" stroke-width="10"/>`;
  s += `<path d="M400 320 V 420" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<circle cx="400" cy="520" r="110" fill="${C.rose}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<g fill="none" stroke="${L}" stroke-width="2.2" opacity=".6"><path d="M296 490 Q 400 430 504 500"/><path d="M292 540 Q 400 480 508 552"/><path d="M310 590 Q 400 540 490 600"/><path d="M350 418 Q 300 520 360 622"/></g>`;
  s += `<path d="M352 626 L330 820 M376 630 L366 836 M400 630 V 840 M424 630 L434 836 M448 626 L470 820" stroke="${C.blush}" stroke-width="12"/>`;
  s += `<path d="M352 626 L330 820 M376 630 L366 836 M400 630 V 840 M424 630 L434 836 M448 626 L470 820" stroke="${L}" stroke-width="1.6" opacity=".5"/>`;
  s += petals(500, 430, 4, C.cream);
  return s;
}

function maker() {
  let s = `<path d="M560 560 C 650 640, 700 760, 640 860 S 470 900, 420 960" fill="none" stroke="${C.rose}" stroke-width="5"/>`;
  s += `<defs><clipPath id="ball"><circle cx="400" cy="480" r="200"/></clipPath></defs>`;
  s += `<circle cx="400" cy="480" r="200" fill="${C.rose}"/>`;
  s += `<g clip-path="url(#ball)" fill="none" stroke="${L}" stroke-width="3" opacity=".55">` +
    [-120, -60, 0, 60, 120].map((d) => `<path d="M170 ${420 + d} Q 400 ${300 + d} 630 ${440 + d}"/>`).join('') +
    `<path d="M300 260 Q 200 480 320 700"/><path d="M380 270 Q 300 480 400 690"/></g>`;
  s += `<circle cx="400" cy="480" r="200" fill="none" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<g transform="translate(250 180) rotate(-28)"><path d="M0 0 V 520 Q 0 548 -16 540" fill="none" stroke="${L}" stroke-width="16"/><path d="M0 0 V 520" stroke="${C.metal}" stroke-width="9"/><rect x="-16" y="300" width="32" height="140" rx="12" fill="${C.sage}" stroke="${L}" stroke-width="${SW}"/></g>`;
  s += petals(580, 300, 5, C.cream);
  return s;
}

const art = {
  'bouquet-rose': frame('blush', bouquet([C.rose, C.blush, C.cream])),
  'bouquet-cream': frame('sage', bouquet([C.cream, C.blush, C.cream, C.rose])),
  'tulips': frame('oat', tulips()),
  'keychain-strawberry': frame('sage', keychainStrawberry()),
  'keychain-heart': frame('rose', keychainHeart()),
  'hair-clip': frame('rose', hairClip()),
  'scrunchie': frame('cream', scrunchie(), false),
  'bag-charm': frame('oat', bagCharm()),
  'maker': frame('blush', maker()),
};
for (const [name, svg] of Object.entries(art)) {
  writeFileSync(new URL(`../theme/assets/demo-${name}.svg`, import.meta.url), svg);
  console.log(`demo-${name}.svg`, svg.length);
}
