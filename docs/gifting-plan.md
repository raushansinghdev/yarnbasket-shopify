# Plan: the home page's Gifting section ("A gift for every occasion")

Status: **G1 and G2 built 2026-10-03.** All six recommendations were approved (§7), and the band is White (mockup: `docs/mockups/gifting.html`, `gifting-phone.png`, `gifting-desktop.png`). **G3, the admin step, is next** (§8): until then, demo tiles go to all products.

## 0. What Raushan raised

On a phone, Gifting looks merged with Bestsellers above it (screenshot, 2026-10-03). Should it stand out, move, or go?

## 1. Why it looks merged, and the bigger problem underneath

**Why it looks merged:**
1. **Same background, one shared gap.** Both sections are Soft blush. Our rule "neighbouring sections on the same background share one gap" (`base.css`) removes Gifting's top spacing. So it starts one ordinary gap after the "Shop all gifts" button, like the next paragraph of the same section.
2. **It reads like a footnote to the button.** "Shop all gifts →" is followed straight away by "A gift for every occasion". Two "gifts" in a row look like one thought.
3. **It's the lightest thing on the page.** It's thin outlined pills with words only, right after a grid of product photos. On a phone you see two pills and a cut-off third, so it doesn't look like a place to shop.

**The bigger problem: the pills don't lead anywhere yet.**
- The store has no occasion collections. A read of the admin (2026-10-03) shows only "Shop" (11 products) and "Home page".
- So Birthday, Anniversary, Valentine's, For her and Under ₹999 **all open the same all-collections page**. A shopper who taps "Anniversary" and gets everything learns not to trust the next tap.
- The navigation's **Gifts** menu (nav-plan §3) needs the same collections, so it has the same gap.

**So restyling alone won't fix it.** The section needs real destinations, and a look that says "shop by who it's for".

## 2. Options

| | Option | Verdict |
|---|---|---|
| A | **Remove it** | ❌ Gifting is the main reason people buy crochet flowers ("flowers that never fade"). It's also our differentiator and the Gifts menu's twin. Without it, the home page only lets people shop by product type. |
| B | **Keep the pills, separate them** (own background, more space) | ⚠️ It fixes the merging, not the substance: it's still five words that lead nowhere. |
| C | **Move it lower** (after Customer love, or near the end) | ❌ A buying path hidden behind the trust content: gift shoppers decide early or leave. Its place after Bestsellers is right; its look is what's wrong. |
| D | **Turn it into an occasion shelf with photos, on its own band, linked to real occasion collections** | ✅ **Recommended** |

## 3. The recommendation (D), in detail

### 3.1 Where

It stays **right after Bestsellers** (the order you approved: Bestsellers, Gifting, Our story). Both ways to shop stay at the top.

### 3.2 How it stands apart

- **Its own band: a full-width White background**, with normal spacing above and below. The shared-gap rule no longer applies, because the background is different.
- The page's rhythm becomes Soft (Bestsellers), **White band (Gifting)**, Soft with the Blush panel (Our story). Each change of background marks a new section without adding another Blush.
- **A left-aligned heading, like Bestsellers.** It reads as a second shelf, not a centred note. On desktop, an "All gifts →" link sits on the right of the heading.
- **Copy:**
  - Eyebrow: "Gifting"
  - Heading: "A gift for every occasion"
  - Sub-line: dropped on phones, kept on desktop. The photos say it, and the phone screen stays calm (home-calm-plan).

### 3.3 Occasion tiles instead of pills

```
Phone (390)                               Desktop (1280)
┌──────────────────────────────────┐      GIFTING
│ GIFTING                          │      A gift for every occasion                      All gifts →
│ A gift for every occasion        │      ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ ┌──────────────┐ ┌────────┐      │      │ photo │ │ photo │ │ photo │ │ photo │ │ Under │
│ │              │ │        │      │      │       │ │       │ │       │ │       │ │ ₹999  │
│ │    photo     │ │ photo  │ →    │      │Birth- │ │Anniv- │ │Thank  │ │For her│ │ gifts │
│ │              │ │        │ swipe│      │ day → │ │ersary→│ │ you → │ │   →   │ │   →   │
│ │ (Birthday →) │ │(Annive…│      │      └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
│ └──────────────┘ └────────┘      │
└──────────────────────────────────┘
```

- **Each tile is one link:** a product photo (4:5), with the occasion on a white label pill at the bottom, like the hero's photo labels.
- **The last tile is different on purpose: "Under ₹999".** It's a Blush tile with big serif text and the gift icon instead of a photo, so the price path stands out and the row doesn't feel repetitive.
- **Phones:** a swipe row with about 1.7 tiles showing, so the next tile peeks in. That's the same gesture as the hero's photo row, and about 290 px tall. A 2-column grid would be about 600 px for five tiles, which is too tall here.
- **Desktop:** five across, no scrolling.
- **Motion:** only the theme's usual arrival (tiles settle in once). Nothing loops, which keeps it calm next to Our story's yarn writing.

**Photos (suggested; final picks shown before building), from `../crochet/`:**

| Tile | Photo |
|---|---|
| Birthday | Sunflower, daisy and bee bouquet (bright and cheerful) |
| Anniversary | Red rose bouquet |
| Thank you | Tulip bouquet |
| For her | Flower hair clips or a bag charm in hand |

### 3.4 Real destinations (admin; I give you exact steps)

Each tile picks a **collection** in the theme editor, not a typed link:

| Collection | How it fills itself |
|---|---|
| **Gifts under ₹999** | Automated: price is less than 999, and tag is not `free-gift`. It works the moment it's created. |
| **Birthday, Anniversary, Thank you, For her** | Automated by tag (`occasion-birthday`, …). You tag each product with the occasions it suits. One product can have several. |

- **Honest by default:** a tile whose collection is empty or not chosen **doesn't show**. While Demo content is on, demo tiles stand in, as elsewhere.
- **The navigation's Gifts menu uses the same collections,** so one admin session fixes both.
- **SEO bonus:** each collection page can rank for searches like "crochet bouquet for anniversary". It gets its own title, description and an intro line, like our other collection pages.

### 3.5 Accessibility

- Each tile is one link named by its visible words (e.g. "Birthday"). The photo is decorative (`alt=""`), so screen readers don't hear "Birthday, photo of a bouquet" for every tile.
- The label pill is Cocoa Deep on white (AA).
- Focus rings are visible, and the tap area is the whole tile.
- The swipe row has the same keyboard and screen-reader behaviour as our other rows.
- No horizontal page scroll at 360 px.

## 4. Smaller things

- **The Bestsellers button stays "Shop all gifts →".** With a band between them, it no longer runs into "A gift for every occasion".
- **Seasonal occasions (Valentine's, Rakhi, Mother's Day, Diwali)** aren't permanent tiles. They belong to the hero campaign (`hero-campaign-plan.md`, the five big occasions), which already has dates and photos. A sixth "seasonal" tile slot can be swapped in the editor if you want one.

## 5. Work and order

| Step | Who | What |
|---|---|---|
| G1 | me | **Mockup with real photos**, phone and desktop: today vs. the recommendation. You pick before anything is built |
| G2 | me | Build: the White band, the tiles, a collection picker per tile, hidden when empty, the Under ₹999 tile, demo tiles. Theme check, checks (§6), docs |
| G3 | you + me | Admin (about 20 min): create the 5 automated collections, tag the 11 products, point the Gifts menu at them. I check by reading the admin back |
| G4 | me | Screenshots for your OK, then commit; push to both on your go |

## 6. Checks

New check (§15, "Gifting"):
- each tile links to its own collection
- a tile with an empty collection is hidden
- on a phone the row swipes and the page doesn't scroll sideways
- the section's background differs from its neighbours (it never merges again)
- axe shows no violations

The full quick check stays green.

## 7. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| GF1 | Keep, move or remove Gifting | **Keep it after Bestsellers**, redesigned (option D) |
| GF2 | Look | **Occasion photo tiles on a White band**, a swipe row on phones, the last tile "Under ₹999" in Blush |
| GF3 | Which occasions are permanent | **Birthday · Anniversary · Thank you · For her · Under ₹999.** Valentine's moves to the seasonal hero campaign |
| GF4 | Occasion collections | **Create them now** (automated; tags for occasions, price for Under ₹999), shared with the Gifts menu |
| GF5 | Empty occasion | **The tile hides** until its collection has products |
| GF6 | Mockup first | **Yes,** with real photos, before building |

## 8. As built (G2) and the admin steps (G3)

**Theme (`sections/occasions.liquid`):**
- A White band, a left-aligned head with "All gifts →" on desktop, and the sub-line on desktop only.
- Tiles:
  - Occasion blocks: label, collection, optional photo (falling back to the collection's image, then its first product's photo).
  - One "Price tile" block: small label, amount, collection.
  - A tile with an empty or unchosen collection is hidden. With Demo content on, an unchosen collection shows a demo photo and links to all products.
- **Phones:** tiles are 60% of the row (about 1.7 in view). The `sizes` value matches the tile's real width, so a phone fetches a photo about 600 px wide. The row's photos load with the page (theme.js readies swipe rows), and phone images on first load are 815 KB against the 1,000 KB budget.
- **Home template:** Birthday, Anniversary, Thank you (replacing Valentine's), For her, then the Under ₹999 price tile.
- **Check §15**, 5 checks. The quick check is 112/112.

**G3, in the admin (Raushan, about 20 minutes; I read it back afterwards):**

1. **Tag the products.** Products → open each product → Tags → add the occasions it suits. Use these exact tags: `occasion-birthday`, `occasion-anniversary`, `occasion-thank-you`, `occasion-for-her`. A product can have several, for example the red rose bouquet: `occasion-anniversary` and `occasion-for-her`.
2. **Create 5 automated collections.** Products → Collections → Create collection → Automated → "all conditions":

   | Title | Conditions |
   |---|---|
   | Birthday gifts | Tag is equal to `occasion-birthday` |
   | Anniversary gifts | Tag is equal to `occasion-anniversary` |
   | Thank you gifts | Tag is equal to `occasion-thank-you` |
   | Gifts for her | Tag is equal to `occasion-for-her` |
   | Gifts under ₹999 | Price is less than `999`, and Tag is not equal to `free-gift` |

   Give each one a short description ("Crochet bouquets and keepsakes for birthdays, handmade in India…"). It shows on the collection page and helps search.
3. **Pick them in the theme editor.** Home page → Shop by occasion → click each tile → Collection.
4. **Point the navigation's Gifts menu at them.** Content → Menus → Main menu → Gifts.
5. **Tell me,** and I'll read it all back and check every tile.
