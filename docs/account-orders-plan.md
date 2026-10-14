# Account, round 4: orders live on our own page

Status: **Rounds 4–5 committed (bc383f6, not pushed). Round 6 (design pass) built 2026-10-14, not committed. Round 5 part B (our own "Edit your details") waits for the proof in B0. Waiting for Raushan's signed-in look.**

## Why

Raushan landed on `shopify.com/78941028489/account/orders` and `/account/profile` and called it a serious issue: another address, no store header or footer, another layout and feel.

Those are Shopify's hosted account pages. No theme can replace them (classic accounts were retired in February 2026; editing details needs the Customer Account API). Round 3 (`account-branding-plan.md`) styled them. This round stops sending people there for anything a theme can show itself. Raushan chose "orders in our theme" over "styling only" and over a separate hosted app for profile editing (weeks of work, a server to run).

## Every way a shopper reached Shopify's pages, and what happens now

| # | Where | Before | Now |
|---|---|---|---|
| 1 | Order card "Details" | Shopify's order page | "View order" opens the order's own page in our theme (round 5) |
| 2 | "All orders" | Shopify's order list | Earlier orders open on our page |
| 3 | Track order page: latest order, "See your orders" | Shopify's order page and list | Our account page, with that order opened |
| 4 | Sign-in links without the sheet (account page, Track order, Saved, the phone menu's row, the header's plain link) | Signed in, then left on Shopify's Orders page | `routes.storefront_login_url`: signs in, then returns to the page the shopper was on |
| 5 | Shopify's own menu on its pages | Orders, Profile, Saved, Help | Your account (`/pages/account`), Profile, Saved, Help |
| 6 | "Edit your details" | Shopify's Profile page | **Unchanged.** Name, addresses and email offers can only be edited there |
| 7 | Emails ("View your order") and the Thank-you page | Shopify's order status page | **Unchanged.** It is the only order page a guest can open without signing in |
| 8 | The sign-in code page, Google | Shopify's | **Unchanged** |
| 9 | More than 20 orders | – | One quiet "Older orders" link to Shopify's list |
| 10 | Fallbacks used only if the "account" page is deleted (header, account button, Track order) | Shopify's account | Unchanged, as a safety net |

For 6, 7 and 8 the fix is the look and the address: Soft blush background (below), and `account.yarnbasket.in` at launch.

## As built

- **`snippets/account-order-details.liquid`** (new): the pieces (photo, name, option, quantity, line price; a ₹0 line says "Free"; a reduced line shows the old price struck through), Subtotal, each order-level discount by name, Delivery, Total, Payment (Paid / Pay on delivery / Refunded / Partly refunded), any refunded amount, the delivery address, and one tracking line per parcel. Every amount is the order's own field; nothing is recalculated.
- **`snippets/account-order-card.liquid`**: the "Details" link is now a `<details>` row, "Order details", under the buttons. It works without JavaScript. The card's id is the order name (`Order-1001`).
- **`snippets/account-body.liquid`**: the latest 3 orders show; orders 4 to 20 sit behind "N earlier orders". "All orders" is gone. The demo page has a fourth made-up order and made-up details so both can be judged and checked.
- **`assets/account-page.js`**: a link ending `#Order-1001` opens that order's details (and the earlier orders if it is among them), scrolls to it and moves focus there.
- **`snippets/track-order-body.liquid`**: latest order → `/pages/account#Order-…`; "See your orders" → `/pages/account#orders`.
- **Sign-in links** in `account-body`, `track-order-body`, `saved-body`, `header` and `account-button` use `routes.storefront_login_url`, falling back to the old link.
- **Admin (Admin API, read back):** `customer-account-main-menu` is now Your account, Profile, Saved, Help. Orders was removed; Shopify accepted it.
- **Check 13** now fails if any link on the signed-in page other than "Edit your details" goes to Shopify's account pages, if "Order details" doesn't open on the card by keyboard, or if a link to one order doesn't open it. 22/22 pass; money check 12/12.

## Changed from the approved plan

- **No paging.** The plan said 20 orders a page with "Older orders" paging. Paging can't be tested without a real sign-in, so the page shows 20 and links to Shopify's list past that. A shopper with more than 20 orders is rare.
- **The branding colours can't be read by the API** (Plus only), so the white background is a step for Raushan (below).

## Not checked yet (needs Raushan's sign-in; the email code can't be scripted)

1. Order #1001 on `/pages/account`: "Order details" shows ₹965, the free gift as "Free", delivery "Free", the address. The details snippet has only been seen with made-up data.
2. Sign out, then sign in from the account page and from Track order: you should come back to that page, not Shopify's Orders.
3. Shopify's Profile page menu reads Your account, Profile, Saved, Help.
4. **White background:** Settings → Checkout → Customize → the page picker at the top → a customer account page (Profile). If its background is white, set it to `#FBF1EE` like checkout (decisions.md 2026-10-03).

## Sources (2026-10-13)

- `routes` object, `storefront_login_url`: https://shopify.dev/docs/api/liquid/objects/routes
- Customer sign-in links and redirects: https://shopify.dev/docs/storefronts/themes/sign-in

---

# Round 5 (2026-10-14): an order page of its own, and "Edit your details" in our look

Raushan, after seeing round 4: the order's details should be a page of their own (there is a lot to show), and "Edit your details" should not throw people onto Shopify's Profile page. The rest of round 4 stays.

## Part A: the order page (built 2026-10-14)

- **Address:** `/pages/account?view=account-order#Order-1001`. Liquid can't read which order an address asks for, so the page holds the shopper's latest 20 orders and CSS shows the one named after the `#` (`:target`). It works without JavaScript. An unknown order gets "We couldn't find that order" and a way back.
- **On the page:** back to "Your orders", the order's name, date and state, the card's buttons (Track parcel / Buy again / Need help?), then "In this order" (pieces, subtotal, discounts, delivery, total) and a second box with Payment, Delivering to and Tracking. One column on phones, two from 900px.
- **Files:** `templates/page.account-order.json` (+ `-demo`), `sections/account.liquid` ("Show: One order"), `snippets/account-order-page` (the page), `account-order-view` (one order, plain values), `account-order-details` (parts `main` and `side`), `account-order-actions` (the buttons, shared with the card), and `account-order` (one real order: its state, latest shipment, tracking and Buy again are worked out once and handed to the card or the page, so they can't disagree).
- **The card** has "View order" in its corner again; the in-place "Order details" row from round 4 is gone. The Track order page's latest order opens the order page.
- **`account-page.js`** names the browser tab after the order.
- **Check 13:** the demo order page shows one order alone, passes axe on phone and desktop, has its amounts, blocks, buttons and a 44px way back, and no link to Shopify's pages; an unknown order gets the note. 22/22; money check 12/12.

## Part B: "Edit your details" on our own page (not started)

**Correction (Claude):** on 2026-10-13 I said our own profile editing needs a separate hosted app and a server. Shopify's Customer Account API also accepts a "public" client: no secret, a PKCE handshake, with our address registered as a JavaScript origin and callback. So the theme's own JavaScript may be able to do it. This is documented but not proven on our store.

### B0. Proof first

Raushan, in the admin:
1. Sales channels → add **Headless** (free) → Create storefront.
2. In that storefront: **Customer Account API** → application type **Public** (JavaScript / mobile).
3. **JavaScript origin:** `https://yarnbasket-in.myshopify.com`. **Callback URI:** `https://yarnbasket-in.myshopify.com/pages/account`. **Logout URI:** the same origin.
4. Send Claude the **Client ID** (it is not a secret) and the endpoints the page lists.

Then a throwaway script on the dev theme must show: the handshake completes silently for someone already signed in (`prompt=none`); the browser may call the API from our address; reading name and addresses works; one harmless write (email offers off and on) works. **If any fails, part B stops** and "Edit your details" keeps opening Shopify's page.

### B1. Build (only if B0 passes)

- `/pages/account?view=account-details` becomes the edit page on every screen: name, addresses (add, edit, delete, default), email offers.
- New `assets/account-edit.js`, loaded only there; the token is kept for the tab only (session storage).
- Fail soft: if the handshake or a save fails, the details show read-only with a link to Shopify's Profile page, and a check covers that.
- At launch, add `yarnbasket.in` as a second origin and callback, or editing breaks on the new address.

## Not checked yet (round 5, needs Raushan's sign-in)

1. "View order" on order #1001: its page shows ₹965, the gift and delivery as "Free", Payment, the address.
2. Track order → "Your latest order" opens that page.

---

# Round 6 (2026-10-14): a design pass over everything account-related

Raushan: every account page should follow our theme and be easy, clear and good-looking; and nothing account-related we worked on should be missed. Every surface was screenshotted at 360px and 1280px before and after.

| Surface | What changed |
|---|---|
| Order page | A 3-step tracker (Ordered → Shipped → Delivery) replaces the pill. Delivery never says "Delivered" (Liquid can't see it): "On its way. Track your parcel for the delivery date.", or "Not with you yet? Tap Need help." once tracking has lapsed. Getting it ready: step 2 in progress. Cancelled or refunded: the pill and "Cancelled on <date>" instead. Down the page on phones, across from 600px. |
| Order page | Opens at the top (it used to jump 50px to the `#`); the account page's column widths on desktop; "Pink · Qty 2" on one line; Payment, Delivering to and Tracking with icons and dividers; nothing paid yet says "Pay ₹965 on delivery" (the order's own total; part-paid orders say "Part paid, the rest on delivery" with no amount). |
| Buttons, cards and order page | Words never wrap inside a button at 360px; two that don't fit stack full width. |
| "We couldn't find that order" | One "See your orders" and a "Contact us" (Contact page, An order); no duplicate back link. |
| Signed-out account page | "Track an order without signing in" (it led to a page asking to sign in) became "Ordered without an account? Sign in with the same email, and your orders are here." |
| Track order, signed in | "Track →" became "View order →". |
| Desktop account menu | The latest order's state comes from `snippets/account-order` (as: 'label'), the same as its card and page. |
| Shopify's sign-in sheet | Signed out it always shows "Orders" and "Profile", whatever its menu. `saved.js` now points them at a sign-in that returns to our account page (and Your details). It reaches into the component's shadow roots; if Shopify reshapes it, they keep Shopify's links and check 13 fails. |
| No orders yet | A preview template (`page.account-empty-demo.json`) so it can be judged and checked. |
| Not changed | Your details (part B replaces it), the phone drawer's account row, the Saved page's sign-in line. |

Raushan's steps for Shopify's own pages are on the launch checklist: the account pages' background, and the order emails' logo and colour.

Checks: check 13 has the tracker states, 360px buttons, opening at the top, the not-found note, the no-orders preview and the sign-in sheet. 26/26 (9 and 13 together 42/42); money 12/12.
