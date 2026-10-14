# Order emails in our look

Shopify's customer notification emails, restyled to match the store (plan and decisions: `docs/emails.md`).

- `original/<email>.liquid`: Shopify's code as it was, copied from the admin before any change. To undo, paste it back (or use Shopify's "Revert to default").
  - **Getting a new one (since 2026-10-14):** Raushan pastes Shopify's code straight into the empty `original/<email>.liquid` in the editor and saves; no clipboard hand-off. If the editor ever changed the text (formatting, trimmed spaces), the build stops with "found 0×" instead of building something wrong.
  - **Pasting ours back:** open the top-level `<email>.liquid` (never the one in `original/`), Cmd+A, Cmd+C, then paste it into the admin.
  - All 17 emails customers can get are in (2026-10-14).
- `<email>.liquid`: ours. Paste the whole file into the admin: Settings → Notifications → Customer notifications → the email → Edit code → Email body (HTML). Save, then Preview and "Send test email".
- `regions.json`: the only changes allowed per email: listed one-line patches, and regions (our parts) that replace a part of Shopify's original. `parts/` holds the shared style, the help-and-footer, and each email's own parts (the progress bar and message, the tracking box and buttons).
- `npm run build:emails` makes `<email>.liquid` from the original + `regions.json`; `npm run check:emails` proves it. When Shopify updates a default template: copy the new original into `original/`, build, check.
- `mock/`: the first design mock (Order confirmation), from before the build; the final look is in `docs/emails.md` ("Final pass"). Never pasted anywhere.
- Subjects are admin fields, not part of these files: Order confirmation `Order {{ name }} confirmed` (Shopify's), Shipping confirmation `Order {{ name }} is on its way`, Draft order invoice `Your order {{ name }} is ready to pay`, Delivered `Order {{ name }} has arrived`, Out for delivery `Order {{ name }} arrives today`, Shipping update `New tracking details for order {{ name }}`, Order canceled `Order {{ name }} has been canceled`, Order refund `Refund for order {{ name }}`, Abandoned checkout `Your cart is saved`. The others keep Shopify's.

Our changes sit between `yb:start` and `yb:end` markers. Everything else is Shopify's original, so its logic for pieces, discounts, taxes and totals is untouched. `npm run check:emails` proves that, and that every amount is still printed. Run it before pasting anything. To copy a finished email for pasting: `pbcopy < emails/order-confirmation.liquid`.

| File | Admin email |
|---|---|
| `order-confirmation.liquid` | Order confirmation |
| `shipping-confirmation.liquid` | Shipping confirmation |
| `delivered.liquid` | Delivered (under Shipping updates) |
| `draft-order-invoice.liquid` | Draft order invoice |
| `pickup-receipt.liquid` | Picked up by customer: **not pasted**. Shopify sends it only for local pickup, which we don't offer, and the admin hides it while pickup is off. Kept ready in case pickup is ever switched on. Never paste it into "Ready for local pickup", which is a different email. |
| `out-for-delivery.liquid` | Out for delivery |
| `shipping-update.liquid` | Shipping update |
| `order-canceled.liquid` | Order canceled |
| `order-refund.liquid` | Order refund |
| `abandoned-checkout.liquid` | Abandoned checkout |
| `order-edited.liquid` | Order edited |
| `order-invoice.liquid` | Order invoice |
| `payment-error.liquid` | Payment error |
| `pending-payment-error.liquid` | Pending payment error |
| `pending-payment-success.liquid` | Pending payment success |
| `contact-customer.liquid` | Contact customer |
| `email-change-confirmation.liquid` | Customer email address change confirmation |
