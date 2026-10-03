# Story on phones: a shorter "One stitch at a time"

Status: **built 2026-10-04.** Raushan chose **4:3 landscape on every screen** over the square proposed below; section 6 has what was built.

Raushan's report: on a phone the "How it's made" section is too tall and forces extra scrolling.

---

## 1. What was measured (local server, 360x800, the Galaxy A55 size in the screenshot)

The section is **886px tall, more than one full screen**, and the Blush panel alone is 771px, so it can never be
seen whole. It is the second-tallest section on the home page (Bestsellers is 899px).

| Part | Height |
|---|---|
| Space above and below the panel (the section's own padding) | 116px |
| Panel padding, top and bottom | 72px |
| Video, 4:5 | 339px |
| Gap between video and text | 32px |
| Yarn-ball icon on its own row, plus the gap under it | 68px |
| Label, heading, paragraph, link and the gaps between them | 260px |

Two parts are larger than they need to be: the video's tall 4:5 shape, and the icon taking a row to itself.

---

## 2. The plan (phones and tablets only, below 990px; desktop does not change)

| Change | Now | Proposed | Saves at 360px |
|---|---|---|---|
| Video and photo shape | 4:5 | **1:1 (square)** | 68px |
| Yarn-ball icon | 52px, own row | 32px, on the same row as "How it's made" | 60px |
| Panel padding at the bottom | 48px | 32px | 16px |
| Gap between video and text | 32px | 24px | 8px |

Result, measured by applying these styles to the local page:

| Screen | Section now | Section after | Panel now | Panel after |
|---|---|---|---|---|
| 360x800 | 886px | **739px** | 771px | **623px** |
| 412x915 (S24 Ultra size) | 959px | **799px** | 838px | **679px** |

The whole panel then fits on one screen, with the video, the heading and the link visible together.

Pictures at 360px wide: [now](mockups/story-phone-now.png), [square](mockups/story-phone-square.png),
[4:3](mockups/story-phone-4x3.png).

### Kept as it is

- The paragraph, the heading's yarn writing, the "Our story" link and its 48px tap height.
- The yarn strand and the flower behind the panel (they are placed in percentages, so they follow the new height).
- The space above and below the panel: it is the same rhythm every home section uses.
- Text and video order. Placing them side by side was considered and dropped: at 360px the text column would be
  about 150px wide.

### The one choice: square or 4:3

- **Square (recommended).** It matches the hero photos, which are already square on every screen. A vertical clip
  loses a little more from its top and bottom than it does at 4:5.
- **4:3** saves another 68px (section 671px at 360x800), but it keeps only the middle 60% of a vertical clip's
  height, so hands at work would often be cut off. The demo logo already loses room there: the play button sits
  on the wordmark.

---

## 3. What changes in the code

- `theme/sections/story.liquid`:
  - styles below 990px: `--ratio: 1 / 1` on the media, the icon and label on one row, the two spacing values.
  - the video and photo settings' help text: "shown 4:5" becomes "shown square on phones, 4:5 on desktop; keep
    the action in the middle".
- `tools/check.mjs`: one new check, on a 360x800 phone the story panel is no taller than the screen.
- `docs/decisions.md`, and `docs/home-media-plan.md` section 4 ("4:5 on every screen size") brought in line.

## 4. How it is tested

- `npm run check` on Chrome desktop and phone, iPhone WebKit and Firefox, including axe.
- By eye at 360, 390 and 412px wide: the yarn writing still starts when the heading is fully on screen, the clip
  still waits for it, and the still frame and the video have the same square shape so nothing jumps.
- Desktop at 1440px: unchanged from today.

## 5. What it does not fix

The saving is about 150px on a page of about 4,870px, so the home page is still roughly six screens long. This
makes the story readable in one view; it does not shorten the page by much. Bestsellers (899px) is the other tall
section and is not part of this plan.

---

## 6. What was built (2026-10-04)

Raushan's point: a landscape clip shows hands at work in less height. That holds as long as the clip is filmed
landscape, so the filming guide in `home-media-plan.md` section 4 now says to hold the phone sideways.

- **Clip: 4:3 on phones, tablets and desktop** (was 4:5). Desktop changed too, because a landscape clip cropped to
  4:5 would lose about 40% of its width. A photo, when there is no video, keeps its own shape.
- Icon beside the label at 32px below 990px; panel bottom padding 32px and gap 24px, as in section 2.
- The video and photo settings' help text now ask for landscape.

| Screen | Section before | Section now | Panel before | Panel now |
|---|---|---|---|---|
| 320x640 | | 659px | | 547px |
| 360x800 | 886px | **671px** | 771px | **555px** |
| 412x915 | 959px | **719px** | 838px | **599px** |
| 1440x900 (desktop) | | 697px | | 484px |

- Check 6c: at 360x800 the panel fits the screen, the clip is 4:3, and the icon shares the label's row.
- Demo only: the logo animation was made for 4:5, so the play button sits on the end of "Handmade with love".
