# Store theme direction, from the brand kit

> Update 2026-10-01: the palette is now lighter. It uses a white page, Soft blush (`#FBF1EE`) and Blush bands, and Cocoa for text and buttons, inspired by rareyou.com's lightness but with our own design. See `decisions.md`, round 2. The brand files now also live in `../brand/`.

How the Yarn Basket brand kit (`../Brand Kit/`) becomes the visual language of the Shopify theme. The coming-soon page already uses the same tokens and logo animation.

Source files to reuse:

| What | Where in `../Brand Kit/` |
|---|---|
| Colours, fonts, logo rules | `README.txt` |
| Logo SVGs (stacked, horizontal, icon, wordmark; colour and reverse) | `1-logo/` |
| Animated logo splash (pure CSS) | `5-animation/website-splash-snippet.html` |
| Banner with floating outline flowers | `3-banner/banner-1920x600.svg` |
| Instagram grid: the clearest picture of the system | `2-instagram/6-instagram-posts/grid-preview-v2.png` |
| Drawing code for the mark, icons, stitch borders, flowers | `_source/brand.js`, `2-instagram/6-instagram-posts/_source/covers.js` |

## Tokens

| Token | Hex | Store role |
|---|---|---|
| Cocoa | `#6B4F43` | All text, buttons, focus ring, dark "contrast" sections |
| Blush | `#F2D4CC` | Brand surface: hero, feature sections |
| Rose | `#E3A69C` | Yarn accents, icon fills, underlines, frame outlines. Never text. |
| Sage | `#A9B8A0` | Leaf accents, small highlights. Never text. |
| Oat | `#F5EFE6` | Default page background, product card background |
| Cream | `#FBF6EF` | Raised surfaces, text on Cocoa |
| Taupe | `#8E7468` | Large text and decoration only (3.79:1 on Oat) |
| Taupe Ink (new) | `#705B52` | Small secondary text and labels (5.56:1 on Oat, 4.56:1 on Blush) |
| Brown (kit) | `#8C6D5E` | Basket fill in the reverse logo only |

Fonts: Cormorant Garamond Italic 600 for headings and product names. Jost 400/500 for text. Jost 500 uppercase with wide tracking for labels.

## The patterns, and where they go in the store

1. **Three surfaces in a rhythm.** The Instagram grid alternates Blush cards, Cocoa cards and Oat photo frames. The home page does the same down the page: mostly Oat, with one Blush band and one Cocoa band. This gives clear section breaks without dividers, borders or clutter.

2. **Stitch borders.** Graphic covers have a dashed inner border that looks like a row of stitches: `stroke-dasharray: 14 12`, rounded caps, 3px at 1080px wide, Cocoa at 32% opacity (Cream at 38% on Cocoa), corner radius 36. In the store this becomes a scaled-down CSS/SVG border for feature panels, the promise strip and gift cards. It can "sew itself in" when it enters the screen by animating `stroke-dashoffset`.

3. **Photo frame = product card.** Photo posts are an Oat card with a rounded window (radius 26), a 3px Rose outline 16px outside it, a Cormorant italic caption, and a tiny tracked "YARN BASKET · HANDMADE WITH LOVE" line. The product card uses the same idea: a rounded image on Oat, the product name in Cormorant italic, and the price and label in Jost.

4. **Cover layout = section heading.** Every graphic cover follows the same stack: line icon → tracked uppercase eyebrow → two-line Cormorant italic headline → one or two short lines of Jost → small logo sign-off. Section headings in the store use the same order (icon and eyebrow optional).

5. **Line icons.** Icons use a 40×40 box, 2px Cocoa strokes and Rose fills. They already exist in the kit: bouquet, keychain heart, hair clip, reviews speech bubble, how-to-order basket (`hlIcon` in `brand.js`), plus bag charm, makers (yarn ball and hook), hook with yarn, and care basin (`icon` in `covers.js`). We export them as an SVG sprite for the theme and draw any new ones (cart, search, menu, account, truck) in the same style.

6. **Yarn strand.** Version 1 of the pinned banner draws one continuous yarn strand from the ball across all three tiles to a flower. That is the store's signature scroll animation: a single strand that draws itself through the "Made by hand" section.

7. **Floating outline flowers.** The banner's five-petal outline flowers at low opacity. The coming-soon page already drifts these around. In the store we use them sparingly as background decoration on Blush sections only, never behind text that has to be read.

8. **Logo splash.** The kit's animated logo plays once per session as a skippable intro, the same as on the coming-soon page.

## Copy voice, from the covers

Short, warm, concrete. Two-line serif headlines, plain one-line supports.

- Bouquets: "Flowers that never fade" · "Handmade blooms for every occasion, made to last forever."
- Keychains: "Tiny, cute & all yours"
- Makers: "Made by women artisans" · "Every piece is handmade by rural women artisans in India." *(confirm this stays accurate before using it on the site)*
- Hair clips and scrunchies: "Soft crochet for your hair"
- How it's made: "One stitch at a time" · "Crocheted by hand with soft, 100% acrylic yarn."
- Bag charms and decor: "Little touches of handmade"
- Reviews: "Your words make our day"
- Care: "Caring for your crochet" · "Hand wash in cool water. Press gently, don't wring. Dry flat in the shade."
- Ordering: "Shop our handmade pieces"

## Logo rules (from the kit)

Clear space at least the width of the yarn ball. Minimum size: icon 24px, stacked logo 120px. No stretching, rotating, recolouring, shadows or outlines.
