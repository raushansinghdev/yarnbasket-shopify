# Search results page plan (`/search`)

Status: **Built 2026-10-02.** Raushan approved all the recommendations (directions in §2, D5–D10 in §13).

### As built (where it differs from the plan below)
- **The page's box submits on Enter; it doesn't show suggestions as you type.** That would need the header pill's code in theme.js, which is at its budget. The page already shows full results, so a dropdown on top adds little. (§4.3 planned the dropdown.)
- **The results-page script is its own file, `assets/search-page.js`** (2.0 KB gzipped), loaded only by the search page. Adding the chips, the lens jump and the spoken updates to search.js pushed it to 4.3 KB, over its 4 KB budget. search.js now keeps the panel, recent searches and remembering the page's search (3.1 KB gzipped).
- **The heading block:** the box comes first (at the top, where people look to change a search), then "SEARCH RESULTS FOR" and the query as one h1, then the count and "Sort: Best match ▾" on one row. The first product starts about 260px down on a 360–390px phone (347px before) and about 275px on desktop.
- **The custom-order row** is about 120px tall on phones, not 88. The title wraps to 2 lines and "Ask us" sits under it with a full 44px tap height. On desktop it's one 48px line.
- **"More to love" and "Our makes" use `snippets/product-row`:** a swipe row (40% cards) below 990px, and 6 across from 990px.
- **A pages-only search** (for example "contact") says "No products for “contact”", lists the page under Help & stories first, then the picks row.
- **Long queries** are cut to 2 lines in the heading. The whole query is still read aloud.
- **Not tested yet:**
  - Craft chips: they need Search & Discovery → Filters → Product type (§11). The code is the earlier tested chip markup plus in-place swapping.
  - Load more: it needs more than 36 results.
  - Recent searches on the empty page: they're still panel only.
- **Checks (2026-10-02):**
  - theme check is clean
  - axe reports 0 violations at phone and desktop sizes in every state: results, few, none, empty, one letter, pages-only. It's also clean at 320px wide (like 400% zoom).
  - no sideways scroll at 320, 360, 768, 1100 and 1280px; columns are 2/3/4/5
  - exactly one visible search box at every width
  - the header lens and the phone menu's Search both jump to the page's box (the panel never opens on /search)
  - sort works in place, focus stays on Sort, and it's announced ("Sorted by Price, low to high.")
  - Tab order is box → clear → Sort → first card
  - without JavaScript: Apply sorts, and the lens is a link
  - forced colours keep every control visible
  - the search panel on other pages still works
  - `npm run check:quick` passes 48/49. The one fail is the home page's LCP on a cold local server (2,372ms). Repeated runs measure about 800ms with or without cart.js, so it isn't caused by this work.
This plan covers the page you land on after a search, at every state:
- results
- few results
- no results
- the empty page (no query)
- pages and stories only

It builds on `search-plan.md` §8, which built the page, and changes it where this plan says so. It follows `motion-plan.md`, `brand-direction.md` and the "products first, one calm background" rule.

The search files belong to the search session: `sections/search.liquid`, `snippets/search-*`, `assets/search.js`. The build is claimed with that session first (§12).

---

## 1. What's wrong today (measured 2026-10-02 with the 11 test products)

| # | Problem | Measured | Why it matters |
|---|---------|----------|----------------|
| 1 | **Two search boxes on desktop**, both showing the query | The header pill and the page box, 150px apart | It reads as clutter, and shoppers wonder which one to use |
| 2 | **The heading says nothing** | The H1 is just "Search"; the query is only in a small count line | It costs about 70px and doesn't say what you're looking at. Screen readers hear "Search" |
| 3 | **Cards are large for a results list** | Desktop: 296 × 370px photos, 4 across. With 3 results, a whole column stays empty and only one row fits on screen. Phone: the first card starts 347px down; about 2 cards per screen | Results should be scanned, not admired one at a time |
| 4 | **Product names are hard to scan** | Italic Cormorant at 18–21px, in the same weight as the brand headings | Lovely for 4 hero products on the home page; slow to read across a list. Italic serif is also hardest for low-vision and dyslexic readers |
| 5 | **No-results and the empty page are very long** | Phone: about 1,440px before the footer, almost 2 screens. The custom-order card alone is 215px; "Our makes" is a 2 × 2 grid of full cards | The useful part (try a craft, ask us) gets lost under big photos |
| 6 | **Sort sits far from the count** on desktop, and wraps under it on phones | Phone: a full row for "Sort [Relevance ▾]" | One more row before the first product |
| 7 | **No way to narrow results** | Craft chips need Shopify's Search & Discovery filters, which aren't set up | With 15–25 products this matters less, but "bouquet" mixed with keychains still needs a quick "Bouquets only" |
| 8 | **Prices read "Rs. 1,199.00"** | Store currency format | It's an admin setting (§11), not theme code |

What already works and stays:
- the search box with its clear ×
- sort by Relevance and price
- "Load more"
- the "Help & stories" list
- `noindex`
- the no-JS behaviour
- the custom-order idea
- Popular chips

---

## 2. Directions Raushan chose (2026-10-02)

1. **Compact, easy-read result cards:** square photo, name in plain Jost 16px, price under it (§5).
2. **Phones: a 2-across grid,** not list rows. The photo is what sells crochet.
3. **Suggestions as one slim row:** swipe on phones, 6 across on desktop. It replaces the 2 × 2 grid (§7).
4. **One search box on the search page: the page's own.** The header's pill steps back to a lens icon marked "you are here" (§4.3).

---

## 3. Goals

1. **The first result is visible without scrolling on a 360 × 640 phone,** and two full rows on a 390 × 844 phone.
2. **Every name and price reads at a glance:** 16px Jost, 2 lines at most, good contrast, prices in tabular figures.
3. **Nothing on the page competes with the results.** One box, one count, one sort, and chips only when they help.
4. **"No results" is never a dead end,** and it fits on one phone screen: try a craft, ask us, or 6 bestsellers in a row.
5. **Accessible:** WCAG 2.2 AA, a heading that says what was searched, spoken updates when results change in place, and everything usable by keyboard and without JavaScript.
6. **Lighter:** smaller cards mean smaller photos, about 40% fewer image bytes on the first screen.

---

## 4. Page anatomy

### 4.1 Phone (designed at 360px, checked at 390 and 412)

```
┌──────────────────────────────────────┐
│ ☰        Yarn Basket       ⌕•   🛒   │ header (lens marked "here")
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ ⌕  bouquet                    ✕  │ │ the one search box, 48px
│ └──────────────────────────────────┘ │
│ SEARCH RESULTS FOR                   │ eyebrow
│ “bouquet”                            │ H1, serif, 28px
│ 3 products          Sort: Best ▾     │ one row: count left, sort right
│ (All 3)(Bouquets 3)(Keychains 1) →   │ chips, only when 2+ crafts (swipe)
│ ┌──────────────┐ ┌──────────────┐    │
│ │    photo     │ │ SALE         │    │ square photos
│ │     1:1      │ │    photo     │    │
│ └──────────────┘ └──────────────┘    │
│ Red Rose Crochet  Pink Tulip &       │ Jost 16px, 2 lines max
│ Bouquet           Daisy Bouquet      │
│ From ₹1,199       ₹999  ₹1,199       │
│ ┌──────────────┐                     │
│ │    photo     │                     │
│ ...                                  │
│ MORE TO LOVE                         │ only when ≤ 4 products (D5)
│ [card][card][ca…  →                  │ slim swipe row
│ HELP & STORIES                       │ when pages or posts match
│ Caring for crochet flowers        →  │
└──────────────────────────────────────┘
```

**Rough heights at 390px:**
- The box sits right under the header, 16px down; the heading block is about 110px.
- **The first product starts about 235px down**, against 347px today.
- A compact card is about 175 + 64 = 239px tall, so two full rows fit on an 844px screen, with the third row peeking.

### 4.2 Desktop (≥ 990px; checked at 1100, 1280 and 1440)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [logo] SHOP GIFTS BESTSELLERS HELP                          ⌕•   👤   CART  │
├──────────────────────────────────────────────────────────────────────────────┤
│ SEARCH RESULTS FOR                                                           │
│ “bouquet”   3 products                                                       │ H1 + count on one line
│ ┌──────────────────────────────────────┐                       Sort: Best ▾  │ box (max 36rem) · sort right
│ │ ⌕ bouquet                         ✕  │                                     │
│ └──────────────────────────────────────┘                                     │
│ (All 3) (Bouquets 3) (Keychains 1)                                           │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                                 │ 5 across from 1280px
│ │photo │ │photo │ │photo │ │photo │ │photo │                                 │ (237px squares at 1440)
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                                 │
│  name     name     name     name     name                                    │
│  price    price    price    price    price                                   │
│ MORE TO LOVE (≤ 4 results)                                                   │
│ [card][card][card][card][card][card]                                         │
│ HELP & STORIES (two columns)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Columns:** 2 below 768px, 3 at 768–989px, 4 at 990–1279px, 5 from 1280px (D7).
- With 3 results at 1440px the row is 60% full, and "More to love" fills the gap below with something useful. Today the 4th column just sits empty.

### 4.3 One search box (direction 4)

- **On `/search`, the header pill steps back** at every width. It shows only the lens icon, with `aria-current="page"` and the soft tint we use for "you are here", so the header still shows search is where you are.
- **Tapping the lens on `/search`** scrolls to the page's box and focuses it (D9). It doesn't open the panel, which would be a second box. Without JavaScript the lens is a link to `/search`, as today.
- **The page box is the one place to change the search.** It keeps the panel's predictive results: typing in it opens the same suggestions dropdown under it, as the header pill does today on other pages. It reuses the pill's behaviour (the search session confirms the details before the build).
- **Phones change very little:** their header already shows only the lens.

### 4.4 The heading

- **Visible:** a small eyebrow "Search results for", then the query in serif as the H1. On desktop the count sits to the right of the H1 in Jost. On phones it moves to the next line, sharing a row with Sort.
- **Read aloud:** the H1 is "Search results for “bouquet”". The eyebrow is inside the H1, so there's one heading with the full meaning.
- **The browser tab title** stays "Search: bouquet – Yarn Basket".
- **Long queries** wrap with `overflow-wrap: anywhere` and are cut to 2 lines visually. The full text is still read aloud.

### 4.5 The toolbar: count, sort, chips

- **Count:** "3 products". When pages also match: "3 products · 1 help page". It isn't repeated anywhere else.
- **Sort:** the native `<select>` stays (most accessible, and the phone's own picker), restyled as a compact 48px pill "Sort: Best match ▾".
  - The visible label is part of the pill.
  - Its options are "Best match" (renaming "Relevance", which is jargon), "Price: low to high" and "Price: high to low".
  - With JavaScript, changing it sorts in place (search.js already does). Without, a small "Apply" button submits.
- **Craft chips:**
  - **They need setup:** Search & Discovery's product type filter (admin, §11).
  - **They show only when the results span 2 or more crafts.** "All" comes first.
  - **Phones:** one swipe row.
  - **Desktop:** they wrap.
  - **They're links,** marked `aria-current` when active, with the count in the label ("Bouquets, 3").
  - **With JavaScript** the grid updates in place; without it, the page reloads.

---

## 5. The compact card (direction 1)

A `compact` variant of `snippets/product-card.liquid`: `{% render 'product-card', product: p, compact: true %}`. The home page cards don't change.

| Part | Home card (today) | Compact card |
|------|------------------|--------------|
| Photo | 4:5, `--radius-md` | **1:1**, `--radius-sm` (10px) |
| Second photo on hover | Yes | Yes (desktop with a mouse only, the same calm 700ms fade) |
| Name | Cormorant italic 18–21px | **Jost 500, 16px** (15px under 375px), line-height 1.35, **2 lines max** (the full name is still read aloud) |
| Price | Jost 500 | Jost 500 15px, tabular figures; a sale shows the price, then the old one struck in Taupe Ink 14px (as today, with the spoken labels) |
| Badge | Pill on the photo | The same pill, slightly smaller (11px, 24px tall), so it never covers a third of the photo |
| Gap under photo | 12px | 8px |
| Hit area | The whole card is one link | The same |

- **Image `sizes`** shrink with the card, for example `(min-width: 1280px) 240px, (min-width: 990px) 22vw, (min-width: 768px) 30vw, calc(50vw - 24px)`. The first 4 photos are eager; the rest are lazy.
- **D8:** should the collection pages (build-plan Phase 3) use the same compact card, so search and browsing match?

---

## 6. States

| State | What shows |
|-------|-----------|
| **Results (5+ products)** | Box → heading → count + sort → chips (if 2+ crafts) → grid → Load more (if any) → Help & stories (if any) |
| **Few results (1–4 products)** | As above, then **"More to love"**: a slim row of up to 6 bestsellers not already in the results (D5) |
| **Pages or posts only, no products** | The heading says "No products for “care”", then **Help & stories first**, then the slim custom-order row and the Bestsellers row |
| **No results at all** | §6.1 |
| **Empty `/search` (no query)** | The H1 "Search", the box (not auto-focused, so screen readers start at the top and the phone keyboard stays shut), Popular chips, Recent searches (if any; search.js fills them on the page too), and the Bestsellers row |
| **Loading in place** (sort, chip) | The grid dims to 60% for at most a moment, then crossfades (200ms). The count updates, and the status line says "Sorted by price, low to high. 3 products." |
| **Error in place** (offline) | Falls back to a normal page load, so the link or form still works |

### 6.1 No results, on one phone screen

```
┌──────────────────────────────────────┐
│ [ ⌕ teddy                       ✕ ]  │
│ No matches for “teddy”               │ H1, serif
│ Check the spelling, or try a craft:  │
│ (Bouquets)(Keychains)(Hair clips) →  │ one swipe row (wraps on desktop)
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│   ✎ Can't find it? We make custom    │ slim row, Soft blush, stitched edge
│     pieces by hand.      Ask us →    │ about 88px (215px today)
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│ BESTSELLERS                          │
│ ┌──────┐┌──────┐┌───                 │ 6 small cards, about 2.5 visible
│ │photo ││photo ││ph                   │
│ └──────┘└──────┘└───                 │
│ Bee & C… Cherry…  Dai                │
│ ₹449     ₹299     ₹5                 │
└──────────────────────────────────────┘
```

- **Height:** about 640px at 390px wide, against about 1,440px today.
- **The no-results H1** is "No matches for “teddy”" (today it's "Search", with that line as a paragraph).
- **The label** "Bestsellers" or "Our makes" follows the search session's rule: never "Bestsellers" unless it's that collection.

---

## 7. Suggestion rows (direction 3)

One new snippet, `snippets/product-row.liquid`. It's used by:
- "Bestsellers" / "Our makes" on no results and on the empty page
- "More to love" under few results
- later, possibly the cart's Little extras, so all the small product rows match

- **Phones:** the site's calm swipe row (`.scroller`, the 2026-10-02 rules). Items are 40% wide, so about 2.5 show and the cut-off third says "there's more". Soft snap, the edge fade, no motion while swiping. The row is a labelled region you can Tab into and scroll with the arrow keys.
- **Desktop:** a plain 6-across grid with no scrolling, about 180px squares at 1280px.
- **Cards:** the compact card with a smaller name (15px). Up to 6, sold-out items skipped, and products already in the results excluded.
- **Heading:** an `h2` styled as the small uppercase eyebrow, so the page outline stays h1 → h2.

---

## 8. Accessibility (WCAG 2.2 AA)

- **Headings:**
  - h1: "Search results for “bouquet”" (or "No matches for…")
  - h2s: "Products" (hidden), "More to love", "Help & stories", "Bestsellers"
  - card names: h3
- **One search landmark:** the page's `<form role="search">`, labelled "Search the shop". On this page the header pill isn't rendered as a form, so there's never a second, duplicate landmark.
- **Spoken updates** (sort, chip, Load more) go through one `role="status"` line in the page. Focus stays on the control you used; Load more moves focus to the first new card (as today).
- **Chips:** links with `aria-current="true"`; the count is in the accessible name ("Bouquets, 3 products").
- **Tap targets:** at least 48 × 48px everywhere: chips, the sort pill, the box's ×, cards, Load more.
- **Readable text:** names 16px, nothing under 14px except badges. Taupe Ink on Soft blush is 5.7:1. Line length is fine at every width.
- **Swipe rows** can be reached by keyboard (`tabindex="0"`, `role="region"`, `aria-label`) and the ring is drawn inside them (existing rule). At 400% zoom they keep working, and the grid drops to 1 column at 320px CSS width.
- **Reduced motion:** no stagger, no crossfade, no hover zoom.
- **Forced colours:** chips, the sort pill and the custom-order row keep real borders.
- **Without JavaScript:** everything is a link or form; sort has its Apply button; chips reload the page; the lens is a link.

---

## 9. Motion (from `motion-plan.md`)

| Moment | Motion |
|--------|--------|
| First load | Cards arrive with the existing gentle stagger (`data-arrive`); only the first row waits, and the rest are simply there |
| Sort or chip in place | The grid dims (160ms), then crossfades (200ms). No sliding or reflow animation |
| Hover (mouse only) | The calm second-photo fade and the 1.02 zoom over 1.4s, as on the home cards |
| Swipe rows | No motion: still under the finger, soft snap, edge fade |

---

## 10. Performance

- **Smaller photos:** 1:1 at about 175px on phones (instead of about 175 × 219) and 240px on desktop (instead of 296 × 370), roughly **40% fewer image bytes** on the first screen.
- **Page size:** from 24 to 36 per page, so the whole launch range (15–25 products) always fits on one page with no Load more.
- **JavaScript:** no new library.
  - The lens-focuses-the-box behaviour (about 150 bytes) and the chip-in-place update go into search.js, which already does sort in place. search.js is at 3.8 of its 4 KB gzip budget, so if it doesn't fit, the chip update goes into a small separate module.
  - theme.js gets nothing; it's at its budget.
- **No layout shift:** every photo has a fixed ratio, and the toolbar has a fixed height before the chips appear.

---

## 11. Admin tasks (Raushan)

1. **Craft chips:** Apps → **Search & Discovery** → **Filters** → **Add filter** → **Product type** → Save. That's all the chips need.
2. **Synonyms**, so near-misses still find things: Search & Discovery → **Synonyms**. For example:
   - `keychain, keyring, key chain`
   - `hair clip, hairclip, clip, barrette`
   - `bouquet, flowers, bunch`
   - `bag charm, purse charm`
   - `pot, planter`
3. **Prices as ₹1,199:** Settings → General → Store defaults → Currency display → **Change formatting**, then `₹{{amount_no_decimals}}`.
4. **Bestsellers collection** (already on the nav list): once it exists, the rows say "Bestsellers" instead of "Our makes".

---

## 12. Files and build stages

**Files:**

| File | Owner | Change |
|------|-------|--------|
| `snippets/product-card.liquid` | shared (home) | The `compact` variant (§5) |
| `snippets/product-row.liquid` | new | Suggestion rows (§7) |
| `sections/search.liquid` | search session | Head, toolbar, states, grid columns, page size (§4, §6) |
| `snippets/search-start.liquid` | search session (shared with the panel) | Slim custom-order row; picks as `product-row` on the page (the panel keeps its own rows) |
| `assets/search.js` | search session | The lens focuses the page box; chips in place; spoken updates |
| `sections/header.liquid` | shared | On `/search`: the pill steps back to the lens (CSS plus one condition) |
| `locales/en.default.json` | shared | New strings (`search.results_for`, `search.more_to_love`, `search.best_match`…) |

**Build notes from the search session (2026-10-02):**
- theme.js is at 25,472 bytes against its 25 KB budget. The lens-focuses-the-page-box change goes in search.js (which the search page already loads), or replaces existing theme.js code; it never adds to theme.js.
- On `/search`, the search panel's openers must keep working wherever the page box is hidden or missing. theme.js `finish()` hands focus back to the first opener that's showing.

**Stages:**

| Stage | What | Done when |
|-------|------|-----------|
| 1 | The compact card and the results grid (columns, sizes, page size 36) | axe 0; screenshots at 360/390/768/1100/1280/1440; no sideways scroll |
| 2 | Head and toolbar: one box, the H1 with the query, the count + sort row, chips, the header lens on `/search` | The first product is above 260px on a 390 phone; Tab order is box → sort → chips → cards; no-JS sort and chips work |
| 3 | States: `product-row`, slim custom-order row, More to love, no results, empty page, pages-only | No results fits 390 × 844; the existing `npm run check` search checks plus new ones pass |
| — | Real-phone pass (Raushan): Android Chrome + TalkBack, iPhone Safari + VoiceOver | No blockers |

---

## 13. Decisions for Raushan

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| D5 | "More to love" row under few results (1–4)? | (a) yes, up to 6 bestsellers not in the results (b) no | **(a).** With 3 results the page ends abruptly; this keeps people browsing without crowding a full results page (it never shows with 5+) |
| D6 | Highlight the searched word in product names? | (a) no (b) bold the matching words | **(a).** On iPhones, VoiceOver splits a name with bold parts into separate pieces ("Red", "Rose", "Crochet Bouquet"), and with 15–25 products the match is obvious anyway |
| D7 | Desktop columns | (a) 5 from 1280px, 4 from 990, 3 from 768 (b) 4 max | **(a).** Square 237px photos are still large; 5 across fits a whole small search on one screen |
| D8 | Use the compact card on collection pages too (Phase 3)? | (a) yes: search and collections match (b) decide when we build collections | **(a).** search-plan §8 promised the two pages would look the same, and browsing a craft is the same task as scanning results. The home page keeps its big editorial cards |
| D9 | What does the header lens do on `/search`? | (a) scroll to and focus the page box (b) open the search panel as on other pages | **(a).** One box per page (direction 4); the panel would add a second one |
| D10 | Rename "Relevance" in Sort? | (a) "Best match" (b) keep "Relevance" | **(a).** It's plainer, and it's what Flipkart and Amazon shoppers already see |
