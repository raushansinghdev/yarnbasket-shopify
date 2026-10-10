# Collection page: redesign with filters and sort

Status: **Built 2026-10-10** (see "As built" at the end). Waiting for Raushan's phone look and his admin step (Search & Discovery filters).

## Context

`/collections/shop` (and every other collection) is still the interim page: a title, 36 compact cards, 5 across on
desktop, Shopify's plain page links. There is no way to sort or narrow 55 pieces, and the desktop photos are small
(about 225px). This is build-plan Phase 3. The goal is a page that shows products fast, lets a shopper narrow and
sort in one or two taps on a phone, is WCAG 2.2 AA, works without JavaScript, and looks like the rest of the store.

Decided with Raushan (2026-10-10):
- **4 across on desktop** (photos about 280 to 300px, were about 225px).
- **No quick add on cards this round.** Cards stay photo, name, price, heart.
- **Filter placement: Claude tries the styles as mock-ups and proposes one** (Phase A below).

What I found:
- The store already answers `filter.v.price.*` and `sort_by` (tested on the preview: "under ₹150" returns 14 pieces).
- Craft, occasion and flower filters are **not** on: they need the free Search & Discovery app (launch-checklist, unticked).
- The canonical tag on a filtered URL is already the clean collection URL.
- `sections/search.liquid` + `assets/search-page.js` already have the patterns to copy: the Sort pill (native
  select), chips as links, in-place swap through the Section Rendering API, "Load more", spoken status, stale-reply guard.
- Today the first product starts about 175px down on a phone. The first draft of this plan put it at about 290px;
  that is fixed below (target: 235px or less).

## Second pass: what I changed after reviewing the first draft

| Weak point in the first draft | Fix |
|---|---|
| Title, craft row and a toolbar row pushed the first product 115px lower on phones | Phones get no toolbar row at the top. Filter and Sort are mocked two ways (Phase A): a small floating "Filter · Sort" pill at the thumb, as Myntra, Nykaa and Meesho shoppers know it, or Filter pinned at the start of the craft row. Either keeps the first product within 235px |
| "Load more", open a product, press Back: the list would be back at 24 and the shopper's place lost | The page remembers how many pages were loaded and the scroll position, and restores both on Back when the browser did not keep the page |
| Back did nothing useful after filtering (URL was replaced) | Each applied filter, craft or sort is a history step: Back undoes it, Forward redoes it. Several ticks in the phone sheet count as one step |
| A sticky bar can hide the focused element (WCAG 2.2, 2.4.11) | `scroll-padding` grows by the bar's height at whichever edge it sticks, and check 24 tabs through the grid to prove no focused card sits under a bar |
| The craft row had two meanings (links on some pages, filter on others) | One rule: the craft row is navigation, on Shop and the craft collections only. On gift and flower collections "Craft" is an ordinary filter group |
| Photo size was a guess | Measured from the page width: 278px at 1280, 302px at 1440 (5 across gave 218 to 237px) |

## Design

### Page anatomy (same parts at every width)

```
PHONE (360)                              DESKTOP (≥ 1100)
┌────────────────────────────────┐       Shop                                  55 pieces
│ Shop                 55 pieces │       One-line intro (craft collections only)
│ (All)(Bouquets)(Keychains)… →  │       (◉ All)(◉ Bouquets)(◉ Keychains)(◉ Hair)(◉ Charms)(◉ Pots)
│ Under ₹200 ✕  Birthday ✕ Clear │       ───────────────────────────────────────────────────────
│ ┌────────┐ ┌────────┐          │       <filter controls: style chosen in Phase A>   Sort: Featured ▾
│ │ photo  │ │ photo  │          │       Under ₹200 ✕   Birthday ✕   Clear all
│ └────────┘ └────────┘          │       ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ name/price  name/price         │       │ 280+ │ │      │ │      │ │      │
│ …      ╭─────────────────╮     │       └──────┘ └──────┘ └──────┘ └──────┘
│        │ ⚙ Filter · Sort │     │       …
│        ╰─────────────────╯     │       Showing 24 of 55   [Load more]
│ Showing 24 of 55  [Load more]  │
│ intro text (phones: after grid)│
└────────────────────────────────┘
```

1. **Heading row:** the title (h1, Cormorant italic, as now) with the count beside it ("55 pieces"). The
   collection's description is one short intro under the title from 768px, and after the products on phones.
2. **Craft row** (Shop and the craft collections): chips with a small round photo, like the home page's craft
   circles. "All" is first; the current one is marked. They are links between real, indexable collection pages and
   need no admin setup. The applied filters and sort ride along. Phones: one swipe row with the next chip cut off.
3. **Filter and Sort controls** (placement from Phase A):
   - **Phones:** Filter opens a bottom sheet; Sort is the native select, so the phone's own picker opens.
   - **Desktop:** one 48px row that sticks under the header and hides and returns with it (`html.header-hidden`).
4. **Applied filters:** removable chips plus "Clear all", shown only when something is applied.
5. **Grid:** 2 across to 767px, 3 from 768px, **4 from 1100px**. 24 per page (divides by 2, 3 and 4; was 36).
   Compact card unchanged (`snippets/product-card`, `compact: true`); level rows (check 22) kept. The first row's
   photos load eagerly, the first one with high priority; `sizes` updated for the wider card.
6. **Load more** replaces the page links: "Showing 24 of 55" and a ghost button; it is a real link to `?page=2`.
7. **Nothing matches:** "No pieces match these filters", the applied chips, a "Clear filters" button and a
   Bestsellers row (`snippets/product-row`). An empty collection keeps today's message.

### Filters

| Filter | Control | Source |
|---|---|---|
| Price | Three preset pills: Under ₹200 · ₹200 to ₹399 · ₹400 and above (one at a time) | Works today. Presets, not a slider: easier to tap and to use by keyboard. Thresholds are a section setting |
| Occasion | Tick pills with counts: Birthday, Anniversary, Thank you, For her, For him | New product metafield `custom.occasion`, filled from the `occasion-*` tags |
| Flower & motif | Tick pills with counts: Sunflower, Daisy, Rose, Tulip, Evil eye, Bee… | New product metafield `custom.motif`, filled from the motif tags |
| Craft | Tick pills with counts (gift and flower collections only) | Product type, once Search & Discovery has it |
| In stock only | One switch | Works today (Availability) |

- No Colour filter: only 6 of 55 pieces have a Colour option, so "Pink" would wrongly hide most pink pieces.
- The theme renders whatever `collection.filters` returns (list, price range, boolean), so a filter added or
  removed in the admin needs no code. Values with 0 pieces stay visible but disabled (`aria-disabled`).
- **Sort options** (renamed, trimmed from Shopify's eight): Featured · Bestselling · Newest · Price: low to high ·
  Price: high to low. A–Z, Z–A and Oldest are dropped.
- **Behaviour:** each change applies at once: results swap in place (Section Rendering API + view transition),
  the URL changes as a history step, the count is spoken ("12 pieces"), focus stays on the control used. In the
  phone sheet the bottom button reads "Show 12 pieces" and closes it; "Clear all" sits beside it.
- **Known Shopify behaviour to confirm in Phase A:** a piece with several sizes matches a price range if any size
  does, and its card still says "From ₹249". Recommendation: leave it (the piece does have an option in range).

### Accessibility
- Filter sheet is a native `<dialog>` (focus trap, Esc, inert page, focus returns to "Filter"), like the menu and cart drawers.
- Desktop drop-downs are `<details>` / buttons with `aria-expanded`; Esc and click-outside close; real checkboxes and links inside.
- All targets 44 to 48px, with 8px between them; focus rings as elsewhere; `role="status"` announces result counts.
- Nothing focused is ever hidden under a sticky bar (`scroll-padding`); on short screens (under 480px tall) nothing sticks, as the header already does.
- After "Load more", focus moves to the first new product.
- Without JavaScript: filters are fold-out groups in the page with an "Apply" button, Sort has "Apply", Load more is a link.
- Reduced motion and lite mode: instant swaps. Forced colours keep every control outlined.
- At 320px and at 200% text size: no sideways scroll, nothing cut off, the floating control never covers a card's name or price at rest.

## Steps

### Phase A: mock-ups, then Raushan's go (no theme code yet)
1. `ListAgents`; tell any peer which files this work takes (below). Save this plan as `docs/collection-plan.md`.
2. Build mock-ups on the real page (injected with `tools/cdp.mjs` into the local preview, real photos and tokens):
   - **Desktop, three styles:** slim bar of drop-downs · left sidebar · one Filter button with a side panel.
   - **Phone, two styles:** floating "Filter · Sort" pill at the bottom · Filter pinned at the start of the craft row.
   - The phone sheet open, 2 filters applied, and the no-match state.
   - Screenshots at 360, 768, 1280 and 1440 into `docs/mockups/collection-*.png`.
3. Score them on: photo size left, taps to apply a filter, where the first product starts, thumb reach, how it
   reads with 0 / 2 / 4 filters applied, fit with the header and search page. Propose one per screen size with
   the reasons and the images. **Wait for Raushan's go.**

### Phase B: build
4. `theme/sections/collection.liquid`: rewrite to the anatomy above. Section settings: craft row collections
   (collection list), price thresholds. Skips `free-gift` / `test-product` / `settings.gift_product` as today.
   "All" uses `settings.shop_all_collection.url | default: routes.all_products_collection_url`.
5. New `theme/snippets/collection-filters.liquid` (the filter groups, rendered for the desktop style and for the
   phone sheet with different id prefixes) and `theme/snippets/collection-crafts.liquid` (the chip row).
   Reuse `.search-chip`, `.search-sort*`, `.btn--ghost`, `snippets/icon`, `snippets/product-row`.
6. New `theme/assets/collection.js` (module, loaded only here, budget 4 KB gzipped): in-place swap with history
   steps and `popstate`, sheet open/close, Load more, restoring loaded pages and scroll on Back, status text,
   stale-reply guard, `window.ybArrive` and photo fade on new cards. Same patterns as `assets/search-page.js`,
   which is left alone.
7. `theme/locales/en.default.json` → `collections.*` strings (read, modify, write at once).
8. `theme/snippets/meta-tags.liquid`: `noindex, follow` when a filter or sort is applied. robots.txt stays for the SEO phase.
9. `theme/sections/search.liquid`: grid to 4 across from 1100px so search and collections still match (one CSS
   rule; ask the search session first if one is running).
10. Catalogue: `tools/catalog-build.py` / `catalog-upload.py` write `custom.occasion` and `custom.motif` (list of
    single-line text) from each product's tags; create the two metafield definitions through the Admin API
    (read before, read back after, logged in `docs/decisions.md`). Tags stay the source of truth.
11. `tools/check.mjs`: new section 24 (below). Make sure `tools/money-check.mjs` reads page 2 of a collection now
    that a page holds 24.
12. Docs and memory: `docs/collection-plan.md` "As built", `docs/decisions.md`, `docs/launch-checklist.md`, build-plan memory.

### Raushan's part (admin, about 5 minutes, can follow the build)
- Install **Search & Discovery** → Filters → add **Product type**, **Occasion**, **Flower & motif** (the two
  metafields); keep Price and Availability. Until then the page works with Price, In stock, Sort and the craft row.
- Set the Shop collection's sort order (it reads "most relevant" now) to manual or best selling, so "Featured" means something.

## Verification
- Own preview: `shopify theme dev --port 9393` with the storefront password passed inline.
- `shopify theme check` clean.
- `tools/cdp.mjs` screenshots at 320, 360, 390, 768, 1100, 1280, 1440: columns 2/3/4, no sideways scroll, the
  first product within 235px on a 360px phone, the desktop bar hides and returns with the header.
- New check 24 (`npm run check -- --only 24`), phone and desktop:
  - axe 0 violations with the page plain, a filter applied, the sheet open and the no-match state; also at 320px and 200% text
  - a price preset returns only pieces with an option in range; each sort changes the order and price sorts are in order
  - Load more adds cards with no repeats and moves focus; open a product and press Back: same cards, same scroll position
  - Back undoes the last filter, Forward redoes it; a reload shows the same state; Back never leaves a sheet stuck open
  - tabbing through the grid, no focused card is under a sticky or floating control
  - with JavaScript off, Apply and the links work
  - the free gift and test products never appear in any state; `collection.js` under 4 KB
- `npm run check -- --only 4,5,6,22,24 --quick`, then `npm run check:money` (prices on filtered, sorted and
  loaded cards equal the store's).
- Then Raushan's phone look before anything is pushed.

## Phase A result (2026-10-10): mock-ups and proposal, waiting for Raushan's go

Mock-ups are in `docs/mockups/collection-*.png`, drawn on the real page at `/collections/shop` by
`docs/mockups/collection-mock.js` (run through `tools/cdp.mjs --eval`). Measured on the mock-ups:

| Desktop, 1280px | Photos | Across | First product | Clicks to apply one filter | Verdict |
|---|---|---|---|---|---|
| **A. Slim bar of drop-downs** | 278px | 4 | 340px | 2 (open, pick); In stock is 1 | **Proposed** |
| B. Left sidebar | 288px | 3 | 329px | 1 | A whole column of products lost; the list is taller than the screen, mostly empty space |
| C. One Filter button + side panel | 278px | 4 | 340px | 3 (open, pick, close) | Cleanest closed, but hides what can be filtered and covers a third of the page |

| Phone, 360px | First product | Verdict |
|---|---|---|
| **A. Floating "Filter · Sort" pill** | 222px (274px with filters applied) | **Proposed.** Both controls are labelled, at the thumb, and the craft row keeps its full width |
| B. Filter pinned at the start of the craft row | 222px (274px) | Sort has no room for a label, and only one craft chip is left in view |

Found while mocking, to carry into the build:
- The craft row is wider than the page below about 1000px (five chips need about 790px), so it swipes up to 1099px, not only on phones.
- The bar's drop-downs and Sort fit one row at 768px (checked).
- The floating pill must step aside when the footer comes into view and in the no-match state, where it sat on the footer's links.
- With filters applied the first product moves 52px down (the chips row). Accepted: it only shows after the shopper filtered.

## As built (2026-10-10, after Raushan's go on desktop A and phone A)

Screenshots: `docs/mockups/collection-built-*.png`.

- **Files:** `theme/sections/collection.liquid` (rewritten), `theme/snippets/collection-filters.liquid` (new),
  `theme/assets/collection.js` (new, 3.2 KB gzipped), `theme/templates/collection.json` (craft row and price steps),
  `collections.*` strings, two icons (`filter`, `sort`), a `priority` option on `snippets/product-card`.
  The craft row lives in the section, not in its own snippet: it is 20 lines.
- **Measured:** 2 / 3 / 4 across; photos 278px at 1280 and 302px at 1440; first product at 225px on a 360px phone
  (239px at 320) and 342px on desktop.
- **Every filter choice is a link** (ticked with `aria-current`), not a checkbox, so it works without JavaScript and
  one script path handles filters, chips and "Clear all". "In stock only" is a link with `role="switch"`.
- **The floating pill is `position: sticky; bottom`** at the end of the section, not fixed: it rides the bottom of the
  screen while the list runs under it and comes to rest after the last product, so it never sits on the footer and
  needs no script. It comes before the products in the HTML. Saved and added-to-cart pop-ups sit above it (`--buybar`).
- **Sort on phones** is a real `<select>` lying unseen over "Sort", so the phone's own picker opens.
- **"Featured"** is whatever order the collection is kept in (the Shop collection's is "most relevant", craft
  collections are hand-ordered or best selling).
- **"In stock only" shows only while something is sold out.** A filter group with a single choice is hidden too.
- **The craft row swipes below 1100px.** Craft chips are ordinary page loads (each is its own collection page).
- **Back:** each filter, sort or "Clear all" is a history step (several choices in the open sheet are one). Coming
  Back from a product reloads the pages that "Load more" had added and returns to the same place.
- **Filtered or sorted pages carry `noindex, follow`** (`snippets/meta-tags`); their canonical was already the collection.
- **Search results are 4 across from 1100px too** (were 5 from 1280px), so search and collections still match.
- **Store data written (Admin API, read back):** metafield definitions `custom.occasion` ("Occasion") and
  `custom.motif` ("Flower & motif"), both lists of single-line text; 103 values on 54 products, made from the tags
  by `python3 tools/catalog-upload.py filters`. Nothing else on the products was touched; `products --force` now
  sends the same two fields. Tags stay the source of truth: after changing a tag, run `filters` again.
- **Not built:** the pill in "nothing matches" stays (it is the way back into the filters); a product with several
  sizes still matches a price range when any size does, and its card says "From ₹…" (Shopify's behaviour, left).
- **Checks:** new section 24 in `tools/check.mjs`, 25 checks (`npm run check -- --only 24 --quick`). On 2026-10-10:
  sections 4, 5, 6, 6b, 7, 22 and 24 in Chrome, 60/60; `npm run check:money` 10/10; the filter flow tried by hand
  in Safari's engine (iPhone) and Firefox. Theme check: nothing from these files.
- **Only Price shows as a filter until Raushan's admin step:** Apps → Search & Discovery → Filters → Add filter →
  Product type, then "Occasion" and "Flower & motif" (under Metafields). Occasion and Flower & motif then appear in
  the bar and the sheet by themselves; "Craft" appears on the gift and flower collections.

## Round 2 (2026-10-10, after Raushan's first look)

He saw one filter only, a Sort that looked unfinished, and the page scrolling when Sort was tapped.

- **Sort is our own list everywhere; the browser's drop-down is gone.** Phones: the pill's Sort opens a "Sort by"
  bottom sheet, the twin of the Filter sheet, with a tick on the order in use; a choice applies it and closes the
  sheet. Desktop: "Sort: Featured ▾" is a drop-down pill at the right of the bar with the same list. Each order is
  a plain link (the collection's own order has no `sort_by`), so there is no form or "Apply" button any more.
  In his desktop preview the native picker showed as a grey macOS menu over the photos.
- **The scroll jump:** `scroll-padding-bottom: 88px` on the page (so a focused card clears the pill) also applied
  to the pill, and a tap on the select inside it moved the page 354px. It is now `scroll-margin-bottom` on the
  cards' links and hearts. Check 24 taps Filter and Sort at the top, mid-list and the end and expects no movement.
- **Found on the way:** "Clear all" with a sort applied built a broken link (`/collections/shopsort_by=…`); fixed.
- **One filter only** is the store setting, not code: Raushan adds Product type, Occasion and Flower & motif in
  Search & Discovery → Filters himself (his choice, 2026-10-10); then Claude tests and tunes the groups.
- **Checks:** sections 4, 5, 22 and 24 in Chrome 42/42 (section 24 is now 27 checks); money 10/10.
  Screenshots: `docs/mockups/collection-built-sort-*.png`.
- **Filters switched on (2026-10-10):** Raushan installed Search & Discovery and added Craft (product type),
  Occasion and Flower & motif, all on OR. Craft and Flower & motif showed at once; Occasion was known to the
  storefront but had no values (Birthday gave 0 pieces) until `python3 tools/catalog-upload.py filters` re-saved
  the same values, about a minute later. If a metafield filter ever shows empty again, do that first.
  Tested on shop, bouquets, gift-sets, birthday-gifts and sunflowers at 320, 390, 768 and 1280px: two choices in a
  group widen the list (Anniversary 7, plus For him 17), a second group narrows it, the badge and chips count
  them, 0-count choices are dimmed and move to the end, four pills fit one row at 768px, the phone sheet scrolls
  inside itself with nothing under 44px, Back undoes, filtered pages are noindex, axe 0 violations. Craft is
  left out where the craft row shows (Shop and the craft collections). Section 24 27/27, sections 4, 5, 22 15/15,
  money 10/10. Screenshots: `docs/mockups/collection-built-filters-*.png`.

## Round 3 (2026-10-10): the crafts in the sheet, long groups

Raushan, looking at the phone sheet: the categories in the row above should be in the filter too, and linked; and
what happens to the sheet with too many options? He agreed to the recommendation below.

- **Craft is the sheet's first group** (Shop and the craft collections). On a phone the craft row scrolls away with
  the title while the Filter pill follows, so mid-list the sheet was the only control in reach and could not change
  craft. The group is the craft row again: the same links to the same collection pages, one at a time, a tick on
  the current one, the applied filters and sort riding along. No counts (the row has none, and the page only knows
  them for the collection it is on).
- **Linked, one mechanism.** Choosing a craft swaps the other collection in behind the open sheet: heading,
  description, count, craft row, bar, chips, list and the tab's title (the heading carries the server's full title
  in `data-doc-title`). One step back, like the other choices in the sheet. Shopify's product type filter stays
  hidden on these pages: ticking several crafts there would be a second system that disagrees with the row, and
  the craft collections are the pages search engines index.
- **Not on desktop:** the row sits directly above the bar there.
- **Long groups:** in the sheet, a list filter with more than 10 choices shows the 8 with the most pieces (and any
  ticked) plus "Show all N"; opened groups stay open while choices are made. Without JavaScript all show. Today's
  longest group has 10, so nothing folds yet; verified by lowering the limit to 4 for a test run, not in check 24.
- **Desktop drop-downs** have a height cap (26rem, less on short screens) and scroll inside.
- **Checks:** section 24 28/28 (new: the sheet lists the crafts, choosing one keeps the filters, the tab title
  matches the server's, Back undoes it, axe 0); sections 4, 5, 22 15/15; money 10/10; collection.js 3.7 KB
  gzipped (budget 4). Chrome only. Screenshot: `docs/mockups/collection-built-craft-sheet-390.png`.

## Round 4 (2026-10-10): tick lists instead of pill clouds

Raushan asked twice whether the sheet was the best way to handle filters ("think from scratch; accessibility,
intuitiveness, user friendly"). The first answer only polished the pills; the second started again from what a
shopper has to understand, and the weak point was the cloud of pills itself: 24 look-alike pills over 1.5
screens, nothing to tell "pick one" from "pick several", narrow targets read in zigzag.

- **One component on phone and desktop** (`snippets/collection-filters`): a list of rows, one choice per line,
  count at the end. Square tick boxes where several can be chosen (Occasion, Flower & motif, Craft as a filter),
  round radio buttons where it is one (Price, with "Any price" first; Craft in the sheet, with "All" first).
- **Phone sheet:** each filter is a row that opens, one at a time (`<details name>`), and its heading says what
  is applied ("Occasion · Birthday, For her") or "Any". All closed at first: the sheet is four rows and the
  button, at the bottom of the screen under the thumb. A group opened low scrolls itself into view.
- **Desktop:** the bar's pills are unchanged; their panels hold the same list (rows 44px, panel up to 31rem).
- **Accessibility:** choices are still plain links (no JavaScript needed) with `role="checkbox"` / `role="radio"`
  and `aria-checked`, in a named `group` / `radiogroup`. Space ticks, arrows move between radio buttons. Box
  border is taupe on white (about 4:1). Rows 48px in the sheet. At 200% text on a 320px phone nothing runs off
  the side (found and fixed: a minimum width meant for the desktop panel).
- **Cost accepted:** one more tap to reach a choice, and the choices are not all on show at once.
- **Not chosen:** the marketplace layout (names left, choices right: needs the full screen, breaks at large
  text), a row of filter buttons on the page (permanent space above the products), keeping the pills with a
  shorter Craft row and price labels (the first answer).
- **Checks:** section 24 30/30 in Chrome (new: the sheet opens short with one group at a time; tick boxes and
  radio buttons with Space and arrows, axe 0 with a group open); sections 4, 5, 22 15/15; money 10/10;
  collection.js 3.9 KB gzipped (budget raised from 4 to 4.5). By hand in WebKit and Firefox: tick, change craft,
  headings and the open group right in both. "Show all" for groups over 10 is still unexercised by real data.
  Screenshots: `docs/mockups/collection-built-r4-*.png`.
- **Optional, admin:** Search & Discovery → Filters → a filter → Values → Sort: Manual, to put occasions before
  "For her / For him" and flowers before the other motifs.

## Round 5 (2026-10-10): two columns, no counts, price bands that grow

Raushan's suggestions after round 4, each answered with a recommendation he accepted:

- **A range slider for price? No.** Prices run ₹49 to ₹499; shoppers think "under ₹200", not "₹137 to ₹412".
  Two-handle sliders are the hardest filter control on a touch screen, need their own keyboard and screen-reader
  work, an "Apply" step, and JavaScript. Radio bands need none of that.
- **Bouquets may reach ₹3,000 to ₹5,000**, so the bands grow with the prices. "Price steps" is now
  `200,400,1000,2000`. Only the bands in use show: one that starts above the collection's dearest piece is left
  out, and the last one shown has no upper end ("₹400 and above" today; with a ₹1,500 bouquet it becomes
  ₹400 to ₹999 and ₹1,000 and above). On Keychains today: Under ₹200, ₹200 and above.
- **Pills for the short groups? Two columns of tick rows instead.** His point was the wasted height (five tall
  rows that are mostly empty width). Pills save one more row but bring back what round 4 fixed (nothing shows
  which groups take several choices; two kinds of control in one sheet). In the sheet every list is now a
  two-column grid read down the first column, then the second; rows line up across. Craft 3 rows, Price 2,
  Occasion 3, Flower & motif 5: no group scrolls at 360 × 740. One column when the sheet is narrower than 17rem
  (large text on a small phone). Desktop drop-downs stay one column.
- **Do the numbers help? No, removed** (phone and desktop). The button already counts the result after each
  tap, empty choices are dimmed, the numbers mislead (Birthday 33 + For her 32 gives 47), and "Lily 2" undersells
  a small handmade catalogue. They were also why "Peacock feather" wrapped in a half-width cell.
- **Found on the way:** the "fewer than two choices" rule counted three matches per row (it split on
  `class="cf-row`, which also matched the name and count spans); it now counts the boxes.
- **Checks:** section 24 31/31 in Chrome (new: two columns read down first, no numbers, open group does not
  scroll; price bands in use only with the last open-ended); sections 4, 5, 22 15/15; money 10/10; axe 0 on phone
  and desktop. By hand in WebKit and Firefox: two columns, five aligned rows for Flower & motif.
  Screenshots: `docs/mockups/collection-built-r5-*.png`.

