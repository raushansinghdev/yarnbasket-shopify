// Writes what AI engines read about us: theme/templates/llms.txt.liquid (short) and llms-full.txt.liquid (every
// product). Shopify renders these two templates with nothing but the `agents` object, so no product, collection or
// setting can be read inside them: every fact is written in here, from the place it already lives.
// /agents.md is left to Shopify (its instructions for shopping agents change with its tools). docs/seo-plan.md, phase 7.
//
// Sources, so every fact is written once:
//   the store (read-only Admin API)        products, prices, stock, size, materials, collections, menus
//   theme/config/settings_*.json           delivery fee, free-delivery amount, dispatch and delivery days
//   theme/sections/our-story.liquid        who we are ("At a glance")
//   docs/legal/refund-policy.html          the return rule
//   theme/templates/page.custom-orders.json, page.faq.json    custom orders, questions
//
// usage: node tools/agents-build.mjs           build
//        node tools/agents-build.mjs --check   fail if a fresh build would differ from the files on disk
//                                              (a price, a name, a policy line or a collection changed)
//        node tools/agents-build.mjs --out dir write there instead of theme/templates (to read a build first)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : join(ROOT, 'theme/templates');
const STORE = 'yarn-basket-e4peuhjj.myshopify.com';
const HIDDEN_TAGS = ['test-product', 'free-gift'];
// Stands for the shop's address while the text is built; Shopify fills the real one in ({{ agents.store_url }}),
// so the links are right on the myshopify address today and on yarnbasket.in after the move.
const AT = '\u0000';

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const readJson = (p) => JSON.parse(read(p).replace(/^\s*\/\*[\s\S]*?\*\//, ''));

function storeQuery(query) {
  const cli = ['store', 'execute', '--store', STORE, '--json', '-q', query];
  const run = (cmd, pre) => execFileSync(cmd, [...pre, ...cli], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
  let out;
  try { out = run('shopify', []); } catch { out = run('npx', ['--yes', '@shopify/cli@latest']); }
  // The CLI prints one-line progress records before the result.
  return JSON.parse(out.split('\n').filter((l) => !l.startsWith('{"type":"progress"')).join('\n'));
}

// ---------- Text ----------

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
// A link to one of our own pages stays a link; one that would carry an email address or a phone number keeps its words only.
const linked = (html) => html.replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
  const path = href.replace(/^shopify:\/\//, '/').replace(/^https?:\/\/(www\.)?yarnbasket\.in/, '');
  return path.startsWith('/') ? `[${label}](${AT}${path})` : label;
});
const plain = (html) => decode(linked(html || '').replace(/<li[^>]*>/gi, '\n- ').replace(/<\/(p|ul|ol|h\d)>/gi, '\n\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
  .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').replace(/\n+(?=- )/g, '\n').trim();
const oneLine = (html) => plain(html).replace(/\s*\n+\s*/g, ' ');
const opening = (s) => (oneLine(s).match(/^(?:.*?[.!?](?=\s|$)){1,2}/) || [oneLine(s)])[0];
const rupees = (amount) => `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const range = (prices) => { const lo = Math.min(...prices); const hi = Math.max(...prices); return lo === hi ? rupees(lo) : `${rupees(lo)} to ${rupees(hi)}`; };
const fill = (text, values) => text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => values[k]);

// ---------- The store ----------

const data = storeQuery(`{
  shop { taxesIncluded }
  products(first: 250, query: "status:active") { nodes {
    handle title tags productType descriptionHtml
    size: metafield(namespace: "custom", key: "size") { value }
    materials: metafield(namespace: "custom", key: "materials") { value }
    variants(first: 50) { nodes { title price availableForSale } }
  } }
  collections(first: 100) { nodes {
    handle title description
    good: metafield(namespace: "custom", key: "good_to_know") { value }
    products(first: 250) { nodes { handle } }
  } }
  menus(first: 30) { nodes { handle title items { title url items { title url } } } }
}`);

const products = data.products.nodes
  .filter((p) => !p.tags.some((t) => HIDDEN_TAGS.includes(t)))
  .map((p) => ({ ...p, variants: p.variants.nodes, prices: p.variants.nodes.map((v) => +v.price) }))
  .sort((a, b) => a.title.localeCompare(b.title));
const byHandle = new Map(products.map((p) => [p.handle, p]));
if (!products.length) throw new Error('The store returned no products for sale.');

// A collection counts when it has pieces for sale (the theme hides empty ones and Shopify's starter from search).
const collections = new Map(data.collections.nodes
  .map((c) => ({ ...c, pieces: c.products.nodes.map((n) => byHandle.get(n.handle)).filter(Boolean) }))
  .filter((c) => c.pieces.length && c.handle !== 'frontpage')
  .map((c) => [c.handle, c]));

const menu = (handle) => data.menus.nodes.find((m) => m.handle === handle);
const collectionsIn = (items) => [...new Set((items || []).map((i) => (i.url.match(/\/collections\/([^/?#]+)/) || [])[1]))].map((h) => collections.get(h)).filter(Boolean);
// The same groups as the All collections page: the header's Shop list, then the three "Shop by" menus, then the rest.
const shopList = menu('main-menu')?.items.find((i) => i.items.length);
const crafts = collectionsIn(shopList?.items).filter((c) => `/collections/${c.handle}` !== shopList.url);
const groups = [
  ['By craft', crafts],
  ...['flowers', 'occasions', 'prices'].map((h) => [menu(h)?.title, collectionsIn(menu(h)?.items)]),
].filter(([title, list]) => title && list.length);
const grouped = new Set(groups.flatMap(([, list]) => list.map((c) => c.handle)));
const rest = [...collections.values()].filter((c) => !grouped.has(c.handle));
if (rest.length) groups.push(['More', rest]);

// ---------- The theme and the policy ----------

const settings = readJson('theme/config/settings_data.json').current;
const defaults = Object.fromEntries(readJson('theme/config/settings_schema.json').flatMap((g) => g.settings || []).filter((s) => s.id).map((s) => [s.id, s.default]));
const setting = (id) => settings[id] ?? defaults[id];
const locale = readJson('theme/locales/en.default.json');

const storySchema = JSON.parse(read('theme/sections/our-story.liquid').match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema/)[1]);
const story = { ...Object.fromEntries(storySchema.settings.filter((s) => s.id).map((s) => [s.id, s.default])), ...readJson('theme/templates/page.our-story.json').sections.main.settings };

const refund = read('docs/legal/refund-policy.html');
const refundIntro = oneLine(refund.match(/<p>([\s\S]*?)<\/p>/)[1]).replace(/\s*This page explains how\.$/, '');
const refundShort = plain(refund.match(/<ul>[\s\S]*?<\/ul>/)[0]).replace(/^- ([^:\n]+:)/gm, '- **$1**');

const custom = readJson('theme/templates/page.custom-orders.json').sections;
const blocksOf = (section, type) => section.block_order.map((id) => section.blocks[id]).filter((b) => b.type === type).map((b) => b.settings);

// The yarn, as most product pages state it.
const yarn = (() => {
  const count = new Map();
  for (const p of products) { const line = (p.materials?.value || '').split('\n')[0].trim(); if (line) count.set(line, (count.get(line) || 0) + 1); }
  return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
})();

// ---------- Sections ----------

const maker = story.fact_maker.split(' ')[0];
const summary = `${story.fact_makes}, made by hand by ${maker} in ${story.fact_place}. Sold online and delivered across India.`;

const about = [
  '## Who is Yarn Basket?',
  oneLine(story.text),
  [
    `- ${locale.story.fact_maker}: ${story.fact_maker}`,
    `- ${locale.story.fact_place}: ${story.fact_place}`,
    `- ${locale.story.fact_since}: ${story.fact_since}`,
    `- ${locale.story.fact_makes}: ${story.fact_makes}`,
    `- ${locale.story.fact_how}: ${story.fact_how}`,
    yarn ? `- Yarn: ${yarn}` : '',
  ].filter(Boolean).join('\n'),
  `Read more: [Our story](${AT}/pages/our-story)`,
].join('\n\n');

const makes = [
  '## What does Yarn Basket sell, and what does it cost?',
  `${products.length} handmade pieces, from ${range(products.flatMap((p) => p.prices))}. Prices are in Indian rupees.${data.shop.taxesIncluded ? ` ${locale.cart.taxes_in}` : ''}`.trim(),
  crafts.map((c) => `- [${c.title}](${AT}/collections/${c.handle}): ${c.pieces.length} ${c.pieces.length === 1 ? 'piece' : 'pieces'}, ${range(c.pieces.flatMap((p) => p.prices))}`).join('\n'),
].join('\n\n');

const faq = readJson('theme/templates/page.faq.json').sections.main;
const faqBlocks = faq.block_order.map((id) => faq.blocks[id]);
const where = oneLine(faqBlocks.find((b) => /where do you deliver/i.test(b.settings.question || ''))?.settings.answer || '');
const shipAt = +setting('free_shipping_threshold') || 0;
const fee = +setting('shipping_fee') || 0;
const cost = shipAt ? `${fill(locale.offers.faq_ship, { amount: rupees(shipAt) })}${fee ? ` ${fill(locale.offers.faq_fee, { amount: rupees(fee) })}` : ''}` : '';
const delivery = [
  '## How long does delivery take, and what does it cost?',
  [
    `- Orders are sent within ${setting('dispatch_days_min')} to ${setting('dispatch_days_max')} working days.`,
    `- After that, most parcels arrive in ${setting('transit_days_min')} to ${setting('transit_days_max')} days, by courier with tracking.`,
    where ? `- ${where}` : '',
    cost ? `- ${cost}` : '',
  ].filter(Boolean).join('\n'),
  `Full details: [Shipping policy](${AT}/policies/shipping-policy)`,
].join('\n\n');

const returns = [
  '## Can a Yarn Basket order be returned?',
  refundIntro,
  refundShort,
  `Full details: [Refund policy](${AT}/policies/refund-policy)`,
].join('\n\n');

const customOrders = [
  '## Does Yarn Basket take custom and bulk orders?',
  `Yes. ${oneLine(custom.main.settings.text)}`,
  blocksOf(custom.main, 'kind').map((k) => `- **${k.title}:** ${oneLine(k.text)}`).join('\n'),
  'How it works:',
  blocksOf(custom.main, 'step').map((s, i) => `${i + 1}. **${s.title}.** ${oneLine(s.text)}`).join('\n'),
  `Ask here: [Custom and bulk orders](${AT}/pages/custom-orders)`,
].join('\n\n');

const collectionLinks = [
  '## Collections',
  ...groups.map(([title, list]) => `### ${title}\n\n${list.map((c) => `- [${c.title}](${AT}/collections/${c.handle}): ${opening(c.description)}`).join('\n')}`),
].join('\n\n');

const pageLinks = (full) => [
  '## Pages',
  [
    `- [Shop all](${AT}/collections/shop)`,
    `- [All collections](${AT}/collections)`,
    `- [Our story](${AT}/pages/our-story)`,
    `- [Questions, answered](${AT}/pages/faq)`,
    `- [Custom and bulk orders](${AT}/pages/custom-orders)`,
    `- [Contact](${AT}/pages/contact)`,
    `- [Shipping policy](${AT}/policies/shipping-policy)`,
    `- [Refund policy](${AT}/policies/refund-policy)`,
    `- [Terms of service](${AT}/policies/terms-of-service)`,
    `- [Privacy policy](${AT}/policies/privacy-policy)`,
    `- [Sitemap](${AT}/sitemap.xml)`,
    full ? `- [The short version of this file](${AT}/llms.txt)` : `- [Every product, with prices and sizes](${AT}/llms-full.txt)`,
  ].join('\n'),
].join('\n\n');

const agentsLine = `Shopping agents: how to browse and check out with this shop's tools is at ${AT}/agents.md.`;

// One product, as the price check reads it back: the link, then one "Price" line holding every option's price.
const productBlock = (p) => {
  const soldOut = p.variants.every((v) => !v.availableForSale);
  const options = p.variants.length > 1 ? ` (${p.variants.map((v) => `${v.title} ${rupees(v.price)}${!soldOut && !v.availableForSale ? ', sold out' : ''}`).join('; ')})` : '';
  return [
    `### [${p.title}](${AT}/products/${p.handle})`,
    [
      `- Price: ${range(p.prices)}${options}`,
      soldOut ? '- Sold out at the moment.' : '',
      p.size?.value ? `- Size: ${oneLine(p.size.value)}` : '',
      p.materials?.value ? `- Materials: ${oneLine(p.materials.value)}` : '',
    ].filter(Boolean).join('\n'),
    plain(p.descriptionHtml),
  ].join('\n\n');
};
const types = [...new Set(products.map((p) => p.productType || 'Other'))].sort((a, b) => (crafts.findIndex((c) => c.title.includes(a)) + 99) % 99 - (crafts.findIndex((c) => c.title.includes(b)) + 99) % 99 || a.localeCompare(b));
const everyProduct = [
  ...types.map((type) => `## Products: ${type}\n\n${products.filter((p) => (p.productType || 'Other') === type).map(productBlock).join('\n\n')}`),
].join('\n\n');

const faqAnswer = (b) => (b.type === 'offers' ? cost : plain(b.settings.answer));
const questions = [
  '## Questions and answers',
  ...faqBlocks.filter((b) => b.type !== 'offers' || cost).map((b) => (b.type === 'group' ? `### ${b.settings.title}` : `**${b.settings.question}**\n\n${faqAnswer(b)}`)),
  '### Custom orders',
  ...blocksOf(custom.faq, 'question').map((q) => `**${q.question}**\n\n${plain(q.answer)}`),
  ...[...collections.values()].flatMap((c) => {
    const asked = c.good?.value ? JSON.parse(c.good.value).questions || [] : [];
    return asked.length ? [`### About ${c.title}`, ...asked.map(([q, a]) => `**${q}**\n\n${plain(a)}`)] : [];
  }),
].join('\n\n');

// ---------- The two files ----------

const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const dated = (date) => `Prices and stock as of ${date}. The product page is always right.`;
const DATE = /Prices and stock as of [^.]+\./;
const head = (name) => `{%- comment -%}
  Generated by tools/agents-build.mjs from the store, Theme settings and docs/legal: do not edit by hand.
  After a price, product, collection or policy change: npm run build:agents (docs/seo-plan.md, phase 7).
  Only \`agents\` and \`request\` can be read in this template, so every fact below is written in by the script.
{%- endcomment -%}
# ${name}

> ${summary}`;

const build = (parts) => {
  const text = parts.join('\n\n').replace(/\n{3,}/g, '\n\n');
  // Text from the store is never run as Liquid, and the file carries no way to reach a person but the Contact page.
  if (/\{\{|\{%/.test(text.replace(/^\{%- comment -%\}[\s\S]*?\{%- endcomment -%\}/, ''))) throw new Error('Liquid tags found in the text: escape them at their source.');
  const personal = text.match(/[\w.+-]+@[\w-]+\.[\w.]+|(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b|wa\.me/);
  if (personal) throw new Error(`An email address or phone number would be published: "${personal[0]}"`);
  return `${text.replaceAll(AT, '{{ agents.store_url }}')}\n`;
};

const files = new Map([
  ['llms.txt.liquid', build([head('Yarn Basket'), about, makes, delivery, returns, customOrders, collectionLinks, pageLinks(false), dated(today), agentsLine])],
  ['llms-full.txt.liquid', build([head('Yarn Basket: every product and answer'), about, makes, delivery, returns, customOrders, collectionLinks, everyProduct, questions, pageLinks(true), dated(today), agentsLine])],
]);

// ---------- Write, or compare ----------

const onDisk = (f) => (existsSync(join(OUT, f)) ? readFileSync(join(OUT, f), 'utf8') : '');
const undated = (s) => s.replace(DATE, '');
const stale = [...files].filter(([f, text]) => undated(onDisk(f)) !== undated(text));
if (CHECK) {
  if (stale.length) {
    for (const [f, text] of stale) {
      const was = onDisk(f).split('\n');
      const now = text.split('\n');
      const at = now.findIndex((line, i) => undated(line) !== undated(was[i] ?? ''));
      console.error(`FAIL  ${f} is out of date, from line ${at + 1}:\n      on disk: ${(was[at] ?? '(nothing)').slice(0, 160)}\n      now:     ${(now[at] ?? '(nothing)').slice(0, 160)}`);
    }
    console.error('      run: npm run build:agents');
    process.exit(1);
  }
  console.log(`PASS  ${files.size} AI files match the store (${products.length} products, ${collections.size} collections)`);
} else {
  mkdirSync(OUT, { recursive: true });
  // The date only moves when something else did.
  for (const [f, text] of stale) writeFileSync(join(OUT, f), text);
  console.log(stale.length ? `Wrote ${stale.map(([f, text]) => `${f} (${(Buffer.byteLength(text) / 1024).toFixed(1)} KB)`).join(', ')}: ${products.length} products, ${collections.size} collections` : `Nothing changed: ${files.size} files already match the store`);
}
