# Yarn Basket — yarnbasket.in

Storefront for **Yarn Basket**, handmade crochet from India.

## Current: coming-soon page

`coming-soon/` is a static holding site served on GitHub Pages at https://yarnbasket.in. Its "Shop on Meesho" button links to the [Meesho store](https://www.meesho.com/SSCreator).

Since 2026-10-11 it also carries the policies (`/policies/...`), Contact (`/pages/contact`), Our story (`/pages/our-story`) and eight pieces with their prices, at the addresses Shopify will serve later. The store is behind a password until launch, and Razorpay's reviewer needs to read these.

- `npm run build:coming-soon` writes those pages from `docs/legal/`, the store and the theme's Our story text. Don't edit them by hand. `node tools/coming-soon-build.mjs --check` fails when a price, a name or a policy has changed since the last build.
- Edit the top of `coming-soon/index.html` and `coming-soon/site.css` by hand. Push to `main`: the [deploy workflow](.github/workflows/coming-soon.yml) publishes the folder.
- The logo animation comes from `Brand Kit/5-animation/website-splash-snippet.html`.
- No JavaScript beyond the intro's skip.

## Next: custom Shopify theme

A custom Online Store 2.0 Liquid theme built from Shopify's [Skeleton theme](https://github.com/Shopify/skeleton-theme). It's SEO-first, mobile-first and WCAG 2.2 AA, and stays within these Core Web Vitals budgets: LCP < 2.0s, INP < 200ms, CLS < 0.1. Soft launch 30 Nov 2026, public launch 7 Dec 2026.

- [docs/build-plan.html](docs/build-plan.html): the full phased plan, including the home page spec, design system, motion, accessibility, SEO, performance and launch steps
- [docs/brand-direction.md](docs/brand-direction.md): how the brand kit becomes the store's visual language
- [docs/decisions.md](docs/decisions.md): the decision log
- [theme/](theme/): the Shopify theme (`cd theme && shopify theme dev --store yarnbasket-in.myshopify.com`)
- [brand/](brand/): logos, banner, logo animation, social and sticker art, and drawing source from the Yarn Basket brand kit
- [tools/money-check.mjs](tools/money-check.mjs): `npm run check:money`, with `shopify theme dev` running. Fails if any price shown differs from the store's or from the price rule, if a test product or the free gift is listed anywhere, or if the cart charges something else. Git runs it before a push that touches the theme (once per clone: `git config core.hooksPath .githooks`)
- [tools/cdp.mjs](tools/cdp.mjs): headless Chrome screenshots and in-page checks for the local preview

When the Shopify store goes live, point the domain's DNS at Shopify, then delete `coming-soon/` and the deploy workflow.
