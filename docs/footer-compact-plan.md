# Compact footer

**Status: replaced 2026-10-06 by `footer-plan.md`** (a new footer with Shop, Help and contact lists). Kept for the history. Was built 2026-10-04. Decision recorded in `decisions.md`. Guarded by `npm run check -- --only 19`.

## Why

Raushan found the footer taller than it needs to be. Measured before the change:

| Screen | Footer height | Share of the screen |
|---|---|---|
| 360 × 800 | 520px | 65% |
| 412 × 915 | 523px | 57% |
| 1280 × 800 | 516px | 65% |

It holds a logo, four craft links, one help link, a copyright line and two policy links. At 360px about 210px was empty space: 58px above the logo, 24px either side of the short rule, 64px under the crafts, 32px under the help row, 24px above the copyright line and 32px at the bottom. The short rule and the stitched line were two dividers within 300px, and the lone "Search" link floated between two large gaps.

At launch the footer gains a real help menu, social icons and payment icons (roughly 130px more), so the spacing had to be tight before that.

## What was built (`theme/sections/footer.liquid`, stylesheet only)

### Phones (under 750px)

| Part | Before | After |
|---|---|---|
| Above the logo | 58px | 40px |
| Basket | 76px | 56px |
| Name | 38px | 32px (`min(2rem, 9.5vw)`) |
| Short rule | shown, 24px either side | hidden |
| Logo to crafts | 49px | 20px |
| Crafts | 2 × 2, 40px rows | unchanged |
| Under the crafts | 64px | 8px |
| Help row | 40px | unchanged |
| Under the help row | 32px | 20px |
| Stitched line to copyright | 24px | 20px |
| Copyright to policies | 12px | 4px |
| Bottom | 32px | 24px (or the safe area, if larger) |

### Desktop and tablets (750px and up)

- Above the logo: `--space-8` (64px) instead of the section space (99px at 1280).
- Under the crafts 32px (was 64); under the help row 24px (was 32).
- Logo size, rule, one-line crafts with dots and the three-column base are unchanged.

### Measured after

| Screen | Before | After |
|---|---|---|
| 320 to 430 wide | 520px | 368 to 369px |
| 768 | not measured | 474px |
| 1280 | 516px | 441px |

### Flowers

They keep at least 17px from every word and the basket (decisions.md, 2026-10-01). The left flower sits beside the help row (`bottom: 126px`). Under 390px the top-right flower is 24px at `top: 2px`, because the logo now starts 18px higher. Nearest word: 23px at 320, 29px at 360, 24px at 390.

## Not changed

- Content and order, link text, tap heights (40px crafts and help, 32px policies), Soft blush background, the flowers' motion, the stitched line.
- No accordion: seven links don't need hiding, and collapsed links cost a tap.

## Follow-up

- The footer menu holds only "Search", which the header already offers. The real help links (contact, shipping, returns, track order, our story) come with the launch admin work; each wrapped row adds 40px, and check 19 allows for it.
