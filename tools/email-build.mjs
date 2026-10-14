// Builds our emails from Shopify's originals (docs/emails.md): emails/original/<email>.liquid + emails/regions.json
// (+ the files in emails/parts/) → emails/<email>.liquid. Patches are applied first, then each region is replaced by
// its part (or, for a "wording" region, by Shopify's own part with only the listed sentences changed), between
// yb:start / yb:end markers. When Shopify updates a default template, copy the new original in and run this again;
// `npm run check:emails` then proves the result.
// Usage: npm run build:emails
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../emails/', import.meta.url));
const regions = JSON.parse(readFileSync(root + 'regions.json', 'utf8'));

for (const [email, spec] of Object.entries(regions)) {
  let text = readFileSync(`${root}original/${email}.liquid`, 'utf8');
  for (const { from, to, count, why } of spec.patches || []) {
    const found = text.split(from).length - 1;
    if (found !== count) throw new Error(`${email}: patch "${from.slice(0, 60)}" found ${found}×, expected ${count} (${why})`);
    text = text.split(from).join(to);
  }
  for (const [name, r] of Object.entries(spec.regions || {})) {
    const a = text.indexOf(r.from);
    if (a === -1 || a !== text.lastIndexOf(r.from)) throw new Error(`${email}: region "${name}": "from" must appear exactly once`);
    // No "to": the region is the "from" text itself (one line kept and added to, e.g. the message plus the progress bar).
    const b = r.to === undefined ? a : text.indexOf(r.to, a + r.from.length);
    if (b === -1) throw new Error(`${email}: region "${name}": "to" not found after "from"`);
    const end = r.to === undefined ? a + r.from.length : b + r.to.length;
    let ours;
    if (r.kind === 'wording') {
      ours = text.slice(a, end);
    } else {
      // A part may be one file or a list joined in order (the shipping emails share the parcel box and buttons, with
      // the progress bar in a different state each). Its "words", if any, then change a shared part's wording for this
      // email only (Delivered's "Delivered to").
      ours = [r.part].flat().map((p) => readFileSync(root + p, 'utf8').replace(/\n$/, '')).join('\n');
    }
    for (const [old, now] of r.words || []) {
      if (!ours.includes(old)) throw new Error(`${email}: region "${name}": sentence not found: ${old}`);
      ours = ours.split(old).join(now);
    }
    text = `${text.slice(0, a)}{%- comment -%}yb:start ${name}{%- endcomment -%}\n${ours}\n{%- comment -%}yb:end ${name}{%- endcomment -%}${text.slice(end)}`;
  }
  writeFileSync(`${root}${email}.liquid`, text);
  console.log(`built emails/${email}.liquid (${text.length.toLocaleString('en-IN')} characters)`);
}
