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

## Offers: free shipping, free gift, COD (docs/offers-plan.md §5, §7)
The theme side is built. Everything stays hidden until these are done, and `npm run check` section 11 then compares the theme with the admin. Do them in this order:
- [ ] **Meesho average order value** (last 3 months). Free shipping should sit about 15–30% above it. The plan's amounts are ₹999 and ₹1,499.
- [ ] **Shipping rates** (Settings → Shipping and delivery → India). Today there's one rate, "मानक" at **₹379**, which is Shopify's default.
  - "Standard": the real fee (for example ₹79), condition "order price" ₹0 – ₹998.99
  - "Free shipping": ₹0, condition "order price" ₹999 and up
- [ ] **Gift product:** its real price (for example ₹149), stock tracked, 30+ made. Online Store channel on, so it can be added to the cart, but in no collection; hide it from search (Search & Discovery, or the `seo.hidden` metafield set to 1).
- [ ] **Collection "Shop"** (automated): every product except the gift (for example "Tag is not equal to free-gift", and tag the gift `free-gift`).
- [ ] **Discount** (Discounts → Create → Buy X get Y, Automatic):
  - Customer buys: minimum purchase amount ₹1,499, from the collection "Shop"
  - Customer gets: 1 × the gift, "Free"
  - Maximum uses per order: 1
  - Combinations: allow product discounts and shipping discounts
- [ ] **Theme settings → Cart:** Free shipping from 999, Standard shipping fee 79, Free gift from 1499, Free gift product, and Cash on delivery only once COD works at checkout.
- [ ] Run `npm run check`: "Offers: shipping rates match Theme settings" and "Offers: the free gift arrives free" must pass. Changing an amount later means changing it in three places: Theme settings, the shipping rate and the discount. Then run the check.
- [ ] **CA question:** how to treat free gifts under GST (input tax credit on goods given away free may need reversing, Section 17(5)(h)).
- [ ] **Terms of service and FAQ:** one line: "Free gift while stocks last, one per order. If part of an order is refunded and it falls under ₹1,499, the gift is yours to keep."

## Store setup
- [ ] Currency format `₹{{amount_no_decimals}}` (Settings → General → Store currency)
- [ ] Search & Discovery: synonyms, Popular searches menu, product filters (search-plan §10)
- [ ] Bestsellers collection
- [ ] WhatsApp number in Theme settings → Social
- [ ] Payment gateway and COD (decisions.md "Still open")
