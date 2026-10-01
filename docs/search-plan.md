# Search plan: icon, panel, results

Status: **Built 2026-10-02 (stages S-1, S-2, S-3 and the automated part of S-5).** Raushan approved every recommendation (S1–S8, §13). Still to do: the admin setup in §10 (S-4, Raushan), checking with real products, and a real-phone VoiceOver/TalkBack pass.

### As built (where it differs from the plan below)
- **One column in the panel, at every size.** The order is suggested phrases, products, collections, pages, then "See all", so the keyboard order always matches the reading order. The wider panel shows products 3 across. The two-column desktop layout in §6.2 was dropped: a separate left column put Tab order out of step with what you see.
- **"See all results for 'rose'" has no number.** Shopify's predictive search doesn't return a total, only the top few per type. The results page shows the count.
- **Theme settings → Search** has the Popular searches menu and the "Products to suggest" collection, which defaults to `bestsellers`, then `our-favourites`. These are global settings, so the panel and the results page share them.
- **The label is "Bestsellers"**, matching the menu (home-shop-plan).
- **Demo search:** while Demo content is on and the store has no products, the panel and the results page search the 8 demo products and 4 crafts (`snippets/search-demo`). It goes away by itself once real products exist. The demo panel can show 6 products even on phones; real search shows 4 there.
- **The custom-order card** opens WhatsApp once the number is set in Theme settings → Social; until then it links to /pages/contact ("Ask us").
- **The results page uses the Soft blush ground** (`scheme-soft`), like the home page. It has a hidden "Products" h2 so headings go h1 → h2 → card h3.
- **Opener size:** the open/close code in theme.js is 2.0 KB gzipped, not the ≤ 0.6 KB in §11. Opening, focus, Esc and click-away can't wait for search.js, or the phone keyboard won't open and the panel couldn't be closed offline. theme.js is now 23.1 KB of its 25 KB budget. search.js is 3.8 KB gzipped (budget 4 KB) and loads on first touch.
- **Files:** as §14. Also `snippets/search-field` (the shared pill), `snippets/search-panel` (the dialog), `snippets/search-demo`, and a `recent` icon. The search page gets `noindex, follow` in `snippets/meta-tags`.
- **Checks (2026-10-02):** theme check clean. `npm run check:quick` 26/26, with 9 new search checks: nothing loads before the panel opens, it opens with focus in the field, results appear as you type, axe passes with results showing, and Esc clears then closes, on phone and desktop, plus axe on the results page. Also checked in scratch scripts:
  - axe: 0 violations in every panel state and on the results, no-results and empty search pages
  - Tab order: field → clear → results → See all → Account; the panel closes once focus leaves it
  - arrow keys move through the results; ↑ from the first result returns to the field
  - every breakpoint (360/767 sheet; 768/1099/1280 pill; 1100/1279 own field); no sideways scroll
  - no JavaScript: the lens is a link to /search and the pill submits
  - forced colours; Firefox (desktop and phone); WebKit iPhone (opens focused, scroll locked)
  - sort in place updates the URL
- **Not tested yet:** "Load more" (needs more than 24 results), query suggestion chips and real collections/pages in the panel (both need real store data), real iOS keyboard opening and Android Back (real phones).

It expands `nav-plan.md` §7 (the search panel, Stage 4 there) and the Search line in `motion-plan.md` §5. Where they disagree, this plan wins (the changes are listed in §15).
It follows `motion-plan.md` (tokens, budgets, patterns), `brand-direction.md` (line icons, stitch marks) and the "products first" rule.

---

## 1. What exists today (as built 2026-10-02)

| Piece | Today |
|---|---|
| Header, phone (< 768px) | 28px lens icon, an `<a href="/search">`. Tapping it loads the plain `/search` page |
| Header, tablet (768–1099px) | A real `<form action="/search">` pill with a field. Enter loads `/search` |
| Header, small desktop (1100–1279px) | 28px icon link, same as the phone |
| Header, wide desktop (≥ 1280px) | The form pill again |
| The form | Sends `q` and `options[prefix]=last` (so "bouq" finds "bouquet"). Works with no JavaScript |
| `/search` page | Skeleton's starter: unstyled H1, a 50-wide field, a basic grid, default pagination. Mixes products, pages and articles with no product cards |
| Phone drawer | No search row |
| JSON-LD | `WebSite` with a `SearchAction` to `/search?q=` (home page). Stays as it is |

What's missing: results as you type, anything useful before typing, a designed results page, a no-results path, and search tuning (synonyms, product data).

---

## 2. Goals

1. **Find a product in two taps on a phone:** tap the lens, type 3–4 letters, tap a product. No page load in between.
2. **Never a dead end:** before typing there are suggestions, and "no results" always offers a next step (popular crafts, bestsellers, a custom order on WhatsApp).
3. **Accessible to everyone:** keyboard and screen reader first-class, WCAG 2.2 AA, plain links (not an ARIA combobox, as decided in nav-plan §7).
4. **Fast and light:** 0 KB of search JS on page load beyond a tiny opener; the rest loads on first touch of search. INP < 150ms while typing.
5. **Works without JavaScript:** the form still submits to `/search`, and that page is a complete experience.
6. **Speaks the shopper's words:** "keyring" finds keychains, "hairclip" finds hair clips, "phool" finds bouquets (synonyms, §10).

---

## 3. How Shopify search works (the parts we use)

Three Shopify pieces, all free, no third-party app:

1. **Storefront search, `/search?q=…`.** Shopify runs the search and the theme gets a `search` object in Liquid: `search.results`, `search.results_count`, `search.terms`, `search.sort_options`, `search.filters`. This is the results page (§8).
2. **Predictive search, `/search/suggest`.** Built for "as you type". You call it with the typed text and a `section_id`, and Shopify returns **that section rendered as HTML** with a `predictive_search` object in it: `.resources.products`, `.collections`, `.pages`, `.articles` and `.queries` (suggested search phrases). So all the markup stays in Liquid; the JS only swaps HTML in.
   - Useful options: `resources[limit]` (up to 10 per type), `resources[limit_scope]=each`, `resources[options][unavailable_products]=last` (sold-out items go to the end), `resources[options][fields]=…` (which product fields to match).
   - It has built-in typo tolerance on longer words ("bouqet" still finds bouquets).
   - It only finds products that are **published to the Online Store sales channel**.
3. **Search & Discovery app (made by Shopify, free).** Adds **synonyms**, **product boosts** (push a product to the top for a word), and **filters on the search page**. Set up in the admin, no code (§10).

Liquid has a `highlight` filter: `{{ product.title | highlight: terms }}` wraps the matched letters in `<strong class="highlight">`. We use it to bold what the shopper typed.

---

## 4. The search icon

The glyph stays as redrawn in nav-plan §4.2: lens r = 7 centred at 10.5, 10.5, a 6px handle at 45°, 1.8 stroke, 28px glyph in a 48px target, Cocoa Deep, inline SVG (0 requests).

### 4.1 Where it appears

| Place | Size | Role |
|---|---|---|
| Header icon (phone, 1100–1279px) | 28px glyph, 48px target | Opens the search panel. Name: "Search" |
| Inside the header pill (tablet, ≥ 1280px) | 22px, 13px from the left edge | Decoration only (`aria-hidden`); the field has the label |
| Inside the panel's field (phone sheet, 1100–1279px panel) | 22px, left | Decoration only |
| Phone menu drawer, new "Search" row | 20px + 16px word, 48px row | Opens the same panel (closes the drawer first). For shoppers who look for search in the menu |
| Results page field | 22px, left | Decoration only |

### 4.2 States

| State | Look |
|---|---|
| Rest | Cocoa Deep lens |
| Hover (mouse only) | Cocoa 8% circle behind; lens tilts −10° (exists) |
| Pressed | scale .94 for 120ms (exists) |
| Keyboard focus | The site focus ring (2px Cocoa + soft Rose halo) |
| Panel open (1100–1279px icon) | The Cocoa 8% circle stays on, `aria-expanded="true"`. The lens doesn't turn into an ×; the panel has its own close |
| On `/search` | Filled lens (`.icon__fill`, exists), `aria-current="page"` |
| Forced colours | `currentColor`, follows system colours |

### 4.3 Link today, button with JavaScript

Without JS, the icon must be a link to `/search` (it works everywhere). With JS, it opens a panel, so it should be a **button** with `aria-expanded` and `aria-controls`. A link that secretly opens a panel is announced wrongly ("link") by screen readers.

So the header ships **both**, in the same spot and the same size: the `<a>` (visible) and a `<button hidden>`. `theme.js` swaps them at start-up (unhides the button, hides the link). Same box, so no layout shift.

### 4.4 Inside the field: clear and submit

- **Clear (×):** our own 48px button with the name "Clear search", shown only when there's text. The browser's built-in clear cross is hidden (`::-webkit-search-cancel-button`) because it's tiny, looks different per browser and has no name in some screen readers.
- **Submit:** Enter (or the keyboard's blue "Search" key on phones, from `enterkeyhint="search"`). No separate arrow button: the lens isn't a button, and a "See all results" link sits in the panel.
- **No "/" keyboard shortcut.** A one-key shortcut breaks WCAG 2.1.4 for speech-input users, and shoppers don't know it.

---

## 5. Search panel: phone (< 768px)

A **full-screen sheet** (a native `<dialog>`, opened with `showModal()`). Full screen because the keyboard takes half the screen; a small dropdown would leave room for one result.

### 5.1 Opening

1. Tap the lens (or the drawer's "Search" row).
2. The sheet slides down 12px and fades in (`--dur-panel` 320ms, `--ease-out`). The page behind is inert, and `<html>` stops scrolling.
3. **The field gets focus in the same tap, so the keyboard opens at once.** iOS only opens the keyboard if `focus()` runs inside the tap handler itself. So the sheet's HTML is already in the page (hidden), and the tiny opener in `theme.js` calls `showModal()` and `focus()` straight away. The bigger search module (results, fetching) loads afterwards (§11). It must never be `await import(...)` first, then focus.

### 5.2 Layout

```
┌───────────────────────────────────────┐
│ Search                        Cancel  │  "Search" is the field's visible <label>; Cancel is a 48px text button
│ ┌───────────────────────────────┐     │
│ │ ⌕  Bouquets, keychains…    ✕ │     │  52px tall, 16px text (stops iOS zooming in), white, Cocoa 75% border
│ └───────────────────────────────┘     │
│───────────────────────────────────────│  results area scrolls on its own; the field row stays put
│                                       │
│   (content: §5.3 – §5.6)              │
│                                       │
└───────────────────────────────────────┘
```

- Ground: Soft blush, like the page. The field is a white pill with the same border as the header pill.
- Field attributes: `type="search"`, `name="q"`, `enterkeyhint="search"`, `autocomplete="off"`, `autocapitalize="off"`, `autocorrect="off"`, `spellcheck="false"`.
- The sheet is a real `<form action="/search">` with `options[prefix]=last`, so Enter always lands on the results page.
- **Keyboard out of the way:** when the shopper starts scrolling the results, the field blurs and the keyboard closes, so they can see more products. Tapping the field brings it back.

### 5.3 Before typing

```
│ RECENT                         Clear │   only if this browser has searched before (max 4)
│ ⟲ rose bouquet                       │   48px rows; each is a link to /search?q=…
│ ⟲ bee keychain                       │
│                                       │
│ POPULAR                               │
│ (Bouquets) (Keychains) (Hair clips)   │   chips, 40px tall, wrap onto 2 lines max
│ (Gifts under ₹499) (Bag charms)       │
│                                       │
│ BESTSELLERS                           │
│ ┌────┐ ┌────┐                         │   4 product cards, 2 per row (the normal card,
│ │    │ │    │                         │   smaller), photos load only when the sheet opens
│ └────┘ └────┘                         │
```

- **Recent searches** are stored only in this browser (`localStorage`, wrapped in try/catch, max 4, newest first, no duplicates). Saved when the shopper submits or taps a result. "Clear" wipes them. Nothing is sent anywhere.
- **Popular** comes from a Shopify menu called **"Popular searches"** (Content → Menus), so Raushan can change it without a deploy (decision S5). Each item links to a collection or a `/search?q=` URL. While demo content is on and the menu is empty, demo chips show.
- **Bestsellers** come from a collection chosen in the header's settings (default: Bestsellers). This is the "show products fast" rule: the sheet is never just text.

### 5.4 While typing (2+ characters)

```
│ (rose bouquet) (rose keychain) (red…  │   up to 3 suggested phrases, one scrolling row of chips;
│                                       │   the typed part is plain, the rest bold
│ PRODUCTS                              │
│ ┌──┐ Red **Rose** Crochet Bouquet     │   64px square photo (Oat frame), name in Jost 15px,
│ │  │ ₹1,199                           │   price below; matched letters bold. Whole row is the link,
│ └──┘                                  │   at least 72px tall
│ ┌──┐ Pink **Rose** Hair Clip Set      │
│ │  │ ₹349   Sold out                  │   sold-out items last, with a small badge
│ └──┘                                  │
│ … up to 5 products                    │
│                                       │
│ [  See all 12 results for "rose"  → ] │   full-width outline button
│                                       │
│ COLLECTIONS                           │
│ Bouquets                            → │   text rows, 48px
│ PAGES                                 │
│ Shipping & delivery                 → │   help pages, so "shipping" or "return" gets an answer
```

Order on phones: **products first** (after one short row of phrase chips), because seeing products is the point. Collections and pages come after "See all".

### 5.5 No results

```
│ No matches for "teddy".               │
│ Check the spelling, or try a craft:   │
│ (Bouquets) (Keychains) (Hair clips)   │
│                                       │
│ ┌───────────────────────────────────┐ │   Blush panel with the stitched border (brand pattern)
│ │ 🧶 Can't find it? We make custom   │ │
│ │    pieces by hand.                 │ │
│ │ [ Ask on WhatsApp ]                │ │   wa.me link with "Hi! I searched for 'teddy'…" pre-filled
│ └───────────────────────────────────┘ │
│ BESTSELLERS (4 cards)                 │
```

Handmade means a missing product can often still be made, so "no results" becomes a sale path (decision S4). The WhatsApp card only shows once the number is set in Theme settings → Social.

### 5.6 Loading and errors

- **No spinner.** While the next results load, the current ones stay and dim to 60%, and the list gets `aria-busy="true"`. New results cross-fade in (150ms). Photos fade in as they arrive, on an Oat placeholder.
- **First load:** a "Searching…" line (in the status region) only if nothing arrives within 400ms.
- **Network failure or timeout (5s):** "Couldn't load suggestions. Press Search to see all results." Enter still works because it's a normal form.

### 5.7 Closing

- Cancel, Esc, or Android's back gesture (Chrome on Android closes a modal `<dialog>` on back by itself).
- Tapping a result closes the sheet instantly and navigates (no exit animation in the way).
- Focus returns to the lens button. The typed text is kept until the page changes, so reopening shows the same results.
- Exit: fade + 8px rise, about 220ms. Reduced motion: appears and disappears with no movement.

---

## 6. Search panel: tablet and desktop (≥ 768px)

A **dropdown panel** under the header, **non-modal** (focus isn't trapped; the page behind dims with a click-to-close scrim). This feels lighter than a full-screen takeover on a big screen.

### 6.1 Which field it hangs from

| Width | Field | Panel |
|---|---|---|
| 768–1099 (tablet) | The header pill (exists) | Opens when the pill gets focus. Full width of the header's content area, max 720px, below the header |
| 1100–1279 | No pill; the lens button | Opens on click. **The panel has its own field at the top**, which gets focus |
| ≥ 1280 | The header pill (exists) | Opens when the pill gets focus. 720px wide, its right edge lined up with the pill's right edge |

It's one panel component. A `data-own-field` flag shows or hides its own field depending on whether the header pill is visible. One component means one set of behaviour to test.

### 6.2 Layout while typing

```
┌───────────────────────────────────────────────────────────────────────┐
│ [logo]  SHOP ▾  GIFTS ▾  BESTSELLERS  OUR STORY  HELP ▾  [⌕ rose      ✕]  👤  Cart ② │
└───────────────────────────────────────────────────────────────────────┘
          ┌───────────────────────────────────────────────────────────┐
          │ SUGGESTIONS          │ PRODUCTS                            │
          │ rose **bouquet**     │ ┌──────┐ ┌──────┐ ┌──────┐          │
          │ rose **keychain**    │ │photo │ │photo │ │photo │          │  3 × 2 grid of small cards:
          │ red **rose**         │ │      │ │      │ │      │          │  1:1 photo, name (2 lines max),
          │                      │ └──────┘ └──────┘ └──────┘          │  price. Up to 6 products
          │ COLLECTIONS          │  Red Rose  Pink Rose  Rose Pot       │
          │ Bouquets             │  ₹1,199    ₹349       ₹899           │
          │ Gifts                │ ┌──────┐ ┌──────┐ ┌──────┐          │
          │                      │ │      │ │      │ │      │          │
          │ PAGES                │ └──────┘ └──────┘ └──────┘          │
          │ Care guide           │                                      │
          ├───────────────────────────────────────────────────────────┤
          │ See all 12 results for "rose"                           → │  full-width footer row
          └───────────────────────────────────────────────────────────┘
```

- White surface, 16px radius, the soft shadow used by dropdowns, a 1px Blush line between the columns.
- The left column is 200px; the product grid takes the rest. Photos are 1:1 crops in the Oat frame, 160px wide images for sharp 2x.
- Panel height is capped at `100dvh − header − 32px`; the inside scrolls if needed (rare with 6 products).
- On tablet (narrower), the grid is 2 × 3 instead of 3 × 2.

### 6.3 Before typing

Same content as the phone (§5.3), arranged across: Recent and Popular in the left column, 4 bestseller cards in a row on the right.

### 6.4 No results

The left column shows "No matches for 'teddy'" and the Popular chips; the right side shows the WhatsApp custom-order card and 3 bestsellers.

### 6.5 Opening and closing

- Opens: fade + 8px drop, `--dur-panel`, scrim fades to Cocoa 20%.
- Closes on: Esc (focus returns to the field or the lens), a click on the scrim, focus leaving both the header and the panel, or following a result.
- The header doesn't hide on scroll while the panel is open (it already never hides while it holds focus).
- An open menu dropdown closes when search opens, and the other way round. Only one panel at a time.

---

## 7. Keyboard and screen reader (both sizes)

**Pattern: a search field followed by a list of normal links, plus a polite status line.** This is the nav-plan §7 decision. The ARIA combobox pattern is skipped because iOS VoiceOver support for it is still uneven, and plain links behave the same everywhere.

| Key | In the field | In the results |
|---|---|---|
| Typing | Updates results after a short pause | — |
| ↓ | Moves focus to the first result (a nicety on top of Tab) | Next result |
| ↑ | — | Previous result; from the first result, back to the field |
| Tab / Shift+Tab | Normal order: field → clear → results → See all | Normal order |
| Enter | Submits to `/search` | Follows the link |
| Esc | Clears the text if any; if empty, closes the panel | Closes the panel, focus back to the field |

- **Status line** (`role="status"`, visually hidden): "5 products, 1 collection, 1 page." It's announced once typing has paused about 1 second, not on every keystroke, so the screen reader doesn't chatter. With no results: "No matches for teddy."
- Each section has a visible heading (`<h2>` inside the panel: Products, Collections…), so screen-reader users can jump by heading.
- Product links read as one phrase: "Red Rose Crochet Bouquet, ₹1,199" (and "sold out" where it applies). Photos are `alt=""` because the name is already in the link.
- The bold matched letters are `<strong>`, which screen readers ignore, so names aren't read in pieces.
- Phone sheet: `<dialog aria-labelledby>` pointing at the "Search" label. Desktop panel: a `<div role="region" aria-label="Search suggestions">`.
- Targets: every row and chip is at least 48px (chips 40px tall but spaced to a 48px pitch, which meets WCAG 2.5.8).
- Text spacing, 200% zoom and 320px width all work; at 400% zoom the phone sheet is used (it goes by width).
- Forced colours: chips and cards get `CanvasText` borders; the bold match stays bold.
- Reduced motion: no slide, no cross-fade; content swaps instantly.

---

## 8. Results page (`/search`)

This is where Enter goes, where "See all" goes, and the whole experience for anyone without JavaScript. It **reuses the collection page's grid, product card, sort and "Load more"** (build-plan Phase 3), so both pages look and behave the same.

### 8.1 Phone

```
┌───────────────────────────────────────┐
│ header                                │
├───────────────────────────────────────┤
│ Search                                │  H1, Cormorant
│ ┌───────────────────────────────┐     │
│ │ ⌕  rose                     ✕ │     │  same field as the panel; not auto-focused on load
│ └───────────────────────────────┘     │  (so screen readers start at the top and the keyboard stays shut)
│ 12 results for "rose"                 │
│ (Bouquets 7) (Keychains 3) (Clips 2)  │  craft chips with counts = quick filter (product type)
│ Sort: Relevance ▾                     │
│ ┌────────┐ ┌────────┐                 │
│ │ card   │ │ card   │                 │  the normal product card, 2 per row, as on collections
│ └────────┘ └────────┘                 │
│ …                                     │
│ [ Load more ]  Showing 12 of 12       │
│                                       │
│ HELP & STORIES                        │  pages and blog posts that matched, as text rows
│ Caring for crochet flowers          → │
└───────────────────────────────────────┘
```

### 8.2 Desktop

Same order. The field and the count sit in a row, sort on the right. 4 cards per row (3 from 768px). "Help & stories" is a two-column list under the grid.

### 8.3 How it's built

- One Shopify search returns products, pages and articles together. The section loops over `search.results` once and sorts them into two lists: products into the card grid, pages and articles into "Help & stories". The page size is 24, which is plenty for a 15–25 product catalogue.
- **Sort:** Relevance, Price low to high, Price high to low, Newest. From `search.sort_options`, sent as `sort_by`.
- **Craft chips:** from the search filters (`search.filters`, product type) once Search & Discovery is set up (§10). Each chip is a link, so it works without JS; with JS it updates the grid in place (the collection page's Section Rendering pattern and grid reflow).
- **Load more,** not infinite scroll (same as collections: keeps the footer reachable and focus sane). Focus moves to the first new card.
- The search terms stay in the header pill and in the page field.
- Empty `/search` (no `q`): the field, Popular chips and Bestsellers. It's the same "before typing" content as the panel.

### 8.4 No results page

"No matches for 'teddy'." Then: tips in one line ("Try fewer words, or a craft name"), Popular chips, the WhatsApp custom-order card, and 4 Bestsellers. Same pieces as the panel's no-results state.

### 8.5 SEO

- Search pages must not be indexed (endless thin pages). Shopify's default `robots.txt` already blocks `/search`, and we don't override it. We also add `<meta name="robots" content="noindex, follow">` on the search template as a backup. **SEO-sensitive: flagged for Raushan's approval.**
- The `SearchAction` JSON-LD on the home page stays (it points at `/search?q=`, which keeps working).
- The page `<title>`: "Search: rose – Yarn Basket", or "Search – Yarn Basket" with no terms.

---

## 9. The predictive search section (what Shopify renders for us)

New file `theme/sections/predictive-search.liquid`. It's never placed on a page; it's only rendered by `/search/suggest`.

The JS calls:

```
{{ routes.predictive_search_url }}?q=rose
  &resources[type]=product,collection,page,query
  &resources[limit]=6                (4 on phones, set by the JS)
  &resources[limit_scope]=each
  &resources[options][unavailable_products]=last
  &resources[options][fields]=title,product_type,variants.title,tag
  &section_id=predictive-search
```

- **Matched fields:** title, product type, variant titles (colours, sizes) and tags. **Not the description at first:** every description says "gift" and "handmade", so a description match would bring back everything. We test with real products and add `body` only if useful.
- The section renders the layout in §5.4 / §6.2 (CSS decides phone vs desktop), the "See all N results" link and the status text (in a `data-` attribute the JS reads).
- Products use a small `search-result` snippet (photo, highlighted name, price via the existing `price` snippet, sold-out badge), not the full card. That keeps the response small (about 3–5 KB of HTML).
- Articles are added to `resources[type]` once the blog exists (Phase 6).

---

## 10. Making search find the right things (admin, Raushan)

Good search depends on product data more than on code. This is the setup checklist, done in the admin when real products go in.

1. **Install Search & Discovery** (Shopify's own app, free).
2. **Synonyms** (Search & Discovery → Synonyms). Starting groups, to grow from the "searches with no results" report:
   - keychain, keyring, key chain, key ring
   - bouquet, flowers, flower bouquet, phool, guldasta
   - hair clip, hairclip, hair pin, claw clip, barrette, hair accessory
   - bag charm, bag hanging, purse charm, bag keychain
   - soft toy, amigurumi, plush, stuffed toy, teddy
   - gift, present, tohfa
   - crochet, knitted, woollen, handmade
3. **Product data conventions** (written down so every new product follows them):
   - **Title:** what it is first, in shoppers' words: "Red Rose Crochet Bouquet", "Bee Crochet Keychain".
   - **Product type:** exactly one craft: Bouquet, Keychain, Hair clip, Bag charm (also used for the craft chips).
   - **Tags:** occasion (birthday, anniversary, valentines, mothers-day, rakhi), flower or motif (rose, sunflower, tulip, bee), colour, and `bestseller` / `new` (already used by the card badges).
   - **Variant names:** plain colours ("Red", "Pink"), not codes.
4. **Product boosts:** boost the top 1–2 bestsellers for the craft words (e.g., "bouquet").
5. **Search filters:** turn on Product type and Availability for the search page (feeds the craft chips in §8.3).
6. **Popular searches menu:** Content → Menus → "Popular searches", 4–6 links (feeds §5.3).
7. **Every product published to the Online Store channel** (or it won't appear in predictive search).

After launch, check monthly: Analytics → Reports → "Top online store searches" and "Top online store searches with no results". Every no-result search gets a synonym, a tag, or a new product idea.

---

## 11. Performance

| Item | Budget / approach |
|---|---|
| JS on page load | Only the opener in `theme.js` (open/close, focus, swap link → button): **≤ 0.6 KB gzipped** |
| Search module `search.js` | **≤ 4 KB gzipped**. Loaded on the first `pointerenter`, `touchstart` or `focus` on any search control (warm-up), so it's usually ready before the first letter. Its URL comes from Liquid (`asset_url`) through a `data-` attribute |
| Typing | 150ms debounce (`motion-plan.md` value; nav-plan's 200ms is superseded). 2+ characters. The previous request is cancelled (`AbortController`) |
| Cache | Responses cached in memory by "text + limit" for the visit: backspacing is instant and costs no request |
| Rendering | HTML swapped in one `replaceChildren` inside `requestAnimationFrame`; no work in the input handler except starting the timer. INP target < 150ms on a mid Android |
| Images | `image_url: width: 160` (phone 64px and desktop ~150px at 2x), WebP from Shopify's CDN, `loading="lazy"`, fixed square boxes so nothing jumps |
| Before-typing content | In the page HTML (about 2 KB), but its photos load only when the panel opens (lazy images inside a hidden panel don't load) |
| CLS | 0. The panel overlays the page; the header doesn't change size |
| Results page | Same budgets as the collection page (LCP < 2.0s, first row of photos `eager`) |
| Lite mode | No cross-fades, no photo fade-in; results simply appear |

---

## 12. Analytics

- **Shopify admin reports** (built in): top searches, and searches with no results. This is the main tuning tool (§10).
- **Shopify customer events:** a `search_submitted` event fires for searches, which Shopify's own analytics and pixels use.
- **GA4** (when added at launch): enhanced measurement already reads the `q` parameter on `/search`, so results-page searches are counted with no code.
- **Panel clicks** (someone picks a result without pressing Enter) don't reach `/search`. We add a tiny `search-panel` customer event (the term and the picked item type) only if Raushan wants that detail. Decision S7.

---

## 13. Decisions for Raushan

**Answered 2026-10-02: all recommendations accepted.**

| # | Question | Options | Recommendation |
|---|---|---|---|
| S1 | What does search look through? | (a) Products only · (b) Products + collections + help pages (+ blog later) | **(b).** People search "shipping", "return", "custom". Products always come first |
| S2 | Phone panel style | (a) Full-screen sheet · (b) Small dropdown under the header | **(a).** The keyboard takes half the screen; a dropdown would show about one result |
| S3 | What shows before typing? | (a) Popular chips only · (b) Recent + Popular + 4 Bestsellers | **(b).** Products on screen at once, in line with "show products fast" |
| S4 | No-results next step | (a) Popular chips only · (b) Chips + "We make custom pieces, ask on WhatsApp" + Bestsellers | **(b).** A handmade shop can turn a miss into a custom order. Needs the WhatsApp number |
| S5 | Where Popular searches come from | (a) A "Popular searches" menu in the admin · (b) Fixed in the theme | **(a).** Change them any time with no deploy |
| S6 | Results page at launch | (a) Sort + craft chips · (b) Full filter drawer (price, colour, occasion) | **(a)** at launch. Add (b), shared with collections, once the catalogue passes ~40 products |
| S7 | Track picks from the panel | (a) Admin reports + GA4 only · (b) Also a custom event for panel clicks | **(a)** for launch. Add (b) if the reports leave questions |
| S8 | Search & Discovery app | Install it (free, by Shopify) or not | **Install.** Synonyms alone are worth it for Hinglish and spelling variants |

---

## 14. Build stages

Each stage ends with theme check clean, axe 0 violations (360, 390, 768, 1100, 1280, 1440px) and screenshots for Raushan.

| Stage | What | Depends on |
|---|---|---|
| **S-1 Results page** | Rebuilt `sections/search.liquid`: field, count, product-card grid, Help & stories, sort, Load more, empty and no-results states, noindex meta. Works with no JS | Collection page grid and card (build-plan Phase 3); a few real products |
| **S-2 Panel shell** | Phone sheet and desktop panel, link → button swap, drawer "Search" row, before-typing content (Recent, Popular menu, Bestsellers), open/close/focus/Esc/back, motion, scrim. Enter goes to `/search` | S-1 |
| **S-3 Live results** | `sections/predictive-search.liquid`, `snippets/search-result.liquid`, `assets/search.js`: fetch, debounce, cancel, cache, highlight, arrow keys, status line, loading and error states, no-results with WhatsApp | S-2; ~10 published products with types and tags |
| **S-4 Tuning (Raushan, admin)** | §10 checklist: app, synonyms, product data, boosts, filters, Popular searches menu. Then craft chips on the results page | Real catalogue |
| **S-5 QA** | Keyboard pass with screenshots; VoiceOver on iPhone and TalkBack on Android (Raushan, real phone); iOS keyboard opening; Android back; slow 3G and offline; 4x CPU INP; forced colours; reduced motion; lite mode; 20 real queries checked by hand ("keyring", "bouqet", "rose", "gift under 500", "shipping"…) | S-1 to S-4 |

### Files

| File | Change |
|---|---|
| `theme/sections/header.liquid` | Hidden search button next to the link; the panel/sheet markup; drawer "Search" row; settings: Bestsellers collection, Popular searches menu |
| `theme/sections/search.liquid` | Rebuilt results page (§8) |
| `theme/sections/predictive-search.liquid` (new) | What `/search/suggest` renders (§9) |
| `theme/snippets/search-result.liquid` (new) | One compact product result |
| `theme/snippets/search-start.liquid` (new) | The before-typing and no-results blocks, shared by the panel and the results page |
| `theme/assets/search.js` (new) | Fetch, debounce, cache, keys, status, recent searches |
| `theme/assets/theme.js` | Opener only: swap link → button, open/close, focus, warm-up loading of `search.js` |
| `theme/assets/base.css` | Field, chips, panel, sheet, result rows; hide the native clear button |
| `theme/locales/en.default.json` | All new strings (labels, counts, no-results, WhatsApp message with the search term) |
| `theme/templates/search.json` | Unchanged (one section) |
| `tools/` | Add search scenarios to `npm run check` (open panel, type, axe with results showing) |

---

## 15. Changes to earlier plans

- **nav-plan §7:** replaced by this plan. Debounce is 150ms (not 200). The phone panel slides down 12px and fades (not a long slide from the top). The desktop panel is 720px (not 640) to fit a 3 × 2 product grid.
- **nav-plan §5 / as-built:** unchanged. The header pill stays a real form; this plan adds the panel on top.
- **motion-plan §5 Search:** unchanged in spirit; the details are here.
