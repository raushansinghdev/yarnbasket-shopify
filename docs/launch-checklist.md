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
- [ ] Sign in with Google: being set up now on the dev store (account-hub-plan §7). At launch, only add the `account.yarnbasket.in` origins and redirect URIs to the same OAuth client, then verify the brand and add the logo in Google Cloud.
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
- [x] **Gift product: import `tools/gift-product.csv`** (Products → Import → upload it → "Upload and preview" → "Import products"). It's a separate product, "Sunflower Keychain" (handle `sunflower-keychain-free-gift`, tag `free-gift`, type "Free gift", ₹249, 30 in stock, 40 g), with the single-sunflower photo. It isn't the keychain you sell, so paid keychains are never mistaken for the gift. Then on the product page, check the weight and stock, and keep it out of every collection. **Theme settings already point at it** (Free gift from 1499; settings_data.json, 2026-10-02).
- [x] **Collection "Shop"** (automated): every product except the gift (for example "Tag is not equal to free-gift", and tag the gift `free-gift`).
- [x] **Discount** (Discounts → Create → Buy X get Y, Automatic):
  - Customer buys: minimum purchase amount ₹1,499, from the collection "Shop"
  - Customer gets: 1 × the gift, "Free"
  - Maximum uses per order: 1
  - Combinations: allow product discounts and shipping discounts
  - Done 2026-10-03: "Free sunflower keychain over ₹1,499", Active, read back through the read-only admin login (product, order and shipping combinations all on). A later sale must also allow product discounts, or the gift stops being free during it.
- [ ] **Theme settings → Cart:** Free shipping from 999 ✓, Free gift from 1499 ✓ and the gift product ✓ are set. Still to do: Standard shipping fee (the same as your paid rate), and Cash on delivery only once COD works at checkout.
- [x] Run `npm run check` (83/83 on 2026-10-03): "Offers: shipping rates match Theme settings" and "Offers: the free gift arrives free" must pass. Changing an amount later means changing it in three places: Theme settings, the shipping rate and the discount. Then run the check.
- [ ] **CA question:** how to treat free gifts under GST (input tax credit on goods given away free may need reversing, Section 17(5)(h)).
- [x] **FAQ:** the gift line, with the amount, is in the automatic "Shipping and offers" answer (`offers.faq_gift`, so it follows the threshold). The Terms draft has it in §5 "Free gift", with no amount, so changing the threshold won't need a Terms edit.

## Store setup
- [ ] Currency format `₹{{amount_no_decimals}}` (Settings → General → Store currency)
- [ ] Search & Discovery: synonyms, Popular searches menu, product filters (search-plan §10)
- [ ] Bestsellers collection
- [ ] WhatsApp number in Theme settings → Social
- [ ] Payment gateway and COD (decisions.md "Still open")
