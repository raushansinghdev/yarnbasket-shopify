# Home page first screen: plan (v2)

Status: **built 2026-10-02** (see "As built" below). Raushan approved v2 with the recommended options. The trust bar was then made quieter, after a review relayed by the account session (§4 as built).

**Brief, 2026-10-02:**
- The hero's two big buttons are heavy and don't match the theme.
- On a phone you scroll too far to reach "Loved most", where the real products and crafts are.
- Make the page simple, user friendly, accessible, modern and beautiful. Explore; don't treat the suggestions as fixed.

**v2 adds:**
- a trust line at the top
- optional name-and-price labels on the hero photos
- a solid underline on the link
- one pill button on desktop (the demos showed the small link looks lost there)
- a proposed order for the rest of the page

---

## v3: colours (2026-10-02, built)

- **Main:** Soft blush **#FBF1EE**, for the hero and the header at the top, the same as the rest of the page.
- **Supporting:** Blush **#F2D4CC**, for the top bar, the "Shop all crochet" pill (with a white knob, on phones and desktop), the craft circles, and the panels below.
- **Text:** Cocoa Deep #4E3A31.
- **Lines and accents:** Rose #E3A69C, for the stitched underline and the desktop frame outline.
- **Blush hero:** with the hero's Background setting on Blush, the earlier look returns (text link on phones, dark pill on desktop).
- **Measured** (360 × 780): the craft circles start at 693px.
- **Checks:** 88/88.

## As built (2026-10-02)

**Hero**
- **Files:** `sections/hero.liquid`, plus `snippets/hero-tag.liquid` (the name-and-price label).
- **Labels:**
  - Each photo has a Product picker and an optional short name. The label shows the product's live price, without ".00".
  - Demo slides use the test products by handle when they exist, for example `sunflower-trio-crochet-bouquet` → "Sunflower bouquet".
  - When a label shows, the image's alt is empty (new `decorative` option in `snippets/image.liquid`), so the link is read once: "Sunflower bouquet Rs. 1,299".
- **Modes in the script:**
  - Row: below 990px
  - Swipe: 990px and up on touch screens (iPad landscape)
  - Fade: desktop with a mouse

**Trust bar** (`sections/announcement-bar.liquid` + `header-group.json`)
- **Look:** Blush, Cocoa Deep text, a hairline, about 33px.
- **Default:** "Handmade in India · Ships in 1–3 days". " · " splits parts; the dot is hidden from screen readers.
- **Behaviour:**
  - one message is plain text and not a tab stop
  - 2+ messages get 48px arrows; never rotates
  - an Icon setting: truck, parcel, gift or heart
- **Offset:** `--announce-h` is measured once by a ResizeObserver. While the page isn't scrolled, the cart and saved toasts, the account sheet and the search panel add it via `--header-top`. It's set on those four only, never on `<html>` (that cost a slow frame at the first scroll).

**Section order** (`templates/index.json`): hero → Bestsellers → occasions → promise → reviews → story → FAQ → newsletter. Promise sits before reviews so the two Blush panels don't touch.

**Measured** (390 × 844):
- "Loved most": 1,072 → 644px
- craft circles: start at 717px
- first price: ~1,130px
- 360 × 780: the circles start at 691px

**Not met:** iPhone Safari with its toolbars showing (664px tall). "Loved most" sits at the bottom edge and the circles need a ~60px scroll. Safari hides its toolbar on the first scroll.

**Checks**
- `npm run check`: new section 10 "Home first screen", Chrome and Safari:
  - the circles are on the first screen at 360 × 780
  - the next photo peeks in and has loaded
  - one 48px text link on phones, a pill on desktop
  - every photo link has a name
  - the bar is plain text
  - no sideways scroll at 320–412
- **Full run:** 84/84 pass, 0 slow frames, LCP 1.1–1.4s (hero photo, 4x CPU).
- **Hero behaviour tests** (temporary script) in Chrome, Safari and Firefox:
  - the row scrolls and fetches the next photo
  - keyboard order: Shop all, then the photos, each scrolled into view
  - desktop: the cross-fade and arrows work, and hidden slides are inert
  - iPad: full-frame swipe with dots
  - axe 0 everywhere
- **`npm run audit`:** clean in all three engines. Its filter now also skips Shopify's telemetry messages from the account component on a local server.

**Fixed on the way**
- A slow frame from the `<html>` offset variable (above).
- The newsletter form scrolled sideways at 320px in Safari: `minmax(0, 1fr)` on its grid.

**To do (Raushan)**
- Confirm the delivery time. "1–3 days" is now in both the bar and the cart.
- Add "Free shipping over ₹… · Cash on delivery" in the theme editor once both are live and match checkout.
- Set the currency format to `₹{{amount_no_decimals}}`, so the labels read "₹1,299".
- Pick each hero photo's product in the theme editor once real hero photos are uploaded.
- Create the `customer-account-main-menu` menu: every page logs a warning without it (account session).

---

## 1. What's wrong today (measured 2026-10-02, demo content, `:9292`)

| Phone | Screen | Hero ends | "Loved most" starts | First price |
|---|---|---|---|---|
| 360 × 780 (common Android) | 780 | 971 | 1,029 (1.3 screens) | 1,504 (1.9 screens) |
| 390 × 844 (iPhone 13/14) | 844 | 1,013 | 1,072 (1.3 screens) | 1,565 (1.9 screens) |
| 412 × 915 (Pixel 7) | 915 | 1,016 | 1,076 (1.2 screens) | 1,583 (1.7 screens) |

On a 390px phone, the ~950px hero is made up of:

| Part | Height | Problem |
|---|---|---|
| Heading | 133px | 3 lines: a 12-character width cap forces the third line |
| Intro text | 81px | 3 lines |
| Two full-width buttons | 148px | They read as a form, not a welcome. "Find a gift" leads to a plain list of collections |
| Gap before the photo | 48px | |
| Photo frame | 418px | Half the screen for one photo. The other three hide behind tiny dots |
| Hero bottom padding, plus Bestsellers' top padding | ~120px | |

Also: delivery, Cash on Delivery and returns appear nowhere above the fold. The "Our promise" strip and reviews start about 3,100px down, nearly 4 screens.

---

## 2. Decisions

| # | Question | Choice | Status |
|---|---|---|---|
| H1 | Hero photos on phones | **Peek row:** portrait photos at 62% width, the next one peeking in (square since 2026-10-03, 68% since 2026-10-04: see decisions.md) | Approved |
| H2 | The two big buttons | **Phones: one text link** "Shop all crochet →". **Desktop: one pill** with the arrow knob (changed in v2, see §3.2) | Phones approved; **desktop to review** |
| H3 | "Find a gift" | Leaves the hero. Gifting lives in "A gift for every occasion" and the menu | Approved |
| H4 | Intro text | Shorter: "Bouquets, keychains, clips and charms, crocheted by hand." | Approved |
| H5 | Trust line | **A slim Cocoa bar above the header:** "Free shipping over ₹X · Cash on delivery" | **To review; needs real terms** |
| H6 | Labels on hero photos | **Name and price on each photo** (demo C), or none (demo B) | **To review** |
| H7 | Order of the rest of the page | Move the story lower and keep shopping and trust higher (§6) | **To review**; a separate build step |

---

## 3. The hero

### 3.1 Phones and tablets (below 990px)
```
┌──────────────────────────────┐
│ 🚚 Free shipping over ₹999 · Cash on delivery │  trust bar (H5), scrolls away
├──────────────────────────────┤
│ ☰      Yarn Basket   🔍 👤 🛒 │  header on Blush (unchanged)
│ Handmade crochet             │  h1, 38px, 2 lines
│ gifts, stitched with love    │  the stitch sews in (unchanged)
│ Bouquets, keychains, clips   │  16px, balanced over 2 lines
│ and charms, crocheted by hand│
│ Shop all crochet →           │  48px tall text link, thin solid underline
│ ┌─────────────────┐ ┌─────── │  photo row: 62% wide, 4:5, 12px gap,
│ │   sunflowers    │ │  bee   │  runs off the right edge
│ │(Sunflower ₹1,299)│ │(Bee ₹3 │  ← optional labels (H6)
│ └─────────────────┘ └─────── │
│ LOVED MOST · Bestsellers     │
│ (All) (Bouq) (Keys) (Hair)…  │
└──────────────────────────────┘
```

**Heading:**
- The same text, which is the page's h1 and keeps "crochet" for Google.
- On phones: 2.375rem (38px), line-height 1.02, no width cap.
- 2 lines from 360px wide; a 320px phone may need 3.

**Intro text:**
- 1rem on phones, `--fs-lead` from 990px.
- `text-wrap: balance`, so it never leaves "by hand." alone on its own line.

**Photo row:**
- Native horizontal scroll that snaps one photo at a time.
- Each photo is 62% of the row at 4:5 (no new crop), with `--radius-lg` corners and a 12px gap.
- The row runs to the screen's right edge, so the next photo is visibly cut off. That says "there's more" without dots.
- On phones, the white mat, the outline, the dots and the two outline flowers go. Desktop keeps them all.
- About 270px tall on a 390px phone, down from 418px.
- No autoplay and no buttons below 990px.
- The last photo gets a right padding equal to the page gutter.
- **Tablets (600–989px):** photos at about 44% width, so two and a bit fit. Tuned at 768.

**Spacing:**
- Hero bottom padding: 8px on phones. The Blush fade shortens from 120 to 64px.
- When the craft section follows the hero, its top padding on phones drops to 32px, and the eyebrow-to-heading gap to 4px.
  - This is done in the hero's stylesheet with `:has()`, so `shop-crafts.liquid` isn't touched.

### 3.2 The call to action (H2)

**Phones: one text link.**
- "Shop all crochet" plus an arrow, in Jost 500 at 1rem, sentence case, Cocoa Deep.
- **Thin solid underline** (1.5px, Cocoa Deep at 45%, 7px below the text).
  - v1 used a dashed stitch, which echoed the heading's stitched underline too closely. The stitch now belongs to the heading alone.
- Tap target 48px.
- On mouse hover the underline goes full strength and the arrow nudges 3px.

**Desktop: one pill** (the existing `btn--knob`, "Shop all crochet" plus the round arrow).
- Demo D showed the text link looking lost in the wide copy column.
- A single pill sized to its text is calm at 1440px, and it's no longer two stacked bars.

**Settings:**
- The second-button settings stay in the schema, blank by default.
- If they're filled in, the second call to action shows as a link on both phones and desktop, never a second pill.

### 3.3 Desktop photo (990px and up)
- Unchanged: two columns, the crossfade slideshow with arrows and pause on hover/focus, the frame and the flowers.
- iPad landscape keeps today's full-frame swipe.

### 3.4 Script modes (hero.liquid)

| Mode | When | What |
|---|---|---|
| Row | `max-width: 989px`, any pointer | Peek row. No timer, no `inert`, `aria-live` off. The current photo follows the scroll (using `offsetLeft`), only to fetch the next photo early |
| Swipe | ≥990px and touch | Today's full-frame swipe |
| Fade | ≥990px with a mouse or keyboard | Today's crossfade |

**Images:**
- In Row mode, slide 2 is on the first screen, so it loads `eager` (without high priority).
- The main photo keeps `fetchpriority="high"` and stays the LCP image.
- `sizes` becomes `(min-width: 990px) 46vw, 62vw`, so phones download a smaller main photo than today.

**Theme editor:** selecting a Photo block scrolls the row to it.

---

## 4. Trust bar (H5)
- **Content:** one line, with real terms only. For example: "🚚 Free shipping over ₹999 · Cash on delivery".
  - ⚠️ The demo text is a placeholder. **Raushan to confirm:** the free-shipping amount (if any), whether COD is offered, and a typical delivery time.
  - It must match checkout exactly. A promise the checkout doesn't keep costs more trust than no bar.
- **Look:**
  - a Cocoa Deep band with Cream text, Jost 500 at 13px, sentence case, centred, about 36px tall, with a small truck icon
  - Cocoa is the brand's second surface colour (brand-direction §1), so it frames the Blush hero instead of competing with it
- **Behaviour:**
  - It scrolls away with the page. The header stays sticky as today.
  - With one message: static text, no arrows, no carousel.
  - With 2–3 messages, the existing manual arrows remain. Nothing auto-rotates.
  - If a message has a link, the whole line is the link.
- **Accessibility:**
  - It's an `<aside>` with an aria-label ("Store information"). Cream on Cocoa Deep is well over AA.
  - The icon is `aria-hidden`.
  - The "·" separator sits inside an `aria-hidden` span, so screen readers hear "Free shipping over ₹999, Cash on delivery".
- **Cost on phones:** about 35px. "Loved most" moves from 610 to 645 on a 390px phone. The craft circles still end above the fold there (841 of 844); on a 360 × 780 phone their tops are visible.
- **Build:**
  - Restyle the existing `sections/announcement-bar.liquid`: sentence case instead of spaced capitals, Cocoa, static when it has one message.
  - Add it to `sections/header-group.json` above the header. It's part of the header group, so it shows on every page with the same terms.

---

## 5. Labels on hero photos (H6, optional)
- **What:** a small cream pill at the bottom left of each photo, for example "Sunflower bouquet **₹1,299**".
  - It turns the photos from mood into a way to shop, and shows price up front, which shoppers here look for first.
- **Data:**
  - Each Photo block (and the main photo) gets a **Product** picker.
  - The label shows that product's title and live price, so it can't go stale.
  - With no product chosen, no label is shown and the photo stays a plain link (today's behaviour).
- **Accessibility:**
  - The label is visible text inside the link, so it becomes the link's name ("Sunflower bouquet, ₹1,299").
  - The image's alt is then left empty, so the name isn't read twice.
- **Trade-off:** in round 3 Raushan removed a label from the bee photo ("the photo stands alone"). Labels add a little to the busiest part of the screen, so this one is Raushan's call. **Claude leans yes**, mainly for the price.

---

## 6. Order of the rest of the page (H7, proposal; its own build step)

Today on a 390px phone:

| Section | Starts at | Height |
|---|---|---|
| hero | 65 | 948 |
| Bestsellers | 1,013 | 1,060 |
| story | 2,072 | 660 |
| occasions | 2,733 | 345 |
| reviews | 3,078 | 489 |
| promise | 3,567 | 492 |
| FAQ | 4,059 | 442 |
| newsletter | 4,501 | 340 |

That's about 5.7 screens.

**Proposed order:** hero → Bestsellers → **occasions** → **reviews** → **promise** → story → FAQ → newsletter.

**Why:**
- **Occasions right after Bestsellers** keeps the shopping going: it's the second way into products (Birthday, Under ₹999…).
- **Reviews and the promise** then answer "can I trust a small handmade shop?" while the shopper is still deciding.
- **The story** is for people already interested, so it moves below them.

**Later, and measured first:**
- Make the promise strip more compact on phones (492px for three short items).
- See whether the FAQ and the newsletter both earn their place.

This changes only `templates/index.json` (the order). It goes in as a separate commit, so it's easy to undo.

---

## 7. Prototype numbers (CSS injected into the live page, 2026-10-02)

| Phone | "Loved most" (today → hero only → hero + trust bar) | First price (today → hero + bar) |
|---|---|---|
| 360 × 780 | 1,029 → 588 → **623** | 1,504 → **1,089** |
| 390 × 844 | 1,072 → 610 → **645** | 1,565 → **1,130** |
| 412 × 915 | 1,076 → 626 → ~661 | 1,583 → ~1,160 |

"Loved most" and the craft circles reach the first screen on all three phones, about 430px higher than today.

**Demo screenshots** (Claude's scratchpad, not in the repo):

| Demo | Shows |
|---|---|
| A | Hero only, 390 |
| B | Hero + trust bar, 390 and 360 |
| C | B + photo labels, 390 |
| D | Desktop 1440: today; with a text link (looks lost); with one pill (recommended) |

---

## 8. Accessibility
- **Reading order:** trust bar → header → h1 → text → link → photos → Bestsellers.
- **Photos:** the carousel region and "Photo 2 of 4" groups stay. In Row mode every photo link is reachable by Tab and by swipe-reading, with none hidden.
- **Motion:**
  - Nothing moves on its own below 990px. Desktop autoplay keeps its pause.
  - The bar never auto-rotates.
  - Reduced motion is unchanged.
- **Targets:** link and pill ≥48px. The bar's link is its full ~36px height across the width; it's a single line of text, which WCAG 2.5.8 covers.
- **Zoom:** at 200% text the heading wraps to 3–4 lines, the bar wraps to 2, and nothing scrolls sideways except the photo row (a labelled region).
- **Contrast:** Cocoa Deep on Blush, Cream on Cocoa Deep, and Cocoa Deep on the cream label are all AA or better.

---

## 9. Files that change, and when

| File | Change | Owner right now |
|---|---|---|
| `theme/sections/hero.liquid` | Markup, styles, script modes, `sizes`, eager slide 2, schema defaults, optional product labels | free |
| `theme/templates/index.json` | Hero copy and labels. Later, the section order (H7, its own commit) | free (read-modify-write) |
| `theme/sections/announcement-bar.liquid` | Restyle: sentence case, Cocoa, static with one message | free |
| `theme/sections/header-group.json` | Add the bar above the header | free, but next to the account session's header work, so tell them first |
| `tools/check.mjs` | New checks (§10) | **account session: wait for "released"** |
| `docs/decisions.md` | H2 (desktop), H5, H6, H7 outcomes | shared (append only) |

Untouched: `header.liquid`, `base.css`, `product-card.liquid`, the locales file.
- The bar's aria-label uses the existing `announcement.label` key.
- The hero's label needs no new text strings: it uses the product's own title and price.

---

## 10. Tests
- **`npm run check`** in all three engines, phone and desktop, all passing, LCP included.
- **New checks**, once check.mjs is released:
  - at 390 × 844, the craft circles end above the fold
  - at 360 × 780, the circles' top is above the fold
  - the second hero photo is partly visible and loaded
  - one call to action in the hero, ≥48px
  - no sideways page scroll at 320, 360, 390 and 412
  - the bar shows its one message without arrows
- **`npm run audit`**, all three engines.
- **By hand:**
  - WebKit iPhone 13 and SE: one photo per swipe, and vertical scroll isn't captured
  - Firefox phone
  - iPad landscape keeps Swipe; desktop keeps Fade
  - theme editor block select
  - 200% text, reduced motion
- **Raushan, on a real phone:**
  - TalkBack and VoiceOver read the bar, h1, text, link, then "Photo 1 of 4, Sunflower bouquet, ₹1,299, link" (with labels)
  - the look on your own screen

---

## 11. Small calls Claude will make while building
- **One photo only:** with a single photo, it goes full width at 1:1 instead of a lonely 62% card.
- **Long product names:** a label truncates with an ellipsis after one line. The full name stays in the link's name.
- **320px phones:** the heading may take 3 lines, and the circles sit just below the fold. Acceptable.
