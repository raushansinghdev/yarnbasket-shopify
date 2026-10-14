# Order emails in our look

Status: **Approved 2026-10-14. Order confirmation and Shipping confirmation pasted (final pass); Draft order invoice and Picked up by customer built 2026-10-14 (check 37/37 for all four). Tests by Raushan later.**

## Why

Raushan (2026-10-14): the emails should look top-notch and match the website, and they must never break.

## The rule: restyle, don't rewrite

About 80% of each Shopify email template is Liquid that decides which pieces, discounts, free lines, taxes, totals, payment notes and delivery estimates to print, including bundles, split deliveries, gift cards and pending payments. That part makes an email correct, and Shopify maintains it. We leave it exactly as it is.

We change only the presentation, which is also all a customer notices: the `<style>` block, the header, the title and message wording, the buttons, the footer. Each change sits between `yb:start` / `yb:end` markers. `npm run check:emails` (`tools/email-check.mjs`) proves that everything outside the markers is Shopify's original, that every amount the replaced parts printed is still printed, and that the Liquid blocks pair up.

## As built (Order confirmation, 2026-10-14)

Raushan's brief for the build: words as on the website (no "studio"), easy to read, every important fact, no filler, space used carefully, edge cases covered.

- **Kept from Shopify, untouched:** every line, amount, discount, tax, total, "You saved", amount due, payment method, delivery estimate, and every branch (pending payment, pay-on-fulfilment, pickup, local, split delivery, gift cards, RTL).
- **Ours:**
  - Title "Thank you, Myra!" (no first name: "Thank you for your order!").
  - One line of what happens next: "We're getting it ready. It ships within 1–2 days, and we'll email you the tracking link." Each other branch has its own short line.
  - The Shop-app button is removed.
  - Discount names are in sentence case, and there are no "(-₹0)" lines.
  - "Delivery & payment", "Delivering to", "Delivery method".
  - The billing address shows only when it differs from the delivery address.
  - A help strip: WhatsApp prefilled with the order number, or reply.
  - The footer has the shop, Instagram, the store email, and the shipping, returns and privacy policies.
- **Layout:** blush header band with the logo and order number; white body; sections divided by thin rose lines (no rounded cards: they break in Outlook and in Gmail's handling of nested tables); blush footer band. 16px body text, 15px lines, total 19px bold, 13px minimum for secondary text, AA contrast, 44px button, `color-scheme: light`.
- **The 3-step strip** was left out at first, since at confirmation it always says the same thing. The final pass (below) brings it back as a progress bar shared by every order email, so each email reads as the next step.

**How it's built:** `npm run build:emails` (`tools/email-build.mjs`) applies `emails/regions.json` to Shopify's original:
- 8 listed patches, each with its count and reason;
- 4 regions: the title, the message (words only), the style, and the help strip and footer, the last three from `emails/parts/`.

`npm run check:emails` then proves the result independently. It was tested against six deliberate breaks:
- an amount's format changed;
- a branch changed in the message;
- the store email dropped;
- an address condition changed;
- a block left open;
- and a link swapped while its output stayed.

The first five failed the check. The swapped link passes by design, because the output itself stays.

## As built (Shipping confirmation, 2026-10-14)

The tracking is what this email is for, so it comes first and gets the button.

- **Original:** saved as `emails/original/shipping-confirmation.liquid`, 28,708 characters, 580 lines. The clipboard had changed by the time it was saved, so it was rebuilt from my full read of it. The size and line count match the copy exactly.
- **Title and line:** in the site's words, one for each of Shopify's five cases.
  - Whole order: "Your order is on its way / It's with the courier and usually arrives in 3 to 7 days."
  - Last pieces: "The rest of your order is on its way / They're with the courier and usually arrive in 3 to 7 days."
  - Part of it: "Part of your order is on its way / These pieces usually arrive in 3 to 7 days. The rest follow in another parcel, and we'll email you when it ships."
  - One piece: the singular versions.
  - "Expected by <date>" when the courier gives a date.
  - **The 3 to 7 days is the shipping policy's delivery time.** If the policy changes, change this line too (`emails/regions.json`, "title-body").
- **Progress bar** (Ordered ✓, Shipped ✓ bold, Delivery to come): see "Final pass" below.
- **One box** (`parts/parcel-box.liquid`, with `parcel-setup`, `steps-shipped` and `parcel-buttons`; shared by the shipping family), blush:
  - **Tracking:** "Blue Dart · 77001234567", with the number linked. Shopify's three cases are kept: one number with a link, one without, several. Only the number breaks across lines, never the courier's name.
  - **Delivering to**, under a thin divider: name, address, then city, PIN and state, from `shipping_address`. It shows only when there is an address. A shopper who spots a wrong address can WhatsApp before delivery.
- **Pay on delivery:** "Pay ₹420 on delivery." appears only when the order still has an amount due (`total_outstanding`, partial COD). When nothing is due, or Shopify doesn't provide the figure, it doesn't show.
- **One button:**
  - "Track parcel", to the courier's page, when the parcel has exactly one tracking link, with "View order" as a text link beside it;
  - otherwise "View order" (Shopify's order page, which any shopper can open);
  - with no order page, "Visit our store".
  - No Shop-app button, and no "or Visit our store".
- **"In this parcel":** Shopify's list, restyled ("2 of 3" for split lines, Refunded, add-ons). There are no discount lines under pieces, because this email shows no prices.
- **Header, help strip and footer:** shared with Order confirmation (`parts/style.liquid`, `parts/footer.liquid`).
- **Seen in a local render** of the built template (liquidjs, sample data, Gmail's fallback fonts) at 360 and 760px. Cases checked: one link, partial COD due, a 30-character number with no link, two numbers with one link on a partial shipment, and no tracking with one piece. Nothing overflows, and the button is 46px tall.
- **The check got stricter on the way:** a `keep` output must now be printed in `{{ }}` and match as a whole name. Before, `fulfillment.tracking_url` counted as kept because `fulfillment.tracking_urls[…]` was there, and a name left only in an `{% if %}` counted too. Four deliberate breaks to the tracking now fail it: the link, the courier, the single number, the numbers of a multi-parcel order.
- **Subject** (an admin field, typed into the email's Subject box): `Order {{ name }} is on its way`. Shopify's was "A shipment from order #1001 is on the way".

## Final pass, both emails (2026-10-14)

Raushan asked for a final, reliable version before re-pasting: great looking, matching the site, easy to read, every detail properly formatted.

- **Phones get the email at full size.**
  - **The cause:** the content was fixed at `width: 560px !important`. When Shopify sends, it writes styles onto each element, and our phone rule (`92%`) can't undo an inline `!important`. So the Gmail app shrank the whole 560px email to fit, and the Android screenshot showed tiny text.
  - **The fix:** the content is now `width: 100%; max-width: 560px`, and each band has 16px side padding. There is no phone rule for the width any more.
  - **Proof:** I rendered the templates with every style inlined (`juice`, the way Shopify sends), with Shopify's fixed 560px forced on as well. At 360px the content is 328px wide and the text 16px; at 568px (Shopify's preview) it's 536px; at 760px it's 560px. Nothing scrolls sideways.
- **Totals at full width** (Order confirmation). Shopify's empty `subtotal-spacer` column is hidden: it put the totals in the right half and squeezed them on phones. Each amount is level with its label (measured 0px off, 2px on the bold Total).
- **Progress bar, the standard for every order email.** Three bars like the order page's steps, done in Cocoa and to come in rose, built from table cells only (`bgcolor` as well, so it survives everywhere).
  - The current step is bold, and done steps have a ✓, so the state reads without colour.
  - Order confirmation: ✓ Ordered, then Shipped, then Delivery. Shipping: ✓ Ordered, ✓ Shipped, then Delivery.
  - The next emails (out for delivery, delivered) use the same bar.
- **Order confirmation wording, as on the site** (patches in `emails/regions.json`):
  - "View order" (was "View your order");
  - the "or Visit our store" link beside the button is gone;
  - "Delivery" (was "Shipping") in the totals;
  - "In this order" (was "Order summary");
  - **"GST, included" (was "Taxes").** Our prices include GST, and a plain "Taxes ₹90" between Subtotal and Total read like an extra charge. It uses Shopify's `taxes_included`; if that variable were ever missing, the label is just "GST".
- **The check gained one thing:** a region may be a single line (no "to"). It is used for the message line, which keeps `{{ email_body }}` and adds the progress bar after it (`parts/order-confirmation-status.liquid`).
- **Deliberate breaks, all caught:**
  - the address name or city dropped;
  - the order message dropped;
  - the GST label's `{% if %}` left open;
  - the GST amount's `| money` removed from the built email;
  - a label hand-edited in the built email.
- **Size:** with every style inlined, Order confirmation is about 55 KB and Shipping about 40 KB, under Gmail's 102 KB clipping limit.

## As built (Draft order invoice, 2026-10-14)

This is the email Raushan sends from a draft order, for example a custom piece agreed on WhatsApp. It is the customer's way to pay.

- **Original:** `emails/original/draft-order-invoice.liquid`, 43,187 characters, 945 lines, saved straight from the clipboard.
- **Title:**
  - "Your order is ready to pay";
  - "Review and confirm your order" for payment terms, which we don't use.
- **Line under the title:** "We're holding these pieces for you until Friday, 16 October at 2:29 pm." (one piece: "this piece").
  - **If Raushan writes a message** in Shopify's "Send invoice" box, that message shows instead. This is Shopify's own logic: the message replaces the hold line.
- **One button, "Pay now"** (was "Complete your purchase"). There's no "or Visit our store".
- **No progress bar:** nothing has been ordered yet.
- **Same fixes as Order confirmation:**
  - "In this order";
  - totals at full width;
  - "Delivery" instead of "Shipping";
  - "GST, included" (was "Estimated taxes");
  - discount names in sentence case with no ₹0 lines;
  - "Delivery & payment", "Delivering to", "Delivery method";
  - the billing address only when it differs.
- **Help strip:** a draft invoice has no order number yet, so the shared footer now falls back to the invoice's own (`order_name | default: name`). WhatsApp opens with "…my order #D182". For the other emails, the output is the same as before.
- **Subject** (admin field): `Your order {{ name }} is ready to pay`. Shopify's was "Invoice #D182".
- **Seen in a local render** (styles inlined) at 360 and 760px, with the hold line and with a custom message. Nothing scrolls sideways.

## As built (Picked up by customer, 2026-10-14)

Sent only for local-pickup orders. We don't offer pickup, so Shopify won't send it unless pickup is switched on. It's restyled anyway, so every email looks the same if that ever changes.

- **Original:** `emails/original/pickup-receipt.liquid`, 70,300 characters, 1,428 lines.
- **Changes:**
  - our style, help strip and footer;
  - the line becomes "We hope you love it. Thank you for shopping at Yarn Basket.";
  - discount names in sentence case with no ₹0 lines;
  - "In this order", "Delivery", and "GST, included".
- **Kept from Shopify:** the title ("Your order has been picked up"), "Items picked up", and the "Visit our store" button, which is the only sensible action after pickup.
- **No local render:** it is never sent while pickup is off. The check passes, and Shopify's Save validates the Liquid.

## As built (Delivered, 2026-10-14)

Sent when the courier marks a parcel delivered (Shiprocket's status reaches Shopify). It's the same look as Shipping confirmation, from the same parts.

- **Original:** `emails/original/delivered.liquid`, 26,072 characters, 511 lines. It is Shipping confirmation's code without the expected date and the Shop-app buttons, plus Shopify's "Haven't received your package yet? Let us know", and it never printed its own message.
- **Top to bottom:**
  - the title: "Your order has arrived" (or "The rest of…", "Part of…", "The last piece of…", "One piece of your order has arrived");
  - "We hope you love it." Partial parcels add "The rest of your order comes in another parcel", and the last one says "That's everything in your order";
  - the progress bar with all three steps done (`parts/steps-delivered.liquid`);
  - the parcel box (`parts/parcel-box.liquid`) with "Delivered to". Its tracking number still links to the courier's page;
  - what to do if something is wrong (`parts/delivered-claim.liquid`), in the refund policy's words: "Something damaged, wrong or missing? Tell us within 48 hours, with an unboxing video or clear photos, and we'll send a replacement or refund you in full." Plus "Parcel not with you? Tell us and we'll take it up with the courier", which keeps Shopify's not-received case. The help strip below gives WhatsApp and reply;
  - one "View order" button (`parts/delivered-buttons.liquid`), or "Visit our store" when there's no order page.
- **No "Pay ₹X on delivery":** a COD order that isn't marked paid yet would otherwise ask for money after delivery. The shared box's line is switched off for this email with the region's `words`.
- **Tool:** a replace region may now have `words`, which change a shared part's wording for one email only. The shipping parts are unchanged, so the four pasted emails build byte-identical.
- **Breaks the check catches:** the tracking link, the order page, the message, and the PIN code each removed from the built file fail the check. The first try passed wrongly, because the shared buttons still printed the tracking link in a branch Delivered can never show. That is why Delivered has its own buttons.
- **Subject** (admin field): `Order {{ name }} has arrived`.
- **Seen in a local render** (styles inlined) at 360 and 760px: a full parcel, unpaid COD, a partial parcel with two numbers, and no tracking. Nothing scrolls sideways, and it's about 40 KB inlined.

## As built (the other 12, 2026-10-14)

Raushan pasted Shopify's code into the empty `emails/original/<email>.liquid` files himself (no clipboard hand-off). The entries in `emails/regions.json` reuse the same patches as the first five (sentence-case discount names, no ₹0 lines, the site's labels, GST, one button, the billing address only when it differs) and the shared style and footer.

- **Out for delivery:** Shipping confirmation's parts with `steps-out`.
  - "Your order arrives today" (and the partial-parcel versions), followed by "It's out with the courier. Keep your phone nearby, as they may call before delivering."
  - Keeps "Pay ₹X on delivery" and "Track parcel". Hides the expected date, which would contradict "today".
- **Shipping update:** "Your tracking details have changed" / "Here are the new details for your parcel", with the shipping parts. Shopify printed an empty paragraph for a date it never sets; that paragraph now shows only when it has text.
- **Order canceled:** Shopify's message is replaced (`parts/canceled-body.liquid`), because it had no sentence for an unpaid (COD) order and said "staff error". Ours:
  - **Why:** at your request; out of stock ("We're sorry"); payment didn't go through; a mistake on our side; otherwise no reason.
  - **The money:** refund on its way to your original payment method (5 to 7 working days); payment released; we'll refund what you paid; or nothing was charged (a safe fallback).
  - Orders are only prepaid or partial COD, and a cancel comes before dispatch, so the money paid is always the online payment, and the original payment method is always right.
  - The list is headed "Canceled pieces".
- **Order refund:** "We've refunded **₹X** to your original payment method. It usually reaches you in 5 to 7 working days." This is the refund policy's wording and timing, not Shopify's "up to 10 days", and the amount is Shopify's own output. When the order has a cash-on-delivery payment (partial COD, refunded after delivery), it adds the policy's "Any part you paid in cash on delivery comes to your UPI ID or bank account instead." That case is detected from a transaction whose gateway name contains "cash" or "cod", as Shopify's manual "Cash on Delivery (COD)" does. Confirm this on the first partial-COD refund.
- **Abandoned checkout:**
  - "Your piece(s) are still in your cart" / "Hi Myra, we've saved your cart. Finish your order whenever you're ready." No false urgency.
  - The button reads "Complete your order", and the list is headed "In your cart".
- **Order edited:** "Your order has been updated" / "Here's your order as it is now." Shopify printed an empty message here.
- **Order invoice:** "Please pay ₹X", plus "by <date>" only when Shopify has a due date, or "…before we ship your order" (`parts/invoice-heading.liquid`). Raushan's preview showed "Please pay ₹3,532 by" with nothing after it: an invoice for an order without payment terms (the usual case here) has no date, and Shopify's own heading had the same gap. The date is now printed to text first, and "by" appears only when that text isn't empty.
- **Payment error:** "Your payment didn't go through" / "Nothing was charged. Your cart is saved, so you can try again." The button reads "Back to your cart".
- **Pending payment error:** "Your payment for order #1001 didn't go through" / "Nothing was charged. Please try paying again." The help strip asks "Trouble paying?".
- **Pending payment success:** "We've received your payment for #1001".
- **Contact customer:** only our style and footer around Raushan's own message.
- **Email address change:**
  - Our heading, then "Your Yarn Basket account now uses a new email address", the old and new addresses, and "Didn't make this change? Tell us right away".
  - Shopify's second style block (grey text, blue links) is removed (`parts/no-style.liquid`).
- **Emails not about one order** (cart, payment error, account, your messages): the help strip says "Questions?" (or "Questions before you order?", "Trouble paying?"), and WhatsApp opens without an order number. This uses the footer region's `words`.
- **Checks:** the check passes 154/154. Deliberate breaks fail: the refund amount, every copy of the canceled order's number, every copy of the out-for-delivery tracking link, and the cart link.
- **Seen in a local render** (styles inlined) at 360 and 760px: 20 cases, including COD, out of stock, a declined payment, partial and full refunds, and a cart with no name. Nothing scrolls sideways, and the largest is 56 KB.
- **Subjects** (admin fields; the rest keep Shopify's):
  - Out for delivery: `Order {{ name }} arrives today`;
  - Shipping update: `New tracking details for order {{ name }}`;
  - Order canceled: `Order {{ name }} has been canceled`;
  - Order refund: `Refund for order {{ name }}`;
  - Abandoned checkout: `Your cart is saved`.

## The look

The account pages' system, adapted to email:
- Soft blush page (`#FBF1EE`), white cards with an 18px radius (Outlook draws square corners, which is fine), our logo top left and the order number top right.
- Cocoa Deep `#4E3A31` headings, text and pill buttons; Taupe `#705B52` secondary text (4.5:1 or better on white and on blush); Blush `#F2D4CC` help strip.
- **Fonts (fixed 2026-10-14):** the site's own faces, loaded with `@font-face` from Google Fonts in `parts/style.liquid`: Cormorant Garamond 600 italic for headings (the site's weight and -0.01em spacing) and Jost for text. Until then the email only named them without loading them, so every app, Shopify's preview included, showed Georgia and Helvetica, and Raushan saw that it didn't look like the site. Apple Mail, iPhone Mail, Outlook for Mac, Samsung Mail and the preview now show the real faces. Gmail never loads web fonts, so it uses the nearest face the device has: Futura (Jost is drawn from it) or Century Gothic for text, and Baskerville, Garamond or Georgia for headings. Android's Gmail has none of these and shows Roboto and Noto Serif.
- **Order confirmation, top to bottom:** "Thank you, <first name>!", what happens next (leaves the studio in 1–2 days, tracking by email), the three steps as on the order page (Ordered → Getting it ready → Delivery), one "View your order" button (Shopify's order page, the only one a guest can open), then "In this order" (Shopify's lines and amounts, restyled), "Delivering to" and "Payment", a help strip ("Questions about this order? WhatsApp us with #1001, or just reply to this email"), and the footer.
- **Footer, the same in every email:** "Handmade with love in India", yarnbasket.in · Instagram · the store email, and Shipping · Returns & refunds · Privacy.
- **Removed:** the purple "Track order with Shop" button (it advertises Shopify's app and leads away from us), and the "(-₹0)" discount lines under paid pieces.

## Order of work

1. **Pilot, Order confirmation.** The mock is judged first. Then Raushan copies Shopify's full code into the clipboard and I save it with `pbpaste` as `emails/original/order-confirmation.liquid` (the chat cut the pasted copy at 50,000 characters). I write `emails/order-confirmation.liquid` and its entry in `emails/regions.json`, and run the check. Then Raushan pastes, previews and sends a test.
2. **The rest, one at a time, in this order.** Decided 2026-10-14 from Raushan's screenshots of the full Customer notifications list.
   - **Done (built 2026-10-14):** all 17. Order confirmation, Shipping confirmation, Draft order invoice, Picked up by customer, Delivered, then the 12 below; a to e are built, and only the skipped ones are left.
   - **a. Every parcel:** Delivered, Out for delivery, Shipping update. Out for delivery and Delivered are switched on, and Shiprocket's status mapping triggers them. They share `parts/parcel-*` and a progress bar in its own state (`steps-out`, `steps-delivered`).
     - **Delivered** adds the claim rule from the refund policy: WhatsApp within 48 hours with an unboxing video or clear photos.
   - **b. Money:** Order canceled and Order refund. They state the refund timing from the refund policy (5 to 7 working days, to the original method). Every amount stays Shopify's.
   - **c. Sales:** Abandoned checkout. Check again if Shiprocket Checkout's own recovery replaces it.
   - **d. Occasional:**
     - Order edited;
     - Order invoice (outstanding balance);
     - Payment error;
     - Pending payment error and Pending payment success;
     - Contact customer;
     - Customer email address change confirmation.
   - **e. Only if self-serve returns are switched on:** Request received, Return request approved and Return request declined, Return created, Cancellation request declined.
   - **Skipped, never sent for this store:**
     - local delivery (3, switched on but harmless without local delivery);
     - gift cards, store credit, POS, B2B;
     - Customer payment method add request, Payment reminder, Order payment receipt;
     - Order link;
     - the US-only return label;
     - the classic-account invite, welcome and password reset (we use new customer accounts);
     - Customer marketing confirmation (off).
   - **Not ours to edit:** "Remarketing with Shop" (cart reminder, back in stock, price drop, browse abandonment) is switched on. Shop sends these in its own look to Shop-app users. Raushan's call whether to keep it on.
3. **Not now:** marketing emails, staff notifications.

## Before an email counts as done

1. `npm run check:emails` passes for it.
2. Shopify accepted the save (it refuses broken Liquid).
3. Preview and a test email look right in Gmail on the web, the Gmail app on Android, and Apple Mail on iPhone (screenshots).
4. For order emails, one real test order: every amount in the email equals the admin's order (pieces, discounts, the free gift, delivery, taxes, total). Recorded below.

## Keeping them right

Ours don't follow Shopify's future changes to the default templates. Once a year, or when Shopify announces email changes, copy a fresh default into `emails/original/`, carry our parts over, and run the check.

Open question for the Shiprocket setup: Shiprocket can send its own shipping messages too; decide whether customers get both.

## Test record

| Date | Email | Check | Gmail web | Gmail Android | Apple Mail | Amounts vs admin |
|---|---|---|---|---|---|---|
| 2026-10-14 | Order confirmation, first paste | 9/9 | PDF only (printing drops backgrounds, so the button and bands can't be judged) | Works; dark mode darkens the header and hides the transparent logo | – | – |
| 2026-10-14 | Order confirmation, round 2: logo with its own blush background (`docs/branding/logo-email-blush.png`, upload in Customize email templates), no spacer row above the button, prices level with names | 9/9 | Fits, 560px centred; button twice as tall (Shopify's padding + ours) | Dark mode: logo readable on its badge | – | – |
| 2026-10-14 | Order confirmation, round 3: no side padding outside the 560px content (Shopify's ~568px preview frame cut the right edge), phones get a 92% width, button padding only on the link (46px tall) | 9/9 | – | – | – | – |
| 2026-10-14 | Order confirmation: the "Gift bundle" with a grey no-image box in Shopify's preview is preview sample data (a Shopify bundle); our combos are discounts, not bundles, so real orders don't have it | – | – | – | – | – |
| 2026-10-14 | Shipping confirmation, first build | 19/19 (both) | Footer, help strip and items fine, but the footer was left-aligned (Shopify writes text-align: left onto the inner cells, which beat our inherited centring) | – | – | First Shiprocket label: courier and link match Shiprocket's |
| 2026-10-14 | Both emails: footer centred on the inner cells too, as in the approved mock | 19/19 | – | – | – | – |
| 2026-10-14 | Draft order invoice, first build | 29/29 (all three) | Local render, styles inlined: 360/760px | – | – | A real draft order: total and Pay now reach checkout at the same amount |
| 2026-10-14 | Both emails, final pass: fluid width (phones at full size), totals at full width, progress bar, site wording, GST label, address in shipping | 20/20 | Local render, styles inlined: 360/568/760px, no sideways scroll, 16px text at 360px | – | – | – |
| 2026-10-14 | Delivered, first build | 46/46 (all five) | Local render, styles inlined: 360/760px, four cases | – | – | First Shiprocket delivery: the email arrives, with "Delivered to" and the claim rule |
| 2026-10-14 | All five: the site's fonts loaded (they were only named before, so the preview showed Georgia/Helvetica), headings 600 as on the site, closer fallbacks for Gmail | 46/46 | Local render next to our theme's refund page at 390px: same faces; Gmail-style render (no web fonts) in Futura/Baskerville. Order confirmation 61 KB inlined at most | – | – | – |
| 2026-10-14 | The other 12, first build | 154/154 (all 17) | Local render, styles inlined: 20 cases at 360/760px, no sideways scroll, 56 KB at most | – | – | Test cancel and test refund: amounts equal the admin's |
| 2026-10-14 | All 16 pasted and saved by Raushan (all except `pickup-receipt`, which is never sent); "Ready for local pickup" reverted to Shopify's default after a mistaken paste | 154/154 | – | – | – | Still to do: a test cancel and a test refund |
