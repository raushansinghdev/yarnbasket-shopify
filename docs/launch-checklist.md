# Before launch: admin and legal checklist

Things to finish in the Shopify admin (Raushan) before the store opens. Deferred on 2026-10-02 so the work can stay on the UI. Detailed steps are in `account-plan.md` §11 and `search-plan.md` §10.

## Done
- [x] Pages "Saved" (`/pages/saved`) and "Track your order" (`/pages/track-order`)
- [x] Customer account main menu: Saved, Track an order
- [x] Privacy policy exists
- [x] "Include sales tax in product price and shipping rate" is on

## Legal
- [ ] **Terms of service:** paste `docs/legal/terms-of-service.html` (Settings → Policies → Terms of service → `</>` code view → paste → Save). First confirm the assumptions it makes:
  - support hours Mon–Sat 10am–6pm
  - COD "may carry a small fee"
  - a photo before dispatch for custom pieces
  - prices include GST
  - reviews credited by first name
  - liability capped at the order amount
- [ ] **Refund policy:** to be written to match the terms:
  - no change-of-mind returns
  - damaged, wrong or missing items reported within 48h with an unboxing video
  - replacement or full refund, paid within 5–7 working days; COD refunds to UPI or bank
  - creased bouquet paper isn't damage
- [ ] **Contact information policy** (marked "Required"):
  - Yarn Basket, sole proprietorship of Priya Singh
  - Piro, Bhojpur, Bihar 802207
  - weyarnbasket@gmail.com, +91 93219 79410
  - GSTIN 10SVFPS1772F1ZB
  - grievance officer Priya Singh
- [ ] Have a lawyer or CA review all policies once

## Tax
- [ ] Taxes and duties → India → Collect GST, with GSTIN 10SVFPS1772F1ZB (Shopify assumes 0% until this is done)
- [ ] Ask the CA for the GST rate and HSN code for the crochet products, then add a tax override if Shopify's default doesn't match
- [ ] Customs information → default country of origin: India

## Accounts and checkout
- [ ] Sign in with Google (account-plan §11 step 2; needs the Google Cloud setup)
- [ ] Checkout & accounts branding: logo, colours, fonts (account-plan §11 step 3)
- [ ] Customer accounts: sign-in links on; sign-in optional at checkout; shipping phone number required
- [ ] Self-serve returns, with made-to-order pieces as final sale (return rules)
- [ ] Notification emails: logo and Cocoa accent
- [ ] Account domain `account.<domain>` once the domain is connected
- [ ] Sign in once on the preview link so the signed-in states can be checked

## Store setup
- [ ] Currency format `₹{{amount_no_decimals}}` (Settings → General → Store currency)
- [ ] Search & Discovery: synonyms, Popular searches menu, product filters (search-plan §10)
- [ ] Bestsellers collection
- [ ] WhatsApp number in Theme settings → Social
- [ ] Payment gateway and COD (decisions.md "Still open")
