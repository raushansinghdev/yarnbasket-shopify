# Home calm-down plan: a quieter phone hero and one button style

Status: **built 2026-10-03** (S1–S7, in order). Mockups: `docs/mockups/hero-calm-now.png` and `hero-calm-proposed.png`; built: `hero-calm-built.png`, `shelf-end-built-phone.png`, `shelf-end-built-desktop.png`.

### As built (390 × 664 unless noted)
| | Before | After |
|---|---|---|
| Text styles on the first screen | 8 | 5 (bar, logo, h1, photo labels, "Bestsellers") |
| h1 top | 118px | 126px (more air) |
| Photo row | 274–489px | **228–443px** (46px sooner) |
| Photo row to "Bestsellers" | 40px, with an eyebrow in between | **64px**, heading only |
| Craft circles, 360 × 780 | 514px | 538px (still on the first screen) |
| Bestsellers' last link | full-width outlined box 347 × 54 (phone), outlined pill at the far right (desktop) | **solid Cocoa "Shop all gifts →", 172 × 52, centred** on both. With a craft chosen: "See all bouquets", centred |

- **Found and fixed on the way:** the phone rule `.hero { padding-top }` came after the campaign banner's `.hero--banner` rule with the same specificity, so it overrode it. It's now `.hero.hero--banner`, so the banner gets its tighter top again; on an iPhone SE the row now ends at 520 of 548px.
- `shop.shop_all` ("Shop all gifts") is new; `header.shop_all` ("Shop all") is untouched in the menu. Bestsellers panels are a grid at every width now, so the button can centre on phones too.
- check.mjs §10: +3 checks (description hidden on phones with a row, the Bestsellers button solid, centred and ≥48px on phones, and centred on desktop with the description shown). Quick run 97/97, theme check 0 offenses, axe 0 on Bestsellers after switching crafts.


## Why

Raushan: "make hero section of landing page in phone little less crowded… premium, rich… not much cluttering."

Measured at 390 × 664 after the hero button went (decisions.md 2026-10-03), the first screen holds:
- **8 text styles**: bar, logo, a 38px italic h1, a 2-line description, photo labels in two weights, the "LOVED MOST" eyebrow in spaced capitals, and a 33px italic "Bestsellers"
- **two big italic headings 300px apart** (h1 at 118px, Bestsellers at 553px), competing for attention
- only **40px** between the photo row (ends at 489px) and the next section, so hero and Bestsellers read as one crowded stack

At the end of Bestsellers, "Shop all" is a **full-width outlined box** on phones (347 × 54), which looks like a form field or a "load more" bar, and an **orphaned outlined pill at the far right** on desktop. It's also a third button style next to the solid Cocoa hero button and the pink "See all gifts" card.

Premium sites show **one big statement per screen**, keep supporting text quiet and use **one button style** throughout. That's the aim here.

## Steps (built and checked one at a time)

| # | Change | Where | Target |
|---|---|---|---|
| **S1** | Phones: hide the hero description ("Bouquets, keychains, clips and charms…"); the photos right below show it. Desktop keeps it. The h1 is unchanged. | `sections/hero.liquid` CSS (< 990px) | First screen: heading, then photos |
| **S2** | Phones: a little more air above the heading (1.25 → 1.75rem) and between heading and photos (1.25 → 1.5rem) | `sections/hero.liquid` CSS | Products still start ≤ 240px at 390 × 664 |
| **S3** | Remove the "LOVED MOST" eyebrow above Bestsellers (the heading says it). It's a section setting, so it's off on desktop too, and Raushan can put it back in the editor. Default becomes empty. | `templates/index.json`, `sections/shop-crafts.liquid` schema default | One label per section |
| **S4** | Phones: a clear pause between the photo row and Bestsellers, about 60% of the mockup's (mockup 88px, today 40px) | `sections/hero.liquid` (the rule that tightens Bestsellers after the hero) | About 64px from the end of the photo row to the "Bestsellers" heading; craft circles still start on a 360 × 780 phone's first screen (check §10) |
| **S5** | Bestsellers' last link becomes the **solid Cocoa button**, **centred**, sized to its text, 52px, with more space above it. Label "Shop all gifts" (it matches the hero); with a craft chosen it stays "See all bouquets (n)". | `sections/shop-crafts.liquid`, `locales/en.default.json` (`shop.shop_all`) | Phone and desktop: centred, ≥ 48px, solid, contrast ≥ 4.5:1 |
| **S6** | Checks: §10 says the hero description is hidden on phones with a photo row, and the Bestsellers button is solid and centred. Full quick run green, theme check clean | `tools/check.mjs` | `npm run check --quick` all pass, axe 0 |
| **S7** | Docs: decisions.md, this plan's As built, screenshots | `docs/` | — |

**Not changed:** the name and price labels on hero photos (they answer "how much?" at a glance), the announcement bar, the header, desktop's hero layout, and the campaign banner (it already replaces the words).

**Follow-up idea (not in this plan):** an eyebrow audit across the other home sections. A small spaced-capitals label above every heading is repetitive; keep them only where they add something the heading doesn't say.

## Risks
- With the description hidden on phones, the only text in the phone hero is the h1. That's fine for SEO: the h1 and the description are still in the HTML, hidden by CSS only on phones, and Google indexes the mobile page with the h1.
- Removing the eyebrow changes Bestsellers on desktop too. It's a content setting, so it's reversible in the editor.
