# Yarn Basket theme

Custom Online Store 2.0 theme for yarnbasket.in, started from Shopify's [Skeleton theme](https://github.com/Shopify/skeleton-theme) (see `LICENSE.md`).

```sh
cd theme
shopify theme dev --store yarnbasket-in.myshopify.com   # local preview at http://127.0.0.1:9292
shopify theme check                                     # lint before every commit
```

- Design tokens, layout, buttons and motion: `assets/base.css`
- Shared behaviour (header, menu drawer, cart count): `assets/theme.js`
- Brand kit pieces: `snippets/logo-mark.liquid`, `snippets/icon.liquid`, `snippets/splash.liquid`, `snippets/stitch.liquid`
- Home page sections, in order: hero, collection-list, featured-products, story, occasions, reviews, promise, faq, newsletter

The plan and decisions are in `../docs/`.
