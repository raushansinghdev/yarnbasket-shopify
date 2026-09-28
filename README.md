# Yarn Basket — yarnbasket.in

Storefront for **Yarn Basket**, handmade crochet from India.

## Current: coming-soon page

`coming-soon/` is a static holding page served on GitHub Pages at https://yarnbasket.in. Its "Shop on Meesho" button links to the [Meesho store](https://www.meesho.com/SSCreator).

- Edit `coming-soon/index.html` and push to `main`. The [deploy workflow](.github/workflows/coming-soon.yml) publishes it automatically.
- The logo animation comes from `Brand Kit/5-animation/website-splash-snippet.html`.
- No build step and no JavaScript.

## Next: custom Shopify theme

Planned: a custom Online Store 2.0 Liquid theme built from Dawn. SEO-first, mobile-first, and within these Core Web Vitals budgets: LCP < 2.0s, INP < 200ms, CLS < 0.1.

When the Shopify store goes live, point the domain's DNS at Shopify, then delete `coming-soon/` and the deploy workflow.
