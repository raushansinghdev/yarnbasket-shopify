# A new home hero, from scratch: one photo that melts into the page

Status: **built 2026-10-06, version A** (see "As built" at the end). Raushan chose A after seeing A, B and C side by side.

## Context

Raushan's designer friend said the festival banner should run the full width of the phone screen and that the rounded "cut-out" corners on the banner and on the product photos under it don't look right. Raushan then asked for a from-scratch rethink, so the hero is "just too good": nicer, less cluttered, modern, and still very easy to use.

What is wrong with today's hero (phone, campaign live), beyond the corners:

- **The biggest message is in the smallest type.** "Dussehra & Diwali gifts" sits in a 15px pill. There is no headline, and the brand's own serif and yarn lettering are missing from the first screen.
- **Three boxes of the same shape.** A 320 × 213 inset banner, then 68%-wide product tiles, all with 28px corners and white pills (four pills on one screen). Nothing leads.
- **The photo is small.** The bouquet in the banner is about 90px tall on a 360px phone.
- **Two different heroes.** Normal days: headline + swipe row. Campaign days: banner + swipe row. Desktop has two more layouts. That is 1,066 lines and a carousel script in `theme/sections/hero.liquid`, and the page changes character every festival.

## The design

**One layout for every day and every screen: a full-width photo with no frame and no corners, whose lower edge dissolves into the page colour, with the headline set large in our serif across that dissolve, one line, one button.** A campaign only swaps the photo, the words, the link and the dates.

The corner question disappears: the hero has no box at all. Rounded corners stay on the things you tap further down (product cards, 18px).

### Phone (360 × 660 visible)

```
┌──────────────────────────────┐
│ Free delivery over ₹499 · COD│  bar (unchanged)
│ ☰       Yarn Basket     🔍 🛒 │  header (unchanged)
│██████████████████████████████│
│████████  PHOTO  █████████████│  edge to edge, flush under the header,
│██████ 360 × 300 (6:5) ███████│  no corners; today it is 320 × 213
│███████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  (58% more picture)
│▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░│  bottom third fades into the page blush
│ Dussehra & Diwali            │  serif italic, about 36px, real text,
│ gifts, made by hand          │  starts on the last of the fade
│ Free delivery over ₹499      │  one line, 16px
│ ( Shop festive gifts  → )    │  solid Cocoa button, 52px
│                              │
│ Bestsellers                  │  next section peeks:
│ ◯ All ◯ Bouquets ◯ Keych…    │  heading + tops of the craft circles
└──────────────────────────────┘
```

- **Normal days:** the same layout with the sunflower-in-hand photo, "Handmade crochet gifts, *stitched with love*" (the yarn lettering, as now) and "Shop all gifts".
- **The whole hero is one tap target** (the button's link stretched over it), so a tap on the photo works.
- **Optional price tag on the photo** (the existing `hero-tag` label, e.g. "Rose trio ₹449"), linking to that product. The price comes from the product itself, so it can't be wrong. Mocked with and without.
- **Height:** hero ends near 530px, so the Bestsellers heading and the top of the craft circles show on a 360 × 660 screen. On a short phone (iPhone SE) the photo shrinks so the button is always on the first screen.
- **Nothing moves on its own.** On load the photo settles (scale 1.04 → 1) and the three text lines rise in turn, once. Not with reduced motion or lite mode.

### Desktop (1280 × 800)

The same idea turned sideways: one band the full width of the window, about 520px tall, flush under the header. The photo fills the right 60% and bleeds off the right edge; its left edge dissolves into the page. Headline (about 60px), line and button sit left, on the page column. Bestsellers shows below it on the first screen. This replaces both the framed cross-fading photo card and the wide strip with a pill. The landscape campaign photo already suits it (pieces on the right, calm on the left).

### What goes, and the one trade-off

- **Gone:** the banner pill, the phone swipe row of product photos, the desktop cross-fade with its arrows, dots and pause button, the flower doodles, the "See all" end card.
- **Trade-off, stated plainly:** today a whole row of products with prices sits on the phone's first screen. In the new hero the first screen is one statement, one button, an optional price tag and the top of Bestsellers; products start one short scroll down. This is the cost of a calm, premium first screen, and it is why step 1 is a preview, not a switch.

### Photos

- Pieces in the upper two-thirds, a plain surface at the bottom (it melts into the page). The current Diwali photo fits: its lower half is pink cloth.
- The focal point set on the image in Shopify still steers the crop.
- A campaign can take an optional second photo for phones (square or portrait) if the landscape one crops badly.

## Build steps

**1. Build it beside the live hero, and preview (no change to the real home page)**
- New `theme/sections/home-hero.liquid` (about a third the size of today's file, no script beyond the load-in class).
- New `theme/templates/index.hero-test.json`: a copy of `index.json` with the hero swapped, viewable at `/?view=hero-test` on Raushan's phone. A second copy of the hero block set without a campaign shows the normal-day version (`index.hero-test-plain.json`).
- Screenshots of today against new at 360 × 660, 390 × 664, 375 × 548, 768 and 1280 × 800 into `docs/mockups/hero-new-*.png`.
- **Three versions side by side, because looks can't be judged from a wireframe:**
  - **A (my pick):** the melt hero as drawn above, no product row.
  - **B (safer for shoppers):** the melt hero with a smaller product row kept under it on phones (tiles about 44% wide, 18px corners), so prices stay on the first scroll.
  - **C (the friend's version):** today's hero with the banner edge to edge and square corners, nothing else changed.
- **Stop here for Raushan's look on the phone, and the friend's.** Step 2 builds whichever wins; if the melt looks wrong with the real photo, C is a 20-line change.

**2. Switch over (after the go)**
- `theme/templates/index.json`: hero `type` → `home-hero`; the four `photo` blocks removed; the `festive` campaign block kept as is.
- Delete `theme/sections/hero.liquid`, `index.campaign-test.json` and the two test templates; keep `index.campaign-test`'s job as `/?view=hero-test` only if the checks still need a dated dummy.
- `tools/check.mjs` §10 and §12: replace the swipe-row and banner checks (47 mentions of the hero) with the new ones under Verification.
- Docs: `docs/home-hero-v2-plan.md` (this plan, as built), `docs/decisions.md`, and "superseded" notes at the top of `home-hero-plan.md`, `hero-campaign-plan.md` and `home-media-plan.md`.

## How it is built (for step 1)

- **Reused as is:** the campaign date logic and editor notes (`hero.liquid:12–54`), the campaign block's setting ids (`image_phone`, `image_desktop`, `label`, `line`, `link`, `button_label`, `show_from`, `show_until`) so the live Diwali block needs no re-entry, the visually hidden h1 on campaign days (`hero.liquid:115–122`), `snippets/yarn-lettering.liquid`, `snippets/hero-tag.liquid`, `snippets/image.liquid` (eager, high priority, preload), `.btn`, `.h-display`, the `demo-campaign-*.webp` fallback, and the rule that tightens Bestsellers under the hero (`hero.liquid:759–760`).
- **Settings relabelled:** `image_desktop` becomes "Phone photo (optional)"; the campaign gains an optional "Product in the photo" for the price tag. `photo` blocks are dropped from the schema.
- **The melt:** `mask-image: linear-gradient(...)` on the image (downwards on phones, leftwards on desktop), eased so the photo is under 30% where the headline starts. Worst case (a black photo) still gives Cocoa text about 7:1 on the blend. No extra image, no extra request.
- **Phone photo box:** `aspect-ratio: 6 / 5`, full bleed with `margin-inline: calc(var(--gutter) * -1)`, height capped with `svh` and `--header-height` (base.css:89) for short phones; text block pulled up about 48px into the fade. Tablets: 2:1.
- **Images:** `<picture>` when a phone photo is set; `sizes` 100vw on phones, 60vw on desktop. One hero image is downloaded instead of today's banner plus row photos.
- **Stretched link:** the button's `::after` covers the hero; the price tag sits above it as its own link. The photo has `alt=""` (the text names the link).

## Working rules

- Other Claude sessions share this tree: claim `theme/sections/home-hero.liquid`, `theme/templates/index*.json` and `tools/check.mjs` via SendMessage; commit only my own hunks; leave the untracked `yarn-basket-sunflower-square-hero-*.png` assets alone.
- No hand-typed prices anywhere in the hero. `npm run check:money` after step 2, since a product list leaves the page.
- Rollback after the switch is one line in `index.json` plus restoring `hero.liquid` from git.

## Verification

1. `shopify theme dev`, then Playwright at 320, 360 × 660, 390 × 664, 375 × 548, 768, 1280 × 800, 1440, on `/?view=hero-test` (campaign) and the plain variant.
2. New checks in `check.mjs` §10/§12:
   - phones: photo width = viewport width, no horizontal scroll at 320px;
   - the button is fully on the first screen on an iPhone SE (bottom ≤ 548px), and the Bestsellers heading starts on the first screen at 360 × 660;
   - the hero photo is the LCP element, LCP ≤ 2.0s, CLS 0;
   - headline contrast: sample the rendered pixels behind the headline (screenshot), ratio ≥ 4.5:1 with the real photos;
   - one h1 in the page on campaign and normal days; axe 0 violations;
   - desktop 1280: hero ≤ 560px tall, Bestsellers heading above 800px.
3. `npm run check -- --only 10,12`, theme check 0 offenses; after step 2 the full gate once and `npm run check:money`.
4. Raushan's look on his own phone at `/?view=hero-test` before step 2, and again after the switch.

## As built (2026-10-06)

Raushan saw three versions on the real page (`docs/mockups/hero-new-compare-phone.png`): A, the new hero; B, the new hero with a small product row; C, the old hero with the banner edge to edge. He chose **A**.

- `theme/sections/hero.liquid` was rewritten (1,066 → 354 lines, no script). Same section type and class names (`hero`, `hero__*`), so `index.json` keeps `"type": "hero"`.
- `theme/templates/index.json`: the four Photo blocks are gone; the `festive` campaign has a button label ("Shop festive gifts") and a product for the price label (Rose trio). The hero's `eyebrow`, `link_label` and `button_link` settings no longer exist.
- Campaign settings keep their ids. "Square photo (optional)" is now "Phone photo (optional)", and a campaign can name a "Product in the photo".
- Test pages: `/?view=campaign-test` (a dated dummy campaign on the demo photo) and `/?view=hero-test` (the home hero on a normal day). The A/B/C preview pages were deleted.
- Not built: version B's product row, and the price label on a normal day is the same optional setting as before.

| Measured (local dev server, Chrome) | Before | Now |
|---|---|---|
| Photo at 360px | 319 × 213, inset, 28px corners | 360 × 300, edge to edge, no corners |
| Button, 360 × 660 | none (pill on the banner) | solid, 52px, ends at 490px |
| "Bestsellers" heading, 360 × 660 | 612px, under a row of two product photos | 542px, craft circles from 585px |
| iPhone SE (375 × 548) | product row ended at 520px | button ends at 442px (506px on a normal day) |
| Desktop 1280 × 800 | 410px strip with a pill | 474px band; Bestsellers heading at 681px |
| Words against the photo (darkest pixel behind them) | white pill | 8.3:1 with the Diwali photo, 6.3:1 with the sunflower photo, 9.6:1 on desktop |
| LCP, phone, CPU slowed 4× | on the banner | 1,272ms on the hero photo (budget 2,000ms) |

- Checks: `tools/check.mjs` §6 (lite mode stops the hero's arrival), §10 (first screen), §12 (the hero on both test pages: edge to edge, button on an iPhone SE's first screen, one h1, LCP on the photo, axe, contrast measured from the pixels behind the words, desktop band) and §14 (yarn lettering, now read from `/?view=hero-test`) were rewritten. Run on 2026-10-06 with `--quick` (Chrome only): sections 1, 1b, 2, 3, 4, 5, 6, 10, 12, 14, 16, 63/63 passed; `npm run check:money` 10/10; theme check clean for these files.
- **Not run:** Safari and Firefox (the full gate), the theme editor, and a real phone.
- **Known rough edges:** the square sunflower photo was not shot for this layout (on phones the hand fades behind the heading; on desktop the top of the bouquet is cropped and the tail of the yarn lettering runs onto the faint edge of the photo). A photo with the pieces in the upper two-thirds fixes these. `theme/locales/en.default.json` still has the old slideshow strings under `hero` (unused, harmless). `base.css` still names `.hero__flower` in the lite-mode rule (unused).
- **The day a campaign ends** (Raushan asked, 2026-10-06): `/?view=hero-ended-test` holds a campaign whose "Show until" is long past, and check §12 confirms the normal heading, line and "Shop all gifts" button come back by themselves. Screenshots: `docs/mockups/hero-ended-home-360.png` (campaign on) and `hero-ended-ended-360.png` (after it).
- **The campaign line no longer repeats the announcement bar:** "Free delivery over ₹499" became "Handmade crochet flowers that never wilt". The bar stays on every page (decisions.md, 2026-10-06). The planned "one word for the offer" change was dropped: the cart, the bar, the FAQ and the locale all already say "free shipping"; the hero line was the only "free delivery", and it is gone.
- Rollback: `git revert` the commit; nothing outside these files depends on the new hero.

## The label: the normal-day hero on phones (2026-10-06, later the same day)

Raushan liked the festival hero but not the words under the photo on a normal day: an italic serif line, the yarn lettering, a two-line description and a button, left-aligned under a centred bouquet. He asked for a fresh idea.

- **Built like the logo, on one centre line.** Below 990px, on a normal day with "Words on phones: Centred": "HANDMADE CROCHET GIFTS" in small spaced capitals, the yarn lettering "stitched with love" as the one loud thing, a centred button. The description is hidden there (still in the HTML, shown on desktop). The h1 still reads "Handmade crochet gifts, stitched with love". A campaign keeps its own left-aligned layout; desktop is unchanged.
- **A square photo is shown whole on phones** (`hero--square`, aspect ratio ≤ 1.1): a square box and a later dissolve (opaque to 68%), so the piece stays crisp and only the empty surface melts. On a short phone the box trims wall and surface (`100svh - 14rem`), never the piece.
- **The photo** is `yarn-basket-sunflower-square-hero-2048.png`, uploaded to Shopify Files on 2026-10-06 (MediaImage 32852508934281, alt "Sunflower trio crochet bouquet"). It is an AI edit of the real bouquet photo (hand removed, bouquet standing, gift tag added; prompt in `docs/imagegen/sunflower-square-hero-prompt.txt`). The old `home-hero-1-sunflower-bouquet.png` is still in Files.
- New settings: "Words on phones" (`align`) and "Photo focus, top to bottom" (`focus_y`, 40 on home, for the desktop and tablet crop).
- `/?view=hero-ended-test` is now the real home page with its campaign's "Show until" in the past, so it shows exactly what 9 Nov will look like. `/?view=hero-test` is the same page with no campaign block.

| 360 × 660, normal day | Before | After |
|---|---|---|
| Photo | 360 × 300, cropped, hand fading behind the heading | 360 × 360, whole |
| Text styles under the photo | 4 (serif, yarn, description, button) | 2 and a button |
| Button | left, ends at 552px | centred, ends at 544px |
| Bestsellers heading | 604px | 596px |
| Darkest spot behind the words | 6.3:1 | 9:1 |
| iPhone SE: button ends at | 506px | 508px (photo 375 × 324) |

- Checks, `--quick` (Chrome only), sections 3, 4, 6, 10, 12, 14: 44 of 45 passed. The one failure is not the hero: `cart.js` is 22.1 KB against a 22 KB budget, from another session's uncommitted cart work. `check:money` 10/10. The festival home page at 360px is pixel-identical to before this change.
- Screenshots: `docs/mockups/hero-normal-before-{360,1280}.png`, `hero-normal-after-{360,375,390,1280}.png`.
- Rough edge: on desktop the tail of the yarn lettering touches the faint left tip of the bouquet's wrapper.

