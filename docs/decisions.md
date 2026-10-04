# Decision log

Newest first. Each entry says what was decided and why, so later work doesn't reopen it by accident.

## 2026-10-04 (product page, round 5)

- **Desktop buy box is one 48px row** (quantity, Add to cart, Buy it now) under the options. Raushan found two full-width 54px rows too big.
- **From 750px a slim bar at the bottom of the screen once the buy row is scrolled past**, off at the footer. Phones keep the pinned buttons of round 4; this does not reopen that decision (on a phone the buttons are 700px down on arrival, on desktop they are on the first screen).
- **Not Flipkart's column-pinned buy row.** Raushan suggested it; it needs the buttons last in the column, so on our short column they sit under the details rows, away from price and options. Asked, Raushan chose to keep the row under the options.
- **The magnifier button shows only for the keyboard.** Raushan: people know to click a photo. It stays in the page because a photo can't take focus.

## 2026-10-04 (product page, round 4)

- **Phones: the buy buttons are pinned to the bottom for the whole page**, one set, placed with CSS. Raushan found the come-and-go bar "not proper" and asked for the best way; the fixed bar is what Flipkart, Myntra and Meesho shoppers know and it needs no JavaScript. This supersedes round 1 (bar from arrival plus page buttons) and round 3 (bar after scrolling past).
- **At most 9 of one piece per order** (Raushan): a theme setting, enforced on the product page and in the cart, not at checkout. Larger orders go to WhatsApp because they need a shipping quote.
- **Two columns from 750px**; the photo column is the sticky one.
- **Add to cart errors show in the pop-up**, not under the form.
- **Shiprocket Checkout and Buy it now:** Shopify's button would skip Shiprocket; handled at install (launch-checklist.md).

## 2026-10-04 (product page, round 3)

- **Option pills swipe sideways on phones** (Raushan's suggestion), one row per option, bleeding to the screen edge so a cut-off pill signals more. Wrapping stays from 750px.
- **Sticky buy bar only after the buy box**, reversing "a buy button on screen from arrival" from round 1. Raushan found it backwards on a phone; it also offered Add to cart before the options were seen.
- **Delivery terms + WhatsApp line as one card** in place of the stacked lines from round 2.
- **Good to know before Recently viewed**: unchanged.

## 2026-10-04 (product page round 2, docs/product-page-plan.md "Round 2")

- **Colours are one product with a Colour option, never one listing per colour.** One page collects the reviews, sales and ad learning; each colour keeps its own photo, price, stock and `?variant=` link, so an ad for yellow lands on yellow; Meta's catalog reads the colours as one item group. A separate listing only for a genuinely different design that people search for by another name.
- **The gallery shows only the chosen colour's photos** (Raushan). Grouping is by photo order: a colour's variant photo starts its group; `#all` in a photo's alt text shows it for every colour. How to set it up is in product-page-plan.md, Round 2.
- **Colour pills show a round swatch cut from that colour's own photo,** because "Mixed" and two-tone yarn can't be a flat dot. Other options stay text.
- **"You may also like" comes before the reviews** (Raushan): the reviews row is about the shop, not this piece, so other pieces are the more useful thing to see first.
- **Ratings sit by the name and link down to the reviews** (Raushan, like Amazon and Flipkart). Only real per-product ratings show there; the hand-picked quotes never get stars beside the price.
- **The viewer closes on a tap outside the photo** (Raushan), and has arrows on desktop.
- **Save, Share and "look closer" are 40px circles on phones and 44px on desktop** (Raushan found 32px too small, most of all on desktop). Card hearts stay 32px.

## 2026-10-04 (product page, docs/product-page-plan.md)

- **The product page is a landing page.** Most traffic will come from Meta ads straight to a product (Raushan), usually in Instagram's in-app browser. So it is designed phone first, tested at 360 × 640 as well as 360 × 800, and has to stand on its own for someone who never saw the home page.
- **PP1 Details:** Materials and Care are written once in the theme editor; "Size & what's included" is the per-product field (`custom.size`). A product can override Materials or Care (`custom.materials`, `custom.care`).
- **PP2 Reviews:** no stars until a product has real ratings. The reviews app is a pre-launch admin step.
- **PP3 Custom ask:** one muted WhatsApp line under the trust row; "Ask us to make one" on a sold-out product.
- **PP4 Save is the heart on the photo's corner,** the same as on cards, with Share under it. The buy box is two aligned rows: quantity + Add to cart, then Buy it now. This replaces the worded "♡ Save" button from account-plan AC4.
- **PP5 Below the details:** hand-picked customer reviews, a short FAQ, the product rows, and Recently viewed last.
- **PP6 Video** is supported as a later gallery slide; a photo is always first.
- **PP7 Two product rows, not four.** "Pairs well with" (Raushan's picks in Search & Discovery, hidden when there are none) and "You may also like" (Shopify's related products, which use real purchase data once there are orders, and fall back to Bestsellers). Raushan asked about bestsellers / also bought / bought together; one row each for "goes with this" and "like this" covers them without four near-identical rows.
- **PP8 Every text block is closed by default,** the description included (Raushan, to save space). Closed `<details>` text is still in the HTML for search engines.
- **The logo intro no longer plays on product pages:** an ad visitor should see the piece they tapped, not an animation.
- **The sticky buy bar shows whenever the main Add to cart is off-screen, including on arrival** on a short screen. The added-to-cart and Saved pop-ups sit above it.
- **No return policy in the Product JSON-LD yet.** The rule is replacement if damaged with no change-of-mind returns; the markup is settled in the SEO phase so we never tell Google something looser than the Terms.
- **Not reopened:** `offer-terms` is the one trust row, "Buy it now" stays, no per-product dispatch date, sales stay quiet (no % badge), no viewer counts or stock-pressure lines.

## 2026-10-04 (compact footer, docs/footer-compact-plan.md)

- **The footer is about 30% shorter on phones and 15% shorter on desktop, with the same content.** Raushan found it too tall. It was 520px on a 360 × 800 phone (65% of a screen) for a logo and seven links, and about 210px of that was empty space. It is now 369px at 320 to 430 wide, 441px at 1280 (was 516) and 474px at 768.
- **Phones (under 750px):**
  - 40px above the logo (was 58), 24px at the bottom (was 32).
  - Basket 56px (was 76), name 32px (was 38). The header carries the name; the footer signs off.
  - No short rule: the row of stitches above the copyright line is the one divider. The rule and its draw-in stay from 750px.
  - The help row sits 8px under the crafts (was 64), so brand, crafts and help read as one block.
  - Copyright and policy links are 4px apart (was 12); the policy links are 32px tall, so they keep their own air.
- **Desktop and tablets:** 64px above the logo (was the section space, 99px at 1280), 32px under the crafts (was 64), 24px under the help row (was 32). Logo size, rule and one-line crafts are unchanged.
- **Not changed:** content and order, tap heights (40px crafts and help, 32px policies), Soft blush, the flowers and their motion. No accordion: seven links don't need hiding.
- **Flowers still keep 17px from every word** (the 2026-10-01 rule): the left one sits beside the help row, and under 390px the top-right one is 24px (was 30) because the logo now starts higher. Measured nearest: 23px at 320, 29px at 360, 24px at 390.
- **Check 19:** at 360 the footer is at most 400px with no short rule; links at least 32px tall; flowers 17px clear at 320, 360 and 390; desktop at most 460px with the rule. The limits grow by the height of extra help rows, social icons and payment icons once those are set up.
- **Still to come (launch admin):** the footer menu holds only "Search", which the header already offers. Real help links add 40px per wrapped row.

## 2026-10-04 (the header is not pinned while scrolling down)

- **The header keeps hiding on the way down and returning on the way up.** Raushan asked whether it should stay on screen, since it is the only route to search and the menu. It has to be reachable, not always visible, and it is: about 48px of upward scroll brings it back from anywhere on any page.
  - It is the same gesture as Chrome's own address bar on Android.
  - The catalogue is small and browse-led; shoppers scrolling down are looking at products, and a pinned bar would take about 60px of every phone screen.
- **The header does not slide back in when something is added to the cart.** The added-to-cart pop-up (cart-plan.md, D2) already says so with the photo, the title and View cart for about 8 seconds; a second thing moving at the top would repeat it. The badge updates while hidden and is correct when the header returns.
- **Reopen only if shoppers are seen not finding search or the menu after launch.** Pinning is a small change in the header block of `assets/theme.js`.
- No code change.

## 2026-10-04 (phone first screen: design review, three small fixes)

- **Review of the first screen at 360px (Raushan asked for a designer's verdict).** The layout is sound: one 20px left edge and one right edge shared by the header, heading, photo row, Bestsellers and the grid; 24px gaps inside a group and a larger pause between groups; products on the first screen. Three things were off, all fixed:
  - **Hero photos are 68% of the row on phones (was 62%).** At 360px the first label ("Sunflower bouquet ₹1,299") needed about 183px and had 178px, so it wrapped to two lines beside a one-line neighbour. Now the photo is 217px (was 198), every label is one line (28px tall at 360, 390 and 412), and half of the next photo shows (111px) instead of two-thirds with its price cut. A campaign card is `68% × 4/3` (290px at 360; the next photo peeks in by 38px). Tablets stay at 44%.
  - **Section headings are 28px on phones (was about 33px).** `--fs-h2` is `clamp(1.75rem, 1.2rem + 2.5vw, 3.125rem)`. The hero heading is 38px, so the ratio went from 1.16 to 1.36 and "Bestsellers" no longer competes with it. This applies to every section heading and to the collection and cart page titles; the desktop maximum (50px) is unchanged.
  - **The pause before Bestsellers is 48px (was 56px)**, plus the hero's 8px, to pay back most of the taller photo. It is still more than twice the gaps inside each group.
- **Measured at 360 × 780:** craft circles start at 588px. Checks 10 and 12 pass (24/24, Chrome).
- **Left alone on purpose:** the search icon sits closer to the logo than the menu icon does (the cost of a centred name with one icon on the left and two on the right); "stitched with love" is wider than the serif lines; the cut-off fourth circle is the swipe cue; the chosen circle keeps ring, bold label and underline.

## 2026-10-04 (Our promise is a slim strip on phones, docs/promise-strip-plan.md)

- **On phones the promises sit in one row, titles only.** Raushan asked whether the card earned its space: it was 560px tall on a 360 × 800 phone, 70% of a screen, for three short promises. It is now 141px (320 to 390 wide, Chrome and Safari).
  - Under 750px: three columns, icon 32px (was 48), title 16px (was 22) wrapped evenly, sentences hidden, 32px padding top and bottom.
  - 750 to 989px: one row with the sentences (was two columns with the third promise alone on its own row).
  - Desktop is unchanged.
  - Four promises: 2 × 2 on phones, one row from 750px.
- **The Blush card and stitched border stay**, as decided on 2026-10-01: the promise is a brand moment. Don't flatten it into a plain icon row.
- **The position stays** (after Customer love, before FAQ), as decided on 2026-10-03.
- **The sentences are still in `templates/index.json`:** tablets and desktop show them. The editor's "Text" setting says phones show the title only.
- Check 18: one row, card at most 180px, no sentence shown on a 360px phone; no title cut off at 320; sentences shown on desktop.
- **Product page:** `snippets/offer-terms.liquid` is its one trust row. Don't add this strip there as a second one; if "Made to last" is wanted on the product page, it goes into that row.

## 2026-10-04 (fluid feel, docs/fluid-feel-plan.md)

- **No backdrop blur anywhere (phase C).** Raushan compared with and without on a Galaxy S24 Ultra in Chrome and could see no difference, and chose to remove it. The header is Blush Soft at 96% (was 88% with a 14px blur); chips on photos are white at 96%. A blur is redrawn on every frame something moves under it, so it could only cost frames on cheaper phones. Don't add `backdrop-filter` back; check 6b fails if any appears.
- **Section CSS is not split per page (phase D).** The 175 KB was the local server's uncompressed copy; it is about 29 KB compressed, cached after the first page, and parses in 3.7ms at 4x slower CPU. A split would risk late styles for nothing felt. The CSS budget in motion-plan.md is now 40 KB compressed. Reopen only if PageSpeed on the live site flags it.
- **Arrivals finish about twice as fast; the choreography is unchanged** (Raushan: the store felt heavy; go-ahead given on the condition that it stays alive, smooth and accessible). Measured before: content kept arriving for 1.1–1.6s after a scroll stopped, over the motion plan's 1s budget.
  - Arrival 800 → 450ms (`--dur-arrive`), photos settling 1000 → 500ms, ink-rise headings 900 → 600ms, stitches 1400 → 900ms, stars and promise icons quicker in step.
  - `--stagger` 90 → 50ms, at most 4 steps (was 6). `--rise` 24 → 12px.
  - An arrival starts as its first pixel enters the screen, not once it is 10% inside, so there is no blank band at the bottom while scrolling. It does not start earlier than that: a slow scroller should still see it.
  - New gate in `npm run check` (1b): 700ms after landing on any screen of the home page, nothing in view is still hidden or faded.
- **Photos still loading fade in over 250ms** (was 700ms). **The page cross-fade is 150ms** (was 260ms).
- **The header hides as soon as you scroll down, but returns only after 48px of upward travel** (was 6px either way), so a small wobble no longer slides it over the content. It still returns at once near the top and whenever focus is inside it.
- **A slow page shows a thin Cocoa line at the top, 300ms after the tap** (phase B; Raushan's go covered the recommendation). This replaces the motion plan's "no loading indicator on page loads", which assumed hover prerender covers every tap; it does not on phones or in Safari. A page that arrives within 300ms shows nothing.
  - It never shows for a link within the page, a new-tab link, or anything a script handles itself (cart drawer, search).
  - It starts a third of the way across, because Safari freezes animations while a page is on its way and must still show a line. With reduced motion it appears without moving.
  - Cocoa, not Rose: Rose on Blush is too faint for a status mark.
- **On touch screens in Chrome, links the shopper is looking at are fetched ahead** (half on screen for 400ms; six a page at most; HTML only; never in lite mode or data saver; same exclusions as the hover prerender). Measured locally: tap to painted 0.9s → 0.5s.
- **`page-turn.js` is a new module on every page** (4 KB): the line, the fetch-ahead, and Firefox's hover prefetch, moved out of `theme.js` (now 21.3 KB of its 25 KB budget). It also registers an empty touch listener, which iOS Safari needs before it shows any `:active` press state.
- **Left alone on purpose:** the logo intro, the hero entrance, the "One stitch at a time" writing, the hero slideshow, the card hover crossfade, drawers and accordions.

## 2026-10-04 (Our story is shorter on phones, docs/story-phone-plan.md)

- **The story clip is 4:3 landscape on every screen** (was 4:5). Raushan's call: hands at work are a wide subject, and a landscape frame shows them in less height. The real clip is filmed with the phone held sideways; a vertical Reel would lose 40% of its height. A photo, when there's no video, still keeps its own shape.
- **On phones and tablets the yarn-ball icon sits beside "How it's made"** at 32px instead of taking a row at 52px, and the panel's bottom padding and the gap under the clip are one step smaller. Desktop keeps the 52px icon above the label.
- **Result at 360 × 800:** the section is 671px (was 886px) and the Blush panel 555px (was 771px), so the whole panel fits one screen. Check 6c fails if it stops fitting.
- **Known in the demo only:** the logo animation was made for 4:5, so the play button sits on the end of "Handmade with love". It goes with the demo assets.

## 2026-10-04 (audit fixes, docs/audit-2026-10-03.md)

- **Audits cover only what is built.** SEO, checkout, the product page and the starter pages are judged when their phase is built (Raushan).
- **"Partial COD available" stays in the announcement bar for now** (Raushan): the store isn't public, and the bar's wording is settled with the rest before going live.
- **Dispatch time is "Ships in 1–2 days"** (Raushan), in the bar's fallback line and on the product page.
- **"Shop all" goes to a collection chosen in Theme settings** (Shop all → "Shop all" collection, set to "Shop"), not `/collections/all`, which lists the free gift. A new "Shop all" link must use `settings.shop_all_collection.url | default: routes.all_products_collection_url`.
- **Header breakpoints are in `em`** (48em, 56.25em, 68.75em, 80em), so the browser's text size decides the layout along with the screen width. Other sections keep `px`.
- **Large text is supported to 200%** on phones and desktop: rows wrap, the cart line stacks (container query at 15em), menu tiles and footer crafts drop a column. `npm run check` section 16 and `npm run stress -- big130|big200` guard it.
- **Buttons may wrap** (`.btn` no longer has `white-space: nowrap`), and their side padding is capped at 7vw.
- **theme.js and cart.js were split** to stay inside their budgets: `shop-crafts.js` (home only) and `cart-toast.js` (fetched with the first add).

## 2026-10-03 (home Bestsellers uses the collection page's card)

- **The home page's Bestsellers cards are the compact card** (Raushan liked the collection page's): plain Jost name at 16px (2 lines at most), the smaller photo corners and badge, and the collection grid's spacing. This reverses search-results-plan §5's "the home page cards don't change".
  - A product now looks the same on the home page and on the collection its "See all" opens.
  - Still 2 across on phones and 4 on desktop (not the collection's 3 and 5): each craft shows four, which would leave a gap.
  - The editorial card (Cormorant italic name) is left only in the Featured products section, which the home page doesn't use.

## 2026-10-03 (shipping, payments and checkout, docs/shipping-checkout-comparison.md)

- **Shiprocket ships the parcels.** Shopify has no shipping service in India, so an aggregator is needed whatever the checkout is. Changing it later is invisible to shoppers.
- **Partial COD only, from day one; no full COD** (Raushan).
- **Shiprocket Checkout is the checkout, with Razorpay connected inside it** (Raushan, after the comparison). Partial COD is built in and Shopify's checkout can't do it without an app; payment happens inside the pop-up; Shopify's 2% on outside-gateway orders isn't charged. Raushan expects ₹2–3 lakh of sales in the first month, where even a fixed monthly fee about pays for itself. The first recommendation, Shopify's checkout, was made before partial COD only was decided.
- **Shopify's checkout with Razorpay stays connected as the fallback,** because Shiprocket can change fees or end service on its own and Shopify's app rules forbid bypassing checkout.
- **No cart app and no coupon list in the cart.** Our offers are automatic and the cart is already built.
- **Done at launch, not now** (Raushan). Steps and the trial are in the launch checklist.

## 2026-10-03 (price details count sale prices)

- **Price details start from list prices.** Raushan found that a product on sale (₹1,199 struck through, ₹999) didn't show in the breakdown. A "compare at" price is not a Shopify discount, so Shopify's before-discount total leaves it out. Now Items is the cart at list prices, "Product discount" takes the sale prices off (one row for all products), then each Shopify discount, and the rows add up to the subtotal. The struck-through total beside Checkout uses the same number, so it agrees with the lines above it.

- **"Items" is now "Item total"** (Raushan: "Items" didn't say it was a price). "Total price" was passed over because it reads like a second total next to Subtotal.
- **Free shipping shows what it's worth: "~~₹99~~ Free" on one row**, not a "Shipping ₹99" row and a "Shipping discount −₹99" row (Raushan's first idea). One row says the same in less room, and it's how Indian shoppers already see it elsewhere. The fee is the "Standard shipping fee" theme setting, which must match the paid rate at checkout. A struck-through average for live courier rates (Raushan's second idea, ₹149) was dropped: it isn't what that shopper would have paid.
- **Shipping is a flat ₹99 under ₹999 and free from ₹999** (Raushan, after checking floreal.in's checkout at several pincodes: ₹99 standard, ₹129 express, free above their amount). The theme setting is 99, and the store's India rate was changed the same day from Shopify's default ₹379 to "Standard" ₹99 (free from ₹999 was already on it), so the check "Offers: shipping rates match Theme settings" passes. Express (₹129) is not offered yet: open question.
- **Claude can change some admin settings now** (Raushan, 2026-10-03): write access for shipping, discounts, products and collections, menus and redirects, pages and files. Orders, customers, payments and inventory stay off, and publishing the theme stays Raushan's. Each admin change is read first, read back after and written down here, because the admin isn't in git.
- **"You save ₹… on this order" under the subtotal** adds up sale prices, discounts, the gift's worth and the waived shipping fee, so the whole saving is one number.

## 2026-10-03 (account page on phones)

Plan and checks: `account-phone-plan.md`.

- **On phones the greeting row opens "Your details".** The initial, name and email end in a `›` and the whole row is one link (Raushan: like the header menu's top row). The details card was about 1,180 px down the phone page, after orders, Saved and Recently viewed. Desktop keeps the card beside the orders, so there the greeting stays plain text.
- **"Your details" is its own page on phones:** the account page with `?view=account-details` (an alternate template, so no admin step). It has a back link, the details, "Edit your details", Sign out and "Download or delete my data". The card and the data link leave the phone account page; Sign out stays at its end too.
- **Recently viewed on the account page has "Clear",** the same button as on the Saved page (Raushan: the same everywhere). No confirm and no undo, as there.
- **A new template whose section setting is new must upload after the section.** `shopify theme dev` uploaded `page.account-details.json` before `sections/account.liquid` knew the "Show" setting, so Shopify dropped it without an error and the page showed the normal account page. Saving the template again fixed it.

## 2026-10-03 (announcement bar: no icon)

- **The announcement bar has no icon, only words.** With a dot between the parts, the truck read as belonging to "Free shipping" alone, so "Partial COD available" looked like the lesser message. A second icon was weighed and dropped: COD has no icon that reads at 16px, and two icons crowd a 360px line. The message block's icon is "None", and the line built from Theme settings has none either. The icon choice stays in the editor for a one-part campaign message (a gift, a delivery cut-off).
- **The truck is not moved to the middle** (Raushan asked, worried about a camera cut-out covering "₹999"). In a browser the page starts under the status and address bars, so a cut-out never covers it.

## 2026-10-03 (Compact cart, docs/cart-compact-plan.md)

- **The drawer's pinned bottom is one row: subtotal on the left, Checkout on the right.** Raushan asked for it, so the products get the room. It went from about 285px to 140px (everything unlocked) or 190px (a step ahead).
- **"Ships in 1–3 days" is gone from the cart**, drawer and page. It stays in the announcement bar and the product page's delivery terms.
- **The rewards bar hides once everything is unlocked**, in the drawer and on the cart page. Only the words stay: "Free shipping and free gift unlocked".
- **Discount notes with ₹0 are hidden.** Shopify lists the gift's discount on every line, with nothing off the others.
- **The added-to-cart pop-up no longer shows the rewards line.** This reverses O6 in `offers-plan.md`. The line wrapped to five lines on phones. The pop-up is now one 66px pill with a round photo. Screen readers still hear a changed step.
- **Price details, Flipkart-style (Raushan's idea).** The pinned bottom shows only the amount and Checkout. The amount has a dotted underline and goes to a "Price details" card at the end of the list: Items, discounts, Shipping, Subtotal, "Prices include all taxes." An info button and an "incl. taxes" note were both tried or weighed first and dropped: this hides nothing and has room for discount codes or a COD fee later.
- **Shipping is never added into the subtotal.** The card says "Free", the flat fee "added at checkout", or "Calculated at checkout".
- **One product, one line.** Shopify splits a product in two when the gift's discount is on, and re-splits it if merged through its API. The theme draws them as one line and changes both together.
- **cart.js stays under 22 KB by splitting, not trimming:** the cart page's own script is now `cart-page.js`.
- **The cart page's summary card keeps its stacked layout**, because it isn't pinned and the express payment buttons need the full width.
- **The "Saved" pop-up has the same pill shape** as the added-to-cart pop-up, in all its forms (Saved, Removed · Undo, Link copied, signed out).

## 2026-10-03 (Gifting, docs/gifting-plan.md)

- **Gifting stays right after Bestsellers, as an occasion shelf on its own White band.** It used to look merged with Bestsellers: the same background with one shared gap, a footnote to "Shop all gifts", and text-only pills.
  - Each occasion is a photo tile with its name on a label.
  - The last tile is "Gifts under ₹999" in Blush, with the price as its picture.
  - Phones swipe; desktop shows all five in one row.
- **Every tile goes to its own automated collection.** Occasions fill from tags (`occasion-…`), and Under ₹999 fills by price. A tile whose collection is empty or not chosen hides, so nothing leads nowhere (the old pills all opened the all-collections page). The Gifts menu uses the same collections.
- **Permanent occasions:** Birthday, Anniversary, Thank you, For her, Under ₹999. Valentine's and the other dated occasions belong to the seasonal hero campaign.

## 2026-10-03 (yarn lettering round 2 and home order, docs/yarn-story-plan.md)

- **The hero's "stitched with love" is still yarn lettering, readable at once, with no motion.** The round 1 writing (below) hid half the headline for several seconds on the first screen, pulled the eye from the products, and repeated on every visit.
- **The hook-and-ball writing moved to Our story's "One stitch at a time".** The line starts blank, the hook and ball arrive together when the whole heading is on screen, the ball rolls and shrinks under the line, and both leave together. Once per page view.
  - A tap or scrolling away finishes it.
  - It waits for the logo intro.
  - Reduced motion, lite mode and no JavaScript show it finished.
- **One thing moving at a time in Our story:** the heading skips its ink rise, and the clip waits until the words are written (a shopper's Play still wins). On phones the clip shows its still frame until then. The scroll-drawn background strand stays, since it follows the shopper's scroll.
- **Home order:** Hero, Bestsellers, **Gifting, Our story, Customer love, Our promise**, FAQ, Newsletter.
  - Both shopping paths sit at the top, then the reasons to trust us.
  - The backgrounds alternate plain and Blush from Gifting on.
  - Promise's first line is now "Every piece made by hand, never by machine.", so it doesn't repeat the story heading.

## 2026-10-03 (yarn heading, docs/yarn-heading.md)

- **"stitched with love" is written by one strand of Cocoa yarn on the home hero**, replacing the dashed underline. On every home visit, after a 2.5 s pause (or 2.5 s after the logo intro), a crochet hook takes yarn from a ball resting after the last word, writes the words over a faint dashed pattern, comes back to the ball, crosses the t's and dots the i's with rose knots.
  - About 5 s of slow motion; a tap or scroll finishes it.
  - With reduced motion, lite mode or no JavaScript it's simply there, finished.
  - The words stay as text for Google and screen readers.
  - Any other highlighted words keep the stitched underline.
  - Generated by `tools/yarn-lettering.mjs` from EMS Allure (SIL OFL).

## 2026-10-03 (account round 3, docs/account-branding-plan.md)

- **Shopify's sign-in, profile and order pages get styled, not replaced** (no theme can host them with current accounts). Colours, logo and fonts are set in the checkout and accounts editor to match our account page: Soft blush page, white cards, Cocoa Deep buttons and links, our horizontal logo, Jost (plus Cormorant if listed). The desktop sign-in photo is the pink tulips and daisy bouquet. Done now on the dev store with Raushan; the `account.` domain follows at launch.
- **Help is out of the account dropdown.** The navigation's Help menu (Track order, Shipping & delivery, FAQ, Contact, Our story) stays as it is. It's the customer-service menu for everyone, including guests. Order problems go through each order card's "Need help?", and Shopify's account menu keeps Help because those pages have no store navigation.

## 2026-10-03 (checkout and account pages branded, docs/account-branding-plan.md §3)

Set by Raushan in Settings → Checkout → Customize, guided step by step:
- **Logo:** `docs/branding/logo-name-640.png` (basket icon + "Yarn Basket", without the tagline, which would be unreadable at this size), 140px, left. On the sign-in page Shopify centres it.
- **Colour palette:** Cocoa Deep `#4E3A31`, white `#FFFFFF`, Soft blush `#FBF1EE`. Main and header backgrounds `#FBF1EE`. Accent (links, cart icon) and buttons Cocoa Deep. The order summary background is Soft blush. Input-field error colour `#A3341F`. Fields stay white (Transparent off).
- **Fonts:** headings **Cormorant** (it looked clear on the phone preview), body **Jost**.
- **Sign-in page:** Soft blush background, with photo `docs/branding/signin-photo-pink-tulips-daisy.jpg` on the right on desktop (phones don't show it).
- **Sign in with Shop: off** (Customer accounts → Authentication). It was the loudest, off-brand button. Now it's Google and the email code; Facebook stays unconnected.
- Unchanged: one-page checkout, address autocompletion on, Buy again on, no "always show discount code" box (offers are automatic). The editor has no corner-radius setting.
- Still open: the Orders page's "no orders yet" collection (§3.6) waits for a Bestsellers collection (Store setup in the checklist).

## 2026-10-03 (home calm-down, docs/home-calm-plan.md)

- **Phone hero: one statement per screen.** The description is hidden on phones when there's a photo row (desktop keeps it), with a little more air around the heading and a 64px pause before Bestsellers. The first screen goes from 8 text styles to 5, and the photos start 46px sooner.
- **No "LOVED MOST" eyebrow on Bestsellers** (phone and desktop): the heading already says it. The setting stays in the editor, empty by default. An audit of the other sections' eyebrows is a possible follow-up.
- **One button style:** Bestsellers ends in the solid Cocoa "Shop all gifts →", centred and sized to its words, matching the hero. It replaces the full-width outlined box on phones and the far-right outlined pill on desktop.
- Kept: the name and price labels on hero photos, the bar, the header, and desktop's hero layout.

## 2026-10-03 (hero button, revisits 2026-10-01 "Blush pill with a white knob")

- **The Blush pill with a white knob is gone.** Raushan said it "feels odd", and the reasons are clear:
  - It reads like an on/off switch.
  - Blush on Soft blush is about 1.2:1, so the button barely stands out.
  - On phones it was a third way in, between the photo row and the Bestsellers circles.
- **Phones:** with a photo row there's no button. The products are the way in, and the row ends in a "See all gifts" card that goes to the button link. That raises the row 60px (it starts at 274px instead of 334px on a 390px phone), and the Bestsellers heading reaches the first screen. With a single photo the button shows; on a Blush hero it's a text link.
- **Desktop:** the site's solid Cocoa button with an arrow after it, about 10:1 contrast, 52px tall.
- **Label:** "Shop all gifts" instead of "Shop all crochet". The h1 already says crochet.
- check.mjs §10 is updated to match: no button with a row, and the end card ≥48px and last in the row.

## 2026-10-03 (hero campaign banners, docs/hero-campaign-plan.md)

- **Festival banners: yes, but only while a campaign is live, one at a time, swiped by hand only.** The rest of the year the hero is the headline plus products. Baymard advises against carousels on phones, and slides after the first are rarely seen. The four reference sites all use Dawn's stock slideshow, which shows the layout is common, not that it sells.
- **Phones:** a 3:2 banner (16:9 on short phones) takes the place of the heading, line and button, so the product row stays on the first screen. 16:9 everywhere was dropped: it crops tall bouquets.
- **Desktop:** a wide banner replaces the whole hero (chosen after mockups). The split layout, festive words beside a square photo, read as "the normal page with new words". The card in the photo row stays as the fallback when there's only a square photo.
- **Words are real text on a pill, never in the image.** The heading stays as a hidden h1.
- **The five big occasions get the hero** (Diwali season, Christmas, Valentine's week, Mother's Day, Rakhi). The rest get the bar and a collection. Raushan can make banners with AI, so this is content advice, not a build limit: the piece itself must be a real photo, AI only for the setting, and no text in the image.
- **No click counter yet:** theme events reach only tracking pixels, not Shopify's reports. Add it with GA4 or the Meta pixel.
- **The bar's campaign message can skip the home page** (D7), so the shipping and COD line stays there.
- **Built with dummy content** and tested at `/?view=campaign-test`. Real photos and dates come later.

## 2026-10-02 (account page, round 2, docs/account-hub-plan.md)

- **Our own "Your account" page in the theme (`/pages/account`), with Shopify's hosted pages kept for editing and full order details** (AH1). Shopify's hosted pages can only take a logo, colours and fonts; their layout and motion are fixed, and editing needs the Customer Account API, which a Liquid theme can't use.
- **Sign out was missing, and that wasn't intentional.** Shopify's `<shopify-account>` sheet has no sign-out by design, and round 1 wrongly assumed it did.
  - Sign out now goes in our desktop menu, the account page and Shopify's pages, never the phone drawer.
  - No confirm step; a "You're signed out" pop-up afterwards.
  - Shoppers land on the same page if Shopify allows it, otherwise home.
  - Saved items are kept on the device; Recently viewed is cleared.
- **Signed in, the header dropdown is ours** (greeting, icons, counts, Sign out). Shopify's sheet is used only for signing in, restyled through its variables (AH2).
- **On phones, the drawer's "Hi, name" row opens the account page** (AH3). **The page is one scrolling page**, with jump tiles on phones and two columns on desktop, not tabs (AH4).
- **Order cards:** two buttons chosen by the order's state (Track parcel or Buy again, plus Need help? on WhatsApp), plus a Details link to Shopify's order page. Raushan: "not much, not less".
- **Extras on the account page:** "Ask for a custom piece", "Download or delete my data" (DPDP), email-offers status, and Recently viewed.
- **Sign in with Google is set up now, on the dev store** (spike G0 first), which takes it off the launch list. Only the domain values are redone at launch. "Continue with Shop" is turned off if the admin allows it.
- **Shopify's account pages are branded now on the dev store.** Shopify's account menu becomes Orders, Profile, Saved, Help.
- **Built 2026-10-03 (theme side),** with two changes from the plan:
  - Order cards put "Details" at the top right, and the phone buttons share the row equally.
  - Cards show only the states Liquid can see, never "Delivered".

  Also fixed: the logo intro no longer plays on the account, Saved or Track pages. The preview is `/pages/contact?view=account-demo`. Details are in account-hub-plan.md "As built".

## 2026-10-02 (header labels on desktop)

- **From 1100px, "Account" and "Cart" both show their word beside the icon** (Raushan approved). One labelled icon next to an unlabelled one looked accidental. Labels match what Indian shoppers know (Flipkart, Amazon and Meesho label the cart on desktop). Phones stay icon-only.
- **Sentence case ("Cart", "Account"), not spaced capitals,** so the tools don't read as more menu items next to SHOP / GIFTS / BESTSELLERS / HELP.
- **The account word is "Account", not "Sign in".** Shopify's `<shopify-account>` button is named "Account" (aria-label in its shadow root), and the visible label must match the spoken name (WCAG 2.5.3, so voice control's "click Account" works). Session 63 caught it, and it was checked in the accessibility tree. Signed in, Shopify's initial circle replaces the word.
- The fallback link (before the component loads) is the same pill (116 vs 114px), so the row doesn't shift. The word sets its own font, because text slotted into Shopify's button inherits Shopify's font.

## 2026-10-02 (cart look and rewards, docs/cart-look-plan.md; built)

- **C1. The cart count sits on the cart icon's corner on desktop too**, the same as phones. The CART word now has 14px of room.
- **C2. The cart page and drawer use Soft blush with white cards** (`scheme-soft`), like the home page:
  - the summary card is white, and the gift note box and quantity buttons are white
  - Checkout stays Cocoa Deep, the one dark button in the cart
  - photo placeholders are Blush
  - hovers in the cart lines use the scheme's surface colour, so they still show on Soft blush
- **C3. Free shipping from ₹999 is on in Theme settings**, so the progress bar, "Small add-ons" and the sorting of Little extras work. The gift step stays off until a gift product and its "Buy X get Y" discount exist.
  - The store's shipping rate is still ₹379 at every total, so `npm run check` §11 fails on purpose until Raushan adds a ₹0 rate from ₹999.
- **C4. The currency format is `₹{{amount_no_decimals}}`** (Raushan, admin).

## 2026-10-02 (home media built, docs/home-media-plan.md)

- **Built as planned, with Raushan's two changes:** the video autoplays in view on phones too (guarded), and the hero is square on desktop too.
  - Square hero: at 360 × 780 the craft circles moved from 691 to 644px.
  - A campaign card adds 0px to the hero.
  - "Made by hand" now follows Bestsellers.
- **The test video is the brand kit's logo animation**, as demo content (`demo-story-video-*`), at Raushan's suggestion. It's deleted with the other demo assets before launch; the real clip goes in the section's Video setting.
- **The video starts fetching at half a screen away, not a whole one.** Next to Bestsellers it's within one screen of the top on a 390px iPhone, and visitors who never scroll there shouldn't pay for it.

## 2026-10-02 (product cards are square)

- **Every product card photo is square (1:1)**, the big home cards as well as the compact ones on the collection, search and saved pages. They were 4:5 before.
  - The photos are shot square (1200×1200), so 4:5 cropped about 20% off their sides.
  - A product now looks the same on the home page and on the collection page it opens. The hero is square too (home-media-plan).
  - On a 360px phone the cards are shorter, so the craft circles start at 644px instead of about 692px.
- **Bestsellers shows demo cards until collections exist.** Demo cards (Theme settings → Demo content) aren't real products, so they link to "Shop all" and have no heart. The store has no craft collections yet, only "Home page". Once a "Bestsellers" collection and one collection per craft are set on the section, the cards open their product page, show live prices and get the heart.

## 2026-10-02 (home hero colour: Soft blush leads, Blush supports)

- **Raushan's direction:** the whitish **Soft blush #FBF1EE** is the main colour and the pinkish **Blush #F2D4CC** is the supporting colour, as the page below the hero already does ("Our promise" and "How it's made" are Blush cards on Soft blush). He calls them "Soft blush" and "Blush".
- **Built:**
  - the hero background and the header at the top of the page are now Soft blush (hero "Background" setting: Soft blush)
  - the way in is a Blush pill with a white arrow knob, on phones and desktop (50px tall, sized to its text)
  - the desktop photo frame keeps its Rose outline
  - Blush stays for the top bar, the pill, the craft circles and the panels below
- **Why not pure white:** everything below the hero is Soft blush, so a white hero left a visible seam at Bestsellers. Soft blush makes the first screen one continuous surface, and it still reads as white next to Blush.
- **Why not a Blush card behind the hero text:** it adds a box to the busiest screen, reads as an ad banner and pushes Bestsellers about 40px down.
- **Blush hero still works:** with the Background setting on Blush, the old behaviour returns (header tinted to match, a text link on phones, a dark pill on desktop), because a Blush pill would vanish on Blush.
- **Checks:** full `npm run check` 88/88. Section 10 now expects the pill on a light hero and the link on a Blush one.

## 2026-10-02 (home media, docs/home-media-plan.md; plan only)

- **The "Made by hand" video autoplays on phones too** (Raushan): muted, inline, looping, only while at least half of it is on screen, and paused off screen.
  - Loading starts only when the section is near, with a 720p copy on phones.
  - It never autoplays with reduced motion, lite mode, data saver or Low Power Mode.
  - The pause button stays.
  - This is a deliberate exception to motion-plan §8 for this one clip. Every other "no autoplay on phones" rule stands, including the hero, which stays swipe-only.
- **Hero photos are square on phones and desktop** (Raushan): no cropping of the square product photos, and a shorter hero on both. A campaign's desktop photo is square too.

## 2026-10-02 (announcement wording)

- **The announcement bar says "Free shipping over ₹999 · Partial COD available"**, Raushan's exact words. It's a message block in `header-group.json`, so it overrides the line built from settings until it's removed. It's one line from 360px; at 320px it splits into two lines at the dot.
- **Before this theme goes live:** checkout has to match it. The store's only shipping rate is still ₹379, and partial COD needs the payment gateway (launch-checklist "Offers"). After that, either keep this block, or remove it and let the line build itself from Theme settings.

## 2026-10-02 (offers: announcement bar and cart rewards, docs/offers-plan.md; built)

- **Raushan approved O1–O10 as recommended** ("go ahead with your recommended options").
- **The announcement bar is one line, forever.** Raushan wasn't sure between one message and several, so here is why it's one:
  - Several messages would need rotation, which WCAG 2.2.2 rules out without a pause button, or arrows. Both are the clutter Raushan was worried about, and the line would keep moving as offers are added.
  - Baymard found 27% of shoppers miss offers that live only in a site-wide banner. The bar can't do the job alone anyway, so every offer is also said where the decision happens: the product page, the added-to-cart pop-up and the cart.
  - One line that's still useful (free shipping and COD are what Indian shoppers check before trusting a new shop) earns its 33px. A second message doesn't.
- **How the one line works:**
  - It's built from Theme settings, so it can't disagree with the cart: "Free shipping over ₹999 · Cash on delivery" once they're on, "Handmade in India · Ships in 1–3 days" until then.
  - Phones show two parts and 768px+ shows three, all static.
  - A dated message (a Diwali cut-off, a sale) replaces it until its "Show until" day. Max 2 message blocks; the first live one wins.
  - Hidden on /cart. The carousel, its arrows and its JS are gone.
- **Cart rewards: free shipping first, then a free gift.**
  - Provisional amounts are ₹999 / ₹1,499, pending the Meesho average order value. Raushan's gift ₹999 / shipping ₹1,299 wasn't used, because a ₹1,299 bouquet would unlock both steps at once.
  - One bar with two markers and the amounts under them (taken from Floreal's cart), in the cart footer: about 60px against Floreal's about 340px.
- **The gift:**
  - It's a real product at its real price, made free by an automatic Buy X Get Y discount. rewards.js adds and removes it, because Shopify never auto-adds the "get" item. No gift app.
  - **If it arrives still charged, rewards.js takes it straight out.** The tests showed that with no discount, an auto-added gift would sit in the cart at ₹249 while the text said "free". Nobody should find a charged item they didn't choose.
- **Product page row:** "Replacement if damaged", not "Easy returns". There are no change-of-mind returns (Terms §6); session 63 flagged it.
- **Found while testing:** the store's only shipping rate is Shopify's default "मानक" at ₹379. `npm run check` section 11 now compares Shopify's real rates and the gift's price with Theme settings, once the offers are switched on.

## 2026-10-02 (home first screen, docs/home-hero-plan.md; built)

- **Raushan approved plan v2 with the recommended options** ("go with your recommended/best options"):
  - phones: a peek row of photos (62% wide, the next one peeking in), one "Shop all crochet →" text link with a thin solid underline, and a shorter two-line intro
  - desktop: one pill button (a small link looked lost at 1440), with the framed cross-fade unchanged
  - "Find a gift" leaves the hero
  - name and live price labels on the hero photos (H6), using a Product picker per photo
  - section order: hero, Bestsellers, occasions, promise, reviews, story, FAQ, newsletter (H7). Promise comes before reviews so the two Blush panels (promise, story) don't touch
- **Trust bar, quieter than the plan** (Raushan approved via the account session's review):
  - Blush with Cocoa Deep text and a hairline under it, about 33px tall, instead of the Cocoa band, so it doesn't pull the eye from the hero heading
  - only true wording until COD and shipping are set up: "Handmade in India · Ships in 1–3 days". "Free shipping over ₹999 · Cash on delivery" goes in from the theme editor once both are live and match checkout
  - no autoplay; arrows (48px) and swipe only with 2+ messages
  - the cart's "Ships in 1–2 days" became "1–3 days", so the two promises match. **Raushan to confirm the real delivery time**
- **Result (390 × 844):** "Loved most" 1,072 → 644px, first price 1,565 → ~1,130px. On 360 × 780 the craft circles start at 691px, on the first screen. On iPhone Safari with its toolbars showing (664px tall), "Loved most" sits at the bottom edge and the circles need a short scroll.
- **Found while testing:**
  - an offset variable set on `<html>` for the bar restyled the whole page at the first scroll (1 slow frame at 4x CPU); it's now set only on the four pop-ups that use it
  - the newsletter form made Safari scroll sideways at 320px (an older bug); fixed with `minmax(0, 1fr)`

## 2026-10-02 (account, docs/account-plan.md)

- **Accounts: Shopify's current customer accounts** (already on: `/account` goes to `shopify.com/78941028489/account`). Raushan approved AC1–AC9 as recommended:
  - sign-in with an email code + Google; Facebook off. Phone OTP isn't possible without Shopify Plus; phone-first checkout is chosen together with the payment gateway
  - Shopify's `<shopify-account>` sheet as the account button, if it passes the A0 accessibility and speed checks; otherwise our own popover
  - phones: account in the drawer as a two-line row; the header gets it from 768px
  - hearts on every product card and on the product page
  - account pages on `account.<our domain>`
  - Share your list
  - made-to-order pieces as draft orders, so they show in Orders
  - self-serve returns on, made-to-order pieces final sale
  - saved items work without signing in, on this device first; sync later
- **Built (2026-10-02), one change:** the header's account button starts at 900px, not 768px. Below that it brought the centred name within 8–30px of the search field; the drawer's account row covers those widths.
- **Why hearts on cards:** shoppers shortlist while browsing a grid, Indian shoppers expect it (Myntra, Meesho, Nykaa), and a filled heart shows what's already saved. Kept calm: a small circle on the photo's top-right, badges stay top-left.

## 2026-10-02 (desktop header layout)

- **The menu sits beside the logo, and the header is 64px tall.** Raushan felt the bar was too wide. Measured at 1470px, the centred menu left about 167px of empty space on each side, so the logo, menu and tools read as three islands. Of the mocked options, he chose B: menu beside the logo, tools on the right, and from 1280px a wider search field (up to 360px) where the menu used to float. Search is a main way into a shop with many small products. The phone header is unchanged.

## 2026-10-02 (search results page)

- **Search results page directions** (docs/search-results-plan.md §2; Raushan chose the recommended option for all four):
  - compact, easy-read result cards: square photo, Jost name
  - a 2-across grid on phones
  - suggestions as one slim row
  - one search box on `/search` (the page's own; the header pill steps back to the lens)
- D5–D10 approved as recommended (2026-10-02): More to love for 1–4 results; no word highlighting; 5/4/3/2 columns; compact cards on collection pages too (Phase 3); the lens jumps to the page box; "Best match" instead of "Relevance".

## 2026-10-02 (cart)

- **Cart: a drawer plus the `/cart` page, built from the same snippets** (docs/cart-plan.md). Raushan approved D1 and D3–D9 as recommended:
  - minus turns into a bin, with an inline Undo
  - free-shipping line, set in Theme settings and hidden at ₹0
  - gift note in the cart
  - no discount code box
  - Little extras and payment icons on the cart page only
  - no quick add on cards yet
- **D2 changed by Raushan:** adding to cart shows a Flipkart-style "Added to cart · View cart" pop-up and doesn't open the drawer, so shoppers can keep exploring.

## 2026-10-02 (craft row: selected line)

- **Craft circles use the header's underline rule.** Selected = a short solid line (plus the dark ring and a bolder label); hover or keyboard focus = dashed stitches that draw in. Before, the selected craft had dashes, which the header uses to mean "pointing at", not "chosen".

## 2026-10-02 (menu: Our story under Help)

- **The top menu is Shop / Gifts / Bestsellers / Help (four items).** "Our story" is the last item under Help, set apart by a dashed divider (nav-item adds `.is-about` to any child whose handle or title mentions "story" or "about"). It also stays on the home page (the story section and its link) and goes in the footer menu. Raushan felt a top-level "Our story" wasn't useful to shoppers. It stays reachable because, for a new handmade brand, it builds trust and carries the "made by hand" differentiator.

## 2026-10-02 (header logo)

- **Phones and tablets (under 1100px) show the name only, centred, at about 27–28px.** Raushan found the small basket beside the bold name uneven. In the brand kit the basket is about twice the name's cap height, so at 34px beside a 24px name it read as a thin doodle and pulled the name off-centre to the eye. Four options were mocked on the real header. Name-only won: calmest, readable, and a new brand is remembered by its name.
- **Desktop shows the basket at 44px with the name at 26px**, the brand kit's horizontal-logo proportions.
- **The basket stays in the menu drawer, footer, logo intro, favicon and the "All" circle.** The logo link reads "Yarn Basket, home" to screen readers.

## 2026-10-02 (home page shop section, docs/home-shop-plan.md)

- **"Shop by craft" and "Bestsellers" are merged into one section** (`shop-crafts`). The craft circles are toggle buttons that switch the product grid below them, like opening an Instagram highlight. On phones, products show 185px sooner. The home page has one section fewer, and it no longer repeats the header's Shop menu. Every craft's "See all" link stays in the HTML for SEO.
- **The section is Bestsellers only** (Raushan, 2026-10-02, replacing the earlier "Our favourite makes" / "Favourites" wording): "Loved most / Bestsellers". The first circle is **All** (the best sellers across every craft), and each craft circle shows that craft's best sellers. Set every one of those collections' sort order to **"Best selling"** in the admin so Shopify orders them by real sales. Until launch, the order is whatever is set by hand. No "Bestseller" badge inside this section, since every card in it is one.
- **Product cards only show what's true:**
  - badges, one at most: Sold out, then Last few (tracked stock of 3 or fewer), then **Sale** (price below compare-at; dark Cocoa so it stands out), then New (tag), then Bestseller (tag; hidden inside the Bestsellers section)
  - **name and price only under the photo** (Raushan, 2026-10-02: "simple, like IG"). The "Ships in X days" line, the colour count and the star rating were all built and removed the same day. Every order ships in 1–2 days, so that belongs in one site-wide promise, not on each card.
  - the badge comes after the name in the HTML, so links read name first
- **No quick add-to-cart on cards yet.** It comes with the cart drawer (build-plan Phase 5).
- **Flower pots is a launch category** (Raushan, 2026-10-02). It's on the home page and in the Shop menu. The menu item stays "Bestsellers".

## 2026-10-02 (phone menu drawer)

- **The drawer's × is always visible.** The top bar (logo and ×) is pinned while the menu scrolls. Raushan asked whether people would know to tap the thin strip of page to close the menu; most wouldn't. The strip, the swipe and Back still work as extras.
- **Craft tiles 3 across, with "Shop all" as the 6th tile.** The menu is about 250px shorter, so Gifts, Bestsellers, Our story and Help show without scrolling on most phones.

## 2026-10-02 (search, docs/search-plan.md)

Raushan accepted every recommendation in search-plan §13.
- **Phone search closes with a back arrow (←) beside the field (Raushan chose it from Cancel / × / arrow).** It's what Flipkart, Amazon and Meesho use, it matches Android's Back, and it doesn't clash with the field's clear ×. It also saves a row above the keyboard. The 1100–1279px desktop panel keeps Cancel.
- **Fix: tapping a chip or result no longer jitters.** The panel stays up (dimmed) until the results page replaces it, instead of closing and flashing the old page.
- **Built the same day (stages S-1 to S-3, see "As built" in search-plan.md).** The panel is one column at every size, so the keyboard order matches the reading order. "See all" has no count, because predictive search doesn't return one. The open/close code stays in theme.js (2.0 KB gzipped) so the phone keyboard opens on the first tap. Search runs on demo products until real ones exist.
- **S1 Scope:** search covers products, collections and help pages (blog posts once the blog exists). Products always come first.
- **S2 Phones:** search opens as a full-screen sheet with the keyboard up at once. Tablet and desktop get a dropdown panel under the header.
- **S3 Before typing:** recent searches (kept only in this browser), Popular chips and 4 Bestsellers, so products are on screen straight away.
- **S4 No results:** Popular chips, a "we make custom pieces, ask on WhatsApp" card (once the number is set) and Bestsellers.
- **S5 Popular searches** come from an admin menu called "Popular searches", so they change without a deploy.
- **S6 Results page at launch:** sort and craft chips only. A full filter drawer, shared with collections, comes once the catalogue passes about 40 products.
- **S7 Analytics at launch:** Shopify admin search reports and GA4 only. No custom event for panel clicks yet.
- **S8 Install Search & Discovery** (Shopify, free) for synonyms, boosts and search filters.
- **Built with plain links and a status line, not an ARIA combobox** (kept from nav-plan §7). The search page gets `noindex, follow` as a backup to Shopify's robots.txt (SEO-sensitive, approved with the plan).

## 2026-10-02 (header and navigation, docs/nav-plan.md)

- **Header icons are 28px glyphs with 1.8 strokes in 48px targets.** The menu icon is three lines, and the cart icon is a classic trolley. A basket drawn like the logo's was tried first, but at 28px it read as a striped bucket. Raushan chose the trolley from four options because Indian shoppers already know it from Flipkart, Amazon and Meesho, and on phones the icon has no word beside it. The cart badge is 20px with a 12px number. Cart changes are announced through a `role="status"` line. Raushan said the old icons were too small and not accessible.
- **Words where there's room:** on desktop, "Cart" is always written, search is a real field from 1280px, and Account has a tooltip (Esc hides it). Phones stay icon-only, because there's no room at 360px.
- **The main menu is Shop / Gifts / Bestsellers / Our story / Help, with Home dropped** (the logo, named "Yarn Basket, home", goes home). Shop shows the crafts as photo tiles, in the desktop panel and at the top of the phone drawer.
- **No bottom tab bar on phones for now.** It would take 56px of every screen and clash with the planned sticky "Add to cart". Revisit after launch.
- **WhatsApp link in the drawer:** it uses Theme settings → Social → WhatsApp number and stays hidden until Raushan adds it.
- **The search panel with results as you type (predictive search) moves to the collections phase.** It needs real products to tune.

## 2026-10-01 (header and navigation)

- **Stitch mark instead of a plain underline.** On desktop a short dashed run of "stitches" sits under the current page. On hover or keyboard focus it leaves toward the next link, and the next one draws in from that side. When the pointer or focus leaves the menu, it returns to the current page. It works without JS (it just sits under the current page), and it carries a view-transition name, so it holds steady while the page cross-fades on navigation. Links that aren't current are Cocoa, and the current/active link is Cocoa Deep.
- **Current page vs hover look different (Raushan).** The current page always keeps a thin **solid** line (1.5px, its own colour). The dashed stitch mark is now only for hover and keyboard focus, and it doesn't appear on the current page's link, so the two never overlap. "Where I am" and "where I'm pointing" are never confused.
- **Sub-menus are supported.** Any main-menu link with child links (Shopify admin → Content → Menus) becomes:
  - on desktop, a disclosure dropdown (a button with `aria-expanded`, not an ARIA menu, so Tab works normally). It opens on hover with a short delay or on click, and closes on Esc (focus returns to the button), on a click outside, on leaving it, or when the header scrolls away. It ends with a "Shop all" link to the parent.
  - in the phone drawer, a native `<details>` accordion, already open when you're inside that section.
  - Children named like bouquets, keychains, hair clips or bag charms get the matching brand icon (`snippets/menu-link-icon.liquid`).
- **Drawer closes with an animation in every browser** (slides out, then `close()`), including Esc and taps on the backdrop. You can **swipe it left to close**: the panel follows your finger and springs back on a short swipe. Following a link still closes it instantly.
- **Small things:** a soft shadow when the header is scrolled, quiet icon gestures on hover (search tilts, basket tips, logo nods), and the close X turns. The cart's screen-reader label now updates when the count changes (it used to stay at the page-load number), and the visible badge is hidden from screen readers so the count isn't read twice. All of this respects reduced motion. axe shows 0 violations with the dropdown open (desktop) and with the drawer and accordion open (phone).

## 2026-10-01 (home page, round 3)

- **Usability and accessibility come before looks.** Raushan: "user experience, accessibility should be our top priority rather than just making UI looks better. The important thing is user should be able to see what we are offering them, rather than just too colors and texts." Every later design choice is checked against this: can a shopper on a phone see the products quickly, and can everyone use it?
- **Background rule (option C, confirmed by Raushan): one ground, plus one or two meaningful changes.** Soft blush (`#FBF1EE`) is the ground for almost everything. A section only changes colour when the change means something (today, only the newsletter in Blush). Never alternate colours just to separate sections; spacing and headings do that.
- **How we got here:** This replaces the white page with blush bands from round 2. Switching between blush and white made hard edges and drew attention to colour instead of products. One warm, pale ground lets the product photos supply the colour. White is now the surface for cards (reviews) and the Blush band stays only for the newsletter, as the one closing moment. The `white` scheme still exists for later pages.
- **Products sooner on phones.** Section spacing went from 72 px to 56 px on phones, and the hero gap went from 64 px to 48 px. The round craft tiles are smaller (about three and a half per screen instead of two and a half) and show only the name on phones. The first product card now starts about 1,330 px down instead of 1,550 px.
- **Hero: no rotating badge, both photos are links, motion ends.** Raushan found the spinning "Handmade with love" badge distracting. It also repeated the headline and moved forever, which goes against WCAG 2.2.2. So it's gone.
  - Both hero photos are now links, because a product photo you can't tap is a dead end on a phone. The main photo has a "Main photo link" setting that defaults to the button link. The round bee photo has a "Small photo link" setting. A white "Bee keychain →" label was tried, then removed at Raushan's request: the photo stands alone, and its alt text names the link for screen readers. The optional "Small photo label" setting stays, blank by default.
  - The bee floats in, bobs twice and stops. Arrival motion ends within about 4.7 s of load. (Later the same day, the outline flowers became a slow continuous float, which the pause button stops: see below.)
- **Hero buttons:** sentence case instead of spaced capitals. "Shop the collection" has its arrow in a round knob, and "Find a gift" is an outlined button with a gift icon. On phones the buttons stack full width.
- **Hero slideshow (Raushan's idea):** the big frame now shows several products, so the hero shows the range without more text.
  - It's a slow cross-fade only, with no sliding or zooming. Each photo holds for 7 s and the slideshow keeps looping. The outgoing photo stays underneath while the new one fades in, so the background never flashes through.
  - The main photo is always first and stays the page's LCP image. Extra products are "Photo" blocks, with an image and a link, up to 4. Demo: rose bouquet, hair clips, bag charm.
  - Controls: previous, pause/play and next, in a small white pill in the photo's bottom-right corner. On mouse devices they appear only on hover or keyboard focus (Raushan's choice). Touch screens have no hover, so there they stay visible, small and quiet, and swiping left or right also works.
  - Calm by rule: it pauses on hover, on keyboard focus, when scrolled out of view, in a background tab and during the logo intro. With reduced motion it starts paused, and the arrows still work.
  - Accessibility: it is marked up as a labelled carousel with "1 of 4" slides, and only the visible photo can be focused (the others are `inert`). Screen readers announce a new photo only when the person changed it. The pause button satisfies WCAG 2.2.2 for motion that lasts longer than 5 s.
- **More Blush, as the brand colour (Raushan, 2026-10-01).** Blush #F2D4CC is the brand colour named in the kit, and Raushan asked to use it wherever it helps. To stay within background rule C, it is added as **panels and accents, not more full-width stripes**:
  - **Story ("One stitch at a time")** sits on a rounded Blush panel. The yarn strand is drawn on top of the panel, so it still runs across the section like the kit's banner.
  - **Our promise** is a Blush card with the dashed stitch border sewn 12px inside its edge, the same as the brand's Instagram covers.
  - **Accents:** Blush product badges ("Bestseller", "New"); a Blush hover on the gift-occasion buttons (instead of a dark Cocoa fill); Blush behind product and craft photos while they load.
  - **Newsletter** stays the one full-width Blush band. A Blush footer was tried and then reverted the same day. Raushan felt the newsletter and footer blended into one block, and Claude agreed: the newsletter is a call to action, so it should be the only Blush band and stand out. The footer is back on Soft blush; its "Background" setting still offers Blush.
- **Footer built from the brand banner and horizontal logo** (`Brand Kit/3-banner`, `Brand Kit/1-logo/logo-horizontal-colour`), as Raushan asked. Everything is centred:
  - the basket mark (76px on phones, 104px from tablet up) beside "Yarn Basket" and HANDMADE WITH LOVE, linking home;
  - a short rule;
  - the crafts line "CROCHET BOUQUETS · KEYCHAINS · HAIR CLIPS · BAG CHARMS", as real links (a "Crafts line" menu setting; demo links until the menus exist). On phones it shows as a neat two-column grid with no dots;
  - social icons, then the help menu(s) as quiet centred rows;
  - a stitched dashed line, then copyright, policies and payment icons;
  - faint outline flowers in the corners, which never move.
  The logo is live text rather than the PNG, so it stays sharp and is read by Google and screen readers. On hover the mark tilts slightly.
  - **Rule C, refined:** the page ground stays Soft blush. Blush panels are kept for brand moments (how it's made, what we promise). Shopping rows (craft circles, bestsellers, reviews) stay on the calm ground so the photos lead. Each panel has an on/off "Blush panel" setting in the theme editor.
  - Contrast on Blush: Cocoa 5.33:1, Taupe Ink 4.56:1, Cocoa deep 7.63:1, all AA.
- **Logo intro: about 3 seconds, once a day, on whichever page someone lands on** (Raushan chose to keep it for brand value; the frequency rule is Claude's recommendation).
  - Duration: 2 s was tried first, and Raushan found it too quick to read. It is now about 3.2 s in all, down from about 4.1 s originally (3.4 s of drawing plus a 0.7 s fade). The kit choreography plays at 70% of its length: the name is written by about 1.8 s and the tagline by about 2.35 s. The finished logo then holds until 2.7 s so it can be read, followed by a 0.5 s fade. Any tap, scroll or key still skips it.
  - When: on the first page of a visit, whether home, a collection, a product or a content page, because many first visits from Instagram or Google land on a product. At most once every 24 hours per browser. Reloads and moving between pages never replay it.
  - Why not 30 days (the old rule): returning shoppers barely saw it. Why not every page or every session: a repeated intro turns from premium into a wait.
  - Never on: cart, account, search, checkout or the 404 page, for reduce-motion users, in the theme editor, or for search engine bots and speed tests, so Google always sees the page itself.
  - Tested in a real browser: plays on the first page; no replay on reload, the next page or the cart; plays again after 24 hours.
- **Floating outline flowers (Raushan's idea, approach recommended by Claude):**
  - **Hero:** the two faint flowers float continuously but very slowly. One gentle drift-and-turn takes 11 s and the other 13.5 s, moving only a few pixels, out of step with each other. This replaces "drift twice and stop". It only runs when the slideshow exists, because the slideshow's pause button also stops the flowers, which satisfies WCAG 2.2.2. Without a slideshow they drift twice and stop as before. They wait for the logo intro and never move with reduce motion.
  - **Footer:** the four corner flowers drift up and turn into place as the footer scrolls in. They are tied to the scroll (a CSS scroll timeline), so they never move on their own while someone reads, and they come to rest when the footer is fully in view. Browsers without scroll timelines show them still.
  - Tested: the hero flowers move, stop on pause and resume on play; the footer flowers go from offset (46px, -48°) to halfway to rest as the footer scrolls in.
  - **Footer flowers float continuously too (Raushan's call, Claude agreed).** After the scroll-in drift they keep floating very slowly: 12–17 s cycles, a few pixels, out of step. The scroll drift uses `transform` and the float uses `translate`/`rotate`, so the two combine.
  - **Deliberate WCAG 2.2.2 exception:** the footer has no pause control. We accepted this because the flowers are faint (30% opacity), decorative, very slow, and never near text. They are tested to keep at least 17px from every word, link and the logo at 390px, 430px, 768px and 1440px. On phones narrower than 390px only two flowers show, at least 24px clear. They are still for reduce motion. If an accessibility audit ever matters (for example a B2B or government buyer), the fix is a small "Pause animations" link in the footer.
- **Hero in Blush, blended with the header (option C, chosen by Raushan from three previews).** The first screen now opens in the brand colour, like the Instagram banner, and the page opens and closes on Blush (hero and newsletter). Raushan's condition: it must stay calm and never pull attention from navigation, buttons or photos. So:
  - At the top of the page the header takes the hero's Blush, so they read as one block with no seam. Once you scroll, it fades back to the light frosted header with its line, so the Blush never follows you down. (Done with a `--header-bg` token that the hero sets only when it is first on the page and Blush.)
  - The hero's bottom fades softly into the page (over 120–220px) instead of ending in a hard band.
  - The photo frame line and the bee's border are white, like a mat around a print. A rose line almost vanished on Blush. Hover still turns the frame rose.
  - "Find a gift" has a brighter white fill (72%) so both buttons read clearly.
  - Contrast on Blush: body text 5.33:1 and headings 7.63:1. Axe: 0 on mobile and desktop.
  - **Blush budget is now full:** hero, story panel, promise panel, newsletter and small accents. No more Blush surfaces on the home page.
- **Bee photo removed from the hero; the keychain joined the slideshow (Claude's recommendation, Raushan agreed).** With a slideshow, the fixed round bee photo competed with it as a second focal point and covered the bottom-left of every slide, more so on phones. The slideshow now shows exactly what the hero text lists, in the same order: sunflower bouquet, bee keychain, hair clips, bag charm. The red rose bouquet left the slideshow and stays in Bestsellers. The bee's markup, CSS, animation and its three settings (small round photo, link, label) are gone, as is the extra desktop bottom space it needed. The right-hand outline flower moved fully outside the frame line on desktop.
- **Hero slideshow on phones: a real swipe gallery (Claude's call, delegated by Raushan).** The first try (crossfade on swipe, with dots and a pause button) confused people: a swipe should slide. On touch screens (`hover: none` and `pointer: coarse`) the photos now sit side by side in a native scroll-snap row, like an Instagram carousel, and slide with the finger with real momentum, one photo per swipe. There is **no autoplay on phones**, so nothing moves on its own and no buttons are needed (WCAG 2.2.2 is satisfied without a pause control). Small position dots sit at the bottom centre. Every photo link is reachable in reading order for screen readers (no `inert` in this mode). Desktop is unchanged: slow crossfade autoplay with arrows and pause on hover or focus. Tested with real touch gestures: one snap per swipe in both directions, dots follow, no change after 8 s idle, vertical swipes scroll the page; axe shows 0. **Cross-engine check:** Playwright WebKit (Safari's engine, used by every iPhone browser) on iPhone 13 and iPhone SE, and Chromium on Pixel 7. Bug found and fixed: photos 3 and 4 never loaded in the swipe row, because lazy loading skips off-screen images to the side (in Safari especially), so a swipe landed on an empty frame. Once the page has loaded, touch mode now switches the gallery's images to eager. After the fix, all engines load all photos; a partial swipe settles exactly on a photo; dots follow; tapping a photo opens its product. Not covered: a native finger gesture on a physical iPhone (automation cannot drive one), and Firefox (Playwright's Firefox isn't installed; under 1% of mobile users in India).
- **"Alive" motion layer across the site (Raushan: "fluid, animated, smooth and alive").** The rule: motion answers the shopper and never competes with the products. Everything plays once or follows the shopper's own scroll; nothing new loops. Transform and opacity only, and all of it is off for reduced motion.
  - **Photos fade in as they arrive** instead of popping in. `theme.js` holds back only images still loading; the hero's main photo (`fetchpriority="high"`) is never held, so LCP is unaffected. Without JS, images show as normal.
  - **Phone swipe rows** (craft circles, occasions, reviews; Bestsellers is a 2-column grid on phones, not a row): cards grow from 94% scale as they slide into the row (`view(inline)` timeline), so the half-visible card at the edge reads as "more this way". Scale only, so the edge chip's text keeps its contrast. Desktop rows don't overflow, so they're unaffected.
  - **Stitched borders sew themselves in:** dots grow into stitches (`stroke-dasharray` 0 13 → 7 6) as the box scrolls into view. Promise items rise in one after another.
  - **Review stars pop in one by one** as the reviews arrive, staggered by star and by card. On desktop, review cards lift slightly on hover.
  - **The FAQ answer** slides and fades in as it opens (on top of the smooth height animation); the toggle circle fills on hover.
  - **Craft circles:** on hover the rose ring opens out (outline offset 5 → 8px, full rose).
  - **The newsletter thank-you** springs in.
  - Verified in Chromium (Pixel 7, desktop) and WebKit (iPhone 13): every image fades in with none stuck hidden, the row depth works, the stitch and stars animate, there are no JS errors and no sideways scroll. Reduced motion shows everything complete and still. Axe shows 0.
  - **Review pass (2026-10-02), fixes:**
    - **Rows never revealed on phones** (a pre-existing bug). Items inside a swipe row measured `view()` against the row itself, which never scrolls vertically, so the rise-in never played for the craft circles, occasions and reviews on phones. Rows now expose their own page timeline (`view-timeline-name: --row`). The range is measured against the viewport (`cover`), so even the 60px chip row eases in over about 200px of scroll.
    - **The row depth no longer fades** (it was 55% opacity, which risked chip-text contrast); it uses scale only.
    - **The promise box no longer rises:** the box rising, its items rising and the stitches sewing all at once was too busy. The box stays put; the stitches sew and the items stagger.
    - LCP is still the hero photo (about 0.9 s on a 4x-throttled phone, local), so the photo fade-in costs nothing there.
    - Re-verified in Pixel 7, iPhone 13 (WebKit) and desktop: every row reveals while entering and is fully visible once in view; images, stitches and stars all work; reduced motion is static; axe shows 0.
- **Reveals are time-based on arrival, not tied to scroll position (2026-10-02, after Raushan reported jitter and no effects).** The cause, measured:
  - **Firefox has no CSS scroll timelines,** so every scroll-linked effect was static there (as on Safari before 26). Raushan uses Firefox.
  - **Scroll-linked reveals advance in steps under a notched mouse wheel** (move, stop, move), which reads as jitter, and the content drifts at a different speed from the page. Headless Chrome rendered at a steady 60 fps even with 4x CPU throttling, so this was never a raw speed problem.
  - **One real hitch at the start of every scroll:** the hero set `--header-bg` on `<html>`, and flipping it restyled the whole page. It is now scoped to `.site-header`, and there are no slow frames left.
  - **New approach:** an IntersectionObserver in `theme.js` marks only things still below the screen at load as `.is-pending`. When they arrive, they get `.is-arriving` and play a short CSS animation (rise 20px over 760ms, staggered 80ms by `--i`; stitches sew in; stars pop), the same in every browser. Swipe rows arrive as a whole, so off-screen cards don't wait for a swipe.
  - **Still scroll-linked on purpose** (decorative or finger-driven): the story's yarn strand (with its existing fallback), the footer flowers' drift, and the scale in phone swipe rows.
  - **Also fixed:** the hero slideshow restarted its timer every time the header hid or showed (its MutationObserver watched all `<html>` class changes). It now reacts only to the logo intro.
  - Verified in Firefox, Chrome desktop, Pixel 7 and iPhone 13 (WebKit): sections rise in, stars pop and stitches sew in; nothing stays hidden after scrolling the page (except stars on a review card still off to the side in the swipe row, which pop on swipe); the slideshow advances while the header toggles; no slow frames; reduced motion has nothing pending; axe shows 0.
- **Arrival choreography (2026-10-02, Raushan: "make the animations while scrolling better").** Instead of one identical fade-up, each kind of content arrives in its own way, all within about a second:
  - **Section heads, story text, newsletter, footer banner:** the block stays put and its lines arrive in turn, 90ms apart. The heading rises from behind a line (`arrive-ink`: clip-path plus a rise; the mask is generous at the sides and top for italic overhangs). In the footer, the short rule draws itself.
  - **Product cards and craft circles:** photos settle from 94% (circles 90%) with a fade. Circles' rose rings open out as they arrive. Items stagger by `--i`.
  - **Gift chips** glide in from the side (28px), matching the row's swipe direction. **Promise icons** pop with the spring easing. **FAQ** questions arrive one by one (the list became a `reveal-group`).
  - **Fill mode `backwards`:** finished animations hand back to the normal styles, which look identical, so hover effects keep working (the craft ring still opens to 8px on hover; this was tested). `both` would have locked them.
  - Verified in Chrome, Firefox and iPhone (WebKit) by in-page timing samples (label, then heading; chips 28 → 0px staggered; icons overshoot to 1.08 and settle; stitches 0/13 → 7/6; FAQ staggered), a frozen mid-frame of the ink rise, and nothing left hidden after scrolling. No slow frames on a 4x-throttled phone; reduced motion is static; axe shows 0.
- **Motion plan approved; Phase 0 built (2026-10-02).** Raushan accepted every recommendation in `docs/motion-plan.md` (lite mode, card → product photo morph, quick add). Phase 0 shipped: the `data-arrive` API, motion tokens, metric-matched font fallbacks (font-swap shift 0.0017 → 0), lite mode, the hero loading one photo ahead on phones (phone images 880 → 664 KB), Firefox prefetch on hover or touch, scrollbar gutter, the shared `.tap` press, and `npm run check` (25 checks across 4 browser setups, all passing). Details in the plan, section 6b.
- **Images (Raushan asked whether they cause the issues).** The `../crochet` (769 MB) and `../Brand Kit` folders are outside the theme and never uploaded or loaded. On a phone the home page downloads about 2 MB: about 660 KB of images after the fix; about 690 KB of scripts, almost all Shopify's own (web pixels 278 KB, storefront 136 KB, perf kit 82 KB, shop-js 73 KB; ours is 14 KB); plus HTML, CSS and fonts. The jitter was never images (no long tasks, no layout shifts while scrolling). Real products will come from Shopify's CDN with AVIF and a 10-width ladder, so they'll be lighter than the 600/1200 demo files.
- Axe after round 3: 0 violations on mobile and desktop.

## 2026-10-01 (home page, round 2)

- **Our own design, with Rare You's lightness.** Raushan liked rareyou.com's colours best but said "that doesn't mean we will copy them". We took the light feel and built the rest from our brand kit:
  - Palette: a white page, Soft blush bands (`#FBF1EE`) and one stronger Blush band (`#F2D4CC`). Cocoa for text and buttons. The dark Cocoa band and dark footer are gone.
  - Section colour schemes are now `white`, `soft`, `blush` and `cocoa` (cocoa is optional).
  - What is ours rather than Rare You's:
    - the photo frame plus an overlapping round inset photo
    - a slowly rotating "Handmade with love" badge around the logo mark
    - a stitched underline that sews itself under highlighted hero words (`*like this*` in the heading setting)
    - round craft tiles echoing the Instagram story highlights
    - the yarn strand
    - the stitch-bordered promise box
- **Demo content uses Raushan's own product photos** from `../crochet/` (465 photos, 16 categories). Twenty-four were chosen and converted to WebP at 600 and 1200 px (`theme/assets/demo-*.webp`, about 3 MB), with one cropped to remove baked-in text. Eight demo products, five craft tiles, the hero, the inset and the story image all come from them.
- **The Demo content setting** (Theme settings → Demo content) fills empty slots with these photos and three reviews labelled "Sample". **Before launch:** turn it off and delete `theme/assets/demo-*`.
- **Announcement bar: off by default.** Raushan doesn't want filler. The section stays in the theme, but it's only switched on for real, time-bound news (delivery cut-offs, offers, free shipping). Each message has an optional "Show until" date and hides itself after that day. Max 3 messages, arrow buttons, no auto-rotation.
- **Brand kit copied into the repo** at `brand/`: logos, banner, animation, social highlights, stickers, and the drawing source.
- Axe on 2026-10-01 after round 2: 0 violations on mobile and desktop. Swipe rows without links get `tabindex="0"`.

## 2026-10-01 (home page build)

- **Restrained colour** (later refined in round 2, above). Raushan asked for an aesthetic, uncluttered, modern, premium look with "not too much colour". Pages are mostly Cream with an occasional Oat band. Cocoa is the ink, plus one dark Cocoa band and the footer. Rose only appears as fine lines (frame outline, yarn strand, focus halo). Sage only appears inside icons.
- **Fonts are self-hosted** (`theme/assets/*.woff2`, Google Fonts subsets including ₹). There are no requests to Google Fonts.
- **Logo intro in the store:** home page only, once every 30 days per visitor (localStorage), skippable with any tap, scroll or key. It never shows with reduced motion or in the theme editor, and can be switched off in Theme settings → Brand. The page renders underneath, so it doesn't block LCP.
- **No invented content.** Reviews stay hidden until real ones are added. The "Made by hand" number is blank until there's a real figure. Promise and FAQ copy is generic and true, and should be reviewed.
- **The home page H1 is the hero heading.** It was changed in round 2 to "Handmade crochet gifts, stitched with love", because the shop sells more than flowers. Flower-only lines stay only where they're accurate, such as the Bouquets tagline. The header logo is a plain link.
- **Testing tool:** `tools/cdp.mjs` takes screenshots at phone and desktop sizes and runs in-page checks (axe). Home page result on 2026-10-01: zero axe violations on mobile and desktop.

## 2026-10-01

- **Team is two:** Raushan (owner, software developer, new to Shopify) and Claude. No separate SEO owner, so Claude flags SEO-sensitive changes in each pull request and Raushan approves them.
- **Base theme: Shopify's Skeleton theme** (https://github.com/Shopify/skeleton-theme), chosen by Claude after Raushan delegated the choice. It's a minimal Online Store 2.0 starter with nothing to strip out. Dawn and Horizon are kept only as references for the accessible cart drawer, predictive search, filters and variant picker.
- **Launch dates confirmed:** soft launch 30 Nov 2026 (password shared with friends and family), public launch Mon 7 Dec 2026.
- **Home page first.** Then collection and search, product page, cart, and content pages.
- **Uncluttered by rule:** 9 home sections, max 8 products in any home row, one idea and one main button per section, fixed spacing scale. The full spec is in `build-plan.html`.
- **Visual language comes from the brand kit's Instagram grid:** Blush / Cocoa / Oat surfaces, stitch borders, photo-frame product cards, the kit's line icons, and the yarn-strand animation. See `brand-direction.md`.
- **Accessibility target WCAG 2.2 AA.** A new "Taupe Ink" #705B52 is used for small text because Taupe fails contrast. The focus ring is Cocoa, not Rose.
- **Shopify store:** a client transfer store at `yarnbasket-in.myshopify.com` (Partner org "Yarn Basket"). It's free until launch, then gets transferred and moved to a paid plan.

## 2026-09-28

- **Custom Liquid theme, not Hydrogen.** Shopify's native SEO (sitemap, canonical tags, redirects, meta fields) matters more than headless freedom on a new domain, and the theme editor lets content be changed without code.
- **Coming-soon page** on GitHub Pages at yarnbasket.in with a "Shop on Meesho" button, until launch.
- **Meesho app deep link dropped.** Meesho's app links don't cover store pages. The button stays a plain web link.

## Still open

- **Differentiator:** the proposal is "made by hand" storytelling plus gifting (occasions, gift note, wrap). Needed by 12 Oct.
- **Launch range:** 15–25 products. Needed in week 2.
- **Shiprocket Checkout's price and the dev-store trial** (launch-checklist "Shipping, payments and checkout"). If either fails, the checkout is Shopify's with Razorpay and a partial-COD app.
