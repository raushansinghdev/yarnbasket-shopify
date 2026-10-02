// Writes theme/snippets/yarn-lettering.liquid: a phrase drawn as ONE continuous strand of yarn (docs/yarn-heading.md).
// Usage: node tools/yarn-lettering.mjs ["stitched with love"]
// The letters come from EMS Allure (tools/fonts, SIL OFL), a single-line script. Its strokes are joined in writing
// order: letters flow into each other and words are linked by a soft dip of slack yarn. A yarn ball rests after the
// last word: a crochet hook draws yarn from it to the start, writes the words with the strand at its tip (the yarn
// feeding from the ball, hanging under the line), and arrives back at the ball. Then the t's are crossed, the i's
// dotted with rose knots, and the hook lifts away. Only the drawing ships
// (theme/snippets/yarn-lettering.liquid), not the font.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TEXT = process.argv[2] || 'stitched with love';
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
const norm = ([x, y]) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };

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
    const n = part.replace(/[ML]/g, ' ').trim().split(/[\s,]+/).map(Number);
    const pts = [];
    for (let i = 0; i < n.length; i += 2) pts.push([n[i] + x, n[i + 1]]);
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
  const len = s.pts.reduce((n, p, k) => (k ? n + Math.hypot(p[0] - s.pts[k - 1][0], p[1] - s.pts[k - 1][1]) : 0), 0);
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

// The yarn ball rests just after the curl, a little below the baseline, like a full stop.
const BALL_R = 150; // font units
const TRACK_Y = -70;
const ballEnd = [e[0] + 330, TRACK_Y];

// 4. Fewer points (Ramer-Douglas-Peucker, about a hair's width), then into a box (1/4 scale, y down, whole numbers),
//    smoothed with Catmull-Rom. Keeps the inline drawing small.
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
pts.splice(0, pts.length, ...rdp(pts, 5));
const SCALE = 0.25;
// The slack feeding the hook hangs about this far below the baseline.
const SLACK_Y = -230;
const all = [...pts, ...bars.flat(), ...knots, [ballEnd[0] - BALL_R, SLACK_Y], [ballEnd[0] + BALL_R, TRACK_Y + BALL_R]];
const minX = Math.min(...all.map((q) => q[0]));
const minY = Math.min(...all.map((q) => -q[1]));
const T = ([px, py]) => [(px - minX) * SCALE, (-py - minY) * SCALE];
const r0 = (n) => Math.round(n);
const r1 = (n) => Math.round(n * 10) / 10;
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
const strandPath = smooth(pts);
const barPaths = bars.map((b) => smooth(b));
const K = knots.map(T);
const B1 = T(ballEnd), BR = BALL_R * SCALE, SLACK = T([0, SLACK_Y])[1];
const ext = all.map(T);
const W = Math.ceil(Math.max(...ext.map((q) => q[0])));
const H = Math.ceil(Math.max(...ext.map((q) => q[1])));
const SW = 17; // yarn thickness, in box units
const PAD = 18;
const L = strandPath.len;
const vb = `${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`;

// The crochet hook, drawn with its tip at 0,0: a steel shaft rising up and to the right (as if held from the top
// right), the little hook at the tip, and a rose thumb rest. About as tall as the letters' ascenders.
const hook = `<g class="yarn__hook"><g class="yarn__hook-art" transform="rotate(30)">
      <path class="yarn__shaft" d="M0 -3 L0 -185"/>
      <path class="yarn__notch" d="M0 -3 q-11 3 -14 -10"/>
      <path class="yarn__grip" d="M0 -95 L0 -187"/>
      <path class="yarn__shine" d="M-4 -112 L-4 -172"/>
    </g></g>`;
// The ball, after the last word; it turns a little as yarn is drawn from it.
const ballSvg = `<g class="yarn__ball" transform="translate(${r1(B1[0])} ${r1(B1[1])})"><g class="yarn__roll">
    <circle r="${r1(BR)}"/>
    <path class="yarn__wraps" d="M${r1(-BR * 0.9)} ${r1(-BR * 0.3)}Q0 ${r1(BR * 0.55)} ${r1(BR * 0.9)} ${r1(-BR * 0.25)}M${r1(-BR * 0.75)} ${r1(-BR * 0.65)}Q${r1(BR * 0.1)} ${r1(BR * 0.15)} ${r1(BR * 0.55)} ${r1(BR * 0.8)}M${r1(-BR * 0.2)} ${r1(-BR * 0.95)}Q${r1(BR * 0.6)} ${r1(-BR * 0.2)} ${r1(BR * 0.95)} ${r1(BR * 0.25)}"/>
  </g></g>`;
const barsSvg = barPaths.map((b, i) => `<path class="yarn__bar" style="--i: ${i}" pathLength="1" d="${b.d}"/>`).join('');
const barsGhost = barPaths.map((b) => `<path d="${b.d}"/>`).join('');
const knotsSvg = K.map(([kx, ky], i) => `<g class="yarn__knot" style="--i: ${i}"><circle cx="${r1(kx)}" cy="${r1(ky)}" r="${r1(SW * 0.78)}"/><path d="M${r1(kx - SW * 0.35)} ${r1(ky - SW * 0.1)}q${r1(SW * 0.35)} ${r1(SW * 0.25)} ${r1(SW * 0.7)} 0"/></g>`).join('');

const out = `{%- doc -%}
  "${TEXT}" written by one strand of yarn (docs/yarn-heading.md). GENERATED by tools/yarn-lettering.mjs; edit that, not this.
  The hero renders it for the *highlighted* words when they are "${TEXT}"; other words keep the stitched underline.
  - The real words stay in the heading (visually hidden), so Google and screen readers read them; the drawing is
    aria-hidden.
  - Every time the home page opens: the words show first as a faint dashed pattern, with the yarn ball after the last
    word. 2.5 s after the page appears (or after the logo intro ends), a crochet hook draws yarn from the ball to the
    start (0.9 s), stitches the words over the pattern (4.2 s, the yarn feeding from the ball under the line) and
    arrives back at the ball. Then the t's are crossed, the i's dotted with rose knots, and the hook lifts away. A tap
    on the heading, or scrolling the hero away, finishes it at once (WCAG 2.2.2's way to stop motion longer than 5 s).
  - Never with reduced motion or lite mode, nor once the page has been scrolled, nor without JavaScript: then it's
    simply there, finished.
  Render it twice: part: 'script' just before the heading (sets up, before the drawing is painted, and runs it), then
  without part inside the heading.

  @param {string} [part] - 'script' for the runner only
{%- enddoc -%}
{%- if part == 'script' -%}
<script>
  (function () {
    var h = document.documentElement;
    try {
      if (h.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    } catch (e) { return; }
    h.classList.add('yarn-play');
    addEventListener('DOMContentLoaded', function () {
      var svg = document.querySelector('.yarn');
      var path = svg && svg.querySelector('#YarnStrand');
      if (!path || !path.getPointAtLength) return h.classList.remove('yarn-play');
      var q = function (s) { return svg.querySelector(s); };
      var draw = q('.yarn__draw'), hook = q('.yarn__hook'), roll = q('.yarn__roll'), feed = q('.yarn__feed');
      var L = path.getTotalLength(), PULL = 900, DUR = 4200, R = ${r1(BR)}, BX = ${r1(B1[0])}, BY = ${r1(B1[1])}, SAG = ${r1(SLACK)};
      var p0 = path.getPointAtLength(0), fx = BX - R * .6, fy = BY + R * .5;
      var start = 0, done = false, timer = 0;
      var ease = function (t) { return (1 - Math.cos(Math.PI * t)) / 2; };
      var at = function (x, y) { hook.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')'); };
      // The yarn from the ball to the hook hangs under the words, so it never crosses a letter.
      var slack = function (x, y) {
        var low = Math.max(SAG, y + 6);
        feed.setAttribute('d', 'M' + fx + ' ' + fy + 'C' + (fx - 40).toFixed(1) + ' ' + low + ' ' + (x + 30).toFixed(1) + ' ' + low + ' ' + x.toFixed(1) + ' ' + y.toFixed(1));
      };
      draw.style.strokeDasharray = L + ' ' + L;
      draw.style.strokeDashoffset = L;
      at(fx, fy);
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        draw.style.strokeDashoffset = 0;
        svg.classList.add('is-written');
      }
      function frame(now) {
        if (done) return;
        if (!start) start = now;
        var ms = now - start;
        if (ms < PULL) {
          // 1. The hook draws yarn from the ball back to where the writing starts, under the line.
          var a = ease(ms / PULL), x = fx + (p0.x - fx) * a, y = fy + (p0.y - fy) * a + Math.sin(Math.PI * a) * 18;
          at(x, y);
          slack(x, y);
          roll.setAttribute('transform', 'rotate(' + (-a * 90).toFixed(1) + ')');
        } else {
          // 2. It writes the words, the strand laid at its tip, and comes back to the ball.
          var t = Math.min(1, (ms - PULL) / DUR), e = ease(t), p = path.getPointAtLength(L * e);
          draw.style.strokeDashoffset = L * (1 - e);
          at(p.x, p.y);
          slack(p.x, p.y);
          roll.setAttribute('transform', 'rotate(' + (-90 - e * 240).toFixed(1) + ') scale(' + (1 - .12 * e).toFixed(3) + ')');
          if (t >= 1) { done = true; svg.classList.add('is-written'); return; }
        }
        requestAnimationFrame(frame);
      }
      function begin() {
        if (done) return;
        if (scrollY > 40 || document.hidden) return finish();
        svg.classList.add('is-writing');
        requestAnimationFrame(frame);
      }
      function arm() { timer = setTimeout(begin, 2500); }
      // A tap on the heading, or scrolling the hero away, finishes it at once.
      svg.closest('h1, h2').addEventListener('pointerdown', finish);
      addEventListener('scroll', function () { if (scrollY > innerHeight * .4) finish(); }, { passive: true });
      if (h.classList.contains('yb-intro')) {
        new MutationObserver(function (m, o) { if (!h.classList.contains('yb-intro')) { o.disconnect(); arm(); } }).observe(h, { attributes: true, attributeFilter: ['class'] });
      } else arm();
    });
  })();
</script>
{%- else -%}
<span class="yarn-word"><span class="visually-hidden">${TEXT}</span><svg class="yarn" viewBox="${vb}" aria-hidden="true" focusable="false">
  <defs>
    <path id="YarnStrand" d="${strandPath.d}"/>
    <mask id="YarnMask" maskUnits="userSpaceOnUse" x="${-PAD}" y="${-PAD}" width="${W + PAD * 2}" height="${H + PAD * 2}">
      <use class="yarn__draw" href="#YarnStrand" fill="none" stroke="#fff" stroke-width="${r1(SW * 1.3)}" stroke-linecap="round" stroke-linejoin="round"/>
    </mask>
  </defs>
  <g class="yarn__ghost" fill="none" stroke-width="${r1(SW * 0.28)}" stroke-linecap="round" stroke-dasharray="${r1(SW * 0.5)} ${r1(SW * 0.62)}"><use href="#YarnStrand"/>${barsGhost}</g>
  <path class="yarn__feed" fill="none" stroke-width="${r1(SW * 0.55)}" stroke-linecap="round"/>
  ${ballSvg}
  <g mask="url(#YarnMask)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <use class="yarn__shadow" href="#YarnStrand" stroke-width="${SW}" transform="translate(1.5 2.5)"/>
    <use class="yarn__ply" href="#YarnStrand" stroke-width="${SW}"/>
    <use class="yarn__twist" href="#YarnStrand" stroke-width="${r1(SW * 0.32)}" stroke-linecap="butt" stroke-dasharray="${r1(SW * 0.42)} ${r1(SW * 0.55)}" transform="translate(-1.6 -1.6)"/>
  </g>
  <g class="yarn__bars" fill="none" stroke-width="${SW}" stroke-linecap="round">${barsSvg}</g>
  ${knotsSvg}
  ${hook}
</svg></span>
{%- endif -%}

{% stylesheet %}
  /* The yarn line sits on its own line under the rest of the heading. Wider than the heading's 12ch measure on desktop,
     never wider than the screen; on desktop it keeps clear of the photo beside it. */
  .yarn-word { display: block; }
  .yarn { display: block; width: min(9.6em, calc(100vw - 2 * var(--gutter))); max-width: none; height: auto; margin: .04em 0 .06em -.1em; overflow: visible; }
  @media (min-width: 990px) { .yarn { width: 8.4em; } }
  .yarn__ply, .yarn__bar, .yarn__feed { stroke: var(--cocoa); }
  .yarn__twist { stroke: #8C6D5E; }
  .yarn__shadow { stroke: rgb(78 58 49 / .12); }
  .yarn__roll circle { fill: var(--cocoa); }
  .yarn__wraps { fill: none; stroke: #B0928A; stroke-width: 6; stroke-linecap: round; }
  .yarn__knot circle { fill: var(--rose); stroke: var(--cocoa); stroke-width: 4; }
  .yarn__knot path { fill: none; stroke: #F4CFC7; stroke-width: 2.5; stroke-linecap: round; }
  .yarn__ghost { stroke: #D9B9AF; opacity: 0; }
  .yarn__feed, .yarn__hook { opacity: 0; }
  .yarn__hook-art path { fill: none; stroke-linecap: round; }
  .yarn__shaft { stroke: #A3928A; stroke-width: 11; }
  .yarn__notch { stroke: #A3928A; stroke-width: 9; }
  .yarn__grip { stroke: var(--rose); stroke-width: 24; }
  .yarn__shine { stroke: rgb(255 255 255 / .55); stroke-width: 4.5; }

  /* html.yarn-play is set before the drawing is painted. Waiting: only the dashed pattern and the ball at the start.
     Writing: the runner lays the strand down with the hook at its tip and the ball rolling under it. Then the t's are
     crossed, the i's dotted, the hook lifts away and the pattern fades. */
  html.yarn-play .yarn__ghost { opacity: 1; }
  html.yarn-play .yarn__bar { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
  html.yarn-play .yarn__knot { opacity: 0; }
  html.yarn-play .yarn.is-writing :is(.yarn__hook, .yarn__feed) { opacity: 1; transition: opacity 600ms var(--ease-in-out); }
  html.yarn-play .yarn.is-written .yarn__ghost { opacity: 0; transition: opacity 900ms var(--ease-in-out) 300ms; }
  html.yarn-play .yarn.is-written .yarn__bar { stroke-dashoffset: 0; transition: stroke-dashoffset 450ms var(--ease-in-out) calc(var(--i) * 160ms); }
  html.yarn-play .yarn.is-written .yarn__knot { opacity: 1; transform-box: fill-box; transform-origin: center; animation: yarn-knot 500ms var(--ease-out) calc(450ms + var(--i) * 160ms) both; }
  html.yarn-play .yarn.is-written :is(.yarn__hook, .yarn__feed) { opacity: 0; transition: opacity 600ms var(--ease-in-out) 300ms; }
  html.yarn-play .yarn.is-written .yarn__hook-art { translate: 12px -16px; transition: translate 900ms var(--ease-out) 300ms; }
  @keyframes yarn-knot { from { opacity: 0; transform: scale(.3); } }
  @media (forced-colors: active) {
    .yarn__ply, .yarn__bar { stroke: CanvasText; }
    .yarn__twist, .yarn__shadow, .yarn__knot path, .yarn__wraps, .yarn__hook, .yarn__feed, .yarn__ghost { display: none; }
    .yarn__knot circle, .yarn__roll circle { fill: CanvasText; stroke: none; }
  }
{% endstylesheet %}
`;
writeFileSync(`${ROOT}theme/snippets/yarn-lettering.liquid`, out);
console.log(`yarn-lettering: "${TEXT}" → ${W}×${H}, strand ${L} long, ${K.length} knots, ${barPaths.length} bars, path ${strandPath.d.length} chars`);
