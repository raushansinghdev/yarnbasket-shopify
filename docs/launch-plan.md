# Yarn Basket: where we are, and the road to launch (2026-10-14)

Approved by Raushan 2026-10-14. The short status lives at the top of `docs/launch-checklist.md`; the item-by-item details stay in that checklist. Update the step states here as they finish.

## Context

Over the last few days six Claude sessions worked in the same folder at once (checkout, account pages, cart speed, parcels, photo zoom, SEO). Each one kept good notes, but nothing ties them together, so it feels messy. This plan has three parts: (1) what is actually done, (2) what is loose or wrong right now, (3) one ordered list of steps to launch, saying for each step who does it (R = Raushan, C = Claude).

Launch dates in the build plan: **soft launch 30 Nov, public launch 7 Dec.** That leaves about 7 weeks. The UI is well ahead of the original schedule.

---

## Part 1. Where we are

| Area | State |
|---|---|
| Home page, header, menus, footer | Built. Still shows **Demo content** and a Diwali banner (to 8 Nov) |
| Collection page (filters, sort, craft chips with photos) | Built and pushed (craft-chip photos in 355742d; the memory note saying "not committed" is out of date). Waiting for your phone look |
| Product page (rounds 1 to 11) | Built. Rounds 9 to 11 are in git. Waiting for your phone look on 9, 10 and 11 |
| Cart (drawer = /cart, swipe rows, rewards bar) | Built, pushed. **Faster swipe rows (2026-10-13): not committed** |
| Search | Built. Synonyms and Popular searches in the admin still to do |
| Contact, Help pages, policies, FAQ, Our story | Built, in the store. Our story needs real photos. You haven't read the policies yet |
| Account: orders on our own page (rounds 4 and 5) | Built 2026-10-13 and 14, **not committed.** Waiting for your signed-in look |
| "Edit your details" in our own look | Not started. Waits for the Headless-channel test (B0) |
| Catalogue | 50 products live. 5 still on placeholder prices (flower headband, tricolour clips, heart pins, scrunchie, hair tie). Sizes not filled in yet |
| Pricing and rewards | Live: ₹79 delivery, free from ₹299, gift from ₹599, ₹50 off at ₹999, ₹100 off at ₹1,299 |
| SEO | Phases 0 to 5 and 7 built and committed (32 of 33 checks pass, ratings fail). Phases 6, 8, 9, 10, 11 not started |
| Payments | Razorpay approved and in Shopify's checkout (test mode). Cashfree still in review |
| Shipping | Shiprocket account ready, store connected, wallet empty on purpose. Placeholder weights and HSN uploaded **(the script changes are not committed)** |
| Shiprocket Checkout | Steps 1 and 2 done. Waiting for Shiprocket's team to connect Razorpay |
| Test order #1001 | Paid and refunded. It found 5 problems: 3 fixed, 2 open (the cart letting a removed piece through, the tax rate) |
| Store theme on Shopify | The "Yarn Basket" theme (#157682532489) is unpublished and **out of date**. Horizon is still the live theme behind the password |
| yarnbasket.in | Still the GitHub Pages holding site (used for Razorpay's review) |

---

## Part 2. What is loose or wrong right now (thinking out loud)

**A. Git is the main mess.**
- 10 commits on `main` that were never pushed (help pages, SEO phases 0 to 7).
- 24 changed files and 11 new files from four different jobs, mixed together: account orders rounds 4 and 5, faster cart swipe rows, parcel weights and HSN, photo-zoom smoothing, plus checklist and decision notes.
- 6 Claude sessions are still open, and 2 of them are waiting for answers. Any of them can still write to these files.

**B. The docs disagree with the store.**
- launch-checklist.md, the "Offers" and "Set up in Shiprocket Checkout" lines, still say ₹99 / free from ₹999 / gift at ₹1,499. The real figures are ₹79 / ₹299 / ₹599.
- Step 1 of the checklist says Razorpay's page has our logo, but a later line says it is unbranded. One of them is wrong.
- The memory note on the build plan is very long and partly out of date.

**C. Real risks I see before launch.**
1. **Tax is wrong at checkout.** The store charges 18%, but we decided on 5%. Prices include tax, so the shopper pays the same, but the GST split on every order is wrong. Bouquets may also really be 18% (HSN 6702). This needs settling before real money comes in.
2. **Nothing measures anything yet.** Meta ads are the main traffic plan, and the 15-day ad test depends on numbers, but there is no Meta pixel, no GA4 and no Clarity yet. Without them the first ad money is spent blind.
3. **25 products carry made-up ratings** that are sent to Google. That's harmless behind the password, but they must go before launch, and that needs your "yes".
4. **The partial-COD decision is still open.** 20 to 30% of COD parcels come back. The whole Shiprocket Checkout choice rests on this.
5. **The phone looks keep piling up.** Five or six rounds were built without your phone check. Each unchecked round makes the next fix harder.
6. **Running orders day to day isn't planned yet:** the daily routine, refunds after a cancel (cancelling in Shiprocket does not refund), returned COD parcels, keeping the wallet topped up, the parcel photo on the scale, WhatsApp replies.
7. **Diwali (8 Nov) comes before the 30 Nov launch.** That is a business choice, not a bug. See Step 1.

**D. What is fine to leave until after launch:** the blog and its 10 guides (SEO phase 8), Pinterest, Google Business Profile, our own "Edit your details", Keyword Planner volumes, 2048px photos, the Workspace email on yarnbasket.in.

---

## Part 3. The steps, in order

### Step 0. Tidy up (C, today, about an hour). Nothing new gets built until this is done
1. Ask the 6 open sessions whether they are mid-edit, then you close them. **From now on: one session at a time** (two only if their files never overlap).
2. Commit the loose work as separate commits, one job each, with explicit paths:
   account orders rounds 4 and 5 · cart swipe rows in two requests · parcel weights, HSN and parcels.csv · photo-zoom smoothing · checklist and decision notes.
3. Run the full check (`npm run check`) plus `check:money` and `check:seo` once, and report what fails, if anything.
4. Push `main` to GitHub (11 to 16 commits). That also redeploys the holding site, which is harmless.
5. Fix the docs: the right amounts in launch-checklist.md, the Razorpay line, and a short "Status" section at the top of launch-checklist.md, so **that one file becomes the single place that says where we are**. Shorten the build-plan memory note to point at it.

### Step 1. Two decisions (R, 10 minutes)
- **Launch date.** My recommendation: **keep 30 Nov** and leave Diwali to Meesho. A rushed Diwali launch would go out with no pixel, no real reviews and unchecked pages. Use the Diwali Meesho parcels instead: put a card in each asking for a photo review, with yarnbasket.in on it, so the site opens with real reviews. If you want the site live for Diwali, it would have to go out about 25 Oct on Shopify's own checkout, prepaid only. That is possible, but tight.
- **Partial COD: yes or no**, and how much is paid upfront (for example ₹99 or 20%). This decides how much Shiprocket Checkout matters.

### Step 2. One phone-look sitting (R, about 45 minutes; C fixes in one round)
Look at everything that is waiting, in one go, on your phone. I'll send one list of links:
- Product page rounds 9, 10 and 11 (the line above the name, the delivery card, photo squares on the option pills)
- Collection page with the craft-chip photos
- Contact page
- Cart: the swipe rows arriving quickly
- Product photo opening into the zoom viewer
- **Signed in:** order #1001 on its own page, Track order → latest order, sign out and back in (you come back to the same page), the header menu
Note everything in one message, and I fix it all in one round.

### Step 3. Finish the checkout chain (R and C, the checklist's own order)
1. R archives the test product "Lily of the Valley Bag Charm" for a minute → C makes the cart block a piece that is no longer on sale, with a check.
2. R sets the tax rate on the India tax page (C gives the clicks from a screenshot). Settle the 5% vs 18% bouquet question from the Meesho listings, or ask the CA.
3. R uploads `tools/catalog/parcels.csv` to Shiprocket's catalogue (C first matches its columns to Shiprocket's sample file).
4. R chases Shiprocket's team on connecting Razorpay inside Shiprocket Checkout. Then: read their Pricing page, enter the settings (C gives the values: ₹79, free from ₹299, gift from ₹599, the COD rule), C switches the theme's Checkout and Buy it now buttons to theirs, and we run the trial orders on the checklist.
5. **Fallback rule:** if Shiprocket Checkout is not working by **20 Nov**, we launch on Shopify's checkout with Razorpay (prepaid only), which already works.
6. Small items (R): Razorpay page branding, email accent colour `#4E3A31`, renaming the gift discount to "Gift with your order", Shopify's account pages to Soft blush.

### Step 4. Speed (C; R gives the storefront password in chat and OKs uploading to the unpublished theme)
SEO phase 10: upload the current code to the unpublished theme, measure on Shopify itself, split the page-only CSS, trim the home page HTML. The gates: LCP under 2.0 s, INP under 200 ms, CLS under 0.1 on a mid-range phone.

### Step 5. Measurement (R clicks, C wires and checks)
- Search Console now: one DNS TXT record at Spaceship. Then Bing (import from Google).
- Facebook & Instagram channel and the Meta pixel. Check ViewContent, AddToCart, InitiateCheckout and Purchase in Events Manager with our no-reload add to cart.
- GA4 and Microsoft Clarity, plus a 1 KB snippet that reports real-user speed.

### Step 6. Trust and content (R and Priya give facts and photos, C enters them)
- Say "yes" → C deletes the 25 made-up ratings. Install Judge.me, then import or collect real reviews from Meesho and Instagram buyers.
- Our story: 2 to 3 real photos of Priya and the making.
- Priya reads the product and collection text (review page) and fills in sizes (`docs/size-sheet.md`).
- Costs for the 5 placeholder-priced pieces. The pack-pricing talk (some packs cost ₹1 to ₹3 more than the singles added up).
- Home page: real campaign banner photos for the next occasion after launch (Christmas or New Year), product page Reviews quotes and FAQ.

### Step 7. Business and legal (R, with a CA once)
- GST: GSTIN in Billing → Tax ID and in Shiprocket's company details. Decide whether Shiprocket's invoice is enough or a GST invoice app is needed.
- One CA or lawyer pass: the policies, GST on the free gift (Section 17(5)(h)), the HSN for bouquets.
- Choose Shopify's paid plan (Basic is enough).
- You read the policies once.

### Step 8. The week before launch (C, with R's clicks)
- Search Console verification for Google sign-in's brand review (it takes days).
- Demo content off. Delete the demo templates and `demo-*` files. Delete the test products, after moving check.mjs to real products first.
- `npm run build:agents`, then the full check, `check:money` and `check:seo` against the live theme's preview link. All must pass.
- A real-phone screen-reader pass (VoiceOver and TalkBack) on home → product → cart → checkout.

### Step 9. Launch day (R publishes; C checks each step)
1. Paid plan on. Razorpay test mode off.
2. Upload the final theme from a clean `git archive`, and R publishes it.
3. Move the domain from GitHub Pages to Shopify. `www` → bare domain. Delete `coming-soon/` and its workflow.
4. Google sign-in: add the `account.yarnbasket.in` values. Add `yarnbasket.in` to the Headless client if B0 was done.
5. Password off. Submit the sitemap (Google and Bing). Switch on Merchant Center (SEO phase 6).
6. **One real order with real money**, then refund it. Check the money in Shopify, Razorpay and Shiprocket, the label, and the pixel's Purchase.

### Step 10. After launch
- 15 days of ads → ad cost per order, average order value, share of orders under ₹299 → tune the ₹299, ₹599, ₹999 and ₹1,299 lines.
- The daily order routine written down (labels, pickup, the parcel photo on the scale, refund after any cancel, returned COD parcels, wallet balance).
- Blog (SEO phase 8), Pinterest, Google Business Profile, the monthly AI-citation log, "Edit your details" (B0, B1).

---

## Files touched in Step 0 (the only code step in this plan)
- Commit only. The loose files are listed in `git status`: theme/snippets/account-*, theme/sections/cart-cards.liquid, theme/snippets/saved-card.liquid, theme/assets/cart-rows.js, cart.js, product-zoom.js, base.css, tools/catalog*, tools/check.mjs, tools/money-check.mjs, docs/*.
- Docs: `docs/launch-checklist.md` (status block, corrected amounts), memory `yarnbasket-build-plan.md` (shortened).

## Verification
- Step 0: `npm run check` (full gate), `npm run check:money`, `npm run check:seo`. `git status` clean except files a live session still owns. `git log origin/main..main` empty after the push.
- Each later step has its own check already named in the checklist (check 8d cart, 13 account, 20 product, 24 collection, 25 policies, 26 SEO, money check, the trial orders).
