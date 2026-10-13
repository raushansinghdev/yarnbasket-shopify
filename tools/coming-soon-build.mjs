// Writes the policy, Contact and Our story pages of the holding site (coming-soon/, served at yarnbasket.in) and the
// product preview on its home page. The store itself is behind a password until launch, so this is what a payment
// gateway's reviewer can read. Addresses match the ones Shopify will serve later (/policies/refund-policy, ...).
//
// Sources, so every rule is written once:
//   docs/legal/*.html                    Refund, Shipping, Terms, Contact information
//   the store (read-only Admin API)      Privacy policy, the Bestsellers' names, prices and photos
//   theme/templates/page.our-story.json  Our story's words
//   theme/config/settings_data.json      WhatsApp number and email
//
// usage: node tools/coming-soon-build.mjs           build (also downloads the photos)
//        node tools/coming-soon-build.mjs --check   fail if a fresh build would differ from the files on disk
//                                                   (a price, a name or a policy changed since the last build)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'coming-soon');
const SITE = 'https://yarnbasket.in';
const STORE = 'yarn-basket-e4peuhjj.myshopify.com';
const PREVIEW_COUNT = 8;
const HIDDEN_TAGS = ['test-product', 'free-gift'];
const CHECK = process.argv.includes('--check');

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function storeQuery(query) {
  const args = ['store', 'execute', '--store', STORE, '--json', '-q', query];
  const run = (cmd, pre) => execFileSync(cmd, [...pre, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
  let out;
  try { out = run('shopify', []); } catch { out = run('npx', ['--yes', '@shopify/cli@latest']); }
  // The CLI prints one-line progress records before the result.
  return JSON.parse(out.split('\n').filter((l) => !l.startsWith('{"type":"progress"')).join('\n'));
}

const product = 'handle title tags status featuredImage { url altText } priceRangeV2 { minVariantPrice { amount } maxVariantPrice { amount } }';
const story = JSON.parse(read('theme/templates/page.our-story.json')).sections;
const chapters = story.main.block_order.map((id) => story.main.blocks[id].settings);
const storyHandles = chapters.map((c) => c.product).filter(Boolean);

const data = storeQuery(`{
  shop { shopPolicies { type body } }
  collectionByHandle(handle: "bestsellers") { products(first: 30) { nodes { ${product} } } }
  ${storyHandles.map((h, i) => `s${i}: products(first: 1, query: "handle:${h}") { nodes { ${product} } }`).join('\n')}
}`);

const settings = JSON.parse(read('theme/config/settings_data.json')).current;
const whatsapp = settings.social_whatsapp.replace(/[^\d]/g, '');
const email = settings.social_email;
// Pinterest's claim tag (Theme settings → Social): the holding site carries it too, so the domain can be claimed before launch.
const pinterest = settings.pinterest_verify ? `\n<meta name="p:domain_verify" content="${String(settings.pinterest_verify).trim().replace(/[^\w-]/g, '')}">` : '';

// ---------- Shared shell ----------

const FOOT_LINKS = [
  ['/policies/shipping-policy', 'Shipping'],
  ['/policies/refund-policy', 'Refunds'],
  ['/policies/terms-of-service', 'Terms'],
  ['/policies/privacy-policy', 'Privacy'],
  ['/policies/contact-information', 'Contact information'],
  ['/pages/contact', 'Contact us'],
  ['/pages/our-story', 'Our story'],
];
const footer = (attrs = '') => `<footer class="site-foot"${attrs}>
    <ul>
${FOOT_LINKS.map(([href, label]) => `      <li><a href="${href}">${label}</a></li>`).join('\n')}
    </ul>
    <p>© 2026 Yarn Basket · Handmade in India</p>
  </footer>`;

const shell = ({ path, title, description, body }) => `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} · Yarn Basket</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${path}">
<meta name="theme-color" content="#F5EFE6">
<meta name="color-scheme" content="light">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Yarn Basket">
<meta property="og:title" content="${esc(title)} · Yarn Basket">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}/og-image.png">${pinterest}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Jost:wght@400;500&display=swap">
<link rel="stylesheet" href="/site.css">
</head>
<body class="page">
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-head">
    <div class="site-head__in">
      <a class="site-head__home" href="/"><img src="/favicon.svg" alt="" width="40" height="40"><span>Yarn Basket</span></a>
    </div>
  </header>
  <main class="main" id="main">
${body}
  </main>
  ${footer()}
</body>
</html>
`;

// ---------- Policies ----------

const POLICIES = [
  { slug: 'refund-policy', title: 'Refund policy', file: 'docs/legal/refund-policy.html', description: 'Returns, replacements, cancellations and refunds at Yarn Basket: what we put right, and how.' },
  { slug: 'shipping-policy', title: 'Shipping policy', file: 'docs/legal/shipping-policy.html', description: 'When Yarn Basket orders are sent, how long delivery takes across India, and what it costs.' },
  { slug: 'terms-of-service', title: 'Terms of service', file: 'docs/legal/terms-of-service.html', description: 'The terms for buying handmade crochet pieces from Yarn Basket.' },
  { slug: 'contact-information', title: 'Contact information', file: 'docs/legal/contact-information.html', description: 'Yarn Basket\'s legal name, address, email, phone, GSTIN and grievance officer.' },
  { slug: 'privacy-policy', title: 'Privacy policy', store: 'PRIVACY_POLICY', description: 'How Yarn Basket collects, uses and shares personal information.' },
];

// Pages the store has and this site doesn't: their links become plain words.
const NOT_HERE = ['/pages/track-order', '/pages/faq'];
const unlink = (html) => NOT_HERE.reduce((h, href) => h.replace(new RegExp(`<a href="${href}"[^>]*>(.*?)</a>`, 'g'), '$1'), html);

const files = new Map(); // path inside coming-soon/ → contents

for (const p of POLICIES) {
  const text = p.file ? read(p.file) : data.shop.shopPolicies.find((s) => s.type === p.store)?.body;
  if (!text) throw new Error(`No text for ${p.title}`);
  files.set(`policies/${p.slug}.html`, shell({
    path: `/policies/${p.slug}`,
    title: p.title,
    description: p.description,
    body: `    <h1 class="title">${p.title}</h1>
    <div class="prose">
${unlink(text.trim())}
    </div>
    <p class="more">Still have a question? <a href="/pages/contact">Contact us</a></p>`,
  }));
}

// ---------- Contact ----------

files.set('pages/contact.html', shell({
  path: '/pages/contact',
  title: 'Contact us',
  description: 'Message Yarn Basket on WhatsApp or by email. We reply within 48 hours, Monday to Saturday.',
  body: `    <h1 class="title">Contact us</h1>
    <p class="lead">Questions about an order, a custom piece or a gift? Priya answers every message herself, Monday to Saturday, 10am to 6pm.</p>
    <ul class="ways">
      <li>
        <h2>WhatsApp</h2>
        <p>The quickest way, and the best one for photos and videos.</p>
        <p><a class="btn" href="https://wa.me/${whatsapp}">Message on WhatsApp</a></p>
      </li>
      <li>
        <h2>Email</h2>
        <p><a href="mailto:${email}">${email}</a></p>
        <p>We reply within 48 hours.</p>
      </li>
      <li>
        <h2>Address</h2>
        <p>Yarn Basket<br>Floor 1, House No. 181, Piro Jagdishpur Road,<br>Ward No. 05, Shastri Nagar, Piro,<br>District Bhojpur, Bihar 802207, India</p>
      </li>
    </ul>
    <p class="more">Legal name, phone number, GSTIN and grievance officer: <a href="/policies/contact-information">Contact information</a></p>`,
}));

// ---------- Photos and prices ----------

const photos = new Map(); // file name → source URL
const photo = (p) => {
  const name = `products/${p.handle}.webp`;
  photos.set(name, `${p.featuredImage.url}${p.featuredImage.url.includes('?') ? '&' : '?'}width=600`);
  return `<img src="/${name}" alt="${esc(p.featuredImage.altText || p.title)}" width="600" height="600" loading="lazy" decoding="async">`;
};
const rupees = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Bad price: ${amount}`);
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};
const price = (p) => {
  const { minVariantPrice: min, maxVariantPrice: max } = p.priceRangeV2;
  return Number(min.amount) === Number(max.amount) ? rupees(min.amount) : `From ${rupees(min.amount)}`;
};

// ---------- Our story ----------

const storyProducts = Object.fromEntries(storyHandles.map((h, i) => [h, data[`s${i}`].nodes[0]]));
let withPhoto = 0;
const chapterHtml = chapters.map((c) => {
  const p = storyProducts[c.product];
  const img = p?.featuredImage ? photo(p) : '';
  const cls = img ? (withPhoto++ % 2 ? ' chapter--flip' : '') : ' chapter--words';
  return `      <section class="chapter${cls}">
        ${img}
        <div>
          <p class="eyebrow-s">${esc(c.eyebrow)}</p>
          <h2>${esc(c.heading)}</h2>
          ${c.text}
        </div>
      </section>`;
}).join('\n');
const promise = story.promise.block_order.map((id) => story.promise.blocks[id].settings);

files.set('pages/our-story.html', shell({
  path: '/pages/our-story',
  title: 'Our story',
  description: 'Yarn Basket is a small crochet studio in Piro, Bihar. Every bouquet, keychain and hair piece is made by hand by Priya.',
  body: `    <p class="eyebrow-s">${esc(story.main.settings.eyebrow)}</p>
    <h1 class="title">${esc(story.main.settings.heading)}</h1>
    <p class="lead">${esc(story.main.settings.text)}</p>
    <div class="chapters">
${chapterHtml}
    </div>
    <ul class="promise">
${promise.map((i) => `      <li><strong>${esc(i.title)}</strong>${esc(i.text)}</li>`).join('\n')}
    </ul>
    <div class="close">
      <h2>${esc(story.main.settings.close_heading)}</h2>
      <p>${esc(story.main.settings.close_text)}</p>
      <div class="btns">
        <a class="btn" href="/#preview">See our pieces</a>
        <a class="btn btn--quiet" href="/pages/contact">${esc(story.main.settings.ask_label)}</a>
      </div>
    </div>`,
}));

// ---------- Home page: preview and footer, written between markers ----------

const shown = data.collectionByHandle.products.nodes
  .filter((p) => p.status === 'ACTIVE' && p.featuredImage && !p.tags.some((t) => HIDDEN_TAGS.includes(t)))
  .slice(0, PREVIEW_COUNT);
if (shown.length < PREVIEW_COUNT) throw new Error(`Bestsellers has ${shown.length} pieces to show; the preview needs ${PREVIEW_COUNT}`);

const preview = `<section class="preview reveal" style="--d:3.4s" id="preview" aria-labelledby="preview-title">
    <div class="preview__head">
      <h2 id="preview-title">A look at what’s coming</h2>
      <p>A few of the pieces Priya makes by hand, at the prices in our new shop.</p>
    </div>
    <ul class="preview__grid">
${shown.map((p) => `      <li>
        ${photo(p)}
        <h3 class="preview__name">${esc(p.title)}</h3>
        <p class="preview__price">${price(p)}</p>
      </li>`).join('\n')}
    </ul>
    <p class="preview__note">Prices are in Indian rupees and include GST. The new shop opens soon; ordering there isn’t open yet.</p>
  </section>`;

const between = (html, name, inner) => {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(html)) throw new Error(`coming-soon/index.html has no "${name}" markers`);
  return html.replace(re, (_, a, b) => `${a}\n  ${inner}\n  ${b}`);
};
let home = readFileSync(join(OUT, 'index.html'), 'utf8');
home = between(home, 'preview', preview);
home = between(home, 'footer', footer(' data-reveal style="--d:3.5s"'));
files.set('index.html', home);

// ---------- Sitemap ----------

const pagePaths = ['/', ...[...files.keys()].filter((f) => f !== 'index.html').map((f) => `/${f.replace(/\.html$/, '')}`)];
files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagePaths.map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n  </url>`).join('\n')}
</urlset>
`);

// ---------- Every internal link must lead to something this site serves ----------

const served = new Set([...pagePaths, ...[...photos.keys()].map((n) => `/${n}`)]);
const broken = [];
for (const [file, html] of files) {
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const path = href.split('#')[0];
    if (!served.has(path) && !existsSync(join(OUT, path))) broken.push(`${file}: ${href}`);
  }
}
if (broken.length) throw new Error(`Links to pages this site doesn't have:\n  ${broken.join('\n  ')}`);

// ---------- Write, or compare ----------

if (CHECK) {
  const stale = [...files].filter(([f, html]) => !existsSync(join(OUT, f)) || readFileSync(join(OUT, f), 'utf8') !== html).map(([f]) => f);
  const missing = [...photos.keys()].filter((n) => !existsSync(join(OUT, n)));
  if (stale.length || missing.length) {
    console.error(`FAIL  the holding site is out of date: ${[...stale, ...missing].join(', ')}\n      run: npm run build:coming-soon`);
    process.exit(1);
  }
  console.log(`PASS  ${files.size} files match the store and docs/legal (${shown.map((p) => `${p.title} ${price(p)}`).join('; ')})`);
} else {
  for (const [f, html] of files) {
    mkdirSync(dirname(join(OUT, f)), { recursive: true });
    writeFileSync(join(OUT, f), html);
  }
  mkdirSync(join(OUT, 'products'), { recursive: true });
  for (const [name, url] of photos) {
    // Shopify's image server answers in WebP when asked for it.
    const res = await fetch(url, { headers: { Accept: 'image/webp' } });
    if (!res.ok || res.headers.get('content-type') !== 'image/webp') throw new Error(`Photo ${name}: ${res.status} ${res.headers.get('content-type')}`);
    writeFileSync(join(OUT, name), Buffer.from(await res.arrayBuffer()));
  }
  console.log(`Wrote ${files.size} files and ${photos.size} photos to coming-soon/`);
}
