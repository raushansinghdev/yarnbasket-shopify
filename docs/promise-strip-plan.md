# Our promise: a slim strip on phones

Status: **built** (2026-10-04, on Raushan's go). `npm run check` 203/203, including check 18. Checked by eye at 320, 360 and 768 wide. Not yet done: Raushan's look on the S24 Ultra, and the two theme-editor cases in Verify step 3 (a fourth promise, "Blush panel" off).

## Why

On a 360 × 800 phone the "Our promise" card is about 560px tall, 70% of a screen, to say three things a shopper reads in two seconds. Raushan asked whether it earns that space.

It earns a place, not that much space:

- The three promises answer real doubts about an unknown handmade brand. "Made to last" is the reason to buy crochet flowers over real ones.
- The height comes from the layout, not the content: two columns leave the third promise alone on its own row, and each item stacks a 48px icon, a 22px title and a sentence.

## What changes

Phones (under 750px):

- All three promises sit in **one row**: icon above title, three equal columns.
- Icon 32px (was 48), title 16px serif italic (was 22), wrapped evenly over two lines.
- **The sentences are hidden.** The titles carry the message on their own.
- The card's padding drops from 48px to 32px top and bottom.
- Height: 141px measured at 320, 360 and 390 wide in Chrome and Safari, down from about 560px.

Tablets (750 to 989px): one row with the sentences shown. Today this width also gets the 2 + 1 layout.

Desktop (990px and up): no change.

Four promises (the section allows up to four): 2 × 2 on phones, since four columns don't fit 360px. One row from 750px.

## What stays, and why

These differ from what Claude first suggested in chat, after reading decisions.md:

- **The Blush card and its stitched border stay.** Claude first suggested dropping them. They are a recorded brand decision (2026-10-01): the promise is one of the two "brand moments" that get a Blush panel, and the stitch border matches the Instagram covers. A slim card keeps that and still saves about 410px.
- **The position stays** (after Customer love, before FAQ). Claude first suggested moving it up. The home order was set on 2026-10-03 so both shopping paths come first, then the reasons to trust us, with plain and Blush backgrounds alternating. Moving the card would break both.
- The copy in `templates/index.json` stays, sentences included, since tablets and desktop still show them.
- The icon pop and the stagger on arrival stay.

## Files

| File | Change |
| --- | --- |
| `theme/sections/promise.liquid` | CSS only, plus one class and one editor note (below) |
| `tools/check.mjs` | new check 18 |
| `docs/decisions.md` | new entry |
| `docs/promise-strip-plan.md` | status and results |

`base.css`, `index.json` and `theme.js` are not touched.

### `promise.liquid`

- `.promise__list`: `grid-template-columns: repeat(var(--count), minmax(0, 1fr))` at every width (today only from 990px). Gap `var(--space-2)` on phones, the current gap from 750px.
- Remove the rule that stretches a lone last item across the row (`.promise__item:last-child:nth-child(odd)`).
- Under 750px: `.promise__box` padding `var(--space-6) var(--space-5)`; icon 32px; title `1rem` with `text-wrap: balance`; `.promise__text { display: none; }`.
- Four promises: add class `promise__list--four` in Liquid when `section.blocks.size == 4`; under 750px it uses two columns.
- Schema: under the block's "Text" setting, add the info line "Shown on tablets and computers. Phones show the title only."

### `check.mjs`, check 18

Follows check 10's pattern (`open`, `page.evaluate`, `record`), Chrome and Safari:

- 360 × 800: every `.promise__item` has the same top (one row); `.promise__box` is at most 180px tall; no `.promise__text` is visible.
- 320 wide: no title overflows its column, no sideways scroll.
- 1280 wide: the sentences are visible.

## Verify

1. `npm run check` passes, including the new check 18 and the existing arrivals (1, 1b), axe (4) and reduced motion (5) checks.
2. By eye at 320, 360, 390, 768 and 1280: titles break cleanly, the stitch border clears the content, nothing touches the card edge.
3. Theme editor: adding a fourth promise gives 2 × 2 on phones; switching "Blush panel" off still looks right.
4. Raushan judges it on the S24 Ultra.

## Parallel sessions

`tools/check.mjs` and `docs/decisions.md` already have uncommitted changes from another session. Before building: `ListAgents`, tell the other session which files this takes, and commit only this work's hunks with an explicit pathspec.

## Later, not in this plan

- **Product page (build plan phase 4):** `snippets/offer-terms.liquid` is already agreed as its one trust row, so this strip is not repeated there. If "Made to last" is wanted near Add to cart, it goes into that row.
- **At launch:** consider swapping "Packed with love" for something concrete, such as the delivery time or partial COD, once shipping is set up (docs/launch-checklist.md).
