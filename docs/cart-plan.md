# Cart plan (drawer and cart page)

Status: **Stages 1–4 built and tested with real items 2026-10-02** (11 test products imported from `tools/test-products.csv`, tag `test-product`). Raushan approved the recommendations, except D2: adding shows a Flipkart-style "Added to cart · View cart" pop-up instead of opening the drawer.

### As built (where it differs from the plan below)
- **2026-10-06: a bin on every line, and lines of one height** (decisions.md, same date; replaces D3 and parts of §4.1 and §6.3 below). The bin is at the far end of the stepper's row and removes the piece whatever its quantity; minus stops at 1. The name's block keeps room for two lines, "₹149 each" sits under the line's price, and the photo is 100px (88px on 320px phones), so lines are the same height unless one has more to say (a note, a discount, a two-line name with options). Checks 8 and 8b guard it.
- **2026-10-05, one cart: the drawer and the cart page show the same thing.** Raushan's order for a gifting shop, and his rule that the two must not differ (the cart icon opens the drawer, so that is the cart shoppers see). This replaces the 2 × 2 "Little extras" grid under the page (§4.2) and the three stacked rows in the drawer (D7 note below).
  - Order in both: the pieces → gift note → price details → **Saved for later** → **Little extras** → **Recently viewed**. The amount and Checkout stay pinned at the bottom. On the page the gift note, rewards line, price details and Checkout are one card, and from 990px that card sits beside the pieces with the rows full width under both.
  - Saved for later: this browser's saved pieces that can be bought now, each with a "+" on its photo (or Choose for a piece with options; the same button in all three rows, the Saved page keeps "Add to cart" under its card), from `sections/saved-item.liquid`. "See all saved" shows when there are more than the row holds.
  - Little extras: `sections/cart-extras.liquid`. While a reward is ahead it is "Little extras", ordered as before. Once every reward is earned the same row is "You may also like", in Shopify's own order. It is asked for again after every change to the cart.
  - Recently viewed: the last product pages seen in this browser that can be bought now, with the same card and button as Saved for later (`sections/saved-item.liquid`; plain cards until 2026-10-05). A piece that is also saved shows in Saved only. Hidden with fewer than 2.
  - Buttons in the rows are small and sit on the photo's bottom-right corner (2026-10-06; before, a full-width "+ Add" or "Choose" under every card, 56px a row): a "+" in a 36px circle for a one-tap add, a "Choose" pill for a piece with options, each with a 48px tap area. They are white with the quantity stepper's border, so the cart has one button look. The heart keeps the top-right corner.
  - Test products (tag `test-product`) and the free gift never show in a row, whatever this browser saved or viewed: `saved-item`, `product-tile` and `cart-extras` give nothing back for them.
  - Rules for all three: 6 cards at most; nothing that is in the cart; no piece twice (Saved and Recently viewed keep theirs, the suggestions give way); a row with nothing to show is hidden.
  - After an Add in a row: the "+" turns into a tick on Cocoa for a moment, the card goes, the cart redraws, the status line says what was added and focus moves to the next card's button. A piece taken out of the cart comes back to its row. An error shows under the row.
  - How it stays one cart: both sections render `snippets/cart-rows.liquid` and run `assets/cart-rows.js` (11 KB). The drawer fetches the script with its first opening (the `data-addons` attribute; `cart.js` is unchanged), the page when the rows are within 600px of the screen. `assets/cart-addons.js` is gone. Each Add is a plain button, because the drawer is one form and a form can't sit inside a form. The drawer redraws all of itself after every change, so the script keeps the filled rows and puts them back, with the scroll position and focus.
  - In the drawer the rows stay swipe rows at every width (it is 440px on a desktop too).
  - Page only: the pinned Checkout bar on phones shows whenever the card's own Checkout is off screen, above or below (before: only below).
  - Check 8d (55 checks: drawer and page at 360 and 390 wide, both on a desktop, the drawer at 320, axe, every card has a white button on its photo's corner, a saved or viewed test product never shows, and "the drawer and the page show the same rows"). It replaces 8c.
- **2026-10-05: the product page changes cart lines too.** A piece that's in the cart shows the cart's stepper in the product page's buy box (`assets/product-buy.js`, product-page-plan.md "Round 8"). It uses cart.js's own `commit`, so the queue, the split lines and the spoken updates are the same; the bin there has no Undo row, because Add to cart comes straight back.
- **2026-10-05, D7 changed: Little extras are in the cart drawer too.** Raushan asked about Amazon's sheet of add-ons after "Add to cart". The idea fits us (a ₹169 order pays ₹49 delivery, free from ₹499, and we have ₹49–₹199 pieces), but not as a sheet on every add: it interrupts browsing, which is why D2 is a small pop-up. Add-ons inside the 8-second pop-up were ruled out too: they would vanish before keyboard and screen-reader users reach them. It began as three stacked rows above the gift note, shown only while a reward was ahead; later the same day it became the swipe row described under "one cart" above.
  - The "Small add-ons" link on the rewards line stays: it leads to everything sorted by price.
  - Theme settings → Cart → "Show Little extras in the cart" switches it in both places.
- **2026-10-03, compact cart (`cart-compact-plan.md`):** the drawer's pinned bottom is now only the amount and Checkout, 113–163px tall instead of about 285px. The amount goes to a "Price details" card at the end of the list. "Ships in 1–3 days" is gone from the cart. The pop-up is a 66px pill without the rewards line. A product that Shopify splits over two lines is drawn as one. The cart page's own script moved to `cart-page.js`. The drawings in §4.1 below show the older, taller footer.
- **D2 changed (Raushan): adding to cart shows a pop-up and doesn't open the drawer.** Shoppers keep browsing; "View cart" in the pop-up opens the drawer.
  - What it shows: the photo, "✓ Added to cart", the name (with the option picked), View cart and ×.
  - Where it sits: at the bottom on phones; under the header's cart button from 768px.
  - How long it stays: 8 seconds, 10 for an error. It pauses while a finger, pointer or keyboard focus is on it, and Esc closes it.
  - It never takes focus: the header's status line says "Rose bouquet added to cart. 2 items." The header cart button does the same as View cart, so nothing is lost when the pop-up goes (WCAG 2.2.1).
  - The drawer's "✓ … added" line from §4.1 was dropped, since the drawer no longer opens on add.
- **Errors:** a product-page error (like the stock limit) shows under the button (`role=alert`). A Little extras error shows in the pop-up.
- **Free shipping (D4):** set the amount in **Theme settings → Cart → Free shipping from (₹)**. It stays hidden at 0, the default. Gift note and Little extras can be switched off in the same place.
- **`cart.js` is about 21 KB raw (about 11 KB minified),** not the ≤10 KB estimated. It loads on every page as a deferred module, and `npm run check` holds it to a 22 KB budget. `theme.js` only gained a `quiet` flag on `cart:updated`, because cart.js makes its own, more useful announcement.
- **Spoken updates while the drawer is open** go to a status line inside the drawer. The header's line is inert behind the modal and wouldn't be heard.
- **Focus survives every refresh.** If you were on a line's + button, you're still on it after the update arrives. After a remove, focus is on Undo. After Undo, it's on the restored item's name, not its number field, so the phone keyboard doesn't pop up.
- **Leaving from inside the drawer** (a product link, or Checkout) first steps back over the drawer's history entry. Back from the next page then returns to the page, not to a duplicate of it.
- **Enter in a quantity box** saves that number and never submits the form (that would go to checkout).
- **The empty cart's craft tiles** link to each craft's collection once it exists, otherwise to all products with a demo photo.
- **The product page** got an interim Add to cart: a styled button with Adding…/Added, quantity, the option picker (sold-out options disabled) and the error line. The full page is still build-plan Phase 4.
- **Tests:** `npm run check` section 8 covers:
  - add → pop-up → View cart → drawer
  - + and −, with focus kept
  - bin → Undo
  - Back closes the drawer
  - the stock limit message
  - axe on the drawer and the page
  - the no-JS update

  It's skipped while the store has no products.
- **Stock limit gotcha:** Shopify's `/cart/add.js` doesn't enforce the stock limit for a plain `id` + `quantity` add; it lets you add 6 of something with 3 in stock. It does enforce it for the `items: [...]` shape, so cart.js always sends product forms that way.
- **Little extras fallback:** Shopify takes a while to work out recommendations for new products. Until it has, the section shows the store's lowest-priced in-stock products.
- **Drawer photos** are lazy, so they cost nothing on pages where the drawer isn't opened. They start loading as soon as a finger or pointer heads for the cart button or View cart.
- **"Buy it now"** (Shopify's dynamic checkout button on the product page) is restyled as our outlined pill instead of its default blue.
- **Prices show as "Rs. 1,299.00"** because that's the store's money format. To show ₹1,299 instead, change it in **Settings → General → Store defaults → Currency display → Change formatting** and use `₹{{amount_no_decimals}}`.
- **Audit fixes (2026-10-02, docs/audit-2026-10-02.md):**
  - Pressing Checkout while a change is still saving now waits, then submits the current form; before, it did nothing.
  - The drawer locks the page scroll behind it.
  - The empty cart's logo has its own id.
- **Checked on 2026-10-02:**
  - theme check is clean
  - `npm run check` section 8 passes 16/16 (phone and desktop, against a dev server that has the storefront password)
  - axe reports 0 violations on the drawer, the page and the page with Little extras, at phone and desktop sizes
  - not yet done: the real-phone pass (Raushan)
This plan covers everything between "Add to cart" and Shopify's checkout:
- the add-to-cart moment
- the cart drawer
- the `/cart` page
- the empty cart
- the handoff to checkout

It follows `motion-plan.md` (tokens, budgets), `nav-plan.md` (drawer and header patterns) and `brand-direction.md` (stitch marks, line icons, voice).

---

## 1. What's there today (measured 2026-10-02, 390px phone)

| # | Problem | Why it matters |
|---|---------|----------------|
| 1 | `/cart` is Skeleton's starter: an unstyled table, a plain text box for quantity, an "Update" button and a "Remove" text link | Nothing is designed. Typing a number and then pressing Update is a 1990s flow |
| 2 | An empty cart still shows a grey "Checkout" button, and nothing else | It's a dead end with no way back to the products |
| 3 | No cart drawer. Adding to cart (on Skeleton's product page) reloads into `/cart` | Every add throws the shopper out of what they were browsing |
| 4 | No product info beyond the title: no variant, no price, no line total, no subtotal | The shopper can't check what they're paying before checkout |
| 5 | The store has **0 products**, so nothing can be tested end to end | We need test products before building (Stage 0) |

Already in place, and kept:
- the header cart button and its count badge, which bumps on `cart:updated`
- the `role=status` line in the header that announces the new count
- `aria-current` on the cart link while you're on `/cart`
- the price snippet: sales read "Sale price ₹…, Regular price ₹…"

---

## 2. Goals

1. **The shopper always knows it worked.** Every add, change or removal gives a clear visible response and a spoken one.
2. **Checkout is one thumb-tap away.** On phones, the Checkout button is always at the bottom of the screen in the drawer, and pinned on the cart page.
3. **Photo, name, options, quantity and price are readable at 360px**, with nothing cut off and nothing crowded.
4. **Removing is safe without a "Are you sure?" pop-up.** There's an Undo instead.
5. **It stays calm.** One background, the brand's line icons, no flying images, no countdowns, no "people are viewing this".
6. **It works without JavaScript** and on a slow 3G phone, and it passes WCAG 2.2 AA.

Phones come first: most shoppers will be on mid-range Android phones at 360–412px wide.

---

## 3. Where the cart lives

**One cart, two places:**
- **The drawer.** It slides in from the right, mirroring the menu drawer on the left. It opens when you tap the header's cart button, or View cart in the added-to-cart pop-up (D2).
- **The `/cart` page.** It's for direct links, no-JS shoppers, and anyone who opens the cart in a new tab. Shopify also sends people back here from checkout.

Both are drawn from the same snippets (`cart-line`, `cart-summary`, `cart-empty`), so they can never look or behave differently.

The header cart button stays a real link to `/cart`. JavaScript turns a plain tap into "open the drawer". A long-press, middle-click, or no JavaScript still goes to the page. On `/cart` itself, the button doesn't open the drawer, because you're already looking at the cart.

---

## 4. Phone layout (designed at 360px, checked at 390 and 412)

### 4.1 Drawer
Full width below 480px; 440px wide from 480px up.

```
┌────────────────────────────────────┐
│ Your cart (2)                   ✕  │ ← pinned top bar, 56px, × is 48px
├────────────────────────────────────┤
│ ✓ Rose bouquet added               │ ← only right after an add, then fades
│                                    │
│ ┌──────┐ Rose bouquet       ₹1,198 │
│ │      │ Pink · 3 stems            │
│ │ 88px │ ₹599 each                 │
│ └──────┘ ( − │ 2 │ + )             │
│ - - - - - - - - - - - - - - - - -  │ ← dashed stitch divider
│ ┌──────┐ Bumble bee keychain  ₹249 │
│ │      │                           │
│ └──────┘ ( 🗑 │ 1 │ + )             │ ← at 1, minus becomes a bin
│                                    │
│ ⊕ Add a gift note                  │ ← closed by default
├────────────────────────────────────┤
│ Subtotal                    ₹1,447 │ ← pinned footer
│ Taxes included. Shipping at checkout│
│ ┌────────────────────────────────┐ │
│ │          Checkout  🔒           │ │ ← 56px, Cocoa Deep, full width
│ └────────────────────────────────┘ │
│ 🚚 Ships in 1–2 days               │
└────────────────────────────────────┘
```

**Measurements at 360px:**
- Content is 328px wide after the 16px gutters. Photo 88px + 12px gap leaves 228px for the text.
- **Name:** 16px Jost 500, wraps to 2 lines at most, and links to the product.
- **Options** (variant, plus any line-item properties): 14px Taupe Ink. A line is shown only if there's something to say. The home cards are name and price only, but the cart must show which colour or size you picked.
- **Line price:** 16px, tabular numbers, right-aligned. It shows "₹599 each" under the options only when quantity is more than 1. A sale shows the old price struck through, using the existing price snippet.
- **Quantity stepper:** three 48 × 48 cells, 144px wide, with a 1.5px Cocoa outline and a pill shape. The number in the middle is a real `<input type="number" inputmode="numeric">`, so it can be typed into.
- **Pinned footer:** about 170px tall, plus `env(safe-area-inset-bottom)`. On a 360 × 640 phone, about 3 lines show above it.

**Space-saving rules:**
- No separate "Remove" link (decision D3).
- No unit price at quantity 1.
- No "View cart" button in the drawer: the drawer already does everything the page does.
- The gift note stays closed until asked for.

### 4.2 Cart page (`/cart`) on phones
- The page title is "Your cart" with the count, in serif italic like other page titles.
- The lines are the same as in the drawer, with 96px photos.
- The summary block comes after the lines: gift note, subtotal, tax line, Checkout, the shipping promise, and payment icons (D8).
- **A pinned Checkout bar.** A slim bar at the bottom shows the total and Checkout. It appears only while the summary's own Checkout button is off screen (`IntersectionObserver`), so there are never two Checkout buttons visible at once.
- Below the summary: three swipe rows (Saved for later, Little extras, Recently viewed), the same as in the drawer; see "As built", 2026-10-05.

### 4.3 The empty cart (drawer and page)
- the basket logo mark, drawn small in line style
- the heading "Your basket is empty" (a nod to the name)
- one line: "Handmade pieces are waiting for you."
- a primary button: **Shop bestsellers**
- under it, the same 3-across craft photo tiles as the phone menu (`menu-tile`), so the next step is one tap

There's no Checkout button on an empty cart.

---

## 5. Desktop and tablet

- **Drawer:** 440px wide from the right. The page behind is dimmed, as with the menu drawer. Same contents as on phones.
- **Cart page from 990px:** two columns, max 1100px wide.
  - Left: the lines, with 112px photos; the name and options; the stepper; the line price at the far right.
  - Right: a 360px summary card in Soft Blush. It's sticky under the header (header height + 24px).
- **768–989px:** the phone layout, with wider gutters.

---

## 6. How each action behaves

### 6.1 Adding to cart (product page now; cards only if D9 says so)
1. The button shows "Adding…" with a small spinner. It stays the same size, so nothing jumps. While it waits, repeat taps are ignored.
2. One request does the work: `POST /cart/add.js` with `sections=cart-drawer` returns both the result and the drawer's new HTML (Shopify's Section Rendering API).
3. **(As built, D2)** The added-to-cart pop-up appears, with View cart. The header count bumps, and the status line says "Rose bouquet added to cart. 2 items." Focus stays on the button.
4. The product page button shows "Added ✓" for 2 seconds, then goes back to "Add to cart".
5. There's no flying-image animation: it's busy, it gets in the way, and it ignores reduced motion.

**When an add fails** (sold out, or the stock limit reached): the drawer doesn't open. A message appears under the button in plain words, for example "We've only made 3 of these, and they're all in your cart." It's announced and linked to the button with `aria-describedby`.

### 6.2 Changing quantity
- **+ and −** change the number at once, then send the update **350ms after the last tap**. Tapping + three times sends one request, not three.
- Requests go through a **queue**, one at a time, so fast taps on two lines can't overwrite each other.
- **While waiting:** the line price and subtotal dim to 60%. Nothing else moves, and there's no skeleton shimmer.
- **When the reply comes:** the server's HTML for that line and the summary replaces ours. Prices, discounts and stock always come from Shopify, never from our arithmetic.
- **At the stock limit:** + is greyed out (`aria-disabled`, so it stays focusable), and a short note appears: "That's all we've made for now".
- **Typing a number:** it sends when the field loses focus or on Enter. 0 counts as removing.
- **Screen readers hear:** "Rose bouquet, quantity 2. Subtotal ₹1,447."

### 6.3 Removing, with Undo (D3)
- At quantity 1, the minus button shows a bin icon. Its label is "Remove Rose bouquet".
- Tapping it collapses the line (300ms, `--ease-in-out`) into a slim row: "Rose bouquet removed. **Undo**". Focus moves to the Undo button.
- **The Undo row stays until the drawer closes or the page reloads.** There's no timer, so nobody has to rush (WCAG 2.2.1).
- **Undo** adds the line back with the same variant, quantity and properties. Shopify may put it back at the top of the list rather than in its old spot, which is fine.
- **Removing the last item** shows the empty state, with the Undo row above it.

### 6.4 Gift note (D5)
- A "⊕ Add a gift note" disclosure, made with `<details>`. Inside:
  - a labelled textarea with 200 characters max
  - a live count of characters left; screen readers hear it only when 20 are left
- It saves to `cart.note` 600ms after typing stops (`/cart/update.js`), and on blur. A quiet "Saved" appears.
- The note reaches the order as the order note. We see it when packing, and the shopper sees it again at checkout.

### 6.5 Going to checkout
- **Checkout is a real submit button** (`name="checkout"`) in the cart form, so any unsaved note or quantity is saved first. Shopify then redirects to its own checkout.
- **We can't style Shopify's checkout pages from the theme.** Their logo, colours and fonts are set in the admin (§10).
- The button gets a lock icon and "Checkout". The total is already shown just above it, so the button stays short.
- **Express payment buttons** (`content_for_additional_checkout_buttons`) show only if the payment setup turns them on. In India that depends on the payment gateway (still an open decision). If we choose a third-party one-page checkout (Razorpay Magic Checkout, GoKwik, Shiprocket), it takes over this same button. So the button must be the only way into checkout.

### 6.6 Opening, closing, Back
- The drawer is a `<dialog>` opened with `showModal()`, like the menu drawer. Focus stays inside it, the page behind is inert, and Esc closes it.
- **Closing works with any of:** ×, tapping the dimmed page, Esc, or the **phone's Back button**.
  - Opening adds a history entry; Back closes the drawer instead of leaving the page.
  - This matters on Android, where Back is how most people dismiss things.
- On close, focus goes back to whatever opened it: the cart button, or the Add to cart button.

---

### 6.7 Holding still (2026-10-08)

A change redraws the cart, and nothing on screen moves: not for a "+" in the swipe rows, a removed line, Undo or
the free gift arriving. `cart-rows.js` ("Holding still") measures the tapped piece (or the first kept thing in
view) before and after each redraw and corrects the scroll at once. At the very top the cart stays at the top.
Check §8e. See docs/decisions.md, 2026-10-08.

## 7. Accessibility checklist (WCAG 2.2 AA)

- **Tap targets:** every one is at least 48 × 48px (our rule; WCAG asks for 24).
- **Stepper labels:**
  - the input: "Quantity, Rose bouquet"
  - the buttons: "Decrease quantity, Rose bouquet" / "Increase quantity, Rose bouquet" / "Remove Rose bouquet"
- **Visible focus:** a 2px Cocoa ring with a Rose halo, as elsewhere. In the drawer's scroll area, rings are inset so the edges don't clip them.
- **Spoken updates** go through the existing header `role=status` line, for add, change, remove, undo and errors. Error messages use `role=alert` once.
- **Prices:** the sale and regular price are said in words, never by strike-through alone. Totals use tabular numbers so they don't shift.
- **Focus order in the drawer:** heading → lines (name link → stepper) → gift note → Checkout → close.
- **Zoom and short screens:**
  - At 400% zoom, or on a screen less than 500px tall, the drawer footer stops being pinned and scrolls with the lines, so it never covers half the screen (1.4.10, 2.4.11).
  - The same goes for the cart page's Checkout bar.
- **Forced colours:** the stepper, the summary card and the Undo row keep real borders.
- **Reduced motion:** the drawer fades instead of sliding, and lines disappear without collapsing.
- **Language:** plain words throughout ("Remove", "Undo", "That's all we've made for now"), with no jargon such as "line item" or "SKU".

---

## 8. Motion (from `motion-plan.md`)

| Moment | Motion |
|--------|--------|
| Drawer in / out | Slide from the right, 380ms `--ease-out` / 280ms ease-in; the backdrop fades. Same feel as the menu drawer |
| "✓ … added" line | Fades in with the drawer and stays. No bounce |
| Quantity number | Crossfades, 160ms |
| Price while waiting | Dims to 60%, 160ms |
| Line removed | Height collapses 300ms `--ease-in-out`, then the Undo row fades in |
| Header count | The existing bump |
| Add-to-cart button | The label crossfades: "Adding…" → "Added ✓" → back |

Nothing loops, nothing slides in on scroll, and every motion is turned off under reduced motion.

---

## 9. Build approach

### Files
- `sections/cart.liquid`: the page, rebuilt.
- `sections/cart-drawer.liquid`: rendered once in `layout/theme.liquid`.
- `snippets/cart-line.liquid`, `cart-summary.liquid`, `cart-empty.liquid`, `quantity.liquid`: shared by both.
- `assets/cart.js`: a separate module, deferred.
  - `theme.js` is at its 25 KB budget, so nothing cart-related goes there.
  - Budget for `cart.js`: **≤ 10 KB** raw.
  - It holds a `<cart-items>` element (change, remove, undo, note), a `<cart-drawer>` element (open, close, history), and one listener that turns any `form[action*="/cart/add"]` into an AJAX add.

### Shopify APIs
- `/cart/add.js`, `/cart/change.js` (by line **key**, not index) and `/cart/update.js` (note).
- Each sends `sections=…`, so the reply carries fresh HTML for the drawer or page. That's one round trip per action.
- URLs come from `routes`, so they stay correct if we add languages later.

### Other details
- **Events:** after every change, `cart.js` dispatches `cart:updated` with the cart. The header's existing listener handles the count and its announcement.
- **Images:** drawer photos are `loading="lazy"` with a fixed size, so the drawer costs nothing until it's opened and can't cause layout shift.
- **No JavaScript:** the cart page is a plain form.
  - `updates[]` inputs, with an "Update" button that appears only in `<noscript>`.
  - Remove links use `item.url_to_remove`; Checkout posts the form.
  - Without JavaScript, the header button and Add to cart simply go to `/cart`.

---

## 10. Things only Raushan can do in the admin

1. **Stage 0: test products.** I'll write a product CSV with about 10 products for **Products → Import**. Images come from the demo photos already on Shopify's CDN. The CSV covers:
   - at least one product in each craft
   - one product with colour variants
   - one with stock tracked at 3
   - one on sale
   - one sold out

   It takes about a minute. The collection and product pages need these anyway.
2. **Settings → Checkout:**
   - Upload the logo, and set the colours to Cocoa Deep #4E3A31 buttons on white.
   - Pick the font closest to Jost from Shopify's list.
   - Turn on "Show order notes" only if we skip the cart gift note (D5).
3. **Shipping:** if we show a free-shipping line (D4), set the same amount as a free rate in Settings → Shipping and delivery. The theme can only show the promise; Shopify's shipping rules keep it.
4. **Payments:** the gateway and COD choice (already an open decision) decides which express buttons appear and whether a one-page checkout app replaces the button.

---

## 11. Stages

| Stage | What | Done when |
|-------|------|-----------|
| 0 | Test products CSV (Claude writes it, Raushan imports it) | The products show on the dev store |
| 1 | The cart page, fully server-rendered: lines, stepper, summary, empty state, desktop two columns, working without JS | theme check clean; axe 0 at 360/390/768/1100/1440; no-JS update and remove work |
| 2 | `cart.js` on the page: instant stepper, queue, spoken updates, Undo, errors, gift note, pinned Checkout bar | Playwright tests for change, remove, undo, note, stock limit and slow network pass |
| 3 | The drawer: Add to cart on the product page opens it; the header button opens it; Back closes it | Playwright: add → drawer → focus → Esc/Back → focus returns. axe with the drawer open |
| 4 | Extras that were agreed in §12 (free-shipping line, payment icons, Little extras) | The same checks, plus a 3G run with no layout shift |
| — | Real-phone pass (Raushan): Android Chrome + TalkBack, iPhone Safari + VoiceOver | No blockers |

The full product page is build-plan Phase 4. For now, Stage 3 only upgrades Skeleton's Add to cart button: our style, the Adding/Added states, and the AJAX add. Phase 4 builds the rest of that page around it.

---

## 12. Decisions for Raushan

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| D1 | Where does the cart open? | (a) a drawer, with `/cart` as the backup (b) the page only (c) the drawer only | **(a).** Shoppers never lose their place, and the page covers no-JS shoppers and direct links |
| D2 | What happens after "Add to cart"? | (a) open the drawer (b) a small "Added, View cart" pop-up at the bottom | **Raushan chose (b)**, Flipkart-style, so shoppers aren't pulled into the cart on every add (see "As built") |
| D3 | How do you remove an item? | (a) minus turns into a bin at 1, with an inline Undo (b) a separate "Remove" link on every line | **(a).** It's the Swiggy/Blinkit pattern Indian shoppers already know. Lines stay less cluttered, and Undo makes mistakes harmless |
| D4 | Free-shipping progress line? | (a) yes: "₹151 away from free shipping" with a thin stitched bar (b) no | **(a), if you offer free shipping above an amount. Which amount?** If shipping is always free or always paid, (b) |
| D5 | Gift note in the cart? | (a) yes, collapsed (b) no, use the checkout's order note | **(a).** Gifting is our likely differentiator, and the cart is where people think about it. Gift wrap as a paid add-on can come later as its own product |
| D6 | Discount code box in the cart? | (a) no; Shopify's checkout has one (b) yes | **(a).** An empty code box sends people off to hunt for coupons, and some never come back. Automatic discounts still show in the cart |
| D7 | "Little extras" suggestions? | (a) on the cart page only: up to 4 small items (keychains, clips) from Shopify's recommendations, each with one-tap add (b) in the drawer too (c) none | **(a), built in Stage 4.** It suits gifting ("add a little something") without crowding the drawer |
| D8 | Payment icons (UPI, cards, COD) under Checkout? | (a) one muted row on the cart page only (b) in the drawer too (c) none | **(a).** It reassures people on the page without adding a row to the drawer |
| D9 | "+ Add" on product cards (quick add)? | (a) not in this phase (b) a small + on single-variant products | **(a).** You chose name-and-price-only cards. Let's see the cart working first, then decide with real products |
