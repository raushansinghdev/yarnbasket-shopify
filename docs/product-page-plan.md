# Product page (build-plan Phase 4)

Status: **built 2026-10-04** (stages P-0 to P-5), on test products. Check §20: 30/30. Waiting for Raushan's look on a real phone, opened from an Instagram link.

## Round 2 (2026-10-04, after Raushan's first look), built

- **Viewer:** a tap on the empty space around the photo closes it (the photo itself never does). On desktop it has previous / next arrows and the ← → keys; a "2 / 5" count top left; the zoom hint fades after the first zoom and reads "Double-click to zoom" with a mouse.
- **Save, Share and "look closer" on the photo are bigger:** a 40px circle on phones (was 32), a 44px circle in a 52px button on desktop, with a hover. The heart on product cards is unchanged. The unused worded Save style is gone from `save-button.liquid`.
- **Colours are one product with a Colour option** (decisions.md). An option named Colour or Color shows a round swatch cut from that colour's own photo; the label names the choice ("Colour: Red", also "Size: 3 roses"); choosing slides to that colour's photo and changes price, stock and link; the sticky bar names the choice ("Yellow · 3 roses"). Since 2026-10-06 any option does this when its choices have different photos (decisions.md, 2026-10-04 entry, "Changed 2026-10-06").
  - **Only the chosen colour's photos are in the gallery** (Raushan: with Red chosen, the yellow and pink photos must not show). Shopify has no photo-per-colour grouping of its own, so the rule is by order: the photo picked on a colour's variant starts that colour's group, and the photos after it, up to the next colour's photo, belong to it. The swipe row, dots, count, thumbnails and the viewer all show that group only. A photo before the first group, or with `#all` in its alt text, shows for every colour (a size chart, the packaging); `#all` is never read out or shown.
  - To set one up: Products → the product → Variants → add the option "Colour" with its values; open each colour's variant and pick its main photo; then drag the product's photos into colour order (all the red ones, then all the yellow ones, each colour starting with the photo picked on its variant).
  - Not grouped: a product where fewer than two variants have a photo. Then every photo shows, as before.
  - Test product: "Rose Crochet Bouquet (colour test)" (`rose-crochet-bouquet-colour-test`), Colour × Size, two red photos and one each for yellow and pink, Pink / 6 roses sold out, a test rating of 4.8 (12). Its yellow and pink photos are the red photo recoloured by computer, so it is test data only.
- **The rating by the name is a link to the reviews** (`#reviews`), like Amazon and Flipkart. It shows only with real ratings. The reviews app's list goes at that anchor when it is installed.
- **Order below the buy box:** Pairs well with → You may also like → reviews → FAQ → Recently viewed.
- **Trust row:** one term per line under 480px (each used to wrap over two lines at 360px).
- **FAQ on the product page is compact** (a `Compact` setting on the FAQ section): small label heading, 56px rows, White.
- **Bug fixed:** on a product with no stock limit the quantity field stretched and pushed Add to cart onto its own row (Raushan spotted it). The quantity is now a fixed width, and check §20 measures the buy box on a no-limit product too.
- Check §20 is now 46 checks. Sizes: product.js 9.5 KB, product-zoom.js 6.4 KB. The limits went from 9 and 6 to **10 and 7 KB** for the colour grouping; I had said I would trim instead of raising them, and didn't manage to. Neither file loads on any other page.

## As built (2026-10-04)

Everything in the plan below is built. Where the build differs from the plan:

- **Script sizes are larger than planned.** product.js is 8.2 KB (planned 6) and product-zoom.js 5.1 KB (planned 4); product-rows.js is 2.9 KB. Check §20 holds them to 9, 6 and 4 KB. None is loaded on any other page, the viewer loads only on the first tap of a photo, and theme.js and cart.js are unchanged.
- **Dots are for looking, not tapping.** On phones the dots and the "1 / 5" count are not buttons (a 6px dot can't be a 48px tap target). The photos swipe, the desktop thumbnails are real buttons, and a round "look closer" button (bottom left of the photo) opens the viewer for keyboard users. Tapping a photo does the same.
- **Sold-out options are disabled, not just struck through,** so nobody can add a piece that isn't there. The "Ask us to make one" line appears when the whole product (or the chosen variant) is sold out.
- **Recently viewed has its own small loader** (product-rows.js + sections/product-tile). The Saved page's loader in saved-page.js was left alone rather than refactored into a shared file.
- **Reviews row:** the section is on the page but shows nothing on the live store until quotes are added in the theme editor (with Demo content on it shows the sample quotes).
- **FAQ:** a copy of the home page's four questions. An edit has to be made on both pages.
- **Video:** uses the browser's own video controls (poster first, nothing loads until Play). Not tested with a real clip yet: no test product has one.
- **Card → page photo morph:** built (page-turn.js names the tapped card's photo). It needs Chrome or Safari 18.2+ and can't be seen in the automated check; look at it on the phone.
- **Not verified here:** pinch-zoom with real fingers (the check uses double-click), the share sheet, and how the page looks inside Instagram's in-app browser.

Admin changes made (store, not in git): product field definitions `custom.size` ("Size & what's included"), `custom.materials` and `custom.care` ("only if different"); on the test product "Red Rose Crochet Bouquet", three more photos and a test Size text.

Files: `sections/product.liquid`, `sections/product-recommendations.liquid`, `sections/recently-viewed.liquid`, `sections/product-tile.liquid`, `snippets/product-gallery.liquid`, `snippets/product-options.liquid`, `assets/product.js`, `assets/product-zoom.js`, `assets/product-rows.js`; small changes in `snippets/quantity.liquid` (floor), `snippets/product-row.liquid` (shell), `snippets/structured-data.liquid`, `sections/faq.liquid`, `layout/theme.liquid` (no intro), `assets/page-turn.js`, `assets/base.css`, `sections/cart-drawer.liquid` and `snippets/saved-toast.liquid` (pop-ups above the buy bar). `snippets/save-button.liquid` still has its unused "page" style.

Verify: `npm run check -- --only 20 --url http://127.0.0.1:<port>/`.

## Context

Home, collection, search, cart, account and footer are built. The product page is the one page in the buying path
still on Skeleton's starter markup: [theme/sections/product.liquid](theme/sections/product.liquid) stacks every image
at full size, prints the price as plain text and uses a `<select>` for options. Its interim Add to cart already
works through cart.js, so this phase builds the real page around that form.

**Why this page matters most (Raushan, 2026-10-04):** most traffic will come from Meta ads and land here directly.
The visitor has never seen the home page, is on a phone, and is usually inside Instagram's or Facebook's in-app
browser, which has a shorter screen (about 360 × 640 usable) and older browser features. So the page is designed
as a landing page, phone first, and has to explain who we are, show the piece well and let them buy without hunting.

Raushan's brief: same theme, style and motion as the rest of the site; highly accessible and intuitive; clear
separation and tight spacing so there's little scrolling; buttons aligned as one group; every important detail
present (description, care, policy, delivery); photos are the priority and swiping them must feel top-notch.

Already decided in earlier docs and not reopened: `offer-terms` is the one trust row; "Buy it now" stays as the
outlined pill; no per-product dispatch date; stars only from real ratings; sales shown quietly (no % badge);
motion patterns from motion-plan §4 (swap, collapse, sticky buy bar, card → page photo morph).

## Decisions (2026-10-04)

| # | Decision |
|---|---|
| PP1 | Materials and Care are written once in the theme editor. **Size & what's included** is the per-product field. A product can override Materials or Care. |
| PP2 | No stars until a product has real ratings; the page shows them automatically when they exist. The reviews app is a pre-launch admin step. |
| PP3 | One muted WhatsApp line under the trust row: "Want a different colour or size? Ask us". On a sold-out product: "Ask us to make one". |
| PP4 | **Save is the heart on the photo's corner** (the same heart as on cards), with Share under it. The buy box is two aligned rows: quantity + Add to cart, then Buy it now. This replaces the earlier "♡ Save" worded button (account-plan AC4). |
| PP5 | Below the details: hand-picked **customer reviews row**, **short FAQ**, product rows (PP7), **Recently viewed** last. |
| PP6 | The gallery supports **video** as a later slide; a photo is always first. |
| PP7 | Product rows: see "My take" below. |
| PP8 | **Every text block is closed by default**, the description included. |

**My take on bestsellers / also bought / bought together (PP7).** Yes to more products, but as two rows, not four.
Each extra row is about 300px of scrolling, and several near-identical rows make people choose nothing.

- **"Pairs well with"** (the "bought together" idea): up to 3 small pieces *you* pick per product in Shopify's free
  Search & Discovery app (a keychain with a bouquet). This is the row that raises order value, and it works with
  the ₹999 free-shipping and ₹1,499 free-gift steps. It's hidden for a product with no picks.
- **"You may also like"**: Shopify's automatic related products. Once the store has orders, Shopify feeds real
  "bought with this" data into the same list, so it *becomes* "people also bought" without a second row.
  With no data it falls back to **Bestsellers**, so that idea is covered here too.
- **Recently viewed**, last: shows only when the shopper has seen 2 or more other pieces, so a first-time ad
  visitor never sees an empty row.

They're our usual sideways swipe rows of compact cards (2.5 in view on a phone), the same as search and Saved.

## The page on a phone, top to bottom

1. **Header + announcement bar** as on every page. The logo intro never plays here.
2. **Gallery** (see next section).
3. **Collection link** (small, e.g. "Bouquets"), **title** (h1, Cormorant italic), **price** with the old price
   struck through on sale, "Incl. of all taxes", one badge at most (Sold out / Last few / Sale). Stars only per PP2.
4. **Options** as 48px pills (radio buttons; the option name is the legend). Sold-out values struck through and
   disabled. A colour dot when Shopify's native swatch is set.
5. **Buy box:** `[ − 1 + ] [ Add to cart ]`, then `[ Buy it now ]`. Same height, same radius, one 8px gap, edges
   lined up with the pills above.
6. **Trust row** (`offer-terms`: free shipping from ₹999, COD once on, ships in 1–2 days, replacement if damaged),
   then the **WhatsApp line**.
7. **Details**, all closed (PP8), one tap each, hairline between rows:
   Description · Size & what's included · Materials & care · Delivery & replacement.
8. **Pairs well with** (when picked).
9. **Customer reviews** row (the home section, reused).
10. **You may also like**.
11. **FAQ**, 4–5 closed questions (COD, delivery time, gift note, damaged item, custom orders).
12. **Recently viewed**, then the footer.
13. **Sticky buy bar**: name, price, Add to cart. It shows whenever the main Add to cart is off-screen, *including
    on arrival* on a short in-app-browser screen, so the buy action is always one tap away. Hidden at the footer.

Spacing: one white background, sections separated by hairlines and the site's spacing steps, no cards inside
cards. Target at 360 × 800: steps 2–7 fit in about two screens.

Desktop (≥ 990): two columns. Gallery left (main photo + thumbnail strip), steps 3–7 on the right and sticky.
Rows 8–12 full width. No sticky bar.

## Photos (the priority)

- **Square, edge to edge** on phones. The real photos are 1254px squares, so nothing is cropped and a 3× phone
  still gets a sharp image.
- **Native swipe**, one photo per swipe (`scroll-snap-stop`), no JavaScript in the gesture, so it tracks the finger
  at full frame rate. Dots plus a "1 / 5" counter. The second photo is fetched right after the first, so the first
  swipe never shows a blank; a Blush placeholder sits behind each.
- **First photo is the LCP image:** eager, high priority, preloaded. Budget 2.0 s.
- **Tap opens a full-screen viewer:** swipe between photos, pinch and double-tap to zoom, close with the button,
  Back, or Esc. It opens from the photo (morph) and loads its code only on first tap.
- **Video** (PP6) as a slide: poster first, tap to play, muted, inline, loads only when reached.
- Picking a variant slides to that variant's photo.
- Heart and Share (the phone's own share sheet; good for "do you like this?" on WhatsApp) sit on the photo corner.
- Alt text from the product's media, falling back to "Name, photo 2 of 5". Keyboard: arrows move, thumbnails are
  buttons on desktop.
- Arriving from one of our cards, the card photo morphs into the gallery photo (Chrome, Safari 18.2+).
- A short **photo guide** goes in the doc for you: 5 per product (front on a plain background, in a hand for
  scale, texture close-up, as it arrives / gift-wrapped, in use), no text baked into the image.

## For ad traffic specifically

- Tested at **360 × 640** as well as 360 × 800, with no view-transition support, as in-app browsers behave.
- `fbclid` / `utm_*` in the URL are kept when the variant changes; the canonical URL stays clean.
- An ad that links to `?variant=…` opens with that variant chosen, by the server (no flash).
- A sold-out landing shows "Ask us to make one" and moves "You may also like" up under the buy box.
- Launch checklist gets: install Shopify's Facebook & Instagram channel and confirm ViewContent / AddToCart /
  Purchase fire with our no-reload add to cart.

## Accessibility (stated, so it's checked and not assumed)

- One h1 (the name); each row and details group has an h2; landmarks as on other pages.
- Gallery: a labelled region; each slide says "photo 2 of 5"; dots and thumbnails are real buttons with
  `aria-current`; the viewer is a `<dialog>` that traps focus and returns it to the photo.
- Pills are native radios in a `fieldset`, so arrow keys and screen readers work without script. A variant change
  is announced once in a polite live region ("6 roses, ₹1,999").
- The heart is a toggle (`aria-pressed`) with the product's name in its label; Share and the counter have names.
- The sticky bar is a second route to the same form, not a second form. It never traps focus or covers the
  focused element.
- Details are native `<details>`; 48px tap targets everywhere; Cocoa focus ring; text contrast from the existing
  tokens (Taupe Ink for muted text).
- Works at 200% text size and 320px width without sideways scroll or clipped buttons.
- Reduced motion and lite mode: no slide-in, no morph, no autoplay.

## Edge cases the build must handle

- One photo only: no dots, counter or thumbnails. No description / size / care: that row isn't rendered.
- A long name (3 lines) or a 3-option product: the buy box still lines up.
- Quantity can't go above tracked stock; the existing stock-limit error still shows under the button.
- The free-gift product (`free-gift` tag): never in any row (existing `snippets/gift-skip.liquid`), and its own page
  shows a note and a link to the shop instead of a buy box, since the cart removes a paid one.
- Demo content on with no products: rows show demo cards, as elsewhere.

## Verified against the code (2026-10-04) — corrections to my first draft

1. **The logo intro currently plays on product pages** (`intro_pages` in
   [theme.liquid:24](theme/layout/theme.liquid#L24) includes `product`). For an ad visitor that's an animation
   before the piece they tapped on. `product` comes out of that list.
2. **The added-to-cart and Saved pop-ups sit at the bottom of the phone screen**, exactly where the sticky buy bar
   goes ([cart-drawer.liquid](theme/sections/cart-drawer.liquid), [saved-toast.liquid](theme/snippets/saved-toast.liquid)).
   While the bar is showing, both pop-ups rise above it (one CSS variable for the bar's height).
3. **cart.js only steps quantity inside cart lines**, so the product page's stepper is handled in product.js
   (already in its 6 KB budget).
4. **The FAQ section prints its own FAQPage data.** On the product page that's switched off, so Google sees one
   clear thing per page: the Product.
5. **Reviews and FAQ content is stored per template**, so the product page has its own copy of the quotes and
   questions, separate from the home page's. Fine for 4–5 questions and a few quotes, but an edit has to be made
   in both places. I'll note this in the doc.
6. **Shiprocket Checkout is the launch decision** (shipping-checkout-comparison.md) and it takes over checkout
   buttons. "Buy it now" stays a standard Shopify button so that swap works; re-testing it, and the trust row's COD
   wording for *partial* COD, go on the launch checklist.
7. Bestsellers fallback uses `collections['bestsellers']`, then Theme settings → Shop all, as search and Saved do.

## How it's built

| File | Change |
|---|---|
| `theme/sections/product.liquid` | Rewritten: layout, buy box, details. Schema: Materials, Care, Delivery text (PP1). Loads `product.js`. |
| `theme/snippets/product-gallery.liquid` | New: scroller, dots, counter, heart, share, video slide, desktop thumbnails. |
| `theme/snippets/product-options.liquid` | New: the pills. |
| `theme/sections/product-recommendations.liquid` | New, used twice (related, complementary). Renders through `snippets/product-row.liquid`; related falls back to Bestsellers. |
| `theme/sections/recently-viewed.liquid` | New: an empty row that a small module fills from the list `saved.js` already keeps. The loader comes out of `saved-page.js` into a shared `recent-row.js` so both pages use one copy. |
| `theme/assets/product.js` | New, loaded only here. **≤ 6 KB.** Variants, quantity, sticky bar, counter, thumbnails, share. |
| `theme/assets/product-zoom.js` | New, loaded on first photo tap. **≤ 4 KB.** |
| `theme/snippets/quantity.liquid` | One optional param: minus stops at 1 instead of becoming the cart's bin. |
| `theme/snippets/save-button.liquid` | The "page" style becomes the photo-corner heart (PP4). |
| `theme/snippets/structured-data.liquid` | Product branch replaced (SEO below). |
| `theme/templates/product.json` | Adds recommendations ×2, reviews, FAQ, recently viewed. |
| `theme/layout/theme.liquid` | Take `product` out of `intro_pages`. |
| `theme/sections/cart-drawer.liquid`, `theme/snippets/saved-toast.liquid` | Pop-ups sit above the sticky bar when it's showing (CSS only). |
| `theme/sections/faq.liquid` | No FAQPage data when on a product page. |
| `theme/locales/en.default.json`, `theme/assets/page-turn.js` | New strings (read-modify-write); a few lines to name the tapped card's photo for the morph. |
| `tools/check.mjs` | New section **20**. |

Reused as is: `price`, `image`, `offer-terms`, `product-row`, `product-card`, `icon`, `.scroller`, `.btn`,
`sections/reviews.liquid`, `sections/faq.liquid` and its `<details>` styles, `data-arrive`, lite mode, and cart.js's
add-to-cart handler (Adding… / Added, error line, pop-up). **cart.js (21.4 of 22 KB) and theme.js get nothing added.**

**Variants.** The section embeds a small JSON of variants. On a pill change, product.js sets the hidden `id`, swaps
price / badge / button label (the "swap" pattern), slides the gallery, updates the sticky bar and the URL. No fetch.
Without JavaScript: single-option pills are radios named `id`, so the form posts as is; multi-option products get a
`<noscript>` select.

**Details content.** Size & what's included: `custom.size` (multi-line text). Materials / Care: section settings,
overridden by `custom.materials` / `custom.care`. Delivery & replacement: built from Theme settings → Cart, the
same source as the trust row and the cart, with a link to the refund policy. An empty row isn't rendered.
Closed `<details>` text is still in the HTML, so Google reads it.

**Motion.** Only existing patterns and tokens: `data-arrive` for the rows, swap, collapse, the 320ms sticky bar,
the photo morph. No blur. Reduced motion and lite mode get the still version.

**SEO (flagged, as agreed for SEO-sensitive output).** Our own Product JSON-LD in place of Shopify's default: name,
description, all images, brand, one Offer per variant (INR, availability, URL), shipping details from the theme's
settings, BreadcrumbList, and AggregateRating only with real ratings. **Return policy is left out of the JSON-LD for
now**: the rule is "replacement if damaged, no change-of-mind returns", and I won't tell Google something looser
than the Terms; the exact markup is settled in the SEO phase. One h1; canonical and meta tags unchanged.

**Admin changes included in this plan** (read first, read back, logged in decisions.md and the launch checklist):

1. Product metafield definitions `custom.size`, `custom.materials`, `custom.care`. If the token lacks the scope, I
   give you the steps in Settings → Custom data.
2. On the test product "Red Rose Crochet Bouquet" only: 3 more photos from `../crochet` and a Size value, so the
   gallery and details can be tested.
3. Yours, when you're ready (steps in the doc): complementary picks in Search & Discovery; reviews and FAQ text
   in the theme editor.

## Stages

- **P-0 Save.** `docs/product-page-plan.md` (this plan, PP1–PP8, competitor notes, photo guide), decisions.md,
  launch-checklist lines, memory.
- **P-1 Layout.** Gallery markup and swipe, title/price, pills, buy box, trust row, WhatsApp line, details;
  phone then desktop CSS. **Screenshots at 360 × 640, 360 × 800 and 1280 go to you here**, since looks feedback is
  cheapest before behaviour is wired.
- **P-2 Behaviour.** product.js: variants, quantity, sticky bar, dots and counter, desktop thumbnails, share.
- **P-3 Photos, deep.** Full-screen viewer with zoom, video slide, card → page morph.
- **P-4 Below the fold.** Pairs well with, You may also like, reviews, FAQ, recently viewed.
- **P-5 SEO and gate.** JSON-LD, check §20, one full `npm run check`.

Commit on main at the end of each stage with an explicit pathspec. No push and no store theme upload unless asked.

## Verification

Dev server on its own port (`shopify theme dev --port 9393`); I'll need the storefront password inline, never
written to a file. `npm run check -- --only 20` during the work; the full run once at P-5.

Check §20, at 360 × 640, 360 × 800 and 1280:

- No sideways scroll. Photo, name and price on the first phone screen; a buy button (main or sticky bar) visible at
  every scroll position above the footer. Steps 2–7 ≤ about two screens at 360 × 800.
- LCP is the first gallery photo, under 2.0 s (4× slower CPU); CLS < 0.1; no slow frames while swiping the gallery.
- Swiping updates dots and counter; the second photo is loaded before the first swipe; the viewer opens, zooms,
  and closes with Back and Esc, returning focus to the photo.
- Variant change updates price, button and URL without a reload and keeps `utm_*` (red-rose: ₹1,199 → ₹1,999;
  hair clips "Mixed": ₹429). `?variant=` on arrival is honoured.
- Sold out (daisy headband): disabled labelled button, "Ask us to make one", recommendations moved up.
  Sale (pink tulip): struck price with the hidden "Sale price / Regular price" text.
- Add to cart opens the pop-up and bumps the count; the stock-limit error shows under the button.
- Buy-box edges line up within 1px; every tap target ≥ 48px; nothing covered by the sticky bar.
- All details closed on load; each opens and closes; their text is in the HTML.
- JavaScript off: the form posts to /cart with the chosen variant.
- axe 0 violations on phone and desktop; reduced motion shows no movement.
- Keyboard only: Tab reaches gallery, pills, quantity, both buttons, heart, every details row, in reading order.
  A variant change is announced once. 200% text at 320px: no sideways scroll, no clipped button.
- No logo intro on a product page. With the sticky bar showing, the added-to-cart pop-up sits above it.
- One-photo product: no dots or counter. Free-gift product: no buy box, absent from every row.
- Exactly one Product and no FAQPage in the page's JSON-LD.
- `product.js` ≤ 6 KB, `product-zoom.js` ≤ 4 KB and not loaded before a tap; cart.js and theme.js inside budget.
- JSON-LD parses and its price equals the price on the page.

Plus `shopify theme check`, and your look on the real phone, opened from an Instagram link, before the phase is
called done.

## Competitor product pages (checked 2026-10-04)

| Store | What the page has |
|---|---|
| floreal.in | 7 photos; tabs Description / Additional information / Shipping & Return; customer photo testimonials; related; recently viewed; wishlist; "10 customers are viewing", "Sale 46%" |
| knotsngifts.in | 6 photos; accordions Materials / Shipping & Returns / Care Guide; a 6-question FAQ; share buttons |
| rareyou.com | 2 photos; two offer blocks; Product Care; Material & Quality; partial-COD note; share |
| raaskcrochet.com | 4 photos; a spec list (flower count, size, material, wrapping); care; dispatch times; "Is this a gift? Send a personal message" |

Taken: description, size and what's included, materials, care, delivery, replacement, FAQ, customer quotes, related,
recently viewed, share, wishlist (our heart). Left out on purpose: viewer counts and stock-pressure lines, discount
percentage badges, a cluster of social share buttons.

## Round 3 (2026-10-04, after Raushan's second look on a phone)

- **Options swipe sideways on phones.** Each option (Colour, Size) is one row; it runs to the screen's edge so a
  cut-off pill shows there are more. The chosen pill is brought into view, also on a `?variant=` link from an ad.
  From 750px the pills wrap as before.
- **The sticky buy bar comes only after the buy box.** It used to show on arrival too (button below the fold),
  which put Add to cart on screen before the options and then hid it on scrolling down. Now: nothing on arrival,
  the bar once the main button has been scrolled past, hidden at the footer.
- **Delivery terms and the WhatsApp line are one card.** Three cells side by side (icon over a two-line label),
  the ask line as a row under them. 136px at 360 wide, where the stacked lines took about 180px. With four terms
  (COD on) the cells become a two-by-two grid.
- **Good to know stays above Recently viewed**: it answers doubts about buying this piece; Recently viewed leads
  away and is empty for someone arriving from an ad.
- Found on the way: a row of pieces loading just after the rating link's jump pushed the reviews down the screen.
  product-rows.js now holds the reviews in place.
- Check 20: 49 checks, all passing. product.js is 10.0 KB against its 10 KB limit: the next addition needs a trim
  or a deliberate raise.

## Round 4 (2026-10-04, after an audit of the whole page)

Tested at 360 × 640, 360 × 800, 390 × 844, 768 × 1024, 740 × 360, 1280 and 1440 on the colour test product, a
one-option, a no-option, the sold-out and the sale product.

- **Phones: Add to cart and Buy it now are pinned to the bottom of the screen for the whole page.** One set of
  buttons (the page's own, placed with CSS), so nothing appears, disappears or duplicates, and it works without
  JavaScript. The page keeps a "Quantity" row. This replaces the bar of rounds 1 and 3, which came and went; the
  old `.buybar` and its code in product.js are gone. Considered and dropped: buttons only in the page (700 to
  870px down on arrival), a bar after scrolling past (nothing to tap on arrival), a bar plus the page's buttons
  (two Add to cart buttons at once).
  - Wrong colour by accident (no change-of-mind returns): the options are on the first screen above the bar, a
    colour is always pre-chosen and named, and the pop-up says what went in.
  - Screens under 700px tall: the photo gives up a tenth of its height so the name and price sit above the bar.
  - Add to cart stays the filled button: the cart is where free shipping and the gift show.
- **At most 9 of one piece per order** (Theme settings → Cart, 0 = no limit; stock wins when lower). The quantity
  field is narrower (116px). At 9 a line sends larger orders to WhatsApp. The cart's stepper stops at 9 too, and
  adding more than the cart can take is refused with the reason. Not enforced at checkout.
- **Sold out:** no quantity and no Buy it now (it used to look like a working button); the bar shows "Sold out"
  and "Ask us to make one".
- **Two columns from 750px** (was 990), so a tablet shows name, price and buttons on arrival. The photo column is
  the one that stays in view while the details scroll. A phone on its side fits the photo to the screen's height.
- **Small:** "Incl. of all taxes" sits on the price row; the sale badge says the saving ("Save ₹200"); the rating
  link is 44px tall; the shared price tag is a plain number (was "1,199"); the reviews block under a product is
  shorter (no icon, less padding); errors from Add to cart show in the pop-up, since the button is no longer next
  to the form.
- Check 20: 58 checks, all passing. product.js is 9.2 KB (limit 10).
- For launch: Buy it now must hand over to Shiprocket Checkout, and the Meta pixel's events need checking
  (launch-checklist.md).

## Round 5 (2026-10-04, after Raushan's look on desktop)

Raushan: Add to cart and Buy it now are too big on desktop and go away after scrolling; the magnifier button on
the photo isn't needed. Phones are unchanged (round 4's pinned buttons).

- **Buy box from 750px: one 48px row**: quantity, Add to cart, Buy it now (was two full-width 54px rows, 116px in
  all). Where the column is narrow (a tablet, large text) Buy it now takes the next row. The quantity field and
  both buttons are 48px at every width now.
- **A slim buy bar from 750px** (`.buybar`): slides up from the bottom of the screen once Add to cart has been
  scrolled past, never on arrival and never over the footer. A small photo, the name, the chosen options, the
  price and Add to cart: a second button for the same form. It follows a new choice (photo, options, price), is
  out of the tab order while hidden, and the pop-ups sit clear of it. Phones don't have it.
- **Considered and dropped: Flipkart's placement** (the buy row riding the bottom of the details column, at rest
  under the last detail). Raushan liked it on Flipkart; tried here, the buttons end up under "Delivery &
  replacement", away from the price and the options, and where they sit depends on the screen's height. Flipkart's
  column is several screens long; ours is about 700px.
- **The magnifier button is out of sight.** A click on the photo opens the viewer. The button stays in the page
  for the keyboard and screen readers (a photo can't take focus) and shows only when tabbed to; closing a viewer
  opened from a photo hands focus back to the photos.
- "Buy it now" words are centred in the button (Shopify's own padding had them 4.5px low).
- Check 20: 64 checks, all passing. product.js is 9.97 KB of its 10 KB limit: the next addition needs a trim.

## Round 6 (2026-10-04, the Quantity row on phones)

Raushan asked whether the Quantity row could look better. Kept: label left, stepper right, one row. Changed, under
750px only: the stepper is 44px tall (was 48) with the pale outline of an unchosen pill (was a Cocoa outline, the
heaviest thing in the buy box for the least-used control); the label is regular weight in the body colour; the row
sits one option-gap (16px) under the last option (was 24). Its buttons are still 44 x 44. About 12px shorter in
all: the stepper was already at its narrowest (44 + 28 + 44), so the gain is in weight, not size. Not chosen:
stacking the label above the stepper like Colour and Size (about 30px taller, stepper under the left thumb).
Desktop's one 48px row is unchanged. Check 20 is 65 checks, all passing.

## Round 7 (2026-10-05, are the pinned buttons a mistake?)

Raushan wondered whether pinning the buttons on phones (round 4) hides the size and colour options and wastes the
screen, and compared Amazon (buttons in the page, a bar after scrolling past) with Flipkart (always pinned).

- **Pinned stays.** Amazon's page is for a researched purchase: its buttons come after protection plans, delivery
  dates and the total. Ours is a ₹169 impulse from a Meta ad, decided on the first screen, and Flipkart and Meesho
  have taught our shoppers this layout. Moving the buttons into the page would free about 9px of the first screen
  (the bar's 65px goes, a Buy it now row of 56px comes in) and leave short phones with no button on arrival.
- **Measured on arrival, with the square photo:**
  - 360 × 640, a two-line name or two options: the buttons sit in the gap after the price, so no option shows.
  - Colour and Size, 800px and taller: the buttons sit in the gap after Colour, so Size is hidden completely.
  - One option, 800px and taller: the option row is fully above the buttons.
  - Only the colour test product has two options today; every real listing has one.
- **Tried and reverted the same day (Raushan): a shorter phone photo** (ratios 1.2 to 1.4) so an option row always
  showed above the buttons. He did not want the photo to stop being square. The photo is as it was: square, and a
  tenth shorter under 700px tall. The two cases above are still open.
- Not done: price inside the button, moving the Quantity row.
- Check 20: the quantity-limit check now scrolls the stepper clear of the pinned buttons first.

## Round 8 (2026-10-05, no quantity field: Add to cart becomes the cart's stepper)

Raushan's idea, the pattern Zepto, Blinkit and Swiggy use. It replaces the Quantity row of rounds 4 and 6 and the
buy box of PP4.

- **No quantity field anywhere on the page.** Add to cart adds one. Buy it now buys one; more than one goes
  through the cart.
- **Once the chosen option is in the cart, the buy box is `[ bin/−  2  + ] [ ✓ View cart ]`** in place of Add to
  cart and Buy it now: in the phone's pinned bar, in the desktop buy box and in the desktop slim bar.
  - The stepper is the cart's own (the bin at 1; removing brings Add to cart back) and changes the cart line
    itself. A change in the drawer or on /cart shows in the bar too.
  - The two are equal halves, 48px tall. Raushan asked for a bigger stepper since it holds three controls: at equal
    halves each of its buttons is 51px wide at 320, 61px at 360 and 68px at 390, and View cart, the step towards
    paying, keeps its size. 55/45 is the most that fits a 320px phone if he wants more after a real-phone look.
  - View cart is filled and carries a tick: the sign that the piece is in the cart. No cart icon and no number on
    it (the stepper is this piece's number; the header has the cart's). Not "Buy it now" there: Shopify's button
    ignores the cart and checks out one unit of this piece only.
  - The state follows the chosen option, and the server draws it on arrival, so there is no flash.
  - Plus stops at the stock or at 9 and the line under the buy box says why (also spoken on a tap).
  - Focus: Add to cart → plus when the stepper takes its place; the bin → Add to cart.
  - Without JavaScript: "2 in your cart" and a plain View cart link.
- **No added-to-cart pop-up on the product page** (changed the same evening, after Raushan's look on his phone:
  the pop-up's View cart sat right above the bar's). The bar changing, the header count and the spoken message
  are the confirmation. The pop-up still shows a refusal ("9 is the most per order", sold out), and it is still
  used where a piece is added with no bar to change.
- **The stepper shows the moment Add to cart is pressed**, before Shopify answers (`cart.adding` in
  `product-buy.js`, called by `cart.js`). Raushan saw 4 to 5 seconds on his phone. Measured here: the tap to the
  stepper was about 0.8 s, of which Shopify's `cart/add.js` is about 600 ms, the drawer's HTML about 100 ms and
  our scripts about 10 ms, so the wait was the connection. Taps on plus made before the answer go once it has
  landed. If Shopify refuses, Add to cart comes back with focus and the reason shows in the pop-up.
- **The tick waits for Shopify.** Until the add is confirmed the bar has `is-adding`: View cart is paler and
  its tick is held back, then fades in. A refusal never showed a tick.
- **The add is finished even if the shopper leaves the page** (`keepalive` on every cart request in `cart.js`).
- **A short pulse under the finger** (`theme.js`, 10 ms) for Add to cart, the stepper and Undo, on every page;
  a double pulse when an add is refused. Android only: Safari gives web pages no vibration, and the hidden-switch
  trick that works on some iOS versions is undocumented, so it isn't used. Nothing depends on the pulse.
  Widened on 2026-10-06 to Buy it now, Save, Checkout and every refusal: docs/decisions.md, "Haptics, widened".
  The double pulse moved from `product-buy.js` to `cart.js`, which sends it on every page.
- **Spoken quantity fixed** (`cart.js`): a quantity change said "quantity 0" when Shopify re-keyed the line, and
  the subtotal was always blank because its selector no longer existed. It now reads both from the redrawn cart.
- How: `snippets/buy-in-cart.liquid`, `assets/product-buy.js` (5.5 KB, its own budget of 6), `commit` added to
  what cart.js shares. product.js lost its quantity code (8.8 KB of 10). The stepper's field has no name, so it
  never posts with the product form, and `autocomplete="off"`, so Back doesn't restore an old number into it.
- Found on the way: the free gift arriving changes the line's key at Shopify, so taps are matched to the line when
  they are sent, not when they are made.
- Check 20 is 87 checks, all passing; checks 8 and 8b were adapted (a piece in the cart has no Add to cart button).

## Round 9 (2026-10-10, a tighter top: collection, rating, name, price)

Raushan: the block between the photos and the options has too much empty space, and is "BIRTHDAY GIFTS" above the
name useful when a product is in several collections?

Measured first (sunflower bouquet): the collection, the name, the rating and the price were four rows, 207px from
the top of the block to the option pills on a 360px phone. On a 360 x 740 screen the pills sat at 681-729px and the
pinned buttons start at 675px, so **the options were hidden behind the buttons on arrival**.

- **One line above the name: `CROCHET BOUQUETS · ★ 4.9 (86)`**, then the name, then the price. 147px to the pills
  now (60px less), and the pills end at 669px, above the buttons. Desktop: 220px → 159px. Nothing is removed.
- **Why this one.** Three were built in the browser and measured: (A) name, then "★ 4.9 (86) · Crochet Bouquets",
  then price: 153px, but two underlined links side by side, and with no rating a lone link between name and price;
  (C) the rating at the end of the price row: 147px, but on sale the price row wraps to two lines (191px);
  (G, built) keeps the name on its price, and with no rating it is just collection, name, price.
- **Not the rating beside the name:** 48 of the 55 names are longer than "Sunflower Crochet Bouquet", which already
  fills 272 of a 360px phone's 320px, so nearly every name would wrap to a second line.
- **The collection stays, and is the craft.** It was whichever collection Shopify lists first, which is
  alphabetical: the single rose said "Anniversary Gifts", the daisy pot "Birthday Gifts". Now it is the collection
  named after the product type (`Bouquets` → `/collections/bouquets`; all six exist). Product cards never link
  through a collection, so "the collection the shopper came through" never applied. Kept because it costs no
  height beside the rating, is each product's one link up to its category, is the visible twin of the breadcrumb
  search engines get, and holds the line so nothing moves when a product gets its first rating.
- **The rating moved** from under the name to the line above it (changes "the rating sits by the name" from
  round 5 only in where). It still jumps to the reviews.
- **12px from the price to the options** (was 24px) and 6px from "Size: 1 sunflower" to the pills (was 8px).
- How: no markup moved. `.pdp__head` is a two-column grid and the rating is placed on the collection's row, so the
  page is still read as collection, name, rating, price, and the tab order is unchanged. Both links are 44px tall
  (the collection was 32px and was let off the tap-size check; no longer). `snippets/structured-data` picks the
  same collection.
- Known: at 320px with the longest collection name ("Crochet Hair Accessories") and a rating, the collection takes
  two lines. No sideways scroll.
- Check 20 has three more checks (the craft and the breadcrumb agree; one line above a full-width name; options
  above the buttons at 360 x 740). 104 pass; `check:money` 10 of 10.

## Photo guide (for Raushan)

Five square photos per product, at least 1200px, in this order:

1. The piece from the front on a plain, light background. This is the photo on cards, in ads and in the cart.
2. In a hand or beside something familiar, for size.
3. A close-up of the stitches.
4. As it arrives: wrapped or in its box.
5. In use: on a desk, a bag, in a vase.

No text or stickers baked into the image. An optional clip (10 to 20 seconds, the piece being turned in the hands)
goes after the photos. Write the alt text in the admin for each photo: what it shows, in a few words.
