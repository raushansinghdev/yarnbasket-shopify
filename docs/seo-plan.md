# Yarn Basket: the SEO plan, from scratch

**Status:** approved by Raushan 2026-10-12. Phase 0 built that day; **phases 1 to 4 built 2026-10-13** (see "As built" at the end). **Phase 7 (AI files) built 2026-10-13.** `npm run check:seo` is at 30 of 31; the one red line is the made-up ratings. Raushan confirmed the phase 3 claims on 2026-10-13; sizes come later (`docs/size-sheet.md`). The new pages' piece lists stay as built on Raushan's word (review page for reference: https://claude.ai/artifact/9nMdJrJwefL5XVRpLpwkbf). Next: phase 10 (speed) on Raushan's go; it needs the storefront password and his OK to upload to the unpublished theme. Left for later by Raushan (2026-10-13): deleting the made-up ratings, Search Console and Bing, Keyword Planner volumes.

## Context

SEO was a top priority from day one: it is why we chose Liquid over Hydrogen. Each page was built with basic SEO pieces, but nobody has yet designed the site's SEO as a whole. Raushan asked for that now: think from scratch, leave no gaps, phase it if needed.

This plan replaces the short `docs/seo-plan.md` written earlier today. On approval, step one is saving this plan there (and the decisions in `docs/decisions.md`), as we always do.

### What the research found (2026-10-12)

Crawl of all 99 pages on the dev server, lab speed read, Google's and Shopify's current documentation, and a look at who ranks for our queries.

**Already right:** one h1 on every page; alt text and sizes on every image; canonical on every page; filtered/sorted/personal pages `noindex`; hand-written titles and descriptions on all 50 products and 18 of 20 collections; valid Product data on every product page; zero layout shift; very little main-thread blocking.

**Wrong or missing, in order of how much it costs us:**

| # | Finding | Why it matters |
|---|---|---|
| 1 | **Every collection page has zero words of text.** | Collections are our best pages for queries like "crochet flower bouquet". With no text, Google has only a grid of names to judge. |
| 2 | **Product descriptions are 20 to 57 words (median 36).** Some products have one photo. | Thin pages rank poorly and give AI engines nothing to quote. |
| 3 | **Product delivery data is incomplete.** Google now requires a delivery time inside `shippingDetails`; ours has only the fee. | The block is invalid as it stands, so Google ignores it. |
| 4 | **Product pages link to no other product in the HTML** (rows load by script on scroll). Flower collections (Roses, Sunflowers, Tulips, Daisies) are linked from one page only. | Link equity does not flow; crawlers find pages late. |
| 5 | **Home page: no description, no share image, title "Yarn Basket".** No share image on any page except products and collections. | Brand result in Google and every WhatsApp/Instagram share looks bare. |
| 6 | **No presence in Google Shopping.** Not started. | For "buy X" queries the Shopping row sits above every normal result, and listing there is free. |
| 7 | **`/llms.txt` exists but says nothing about us.** Shopify now writes it automatically as generic instructions for shopping agents. Since 28 May 2026 a theme can replace it (`templates/agents.md.liquid`). | AI engines get no facts about what we make, prices, delivery or returns. |
| 8 | **Blog templates are Shopify's unstyled starters; no Article data; no posts.** | Step 7 of the build plan (cornerstone content) has nowhere to live. |
| 9 | **25 real products carry made-up ratings** that flow into Google's data. | A policy violation the day the password comes off. |
| 10 | Smaller: `/cart`, the empty blog and Shopify's starter "Home page" collection are indexable; title separators are mixed ("–" and "\|"); two descriptions are over 160 characters; no Organization logo is set; collections have no structured data. | Hygiene. |
| 11 | **Speed:** every page loads all sections' styles (235 KB) before first paint; phones fetch next pages ahead while this page's photos are still loading (1.2 MB on a collection). Real numbers unknown: the dev server can't judge the 2.0 s gate. | Speed is a ranking input and our stated hard gate. |

**Rule changes since the build plan was written:**
- Google stopped showing FAQ rich results on 7 May 2026. FAQ data still helps Google understand a page, so ours stays, but no more effort goes there.
- Google recommends `OnlineStore` (not plain Organization) for shops, with the return policy and shipping declared once on it.
- Google supports `ProductGroup` for products with options (our sizes, colours and counts).

### The strategy: where a new, small shop can actually win

Searching "buy crochet flower bouquet online India" returns Meesho, Amazon, IndiaMART, eBay and a few small makers. We will not outrank those marketplaces for the broad words in year one. So the plan does not chase them. It aims at five places where a small, real maker has the advantage:

1. **Specific queries.** "Crochet sunflower bouquet", "crochet tulip keychain", "crochet gift for teacher under 300". Marketplaces answer these with messy listing pages; we can answer each with one clean, fast, well-described page.
2. **Google Shopping's free listings.** A product with a clean photo, price, stock and delivery can appear in the Shopping row from week one, without ranking.
3. **Pictures.** Crochet is bought with the eyes. Google Images, Google Lens and Pinterest send buyers; our photos, alt text and data must be the best in the niche.
4. **Being a real maker.** Priya, Piro, handmade, GST-registered, real policies. Google's quality guidelines and AI engines both reward a verifiable source. Marketplaces cannot copy this.
5. **AI answers.** ChatGPT, Perplexity and Google's AI overview quote pages with clear, factual, well-structured text. Almost no crochet seller in India has this.

---

## Phase 0. Foundations: map, baseline, permanent check

**0.1 Keyword-to-page map** (`docs/seo-keyword-map.md`). One row per page we want to rank: the main query, 3 to 5 secondary queries, the intent (buy / compare / learn), and the one URL that owns it. No two pages own the same query. Sources: Google autocomplete and "People also ask" for each seed, the pages that rank today, Meesho's own search suggestions, and Google Ads Keyword Planner for volumes (free; Raushan opens the account, 10 minutes). The map drives every title, heading, paragraph and link in later phases.

Seeds, already known from the catalogue: 6 crafts (bouquets, keychains, flower pots, hair accessories, bag charms, home decor) × 4 flowers and 6 motifs (sunflower, rose, tulip, daisy; bee, evil eye, octopus, peacock, lily, chick) × occasions × price bands.

**0.2 Search Console and Bing, now, on the holding site.** Verify `yarnbasket.in` as a Domain property in Google Search Console (one DNS TXT record at Spaceship) and in Bing Webmaster Tools. The domain is already live with eight pages and a sitemap, so history starts today and the verification survives the move to Shopify. Bing matters twice: ChatGPT's search draws on it.

**0.3 Permanent check, section 26**: `tools/seo-check.mjs`, run with `npm run check:seo` (add `-- --list` to name every failing page) or `npm run check -- --only 26`. Today's one-off crawl becomes a gate. It fails when any indexable page has: no title or one over 62 characters; no description or one outside 70 to 160; not exactly one h1; no share image; structured data that does not parse or lacks a required field; a duplicate title or description; fewer than two pages linking to it; an image without alt; or when a page that must be `noindex` is not. It also checks every structured-data price against the page's shown price (a wrong price is zero-tolerance here too). Built first, so every later phase is proven by it.

**0.4 Baseline, 2026-10-12** (`npm run check:seo`, 102 pages read: 79 open to search engines, 50 of them products and 20 collections). **9 of 27 lines pass.**

| Line | Baseline | Fixed in |
|---|---|---|
| Every link opens a page | pass | |
| Nothing for sale is an orphan | 5 fail: Daisies, Roses, Sunflowers, Tulips, the starter "Home page" collection | Phase 4 |
| Nothing not for sale is linked | pass | |
| Every page has two ways in | 5 fail (the same five) | Phase 4 |
| Personal and not-for-sale pages are noindex | 2 fail: `/cart`, the free gift's page | Phase 1 |
| No empty page is open to search engines | 1 fail: the starter collection | Phase 1 |
| Title length | 5 fail: home (11 characters), Shop, Contact, the starter collection, Sunflowers (69) | Phase 1 |
| Title format | 9 fail: home, Shop, Contact, five policies, the starter collection | Phase 1 |
| Description | 10 fail: home, Shop, five policies, two products at 181 characters, the starter collection | Phase 1 |
| No shared titles / descriptions | pass, pass | |
| Canonical is the page itself | pass | |
| Share image | 11 fail: every page that is not a product or a collection with a photo | Phase 1 |
| One h1 | pass | |
| Alt text | pass | |
| Product description, 80 words | 50 of 50 fail (20 to 57 words) | Phase 3 |
| Collection intro, 40 words | 20 of 20 fail (0 words) | Phase 3 |
| Product page links to 3 products and 2 collections | 50 of 50 fail (0 products, 1 collection) | Phase 4 |
| Collection links to other collections | 14 of 20 fail | Phase 4 |
| Structured data parses | pass | |
| Every page names the shop | 79 of 79 fail | Phase 2 |
| Product: price, stock, delivery fee and time | 50 of 50 fail (no delivery time) | Phase 2 |
| Product: named, pictured, breadcrumb | pass | |
| No rating without real reviews | 25 fail | delete the made-up ratings |
| Collection: list of pieces and breadcrumb | 20 of 20 fail | Phase 2 |
| Return policy on the shop | fail | Phase 2 |
| llms.txt says who we are | fail | Phase 7 |

Prices in the structured data are not in this check: `npm run check:money` already compares them with the store, variant by variant.

## Phase 1. Technical hygiene

All in `theme/snippets/meta-tags.liquid` unless noted.

- **Titles:** one format everywhere, `Page name | Yarn Basket`; page 2 and beyond of a collection adds "Page 2".
- **Home:** title and description set in Online Store → Preferences (proposed: "Handmade Crochet Gifts: Bouquets, Keychains & More | Yarn Basket"; description names the crafts, "made by hand in India" and the free-delivery line). The theme carries the same text as a fallback so the home page can never be without one.
- **Share image** for every page without its own: a 1200 × 630 brand image made from the brand kit, set in Theme settings; product and collection pages keep their photo. Add `twitter:image`.
- **`noindex`:** `/cart`, a blog with no posts, any collection with no products. Shopify's starter "Home page" collection is deleted in the admin.
- **Descriptions:** a theme fallback for policies (Shopify gives no field); shorten the two over-long product descriptions; give "Shop" a title and description.
- **Favicon:** add 96 and 192 px PNGs (Google recommends larger than 48; ours is 64 plus SVG).
- **Organization logo:** upload the brand kit logo and select it in Theme settings (Google needs at least 112 px; none is set today).
- **404 page:** keeps a search field and links to the six crafts, so a dead link still leads somewhere.
- **Collection "Load more"** is already a real `?page=2` link, so page 2 is crawlable. Nothing to change; the check locks it in.
- **`/collections`** gets linked from the footer ("All collections") so it and everything under it has a path.

## Phase 2. Structured data, rebuilt as one connected graph

File: `theme/snippets/structured-data.liquid` (rewritten; small helper snippets if it grows). Every node has an `@id` and refers to the others by it, so Google reads one graph, not loose blocks.

- **Every page:** `OnlineStore` (name, URL, logo, description, founder Priya Singh, address Piro/Bihar/IN, customer-service contact, `sameAs` Instagram and Meesho, GSTIN as `taxID`) and `WebSite` (name, search action). Today these appear on the home page only.
- **Return policy, on the store node:** `hasMerchantReturnPolicy` given as a **link to our Refund policy** (`merchantReturnLink`). Google accepts a link in place of categories. Our rule (replacement or refund if damaged, wrong or missing, reported in 48 hours; no change-of-mind returns) fits none of Google's three categories, and the nearest one would print "No returns" beside our products. A link is exact and honest.
- **Product pages:**
  - Products with options become a `ProductGroup` (`variesBy` size or colour, `productGroupID` = handle) with one `Product` per option, each with its own name, photo, SKU, price and stock. Single-option products stay a plain `Product`.
  - `shippingDetails` gains the required `deliveryTime`: handling 1 to 2 days, transit 3 to 7 days, both read from two new Theme settings so the Shipping policy, the FAQ and the data can never disagree (check 25 already compares policy and settings; it gains this pair).
  - Adds `material` (cotton/acrylic yarn, from the Materials field), `color` where the option is a colour, `category`, and the craft collection as breadcrumb (already there).
  - The description keeps the space between paragraphs.
  - `aggregateRating` and `review` only from the reviews app's real data (Phase 9).
- **Collection pages:** `CollectionPage` with an `ItemList` of the pieces on that page (name, URL, photo, price) and a breadcrumb. Not on filtered or sorted views.
- **Blog:** `Article` with headline, photo, dates, author (Priya, linked to the Our story page) and publisher (the store node); `Blog` on the list page.
- **Our story:** `AboutPage` plus a `Person` for Priya. **Contact:** `ContactPage`. **FAQ:** stays. **Made by hand video:** `VideoObject` once the real clip replaces the demo.
- **Visible breadcrumbs** on product and collection pages (small, one line: Home › Bouquets › Sunflower Crochet Bouquet), matching the data. On the product page this is the existing collection label line, extended; mockup first, as usual for a UI change.

## Phase 3. Words on the page

The biggest lever, and all of it is drafting I can do from the catalogue and photos, for Raushan and Priya to correct.

**3.1 Collections (20 pages, from zero words).** Each gets:
- an **intro of 40 to 60 words** under the heading (already designed: beside the title on desktop, after the products on phones), written to the keyword map;
- a **"Good to know" block after the products**: 120 to 180 words in two or three short paragraphs (what is in the collection, how the pieces are made, sizes and price range, who they suit), then **3 or 4 questions with answers** specific to that collection ("How long does a crochet bouquet last?", "Can I choose the wrap colour?"). Closed `<details>`, the same component the FAQ uses, so the page stays calm.
- Stored on the collection: description for the intro, two metafields for the long text and the questions. Uploaded by a new `collections` step in `tools/catalog-upload.py`, from a new `tools/catalog/collections.json`, so the text lives in the repo.

**3.2 Products (50 pages, from a median of 36 words).** One template, so every page answers the same questions in the same order:
- description of **80 to 120 words**: what it is, what makes this piece itself, who it suits and when to give it;
- **Size & what's included** (field exists; filled for every product, not only bouquets);
- **Materials** and **Care** (fields exist; theme-wide default text plus per-product differences);
- **Delivery** (already automatic).
- Written into `tools/catalog/catalog.json`, sent with the existing `catalog-upload.py`. No two descriptions share a sentence.
- Products with one photo are listed for new photos (content phase; noted in the launch checklist).

**3.3 Home page.** The h1 stays. The "Shop by craft" and occasion sections gain one plain sentence each that names what we make in the words people search. No visual change beyond a line of text; mockup first.

**3.4 Our story and FAQ** are already written. Our story gains the facts AI engines look for in one short "At a glance" list: who, where, since when, what is made, how to order, how to reach us.

## Phase 4. Pages we do not have yet, and links between all of them

**4.1 New landing pages, each owning a query from the map** (automated collections by tag, so they fill themselves):
- **By recipient and occasion, India's calendar:** Rakhi gifts, Diwali gifts, Valentine's Day, Mother's Day, Teacher's Day, Friendship Day, wedding and return gifts (bulk favours), bridesmaid gifts, gifts for kids. Each is created only when at least 6 pieces fit; the seasonal ones go live 6 weeks before the day and stay up all year (the URL keeps its history).
- **Price bands that match searches:** under ₹199, under ₹499, under ₹999 (beside the existing under ₹299).
- **By motif:** evil eye, bee, octopus (the tags exist already).
- **One hub: "Crochet flowers"**, linking the four flower collections and the bouquets.
- **Custom orders** page: "custom crochet bouquet", "bulk crochet return gifts". A high-intent query we already serve on WhatsApp but have no page for.

**4.2 Link system**, so every page is at most three taps from home and nothing is an orphan:
- **Product → products:** "You may also like" is written into the HTML (4 pieces from the same craft); the script only swaps in Shopify's smarter picks. Same row for shoppers; real links for crawlers.
- **Product → collections:** the breadcrumb, plus one "More like this" line linking the piece's flower, motif and occasion collections (from its tags).
- **Collection → collections:** a "Shop by flower" and "Shop by occasion" line of links after the Good to know block.
- **Blog → shop:** every post links to at least two collections and three products; **shop → blog:** each collection's Good to know block links its care guide once the guide exists.
- **Footer:** "All collections" and the Crochet flowers hub.
- **Anchor text** is the destination's real name ("Crochet sunflower bouquets"), never "click here".
- Check 26 counts inbound links for every page and fails on fewer than two.

## Phase 5. Pictures: Google Images, Lens, Pinterest

- **Sources at 2048 px or more** for new photos (today's are 1254 px; Google prefers large images and Shopping requires clean ones). File names are already descriptive; alt text already exists.
- **Alt text rule** written down: what the piece is, colour, count, setting; never keyword lists. The check flags duplicates within a product.
- **First photo of every product: the piece alone, no text or sticker**, on a plain background. Required for Shopping and best for Lens.
- **Pinterest:** claim `yarnbasket.in`, turn on rich pins (they read the Product data we already publish), connect the catalogue, one board per craft and per flower. For a handmade craft shop Pinterest is a search engine in its own right, and pins keep sending visits for years.
- **Collection images** set as each collection's share image (already present on 18).

## Phase 6. Google Shopping and Merchant Center (free listings)

- Install Shopify's **Google & YouTube** channel; it creates the Merchant Center account and sends the product feed.
- Feed data filled once from the catalogue, by script: Google product category, "no GTIN / handmade" (`identifier_exists` false, brand Yarn Basket), colour, material, age group and gender where relevant, product type, the size text.
- **Delivery and returns configured in Merchant Center itself.** Google ranks these settings above anything in the page data, and Merchant Center can express our damaged-only rule properly.
- Fix every disapproval in the Merchant Center diagnostics until all 50 products are approved.
- **Microsoft Merchant Center** the same way (it imports the Google feed).
- Needs: the store off its password, GST and business details in place, policies visible. So this is prepared now and switched on at soft launch.

## Phase 7. AI answer engines

- **`theme/templates/agents.md.liquid`** (serves `/agents.md`, and `/llms.txt` by fallback): Shopify's shopping-agent endpoints kept through the `agents` object (so checkout by agents keeps working), followed by our own section: who we are, what we make, price ranges, delivery fee and times, the return rule, how custom orders work, and links to each collection and the main pages. Shopify's template can only read the `agents` object, not products or settings, so our section is **generated** by a small script (`tools/agents-build.mjs`) from the catalogue and Theme settings, with a `--check` mode that fails when it is out of date (the same pattern as `tools/coming-soon-build.mjs`). No email or phone number in it: Shopify warns the file is cached widely.
- **`theme/templates/llms-full.txt.liquid`:** the long version, with every product's name, price, size, materials and URL.
- **Pages written to be quoted:** short factual sentences, a question as the heading and its answer in the first line, real numbers (sizes in inches and cm, days, rupees). Phases 3 and 8 follow this rule.
- **robots.txt:** leave Shopify's default; it already admits AI crawlers. No `robots.txt.liquid` unless Search Console shows crawl waste.
- **Check monthly:** ask ChatGPT, Perplexity and Google five fixed questions ("where to buy a crochet sunflower bouquet in India") and log whether we are cited.

## Phase 8. Content: guides that earn the visit before the purchase

- **Build the blog properly first:** `sections/blog.liquid` and `sections/article.liquid` are Shopify's bare starters. They get our design system: readable measure, photo, date, author line with Priya's photo and a link to Our story, related products inside the post, "Read next". Mockup first. Rename the blog from "News" to "Journal" (handle `journal`).
- **Ten cornerstone posts before launch**, each owning an informational query and feeding a collection:
  1. How to care for crochet flowers (wash, dust, reshape)
  2. Do crochet flowers last? Crochet vs fresh vs artificial
  3. Crochet bouquet size guide: what 1, 3 and 5 stems look like in hand
  4. Gift ideas under ₹299 / ₹499 that are not chocolate
  5. Rakhi gifts for sisters, handmade
  6. Teacher's Day gifts students can afford
  7. What does each flower mean? Sunflower, rose, tulip, daisy
  8. The evil eye charm: meaning and how to gift it
  9. How a crochet bouquet is made, start to finish (Priya's process, real photos)
  10. Return gifts and wedding favours: ordering handmade in bulk
- I draft from facts Priya confirms; she adds what only a maker knows. 800 to 1,200 words, real photos, no filler.
- After launch: two posts a month, chosen from Search Console's queries where we show on page two.

## Phase 9. Trust, reviews and the world outside the site

- **Reviews app** (recommended: Judge.me's free plan; it writes Shopify's standard rating fields, which our stars and data already read). Ask every Meesho and Instagram buyer for a review with a photo. Its script must fit the speed budget; check 3 measures it.
- **Delete the 25 made-up ratings now**, not at launch.
- **Google Business Profile** as a service-area business (no public address shown): brand searches then show a panel with reviews and a link.
- **Same name, same details everywhere:** Instagram bio link to `yarnbasket.in`, the Meesho store, WhatsApp Business profile, Pinterest, Google profile.
- **Links from other sites**, the honest kind: handmade and crochet directories in India, gift-guide bloggers and Instagram creators sent a piece, local Bihar press on a home studio selling nationwide, crochet communities where Priya can share her process. Target: 15 real links in the first three months. No paid links.

## Phase 10. Speed (the build plan's step 6)

- **Measure on Shopify, not the dev server:** push the current code to the unpublished "Yarn Basket" theme, then run the lab read and Lighthouse against its preview link with the storefront password (pasted in chat, never saved).
- **Styles:** move the large page-only blocks (product, cart, collection, account, search) out of the shared file into stylesheets loaded only on their pages. Target: under 60 KB of CSS before first paint on any page.
- **Fetching ahead** (`theme/assets/page-turn.js`) waits until this page has finished loading and the connection is idle.
- **Home HTML** (254 KB): find and trim what is repeated inline.
- **Real-user numbers after launch:** LCP, INP and CLS from real phones sent to GA4 (a 1 KB snippet), and Google's own field data in Search Console once there is traffic.
- Gates unchanged: LCP under 2.0 s, INP under 200 ms, CLS under 0.1 on a mid-range phone.

## Phase 11. Launch and the first 90 days

- **Before the password comes off:** check 26 green on the live theme; Demo content off; test products and demo templates deleted; made-up ratings gone; money check green.
- **Domain move** from GitHub Pages to Shopify: the holding site's eight URLs (`/policies/*`, `/pages/contact`, `/pages/our-story`) already match Shopify's paths, so nothing breaks. `www` redirects to the bare domain. Delete `coming-soon/` and its workflow.
- **Same day:** submit the sitemap in Search Console and Bing; request indexing for home and the six craft collections; switch on Merchant Center; Rich Results Test on one page of each type.
- **Weekly for the first month, then monthly** (`docs/seo-log.md`): pages indexed vs submitted, queries and positions, Merchant Center approvals, structured-data errors, real-user speed, the five AI questions.
- **Targets at 90 days:** all products and collections indexed; all 50 products approved in Shopping; rich results (price, stock, delivery) showing; at least 30 non-brand queries in the top 20; Core Web Vitals "good" for 75% of visits.

---

## Order of work

| Order | Phase | Who | Blocked by |
|---|---|---|---|
| 1 | 0 (map, Search Console, check 26) | Claude; Raushan adds one DNS record and opens Keyword Planner | nothing |
| 2 | 1 and 2 (tags, structured data) | Claude | nothing |
| 3 | 3 (words) | Claude drafts; Raushan and Priya correct | the map |
| 4 | 4 (new pages, links) | Claude | the map |
| 5 | 10 (speed) | Claude | storefront password |
| 6 | 7 (AI files) and 5 (pictures rules, Pinterest) | Claude; Raushan claims Pinterest | phase 3 text |
| 7 | 8 (blog build, ten posts) | Claude drafts; Priya's facts and photos | phase 4 |
| 8 | 6, 9, 11 (Shopping, reviews, launch) | Both | password off, GST, gateway |

Phases 0 to 4, 7 and 10 need nothing from outside and can be finished this month. Each phase ends with its own commit, check 26 green, and a look by Raushan before the next begins.

## Choices I made (say if you disagree with any)

1. Return policy is declared as a link to our policy, not as a Google category.
2. Options become `ProductGroup` data.
3. Long collection text sits **after** the products, never above them (UX before looks).
4. New occasion pages only when 6 or more pieces fit.
5. The blog is called "Journal".
6. Judge.me for reviews.
7. No Hindi pages for now; revisit when Search Console shows Hindi queries.
8. Made-up ratings are deleted at the start of this work.
9. The custom `agents.md` keeps Shopify's agent checkout section untouched and adds ours below it.

## Files

- Theme: `snippets/meta-tags.liquid`, `snippets/structured-data.liquid`, `sections/collection.liquid`, `sections/product.liquid`, `sections/product-recommendations.liquid`, `sections/footer.liquid`, `sections/404.liquid`, `sections/blog.liquid`, `sections/article.liquid`, `assets/page-turn.js`, `config/settings_schema.json` (dispatch and transit days, share image), new `templates/agents.md.liquid` and `templates/llms-full.txt.liquid`, `locales/en.default.json`.
- Tools: `tools/check.mjs` (section 26; section 25 gains the delivery days), `tools/catalog/catalog.json` and new `tools/catalog/collections.json`, `tools/catalog-upload.py` (new `collections` step), new `tools/agents-build.mjs`.
- Docs: `docs/seo-plan.md` (this plan), new `docs/seo-keyword-map.md` and `docs/seo-log.md`, `docs/decisions.md`, `docs/launch-checklist.md`.
- Reused as they are: `snippets/image.liquid`, the FAQ section's `<details>` component, `product-card`, the catalogue upload flow, the `coming-soon-build.mjs` check pattern.
- Other sessions share this tree: I claim each file before editing and commit only my own hunks.

## How it is verified

- `npm run check -- --only 26` after every phase; `--only 20,24,25` when product, collection or policy files change; `npm run check:money` after any change to product data or lists; the full gate at the end.
- Google's Rich Results Test and the Schema.org validator on one URL of each page type (pasted HTML while the password is on, live URL after).
- A before/after table of the baseline numbers in `docs/seo-plan.md`.
- Visual changes (breadcrumb line, Good to know block, blog) shown as a mockup first, then watched in Playwright at 360 and 1280 before I report.
- After launch: Search Console's Merchant listings, Product snippets and Core Web Vitals reports, and Merchant Center diagnostics, logged in `docs/seo-log.md`.

Sources for the rule changes: [Shopify changelog, agents.md / llms.txt templates](https://shopify.dev/changelog/posts/customize-llmstxt-llms-fulltxt-and-agentsmd), [agents.md.liquid](https://shopify.dev/docs/storefronts/themes/architecture/templates/agents-md-liquid), [Google merchant listing data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing), [Google return policy data](https://developers.google.com/search/docs/appearance/structured-data/return-policy), [Google Organization data](https://developers.google.com/search/docs/appearance/structured-data/organization), [Google product variants](https://developers.google.com/search/blog/2024/02/product-variants?hl=en), [FAQ rich results ended](https://www.techwyse.com/news/ai-search/google-faq-rich-results-deprecated-2026).


---

## As built

### Phases 1 and 2 (2026-10-13)

`npm run check:seo`: 9 → 14 after phase 1 → **19 of 27** after phase 2. Money check 10 of 10; check 25 is 11 of 11 with its new line.

**Changed from the plan**
- **No visible breadcrumb line was added.** The product page's label above the name is already the link to its collection and the logo is Home; Google gets Home › collection › piece from the data. A shopper sees no change in these phases except the 404 page.
- **Nothing was set in the admin for the home page, share image or logo.** The theme supplies them while the admin has none (the way the favicon already worked), so they are in git and cannot go missing on a new theme. Anything set in Online Store → Preferences or Theme settings → Brand wins.
- **Home title** is "Handmade Crochet Gifts: Bouquets & Keychains | Yarn Basket" (58 characters; the first wording was 64, over the limit).
- **No GSTIN in the shop's data** yet: it is on the Contact information policy; ask Raushan before publishing it in a second place.
- **"All collections" in the footer** moves to phase 4 with the other links (the footer's lists are menus in the admin).

**Phase 1**
- `snippets/meta-tags.liquid`: one title format ("Page | Yarn Basket", "| Page 2" on later pages); words from the theme for the home page, the five policies, the Shop collection and `/collections` when the admin has none (`seo.*` in the locale file); a share image on every page (`assets/share-1200x630.png` when a page has no photo), with `twitter:image`; `noindex, follow` on `/cart`, the free gift's page, a blog with no posts, a collection with no pieces and the starter `frontpage` collection.
- New assets from the brand kit: `share-1200x630.png`, `logo-512.png`, `favicon-96.png`, `favicon-192.png`.
- `sections/404.liquid`: one heading, a sentence, the search field, the crafts from the main menu, "Shop all crochet". Axe clean at 360 and 1280.
- `tools/catalog-upload.py seo <handles>`: sends only the search title and description of products or collections. Used for the octopus keychain pair and the heart hair pins (their descriptions were falling back to 181 characters of page text) and the Sunflowers collection (title was 69 characters).

**Phase 2**
- `snippets/structured-data.liquid`: one graph per page. Every page names the shop (`OnlineStore`: logo, founder Priya Singh linked to Our story, Piro/Bihar/IN, customer-service email, Instagram and Meesho, the Refund policy as `merchantReturnLink`) and the `WebSite`.
- Products: a piece with options is a `ProductGroup` with one `Product` per option (its own name, photo, SKU, Offer). The option's kind is told in Google's words: "Colour" is `color`; "Size", "Pack" and "Set" are `size`; anything else ("With", "Design", "Charm") is `pattern`. A piece without options stays a `Product`.
- `snippets/structured-offer.liquid`: every Offer carries the delivery fee and, now, the delivery time: dispatch 1 to 2 days and transit 3 to 7, from four new numbers in Theme settings → Cart → "Delivery times".
- Collections: `CollectionPage` with the pieces on that page of results as an `ItemList` (page 2 starts at 25) and a breadcrumb; nothing on filtered or sorted views.
- Our story (`AboutPage`) and Contact (`ContactPage`) point at the shared shop node. `Blog` and `Article` (author Priya) are ready for phase 8.
- Check 25 gained "policy, FAQ and Google name the same days". Check 20 and the money check read both shapes of product data.

**Found on the way, fixed the same day on Raushan's word**
- The free gift's description said "free with orders over ₹1,499" (the gift starts at ₹599). It now names no amount ("once your order reaches the amount shown in your cart"), in the store and in `tools/gift-product.csv`, so it cannot go stale again.
- Product page: "Replacement if damaged" (36px) and "Read the refund policy" (22px) were under the 44px rule since the help-pages commit made them links. The first link is now its whole cell of the delivery card, icon included (`snippets/offer-terms.liquid`; it looks the same); the second sits on its own line, 44px tall (`sections/product.liquid`). The desktop contrast finding went with them.
- Check 24's "a tap on Filter or Sort leaves the page where it is" was the test, not the page: Playwright's `tap()` scrolls its target clear of the page's scroll padding first, and at the end of the list the pill sits near the top of the screen. The check now taps the screen where the pill is, as a finger does, and also fails if the sheet did not open.
- Checks 20, 24 and 25: 148 of 148.
- Not done: pasting one page of each type into Google's Rich Results Test. It needs a public address or a manual paste; the required fields are checked on all 78 pages by `check:seo` instead.

### Phase 3: words (2026-10-13)

`npm run check:seo`: 19 of 27 → **23 of 29** (two lines turned green, two new lines added green). Check 24 is 34 of 34 with two new lines; money check 10 of 10.

**Answers from Raushan:** the yarn is mainly acrylic (cotton now and then, so cotton is claimed nowhere); sizes are Priya's to measure; Yarn Basket began in 2025.

**Changed from the plan**
- **The text lives in `tools/catalog/catalog.json`,** not a new `collections.json`: collections already kept their description there. Each collection gained `about` (paragraphs) and `questions` (pairs). The Shop collection, which the tool does not make, sits in `shop_words`.
- **One collection field, not two:** `custom.good_to_know`, a JSON field holding both.
- **Home page: no new line.** The page was made calm on purpose (`docs/home-calm-plan.md`), so two sentences that were already there were reworded (hero text, occasions text). The hero's own text is hidden while the festive campaign runs.
- **No FAQ markup on collections:** Google ended FAQ results in May 2026.
- **Sizes were not written.** `docs/size-sheet.md` lists the 46 pieces without one for Priya.

**Built**
- **50 product descriptions,** 80 to 120 words in three paragraphs: the piece, its options or what is in the set, who it suits and how it is made. Written from the catalogue and the photos; no two share a sentence. Materials: "Soft acrylic yarn, crocheted by hand." is the theme's default; bouquets, keychains and hair pieces name their wrap, ring or clip (`materials` in the catalogue).
- **19 collections:** an intro of 40 to 60 words, and a "Good to know" block after the products (`snippets/collection-about.liquid`): two or three paragraphs, one price line, three or four questions as closed rows in the FAQ's look. Not shown on filtered views or page 2. On phones it comes after the intro; the floating Filter pill rests above both.
- **No price is typed into any text.** The block's price line is built from the collection's own lowest and highest price, only where every piece is in reach (50 or fewer), and check 24 compares it with the store.
- **Our story: "At a glance"** (who, where, since 2025, what, how, delivery days from Theme settings, custom orders).
- `python3 tools/catalog-upload.py words [handles]` sends only text: description, Materials, Good to know. `seo` now also knows the Shop collection, which had no search description of its own.
- Checks: `seo-check` gained "No two product descriptions share a sentence" and "Collection: Good to know, with 3 questions or more", and now reads collection words from the right field (it read 0 before). Check 24 gained two lines for the block; its Filter/Sort tap test now ends at the end of the list, where the pill rests.

**To keep in mind**
- A few sentences compare prices in words ("the pair costs less than two singles", heart pins "the more pairs, the less each costs", "most sets cost less"). They were checked against the store's prices on 2026-10-13. After a price change, reread: daisy keychain, sunflower and daisy set, bee and chick pair, daisy and evil eye set, sunflower, blue daisy and evil eye set, heart hair pins, Gift sets, Keychains.
- Claims waiting for Priya's word are listed at the top of the review page (yarn of the scrunchies, "asked for most", washing a bouquet, how the tie-back fastens, custom orders).
- Theme check shows five new warnings of a kind already present (the snippet uses the FAQ section's classes on purpose).
- The intro on a desktop collection page is now four lines where it was one or two; the first row of products is still on the first screen at 1280 × 800.

### Phase 4: new pages and links (2026-10-13)

`npm run check:seo`: 23 of 29 → **28 of 30** (the four link lines turned green; one new line, "All collections lists every collection", added green). 89 pages open to search engines (50 products, 28 collections).

**Changed from the plan**
- **Pages not built:** Bees (3 pieces) and Octopus (4) are under the rule of 6. Under ₹499 and under ₹999 would hold all 50 pieces (the dearest is ₹499) and repeat Shop. Diwali, Mother's Day, wedding, bridesmaid and kids have no search in the keyword map; each is one catalogue entry later.
- **Shopify's related picks are not used in "You may also like".** The plan was to write the row into the page and let the script swap in Shopify's picks. Looked at on the store: with no orders, Shopify put an octopus keychain and hair clips beside a sunflower bouquet. The row is now the same craft, then the same flower, then Bestsellers, and nothing swaps. Worth another look once there are orders.
- **Phones: each "Keep looking" list is one line that swipes,** like the craft row at the top of the page. Wrapped, eleven occasions were six rows.
- **The header menu is unchanged.** The new pages are reached from collection pages, product pages, the All collections page and the footer.

**Built**
- **Nine collections:** Crochet Flowers (the hub, new tag `flower`, 41 pieces), Evil Eye Crochet Keychains (7), Return Gifts (14), Teacher's Day Gifts (11), Friendship Day Gifts (15), Valentine's Day Gifts (13), Rakhi Gifts (15), Gifts under ₹99 (8), Gifts under ₹199 (28). Each has an intro, a Good to know block, a search title and description, and a cover. Which piece is on which occasion page is Claude's judgement, kept as tags in the catalogue (`gift-return`, `gift-teacher`, `gift-friend`, `gift-valentine`, `gift-rakhi`; not `occasion-…`, so the Occasion filter is unchanged).
- **Custom orders page** (`/pages/custom-orders`; `sections/custom-orders.liquid`, `templates/page.custom-orders.json`): what can be made, three steps, WhatsApp and the Contact form, four questions. No price, no number of days. Linked from the footer's Help list, the FAQ, the Contact page and Our story.
- **Three menus in the admin** (`flowers`, `occasions`, `prices`), the one source for every "Shop by" list. Edit them in Online Store → Navigation, or in the catalogue's `menus` and resend.
- **Collection pages:** "Keep looking" after Good to know (`snippets/collection-links.liquid`): the three menus, the page itself left out.
- **Product pages:** "You may also like" is in the HTML (up to 6 pieces), with "More like this" under it: up to 4 of the collections the piece is in.
- **All collections** (`/collections`, `sections/collections.liquid`, rebuilt): photo tiles in groups: by craft, by flower, by occasion, by price, and "More" for anything in no menu. The footer's Shop list ends with "All collections".
- `tools/catalog-upload.py`: `tags [handles]` (only the tags) and `menus` (the three menus, the catalogue's pages, the footer's Help list). A collection added since the last photo build takes its cover from the product photo it names.
- Checks: section 20 gained "You may also like and More like this are in the page, before any script"; section 24 gained "Keep looking leads on to the other collections" and "All collections and Custom orders: accessible, every tile has a photo".

**Found on the way**
- Photo tiles in the Shop menu (`snippets/menu-tile.liquid`) repeated the collection's name as the photo's alt text beside the same name as the link. The photo is now decorative (empty alt), as the snippet always meant.
- The checks read port 9292 unless given `--url`; this session's server is on 9393. Final numbers below are from 9393: SEO 28 of 30, money 10 of 10, sections 19, 20, 22, 24, 25 all green (178 lines), section 21 green.

**To keep in mind**
- Two answers name pieces by price ("Is there a crochet keychain under ₹100?", "Is there a crochet flower bouquet under ₹200?"). Reread Gifts under ₹99 and Gifts under ₹199 after a price change.
- Raushan, 2026-10-13: the occasion pages' piece lists and "Names and initials" on the Custom orders page stay as built (Claude's recommendation; the FAQ already promises names and initials).
- The evil eye collection counts 8 in the admin: one is an archived product (the old pair), not shown anywhere.
- A new piece needs its tags (`flower`, `gift-…`) in the catalogue to appear on these pages.

### Phase 7: what AI engines read (2026-10-13)

Done before phase 10 on Raushan's word: it needed nothing from him. `npm run check:seo`: 28 of 30 → **30 of 31** ("llms.txt says who we are" turned green; one new line, "AI files give the store's price for every product", added green). Money check: 10 → 11 lines, all green.

**Changed from the plan**
- **`/agents.md` is left to Shopify; `/llms.txt` and `/llms-full.txt` are ours.** The plan replaced `agents.md` and put our section under Shopify's text. But that text is Shopify's instructions for agents that check out with its tools, and Shopify rewrites it as the tools change; a copy in our theme would go stale without anyone noticing. `/llms.txt` is where AI engines look for what a site is, so that is the one we own. Its last line sends shopping agents to `/agents.md`.
- **The rewards (₹50 and ₹100 off), the free gift and cash on delivery are not in the files.** They change more often than the files are rebuilt, and a stale offer in a cached file is a wrong price.

**Built**
- **`tools/agents-build.mjs`** (`npm run build:agents`) writes `theme/templates/llms.txt.liquid` (12 KB) and `theme/templates/llms-full.txt.liquid` (71 KB). Shopify gives these templates only the `agents` object, so every fact is written in by the script, each from where it already lives: products, prices, stock, size, materials, collections and menus from the store (read-only); delivery fee, free-delivery amount and days from Theme settings; who we are from Our story's "At a glance"; the return rule from `docs/legal/refund-policy.html`; custom orders and questions from their page templates. Nothing is typed twice.
- **`/llms.txt`:** who we are, what we sell with a price range per craft, delivery, returns, custom orders, every collection in the All collections page's groups, the main pages.
- **`/llms-full.txt`:** the same, then all 50 products by craft (link, price of every option, size where we have it, materials, description) and every question and answer from the FAQ, the Custom orders page and each collection's Good to know.
- Links are written as `{{ agents.store_url }}/…`, so they are right on the myshopify address now and on `yarnbasket.in` after the move, with no rebuild.
- The script refuses to write an email address, a phone number or a WhatsApp link (Shopify: the file is cached widely), and leaves out the free gift, test products and drafts. No rating appears.
- **`npm run build:agents -- --check`** fails when a fresh build would differ, and prints the first changed line. Tried with one price changed in a copy: it failed on that line.
- The date line ("Prices and stock as of …") only moves when something else in the file did.
- `theme/.theme-check.yml`: theme check does not know the `agents` object yet, so `UndefinedObject` is off for these two files only.
- `docs/seo-log.md`: the five fixed questions to ask ChatGPT, Perplexity and Google each month, from launch.

**Found on the way**
- The local server does serve both templates, and `/agents.md` is unchanged (5,833 bytes, Shopify's text).
- The store says prices include tax, so the files say so too, in the cart's own words.

**To keep in mind**
- **Run `npm run build:agents` after any price, product, collection, policy, delivery-setting or FAQ change,** then commit the two files. The money check's new line fails while they are stale.
- Only 4 of 50 pieces have a size; the rest appear in the long file once the sizes are in the store and the build is run.
- No AI engine can read anything while the store is behind its password. The files are ready for launch day.
