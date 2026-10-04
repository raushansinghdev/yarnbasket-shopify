# Real catalogue: photos → listings, collections, home page

Status (2026-10-04): **uploaded.** 29 products (52 variants, 156 photos, 100 stock each), 17 collections,
the main menu and the home page photos are in the store; `templates/index.json` points the hero, the
Bestsellers circles and the occasion cards at them. Prices follow docs/pricing-plan.md where the cost is known; the rest are placeholders.

## Where things are

| What | Where |
|---|---|
| Source photos (never changed) | `~/Desktop/SS Creation/crochet` (same files as `../crochet`) |
| The catalogue: products, variants, prices, copy, SEO, photo choice, collections, home picks | `tools/catalog/catalog.json` |
| Organised copies, renamed for SEO, plus home page crops | `../catalog/` (outside git, 356 MB) |
| Review sheet (open in a browser) | `../catalog/review.html` |
| Builds the folder and the sheet from the manifest | `python3 tools/catalog-build.py` (needs Pillow) |
| Uploads to the admin | `python3 tools/catalog-upload.py …` |

## The photo rule

Of 458 images, 156 are used. Kept: the SKU-named sets (`BQ_*`, `KC_*`, `charm_*`, `POT_*`, `HB*`,
`CTie_SF 1/2`, `rose/N rose bouquet`, `sunflower/N sunflower`, `pot flower/daisy · blue daisy · sf`):
the real piece in a real hand, only the setting changed.

Left out:
- Whole image re-made by AI: the older "ChatGPT Image" bouquets (matte wrap, big gold bow) and the
  chick/bee keychains held by a knitted sleeve (the chick has orange feet; the real one has red).
- AI models wearing pieces, "Handmade with care" hands, infographics, flowers in a ceramic pot.
- Anything with a "Pack of 2 / Combo / Any 5" sticker or other text on it.
- Canva flat and gradient backgrounds, dimension diagrams, raw WhatsApp photos.

Every photo is 1254 px square: fine on phones, a little soft in desktop zoom, too small for a
landscape campaign banner.

## The range: 29 products, 52 variants

Singles, with colours as one product, plus the best sets (Raushan, 2026-10-04).
Bouquets 11 · Keychains 12 · Bag charms 1 · Flower pots 2 · Hair accessories 2 · Home decor 1.
The held-back list (no clean photo yet) is in the manifest's `held_back` and at the end of the review sheet.

Stock: 100 of every variant to start with (Raushan, 2026-10-04), tracked, no overselling.
Size text is set only where a dimension image gave it (single-stem bouquets, 10 × 4 in); Raushan adds the rest later.

## Collections (17)

- Crafts by product type: Bouquets, Keychains, Hair accessories, Bag charms, Flower pots; Home decor by tag
- Flowers by tag: Sunflowers, Roses, Tulips, Daisies
- Occasions by tag (gifting-plan): Birthday, Anniversary, Thank you, Gifts for her; Gifts under ₹299 by price
- Gift sets (tag `set`); Bestsellers (hand-picked, 8)
- Every automated collection also requires vendor `Yarn Basket`. The test products move to vendor
  `Yarn Basket Test`, so they leave the shop but stay reachable for `npm run check`.

## As built (2026-10-04)

- Uploaded with `python3 tools/catalog-upload.py products | tests | collections | home | publish` (safe to rerun;
  `--force` rewrites a product from the manifest). The token now has publications and inventory scopes.
- Shop collection: type is not Free gift **and** vendor is Yarn Basket (29 products). Under ₹299 also leaves the gift out.
- Bouquets and Keychains are in a hand-picked order; the other automated collections are on Best selling.
- Main menu: Shop (Bouquets, Keychains, Hair, Bag charms, Flower pots, Home decor, Shop all) · Gifts (Birthday,
  Anniversary, Thank you, For her, Gift sets, Under ₹299) · Bestsellers · Help (Track order, Contact us).
  Shipping, FAQ and Our story pages don't exist yet, so they aren't in Help.
- Home: hero = three-sunflower bouquet, then rose trio, tulips & daisy, keychain set, daisy pot. Demo content is
  still on (sample reviews, the story clip).
- Checked: theme check clean; `npm run check -- --only 3,10,12,15 --quick` passes (LCP missed once at 2176 ms, then 1284 and 1340).

## Still open

- The cost of a pair of hair clips; the hair clips and the hair sets with clips are on placeholder prices until then (docs/pricing-plan.md).
- Sizes for keychains, pots, charms, hair pieces and the larger bouquets (Raushan, later).
- Real stock counts in place of 100.
- Clean photos for the held-back products.
- "Best selling" order has no meaning until there are sales.
