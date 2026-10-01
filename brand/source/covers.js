/* Yarn Basket · Instagram covers. Needs brand.js (YB) with fonts loaded.
   Every cover is drawn on a 1080 × 1440 "grid band" (what the profile grid shows).
   Feed post = 1080 × 1440. Reel cover = 1080 × 1920 with the same band centred (oy = 240). */
(function () {
  const { C, PAL, text, placeMark, hlIcon, petals } = YB;
  const W = 1080, BAND = 1440;
  const P = {
    blush: { bg: C.blush, l: C.cocoa, f1: C.rose, f6: C.cream, f3: C.sage, bk: C.cream, ink: C.cocoa, sub: C.cocoa, stitch: C.cocoa, stitchOp: .32 },
    cocoa: { bg: C.cocoa, l: C.cream, f1: C.rose, f6: C.blush, f3: C.sage, bk: C.brown, ink: C.cream, sub: C.blush, stitch: C.cream, stitchOp: .38 }
  };

  /* extra line icons in the same style (40 × 40 box) */
  function icon(name, p) {
    const L = p.l, w = 2;
    switch (name) {
      case 'bagcharm':
        return `<path d="M13 17 C13 9 27 9 27 17" fill="none" stroke="${L}" stroke-width="${w}" stroke-linecap="round"/>` +
          `<rect x="7" y="16" width="26" height="19" rx="4" fill="${p.bk}" stroke="${L}" stroke-width="${w}"/>` +
          `<path d="M27 17 V23" stroke="${L}" stroke-width="1.6" stroke-linecap="round"/>` +
          `<circle cx="27" cy="27" r="4.2" fill="${p.f1}" stroke="${L}" stroke-width="1.6"/>`;
      case 'makers': // yarn ball with a crochet hook
        return `<g transform="translate(9 5) rotate(-24) scale(.3)"><path d="M8 96 V12 C8 5 4 3.5 2.6 8" fill="none" stroke="${L}" stroke-width="6.6" stroke-linecap="round"/><rect x="4" y="66" width="8" height="20" rx="3" fill="${L}"/></g>` +
          `<circle cx="23" cy="24" r="11" fill="${p.f1}" stroke="${L}" stroke-width="${w}"/>` +
          `<path d="M13.5 20 Q23 14 32.5 21 M13 26.5 Q23 20.5 33 27.5 M19 13.8 Q14 24 20 34" fill="none" stroke="${L}" stroke-width="1.3" opacity=".75"/>`;
      case 'hook':
        return `<g transform="translate(15 1) rotate(18) scale(.37)"><path d="M8 96 V12 C8 5 4 3.5 2.6 8" fill="none" stroke="${L}" stroke-width="5.4" stroke-linecap="round"/><rect x="4" y="66" width="8" height="20" rx="3" fill="${L}"/></g>` +
          `<path d="M6 34 C12 28 18 36 24 30 S34 28 36 33" fill="none" stroke="${p.f1}" stroke-width="2.6" stroke-linecap="round"/>`;
      case 'care': // wash basin with bubbles
        return `<path d="M6 20 H34 L31 32 Q30.4 34.5 28 34.5 H12 Q9.6 34.5 9 32 Z" fill="${p.bk}" stroke="${L}" stroke-width="${w}" stroke-linejoin="round"/>` +
          `<path d="M9 25 Q14 22 20 25 T31 25" fill="none" stroke="${L}" stroke-width="1.5" stroke-linecap="round"/>` +
          `<circle cx="15" cy="12" r="3.2" fill="${p.f1}" stroke="${L}" stroke-width="1.5"/><circle cx="23" cy="8" r="2.2" fill="${p.f1}" stroke="${L}" stroke-width="1.4"/><circle cx="26" cy="15" r="2.6" fill="${p.f1}" stroke="${L}" stroke-width="1.4"/>`;
      default:
        return hlIcon(name, p);
    }
  }

  const stitchBox = (p, oy) => `<rect x="44" y="${oy + 44}" width="992" height="1352" rx="36" fill="none" stroke="${p.stitch}" stroke-opacity="${p.stitchOp}" stroke-width="3" stroke-dasharray="14 12" stroke-linecap="round"/>`;

  function footer(p, oy) {
    const pal = p === P.cocoa ? PAL.reverse : PAL.blush;
    return placeMark(pal, 368, oy + 1226, 96) + text('corm', 'Yarn Basket', 48, 476, oy + 1296, p.ink);
  }

  /* solid graphic cover */
  function graphic(g, H) {
    const oy = (H - BAND) / 2, p = P[g.theme];
    let s = `<rect width="${W}" height="${H}" fill="${p.bg}"/>` + stitchBox(p, oy);
    s += `<g transform="translate(430 ${oy + 170}) scale(5.5)">${icon(g.icon, Object.assign({}, p))}</g>`;
    s += text('jost', g.eyebrow, 30, 540, oy + 500, p.sub, { anchor: 'middle', ls: 11 });
    let y = oy + 640;
    g.title.forEach((t) => { s += text('corm', t, g.tsize || 132, 540, y, p.ink, { anchor: 'middle' }); y += (g.tsize || 132) * 1.02; });
    y += 30;
    g.body.forEach((t) => { s += text('jost', t, 34, 540, y, p.sub, { anchor: 'middle', ls: 1.2 }); y += 54; });
    return s + footer(p, oy);
  }

  /* photo frame template: oat card with a transparent photo window */
  function frame(f, H) {
    const oy = (H - BAND) / 2;
    const wx = 70, wy = oy + 70, ww = 940, wh = 1100, r = 26;
    const hole = `M${wx + r} ${wy} H${wx + ww - r} A${r} ${r} 0 0 1 ${wx + ww} ${wy + r} V${wy + wh - r} A${r} ${r} 0 0 1 ${wx + ww - r} ${wy + wh} H${wx + r} A${r} ${r} 0 0 1 ${wx} ${wy + wh - r} V${wy + r} A${r} ${r} 0 0 1 ${wx + r} ${wy} Z`;
    let s = `<path fill-rule="evenodd" fill="${C.oat}" d="M0 0 H${W} V${H} H0 Z ${hole}"/>`;
    s += `<rect x="${wx - 16}" y="${wy - 16}" width="${ww + 32}" height="${wh + 32}" rx="${r + 14}" fill="none" stroke="${C.rose}" stroke-width="3"/>`;
    s += text('corm', f.caption, 74, 540, oy + 1290, C.cocoa, { anchor: 'middle' });
    s += text('jost', 'YARN BASKET  ·  HANDMADE WITH LOVE', 22, 540, oy + 1352, C.taupe, { anchor: 'middle', ls: 8 });
    return s;
  }

  /* pinned welcome banner: 3240 × 1440, sliced into three 1080 × 1440 posts */
  function bannerPiece(i) {
    let s = `<rect width="${W}" height="${BAND}" fill="${C.blush}"/><g transform="translate(${-i * W} 0)">`;
    // continuous yarn strand from the ball across all three tiles
    s += `<path d="M700 905 C 900 1180, 1150 1200, 1400 1140 S 1900 1020, 2150 1120 S 2650 1260, 2900 1150 S 3080 1060, 3120 1090" fill="none" stroke="${C.cocoa}" stroke-width="5" stroke-linecap="round" opacity=".75"/>`;
    s += petals(3130, 1080, 3.2, C.cream, C.cocoa, .7) + `<circle cx="3130" cy="1080" r="${3.6 * 3.2 / 1.3}" fill="${C.sage}" stroke="${C.cocoa}" stroke-width="2.2"/>`;
    s += placeMark(PAL.blush, 540 - 400, 720 - 440, 800);
    s += text('corm', 'Yarn', 330, 1620, 850, C.cocoa, { anchor: 'middle' });
    s += text('corm', 'Basket', 330, 2700, 850, C.cocoa, { anchor: 'middle' });
    s += text('jost', 'HANDMADE', 40, 1620, 980, C.taupe, { anchor: 'middle', ls: 22 });
    s += text('jost', 'WITH LOVE', 40, 2700, 980, C.taupe, { anchor: 'middle', ls: 22 });
    return s + '</g>';
  }

  const GRAPHICS = [
    { id: '01-bouquets', theme: 'blush', icon: 'bouquets', eyebrow: 'CROCHET BOUQUETS', title: ['Flowers that', 'never fade'], body: ['Handmade blooms for every', 'occasion, made to last forever.'] },
    { id: '03-keychains', theme: 'cocoa', icon: 'keychains', eyebrow: 'KEYCHAINS', title: ['Tiny, cute', '& all yours'], body: ['Little crochet friends to carry', 'on your keys, every day.'] },
    { id: '05-meet-the-makers', theme: 'blush', icon: 'makers', eyebrow: 'MEET THE MAKERS', title: ['Made by', 'women artisans'], body: ['Every piece is handmade by', 'rural women artisans in India.'] },
    { id: '07-hair-clips', theme: 'cocoa', icon: 'hair-clips', eyebrow: 'HAIR CLIPS & SCRUNCHIES', title: ['Soft crochet', 'for your hair'], body: ['Clips and scrunchies that', 'add a handmade touch.'] },
    { id: '09-how-its-made', theme: 'blush', icon: 'hook', eyebrow: 'HOW IT’S MADE', title: ['One stitch', 'at a time'], body: ['Crocheted by hand with soft,', '100% acrylic yarn.'] },
    { id: '11-bag-charms-decor', theme: 'cocoa', icon: 'bagcharm', eyebrow: 'BAG CHARMS & DÉCOR', title: ['Little touches', 'of handmade'], body: ['For your bag, your desk', 'and your home.'] },
    { id: '13-customer-love', theme: 'blush', icon: 'reviews', eyebrow: 'CUSTOMER LOVE', title: ['Your words', 'make our day'], body: ['Real reviews and photos', 'from our buyers.'] },
    { id: '15-care-tips', theme: 'cocoa', icon: 'care', eyebrow: 'CARE TIPS', title: ['Caring for', 'your crochet'], body: ['Hand wash in cool water', 'Press gently, don’t wring', 'Dry flat in the shade'] },
    { id: '17-how-to-order', theme: 'blush', icon: 'how-to-order', eyebrow: 'HOW TO ORDER', title: ['Shop our', 'handmade pieces'], body: ['Tap the link in our bio to', 'shop, or send us a DM.'] }
  ];
  const FRAMES = [
    { id: '02-frame-bouquet', caption: 'Crochet bouquet' },
    { id: '04-frame-keychain', caption: 'Keychain' },
    { id: '06-frame-made-by-hand', caption: 'Made by hand' },
    { id: '08-frame-hair-clip', caption: 'Hair clip' },
    { id: '10-frame-scrunchie', caption: 'Scrunchie' },
    { id: '12-frame-bag-charm', caption: 'Bag charm' },
    { id: '14-frame-home-decor', caption: 'Home décor' },
    { id: '16-frame-packed-with-love', caption: 'Packed with love' }
  ];

  window.COVERS = { W, BAND, graphic, frame, bannerPiece, GRAPHICS, FRAMES };
})();
