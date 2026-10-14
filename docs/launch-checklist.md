# Before launch: admin and legal checklist

Things to finish in the Shopify admin (Raushan) before the store opens. Deferred on 2026-10-02 so the work can stay on the UI. Detailed steps are in `account-plan.md` §11 and `search-plan.md` §10.

## Status, 2026-10-14 (the one place that says where we are)
Soft launch 30 Nov, public launch 7 Dec. The whole road, step by step, with who does what: `docs/launch-plan.md`.
- **Built:** every page (home, collections, product, cart, search, contact, help, policies, account with orders on our own page); SEO phases 0 to 5 and 7; pricing and rewards live; Razorpay in Shopify's checkout (test mode); Shiprocket shipping connected.
- **Waiting for Raushan's phone look:** product page rounds 9 to 11, collection page with craft chips, contact page, the cart's swipe rows, the photo zoom, the account pages signed in.
- **Open before launch:** the tax rate (store charges 18%, we set 5%); the cart blocking a piece no longer on sale; Shiprocket Checkout (waits on their team); the partial-COD decision; Meta pixel, GA4, Clarity, Search Console; the 25 made-up ratings; speed (SEO phase 10); Demo content and test products out.
- **Check state:** `check:money` 12/12. `check:seo` needs a server with the storefront password for its AI-file and link lines.

## Checkout and shipping: the order of work (set 2026-10-13, after Raushan asked for one sequence)
One step at a time, top to bottom; details for each are under "Shipping, payments and checkout" below. R = Raushan's click, C = Claude.
1. **Finish the backup checkout. Done 2026-10-13** (Raushan): phone number Required; store time zone India; the Standard rate at 4 to 9 business days with "Dispatched in 1 to 2 working days"; test order #1001 refunded; Razorpay's page has our logo and Blush. Left: the email accent colour (below).
2. **Cart blocks a piece that is no longer on sale.** C, after R archives the test product "Lily of the Valley Bag Charm" for a minute. Claude cannot archive it: the command was blocked three times on 2026-10-13, and so was writing its own permission file.
3. **Product data. Placeholders in the store 2026-10-13** (C): weight on all 86 variants (pieces plus box), HSN 630790 and origin India on all 87, from `tools/catalog/costs.json` "parcel"; `check:money` 12/12 with the new weight check. Left: R sets the 5% rate on the tax page (C gives the steps from a screenshot); R uploads `tools/catalog/parcels.csv` to Shiprocket's product catalogue once its columns are matched to Shiprocket's sample file; real weights and the Meesho HSN and GST later.
4. **Shiprocket shipping.** R: wallet recharge, deferred on purpose (the first-recharge cashback runs out 30 days after it starts, so he recharges close to launch); no label can be made until then. Then the freight check against ₹79 and free from ₹299, with the billed weights in `parcels.csv`: keychain box 0.20 kg, bouquets 0.47, 0.71 and 0.94 kg, so a two-flower bouquet is billed in the 1 kg band.
5. **Shiprocket Checkout.** Waits on their team connecting Razorpay. Then: its Pricing page, its settings (C gives the values), the theme's Checkout and Buy it now buttons (C), trial orders.
6. **Second test order,** as a guest, then the launch-day items (paid plan, test mode off, domain).

## Done
- [x] Pages "Saved" (`/pages/saved`) and "Track your order" (`/pages/track-order`)
- [x] Customer account main menu: Saved, Track an order
- [x] Privacy policy exists
- [x] "Include sales tax in product price and shipping rate" is on

## Legal
- [x] **All four policies saved to the store 2026-10-11** (Claude, from `docs/legal/`; docs/help-pages-plan.md): Refund, Shipping, Contact information, and the corrected Terms. `npm run check -- --only 25` reads them. Left: Raushan reads them once, and the lawyer or CA review below.
- [ ] **Our story:** 2 to 3 real photos of Priya and the making, in place of the borrowed product photos.
- [x] **Store contact email** (Settings → General) is weyarnbasket@gmail.com (Raushan, 2026-10-11); the automatic Privacy policy shows it.
- [ ] **Changing the delivery fee or free-delivery amount:** also edit `docs/legal/shipping-policy.html` and save it to the store (check 25 compares them).
- [x] **Terms of service:** saved 2026-10-11 (see the first line). Was: paste `docs/legal/terms-of-service.html` (Settings → Policies → Terms of service → `</>` code view → paste → Save). First confirm the assumptions it makes:
  - support hours Mon–Sat 10am–6pm
  - COD "may carry a small fee"
  - a photo before dispatch for custom pieces
  - prices include GST
  - reviews credited by first name
  - liability capped at the order amount
- [x] **Refund policy:** to be written to match the terms:
  - no change-of-mind returns
  - damaged, wrong or missing items reported within 48h with an unboxing video
  - replacement or full refund, paid within 5–7 working days; COD refunds to UPI or bank
  - creased bouquet paper isn't damage
- [x] **Contact information policy** (marked "Required"):
  - Yarn Basket, sole proprietorship of Priya Singh
  - Piro, Bhojpur, Bihar 802207
  - weyarnbasket@gmail.com, +91 93219 79410
  - GSTIN 10SVFPS1772F1ZB
  - grievance officer Priya Singh
- [ ] Have a lawyer or CA review all policies once

## Tax
- [ ] GSTIN 10SVFPS1772F1ZB. Corrected 2026-10-13 from Raushan's screenshots: the India tax page has no GSTIN field and no "Collect GST" switch; it is on Manual Tax and already charges 18% (India 9% + state rows, IGST 18% elsewhere), so the rate there must be set to ours. The GSTIN goes in two other places: Settings → Billing → Billing profile → Tax ID (for Shopify's own bills), and Shiprocket's company details (its invoice travels with the parcel). Shopify makes no GST tax invoice by itself: decide whether Shiprocket's invoice is enough or an invoice app is needed
- [ ] GST rate and HSN code per product type: Raushan has them from the Meesho listings (2026-10-13), no CA question needed. Enter them: HSN on every product (Claude, once given), and a tax override if Shopify's default rate doesn't match
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
- [ ] Customer accounts: sign-in links on; sign-in optional at checkout; shipping phone number required. **The phone number is the urgent part** (test order #1001, 2026-10-13): checkout says "Phone (optional)", and Shiprocket then flags the order "Contact missing"; no courier delivers without a number. Settings → Checkout → Shipping address phone number → Required **Phone number set to Required 2026-10-13** (Raushan); sign-in links and optional sign-in still to confirm.
- [ ] Self-serve returns, with made-to-order pieces as final sale (return rules)
- [ ] Notification emails: logo and Cocoa accent
- [ ] Account domain `account.<domain>` once the domain is connected
- [ ] Sign in once on the preview link so the signed-in states can be checked

## Account page (docs/account-hub-plan.md, built 2026-10-03)
- [x] **Page "Your account"** (exists: read from the store 2026-10-11) (Online Store → Pages → Add page): title "Your account", handle `account`, content empty. The handle is what matters: the header menu, the drawer row and the Help links find it by handle, whatever template the admin shows.
- [x] **Customer account main menu:** seen on Shopify's order page 2026-10-13 (Orders, Profile, Saved, Help). Was: (Content → Menus): Orders, Profile, Saved (`/pages/saved`), Help (the Contact page; changed from `/pages/account#help` on 2026-10-08, when the account page's help panel was removed). Remove "Track an order": once signed in, the orders are right there. The Track page stays for guests (Help menu and the account page).
- [ ] **Orders on our own page (docs/account-orders-plan.md, built 2026-10-13), Raushan signed in:** "View order" on order #1001 opens its own page (round 5, 2026-10-14), which shows ₹965, the gift and delivery as "Free", and the address; signing in from the account page or Track order comes back to that page; Shopify's Profile menu reads Your account, Profile, Saved, Help (Orders removed by Claude 2026-10-13, which replaces the line above).
- [ ] **"Edit your details" in our own look, proof first (docs/account-orders-plan.md, round 5, B0):** add the free Headless channel, a public Customer Account API client, origin and callback `https://yarnbasket-in.myshopify.com` (+ `/pages/account`), and send Claude the Client ID. **At launch add `yarnbasket.in` as a second origin and callback.**
- [ ] **Before launch:** delete `theme/templates/page.account-order-demo.json` and `page.account-empty-demo.json` with the other demo files.
- [x] **Email accent colour: Cocoa Deep `#4E3A31`** (Raushan, 2026-10-14; the logo was already there).
- [ ] **Order emails in our look (docs/emails.md, approved 2026-10-14):** all 16 customer emails built (`npm run check:emails`, 154 checks) and pasted by Raushan on 2026-10-14 (`pickup-receipt` deliberately not: pickup is off). Left: the five suggested subjects (emails/README.md), and a second test order whose confirmation, cancel and refund emails match the admin's amounts (cancel and refund in Shopify, not Shiprocket).
- [ ] **Shopify's account pages are white, not Soft blush** (screenshots 2026-10-13): Settings → Checkout → Customize → page picker → a customer account page; set the background to `#FBF1EE` if it is white.
- [ ] **Sign in once and look at the signed-in states** (partly seen 2026-10-13 with test order #1001: the account page's real order with "Confirmed, we're getting it ready" and Need help?, and Shopify's order list and order page; still to see: the header menu, Track parcel / Buy again on a shipped order, Your details, Sign out)**:** the header menu (initial, latest order, Sign out), the account page's real orders (Track parcel / Buy again / Need help?), Your details, then Sign out → "You're signed out" on the page you were on. Signing in needs an email code, so this can't be scripted.
- [ ] **Before launch:** delete `theme/templates/page.account-demo.json` with the other demo files (it shows made-up orders, and only while Demo content is on).

## Offers: free shipping, free gift, COD (docs/offers-plan.md §5, §7)
The theme side is built. Everything stays hidden until these are done, and `npm run check` section 11 then compares the theme with the admin. **The amounts changed on 2026-10-12** (₹79 under ₹299, free from ₹299, gift from ₹599; docs/pricing-plan.md): the ticked lines below record the first setup (₹99, ₹999, ₹1,499) and are kept as history. Do them in this order:
- [ ] **Meesho average order value** (last 3 months). Free shipping should sit about 15–30% above it. Today's amounts (since 2026-10-12, docs/pricing-plan.md): ₹79 delivery under ₹299, free from ₹299, the gift from ₹599, ₹50 off from ₹999, ₹100 off from ₹1,299.
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
- [ ] **Theme settings → Cart:** Free shipping from 299 ✓, Free gift from 599 ✓ and the gift product ✓ are set. Standard shipping fee 79 ✓ (2026-10-12, the same as the Standard rate; `check:money` reads them). Still to do: Cash on delivery only once COD works at checkout.
- [x] Run `npm run check` (83/83 on 2026-10-03): "Offers: shipping rates match Theme settings" and "Offers: the free gift arrives free" must pass. Changing an amount later means changing it in three places: Theme settings, the shipping rate and the discount. Then run the check.
- [ ] **CA question:** how to treat free gifts under GST (input tax credit on goods given away free may need reversing, Section 17(5)(h)).
- [x] **FAQ:** the gift line, with the amount, is in the automatic "Shipping and offers" answer (`offers.faq_gift`, so it follows the threshold). The Terms draft has it in §5 "Free gift", with no amount, so changing the threshold won't need a Terms edit.

## Store setup
- [ ] **Occasion collections (docs/gifting-plan.md §8, G3):** tag products `occasion-birthday` / `-anniversary` / `-thank-you` / `-for-her`, create the 5 automated collections (four by tag, "Gifts under ₹999" by price), pick them on the home page's Shop by occasion tiles and in the Gifts menu.
- [ ] Currency format `₹{{amount_no_decimals}}` (Settings → General → Store currency)
- [ ] Search & Discovery: synonyms, Popular searches menu, product filters (search-plan §10)
  - [x] Filters for the collection pages (docs/collection-plan.md): done by Raushan 2026-10-10. Search & Discovery → Filters holds Availability, Price, Craft (product type), Occasion and Flower & motif, all on OR.
  - [ ] Shop collection: set its sort order to manual or best selling, so "Featured" is an order someone chose
- [ ] Bestsellers collection
- [x] WhatsApp number, Instagram link and Contact email in Theme settings → Social: set 2026-10-06 in `theme/config/settings_data.json` (+91 93219 79410, instagram.com/yarnbasket.in, weyarnbasket@gmail.com). The live theme keeps its own settings: check they are there after publishing.
- [x] Help lists in the main menu and the footer (Claude, `menuUpdate`, 2026-10-11): Track order, Shipping & delivery, Returns & refunds, FAQ, Contact us, Our story
- [ ] Payment gateway, COD, shipping and checkout: see "Shipping, payments and checkout" below

- [ ] **Contact page (docs/contact-plan.md, built 2026-10-08):**
  - **Sender email: done** (Raushan, 2026-10-11). Was: Settings → Notifications → Sender email → weyarnbasket@gmail.com, then confirm the link Shopify sends there. Today it is singhraushan2410@gmail.com: contact form messages land there (Raushan's test, 2026-10-08) and customers see it on order emails. Then send one more message from `/pages/contact` to see it arrive in the business inbox
  - the Contact page's template is `contact` (it is: Shopify's default for that page; read from the store 2026-10-08). Its SEO title and description were set the same day
  - after publishing, Theme settings → Social on the live theme has the Grievance officer

## SEO (docs/seo-plan.md, approved 2026-10-12)

- [x] (Raushan, 2026-10-13: keep as built) Raushan and Priya read the nine new collection pages, the piece list of each, and the Custom orders page (same review page, "New pages"); corrections are sent with `python3 tools/catalog-upload.py tags|words|seo <handles>`
- [ ] Raushan and Priya read the new product and collection text (https://claude.ai/artifact/9nMdJrJwefL5XVRpLpwkbf; the questions for Priya are at its top); corrections go into `tools/catalog/catalog.json` and are sent with `python3 tools/catalog-upload.py words <handles>`
- [ ] **Search Console, now, on the holding site:** search.google.com/search-console → Add property → Domain → `yarnbasket.in` → copy the TXT record → Spaceship → DNS → add it → Verify. Use the business Gmail. The record stays when the domain moves to Shopify.
- [ ] **Bing Webmaster Tools:** bing.com/webmasters → sign in → "Import from Google Search Console".
- [ ] **Keyword Planner:** ads.google.com with the business Gmail → skip the campaign ("Switch to Expert Mode", "Create an account without a campaign") → Tools → Keyword Planner → "Get search volume" → paste the main searches from `docs/seo-keyword-map.md`, location India → download the CSV and hand it to Claude.
- [ ] **Delete the made-up ratings on 25 real products** (also under "Product page" below): say yes in chat and Claude removes them.
- [ ] **Pinterest:** a business account for Yarn Basket; claim `yarnbasket.in` once the store is on it (phase 5).
- [ ] **At soft launch:** Google & YouTube channel and Merchant Center (phase 6), Judge.me (phase 9), Google Business Profile as a service-area business (phase 9), the sitemap submitted in Search Console and Bing (phase 11).
- [ ] **Before the password comes off:** `npm run check:seo -- --url <the live theme's preview link>` passes every line.
- [ ] **AI files, before the password comes off and after any price, product, collection, policy or FAQ change:** `npm run build:agents`, then commit `theme/templates/llms.txt.liquid` and `llms-full.txt.liquid`. `npm run build:agents -- --check` says whether they are out of date. At launch, open `/llms.txt` on the live address and see our name at the top.
- [ ] **Pinterest (Raushan), steps in `docs/pinterest.md`:** business account; claim code into Theme settings → Social (then `npm run build:coming-soon` so the holding site carries it); at launch connect the catalogue and make the boards.
- [ ] **From launch, once a month:** ask the five questions in `docs/seo-log.md` and log whether we are cited.

## Shipping, payments and checkout (docs/shipping-checkout-comparison.md, decided 2026-10-03)
Decided: Shiprocket ships the parcels, Shiprocket Checkout is the checkout with Razorpay connected inside it, partial COD only (no full COD). Shopify's checkout with Razorpay stays as the fallback. Do them in this order:
- [ ] **Cashfree account, the main gateway** (docs/decisions.md 2026-10-11): applied by Raushan 2026-10-11, in review. Then connect it where Shiprocket's answer allows.
- [x] **Razorpay account: verified 2026-10-13** (Raushan). Next: connect it inside Shiprocket Checkout (step 3) and in Shopify (Settings → Payments), both below. Was: sign up with weyarnbasket@gmail.com as Priya Singh's sole proprietorship; website `https://yarnbasket.in`. Its reviewer reads the holding site, not the store.
- [ ] **While the holding site shows policies and prices:** after any change to `docs/legal/`, a Bestsellers price or name, or the Our story text, run `npm run build:coming-soon`, then commit and push `coming-soon/`. `node tools/coming-soon-build.mjs --check` says whether it is out of date.
- [ ] **At launch:** the domain moves to Shopify and `coming-soon/`, its workflow and `tools/coming-soon-build.mjs` are deleted.
- [ ] **Razorpay in Shopify:** installed 2026-10-13 by Raushan (Settings → Payments → More ways to pay → Add → "01 Cards, UPI, NB, Wallets by Razorpay"; the "Cards Onsite by 1Razorpay" under Choose a provider is cards only, not used). Capture is Automatic. Active, test mode on, and a test order paid (#1001, same day, next item). Still open: test mode off on the paid plan; and there, re-read the app page's "No transaction fee" line, since Shopify's 2% on outside gateways was one reason for Shiprocket Checkout. Was: (business KYC takes days, so start it first). Connect it in Shopify (Settings → Payments), so Shopify's checkout works as the fallback.
- [ ] **Test order #1001 through Shopify's checkout, 2026-10-13 (Raushan; Razorpay test mode, signed in, 5 pieces and the gift, ₹965).** Passed: Razorpay offered, paid, back on Thank you; ₹965 in Shopify, Razorpay and Shiprocket; gift free, delivery free, no money-off step under ₹999; checkout in our look; order on both account pages; Shiprocket got it as Prepaid with the SKU, and cancelling there cancels in Shopify. To fix, from the same order (docs/decisions.md 2026-10-13):
  - [ ] **Cart lets through a piece that is no longer on sale:** checkout opened on "2 items are no longer available". The cart blocks Checkout only for a sold-out variant; the two were most likely pieces of the products archived in the 2026-10-12 merge, still in an old cart. Fix is in the theme (Claude): mark the line and block Checkout, with a check. Waits on a reproduction: Raushan archives a test product for a minute (Claude's own admin change was blocked).
  - [x] **Weights:** placeholder weights uploaded 2026-10-13 (step 3 above; estimates until the pieces are weighed). Boxes from Raushan: bouquets 12 × 3 in and 4, 6 or 8 in wide for 1, 2 or 3 flowers; keychains 5 × 4 × 3 in. Assumed: the keychain box for hair accessories, charms and tie-backs; 6 × 4 × 4 in for pots. Was: all 92 real variants weigh 0 in Shopify, so Shiprocket shows "Info missing".
  - [x] **Delivery line at checkout says "3 to 5 business days";** our pages say dispatch in 1 to 2 working days, then 3 to 7 days. Settings → Shipping and delivery → the Standard rate's description (Raushan). Done 2026-10-13: 4 to 9 business days, "Dispatched in 1 to 2 working days".
  - [ ] **Tax line showed 18%** (₹147.20 of ₹965; 9% before the address) and no product has an HSN code: the Tax section above. 2026-10-13: HSN 630790 is on every variant as a generic code (Raushan: 5% for all crochet for now). Caution recorded: crochet flowers and bouquets may belong under 6702, artificial flowers, which most sources put at 18%; settle it from the Meesho listings or a CA. The rate on the tax page is still 18%.
  - [x] **Razorpay's page branded 2026-10-13** (Raushan: logo and Blush, step 1 at the top). Was: unbranded (letter "Y", Razorpay blue). Still to do on the live list: switch off EMI and Pay Later if they show.
  - [ ] **Optional:** rename the gift discount ("FREE SUNFLOWER KEYCHAIN OVER ₹599" prints under every checkout line) to "Gift with your order". The theme reads the name from the cart, so nothing breaks; update the name in docs/pricing-plan.md.
  - [ ] **Order confirmation email, seen 2026-10-13:** our logo is there; the button and link are Shopify's blue → Settings → Notifications → Customize email templates → accent `#4E3A31` (Raushan). It prints the gift discount's name under every paid piece with "(-₹0)": the rename above shortens it. Sender shows as `store+…@g.shopifyemail.com` because the sender is a Gmail address; it becomes ours with an email on yarnbasket.in (launch). Shopify's order pages being white while checkout is blush: still to look at.
  - [x] **Store time zone is US Eastern:** order #1001, placed 13 Oct 8:26 pm in India, shows in the admin as "Today at 10:56 am". Settings → General → Store defaults → Time zone → (GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi (Raushan). Order times, daily reports and timed discounts follow it. Done 2026-10-13.
  - [ ] **Cancelling is not refunding:** #1001, cancelled from Shiprocket, shows in Shopify as cancelled but still "Paid". Harmless in test mode; with real money every cancelled prepaid order must also be refunded in Shopify (Order → Refund), which sends the money back through Razorpay.
  - [ ] **Second test order after the fixes:** as a guest; under ₹299 (₹79 delivery), then over ₹999 (₹50 off); with a gift note. Not yet tested at all: a real phone, a failed or abandoned payment, a refund, the purchase reaching analytics.
- [ ] **Shiprocket shipping account**, connected to Shopify as an app. Done by 2026-10-13 (Raushan's screenshots): account in Priya's name, KYC complete, Shopify channel connected (channel 12541783, orders syncing, app installed in the store). Bank details and pickup address added the same day (Raushan). Channel settings as seen: all orders fetched, Shiprocket statuses mapped to Shopify delivery statuses, Return and RTO Delivered tags on, Paid after COD remittance on. Early COD Remittance not activated. Still open: wallet recharge (₹0), the freight check below. Check freight for our real box sizes in the rate calculator: couriers bill the higher of real weight and L × W × H ÷ 5000, and the ₹79 fee and free delivery from ₹299 must hold against that. At 200–300 parcels a month, price the ₹499 or ₹799 plan.
- [ ] **Shiprocket Checkout (Fastrr) onboarding, started 2026-10-13 by Raushan:** no quote needed, it is a self-serve sign-up from the Shiprocket panel (ALL PRODUCTS → Checkout), charged per order from a wallet. Step 1 platform and step 2 store connected (collaborator code, yarn-basket-e4peuhjj.myshopify.com). Step 3 asks for the gateway: Fastrr's own ("0.75% lower processing fees", rate not shown) or an existing one; Raushan checked the same day that both Cashfree and Razorpay can be connected there. Step 3 waits for a gateway's approval (it needs the approved account's keys). 2026-10-13, later: Razorpay verified and live keys made, but Raushan found no place to enter them, so he sent the details to Shiprocket's team to connect it; waiting on them. Their help article puts it at Checkout dashboard → Settings → Payment → Payment-Gateway Setting → Configure, for "partnered or mapped" gateways only. Fee still to be read on the dashboard's Pricing page. The questions from the old quote step still stand: is there a monthly minimum (ask for a percentage plan); does it need our own Razorpay account; can our own Checkout button open their pop-up; how refunds are made.
  - [ ] **Collaborator request, 2026-10-14:** "Pickrr Collaborator" (login@shiprocket.com, role "Pickrr x Yarn Basket") under Settings → Users. This is the step 2 collaborator code coming back: Pickrr is the company Shiprocket bought, and Fastrr was Pickrr's checkout. Shoppers never see the name Fastrr. Their pop-up says "Powered By Shiprocket" (seen on floreal.in 2026-10-14: phone, address, Standard or Express, "Pay Now" or "Pay only 40% now, the rest at delivery"). Recommended: accept after reading the role's permissions, and ask Shiprocket's team not to edit the published theme, because the theme comes from git and a push would wipe their changes. They should send the snippet, or work on a duplicate theme. Claude wires the Checkout button (Theme item below). Remove the collaborator once the trial passes, unless they say the app needs it. Their role asks for almost everything, so Claude advised trimming it before accepting: no gift cards, Finance, Markets, App development or "Approve app charges"; no refunds, deletes or customer exports; nothing in Settings that covers staff, payments or domains. If their setup gets stuck, add back only what it needs. **Later on 2026-10-14:** Shiprocket's team asked for "all access except finance" to avoid blockers. An accepted collaborator's role can only be viewed, not edited, so Raushan removed the role and asked them to send a new request. Accept it with everything except Finance, the four billing boxes under Store settings and "Approve app charges" (add one back only if they name it). They made two unpublished copies of Horizon ("Copy of Horizon" #158132633737, "fastrrv3<>Copy of Horizon" #158132699273); pulled and compared the same day: identical to live Horizon, no Fastrr code yet. Our launch theme is "Yarn Basket", so whatever they enable on the copy (likely an app embed) gets repeated in our theme from git. Once they say it is done: pull their copy again and diff it. After the trial: remove them or cut them back, and check Apps → Develop apps and the Dev Dashboard for any app or API token they made.
- [ ] **Set up in Shiprocket Checkout:** delivery ₹79 below ₹299 and free from ₹299; the free keychain from ₹599; ₹50 off from ₹999 and ₹100 off from ₹1,299 (gift: automatic "Buy X get Y", Y free, 1 per order); partial COD rule (percentage upfront) and "Disable COD" for full COD; phone OTP on or off. **Coupons (Raushan, 2026-10-14): Fastrr is also where coupons run.** Its pop-up shows codes with the saving worked out ("SHARK10, Save ₹269.70, Apply", "View 1 more coupon", seen on floreal.in), and it imports Shopify's discounts. So the collaborator keeps the Discounts permission. In the trial, check that our automatic discounts (combo quarter off, the gift, ₹50 and ₹100 off) arrive in the pop-up at the same amounts as our cart, and that a code stacks with them the way we decide.
- [ ] **Dev-store trial (Claude), all must pass:**
  - partial COD order: the advance is charged, and the Shiprocket label shows only the balance
  - cart from ₹599: keychain ₹0; from ₹299: delivery free; below: ₹79; from ₹999: ₹50 off; from ₹1,299: ₹100 off
  - the order is in Shopify with the right customer, and under Orders when that shopper signs in on our site
  - the gift note arrives on the order
  - a purchase reaches analytics (their purchase event is wired by hand)
  - phone page speed stays inside our gates with their script loaded late
  - If the trial or the quote fails: Shopify's checkout with Razorpay and a partial-COD app instead.
- [ ] **Theme:** the cart's Checkout button opens Shiprocket Checkout (drawer and cart page); Theme settings → Cart → Cash on delivery on; the announcement bar's "Partial COD available" is then true.
- [ ] **Each parcel:** photo on the scale with a tape measure, kept for weight disputes (7 working days to dispute).

## Product page (docs/product-page-plan.md)

- [x] Product fields created 2026-10-04 (Settings → Custom data → Products): "Size & what's included", "Materials (only if different)", "Care (only if different)"
- [ ] **Delete the made-up ratings on 25 real products** (added 2026-10-05 for testing, product metafields `reviews.rating` and `reviews.rating_count`). While they exist, the stars by the product name and the rating sent to Google (`aggregateRating` in the page's structured data) are invented. Four real products were left without a rating on purpose: Baby Chick Crochet Keychain, Octopus & Evil Eye Keychain Set, Daisy Crochet Pot, Sunflower Curtain Tie-Back. Claude can remove them with one Admin API call (`metafieldsDelete`).
- [ ] **Money check on the live theme, last thing before the password comes off:** `node tools/money-check.mjs --url <the live theme's preview link>` passes with no WARN line (docs/decisions.md 2026-10-05). Run it again after any price change.
- [ ] Delete the test products (tag `test-product`; until then the theme hides them from every list and search, and their pages are `noindex`: docs/decisions.md 2026-10-05. `tools/check.mjs` opens six of them by handle and the hero's demo slides name three, so move those to real products first), including the extra photos and test Size text on "Red Rose Crochet Bouquet" and the whole "Rose Crochet Bouquet (colour test)" (computer-recoloured photos, a made-up 4.8 rating)
- [ ] Products that come in colours: one product with a "Colour" option, a photo picked on each colour's variant, and the photos dragged into colour order (product-page-plan.md, Round 2)
- [ ] Every product: 5 photos in the guide's order, alt text on each, and "Size & what's included" filled in
- [ ] Theme editor → a product page → Product section: Materials, Care and Delivery text
- [ ] Theme editor → product page: real customer quotes in Reviews and 4–5 questions in FAQ (a separate copy from the home page's; edit both)
- [ ] Search & Discovery → Product recommendations: "Complementary products" for the main pieces (feeds "Pairs well with")
- [ ] Reviews app chosen and installed; check its script against the speed budget
- [ ] Facebook & Instagram channel installed; ViewContent, AddToCart and Purchase seen in Events Manager with our no-reload add to cart
- [ ] After Shiprocket Checkout is on: "Buy it now" hands over to it. Shopify's own Buy it now goes to Shopify's checkout and would skip Shiprocket, so the button must become theirs, or ours adding the piece and opening their checkout. The new button keeps the tap's pulse only while it sits inside `.pdp__now-btn` (`theme.js`, `PULSE`). Also: the trust card's COD line says partial COD
- [ ] Theme settings → Cart → "Most of one piece per order" is 9 (round 4). It is a theme limit, not enforced at checkout: fine for ordinary shoppers; a checkout rule would need an app
- [ ] Meta's Pixel Helper on a phone: ViewContent on the product page, AddToCart from the pinned Add to cart, InitiateCheckout from Buy it now
- [ ] Open a product from a real Instagram ad link on a phone: no intro, photo first, buy button visible

## Catalogue (docs/catalog-plan.md)

- [x] **Shopify admin, to match the theme (done by Raushan 2026-10-12, money check 10 of 10):** Settings → Shipping and delivery → Domestic "Standard": ₹79, free from ₹299 (is ₹49, free from ₹499). Discounts → "Free sunflower keychain over ₹799": minimum purchase ₹599, and rename it. Then `npm run check:money` must pass 10 of 10.
- [ ] After the first 15 days of ads: ad cost per order, average order value and share of orders under ₹299, then tune the lines (₹299 delivery, ₹599 gift, ₹50 off ₹999, ₹100 off ₹1,299) and the courier figure (docs/pricing-plan.md, "Measure for 15 days")
- [ ] Decide the prepaid saving and partial COD before launch: 20 to 30% of COD parcels are refused and each costs ₹100 to ₹150
- [ ] Add Size text for keychains, pots, charms, hair pieces and the larger bouquets: Priya fills `docs/size-sheet.md` (46 pieces), then Claude sends them
- [ ] Clean photos (no stickers, no text, real piece) for the held-back products, then list them
- [x] Stock stays at 100 per variant (Raushan, 2026-10-13: fine as it is)
- [ ] Photos are 1254 px: shoot or export new ones at 2048 px or more when possible
