# Yarn lettering: words drawn in one strand of yarn

Status: **Round 2 built 2026-10-03** (`yarn-story-plan.md`).
- The hero's "stitched with love" is **still**.
- Our story's "One stitch at a time" is **written by a crochet hook** when it's seen.

Round 1 (the hero writing itself on every visit, commit fbec542) was moved off the first screen after Raushan asked whether it was too much there. It was: it hid half the headline for several seconds and pulled the eye from the products (plan §0).

**Recordings:**
- `docs/mockups/yarn-story-phone.gif` and `yarn-story-desktop.gif` (the story being written)
- `yarn-hero-still-phone.png` and `yarn-hero-still-desktop.png`
- `home-order-built.png` (the whole page)
- Round 1 and earlier ideas: `yarn-writing.gif`, `stitched-heading*`, `yarn-heading*`, `yarn-one-strand.html`

## What shoppers see

**Hero:** "Handmade crochet gifts," and below it **"stitched with love" in Cocoa yarn**: the strand's twist, crossed t's and two rose knots on the i's. It's whole and readable from the first moment. It never moves, the same on every visit and in every mode.

**Our story** (now after Gifting):
1. The eyebrow and text rise in as usual. The heading's line is **blank**, its space kept.
2. When the **whole heading is on screen** (at least 10% above the bottom), the **hook and a yarn ball arrive together** at the start of the line (0.7 s).
3. The hook **writes "One stitch at a time" in one strand** (4.2 s, a gentle start and finish). The **ball rolls along under the line**, a little behind, **getting smaller** as its yarn is used. The yarn rises from the ball to the hook's tip.
4. After "time", **the hook lifts away and the ball rolls on, both fading**. Then the t's are crossed and the i's dotted with rose knots.
5. **The clip beside it starts only now** (one thing moving at a time).

**Rules (story):**

| When | What happens |
|---|---|
| A page view | It plays once, the first time the heading is actually seen |
| A tap on the heading, or scrolling it off screen | It finishes at once. The tap is WCAG 2.2.2's way to stop motion longer than 5 s |
| The logo intro is still showing | It waits for the intro to end |
| Reduced motion, lite mode (data saver), no JavaScript | It's simply there, finished, and the clip behaves as before |
| Google and screen readers | They read the words from the heading (visually hidden); the drawing is `aria-hidden` |
| The heading is changed in the theme editor | A plain heading. The hero's highlighted words get the old stitched underline |

**The clip** (`assets/story-video.js`) waits while the heading is still to be written, and starts on the drawing's `yarn:written` event. A shopper's Play always wins.
- On phones, where the clip sits above the heading, it shows its still frame until the words are done.
- Without the writing, it behaves as it did before (`home-media-plan.md` §4).

## How it's made

- **`tools/yarn-lettering.mjs`** draws every phrase in its `DRAWINGS` list and writes `theme/snippets/yarn-lettering.liquid`. Don't edit the snippet by hand.
  - Each phrase is either **still** (no mask, hook, ball or script) or **written**.
  - Callers render it with `words:` (lowercase). A written drawing also needs `part: 'script'` once, before the heading.
- **Letters:** EMS Allure (`tools/fonts/EMSAllure.svg`), a single-line script under the SIL Open Font License, derived from Allura. Only the drawing ships, not the font. The tool changes it in these ways:
  - its own plain "s"
  - the "c" starts lower on its curve
  - 60 units of extra letter spacing
  - t-crosses become short separate bars, and i-dots become knots
  - strokes are joined in writing order, and words are linked by a soft dip of slack yarn
  - a lead-in and an end curl
- **Size:** the letters are sized in em of the heading's own text, so the hero keeps its round 1 size. The story's lettering fills its column on phones (about body-text height there) and is about 500 px wide on desktop.
- **Ball:** 400 font units across, about 12 px on a phone and 20 px on desktop. It rolls under the baseline, which no letter crosses.
- **Runner:** an inline script, rendered at the top of Our story. It sets `html.yarn-play` before the drawing is painted, watches the heading with an IntersectionObserver, and drives one clock: the mask reveal, the hook at the strand's tip (`getPointAtLength`), the ball's roll and shrink, and the yarn to the ball. It also re-arms after a theme-editor section reload. No theme.js change.
- **Cost:**
  - The hero's drawing is lighter than in round 1 (no runner, no mask).
  - Our story carries about 3 KB of compressed inline drawing and runner, below the first screen.
  - Quick check: 107/107 on 2026-10-03, within the speed and smoothness budgets.
- **Other words:** add them to `DRAWINGS`, run the tool, and update the match in `sections/hero.liquid` or `sections/story.liquid`. The "s" and "c" fixes are tuned for Allure's lowercase.
- **Checks:**
  - `npm run check` §14:
    - the hero is still and whole
    - the story is blank until seen, then written and at rest
    - both headings read as words
    - no script errors
    - a tap or scrolling away finishes it
    - it waits for the logo intro
    - the clip waits for the words
    - reduced motion
  - §12 taps the words finished first, then tests the clip on its own.

## Decisions (Raushan, 2026-10-03)

- **Round 1:**
  - Words written in yarn, not an underline; the whole phrase in **one strand**; **Cocoa**.
  - **More readable** (spacing, a thinner strand, t-bars on their letter).
  - Yarn ball and crochet hook.
- **Round 2** (`yarn-story-plan.md` §9):
  - Y1: the hero is **still**, with no "tiny touch".
  - Y2: the story is written **once per page view, when the whole heading is on screen**, the hook and ball arriving and leaving together, starting from a **blank** line (no dashed outline).
  - Y3: **the words first, then the clip**.
  - Y4: **Gifting above Our story, Customer love above Our promise**.
  - Y5: Promise's first line is now "Every piece made by hand, never by machine."
