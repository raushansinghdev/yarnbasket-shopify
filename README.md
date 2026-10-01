# Yarn Basket — yarnbasket.in

Storefront for **Yarn Basket**, handmade crochet from India.

## Current: coming-soon page

`coming-soon/` is a static holding page served on GitHub Pages at https://yarnbasket.in. Its "Shop on Meesho" button links to the [Meesho store](https://www.meesho.com/SSCreator).

- Edit `coming-soon/index.html` and push to `main`. The [deploy workflow](.github/workflows/coming-soon.yml) publishes it automatically.
- The logo animation comes from `Brand Kit/5-animation/website-splash-snippet.html`.
- No build step and no JavaScript.

## Next: custom Shopify theme

A custom Online Store 2.0 Liquid theme built from Shopify's [Skeleton theme](https://github.com/Shopify/skeleton-theme). It's SEO-first, mobile-first and WCAG 2.2 AA, and stays within these Core Web Vitals budgets: LCP < 2.0s, INP < 200ms, CLS < 0.1. Soft launch 30 Nov 2026, public launch 7 Dec 2026.

- [docs/build-plan.html](docs/build-plan.html): the full phased plan, including the home page spec, design system, motion, accessibility, SEO, performance and launch steps
- [docs/brand-direction.md](docs/brand-direction.md): how the brand kit becomes the store's visual language
- [docs/decisions.md](docs/decisions.md): the decision log
- [theme/](theme/): the Shopify theme (`cd theme && shopify theme dev --store yarnbasket-in.myshopify.com`)
- [brand/](brand/): logos, banner, logo animation, social and sticker art, and drawing source from the Yarn Basket brand kit
- [tools/cdp.mjs](tools/cdp.mjs): headless Chrome screenshots and in-page checks for the local preview

When the Shopify store goes live, point the domain's DNS at Shopify, then delete `coming-soon/` and the deploy workflow.
