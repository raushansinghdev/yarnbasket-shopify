# Decision log

Newest first. Each entry says what was decided and why, so later work doesn't reopen it by accident.

## 2026-10-01 (home page, round 3)

- **Usability and accessibility come before looks.** Raushan: "user experience, accessibility should be our top priority rather than just making UI looks better. The important thing is user should be able to see what we are offering them, rather than just too colors and texts." Every later design choice is checked against this: can a shopper on a phone see the products quickly, and can everyone use it?
- **Background rule (option C, confirmed by Raushan): one ground, plus one or two meaningful changes.** Soft blush (`#FBF1EE`) is the ground for almost everything. A section only changes colour when the change means something (today, only the newsletter in Blush). Never alternate colours just to separate sections; spacing and headings do that.
- **How we got here:** This replaces the white page with blush bands from round 2. Switching between blush and white made hard edges and drew attention to colour instead of products. One warm, pale ground lets the product photos supply the colour. White is now the surface for cards (reviews) and the Blush band stays only for the newsletter, as the one closing moment. The `white` scheme still exists for later pages.
- **Products sooner on phones.** Section spacing went from 72 px to 56 px on phones, and the hero gap went from 64 px to 48 px. The round craft tiles are smaller (about three and a half per screen instead of two and a half) and show only the name on phones. The first product card now starts about 1,330 px down instead of 1,550 px.
- **Hero: no rotating badge, both photos are links, motion ends.** Raushan found the spinning "Handmade with love" badge distracting. It also repeated the headline and moved forever, which goes against WCAG 2.2.2. So it's gone.
  - Both hero photos are now links, because a product photo you can't tap is a dead end on a phone. The main photo has a "Main photo link" setting that defaults to the button link. The round bee photo has a "Small photo link" setting. A white "Bee keychain →" label was tried, then removed at Raushan's request: the photo stands alone, and its alt text names the link for screen readers. The optional "Small photo label" setting stays, blank by default.
  - The bee floats in, bobs twice and stops. The outline flowers drift twice and stop. All hero motion ends within about 4.7 s of load.
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
- **Logo intro: 2 seconds, once a day, on whichever page someone lands on** (Raushan chose to keep it for brand value; the frequency rule is Claude's recommendation).
  - Duration: the brand kit choreography plays at double speed (the logo is fully drawn at about 1.6 s), then a 0.4 s fade, so about 2 s in all, down from 3.4 s. Any tap, scroll or key still skips it.
  - When: on the first page of a visit, whether home, a collection, a product or a content page, because many first visits from Instagram or Google land on a product. At most once every 24 hours per browser. Reloads and moving between pages never replay it.
  - Why not 30 days (the old rule): returning shoppers barely saw it. Why not every page or every session: a repeated intro turns from premium into a wait.
  - Never on: cart, account, search, checkout or the 404 page, for reduce-motion users, in the theme editor, or for search engine bots and speed tests, so Google always sees the page itself.
  - Tested in a real browser: plays on the first page; no replay on reload, the next page or the cart; plays again after 24 hours.
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
