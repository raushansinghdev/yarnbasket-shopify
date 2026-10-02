# Hero campaign plan: festival and offer banners on the home page

Status: **plan, waiting for Raushan's go** (2026-10-03). Builds on docs/home-media-plan.md §3 (the Campaign block, built in e54fae4) and changes how it looks on phones.

## 1. The question

Most Indian D2C sites (Floreal, Rare You, Moms Made, Shuddh Swad) open with a wide banner: a festival, a sale, a code, "as seen on". Raushan asked whether we should replace the text at the top of our phone home page ("Handmade crochet gifts, stitched with love", the line under it and the button) with swipeable horizontal banners, so we can run festival- and event-specific offers.

## 2. Short answer

**Yes to festival banners. No to replacing the top for good, and no to a rotating set.**

- **While a campaign is live** (Diwali, Rakhi, Valentine's week, a launch), a single horizontal banner photo **takes over the top text block** on phones. It sits in the same space, so the product row stays on the first screen. Its words are real text in our fonts on a pill, not baked into the image.
- **When the campaign's end date passes**, the top goes back to today's headline by itself.
- **One banner at a time, swiped by hand only.** A second slide is possible but rarely seen (§4).

This keeps what the reference sites get right (something seasonal is happening, with a strong photo) without what they get wrong (unreadable text in images, slides nobody sees, a sale feel every day).

## 3. Why festivals matter so much for us

- Gifting is our whole category, and Indian gifting is calendar-driven. The October–November window (Navratri, Dussehra, Karwa Chauth, Diwali, Bhai Dooj) is the single largest gifting period in India. Online is about 30–32% of the gifting market ([Gifting Matrix](https://giftingmatrix.in/india-gifting-market-statistics-2026)).
- D2C Diwali GMV grew 47% year on year in 2025, and demand starts earlier each year ([GrabOn festive statistics](https://www.grabon.in/indulge/shopping-tips/india-festive-sales-statistics/)).
- Handmade means lead time, so we have a deadline that is true and useful: "**Order by 2 Nov for Diwali delivery**". That kind of urgency is honest. Invented urgency ("only 2 left!", fake countdown timers) is a named dark pattern ("false urgency") under India's CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023, and the seller has to prove it was true ([IAPP](https://iapp.org/news/a/india-s-ccpa-guidelines-on-dark-patterns-welcome-signal-but-law-is-still-soft), [Trilegal summary](https://trilegal.com/wp-content/uploads/2023/12/Guidelines-for-Prevention-and-Regulation-of-Dark-Patterns-2023.pdf)).

So a dated, occasion-led slot at the top is worth having, and we already have the dated plumbing (the Campaign block, and the announcement bar's dated messages).

## 4. What the evidence says about banners and carousels

| Finding | Source | What it means for us |
|---|---|---|
| "On mobile we downright recommend against [carousels]." Auto-rotation on touch made testers open the wrong slide or lose their place | [Baymard, homepage carousels](https://baymard.com/blog/homepage-carousel) | No auto-rotation on phones, ever |
| 46% of sites with a homepage carousel get it wrong; static sections you reach by scrolling "perform as well" | Baymard, same article | One banner, with everything else as normal sections below |
| Testers ignored big animated hero images "as ads" (banner blindness) | [Baymard homepage research](https://baymard.com/research/homepage-and-category-usability), NN/g | A banner must look like *us* (our photo, our type), not like an ad |
| About 1% of visitors clicked a slideshow, and 84% of those clicks were on slide 1 | Erik Runyon, Notre Dame (cited in home-media-plan.md §1) | Slide 2 onwards is mostly unseen. Put the one thing that matters first |
| Text baked into images can't be read aloud, blurs on small screens and can't be resized (WCAG 1.4.5) | [Level Access](https://www.levelaccess.com/blog/content-over-images-how-does-this-ux-ui-trend-impact-accessibility/), [Stark](https://www.getstark.co/wcag-explained/perceivable/distinguishable/images-of-text/) | Text on a pill in real type, never in the picture |

**About the reference sites:** all four use Shopify's stock Dawn slideshow, which is why they look alike. That shows the layout is common, not that it sells. The two that work best use the slot for something **true and timely**: Floreal's "As seen on Shark Tank" (proof) and Moms Made's Ganesh Chaturthi offer (occasion). Rare You's "Forever flowers, never wither" banner is the same message as a headline, but heavier, blurrier and slower.

## 5. Recommended design

### 5.1 Phones: the campaign takes over the top text block

```
Normal days (as now)                  Campaign live (e.g. Diwali)
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ Free shipping over ₹999 · …  │      │ Free shipping over ₹999 · …  │  announcement bar (unchanged,
├──────────────────────────────┤      ├──────────────────────────────┤  or the campaign's dated message)
│ ☰       Yarn Basket     🔍 🛒 │      │ ☰       Yarn Basket     🔍 🛒 │
│                              │      │ ┌──────────────────────────┐ │
│ Handmade crochet             │      │ │                          │ │
│ gifts, stitched with love    │      │ │   DIWALI PHOTO  (16:9)   │ │  328 × 185 at 360px
│ Bouquets, keychains, clips…  │      │ │                          │ │  ≈ the height of the
│ (Shop all crochet   →)       │      │ │ ╭──────────────────────╮ │ │  text block it replaces
│                              │      │ │ │Diwali gifts       (→)│ │ │  pill: real text + knob,
│                              │      │ │ │Order by 2 Nov        │ │ │  the whole banner is the link
│                              │      │ │ ╰──────────────────────╯ │ │
│                              │      │ └──────────────────────────┘ │
│ ┌──────────┐ ┌─────         │      │ ┌──────────┐ ┌─────         │
│ │ Sunflower│ │ Bee          │      │ │ Sunflower│ │ Bee          │  product row unchanged:
│ │ ₹1,299   │ │ ₹449         │      │ │ ₹1,299   │ │ ₹449         │  still on the first screen
└──────────────────────────────┘      └──────────────────────────────┘
```

- **Size:** 16:9 across the content width (328 × 185 at 360px). The text block it replaces is about 195px tall, so the page gets **no taller** and the products stay on the first screen.
- **Words on a pill** at the bottom of the photo, in the same style as the product-name pills: the occasion (≤ 24 characters) and one honest line, a deadline or the offer (≤ 32 characters), plus the round arrow knob. A solid pill keeps the contrast right on any photo.
- **The h1 stays in the page** ("Handmade crochet gifts, stitched with love"), visually hidden while the banner is up, so Google and screen readers still get the page's main heading. The banner's link text is the pill text.
- **Speed:** the banner becomes the LCP image (eager, high priority, about 60–90 KB WebP at phone size). The pill is text, so it shows before the photo arrives. Same 2.0s budget, checked.
- **The campaign card in the product row (as built) goes away on phones.** The banner replaces it, so a campaign appears once, not twice.

### 5.2 Desktop: the campaign takes over the words and the first photo

The desktop hero already has words on the left and a square photo frame on the right (M6). While a campaign is live:
- **Left:** the occasion as the big line ("Diwali gifts, handmade"), the deadline or offer line, and the campaign button. The h1 stays as a small eyebrow above it.
- **Right:** the campaign's **square** photo leads the frame (as built), and the product photos follow.

There's no extra strip, and nothing gets taller. Desktop gets a square image and phones get a 16:9 one, both set in the same block.

### 5.3 One campaign at a time

- **Recommended: one live campaign.** If two overlap (Diwali, then Bhai Dooj), set the second to start when the first ends. The date settings already do this.
- **Alternative (D2 below): up to two**, swiped by hand, with a peek of the second and dots. No auto-rotation on phones. On desktop it advances only after the shopper has scrolled past and returned, and pauses on hover and focus, per Baymard's desktop rules.

### 5.4 What goes in a banner (editor guidance)

| Do | Don't |
|---|---|
| A real photo of our pieces in the occasion's setting (diyas, a rakhi thread, roses for Valentine's week) | Text, prices or logos inside the photo |
| An honest deadline: "Order by 2 Nov for Diwali delivery" | Countdown timers or "only 2 left" unless they're literally true |
| An occasion collection as the link (`/collections/diwali-gifts`) | Linking to the whole shop: the banner promised Diwali |
| An automatic discount when there's an offer ("15% off, applied in cart") | Codes the shopper has to copy, which add friction and get forgotten |
| Room on the lower left for the pill | Busy detail where the pill sits |

**Discount tone:** lead with the occasion and the gift, and keep the offer to the second line. "Up to 43% OFF" stickers every day teach shoppers to wait for sales and work against the premium look we chose. During a sale with a product discount, remember the gift discount's "Combinations → Product discounts" (docs/launch-checklist.md).

### 5.5 A campaign is more than a banner (checklist for Raushan)

1. A **collection** for the occasion (handpicked, 6–12 pieces).
2. The **hero campaign**: photos (phone 16:9 and desktop 1:1), occasion, line, button, link, dates.
3. The **announcement bar** message with the same dates (already supported), for pages other than home.
4. Optionally an **automatic discount**, with the same dates in Shopify.
5. Set "Show until" one day after the real cut-off. Shopify caches pages, so switches can be a few hours late.

## 6. India gifting calendar (when to put a banner up)

Lunar festivals move every year, so check each date. Banners go up about 3 weeks ahead for handmade lead times, and the line switches to the order-by date in the last week.

| Occasion | When (roughly) | Banner up | Fits us because |
|---|---|---|---|
| **Navratri → Diwali → Bhai Dooj** | Oct–Nov | **mid-October (now)** | Largest gifting window of the year |
| Christmas / New Year | 25 Dec / 1 Jan | early December | Gifts, Secret Santa, keychains and charms |
| **Valentine's week** (Rose Day 7 Feb → 14 Feb) | February | mid-January | **Crochet roses and bouquets "that never wilt" peak here** |
| Women's Day | 8 Mar | late February | Hair clips, charms |
| Mother's Day | 2nd Sunday of May | mid-April | Bouquets, pots |
| Father's Day | 3rd Sunday of June | late May | Keychains |
| Friendship Day | 1st Sunday of August | mid-July | Keychains, bag charms (low price, buy several) |
| **Raksha Bandhan** | August (lunar) | 3 weeks ahead | Gifts for sisters, and rakhi add-ons |
| Teachers' Day | 5 Sep | mid-August | Small gifts in bulk |

## 7. How we'll know it works

Traffic is too low for a real A/B test yet, so:
- **Count banner clicks:** a small analytics event (`campaign_click`, with the campaign's name) published through Shopify's customer events, visible in Shopify Analytics. Not UTM tags on our own links, which would overwrite where the visitor really came from.
- **Compare** add-to-cart rate and conversion for campaign weeks against the two weeks before (Shopify Analytics → Reports). Judge it after one full festival.

## 8. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| **D1** | Phones: during a campaign, a 16:9 banner takes over the top text block (5.1) | **Yes** |
| **D2** | How many live banners: (a) one (b) up to two, swiped by hand | **(a) one.** Slide 2 is rarely seen, and two banners mean two photos to make |
| **D3** | Normal days: (a) keep today's headline (b) an always-on "brand banner" (a wide lifestyle photo with the headline on a pill) | **(a) for now.** Switch to (b) when you have a great wide photo, or real proof worth showing ("4.8★ from 1,200 Meesho buyers"). It's the same block with no end date, so no extra build |
| **D4** | Banner words: (a) real text on a pill (b) allow designed artwork with text in the image, with alt text required | **(a).** Sharp, readable, translatable, and you can change it in 10 seconds without Canva |
| **D5** | Desktop: the campaign takes over the words and the first photo (5.2) | **Yes** |
| **D6** | Build the click counter (7) | **Yes**, small |

## 9. Build stages (after the go)

| Stage | What | Files | Check |
|---|---|---|---|
| C1 | Phone banner takeover: 16:9 image, pill text (occasion, line), knob, hidden h1, LCP rules, remove the phone campaign card | `sections/hero.liquid`, `locales/en.default.json` | 320/360/390/768: no horizontal scroll, page height ≈ unchanged, products on the first screen, axe 0, LCP ≤ 2.0s |
| C2 | Desktop takeover of the words (5.2) | `sections/hero.liquid` | 1024/1280/1440: same height as today, axe 0 |
| C3 | Click event (7) | `sections/hero.liquid` or `assets/theme.js` (≤ 25 KB) | The event fires once per click |
| C4 | check.mjs §12 updated: a dated campaign shows/hides, banner height, pill contrast | `tools/check.mjs` | `npm run check` green |
| C5 | Docs: as-built notes, the decisions log, the checklist (5.5) in launch-checklist.md | `docs/` | — |

**For Diwali:** if you say go this week, C1 and C2 can be live before Navratri. What you need to provide: one landscape and one square festive photo of our pieces, a "Diwali gifts" collection, and your real last order date for Diwali delivery.

## Sources
- [Baymard: 10 UX requirements for homepage carousels](https://baymard.com/blog/homepage-carousel)
- [Baymard: homepage and category usability](https://baymard.com/research/homepage-and-category-usability)
- [Level Access: text in images](https://www.levelaccess.com/blog/content-over-images-how-does-this-ux-ui-trend-impact-accessibility/), [Stark: WCAG 1.4.5 images of text](https://www.getstark.co/wcag-explained/perceivable/distinguishable/images-of-text/)
- [IAPP: India's CCPA dark-pattern guidelines](https://iapp.org/news/a/india-s-ccpa-guidelines-on-dark-patterns-welcome-signal-but-law-is-still-soft), [Trilegal: guidelines text](https://trilegal.com/wp-content/uploads/2023/12/Guidelines-for-Prevention-and-Regulation-of-Dark-Patterns-2023.pdf)
- [GrabOn: India festive sales statistics](https://www.grabon.in/indulge/shopping-tips/india-festive-sales-statistics/), [Gifting Matrix: India gifting market](https://giftingmatrix.in/india-gifting-market-statistics-2026)
- Erik Runyon's Notre Dame carousel data and NN/g on auto-rotating carousels (docs/home-media-plan.md §1)
