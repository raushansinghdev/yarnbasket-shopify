# Plan: yarn lettering, round 2. A calm hero, and the writing moves to "One stitch at a time"

Status: **Built 2026-10-03**: all five recommendations approved (§9). As built: `yarn-heading.md`. Follows `yarn-heading.md` (round 1, built and committed in fbec542, not pushed).

## 0. Why

Raushan asked whether the writing animation is too much on the first screen. **Honest answer: yes, in the hero it is.**

- **The headline is incomplete when people decide.** In round 1, "stitched with love" isn't finished until about 7 s after the page opens. With a blank start it would be missing entirely for the first 2.5 s. Those are the words that say what the store is.
- **It pulls the eye away from the photos and "Shop all gifts".** That undoes part of the home calm-down (`home-calm-plan.md`).
- **"Every visit" gets old.** A returning buyer waits through the same 7 s each time.
- **Accessibility:** it passes WCAG 2.2.2 (a tap or scroll stops it), but nobody knows they can tap. Movement beside text people are reading is hard for anyone with attention difficulties. Reduced-motion users are protected, but most people never turn that setting on.

**The idea itself is good. It belongs where people are browsing, not where they are deciding.** Our story's heading is already "One stitch at a time", which is exactly what the animation shows.

## 1. What changes, in one look

| | Today (round 1) | After this plan |
|---|---|---|
| **Hero** "stitched with love" | Faint dashed outline, then the hook writes it 2.5 s after load, every visit | **The yarn lettering, already finished**, from the first moment. No motion, no wait, no hook or ball |
| **Our story** "One stitch at a time" | Plain Cormorant heading that rises in | **Written in one strand of yarn** by the hook, with the ball rolling under the line, when the heading comes into view |
| **Story clip** (video) | Plays when half on screen | **Waits until the words are written**, then plays as today (§4) |

## 2. Hero: still lettering

- "stitched with love" shows as Cocoa yarn at the same size as now: the twist, the crossed t's and the two rose knots. It's fully readable at once.
- **No hook, no ball, no script, no motion.** It's the same on every visit and in every mode (reduced motion, data saver, no JavaScript).
- The real words stay in the h1, visually hidden, for Google and screen readers (unchanged).
- **Recommendation: no "tiny touch"** such as the knots popping in. A still hero is the point of this change.

## 3. Our story: the writing, once, when it's seen

### 3.1 What a shopper sees

1. While scrolling, they reach Our story. The eyebrow ("How it's made") and the text arrive as they do today, and the heading's line is **blank** (its space kept, so nothing jumps).
2. **When the whole heading is on screen** (not at the edge, at least 10% above the bottom), the **hook and the yarn ball arrive together** at the start of the line. They fade in and settle over 0.7 s.
3. The hook **writes "One stitch at a time" in one strand** (4.2 s, a gentle start and finish). The **ball rolls along under the line, a little behind the hook, getting smaller** as its yarn is used. The yarn rises from the ball to the hook's tip. No letter goes below the line, so the ball never covers a letter.
4. After "time", **the hook lifts away and the ball rolls on a little; both fade out together**. Then the t's are crossed and the i's dotted with rose knots.
5. **What stays:** only the yarn words. No dashes, no ball, no hook.

Total: about 6 s, **once per page view**.

### 3.2 Rules

| Situation | What happens |
|---|---|
| Reduced motion, lite mode / data saver, no JavaScript | The words are simply there, finished |
| A tap on the heading | Finishes at once (WCAG 2.2.2) |
| Scrolled off screen before it's done | It finishes, so it's complete when they come back |
| Scrolled past before ever seeing it, then back up | It plays then, the first time it's actually seen |
| The logo intro is still showing | It waits for the intro to end (unchanged rule) |
| The heading is changed in the theme editor | A plain heading, as today. To write new words in yarn, re-run the tool (§6) |
| Screen readers, Google | Read "One stitch at a time" from the h2. The drawing is `aria-hidden` |

### 3.3 Calm in the rest of the section

Our story already has three moving things: the thin strand that draws across the section as you scroll, the text rising in, and the clip. To keep it to **one thing at a time**:

- **The heading no longer does its own "ink" rise.** The writing replaces it. The eyebrow and text still rise in as today, which finishes before the writing begins.
- **The clip waits for the words** (§4).
- **The background strand stays.** It moves only as fast as the shopper scrolls, so the shopper is in control, and it's a thin line, not a focal point. It and the yarn heading share the same yarn idea.

### 3.4 Size and fit

- The letters are sized to the h2 (it's a smaller heading than the hero's). As built, they fill the column on a phone (about 310 px, roughly body-text height) and are about 500 px wide on desktop.
- Checked at **360, 390 and 1280** wide. Phones are the main case.

## 4. The clip and the writing take turns

**Recommendation: the words first, then the clip, on every screen.**

- **Desktop:** the clip and the heading sit side by side and come into view together. The clip starts when the writing ends (about 6 s later).
- **Phones:** the clip sits above the heading. It shows its still frame and play button until the heading below has been written, then plays if it's still half on screen.
- **The play button always works.** A tap on play wins over everything, as today. A pause sticks, as today.
- If the heading is already written, or the yarn writing is off (reduced motion, lite mode), **the clip behaves exactly as today.**
- **Trade-off:** on phones, someone who scrolls past quickly won't see the clip start by itself. That's the calmer choice. The clip is ambience; the words are the message.
- **Alternative (not recommended): the clip plays as today,** and the writing happens while it plays. On phones both are on screen together, about 6 s of two moving things.
- `story-video.js` belongs to the other session's "Made by hand" work. It's changed only to add the wait; autoplay, pause, the off-screen pause, data saver and the deferred download all stay as they are (check §12).

## 5. Page order: Gifting above Our story, Customer love and Our promise swapped

Raushan's idea. **Recommendation: yes, both.**

| # | Today | Background | Proposed | Background |
|---|---|---|---|---|
| 1 | Hero | plain | Hero | plain |
| 2 | Bestsellers | plain | Bestsellers | plain |
| 3 | Our story | **Blush panel** | **Gifting** (occasions) | plain |
| 4 | Gifting | plain | **Our story** | **Blush panel** |
| 5 | Our promise | **Blush, stitched edge** | **Customer love** (reviews) | plain |
| 6 | Customer love | plain | **Our promise** | **Blush, stitched edge** |
| 7 | FAQ | plain | FAQ | plain |
| 8 | Newsletter | **Blush band** | Newsletter | **Blush band** |

**Why it's better:**
- **Shopping first.** Bestsellers then Gifting puts both ways to shop at the top, where most visitors are. Many of our buyers come for a gift, and "a gift for every occasion" is a buying path, not a story.
- **Then the reasons to trust us,** in a natural order: how it's made (story), what people say (reviews), what we promise, questions.
- **The colours alternate** from Gifting onward: plain, Blush, plain, Blush, plain, Blush. Today Customer love and FAQ are two plain sections in a row.
- **Our story with the yarn writing moves a little lower,** further from the first screen, which fits §0.

**One small catch:** Our promise's first line, "Crocheted by hand, one stitch at a time.", repeats the story heading. That's more noticeable once the heading is the one thing that moves. **Suggestion: "Every piece made by hand, never by machine."** This is optional, and the words are yours to choose.

**How:**
- It's the section order in `templates/index.json`, the same as dragging sections in the theme editor.
- Before pushing, I check the store's copy of the file for editor changes (the usual push check).
- §10 and §14 checks that rely on section order are updated.

## 6. How it's built

| File | Change |
|---|---|
| `tools/yarn-lettering.mjs` | Makes **two drawings** from one list: "stitched with love" (still) and "One stitch at a time" (written). The still one has no mask, hook, ball or script. The written one has the travelling ball (already drafted, not committed). |
| `theme/snippets/yarn-lettering.liquid` | Generated. `render 'yarn-lettering', words: …` picks the drawing; `part: 'script'` is the runner (for the written one only). |
| `theme/sections/hero.liquid` | Keeps the match on "stitched with love" and drops the script render. |
| `theme/sections/story.liquid` | If the heading is "One stitch at a time", the h2 gets the yarn drawing and the runner. The heading skips the ink rise. |
| `theme/assets/story-video.js` | Waits for the words (§4), and listens for a `yarn:written` event. |
| `templates/index.json` | New section order (§5), only if approved. |
| `tools/check.mjs` §14 (and §12 if needed) | See §7. |
| `docs/yarn-heading.md`, `docs/decisions.md` | Updated to round 2. |

**Cost:**
- The hero loses the inline runner and the mask, so it gets slightly lighter.
- Our story gains about 3 KB of compressed inline drawing and runner. It's below the first screen, so it doesn't block anything.

## 7. Checks

Rewritten §14 "Yarn lettering":

- **Hero:** the lettering is there and whole at once, with no hook, ball or running animation, and the h1 reads "Handmade crochet gifts, stitched with love".
- **Story, phone:**
  - It stays blank until scrolled to.
  - It then writes and rests: the strand is whole, the knots are on, and the hook and ball are gone.
  - The h2 reads "One stitch at a time".
  - No script errors.
- **Story:**
  - A tap finishes it.
  - Scrolling it off screen finishes it.
  - It waits for the logo intro.
  - With reduced motion it's simply there.
- **Clip (§12):** it waits for the words, then plays.
  - The existing tests (pause, off screen, reduced motion, data saver, no early download) keep passing.
  - The "plays in view" test first scrolls the heading into view and waits for the writing.
- Theme check, then the full quick check (it was 103/103), including the speed and smoothness budgets.

## 8. Order of work, and what you'll see before anything is pushed

1. Generator and snippet (§2, §3), hero and story sections, clip wait (§4).
2. Section order (§5), if approved.
3. Checks (§7) and docs.
4. **For your review:**
   - a still screenshot of the hero (phone and desktop)
   - a **GIF of Our story being written on a phone**, and one on desktop
   - a full-page screenshot of the new order
5. Commit after your OK. **Push to both only on your go.**

## 9. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| Y1 | Hero: still lettering, or with a tiny touch (knots pop once) | **Still,** no motion at all |
| Y2 | Story writing: when, and how often | **When the whole heading is on screen, once per page view,** hook and ball together, both leave |
| Y3 | The clip and the writing | **Words first, then the clip,** on every screen (§4) |
| Y4 | Section order | **Yes:** Gifting above Our story, Customer love above Our promise (§5) |
| Y5 | Promise's "one stitch at a time" line | **Change it** (e.g. "Every piece made by hand, never by machine."), your words |
