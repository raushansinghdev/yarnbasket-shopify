// Writes theme/snippets/yarn-lettering.liquid: phrases drawn as ONE continuous strand of yarn (docs/yarn-heading.md).
// Usage: node tools/yarn-lettering.mjs   (the phrases are in DRAWINGS below)
// The letters come from EMS Allure (tools/fonts, SIL OFL), a single-line script. Its strokes are joined in writing
// order: letters flow into each other and words are linked by a soft dip of slack yarn. Each phrase is drawn either
// still (already written) or to be written: then a crochet hook and a yarn ball arrive together at the start of a
// blank line, the hook writes the words with the strand at its tip while the ball rolls along under the line, getting
// smaller as it gives up its yarn, both leave together, and the t's are crossed and the i's dotted with rose knots.
// Only the drawings ship, not the font.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DRAWINGS = [
  { text: 'stitched with love', play: false }, // the hero: still, readable at once (docs/yarn-story-plan.md §2)
  { text: 'One stitch at a time', play: true }, // Our story: written when it comes into view (§3)
];

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const src = readFileSync(`${ROOT}tools/fonts/EMSAllure.svg`, 'utf8');
const glyphs = {};
for (const m of src.matchAll(/<glyph ([^>]*?)\/>/g)) {
  const u = /unicode="([^"]*)"/.exec(m[1])?.[1];
  if (u === undefined) continue;
  glyphs[u] = { adv: +(/horiz-adv-x="([\d.]+)"/.exec(m[1])?.[1] || 378), d: /\sd="([^"]*)"/.exec(m[1])?.[1] || '' };
}

// Allure's "s" reads like a 5 once joined, so it gets a plain script s (font units, y up, baseline 0).
const S_GLYPH = [[0, 0], [55, 90], [100, 200], [125, 290], [150, 235], [182, 168], [196, 105], [178, 48], [132, 12], [78, 6], [40, 26], [70, 12], [150, 2], [235, 0], [300, 6]];
const WORD_GAP = 230;
const TRACKING = 60; // a little room between letters, for readability
const SCALE = 0.25; // font units to box units
const SW = 17; // yarn thickness, in box units
const PAD = 18;
// Size on the page, in em of the heading's own text, per box unit: the hero's lettering keeps its round 1 size
// (8.4em desktop, 9.6em phones for a 2144-unit box).
const EM = 8.4 / 2144;
const EM_PHONE = 9.6 / 2144;
// The yarn ball rolls along just under the baseline (no letter here goes below it), a little behind the hook.
const BALL_R = 200; // font units: about 12px across on a phone, 20px on desktop
const BALL_Y = -260;

const norm = ([x, y]) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
const r0 = (n) => Math.round(n);
const r1 = (n) => Math.round(n * 10) / 10;
// Fewer points (Ramer-Douglas-Peucker, about a hair's width), to keep the inline drawing small.
const rdp = (list, eps) => {
  if (list.length < 3) return list;
  const [a, b] = [list[0], list.at(-1)];
  let far = 0, at = 0;
  for (let i = 1; i < list.length - 1; i++) {
    const [px, py] = list[i];
    const dist = Math.abs((b[1] - a[1]) * px - (b[0] - a[0]) * py + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
    if (dist > far) { far = dist; at = i; }
  }
  return far > eps ? [...rdp(list.slice(0, at + 1), eps).slice(0, -1), ...rdp(list.slice(at), eps)] : [a, b];
};

function lettering(TEXT, play, n) {
  // 1. Strokes in writing order.
  const strokes = [];
  let x = 0;
  for (const ch of TEXT) {
    if (ch === 's') {
      strokes.push({ ch, pts: S_GLYPH.map(([px, py]) => [px + x, py]) });
      x += 300 + TRACKING;
      continue;
    }
    const g = glyphs[ch] || glyphs[' '];
    for (const part of g.d.split(/(?=M)/).map((p) => p.trim()).filter(Boolean)) {
      const nums = part.replace(/[ML]/g, ' ').trim().split(/[\s,]+/).map(Number);
      const pts = [];
      for (let i = 0; i < nums.length; i += 2) pts.push([nums[i] + x, nums[i + 1]]);
      // The c's opening hook would close into an e once joined: start lower on its curve.
      if (ch === 'c') pts.splice(0, 3);
      if (pts.length > 1) strokes.push({ ch, pts });
    }
    x += g.adv + (ch === ' ' ? WORD_GAP : TRACKING);
  }

  // 2. Dots become knots and t-crosses become short bars: both are added after the strand ("cross the t's, dot the i's").
  const knots = [];
  const bars = [];
  const seq = [];
  for (const s of strokes) {
    const len = s.pts.reduce((m, p, k) => (k ? m + Math.hypot(p[0] - s.pts[k - 1][0], p[1] - s.pts[k - 1][1]) : 0), 0);
    if (s.ch === 'i' && len < 120) {
      // A little higher than the font puts it, so it clears the neighbouring t's.
      knots.push([(s.pts[0][0] + s.pts.at(-1)[0]) / 2 - 10, (s.pts[0][1] + s.pts.at(-1)[1]) / 2 + 210]);
      continue;
    }
    if (s.ch === 't' && len < 300 && seq.at(-1)?.ch === 't') {
      // Allure's crossbars run on into the next letter; keep the part over the stem.
      const [a, b] = [s.pts[0], s.pts.at(-1)], f = 0.6;
      bars.push([a, [a[0] + (b[0] - a[0]) * f / 2, a[1] + (b[1] - a[1]) * f / 2], [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]]);
      continue;
    }
    seq.push({ ...s });
  }

  // 3. One strand: a short lead-in, the strokes joined, a little curl at the end.
  const pts = [];
  const lead = seq[0].pts[0];
  pts.push([lead[0] - 130, lead[1] + 30], [lead[0] - 60, lead[1] + 22], [lead[0] - 20, lead[1] + 8]);
  seq.forEach((s, i) => {
    if (i > 0 && s.pts[0][0] - pts.at(-1)[0] > 300) {
      // Between words: trim a tail that drops below the baseline, then a soft dip of slack yarn.
      while (pts.length > 3 && pts.at(-1)[1] < -40) pts.pop();
      const p = pts.at(-1), q = s.pts[0], dist = q[0] - p[0];
      const c1 = [p[0] + dist * 0.38, p[1] - 110], c2 = [q[0] - dist * 0.38, q[1] - 110];
      for (let j = 1; j < 12; j++) pts.push(bez(p, c1, c2, q, j / 12));
    } else if (i > 0) {
      // Within a word: leave along the old direction, arrive along the new one.
      const p = pts.at(-1), q = s.pts[0], prev = pts.at(-2);
      const d1 = norm([p[0] - prev[0], p[1] - prev[1]]), d2 = norm([s.pts[1][0] - q[0], s.pts[1][1] - q[1]]);
      const k = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.4;
      const c1 = [p[0] + d1[0] * k, p[1] + d1[1] * k], c2 = [q[0] - d2[0] * k, q[1] - d2[1] * k];
      for (let j = 1; j < 10; j++) pts.push(bez(p, c1, c2, q, j / 10));
    }
    pts.push(...s.pts);
  });
  const e = pts.at(-1);
  pts.push([e[0] + 70, e[1] + 25], [e[0] + 140, e[1] + 90], [e[0] + 150, e[1] + 170], [e[0] + 95, e[1] + 185], [e[0] + 80, e[1] + 130]);

  // 4. Into a box (y down, whole numbers), smoothed with Catmull-Rom.
  pts.splice(0, pts.length, ...rdp(pts, 5));
  const all = [...pts, ...bars.flat(), ...knots, ...(play ? [[pts[0][0], BALL_Y - BALL_R]] : [])];
  const minX = Math.min(...all.map((q) => q[0]));
  const minY = Math.min(...all.map((q) => -q[1]));
  const T = ([px, py]) => [(px - minX) * SCALE, (-py - minY) * SCALE];
  const smooth = (list) => {
    const P = list.map(T);
    let d = `M${r0(P[0][0])} ${r0(P[0][1])}`;
    let len = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${r0(c1[0])} ${r0(c1[1])} ${r0(c2[0])} ${r0(c2[1])} ${r0(p2[0])} ${r0(p2[1])}`;
      let prev = p1;
      for (let j = 1; j <= 8; j++) { const q = bez(p1, c1, c2, p2, j / 8); len += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; }
    }
    return { d, len: Math.ceil(len * 1.02) };
  };
  const strand = smooth(pts);
  const barPaths = bars.map((b) => smooth(b));
  const K = knots.map(T);
  const ext = all.map(T);
  const W = Math.ceil(Math.max(...ext.map((q) => q[0])));
  const H = Math.ceil(Math.max(...ext.map((q) => q[1])));
  const vw = W + PAD * 2;
  const id = `YarnStrand-${n}`;

  const barsSvg = barPaths.map((b, i) => `<path class="yarn__bar" style="--i: ${i}" pathLength="1" d="${b.d}"/>`).join('');
  const knotsSvg = K.map(([kx, ky], i) => `<g class="yarn__knot" style="--i: ${i}"><circle cx="${r1(kx)}" cy="${r1(ky)}" r="${r1(SW * 0.78)}"/><path d="M${r1(kx - SW * 0.35)} ${r1(ky - SW * 0.1)}q${r1(SW * 0.35)} ${r1(SW * 0.25)} ${r1(SW * 0.7)} 0"/></g>`).join('');
  const strandSvg = `<use class="yarn__shadow" href="#${id}" stroke-width="${SW}" transform="translate(1.5 2.5)"/>
    <use class="yarn__ply" href="#${id}" stroke-width="${SW}"/>
    <use class="yarn__twist" href="#${id}" stroke-width="${r1(SW * 0.32)}" stroke-linecap="butt" stroke-dasharray="${r1(SW * 0.42)} ${r1(SW * 0.55)}" transform="translate(-1.6 -1.6)"/>`;
  const open = (cls, extra = '') => `<span class="yarn-word"><span class="visually-hidden">${TEXT}</span><svg class="${cls}" viewBox="${-PAD} ${-PAD} ${vw} ${H + PAD * 2}" style="--yarn-w: ${r1(vw * EM * 100) / 100}em; --yarn-w-phone: ${r1(vw * EM_PHONE * 100) / 100}em"${extra} aria-hidden="true" focusable="false">`;
  const tail = `<g class="yarn__bars" fill="none" stroke-width="${SW}" stroke-linecap="round">${barsSvg}</g>
  ${knotsSvg}`;

  let svg;
  if (!play) {
    svg = `${open('yarn')}
  <defs><path id="${id}" d="${strand.d}"/></defs>
  <g class="yarn__strand" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${strandSvg}
  </g>
  ${tail}
</svg></span>`;
  } else {
    const BR = BALL_R * SCALE, BY = T([0, BALL_Y])[1];
    // The ball starts under the start of the strand, its left edge on the box's edge, so the words keep their place.
    const BX0 = Math.max(T(pts[0])[0], 0) + BR;
    // The crochet hook, drawn with its tip at 0,0: a steel shaft rising up and to the right (as if held from the top
    // right), the little hook at the tip, and a rose thumb rest. About as tall as the letters' ascenders.
    const hook = `<g class="yarn__hook"><g class="yarn__hook-art" transform="rotate(30)">
      <path class="yarn__shaft" d="M0 -3 L0 -185"/>
      <path class="yarn__notch" d="M0 -3 q-11 3 -14 -10"/>
      <path class="yarn__grip" d="M0 -95 L0 -187"/>
      <path class="yarn__shine" d="M-4 -112 L-4 -172"/>
    </g></g>`;
    const ball = `<g class="yarn__ball" transform="translate(${r1(BX0)} ${r1(BY)})"><g class="yarn__roll">
    <circle r="${r1(BR)}"/>
    <path class="yarn__wraps" d="M${r1(-BR * 0.9)} ${r1(-BR * 0.3)}Q0 ${r1(BR * 0.55)} ${r1(BR * 0.9)} ${r1(-BR * 0.25)}M${r1(-BR * 0.75)} ${r1(-BR * 0.65)}Q${r1(BR * 0.1)} ${r1(BR * 0.15)} ${r1(BR * 0.55)} ${r1(BR * 0.8)}M${r1(-BR * 0.2)} ${r1(-BR * 0.95)}Q${r1(BR * 0.6)} ${r1(-BR * 0.2)} ${r1(BR * 0.95)} ${r1(BR * 0.25)}"/>
  </g></g>`;
    svg = `${open('yarn yarn--play', ` data-ball="${r1(BR)} ${r1(BY)} ${r1(BX0)}"`)}
  <defs>
    <path id="${id}" class="yarn__path" d="${strand.d}"/>
    <mask id="YarnMask-${n}" maskUnits="userSpaceOnUse" x="${-PAD}" y="${-PAD}" width="${vw}" height="${H + PAD * 2}">
      <use class="yarn__draw" href="#${id}" fill="none" stroke="#fff" stroke-width="${r1(SW * 1.3)}" stroke-linecap="round" stroke-linejoin="round"/>
    </mask>
  </defs>
  <path class="yarn__feed" fill="none" stroke-width="${r1(SW * 0.55)}" stroke-linecap="round"/>
  ${ball}
  <g class="yarn__strand" mask="url(#YarnMask-${n})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${strandSvg}
  </g>
  ${tail}
  ${hook}
</svg></span>`;
  }
  console.log(`yarn-lettering: "${TEXT}"${play ? ' (written)' : ''} → ${W}×${H}, strand ${strand.len} long, ${K.length} knots, ${barPaths.length} bars, path ${strand.d.length} chars`);
  return { key: TEXT.toLowerCase(), svg };
}

const drawn = DRAWINGS.map((dr, n) => ({ ...dr, ...lettering(dr.text, dr.play, n + 1) }));
const list = (play) => drawn.filter((dr) => dr.play === play).map((dr) => `"${dr.text}"`).join(', ') || 'none';

const out = `{%- doc -%}
  Words written in one strand of yarn (docs/yarn-heading.md). GENERATED by tools/yarn-lettering.mjs; edit that, not this.
  - Drawn still (already written): ${list(false)}. The hero uses it for its highlighted words.
  - Written by a crochet hook when it comes into view: ${list(true)}. Our story uses it for its heading. The line is
    blank until the whole heading is on screen; then the hook and a yarn ball arrive together, the hook writes the words
    (4.2 s) while the ball rolls along under the line, getting smaller, and both leave together; then the t's are
    crossed and the i's dotted with rose knots. Once per page view. A tap on the heading, or scrolling it off screen,
    finishes it at once (WCAG 2.2.2). Never with reduced motion or lite mode, nor without JavaScript: then it's simply
    there, finished. When it's done, the drawing fires 'yarn:written' (story-video.js waits for it).
  - The real words stay in the heading (visually hidden), so Google and screen readers read them; the drawing is
    aria-hidden.
  Callers check the words first (lowercase); any other words get nothing from here. For a written drawing, also render
  part: 'script' once, before the heading.

  @param {string} [words] - the words, lowercase
  @param {string} [part] - 'script' for the runner only
{%- enddoc -%}
{%- if part == 'script' -%}
<script>
  (function () {
    var h = document.documentElement;
    if (window.ybYarn) return;
    window.ybYarn = true;
    try {
      if (h.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    } catch (e) { return; }
    h.classList.add('yarn-play');
    var ease = function (t) { return (1 - Math.cos(Math.PI * t)) / 2; };
    var f = function (n) { return n.toFixed(1); };
    function setup(svg) {
      if (svg.dataset.armed) return;
      svg.dataset.armed = '1';
      var q = function (s) { return svg.querySelector(s); };
      var path = q('.yarn__path'), done = false;
      function finish() {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout);
        if (io) io.disconnect();
        draw.style.strokeDashoffset = 0;
        svg.classList.add('is-written');
        svg.dispatchEvent(new CustomEvent('yarn:written', { bubbles: true }));
      }
      var draw = q('.yarn__draw'), hook = q('.yarn__hook'), ball = q('.yarn__ball'), roll = q('.yarn__roll'), feed = q('.yarn__feed');
      var timers = [], io = null;
      if (!path.getPointAtLength || !window.IntersectionObserver) return finish();
      var b = svg.dataset.ball.split(' ').map(Number), R = b[0], BY = b[1], LAG = R * 1.5, bx = b[2], aim = bx, turn = 0;
      var L = path.getTotalLength(), DUR = 4200, p0 = path.getPointAtLength(0), start = 0, last = 0;
      var at = function (x, y) { hook.setAttribute('transform', 'translate(' + f(x) + ' ' + f(y) + ')'); };
      // The ball sits under the line; the yarn rises from its top to the hook's tip, hanging a little.
      var place = function (x, y, r) {
        ball.setAttribute('transform', 'translate(' + f(bx) + ' ' + BY + ')');
        roll.setAttribute('transform', 'rotate(' + f(turn) + ') scale(' + (r / R).toFixed(3) + ')');
        var sx = bx + r * .45, sy = BY - r * .85;
        feed.setAttribute('d', 'M' + f(sx) + ' ' + f(sy) + 'Q' + f((sx + x) / 2) + ' ' + f(Math.max(sy, y)) + ' ' + f(x) + ' ' + f(y));
      };
      draw.style.strokeDasharray = L + ' ' + L;
      draw.style.strokeDashoffset = L;
      at(p0.x, p0.y);
      place(p0.x, p0.y, R);
      function frame(now) {
        if (done) return;
        if (!start) start = last = now;
        var dt = now - last;
        last = now;
        var t = Math.min(1, (now - start) / DUR), e = ease(t), p = path.getPointAtLength(L * e), r = R * (1 - .3 * e);
        // The hook writes, the strand laid at its tip.
        draw.style.strokeDashoffset = L * (1 - e);
        at(p.x, p.y);
        // The ball follows a little behind, never backwards, rolling as it goes and getting smaller as its yarn is used.
        aim = Math.max(aim, p.x - LAG);
        var step = (aim - bx) * (1 - Math.exp(-dt / 260));
        bx += step;
        turn += step / r * 57.3;
        place(p.x, p.y, r);
        if (t >= 1) return finish();
        requestAnimationFrame(frame);
      }
      // 1. The whole heading is on screen: the hook and the ball arrive together. 2. 0.7 s later the writing begins.
      //    Scrolled off screen before it's done: it finishes, so it's whole when they come back.
      function watch() {
        var seen = false;
        io = new IntersectionObserver(function (list) {
          var en = list[list.length - 1];
          if (!seen && en.intersectionRatio >= .95) {
            seen = true;
            svg.classList.add('is-ready');
            timers.push(setTimeout(function () {
              if (done) return;
              svg.classList.add('is-writing');
              requestAnimationFrame(frame);
            }, 700));
          } else if (seen && !en.isIntersecting) finish();
        }, { threshold: [0, .95], rootMargin: '0px 0px -10% 0px' });
        io.observe(svg);
      }
      // A tap on the heading finishes it at once.
      svg.closest('h1, h2').addEventListener('pointerdown', finish);
      if (h.classList.contains('yb-intro')) {
        new MutationObserver(function (m, o) { if (!h.classList.contains('yb-intro')) { o.disconnect(); watch(); } }).observe(h, { attributes: true, attributeFilter: ['class'] });
      } else watch();
    }
    var scan = function (root) { root.querySelectorAll('.yarn--play').forEach(setup); };
    addEventListener('DOMContentLoaded', function () { scan(document); });
    document.addEventListener('shopify:section:load', function (event) { scan(event.target); });
  })();
</script>
{%- else -%}
{%- case words -%}
${drawn.map((dr) => `{%- when '${dr.key}' -%}\n${dr.svg}`).join('\n')}
{%- endcase -%}
{%- endif -%}

{% stylesheet %}
  /* The lettering sits on its own line in the heading, sized to the heading's text and never wider than its column.
     The hero's heading keeps a narrow 12ch measure, so there it may be as wide as the screen allows. */
  .yarn-word { display: block; }
  .yarn { display: block; width: min(var(--yarn-w-phone), 100%); max-width: none; height: auto; margin: .04em 0 .06em -.1em; overflow: visible; }
  h1 .yarn { width: min(var(--yarn-w-phone), calc(100vw - 2 * var(--gutter))); }
  h2:has(> .yarn-word) { justify-self: stretch; }
  @media (min-width: 990px) {
    .yarn { width: min(var(--yarn-w), 100%); }
    h1 .yarn { width: var(--yarn-w); }
  }
  /* The heading's own "ink" rise would compete with the writing. */
  [data-arrive~="lines"].is-arriving > h2:has(> .yarn-word) { animation: none; }
  .yarn__ply, .yarn__bar, .yarn__feed { stroke: var(--cocoa); }
  .yarn__twist { stroke: #8C6D5E; }
  .yarn__shadow { stroke: rgb(78 58 49 / .12); }
  .yarn__roll circle { fill: var(--cocoa); }
  .yarn__wraps { fill: none; stroke: #B0928A; stroke-width: 6; stroke-linecap: round; }
  .yarn__knot circle { fill: var(--rose); stroke: var(--cocoa); stroke-width: 4; }
  .yarn__knot path { fill: none; stroke: #F4CFC7; stroke-width: 2.5; stroke-linecap: round; }
  .yarn__feed, .yarn__hook, .yarn__ball { opacity: 0; }
  .yarn__roll { transform-box: fill-box; transform-origin: center; }
  .yarn__hook-art path { fill: none; stroke-linecap: round; }
  .yarn__shaft { stroke: #A3928A; stroke-width: 11; }
  .yarn__notch { stroke: #A3928A; stroke-width: 9; }
  .yarn__grip { stroke: var(--rose); stroke-width: 24; }
  .yarn__shine { stroke: rgb(255 255 255 / .55); stroke-width: 4.5; }

  /* Written drawings. html.yarn-play is set before the drawing is painted, so the line starts blank (its space kept).
     Ready: the hook and the ball settle in together at the start. Writing: the runner lays the strand down at the
     hook's tip, the ball rolling under it. Written: the hook lifts away and the ball rolls off, both fading, then the
     t's are crossed and the i's dotted. */
  html.yarn-play .yarn--play:not(.is-writing, .is-written) .yarn__strand { visibility: hidden; }
  html.yarn-play .yarn--play .yarn__bar { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
  html.yarn-play .yarn--play .yarn__knot { opacity: 0; }
  html.yarn-play .yarn--play .yarn__hook-art { translate: 10px -14px; }
  html.yarn-play .yarn--play .yarn__ball { translate: 0 -6px; }
  html.yarn-play .yarn--play:is(.is-ready, .is-writing) :is(.yarn__hook, .yarn__ball, .yarn__feed) { opacity: 1; transition: opacity 700ms var(--ease-in-out); }
  html.yarn-play .yarn--play:is(.is-ready, .is-writing) :is(.yarn__hook-art, .yarn__ball) { translate: 0 0; transition: translate 900ms var(--ease-out); }
  html.yarn-play .yarn--play.is-written :is(.yarn__hook, .yarn__ball, .yarn__feed) { opacity: 0; transition: opacity 700ms var(--ease-in-out) 200ms; }
  html.yarn-play .yarn--play.is-written .yarn__hook-art { translate: 12px -16px; transition: translate 900ms var(--ease-out) 200ms; }
  html.yarn-play .yarn--play.is-written .yarn__ball { translate: 26px 0; transition: translate 900ms var(--ease-out) 200ms; }
  html.yarn-play .yarn--play.is-written .yarn__roll { rotate: 70deg; transition: rotate 900ms var(--ease-out) 200ms; }
  html.yarn-play .yarn--play.is-written .yarn__bar { stroke-dashoffset: 0; transition: stroke-dashoffset 450ms var(--ease-in-out) calc(300ms + var(--i) * 160ms); }
  html.yarn-play .yarn--play.is-written .yarn__knot { opacity: 1; transform-box: fill-box; transform-origin: center; animation: yarn-knot 500ms var(--ease-out) calc(750ms + var(--i) * 160ms) both; }
  @keyframes yarn-knot { from { opacity: 0; transform: scale(.3); } }
  @media (forced-colors: active) {
    .yarn__ply, .yarn__bar { stroke: CanvasText; }
    .yarn__twist, .yarn__shadow, .yarn__knot path, .yarn__hook, .yarn__feed, .yarn__ball { display: none; }
    .yarn__knot circle { fill: CanvasText; stroke: none; }
  }
{% endstylesheet %}
`;
writeFileSync(`${ROOT}theme/snippets/yarn-lettering.liquid`, out);
