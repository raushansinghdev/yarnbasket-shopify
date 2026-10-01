# Home page: "Shop by craft" and "Bestsellers" plan

Status: **built 2026-10-02 (direction B).** Raushan approved the recommendations: D1 merge, D2 "Our favourite makes" with a "Favourites" first circle, D3 "Ships in X days" on cards, D4 quick add later. D5 (is Flower pots a launch category?) is still open. Pots stays on the home page for now, and disappears automatically if it never gets products.

### As built
- **`sections/shop-crafts.liquid`** replaces `collection-list` and `featured-products` on the home page. Both old files remain for other pages; `.product-grid` moved to `base.css`.
- **Phone circles** are 72px in a swipe row with **4½ visible**. Six won't fit at 5½ as the plan said.
- **First product on a 390 × 844 phone: 1,304px**, down from 1,489 (−185px). The plan estimated about 1,250; the rest is the section's top padding, which is shared with every section.
- **Demo:** the Favourites circle shows one bouquet, keychain, hair clip set and bag charm. Each craft shows its matching demo products; some crafts have only one, which is fine until real products exist.
- **The "Ships in" line uses the metafield `custom.ships_in_days`.** Raushan still needs to add the definition (Settings → Custom data → Products → Add definition: name "Ships in days", namespace and key `custom.ships_in_days`, type Integer) and fill it per product.
- **Checks:**
  - theme check: clean
  - axe: 0 at 390, 768 and 1440, before and after switching
  - Tab reaches every circle, and the focus ring shows
  - with JavaScript off, every craft is listed under its own heading
  - `npm run check`: 25/25 in Chrome, Safari and Firefox (phone images on first load 696 KB, so hidden crafts' photos don't load early)
- **`tools/cdp.mjs`** gained `--no-js`.
Sections: `sections/collection-list.liquid` (Shop by craft), `sections/featured-products.liquid` (Bestsellers), `snippets/product-card.liquid`.
It follows `motion-plan.md` (arrivals, budgets), `nav-plan.md` (the Shop menu now shows the same crafts) and the UX-first rule: the shopper should see what we sell, fast.

---

## 1. What's wrong today (measured 2026-10-02, 390 × 844 phone and 1440 × 900 desktop, demo content)

### Shop by craft

| # | Problem | Measured / seen | Why it matters |
|---|---|---|---|
| C1 | The circles are tiny on phones | 87px photos; 3⅓ of 5 visible; Bag charms and Flower pots sit off-screen behind a sliver | You can barely see the product in an 87px circle. The two hidden crafts are easy to miss |
| C2 | The section is tall for what it does on desktop | 655px of screen for 5 links; the circles crop products (the keychain and bag charm are cut off) | That's a lot of page for navigation alone, and the crop hides the craft |
| C3 | The heading says nothing | "Made stitch by stitch" | Headings should say what's below (WCAG 2.4.6). Shoppers scan headings |
| C4 | The taglines are decoration | "Flowers that never fade", 14px, hidden on phones | They don't help anyone decide. A starting price or item count would |
| C5 | Names don't match the menu | "Hair accessories" and "Flower pots" here; "Hair clips" in the menu, and no Flower pots there | The same thing under two names makes people wonder if they're different (WCAG 3.2.4 spirit) |
| C6 | "Hair accessories" wraps to two lines on phones | The row's labels end up uneven | It looks untidy, and the row jumps |
| C7 | It now repeats the header | The new Shop menu shows the same crafts with photos on every page | Two navigation blocks in a row on the home page; neither shows a product |
| C8 | There's no "Shop all" | — | It's a dead end if your craft isn't one of the five |

### Bestsellers

| # | Problem | Measured / seen | Why it matters |
|---|---|---|---|
| B1 | Products come late on phones | The first card starts at 1,489px: 1.76 screens down, 476px after the hero ends | That breaks our own rule. Two navigation-ish blocks sit between the hero and the first price |
| B2 | "Bestsellers" isn't true yet | Before launch nothing has sold. The rule in `decisions.md` is "no invented content" | Saying it when it isn't true costs trust. The "Bestseller" badge inside a "Bestsellers" section also says the same thing twice |
| B3 | The picks look the same | 3 of 4 demo cards are bouquets in black wrap | It reads as a bouquet shop and hides keychains, clips and charms |
| B4 | The card answers only "what" and "how much" | A title and a price, nothing else | For handmade gifts the next questions are "when will it arrive?" and "what colours?". The card doesn't answer them, so people tap in and back out |
| B5 | Badges are tiny | 11px, uppercase, `.14em` tracking | Hard to read. Below our 12px floor for labels |
| B6 | The card's link name starts with the badge | A screen reader says "Bestseller, Sunflower Trio Crochet Bouquet, ₹1,299" | The product name should come first. The badge is extra |
| B7 | "View all" is missing in demo | The link only shows when a collection is set | You can't test the full section until real products exist |
| B8 | The product names are 18px Cormorant italic, wrapping to 2 lines on phones | — | It's fine at this size, but it's the limit. Don't go smaller, and don't add a second serif line |

What already works and stays:
- 4:5 photos and the 2-column phone grid. You see four products in about one screen
- the second photo on desktop hover
- the quiet sale price
- `alt=""` on craft photos (the name is the link text)
- h2/h3 order
- the arrival animations from the motion plan

---

## 2. Two directions

### A. Refine both (lower risk)
Keep two sections and fix the list above in each: bigger circles on phones, a clear heading, matching names, an honest product heading, better cards. **First product on a phone: about 1,330px** (it saves about 160px).

### B. Merge them into one "Shop" section (recommended)
The craft circles become **filters for the product grid right below them**, like tapping an Instagram story highlight to see what's in it (the brand kit's highlights are exactly these circles).

```
           SHOP BY CRAFT
       Our favourite makes                  ← describes the section
 (All) (Bouquets) (Keychains) (Hair clips) (Bag charms) (Pots)   ← circles = filters
 ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
 │photo │ │photo │ │photo │ │photo │       ← 4 products for the chosen craft
 └──────┘ └──────┘ └──────┘ └──────┘
          See all 12 bouquets →            ← a real link to the collection page
```

**Why B:**
1. **Products come sooner.** One heading instead of two, and the circles shrink into a compact row. First product on a phone: **about 1,250px** (it saves about 240px; §5).
2. **Every craft shows its own products without leaving the home page.** With a 15–25 product launch range, 6 tabs × 4 products covers most of the shop.
3. **No more double navigation.** The header's Shop menu already takes you to collection pages. The home page shows products instead.
4. **One section fewer** (9 → 8), so the page is calmer. That matches "uncluttered by rule".
5. **SEO keeps its internal links.** Every tab ends with a real `<a href="/collections/…">`, and all tabs are in the HTML, so Google sees every link.

**Costs of B:**
- About 1.5 KB of JS
- The HTML carries up to 24 cards. Hidden tabs' images don't load until they're shown, so the cost is HTML only
- It needs a collection per craft (we need them for the menu anyway)

The rest of this plan specifies B. §8 lists what A would be if Raushan prefers it.

---

## 3. Spec: the merged "Shop" section (direction B)

A new section, `sections/shop-crafts.liquid`, replaces `collection-list` and `featured-products` on the home page. Both old files stay for other pages.

### 3.1 Content model (theme editor)

**Section settings:**
- eyebrow: "Shop by craft"
- heading: "Our favourite makes"
- "All" tab collection: the picks collection
- products per tab: 4 or 8, default 4
- background

**Blocks:** "Craft", 2–6 of them. Each has:
- a collection
- an optional title (it defaults to the collection name, which keeps it in step with the menu)
- an optional circle image (it defaults to the collection image)

**Shopify note:**
- The **"All" tab** uses a collection called **"Our favourites"**. Start it as a manual collection (you pick and order the products). After launch, switch its sort to **"Best selling"**: Shopify then orders it by real sales, with no app needed.
- Rename the label to "Bestsellers" only then (D2).

### 3.2 Layout

**Phone (< 750px):**
- The heading is left-aligned (it's faster to read than centred).
- **The circles row:**
  - 72px photos in a swipe row with 5½ visible, so the half circle shows there's more
  - 14px labels under each (one line; long names get a shorter title in the block)
  - "All" comes first, and its circle is the logo's yarn-ball icon on Blush
- **The chosen circle:**
  - its ring turns solid Cocoa Deep, 2px
  - its label goes from weight 500 to 600 and gets a short stitch underline (the same dashed mark as the header menu)
  - colour is not the only signal (WCAG 1.4.1)
- **The grid:** 2 × 2 cards (4:5 photos), then "See all bouquets →" as a full-width ghost button (48px).

**Desktop (≥ 990px):**
- The heading is on the left, with the circles row on the right of the same line. That saves the 200px+ that a centred heading block takes today.
- The circles are 88px, all visible, no swipe.
- The grid is 4 across (8 = two rows), then the "See all" link on the right under the grid.

```
Phone                                   Desktop
SHOP BY CRAFT                           SHOP BY CRAFT                    (All)(Bouq)(Key)(Hair)(Bag)(Pots)
Our favourite makes                     Our favourite makes
(All)(Bouq)(Key)(Hair)(Ba…              ┌────┐ ┌────┐ ┌────┐ ┌────┐
┌────┐ ┌────┐                           │    │ │    │ │    │ │    │
│    │ │    │                           └────┘ └────┘ └────┘ └────┘
└────┘ └────┘                                                       See all bouquets →
┌────┐ ┌────┐
└────┘ └────┘
[ See all bouquets → ]
```

### 3.3 Behaviour

- **Every tab is rendered on the server.** Hidden panels use the `hidden` attribute. Their images are `loading="lazy"`, so the browser doesn't fetch them until the panel is shown. No network request on switch, so switching is instant and works offline.
- **The circles are `<button aria-pressed>`** (toggle buttons, not ARIA tabs). Tab moves through them like any button, so there's no arrow-key model to learn, and screen readers say "Bouquets, toggle button, pressed".
- Each button has `aria-controls` pointing at its panel.
- **On switch:**
  - the old panel fades out over 120ms and the new one arrives with the motion plan's `stagger` (cards rise 8px, 40ms apart)
  - the section's height animates, so the page doesn't jump when a panel has fewer cards
  - reduced motion: an instant swap
- **Status line:** a visually hidden `role="status"` says "Showing bouquets, 4 of 12" after each switch.
- **Focus stays on the pressed button.** People who want the products tab into the grid, which comes next in the order.
- **No JavaScript:** `theme.js` adds `.is-enhanced` to the section. Without it, CSS hides the buttons and shows **every panel stacked**, each with a small h3 (the craft name). So the page still lists everything, just longer.
- **The hero's "Shop the collection" button** stays a link to `/collections/all`. The section gets `id="shop"` so other links can jump here.
- **A tab with no products is not shown.** An empty craft never appears.

### 3.4 Accessibility checklist

| WCAG 2.2 | Check |
|---|---|
| 1.1.1 | Circle photos `alt=""`, because the label is the name. Card photos keep product alt text |
| 1.3.1 | One h2 for the section; card titles h3; the no-JS fallback adds an h3 per craft |
| 1.4.1 | The chosen circle shows a 2px ring, a bolder label and an underline, not just a colour change |
| 1.4.3 / 1.4.11 | Labels Cocoa Deep 7.6:1; the chosen ring 7.6:1; the unchosen ring is decorative (the label carries the state) |
| 2.1.1 | Every circle is a button reachable by Tab; Enter/Space toggles |
| 2.4.3 | Order: heading → circles → cards → "See all" |
| 2.5.8 | Circles are 72px or more, with 48px+ hit areas including the label |
| 4.1.2 | `aria-pressed` is true on exactly one button; panels have `aria-labelledby` pointing at their button |
| 4.1.3 | A status message on every switch |
| Motion | Reduced motion = an instant swap, no stagger |

---

## 4. Product card upgrades (both directions; every page that shows cards)

1. **Badge after the title in the DOM.** It's still placed top-left with CSS, so the link reads "Sunflower Trio Crochet Bouquet, ₹1,299, Bestseller" (B6). **12px, letter-spacing `.12em`** (B5).
2. **Badges only when they're true:**
   - **Sold out** (always wins)
   - **New**: the product has the `new` tag
   - **Last few**: inventory is tracked and 3 or fewer are left. Real stock only, never invented scarcity
   - "Bestseller" is not shown inside the favourites tab (B2)
3. **One quiet meta line under the price** (14px, Taupe Ink, 5.7:1), picked in this order:
   - **"Ships in 2 days"** from a product metafield `custom.ships_in_days`. This is the question handmade gift buyers ask most.
   - Otherwise **"4 colours"**, the count of values of the option named Colour/Color.
   - Otherwise nothing.

   **Shopify note:** add the metafield definition once in **Settings → Custom data → Products** (type: integer). After that, every product page in the admin shows a "Ships in days" field.
4. **Star rating only once there are real reviews.** Review apps (Judge.me and others) write Shopify's standard `reviews.rating` and `reviews.rating_count` metafields. The card shows ★ 4.8 (23) only when `rating_count` > 0.
5. **Quick add: not now.** It needs the cart drawer (build plan Phase 5). When that lands, single-variant cards get a 44px "+" on the photo corner; cards with options keep going to the product page. Logged as D4.
6. **Demo picks mix the crafts:** the favourites tab shows one bouquet, one keychain, one hair clip set and one bag charm, at different prices (B3).

---

## 5. Where products land on a phone (390 × 844)

| | Today | A | B |
|---|---|---|---|
| Craft block height | 377px | ~300px | (merged) |
| Product heading block | ~210px | ~210px | ~150px (one heading for both) |
| First card's top | 1,489px | ~1,330px | **~1,250px** |
| Gap between hero end and first card | 476px | ~320px | **~240px** |

The hero itself (about 1,013px) is out of scope here. If it's shortened later (motion plan, hero round), these numbers drop by the same amount.

---

## 6. Performance budget

- **Images:**
  - circles 72/88px use `image_url: width: 180`
  - cards use the existing `sizes`
  - hidden panels' images load only when shown (lazy in a `hidden` parent)
- **JS:** ≤ 1.5 KB gzipped, inside `theme.js` behind `[data-shop-crafts]`.
- **HTML:** at most 6 × 8 cards. At the default of 4 per tab, about 24 cards ≈ 18 KB uncompressed.
- **CLS = 0:** the panel height animates with `interpolate-size` (already on), and cards have fixed ratios.
- **LCP is unaffected:** this section is below the first screen.

---

## 7. Files that change (direction B)

| File | Change |
|---|---|
| `theme/sections/shop-crafts.liquid` (new) | Section markup, styles, schema, no-JS fallback |
| `theme/snippets/product-card.liquid` | Badge order and size, the meta line, Last few, rating, mixed demo picks |
| `theme/snippets/price.liquid` | No change |
| `theme/assets/theme.js` | Toggle buttons, status line, height animation (about 40 lines) |
| `theme/templates/index.json` | Replace `craft` and `bestsellers` with one `shop` section; demo blocks for 5 crafts |
| `theme/locales/en.default.json` | "Showing {{ craft }}, {{ count }} of {{ total }}", "See all {{ craft }}", "Ships in {{ days }} days", "{{ count }} colours", "Last few" |
| Shopify admin | Craft collections (also needed for the menu), the "Our favourites" collection, the `custom.ships_in_days` metafield |

---

## 8. If Raushan picks A instead (refine both)

**Shop by craft:**
- circles 87 → 104px on phones, with 3½ visible
- names match the menu (a shorter block title where needed)
- the tagline is replaced by "From ₹349" (the collection's lowest price) on every screen
- the heading becomes "Shop by craft" (h2), with "Made stitch by stitch" as the eyebrow
- desktop: section padding down one step and circles 180px, which saves about 120px
- a "Shop all" link at the end

**Bestsellers:**
- the heading is "Our favourites" until there are real sales (D2)
- the "View all" link also shows in demo
- mixed demo picks
- all the card upgrades in §4

---

## 9. Decisions for Raushan (recommendation first)

- **D1. Merge or keep separate.**
  - **Recommended: B, merge.** Products sooner, one section fewer, every craft's products one tap away, and no repeat of the header menu.
  - Alternative: A, refine both.
- **D2. The heading before launch.**
  - **Recommended:** "Our favourite makes", with the "All" tab labelled "Favourites".
  - Switch to "Bestsellers" after launch, once the collection is sorted by real sales.
- **D3. "Ships in X days" on cards.**
  - **Recommended: yes.** You enter the number per product in the admin.
  - What are your usual dispatch times: ready stock vs made to order?
- **D4. Quick "+" add to cart on cards.**
  - **Recommended: later**, with the cart drawer (Phase 5).
- **D5. Flower pots.**
  - It's on the home page but not in the menu. Is it a launch category? If yes, it joins the menu; if no, it leaves the home page.

---

## 10. Stages (each ends with screenshots at 360/390/768/1440 + axe 0)

1. Card upgrades (§4): small, and used everywhere.
2. The `shop-crafts` section with server-rendered tabs and the no-JS fallback.
3. Toggle behaviour, status line, motion, the height animation.
4. Swap the home template, remove the two old sections from home, then measure first-card position (target in §5) and run the motion-plan budgets.
5. Admin setup notes for Raushan (collections, favourites, metafield), and update `decisions.md` and memory.
