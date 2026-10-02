# Home media plan: square hero photos, campaign banners, and "Made by hand" video

Status: **built 2026-10-02** (stages A–E). Raushan reviewed the plan, changed M4 and M6 (below), and said go. The test video is the brand kit's logo animation, as demo content.

### As built (where it differs from the plan below)
- **Square hero (A):**
  - `.hero__media --ratio: 1` and the phone/tablet slides use `aspect-ratio: 1`. The editor info for photos says "Square, at least 1200 px".
  - **Measured at 360 × 780:** photos 198 × 198, and the craft circles start at **644px (was 691)**. At 390 × 844 (iPhone): 215 × 215, circles at 662. At 1280 × 800: the frame is 449 × 449.
- **Campaign block (B):**
  - Built as specified: at most one; "Show from" / "Show until"; it's slide 1 and gets `fetchpriority=high`, while the product photo loses its priority.
  - On phones the card is 4:3 at `62% × 4/3` (264 × 198 at 360, so the next photo still peeks in by 64px). At 44% × 4/3 on tablets.
  - The desktop photo comes through `<picture>`. Without one, the phone photo is shown whole (`object-fit: contain`, Soft blush mat). With only a desktop photo, the phone card is square.
  - The CTA switches to the campaign's button label and link while it's live.
  - **Theme editor only:** a campaign outside its dates still shows, with a dark note ("Not on the site now: shows … to …"); a campaign with no end date says so.
  - `max_blocks` went from 4 to 5 (4 photos plus the campaign).
  - **Tested by hand**, because a campaign needs Files images and the dev store has none. Product photos stood in through a temporary local patch, removed afterwards; the files were checked against their backups. Four cases at 360 and 1280: live, live without a desktop photo, expired, not started yet. **0px added to the hero, LCP on the campaign photo (1.2–1.3s), axe 0.**
- **Video (C):**
  - `sections/story.liquid` gained Shopify's `video` setting and "What the video shows". It picks the mp4 copies: ≤720 on the short side for phones, ≤1080 for desktop.
  - The still frame is a **lazy `<img>` in the same 4:5 box**, not the `poster` attribute (which loads eagerly), so nothing jumps.
  - `assets/story-video.js` (about 3 KB) loads only when there's a video:
    - plays muted, inline and looping at ≥50% in view
    - the shopper's pause sticks; the shopper's play overrides everything
    - reduced motion is checked live, plus lite mode and data saver
    - a refused autoplay falls back to the play button
  - **Fetching starts at half a screen away, not a whole screen.** At 390 × 844 the section sits within one screen of the top now that it follows Bestsellers, and a real 1–2 MB clip shouldn't load for people who never scroll there.
  - **Demo:** `assets/demo-story-video-720.mp4` (35 KB), `-1080.mp4` (66 KB) and `-poster.webp` (9 KB), made from `brand/animation/logo-animation-1080x1920-story.mp4` with no sound. They show while Demo content is on and nothing is picked, replacing the demo rose photo there. They go with the other `demo-*` assets before launch.
  - `motion-plan.md` §8 has the exception, and §3.7/6b list the story video under lite mode (agreed with session 7f).
- **Order (D):** hero, Bestsellers, **story**, occasions, promise, reviews, FAQ, newsletter. Judge it on the phone.
- **Checks (E):** `npm run check` section 12:
  - square hero on phone and desktop
  - no video request before scrolling
  - the video plays in view, Pause works, it pauses off screen
  - axe on the story with video
  - reduced motion and data saver: no autoplay and **no download**

  §10 needed no change: square photos only moved the circles up.
  - Full run: 94/95. The one miss was a single slow frame in the desktop scroll test, which had flaked before. It passed 3 out of 3 re-runs with 0 slow frames, phone and desktop, while the video was playing.

Original plan below, kept as written (with the review changes).

**Revised after review (2026-10-02):**
- **M4:** the video **autoplays on phones too** when it's in view, with guards (§4). This is a deliberate exception to motion-plan §8.
- **M6:** the hero is **square on desktop as well**, so a campaign's desktop photo is square too.

It builds on:
- `home-hero-plan.md`: the peek row, the H1 rules, the Soft blush hero (v3)
- `motion-plan.md`: §6 budgets, §3.7 lite mode, §8 "what we will not do"
- `feedback-ux-first` (products fast, calm motion) and the "Blush budget" rule in `decisions.md`

---

## 1. The question, and the answer

Raushan asked whether banner-style photos (wide images, process photos, videos of the work) would help the home page.

**Yes, but each kind of content goes where it does its job, not all in the hero:**

| Content | Its job | Where | Shape on a phone |
|---|---|---|---|
| Product photos | "What do they sell?" in about 3 seconds | **Hero**, every day: a swipe row of square photos | 1:1 |
| Campaign (Diwali, Rakhi, Valentine's, a new collection) | "Something is on right now" | **Hero, for a while:** the first card in the same row, gone after its end date | 4:3 |
| Us making things (video, photos) | "Who makes this, and is it worth it?" | **"Made by hand"**, moved up to right after Bestsellers | 4:5 |
| How a piece is made, close-ups | "Is this one good?" | **Product page** (build-plan Phase 4) | 1:1, plus an optional clip |

**Why not a big rotating banner at the top:**
- People rarely click past the first slide of a carousel. In Erik Runyon's Notre Dame study, about 1% of visitors clicked a slide, and 84% of those clicks were on the first one. Nielsen Norman Group found auto-rotating carousels annoy people and get ignored.
- A video at the top costs speed: our main-image target is under 2.0s on a mid-range Android phone, and Indian shoppers pay for mobile data.
- Landscape banners crop our square product photos: 16:9 keeps only the middle 56% of each one.

---

## 2. Hero, every day: square photos (approved)

### What changes
On phones and tablets (below 990px), the swipe-row photos go from **4:5 to 1:1**:
- Raushan's product photos are 1254px squares, so **nothing is cropped**.
- Everything else stays: 62% of the row wide (44% on tablets), a 12px gap, the next photo peeking in, the name and price labels, the main photo as the page's LCP image, and loading one photo ahead.

### Numbers (360 × 780 phone, content 328px wide)

| | Now (4:5) | Square |
|---|---|---|
| Photo | 203 × 254 | 203 × 203 |
| Row height | ~254px | ~203px (**−51px**) |
| "Loved most / Bestsellers" | starts ~644px down (decisions.md, 390 × 844) | about 50px higher. Measured before/after at 360 and 390 when built |

### Desktop (990px and up): square too (M6, Raushan)
- The two columns, the Rose frame and the slow cross-fade stay. Only the frame's shape changes, from **4:5 to 1:1**, so the photos are uncropped everywhere and phone and desktop look like one brand.
- The frame gets about 20% shorter. For example, at 1280 × 800 the photo column goes from about 590 × 740 to about 590 × 590, so more of the hero fits on a laptop screen.
- While building: check the heading column still lines up with the shorter photo (screenshots at 1100, 1280 and 1440). If the text side looks top-heavy, align both columns to the centre.

### Photo guidance (theme editor info text)
- "Square, at least 1200px. One product, centred, with space around it; the label sits along the bottom."

---

## 3. Campaign mode in the hero (approved: build now)

### How it works
A **Campaign** block in the hero, at most one, with a start and an end date.
- **While it's live** (today is between "Show from" and "Show until"), it's the **first card in the swipe row on phones** and the **first slide in the cross-fade on desktop**.
- **Outside its dates** it renders nothing. The hero goes back to products by itself, the same idea as the announcement bar's dated messages.
- **The product photos stay.** A campaign adds one card in front of them and doesn't replace them.

### Phones: same height, no extra space
The campaign card is **4:3 and exactly as tall as the square photos**, so it's simply wider:
```
┌──────────────────────────────┐
│ Handmade crochet             │  h1 unchanged (SEO)
│ gifts, stitched with love    │
│ Bouquets, keychains, clips…  │
│ (Shop Diwali gifts  →)       │  the button can switch to the campaign's (optional)
│ ┌───────────────────┐ ┌──── │
│ │  DIWALI photo     │ │ sun  │  campaign: 4:3, 271 × 203
│ │                   │ │ flow │  products: 1:1, 203 × 203
│ │(Diwali gifts ·    │ │      │
│ │ order by 26 Oct)  │ │      │  label pill, real text
│ └───────────────────┘ └──── │
└──────────────────────────────┘
```
- At 360px: 16px gutter, a 271px card and a 12px gap leave about 61px of the next photo showing, so the "there's more" peek still works.
- The row height doesn't change during a campaign: **0px added**.

### Desktop
- The campaign is the first slide inside the (now square) frame, so it needs a **square 1:1 image**.
- **Correction from chat:** I said "desktop 16:9" there. A 16:9 image doesn't fit the hero's photo frame.
- If no desktop image is given, the phone image is shown whole (`contain`) on a Soft blush mat inside the frame, never cropped.

### Text is real text, never baked into the photo
- **The label pill** (the same style as the product labels): for example "Diwali gifts · Order by 26 Oct". It names the link for screen readers too.
- **The button (optional):** for example "Shop Diwali gifts", linking to the campaign collection, replaces the hero button while the campaign is live.
- **The h1 never changes,** so "Handmade crochet gifts…" stays the page's main heading for Google.
- Baked-in text gets blurry on phones, can't be read aloud, and isn't indexed. Several of the Meesho photos have it, so the editor info says "no text in the photo".

### Block settings
| Setting | Type | Notes |
|---|---|---|
| Phone photo | image | **4:3 landscape**, at least 1600px wide; "no text in the photo; keep the bottom-left clear for the label" |
| Desktop photo | image | **1:1 square**, at least 1200px wide; optional (see fallback) |
| Label on the photo | text | about 30 characters, for example "Diwali gifts · Order by 26 Oct" |
| Link | url | usually a collection |
| Button label | text | optional; replaces the hero button while live |
| Show from | text (YYYY-MM-DD) | optional, so a campaign can be set up ahead |
| Show until | text (YYYY-MM-DD) | required; the block shows a warning in the editor without it |

### Things to know
- **Dates use the shop's time zone, and Shopify caches pages,** so a campaign can switch on or off a few hours late. Set "Show until" a day after the real cut-off. This already applies to the announcement bar.
- **LCP:** while a campaign is live, its photo is the first image and becomes the LCP image (loaded eagerly with high priority), and the main product photo moves to second. There's still one LCP image and no extra weight on first load. Checked against the 2.0s budget.
- **Accessibility:** the campaign is slide 1 of N in the existing labelled carousel. The desktop autoplay pause and lite-mode rules apply unchanged.

---

## 4. "Made by hand" with video (approved)

### What changes in the section
- A new **Video** setting (Shopify's own video picker: upload in Content → Files). Shopify hosts and serves it in sizes suited to the device, with no YouTube or Vimeo player.
- The video takes the place of the photo, **4:5 on every screen size** (the photo is 4:5 today), so the layout doesn't change. `object-fit: cover` centres it.
- With no video, the photo shows as today.

### How it plays

| Situation | Behaviour |
|---|---|
| **Phone and desktop** (M4, Raushan) | Plays **muted, inline and looping only while at least half of it is on screen**, and pauses when scrolled away. Until then it's `preload="none"`, and loading starts when the section is within about one screen. Phones get the 720p copy (about 1–2 MB for 15s), desktop up to 1080p. **This is a deliberate exception to motion-plan §8** ("no autoplay on phones"), approved by Raushan for this one clip, with every guard below |
| Reduced motion, lite mode or data saver | Never plays by itself; poster plus play button, on every device |
| iPhone in Low Power Mode, or autoplay refused by the browser | `play()` is refused; the poster and play button show instead, with no error and no retry loop |
| Any loop over 5s | A visible pause/play button (WCAG 2.2.2), 48px, keyboard reachable, and it says what it does ("Pause video" / "Play video") |
| Sound | Never; no audio track is needed |

### Accessibility
- **The video has no sound, so it needs a text alternative instead of captions** (WCAG 1.2.1). It comes from a new setting, "What the video shows", for example "Priya's hands crocheting a red rose, petal by petal".
  - It's read aloud as the video's name.
  - The visible text beside it (heading, story, the "hours per piece" stat) says the rest.
- The video is never the only way to learn something.

### Weight and speed
- The section is below the first screen, so it can't affect LCP.
- The poster is a normal lazy image, about 60–90 KB on phones.
- The video itself costs nothing until the section is about to come on screen, and nothing at all in data saver or lite mode.
- Upload guide: 1080p at most, 10–20 seconds. Shopify re-encodes it, and a typical clip ends up about 2–4 MB.
- **JavaScript:** a small `assets/story-video.js` (target ≤ 2 KB), loaded only when a video is set. `theme.js` is at 24.9 of 25 KB, so nothing goes there.

### Filming guide (for Raushan)
- Hold the phone **vertically** and keep it steady: lean it against something or use a tripod. Use daylight from a window.
- Show hands, hook and yarn, with the piece growing. Keep it in the **middle** of the frame: the 4:5 crop trims the top and bottom of a vertical video.
- 10–20 seconds, with no text, stickers or music. Filming the last few seconds so they flow back into the first makes a smooth loop.
- Your Instagram Reels footage works if it follows these rules.

---

## 5. Section order: "Made by hand" right after Bestsellers (approved: try it)

**Today:** hero, Bestsellers, occasions, promise, reviews, **story**, FAQ, newsletter
**Proposed:** hero, Bestsellers, **story**, occasions, promise, reviews, FAQ, newsletter

- It reads as "here's what we make, and here are the hands that make it". The differentiator (made by hand) lands while people are still deciding.
- **Colour rules still hold:** the two Blush panels (story and promise) still don't touch, because occasions sits between them. No new Blush is added.
- It's a one-line change in `templates/index.json`, so it's easy to undo. **Judged on Raushan's phone:** if it slows the way to the occasions chips, we put it back.

---

## 6. What we won't do
- An autoplaying video at the top, or any autoplay on phones.
- A rotating banner carousel, or text baked into photos.
- YouTube or Vimeo embeds: their players add about 500 KB–1 MB of script.
- Cropping product photos to fit a banner shape.

---

## 7. Decisions

| # | Question | Status / recommendation |
|---|---|---|
| M1 | Hero photos square on phones and tablets | **Approved** |
| M2 | Campaign mode, built now | **Approved** |
| M3 | Video in "Made by hand", moved to after Bestsellers | **Approved** (judge the move on the phone) |
| M4 | Video on phones: (a) tap to play, as motion-plan §8 says (b) an exception: autoplay muted when in view | **Raushan chose (b)**, with the guards in §4. motion-plan §8 gets a line noting the exception |
| M5 | Campaign on phones: (a) the first card in the row, same height (b) a full-width banner above the row | **(a) recommended.** No extra height, and products stay on the first screen |
| M6 | Desktop hero frame: (a) keep 4:5 (b) square like phones | **Raushan chose (b): square everywhere** |

---

## 8. Build stages (after the go)

| Stage | What | Files | Done when |
|---|---|---|---|
| A | Square hero photos, phone and desktop | `sections/hero.liquid` (CSS, editor info text) | Before/after screenshots at 360, 390, 1280 and 1440; "Loved most" position measured; LCP and slow frames unchanged |
| B | Campaign block | `sections/hero.liquid` (block, dates, slide 1, label, button switch, desktop fallback), `locales/en.default.json` | Tested with a live, an expired, a future-dated and a missing-desktop-photo campaign at 360/390/768/1280; axe 0; LCP ≤ 2.0s with a campaign live |
| C | Video in "Made by hand" | `sections/story.liquid`, new `assets/story-video.js`, locales; one line in `docs/motion-plan.md` §8 (agreed with session 7f, its author) | Phone and desktop: nothing downloads before the section is near, it plays only in view, pauses off screen, and the pause button works. Reduced motion, lite and a refused autoplay show the poster plus play. Slow frames during the scroll stay at 0. axe 0 |
| D | Order change | `templates/index.json` | Raushan judges it on his phone |
| E | Checks | `tools/check.mjs`: a new section 12 "Home media", plus §10's hero measurements updated **with session 79** (it owns §10) | Full `npm run check` passes |

**Demo content:** a demo campaign card isn't shown by default, because a fake "Diwali" would look real. The story video uses the existing photo until a real clip is uploaded.

**Coordination:**
- `hero.liquid`, `index.json` and check.mjs §10 were last changed by session 79 (hero colours, cac39d6).
- Before building, ListAgents, then claim those files and `story.liquid` by message, and wait for "ok". Only my own hunks get committed, with a pathspec.

## 9. What Raushan provides
1. **Nothing for stage A:** the existing square photos work.
2. **For a campaign, when the first one comes:**
   - a landscape 4:3 photo (phone) and a portrait 4:5 photo (desktop), with no text in them
   - a label, a link (collection) and the dates
3. **For the video:** one 10–20s vertical clip, following §4's filming guide, and one sentence for "What the video shows".
