# Hero campaign plan: festival and offer banners on the home page

Status: **plan, waiting for Raushan's go** (2026-10-03; decisions revisited the same day, see §8). Builds on docs/home-media-plan.md §3 (the Campaign block, built in e54fae4) and changes how it looks on phones.

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
│ gifts, stitched with love    │      │ │   DIWALI PHOTO   (3:2)   │ │  320 × 213 at 360px
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

- **Size: 3:2** across the content width (320 × 213 at 360px). It replaces a 196px text block. Measured, the whole product row stays on the first screen on a 360 × 640 Android, a Redmi/Pixel and an iPhone 14. Only the iPhone SE (548px visible in Safari) would lose 18px, so the gap under the banner shrinks by that much there.
  - Why not 16:9 (the first draft): our best-sellers are **tall bouquets**, which a 16:9 strip crops hard, and the pill would cover over a quarter of the photo. A phone's 4:3 landscape shot crops to 3:2 losing only 11% of its height.
- **Words on a pill** at the bottom of the photo, in the same style as the product-name pills: the occasion (≤ 24 characters) and one honest line, a deadline or the offer (≤ 32 characters), plus the round arrow knob. A solid pill keeps the contrast right on any photo.
- **The h1 stays in the page** ("Handmade crochet gifts, stitched with love"), visually hidden while the banner is up, so Google and screen readers still get the page's main heading. The banner's link text is the pill text.
- **Speed:** the banner becomes the LCP image (eager, high priority, about 60–90 KB WebP at phone size). The pill is text, so it shows before the photo arrives. Same 2.0s budget, checked.
- **The campaign card in the product row (as built) becomes the fallback.** With a landscape photo, the banner replaces it, so a campaign appears once. Without one (only a square photo), phones show the card as today and the headline stays. Nothing breaks.

### 5.2 Desktop: a wide banner replaces the hero (revised after mockups, 2026-10-03)

Mockups at 1280 × 800 on the real page, with the sunflower photo standing in for a festive one: `docs/mockups/campaign-desktop-today.png`, `-A-split.png`, `-B-wide.png`.

| | A: split (first proposal) | **B: wide banner (recommended)** |
|---|---|---|
| Layout | Today's hero: festive words on the left, the campaign photo on the right | One full-width photo (about 1184 × 440, 2.7:1) with the pill, and Bestsellers right below |
| Feels like an event? | Hardly. It reads as the normal page with new words, so returning visitors may not notice | **Yes**, at a glance |
| Products on the first screen | No: Bestsellers starts at 888px, below the fold (as today) | **Yes**: the category circles and the tops of the cards show at 800px. The page gets about 150px shorter |
| Same idea as phones | Partly | **Yes**: on both, "a banner replaces the top" |
| Photo needed | Square (what you have today) | **Landscape**, shot for it (§5.4). A square photo cropped to 2.7:1 keeps only the middle 37% and looks blown up |

- **B, with A as the fallback:** if a campaign has a wide desktop photo, desktop shows B. If it only has a square one, desktop shows A automatically. Nothing breaks when a wide photo is missing.
- In B the h1 stays in the page, visually hidden, as on phones. The pill sits lower left, so leave calm space there in the photo.
- In A the frame shows only the campaign photo and doesn't cross-fade to products, so the words and the picture always match.

**Shooting one photo for both:** hold the phone sideways (landscape, 4:3 or 16:9). Put the pieces in the right half, and keep the left third calm (a plain table, cloth, soft light) for the pill. Leave space above and below. One shot then crops to 3:2 for phones and 2.7:1 for desktop. Tall bouquets: lay them at an angle, or stand two or three side by side, so they fill a wide frame.

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
2. The **hero campaign**: one landscape photo (phones crop it to 3:2, desktop to a wide strip), occasion, line, button, link, dates. A square photo is optional; it's only the fallback.
3. The **announcement bar** message with the same dates (already supported), for pages other than home.
4. Optionally an **automatic discount**, with the same dates in Shopify.
5. Set "Show until" one day after the real cut-off. Shopify caches pages, so switches can be a few hours late.

## 6. India gifting calendar (when to put a banner up)

Lunar festivals move every year, so check each date. Banners go up about 3 weeks ahead for handmade lead times, and the line switches to the order-by date in the last week.

**Revisited:** with all nine as hero campaigns, a banner would be up about 30 weeks of the year. That's a festival photo shoot every five weeks, and a home page that always seems to be on sale. So only the **five big ones** take over the hero. The small ones get the announcement bar's dated message and an occasion collection, with no photo shoot. That's about 17 banner weeks a year, and the calm headline the rest of the time.

| Occasion | When (roughly) | Starts | Hero banner? | Fits us because |
|---|---|---|---|---|
| **Navratri → Diwali → Bhai Dooj** | Oct–Nov | **mid-October (now)** | **Yes** | Largest gifting window of the year |
| **Christmas / New Year** | 25 Dec / 1 Jan | early December | **Yes** | Gifts, Secret Santa, keychains and charms |
| **Valentine's week** (Rose Day 7 Feb → 14 Feb) | February | mid-January | **Yes** | **Likely our biggest: crochet roses and bouquets "that never wilt"** |
| Women's Day | 8 Mar | late February | Bar only | Hair clips, charms |
| **Mother's Day** | 2nd Sunday of May | mid-April | **Yes** | Bouquets, pots |
| Father's Day | 3rd Sunday of June | late May | Bar only | Keychains |
| Friendship Day | 1st Sunday of August | mid-July | Bar only | Keychains, bag charms (low price, buy several) |
| **Raksha Bandhan** | August (lunar) | 3 weeks ahead | **Yes** | Gifts for sisters, and rakhi add-ons |
| Teachers' Day | 5 Sep | mid-August | Bar only | Small gifts in bulk |

## 7. How we'll know it works

Traffic is too low for a real A/B test yet, so:
- **Use Shopify's own reports, no new code:** conversion rate and add-to-cart rate for the campaign weeks against the two weeks before, and sales of the occasion collection's pieces (Analytics → Reports). Judge it after one full festival.
- **Correction (revisited):** the first draft proposed a `campaign_click` event published from the theme. Theme events only reach tracking pixels (Google Analytics, the Meta pixel). They don't show in Shopify's own reports ([Shopify: emitting data](https://shopify.dev/docs/api/web-pixels-api/emitting-data), [custom pixels](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code)), so today it would count into nowhere. Add it when GA4 or the Meta pixel is set up (likely when ads start). It's about 10 lines then.
- No UTM tags on our own links: they overwrite where the visitor really came from.

## 8. Decisions for Raushan (revisited 2026-10-03)

Each first-draft pick was checked again against what we have: photos that are nearly all square or portrait, tall bouquets as best-sellers, mostly phone traffic, Raushan making every photo himself, no analytics pixel yet, and the "premium, calm" goal.

| # | Question | First draft | **Revisited pick** | Why |
|---|---|---|---|---|
| **D1** | Phones: during a campaign, a banner takes over the top text block | Yes, 16:9 | **Yes, 3:2** | Tall bouquets fit, the pill covers less, the whole product row stays on the first screen (measured, §5.1). Without a landscape photo, the card fallback |
| **D2** | One live banner or up to two | One | **One** (unchanged) | Slide 2 is rarely seen, and every slide is a photo shoot |
| **D3** | Normal days: keep the headline, or an always-on brand banner | Keep the headline | **Keep the headline** (unchanged) | On a normal day "what is this shop" plus products and prices on the first screen is the strongest start. A brand banner would only repeat the headline, with a heavier image |
| **D3b** | Which occasions get the hero | All nine | **The five big ones**: Diwali season, Christmas, Valentine's week, Mother's Day, Rakhi. The rest get the bar and a collection | Nine would mean a banner for about 30 weeks a year: a shoot every five weeks, and an always-on-sale feel (§6) |
| **D4** | Real text on a pill, or artwork with text in the image | Real text | **Real text** (unchanged) | Sharp on every phone, read aloud, and editable in seconds. A Canva banner would also need a separate phone and desktop version |
| **D5** | Desktop: split (A), or a wide banner (B) | A, then B after the mockups | **B, with A as the fallback** (unchanged) | It reads as an event and shows products on the first screen. A is already built, so the fallback costs nothing |
| **D6** | Banner click counter | Build it | **Not now** | It would only reach a pixel we don't have yet (§7). Use Shopify's reports, and add it with GA4 or the Meta pixel |
| **D7** | *New:* while a hero campaign is live, the announcement bar keeps "Free shipping over ₹999 · Partial COD" **on the home page** and shows the campaign line on other pages | — | **Yes** | Otherwise the home page says "Diwali, order by 2 Nov" twice at the top, and loses the shipping and COD line people look for. One checkbox on the bar's message: "Hide on the home page" |

## 9. Build stages (after the go)

| Stage | What | Files | Check |
|---|---|---|---|
| C1 | Phone banner takeover: 3:2 image, pill text (occasion, line), knob, hidden h1, LCP rules, the card as fallback without a landscape photo | `sections/hero.liquid`, `locales/en.default.json` | 320/360/390/768: no horizontal scroll, page height ≈ unchanged, products on the first screen, axe 0, LCP ≤ 2.0s |
| C2 | Desktop wide banner, with the split fallback (5.2) | `sections/hero.liquid` | 1024/1280/1440: no taller than today, Bestsellers on the first screen with B, axe 0, LCP ≤ 2.0s |
| C3 | D7: "Hide on the home page" on the bar's dated messages | `sections/announcement-bar.liquid` | Home shows the standing line, /collections shows the campaign line, check §11 still one line |
| C4 | check.mjs §12 updated: a dated campaign shows/hides, banner height, pill contrast | `tools/check.mjs` | `npm run check` green |
| C5 | Docs: as-built notes, the decisions log, the checklist (5.5) in launch-checklist.md | `docs/` | — |

**For Diwali:** if you say go this week, C1 and C2 can be live before Navratri. What you need to provide: one landscape festive photo of our pieces (shot as in §5.2), a "Diwali gifts" collection, and your real last order date for Diwali delivery.

## Sources
- [Baymard: 10 UX requirements for homepage carousels](https://baymard.com/blog/homepage-carousel)
- [Baymard: homepage and category usability](https://baymard.com/research/homepage-and-category-usability)
- [Level Access: text in images](https://www.levelaccess.com/blog/content-over-images-how-does-this-ux-ui-trend-impact-accessibility/), [Stark: WCAG 1.4.5 images of text](https://www.getstark.co/wcag-explained/perceivable/distinguishable/images-of-text/)
- [IAPP: India's CCPA dark-pattern guidelines](https://iapp.org/news/a/india-s-ccpa-guidelines-on-dark-patterns-welcome-signal-but-law-is-still-soft), [Trilegal: guidelines text](https://trilegal.com/wp-content/uploads/2023/12/Guidelines-for-Prevention-and-Regulation-of-Dark-Patterns-2023.pdf)
- [GrabOn: India festive sales statistics](https://www.grabon.in/indulge/shopping-tips/india-festive-sales-statistics/), [Gifting Matrix: India gifting market](https://giftingmatrix.in/india-gifting-market-statistics-2026)
- Erik Runyon's Notre Dame carousel data and NN/g on auto-rotating carousels (docs/home-media-plan.md §1)
