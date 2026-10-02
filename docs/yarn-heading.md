# Yarn heading: "stitched with love" written in one strand of yarn

Status: **Built 2026-10-03** (home hero). Raushan asked for the words themselves to be made of yarn, "cool, but never a distraction", and shaped it over several rounds. The recording is `docs/mockups/yarn-writing.gif`; earlier ideas are in `docs/mockups/stitched-heading*`, `yarn-heading*` and `yarn-one-strand.html`.

## What shoppers see

1. The heading "Handmade crochet gifts," appears as usual. Under it, "stitched with love" shows as a **faint dashed pattern** (like a crochet pattern sketched on paper), with a small **yarn ball** resting after the last word.
2. **2.5 s after the page appears**, or 2.5 s after the logo intro ends on the first visit of the day, a **crochet hook** draws yarn from the ball back to the start, under the line (0.9 s).
3. The hook **writes the words in one unbroken strand** over the pattern (4.2 s, a gentle start and finish). The yarn feeds from the ball and hangs **under** the line, so it never crosses a letter.
4. It **arrives back at the ball**. Then the t's are crossed and the i's dotted with two small **rose knots**, the hook lifts away and the pattern fades.

**Rules:**
- **It plays every time the home page opens**, always after the pause, so it never runs straight after another animation.
- **A tap on the heading, or scrolling the hero away, finishes it at once.** That's WCAG 2.2.2's way to stop motion that starts by itself and runs longer than 5 s.
- **With reduced motion, lite mode (data saver), no JavaScript, or a page already scrolled when it would start,** it's simply there, finished.
- **Google and screen readers read "Handmade crochet gifts, stitched with love":** the words stay in the heading, visually hidden, and the drawing is `aria-hidden`.

## How it's made

- **`tools/yarn-lettering.mjs`** draws it and writes `theme/snippets/yarn-lettering.liquid`. Don't edit the snippet by hand; run `node tools/yarn-lettering.mjs`.
- **Letters:** EMS Allure (`tools/fonts/EMSAllure.svg`), a single-line script under the SIL Open Font License, derived from Allura. Only the drawing ships, not the font. The script makes these changes:
  - its own plain "s" (Allure's reads like a 5 once joined)
  - the "c" starts lower on its curve (otherwise it closes into an "e")
  - 60 units of extra letter spacing
  - t-crosses become short separate bars, and i-dots become knots
  - strokes are joined in writing order; words are linked by a soft dip of slack yarn
  - a short lead-in, and a curl at the end
- **Yarn look:** a Cocoa strand with a lighter dashed "twist" and a faint shadow. A mask reveals it, so only the mask moves.
- **Runner:** an inline script in the snippet's `part: 'script'` (rendered just before the heading, so it's set up before the drawing is painted). One clock drives everything: the strand's reveal, the hook at its tip (`getPointAtLength`), the slack from the ball, and the ball's turn. No theme.js change.
- **Cost:** about 3 KB compressed in the home page's HTML, and none of it blocks rendering. The quick check stayed at its speed and smoothness budgets (103/103 on 2026-10-03).
- **Other words:** if the hero's highlighted words aren't exactly "stitched with love", they get the old stitched underline. To write other words in yarn, run the tool with the new words and update the hero's match in `sections/hero.liquid`. The custom "s" and "c" fixes are tuned for Allure's lowercase.
- **Checks:** `npm run check` §14 covers:
  - writing to the finish (strand whole, knots on, hook gone, nothing moving)
  - the heading text
  - tap to finish
  - waiting for the logo intro (stood in for, since the intro never plays for test browsers)
  - reduced motion

## Decisions (Raushan, 2026-10-03)

- Words written in yarn, not an underline; the whole phrase in **one strand**.
- **Cocoa** yarn.
- **More readable:** extra letter spacing, a thinner strand, and t-bars that stay on their letter.
- **Yarn ball and crochet hook.** Raushan's version: the ball rests at the end, the hook takes yarn to the start, writes, and comes back to the ball. This is calmer than a rolling ball, since the ball stays put.
- **Gentle:** a 2.5 s pause first, about 5 s of slow motion, and **every time** the home page opens.
