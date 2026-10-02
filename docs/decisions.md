# Decision log

Newest first. Each entry says what was decided and why, so later work doesn't reopen it by accident.


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
- **Payment gateway and COD:** the proposal is Razorpay plus partial COD. Needed in week 2.
