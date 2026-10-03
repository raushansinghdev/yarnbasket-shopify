# Cart: a smaller pinned bottom, and a tidier added-to-cart pop-up

Status: **built and tested 2026-10-03, in three rounds.** Not committed yet. `npm run check`: 171/171, with the new section 8b.

### As built

**Round 1 (C1–C7 approved as recommended).** One row in the drawer's pinned bottom, no "Ships in 1–3 days" in the cart, no ₹0 discount notes, and the pill pop-up without the rewards line.

**C7, the "Saved" pop-up, matches it** (`snippets/saved-toast.liquid`): the same 66px pill, 48px round photo, 8px gaps, 40px × and 12px button padding. Its headings vary ("Saved", "Removed from saved", "Link copied"), so the words keep whatever the heading needs and the name never widens them. The rare "My Yarn Basket wishlist" pop-up with the link (shown only when copying fails) wraps its button under the words on a 360px phone.

**Round 2 and 3 (Raushan's Flipkart example).** The small tax line under the row was the weak part, so it went:

- **The pinned bottom is only the amount and Checkout.** The amount has a dotted underline and is a real button ("Subtotal ₹2,245, Price details" to a screen reader). With a discount, the price before it is struck through above.
- **"Price details" is a card at the end of the drawer's list**, after the gift note. Tapping the amount scrolls to it, moves focus to its heading and outlines the card for a moment.
  - Rows: Items and each discount (only when something was taken off), Shipping, Subtotal, then "Prices include all taxes."
  - Shipping says "Free", "₹79, added at checkout" (the flat fee setting) or "Calculated at checkout". It's never added into the subtotal.
- **The cart page's summary card has the same rows.** The pinned bar's amount on phones is a link to the card.
- **The rewards words and the hidden finished bar are the same in the drawer and on the page:** "Free shipping and free gift unlocked".
- **Measured heights of the drawer's pinned bottom:** 113px with everything unlocked (was about 285px) and 163px with a step ahead (was about 265px).

**One product, one line.** With the gift's "Buy X get Y" discount on, Shopify keeps the pieces that earned the gift on a line of their own, so the same product showed as two lines (4 and 1). Merging them through Shopify's API doesn't hold: it splits them again.

- `cart-line.liquid` draws the first of such lines with the total quantity and price, and nothing for the others.
- The quantity field posts the total for the first line and a hidden 0 for each other one; Shopify adds that up to the same total. cart.js sends the same (`data-more`), so +, −, a typed number, remove and Undo all change the whole quantity. It works without JavaScript too.
- Discounts on such lines are listed once, with the whole amount.

**Other changes along the way:**

- **Pop-up:** 66px tall at every width. Corners are 2rem, not a full pill radius, so the box still looks right if it grows. With large text or a very narrow screen the buttons wrap under the words.
- **The short-screen rule is in em** (`max-height: 31.25em`), so a larger browser text size also un-pins the bottom.
- **`cart-page.js` is new:** the cart page's pinned bar and Little extras moved out of cart.js, which was at its 22 KB budget. cart.js is now 21.4 KB.
- **Removing a line by typing 0 and Enter** no longer logs a script error (the field's change fired twice).

**Tested:** Chrome and WebKit; 320, 360, 390 and 1440px; one piece, gift ahead, everything unlocked; a split product through +, −, typing, remove, Undo and the no-JavaScript Update; 200% and 400% zoom; a landscape phone; keyboard (Enter on the amount); axe on the drawer, the pop-up and the cart page (0 violations).

Sections 1–7 below are the first plan. Where they differ from this list, this list is what's built.

Raushan's request (2026-10-03):

1. Cart drawer: remove "Ships in 1–3 days". Keep Checkout at the bottom, with the subtotal to its left, so the button no longer takes the full width. The pinned bottom takes too much room; the products should get it back.
2. Added-to-cart pop-up: the text is badly aligned. Say only "Added to cart" with the photo and name, and drop the rewards (milestone) line, so the pop-up keeps its pill shape.

Sizes below are worked out from the CSS and checked against Raushan's screenshots. They were not measured in a browser; the build step measures them.

## 1. What's wrong today

### 1.1 The drawer's pinned bottom

It holds six stacked things, in `snippets/cart-summary.liquid` and `snippets/cart-rewards.liquid`:

| Part | Phone (390 wide) |
|---|---|
| Padding, top and bottom | 32px |
| Rewards words | 42px (two lines, see fault 1) |
| Rewards bar and amounts | 50px |
| Subtotal row | 27px |
| "Taxes included. Free shipping." | 24px |
| Checkout, full width | 56px |
| "Ships in 1–3 days" | 20px |
| Gaps between them | about 36px |
| **Total** | **about 285px** |

- On the phone screenshot that's 36% of the screen. Two cart lines fit above it, and the third is cut off.
- On the laptop screenshot it's about 275px of 835px.

Faults found while reading the code:

1. **The tick sits alone on its own line** on phones. `.rewards__text` is a wrapping flex row, and the sentence is wider than the row, so the sentence drops under the tick. That costs 22px.
2. **The bar stays after everything is unlocked.** At that point it's a full green line with nothing left to say, and it costs 50px.
3. **"Free shipping" is said twice** in the unlocked state: in the rewards words, and again in "Taxes included. Free shipping."
4. **Every ordinary line shows "Free sunflower keychain over ₹1,499 (−₹0)".** Shopify lists the gift discount on every line, with ₹0 on the lines it doesn't touch. `snippets/cart-line.liquid` prints them all. That's one or two wasted lines of text per product, and it reads like a bug.

### 1.2 The pop-up

`.cart-toast` is one row of four columns: photo 56px, text, View cart, ×.

- On a 390px phone the text column is about 118px wide. On a 360px phone it's about 86px.
- "✓ Added to cart" needs about 112px, so it breaks into two lines on most phones.
- The rewards sentence is wrapped into the same column and runs to five lines.
- The pop-up grows to about 160px tall and loses its shape.

## 2. The drawer's new bottom

### 2.1 Layout

```
┌────────────────────────────────────┐
│ ✓ Free shipping and free gift      │  rewards words, one line
│   unlocked                         │  (bar only while a step is ahead)
│                                    │
│ SUBTOTAL        ┌────────────────┐ │
│ ₹1,946          │  🔒 Checkout   │ │  one row, button 56px tall
│                 └────────────────┘ │
│ Taxes included.                    │  12px, muted
└────────────────────────────────────┘
```

- **Subtotal on the left:** a small "Subtotal" label over the amount, the same pattern as the cart page's pinned bar on phones (`.cart-bar`), so the two match.
- **Checkout on the right:** it fills the rest of the row and stays 56px tall. On a 360px phone it's about 220px wide.
- **"Ships in 1–3 days" is removed** from the cart, in the drawer and on the cart page. It stays in the announcement bar and the product page's delivery terms (the `cart.ships` string is still used there).
- **Rewards:**
  - While a step is ahead: the words, the bar and the amounts stay as they are. This is the part that sells.
  - When everything is unlocked: only the words, with the tick. The bar and amounts are hidden in the drawer.
  - The tick stays on the first line beside the words (fault 1).
  - Shorter unlocked wording, so it fits one line on a phone: "Free shipping and free gift unlocked". The gift's name is already on its own cart line just above.
- **The small line under the row:** the same sentence as today. When the rewards words already say free shipping, it's only "Taxes included."
- **Cart-wide discounts** (a code, an automatic discount): still listed as small rows above the main row, only when there is one.

### 2.2 Height

| State | Today | New |
|---|---|---|
| Everything unlocked | about 285px | about 135px |
| A step still ahead | about 265px | about 180px |

On a 390 × 844 phone that's room for about one more full product line.

### 2.3 The zero-amount discount notes (fault 4)

`cart-line.liquid` skips a discount note when its amount is 0. Real discounts still show.

### 2.4 The cart page

- "Ships in 1–3 days" goes from the summary card.
- The card keeps its stacked layout with a full-width Checkout. It isn't pinned, so it takes no room from the products, and the express payment buttons under it need the full width.
- The unlocked state keeps its bar there (there's room, and it's the only place the finished bar would still show).
- The phone's pinned bar already has the new layout. No change.

### 2.5 Accessibility

- Checkout stays the same real submit button named `checkout`, 56px tall, the only way into checkout.
- The reading order is subtotal, then Checkout, then the small line, so a screen reader hears the price before the button.
- The subtotal stays a `<dl>` with `data-total`, so it still dims while a change is on its way and cart.js needs no change.
- Narrow or zoomed screens: the row wraps, and Checkout drops under the subtotal at full width. Nothing is cut off at 320px or at 200% text.
- The rule for short screens stays: under 500px tall the bottom isn't pinned.
- The sold-out message stays under the row, tied to the button with `aria-describedby`.
- The amounts under the bar were already hidden from screen readers; the hidden sentence that says them stays in both states.

## 3. The pop-up

### 3.1 Layout

```
╭──────────────────────────────────────────╮
│ (photo)  ✓ Added to cart   [View cart] ✕ │
│          Flower Hair Clips…              │
╰──────────────────────────────────────────╯
```

- Two lines of text, always: "✓ Added to cart", then the name (and the variant), cut with "…" when long.
- **The rewards line is removed**, from the template, the CSS and cart.js.
- "Added to cart" never wraps. To make room on a 360px phone:
  - the photo goes from 56px to 48px
  - the gaps go from 12px to 8px
  - View cart's side padding goes from 16px to 12px (still 48px tall)
  - × goes from 48px to 40px wide (still 48px tall)
  - that leaves about 124px for the text, against the 112px it needs
- **Pill shape:** the pop-up is a fixed 64px tall, so it gets fully round ends, and the photo becomes a circle to match.
- Under 340px wide (or zoomed that far), the photo is dropped. It's decorative (`alt=""`), and the name is in the text.
- The error pop-up (a sentence that may wrap) keeps today's 18px corners.
- 768px and wider: same layout, 25rem wide under the header's cart button, as now.

### 3.2 What's lost, and where it still lives

- This reverses decision O6 (`offers-plan.md`): "₹151 away from free shipping" at the moment of adding.
- The shopper still sees it in the product page's delivery terms, and in the cart.
- Screen readers still hear a changed step after "…added to cart", as today. That's spoken, not shown, and stays.

### 3.3 Accessibility

- No change to behaviour: it never takes focus, stays about 8 seconds, pauses under a pointer or focus, and Esc or × closes it.
- × is 40 × 48px (WCAG 2.5.8 asks for 24 × 24).

## 4. Files

| File | Change |
|---|---|
| `snippets/cart-summary.liquid` | New row for the drawer (subtotal + Checkout), the page keeps its stack; remove the ships line and its CSS; the short tax line |
| `snippets/cart-rewards.liquid` | Tick stays beside the words; bar and amounts hidden in the drawer's unlocked state |
| `snippets/cart-line.liquid` | Skip ₹0 discount notes |
| `sections/cart-drawer.liquid` | Pop-up template and CSS; footer padding 16px → 12px |
| `assets/cart.js` | Remove the six lines that fill the pop-up's rewards line. cart.js is at 21.99 of its 22 KB budget; this only makes it smaller |
| `locales/en.default.json` | New `rewards.all_done_short`, `rewards.gift_done_short`; `cart.ships` stays |
| `tools/check.mjs` | New checks, below |
| `docs/decisions.md`, `cart-plan.md`, `offers-plan.md` | Log the change; mark O6 reversed |

`en.default.json`, `check.mjs` and `decisions.md` have another session's unsaved work in them right now. Claim them over SendMessage before editing.

## 5. Checks to add to `tools/check.mjs`

At 360 × 640 and 390 × 844, with the gift unlocked and with a step ahead:

1. Drawer bottom is at most 150px (unlocked) and 195px (step ahead).
2. Subtotal and Checkout share a row; Checkout is at least 48px tall and 150px wide.
3. At least two full cart lines are visible above the bottom at 390 × 844.
4. No "(−₹0)" anywhere in the cart.
5. No "Ships in" in the drawer or on `/cart`.
6. Pop-up: at most 68px tall, "Added to cart" on one line, no rewards line, View cart still opens the drawer.
7. At 320px wide: no sideways scroll in the drawer or the pop-up.
8. Axe on the drawer and the pop-up: 0 violations. The existing cart, offers and gift checks still pass.

## 6. Build order

1. Drawer bottom and the ₹0 notes. Screenshot at 360, 390 and 1440.
2. Pop-up. Screenshot at 360, 390 and 1440.
3. Checks, `npm run check`, then the docs.

## 7. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| C1 | Hide the rewards bar in the drawer once everything is unlocked? | **Yes.** It saves 50px and has nothing left to say |
| C2 | Shorter unlocked wording, "Free shipping and free gift unlocked"? | **Yes**, so it fits one line on a phone |
| C3 | Keep the small tax line under the row? | **Yes**, one 12px line. Dropping it saves 26px more, but "Shipping ₹79" would then only show at checkout |
| C4 | Remove "Ships in 1–3 days" from the cart page too? | **Yes**, so the drawer and the page agree |
| C5 | Hide the "(−₹0)" discount notes? | **Yes** |
| C6 | Pop-up with fully round ends and a round photo? | **Yes** |
| C7 | Give the "Saved" pop-up (hearts) the same shape? | **Yes, as a follow-up.** It has one more button, so it needs its own look |
