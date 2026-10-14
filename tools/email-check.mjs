// Yarn Basket email check (docs/emails.md): proves our restyled Shopify notification emails changed only what we meant
// to change. No browser and no store: it compares each edited template in emails/ with Shopify's original in
// emails/original/.
//
// emails/regions.json lists, per email, the only three kinds of change allowed:
//   - regions: our parts, between markers in the edited template,
//       {%- comment -%}yb:start footer{%- endcomment -%} … {%- comment -%}yb:end footer{%- endcomment -%}
//     each replacing the part of Shopify's original from the text "from" to the text "to" (both included; "from"
//     must appear once; with no "to", just the "from" text). A region is either
//       "wording": only words and HTML change; its Liquid tags and outputs must be exactly the original part's, in
//                  order, so every branch and value is still there; or
//       "replace": free markup, but it must still print every amount the original part printed, and every output
//                  named in "keep" (e.g. order_status_url), printed in {{ }} and matched as a whole name.
//   - patches: exact text replacements in Shopify's original, each with its expected count and a reason
//     ("why"). They are applied to the original before comparing.
//
// For every email it checks:
//   1. Everything else is Shopify's original, character for character (whitespace aside), so none of Shopify's
//      logic for pieces, discounts, taxes and totals was lost or edited.
//   2. Each region keeps what its kind requires (above).
//   3. Each patch matched exactly as often as expected.
//   4. The Liquid blocks (if, unless, for, case, capture, comment, raw) open and close in pairs.
// Usage: npm run check:emails
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../emails/', import.meta.url));
const regions = JSON.parse(readFileSync(root + 'regions.json', 'utf8'));
const results = [];
const record = (name, ok, detail) => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(52)} ${detail}`); };
const squash = (s) => s.replace(/\s+/g, ' ').trim();
const money = (s) => [...s.matchAll(/\{\{-?[^}]*\|\s*money[^}]*-?\}\}/g)].map((m) => squash(m[0].replace(/\{\{-?|-?\}\}/g, '')));
const once = (hay, needle) => hay.indexOf(needle) !== -1 && hay.indexOf(needle) === hay.lastIndexOf(needle);

const MARK = /\{%-?\s*comment\s*-?%\}\s*yb:(start|end)\s+([\w-]+)\s*\{%-?\s*endcomment\s*-?%\}/g;

const liquid = (s) => [...s.matchAll(/\{%-?[\s\S]*?-?%\}|\{\{-?[\s\S]*?-?\}\}/g)].map((m) => squash(m[0].replace(/^\{[{%]-?|-?[}%]\}$/g, '')));

for (const [email, spec] of Object.entries(regions)) {
  const parts = spec.regions || {};
  const patches = spec.patches || [];
  const origPath = `${root}original/${email}.liquid`;
  const editPath = `${root}${email}.liquid`;
  if (!existsSync(origPath) || !existsSync(editPath)) {
    record(`${email}: files`, false, `missing ${existsSync(origPath) ? '' : 'emails/original/' + email + '.liquid '}${existsSync(editPath) ? '' : 'emails/' + email + '.liquid'}`);
    continue;
  }
  let original = readFileSync(origPath, 'utf8');
  const patchProblems = [];
  for (const { from, to, count, why } of patches) {
    const found = original.split(from).length - 1;
    if (found !== count) patchProblems.push(`"${from.slice(0, 50)}…" found ${found}× (expected ${count}; ${why})`);
    original = original.split(from).join(to);
  }
  record(`${email}: patches match as expected`, patchProblems.length === 0, patchProblems.join('; ') || `${patches.length} patches`);
  const edited = readFileSync(editPath, 'utf8');

  // Our regions in the edited template, in order.
  const ours = {};
  const order = [];
  let open = null;
  let start = 0;
  let marks = true;
  for (const m of edited.matchAll(MARK)) {
    if (m[1] === 'start') {
      if (open) marks = false;
      open = m[2];
      start = m.index + m[0].length;
    } else {
      if (open !== m[2]) marks = false;
      ours[m[2]] = edited.slice(start, m.index);
      order.push(m[2]);
      open = null;
    }
  }
  const missing = Object.keys(parts).filter((n) => !(n in ours));
  record(`${email}: our regions are marked`, marks && !open && missing.length === 0, missing.length ? `no region for: ${missing.join(', ')}` : `${order.join(', ')}`);

  // Shopify's original with each replaced part swapped for a placeholder.
  let expected = original;
  const replaced = {};
  const anchors = [];
  for (const [name, { from, to }] of Object.entries(parts)) {
    if (!once(expected, from)) { anchors.push(`${name}: "from" ${expected.includes(from) ? 'appears more than once' : 'not found'}`); continue; }
    const a = expected.indexOf(from);
    // No "to": the region is the "from" text itself.
    const b = to === undefined ? a : expected.indexOf(to, a + from.length);
    if (b === -1) { anchors.push(`${name}: "to" not found after "from"`); continue; }
    const end = to === undefined ? a + from.length : b + to.length;
    replaced[name] = expected.slice(a, end);
    expected = `${expected.slice(0, a)}@@yb:${name}@@${expected.slice(end)}`;
  }
  record(`${email}: each replaced part is found once`, anchors.length === 0, anchors.join('; ') || `${Object.keys(replaced).length} parts`);

  // 1. Outside our regions, the edited template is the original.
  const actual = edited.replace(/\{%-?\s*comment\s*-?%\}\s*yb:start\s+([\w-]+)\s*\{%-?\s*endcomment\s*-?%\}[\s\S]*?\{%-?\s*comment\s*-?%\}\s*yb:end\s+\1\s*\{%-?\s*endcomment\s*-?%\}/g, (_, n) => `@@yb:${n}@@`);
  const same = squash(actual) === squash(expected);
  let where = '';
  if (!same) {
    const x = squash(actual), y = squash(expected);
    let i = 0;
    while (i < x.length && x[i] === y[i]) i++;
    where = `first difference near: ours "${x.slice(Math.max(0, i - 40), i + 60)}" vs Shopify's "${y.slice(Math.max(0, i - 40), i + 60)}"`;
  }
  record(`${email}: Shopify's logic is unchanged outside our parts`, same, same ? 'identical' : where);

  // 2. Each region keeps what its kind requires.
  for (const [name, text] of Object.entries(replaced)) {
    const mine = ours[name] || '';
    const { kind = 'replace', keep = [] } = parts[name];
    if (kind === 'wording') {
      const a = liquid(text), b = liquid(mine);
      let i = 0;
      while (i < a.length && a[i] === b[i]) i++;
      const same = a.length === b.length && i === a.length;
      record(`${email}: "${name}" changes words only`, same, same ? `${a.length} Liquid tags and outputs, unchanged` : `differs at #${i + 1}: Shopify's "${a[i] || '(end)'}" vs ours "${b[i] || '(end)'}"`);
    } else {
      // Printed outputs only ({{ … }}): a name left in an {% if %} or {% for %} doesn't put it in the email.
      const outs = [...mine.matchAll(/\{\{-?([\s\S]*?)-?\}\}/g)].map((m) => squash(m[1])).join(' ');
      const lost = money(text).filter((m) => !money(mine).includes(m));
      // Whole names only: "fulfillment.tracking_url" must not count as kept because "fulfillment.tracking_urls[…]" is.
      const gone = keep.filter((k) => !new RegExp(`(?<![\\w.])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\w)`).test(outs));
      record(`${email}: "${name}" keeps every amount and link`, lost.length === 0 && gone.length === 0, [...lost, ...gone].join('; ') || `${money(text).length} amounts, ${keep.length} kept outputs`);
    }
  }

  // 3. Liquid blocks open and close in pairs.
  const stack = [];
  let bad = '';
  const raw = edited.replace(/\{%-?\s*raw\s*-?%\}[\s\S]*?\{%-?\s*endraw\s*-?%\}/g, '');
  for (const m of raw.matchAll(/\{%-?\s*(\w+)/g)) {
    const tag = m[1];
    if (['if', 'unless', 'for', 'case', 'capture', 'comment', 'tablerow'].includes(tag)) stack.push(tag);
    else if (tag.startsWith('end')) {
      const want = tag.slice(3);
      if (stack.pop() !== want) { bad = `"${tag}" near character ${m.index}`; break; }
    }
  }
  if (!bad && stack.length) bad = `unclosed: ${stack.join(', ')}`;
  record(`${email}: Liquid blocks open and close in pairs`, !bad, bad || 'balanced');
}

const failed = results.filter((ok) => !ok).length;
console.log(failed ? `\n${failed} email check(s) failed` : `\n${results.length}/${results.length} email checks passed`);
process.exit(failed ? 1 : 0);
