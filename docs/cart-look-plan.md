# Cart: look and rewards (plan, 2026-10-02)

Raushan asked three things about the cart:
- Should the "2" next to CART sit on the cart icon instead?
- Does the cart drawer and page match the theme?
- Where did the free shipping / free gift progress bar go?

**Built on 2026-10-02 as planned** (see "As built" at the end).

## What's there now

| | What it looks like | Why |
|---|---|---|
| Count | On phones it sits on the icon's corner. On desktop it sits after the word CART ("🛒 CART ②") | `header.liquid` sets the desktop count to `position: static` |
| Cart page | A **white** page between a Soft blush header and a Soft blush footer. Only the summary card is Soft blush | `cart.liquid` is hardcoded to `scheme-white`. The home sections use `scheme-soft` |
| Cart drawer | A **white** panel over a Soft blush page. A big empty gap between the gift note and the subtotal | `.cart-drawer { background: var(--white) }`. The gap is where the rewards line and the "Small add-ons" go (see below) |
| Prices | "Rs. 898.00" in the cart, "₹449" on the cards | The store's currency format (admin). The demo cards print ₹ themselves |
| Progress bar | Missing | **It's built but switched off.** Theme settings → Cart → "Free shipping from (₹)" is 0, and 0 hides it. "Free gift from" is also 0 and no gift product is picked |

The announcement bar says "Free shipping over ₹999" because it's a typed message, not the setting. The cart and the bar can disagree.

**The store's shipping rates don't give free shipping yet.** The offers session found ₹379 at every order total. So today the bar promises something checkout doesn't do. That matters before launch, not now (the store is password-protected).

## Decisions (recommended option first)

### C1. The count goes on the icon's corner on desktop too

- It's the same as phones, and it's the place shoppers look for it.
- The CART pill gets shorter, and the word and icon stay together.
- Same 20px Cocoa Deep circle with Cream text and a light ring. The bump animation when an item is added stays.
- Screen readers are unchanged: the link still says "Cart, 2 items".

Alternative: "CART (2)" as text. It's quieter, but the number is easier to miss.

### C2. The cart uses the home page's colours: Soft blush page, white cards

The theme already has the rule: on a Soft blush (`scheme-soft`) area, cards are white. The home page uses it.

- **Cart page:**
  - `scheme-white` becomes `scheme-soft`, so the page matches the header and footer.
  - The summary card (gift note, subtotal, Checkout) turns white by itself, like a receipt.
  - The lines between items stay as the dashed "stitch" line, in Rose.
- **Cart drawer:**
  - The panel becomes Soft blush, with white for the gift note box.
  - The sticky bottom (subtotal, Checkout) is also Soft blush, with a Rose hairline above it.
  - The item rows get the same dashed stitch line as the cart page.
- **The Checkout button stays Cocoa Deep (dark).** It's the one action that matters most in the cart, so it's the only dark button there. The Blush pill is for the gentle "Shop…" links.
- **Blush (supporting)** stays on the rewards bar's track, the badges and the thumbnails' empty background.

Other pages are still white too: the collection page, search results, account and the 404. The same one-word fix applies to each. I suggest a separate pass, coordinated with whichever session owns each page. **Not part of this plan.**

### C3. Switch the progress bar on: free shipping now, the gift later

- **Free shipping at ₹999 (theme, from here):** set Theme settings → Cart → "Free shipping from" to 999. Then:
  - the cart shows "Add ₹101 more for free shipping" with the bar
  - "Small add-ons" fill the drawer's empty gap while the step is still ahead
  - the cart page's "Little extras" put the cheapest pieces that would reach the step first

  The offers session owns this feature, so I'll check with it first.
- **Free shipping at ₹999 (you, in the admin):** without this, checkout still charges ₹379:
  - Settings → Shipping and delivery → your shipping rate → Add rate → "Free shipping"
  - price ₹0, condition "Based on order price", minimum ₹999
- **Free gift (later, needs you):** pick the gift product, create the "Buy X get Y" automatic discount, then set "Free gift from" (₹1,499 was proposed in offers-plan.md). Until then the bar shows one step, free shipping, which works on its own.

### C4. ₹ instead of "Rs." with ".00" (you, in the admin, about 1 minute)

- Settings → General → Store defaults → Currency display → Change formatting.
- Set both "HTML with currency" and "HTML without currency" to `₹{{amount_no_decimals}}`.
- It fixes every price at once: the cart, the drawer, the hero tag ("Rs. 1,299") and checkout emails.

The theme can't do this properly by itself, because Shopify formats money with the store setting.

## Build steps (after your go)

1. **Claim files with the other sessions:**
   - `sections/header.liquid` (count), `sections/cart.liquid`, `sections/cart-drawer.liquid`, `snippets/cart-summary.liquid` if needed
   - `config/settings_data.json` (the ₹999), only after the offers session agrees
2. **Count:**
   - desktop count on the icon's corner
   - check it at 99+, at 0 (hidden), with the bump, and in Windows contrast mode
3. **Cart page:** `scheme-soft`, the white summary card, and check every state:
   - empty cart (the craft tiles were white on white; they become white on Soft blush)
   - a sold-out line and the stock limit message
   - Undo
   - Little extras
4. **Drawer:** Soft blush panel and bottom, white gift note box, dashed rows, and check:
   - the empty state
   - the "Added" pop-up
   - landscape phone
5. **Rewards:** ₹999 on, then check:
   - under, at and over the amount
   - the spoken update
   - Small add-ons in the drawer
6. **Checks:**
   - `npm run check` (full) and `npm run audit` in all three browsers
   - axe: muted text on Soft blush is 5.7:1, fine, but checked anyway
   - screenshots on phone and desktop for your review before anything is pushed
7. **Record it:** a decisions.md entry, then commit by path only. Push only when you say.

## What you'd do in the admin (when you have 5 minutes)

1. The currency format (C4): the biggest visible fix.
2. Free shipping rate over ₹999 (C3), so checkout matches the bar.
3. Later: the gift product and its discount.

## As built

- **Count:** the desktop count sits on the icon's corner (`top: calc(50% - 23px); left: 27px`), with a 14px gap before CART. Checked at 900, 1100 and 1280px: it doesn't touch the account button.
- **Colours:** the cart page and drawer use `scheme-soft`:
  - both have a Soft blush background, and so do the drawer's sticky bottom and the phone's pinned Checkout bar
  - the summary card is white
  - photo placeholders are Blush
- **Rewards:** `free_shipping_threshold: 999` is in `config/settings_data.json`. The drawer and page show "Add ₹101 more for free shipping" for ₹898.
- **Checks:**
  - `npm run check`: 96/97 pass. The one failure is §11 "shipping rates match Theme settings", which waits on the admin rate.
  - `npm run audit` in Chrome and Safari: clean apart from the known "customer-account-main-menu" notice.
  - `shopify theme check`: clean.
