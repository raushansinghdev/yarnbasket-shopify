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
- [x] **Sign in with Google: live 2026-10-03.** Google Cloud project "Yarn Basket", created with the business Gmail with Raushan's personal Gmail as a second Owner. OAuth client "Shopify customer accounts", app published ("In production"), no logo. Branding links point at yarnbasket-in.myshopify.com for now. The secret is only in Shopify.
- [ ] **Google sign-in, launch-day changes** (Client ID and secret stay the same, and nothing changes in Shopify's Google settings):
  1. **About a week before launch:** verify `yarnbasket.in` in Google Search Console with the business Gmail. Google's brand review needs it, and it can take days.
  2. After the domain is connected in Shopify, open **Settings → Customer accounts → Authentication → Google**. Shopify then lists the new `account.yarnbasket.in` values. **Add** them to the OAuth client's JavaScript origins and redirect URIs, and **keep** the old ones.
  3. **Branding:** home page `https://yarnbasket.in`, privacy `https://yarnbasket.in/policies/privacy-policy`, terms `https://yarnbasket.in/policies/terms-of-service`, authorised domain `yarnbasket.in`. Then upload the logo (`docs/branding/`) and submit for brand verification, so Google's popup says "Yarn Basket".
  4. **When the @yarnbasket.in Workspace email exists:** add it as Owner (IAM), and make it the support and developer contact email.
  5. Test: sign in with a Gmail that has never signed in before, on Android Chrome and iPhone Safari, on the live domain.
- [x] **Checkout & accounts branding: done 2026-10-03** (Settings → Checkout → Customize, "Yarn Basket configuration"). Values are in decisions.md 2026-10-03 "Checkout and account pages branded". Sign in with Shop is off.
- [ ] Customer accounts: sign-in links on; sign-in optional at checkout; shipping phone number required
- [ ] Self-serve returns, with made-to-order pieces as final sale (return rules)
- [ ] Notification emails: logo and Cocoa accent
- [ ] Account domain `account.<domain>` once the domain is connected
- [ ] Sign in once on the preview link so the signed-in states can be checked

## Account page (docs/account-hub-plan.md, built 2026-10-03)
- [ ] **Page "Your account"** (Online Store → Pages → Add page): title "Your account", handle `account`, content empty. The handle is what matters: the header menu, the drawer row and the Help links find it by handle, whatever template the admin shows.
- [ ] **Customer account main menu** (Content → Menus): Orders, Profile, Saved (`/pages/saved`), Help (`/pages/account#help`). Remove "Track an order": once signed in, the orders are right there. The Track page stays for guests (Help menu and the account page).
- [ ] **Sign in once and look at the signed-in states:** the header menu (initial, latest order, Sign out), the account page's real orders (Track parcel / Buy again / Need help?), Your details, then Sign out → "You're signed out" on the page you were on. Signing in needs an email code, so this can't be scripted.
- [ ] **Before launch:** delete `theme/templates/page.account-demo.json` with the other demo files (it shows made-up orders, and only while Demo content is on).

## Offers: free shipping, free gift, COD (docs/offers-plan.md §5, §7)
The theme side is built. Everything stays hidden until these are done, and `npm run check` section 11 then compares the theme with the admin. Do them in this order:
- [ ] **Meesho average order value** (last 3 months). Free shipping should sit about 15–30% above it. The plan's amounts are ₹999 and ₹1,499.
- [x] **Shipping rates** (Settings → Shipping and delivery → India). Done 2026-10-03 by Claude through the Admin API, on Raushan's go: the one India rate, "मानक" at ₹379 (Shopify's default), is now "Standard" at **₹99**, free from ₹999 (the rate's own "free from" condition, which was already there). Read back from the store, and the check below passes.
  - "Standard": **₹99** (decided 2026-10-03, the same as floreal.in), for orders under ₹999.
  - "Free shipping": ₹0, condition "order price" ₹999 and up
- [x] **Gift product: import `tools/gift-product.csv`** (Products → Import → upload it → "Upload and preview" → "Import products"). It's a separate product, "Sunflower Keychain" (handle `sunflower-keychain-free-gift`, tag `free-gift`, type "Free gift", ₹249, 30 in stock, 40 g), with the single-sunflower photo. It isn't the keychain you sell, so paid keychains are never mistaken for the gift. Then on the product page, check the weight and stock, and keep it out of every collection. **Theme settings already point at it** (Free gift from 1499; settings_data.json, 2026-10-02).
- [x] **Collection "Shop"** (automated): every product except the gift (for example "Tag is not equal to free-gift", and tag the gift `free-gift`).
- [x] **Discount** (Discounts → Create → Buy X get Y, Automatic):
  - Customer buys: minimum purchase amount ₹1,499, from the collection "Shop"
  - Customer gets: 1 × the gift, "Free"
  - Maximum uses per order: 1
  - Combinations: allow product discounts and shipping discounts
  - Done 2026-10-03: "Free sunflower keychain over ₹1,499", Active, read back through the read-only admin login (product, order and shipping combinations all on). A later sale must also allow product discounts, or the gift stops being free during it.
- [ ] **Theme settings → Cart:** Free shipping from 999 ✓, Free gift from 1499 ✓ and the gift product ✓ are set. Standard shipping fee 99 ✓ (set 2026-10-03, the same as the Standard rate above). Still to do: Cash on delivery only once COD works at checkout.
- [x] Run `npm run check` (83/83 on 2026-10-03): "Offers: shipping rates match Theme settings" and "Offers: the free gift arrives free" must pass. Changing an amount later means changing it in three places: Theme settings, the shipping rate and the discount. Then run the check.
- [ ] **CA question:** how to treat free gifts under GST (input tax credit on goods given away free may need reversing, Section 17(5)(h)).
- [x] **FAQ:** the gift line, with the amount, is in the automatic "Shipping and offers" answer (`offers.faq_gift`, so it follows the threshold). The Terms draft has it in §5 "Free gift", with no amount, so changing the threshold won't need a Terms edit.

## Store setup
- [ ] **Occasion collections (docs/gifting-plan.md §8, G3):** tag products `occasion-birthday` / `-anniversary` / `-thank-you` / `-for-her`, create the 5 automated collections (four by tag, "Gifts under ₹999" by price), pick them on the home page's Shop by occasion tiles and in the Gifts menu.
- [ ] Currency format `₹{{amount_no_decimals}}` (Settings → General → Store currency)
- [ ] Search & Discovery: synonyms, Popular searches menu, product filters (search-plan §10)
- [ ] Bestsellers collection
- [ ] WhatsApp number in Theme settings → Social
- [ ] Payment gateway, COD, shipping and checkout: see "Shipping, payments and checkout" below

## Shipping, payments and checkout (docs/shipping-checkout-comparison.md, decided 2026-10-03)
Decided: Shiprocket ships the parcels, Shiprocket Checkout is the checkout with Razorpay connected inside it, partial COD only (no full COD). Shopify's checkout with Razorpay stays as the fallback. Do them in this order:
- [ ] **Razorpay account** (business KYC takes days, so start it first). Connect it in Shopify (Settings → Payments), so Shopify's checkout works as the fallback.
- [ ] **Shiprocket shipping account**, connected to Shopify as an app. Pickup address Piro. Check freight for our real box sizes in the rate calculator: couriers bill the higher of real weight and L × W × H ÷ 5000, and the ₹99 fee and free shipping from ₹999 must hold against that. At 200–300 parcels a month, price the ₹499 or ₹799 plan.
- [ ] **Shiprocket Checkout quote.** Ask: is there a monthly minimum (ask for a percentage plan); does it need our own Razorpay account; can our own Checkout button open their pop-up; how refunds are made.
- [ ] **Set up in Shiprocket Checkout:** shipping ₹99 below ₹999 and free from ₹999; the free keychain over ₹1,499 (automatic "Buy X get Y", Y free, 1 per order); partial COD rule (percentage upfront) and "Disable COD" for full COD; phone OTP on or off.
- [ ] **Dev-store trial (Claude), all must pass:**
  - partial COD order: the advance is charged, and the Shiprocket label shows only the balance
  - cart over ₹1,499: keychain ₹0; cart at ₹999: shipping free; below: ₹99
  - the order is in Shopify with the right customer, and under Orders when that shopper signs in on our site
  - the gift note arrives on the order
  - a purchase reaches analytics (their purchase event is wired by hand)
  - phone page speed stays inside our gates with their script loaded late
  - If the trial or the quote fails: Shopify's checkout with Razorpay and a partial-COD app instead.
- [ ] **Theme:** the cart's Checkout button opens Shiprocket Checkout (drawer and cart page); Theme settings → Cart → Cash on delivery on; the announcement bar's "Partial COD available" is then true.
- [ ] **Each parcel:** photo on the scale with a tape measure, kept for weight disputes (7 working days to dispute).
