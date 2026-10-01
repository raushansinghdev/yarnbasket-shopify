# Decision log

Newest first. Each entry says what was decided and why, so later work doesn't reopen it by accident.

## 2026-10-01 (home page build)

- **Restrained colour.** Raushan asked for an aesthetic, uncluttered, modern, premium look with "not too much colour". Pages are mostly Cream with an occasional Oat band. Cocoa is the ink, plus one dark Cocoa band and the footer. Rose only appears as fine lines (frame outline, yarn strand, focus halo). Sage only appears inside icons.
- **Fonts are self-hosted** (`theme/assets/*.woff2`, Google Fonts subsets including ₹). There are no requests to Google Fonts.
- **Logo intro in the store:** home page only, once every 30 days per visitor (localStorage), skippable with any tap, scroll or key. It never shows with reduced motion or in the theme editor, and can be switched off in Theme settings → Brand. The page renders underneath, so it doesn't block LCP.
- **No invented content.** Reviews stay hidden until real ones are added. The "Made by hand" number is blank until there's a real figure. Promise and FAQ copy is generic and true, and should be reviewed.
- **The home page H1 is the hero heading** ("Handmade crochet flowers that never fade"). The header logo is a plain link.
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
