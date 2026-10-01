# Header & navigation plan

Status: **Stages 1–3 built 2026-10-02.** Raushan approved the recommendations for D1–D5 (§14). Stage 4 (search panel) waits for build-plan Phase 3. Two things are still to do: the WhatsApp number (Theme settings → Social) and the real main menu in Shopify admin (§3).

### As built (where it differs from the plan below)
- **The desktop layout starts at 1100px, not 990.** Five menu items at 14px don't fit beside the logo and tools below that. Between 768 and 1099px the header uses the phone layout.
- **The desktop header is 72px and doesn't shrink.** Shrinking a sticky header changes its layout height, and the page jumps under it. A steady height is calmer.
- **Search is a real `<form action="/search">` field, not a button that looks like a field.** It shows at 768–1099px and from 1280px up. At 1100–1279px it's a 28px icon link. Typing and pressing Enter works with no JavaScript. It sends `options[prefix]=last`, so "bouq" finds "bouquet". Stage 4 adds results as you type on top of this.
- **The tablet header** (768–1099px) shows the search field and an icon-only cart. With the word "Cart" too, the logo can't stay centred.
- **The phone drawer scrolls on a 390 × 844 screen.** The craft tiles are 4:3 and come first, and Account / WhatsApp / Instagram sit below them. Seeing the products first mattered more than fitting everything on one screen.
- **"Track order" is in the Help dropdown**, not in the drawer's bottom row. The bottom row is Account, then WhatsApp (once the number is set), then Instagram.
- **Demo menu:** while Demo content is on and the main menu has no dropdowns, the header shows the planned menu (Shop / Gifts / Bestsellers / Our story / Help) with demo craft photos. Its links only go to pages that exist. Once a real menu with dropdowns is saved in the admin, the demo menu goes away.
- **How photo tiles are chosen:** a dropdown whose children are all collection links (2 or more) shows them as photo tiles. A dropdown with any collection link gets a "Shop all" / "View all" link.
- **Tooling:** `tools/cdp.mjs` gained `--tab N` (presses the real Tab key, so focus styles show) and `--forced-colors`.
- **Checks on 2026-10-02:**
  - axe: 0 violations at 360, 390, 768, 1100 and 1440px, on the home page and a collection page, with the drawer and dropdowns open
  - theme check: clean
  - tab order: skip link → logo → menu → search → Account → Cart
  - forced colours and the landscape static header both work
  - not yet done: the real-phone VoiceOver/TalkBack pass (Raushan)

### Setting up the real menu (Shopify admin, about 5 minutes)
1. Go to **Products → Collections** and create Bouquets, Keychains, Hair clips, Bag charms (and Bestsellers). They can be empty for now.
2. Go to **Content → Menus → Main menu** and delete Home, Catalog and Contact.
3. Add **Shop**, linked to "Collections". Add the four craft collections, then drag each one to the right under Shop, so they become a photo dropdown.
4. Add **Gifts**, linked to a collection, with occasion collections nested under it. Add **Bestsellers**, linked to its collection.
5. Add **Our story** (a page) and **Help**, with FAQ / Shipping / Contact pages nested under it.
This plan covers the header bar, its icons, the desktop menu, the mobile menu drawer and search, on every page.
It follows `motion-plan.md` (tokens, budgets) and `brand-direction.md` (stitch marks, line icons).

---

## 1. What's wrong today (measured 2026-10-02, 1440px desktop and 390px phone)

| # | Problem | Measured | Why it matters |
|---|---------|----------|----------------|
| 1 | Icons look small and faint | 24px glyph with a 1.6px stroke, inside a 48px button. The glyph fills only half the button | The tap area is fine, but the *visual* target is small. Thin strokes on Blush read as light grey to low-vision users |
| 2 | Icons have no words | Search, Account and Cart are icon-only on desktop, where there's plenty of room | Every shopper has to guess. Visible labels are the single biggest help for cognitive and low-vision accessibility |
| 3 | The menu icon is unusual | Two lines, the second one short | It reads as "text" or "filter" to some people. Three equal lines is the pattern everyone knows |
| 4 | Desktop menu text is tiny | 13px, uppercase, `.16em` tracking, Cocoa | Uppercase plus wide tracking at 13px is hard to read. Contrast passes (5.3:1) but there's no margin |
| 5 | Cart count is tiny | 18px badge, 11px number | Hard to read, and it touches the basket glyph |
| 6 | Cart changes are silent | `data-cart-label` is rewritten, but nothing is in a live region | Screen-reader users don't hear "added to cart, 2 items" |
| 7 | The menu has no real content | The menu is Shopify's default: Home / Catalog / Contact | "Home" repeats the logo. "Catalog" hides what we sell. No categories show until you click |
| 8 | The mobile drawer is mostly empty | 3 huge serif words (34px), then Account and Search, then 700px of blank space | Doesn't show what we sell (breaks the "see products fast" rule). There's no help or WhatsApp link |
| 9 | Search is just a link | Goes to `/search` and loads a whole page | Slow on phones. You can't see results as you type |
| 10 | The sticky header wastes room on short screens | 64px always. At 400% zoom or in a landscape phone, the header covers 25–35% of the view | Breaks WCAG 2.4.11 (focus not obscured) and 1.4.10 (reflow) |

What already works and stays:
- 48px tap targets
- dropdowns that use a disclosure button (not an ARIA menu)
- Esc closes things, and the pointer can cross to the dropdown panel without it closing
- the native `<dialog>` drawer (focus trap, Esc and inert page come free) and swipe-to-close
- the stitch mark that moves under hovered links
- the header hides on scroll down, but never while it holds focus
- the skip link
- `scroll-padding-top`

---

## 2. Goals

1. **Icons you can see without trying:** bigger, heavier and labelled wherever there's room.
2. **The menu shows what we sell:** product categories with photos, one tap from any page, on desktop and phone.
3. **WCAG 2.2 AA with margin, not just a pass:** text 7:1 where cheap, big targets, keyboard and screen reader first-class.
4. **Calm:** the header must not compete with product photos. One colour (the Blush ground) and one ink (Cocoa Deep).
5. **Fast:** no icon fonts, no new libraries, no layout shift. Images inside the menu load only when the menu opens.

---

## 3. Menu contents (information architecture)

The menu itself lives in **Shopify admin → Content → Menus → Main menu**, not in code, so it can be changed later without a deploy.

**Shopify note:** a menu item becomes a dropdown when other items are nested under it. Drag an item right under its parent in the admin. The theme reads this as `link.links`. When an item points at a collection, the theme can reach that collection's photo through `link.object.featured_image`. That's how the menu gets category photos without anyone uploading images twice.

Proposed main menu (≤ 5 top-level items, so it fits one desktop row and one phone screen):

```
Shop ▾            → Bouquets · Keychains · Hair clips · Bag charms · Scrunchies · Home decor · [Shop all]
Gifts ▾           → Birthday · Anniversary · For her · Under ₹499 · [All gifts]   (ties to the gifting differentiator)
Bestsellers       → /collections/bestsellers
Our story         → /pages/our-story
Help ▾            → FAQ · Shipping & delivery · Track order · Contact us (WhatsApp)
```

- **"Home" is removed.** The logo is the home link on every page (it's labelled "Yarn Basket, home" for screen readers). This is the norm on shop sites.
- "Catalog" becomes **Shop**: a clear verb with the categories one level down.
- Categories that don't exist yet (Scrunchies, Home decor) are added only when they have products. Empty categories are never shown.
- Until real collections exist, **Demo content** fills the photos from `assets/demo-*`, the same way the home page does.

---

## 4. Icons

### 4.1 Size and stroke

| | Today | New |
|---|---|---|
| Glyph size (icon-only) | 24px | **28px** |
| Glyph size next to a text label | n/a | **24px** (the label carries the meaning) |
| Stroke | 1.6 on a 24 grid = 1.6px | **1.8 on a 24 grid = 2.1px at 28px**. That matches the logo's 2.4 stroke and the Jost 500 text weight |
| Tap target | 48 × 48 | 48 × 48 (unchanged, WCAG 2.5.8 needs 24) |
| Colour | Cocoa Deep | Cocoa Deep (7.6:1 on Blush; WCAG 1.4.11 needs 3:1) |
| Space between icon buttons | 0 | 4px, so the hover circles don't touch |

### 4.2 New drawings (in `snippets/icon.liquid`, 24px grid, round caps and joins)

Familiar shapes come first and brand character second. A crochet-themed magnifier is cute, but people stop recognising it.

- **menu**: three equal lines, 3.5 → 20.5, at y = 6.5 / 12 / 17.5
- **search**: lens r = 7 centred at 10.5, 10.5. A 6px handle at 45°. The lens is a little larger than today so it balances the basket
- **account**: a fuller head (r = 4) and shoulders that end at the baseline, so it doesn't look like a keyhole
- **basket**: today's basket, redrawn closer to the logo's basket. Handle arc, a slanted body, one weave line at 60% opacity. It's the brand's own mark, so it doubles as the cart icon
- **close**: a 12px ×, the same weight as menu (so the swap between them looks like one icon turning into the other)
- **chevron**, **arrow**: re-stroked to 1.8 so they match
- **whatsapp**, **truck** (track order), **help** (question in a circle): new, for the drawer and the Help menu

All four header glyphs get **optical sizing**: each sits inside a 20px live area on the 24 grid, so the round search lens and the wide basket look the same size. They are checked side by side at 1x and 2x before shipping.

### 4.3 States

| State | Look |
|---|---|
| Rest | Cocoa Deep glyph |
| Hover (mouse only) | Cocoa 8% circle fills in behind it; the glyph makes its small existing gesture (search tilts, basket lifts) |
| Pressed | scale .94 for 120ms |
| Keyboard focus | today's ring: 2px Cocoa outline plus a soft Rose halo. The outline gives 5.3:1 on Blush |
| Current page (on /cart, /account, /search) | the glyph switches to its **filled** variant, and the link gets `aria-current="page"` |
| Forced colours (Windows contrast mode) | glyphs use `currentColor`, so they follow the system colours. The badge gets a 1px `CanvasText` border so it stays visible |

### 4.4 Cart count badge

- 20px tall, minimum 20px wide, **12px number at weight 600**, Cocoa Deep with Cream text (9.9:1)
- sits on the basket's top-right corner with a 2px ring in the header colour, so it separates from the glyph
- 100+ shows as "99+"
- on change: today's bump animation (skipped under reduced motion)
- **new:** a visually hidden `role="status"` region in the header says "Added to cart. Cart, 2 items." Without it, screen-reader users get no feedback (fixes problem 6)

---

## 5. Desktop header (≥ 990px)

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ [logo] Yarn Basket     SHOP ▾   GIFTS ▾   BESTSELLERS   OUR STORY   HELP ▾                  │
│                                                         [⌕ Search…        ]  [👤]  [🧺 Cart ②] │
└───────────────────────────────────────────────────────────────────────────────────────────┘
          (one row: logo left · menu centre · tools right; height 76px)
```

- **Height** 64 → **76px**. It shrinks to 64px after 80px of scroll (a height change on the bar only; `header-scrolled` already exists). It still hides on scroll down and returns on scroll up.
- **Menu text** 13 → **14px**, tracking `.16em` → `.12em`, colour **Cocoa Deep** (7.6:1, up from 5.3:1). Uppercase stays, because it's the brand label style. With the gap at `clamp(24px, 2.4vw, 40px)`, five items fit from 990px up.
- **The stitch mark stays** (solid line = this page, stitches = hover or focus).
- **Search becomes a field-shaped button.** It's a 220px pill reading "Search bouquets, keychains…" with a 24px lens icon. People recognise the shape instantly. Clicking it opens the search panel (§7). Between 990 and 1199px it collapses to a 28px icon to save room.
- **Labels on the tools:**
  - **Cart** always shows the word "Cart" plus the count. It's the most important button on the site.
  - **Account** is a 28px icon with a tooltip that also shows on focus. It's used least, and a word there would crowd the row. (Decision D1 below.)
- **The Shop dropdown becomes a photo panel** (a small mega menu):

```
┌──────────────────────────────────────────────────────────────┐
│  [photo]     [photo]     [photo]     [photo]     │ Bestsellers │
│  Bouquets    Keychains   Hair clips  Bag charms  │ New in      │
│                                                  │ Gifts ≤ ₹499│
│  ───────────────────────────────────────────────  Shop all → │
└──────────────────────────────────────────────────────────────┘
```

  - Photos are 120px squares from each collection's featured image (`image_url: width: 240`, `loading="lazy"`), in the Oat photo frame used by product cards.
  - The panel is centred under the header and is at most the page width.
  - The behaviour is the same as today's dropdown: it opens on click, or on mouse hover after 90ms. It closes on Esc, on focus leaving, on a click outside, or on scroll-hide. Tab moves through it in reading order.
  - Gifts and Help keep the simple list dropdown, with brand icons next to each item.

---

## 6. Tablet (768–989px)

This is the same layout as the phone, with more room:
- The search button becomes the field-shaped pill (200px), because it fits.
- The drawer is 420px wide, so the page behind it stays visible.

---

## 7. Search panel (desktop and phone)

This replaces the plain link (fixes problem 9). The button stays a real `<a href="/search">`, so search still works without JavaScript.

- **Phone:** the panel slides down from the top as a full-screen `<dialog>`. The input is focused and the keyboard opens. A "Cancel" text button sits on the right.
- **Desktop:** the panel drops down under the header, 640px wide, and the page behind it dims.
- **Before you type:** "Popular" chips (Bouquets, Keychains, Gifts under ₹499) and up to 4 recent searches stored in this browser. These give a useful start with nothing typed.
- **As you type** (after 2 characters, 200ms debounce): up to 4 products (photo, name, price), up to 3 collections, and a "See all results for '…'" link.
  - **Shopify note:** this uses Shopify's built-in **predictive search**, with no app. The theme calls `/search/suggest?q=…&resources[type]=product,collection&section_id=predictive-search`, and Shopify returns the rendered HTML of a small `predictive-search` section. That keeps all the markup in Liquid.
- **Accessibility:** a plain `<input type="search">` with a visible label, results as a list of normal links, and a `role="status"` line ("4 products, 2 collections"). This is deliberately not the ARIA combobox pattern: plain links behave the same in every screen reader, and combobox support is still uneven on iOS.
- Esc or Cancel closes the panel and returns focus to the search button.

---

## 8. Phone header (< 768px)

```
┌───────────────────────────────────────┐
│ [≡]      [logo] Yarn Basket     [⌕][🧺②] │   64px, 48px targets, 28px glyphs
└───────────────────────────────────────┘
```

- **Layout stays:** menu on the left, logo in the centre, search and cart on the right. Thumbs know this layout from every shop app.
- The glyphs grow to 28px and the menu icon becomes three lines (problems 1 and 3).
- **No text labels on the phone.** At 360px there isn't room for words without shrinking the logo, and these four symbols are the most widely understood ones on the web. Every button still has a screen-reader name ("Open menu", "Search", "Cart, 2 items").
- Account moves into the drawer (it's already there).
- **On short screens** (`max-height: 480px`: landscape phones and 400% zoom), the header becomes static instead of sticky and drops to 56px (fixes problem 10).

---

## 9. Phone menu drawer

It slides in from the left, as today. It's rebuilt so the first thing you see is **what we sell** (fixes problems 7 and 8).

```
┌──────────────────────────────┐
│ [logo] Yarn Basket       [✕] │  logo = home link; ✕ is 48px with a 28px glyph
│──────────────────────────────│
│ SHOP                         │
│ ┌──────────┐ ┌──────────┐    │  2-column photo tiles (Oat frame), 1:1,
│ │  photo   │ │  photo   │    │  the name under each, the whole tile is the link
│ │ Bouquets │ │Keychains │    │
│ └──────────┘ └──────────┘    │
│ ┌──────────┐ ┌──────────┐    │
│ │Hair clips│ │Bag charms│    │
│ └──────────┘ └──────────┘    │
│ Shop all  →                  │
│──────────────────────────────│
│ Gifts                      ⌄ │  26px serif rows, 56px tall
│ Bestsellers                  │  (Gifts and Help open in place, like today)
│ Our story                    │
│ Help                       ⌄ │
│──────────────────────────────│
│ 👤 Account    🚚 Track order  │  20px glyph and a 16px label, 48px rows
│ 💬 Chat on WhatsApp           │
│──────────────────────────────│
│ ◎ Instagram     HANDMADE WITH LOVE │
└──────────────────────────────┘
```

- The serif menu words shrink from 34px to **26px**, so the whole menu fits on a 390 × 844 phone without scrolling.
- The **photo tiles** are 160px wide (`image_url: width: 320`). The browser only fetches them when the drawer opens (lazy images inside a closed dialog aren't loaded).
- The page you're on gets its link marked with `aria-current` and a Rose underline (as today). A category tile you're on gets a 2px Cocoa frame.
- Swipe-to-close, Esc, backdrop tap and the item cascade animation all stay.
- **WhatsApp** opens `wa.me/<number>` with a short "Hi Yarn Basket" message filled in. For Indian shoppers this is often the first thing they want.

---

## 10. Accessibility checklist (all must pass before each stage ships)

| WCAG 2.2 | Check |
|---|---|
| 1.1.1 | Every icon is `aria-hidden`; every button has a name. Photo tiles use the collection name as the link text, and the image gets `alt=""` |
| 1.3.1 / 4.1.2 | `<header>` banner; `<nav aria-label="Main menu">`; dropdown buttons have `aria-expanded` and `aria-controls`; the drawer and search are `<dialog>`s with labels |
| 1.4.3 / 1.4.11 | Menu text 7.6:1; icons 7.6:1; focus outline 5.3:1; badge 9.9:1 |
| 1.4.4 / 1.4.10 | Works at 200% text zoom and at 320 CSS px wide (400% zoom) with no sideways scroll |
| 1.4.12 | Text spacing override (line height 1.5, letter spacing .12em) doesn't clip any menu label |
| 1.4.13 | Hover panels can be dismissed (Esc), can be hovered (bridge) and stay open (no timeout) |
| 2.1.1 / 2.4.3 | Tab order: skip link → logo → menu → search → account → cart. Inside a panel the order is the visual order. The drawer traps focus and returns it to the menu button on close |
| 2.4.7 / 2.4.11 | The focus ring is always visible and never hidden under the sticky header (`scroll-padding-top`, short-screen static header) |
| 2.5.3 | Visible label and accessible name match ("Cart" → "Cart, 2 items") |
| 2.5.8 | All targets are 48px or larger |
| 4.1.3 | The cart count and search result count are announced through `role="status"` |
| Motion | All motion follows `prefers-reduced-motion`; under reduced motion, panels and the drawer appear without sliding |

**How it's tested:**
- `tools/cdp.mjs` with axe at 360, 390, 768, 1024 and 1440px. Target: 0 violations.
- Forced-colours emulation (`Emulation.setEmulatedMedia forced-colors: active`).
- A scripted keyboard pass with screenshots of each focus stop.
- A manual pass with VoiceOver on iPhone and TalkBack on Android. Raushan does one of these on a real phone.

---

## 11. Performance budget

- Icons are inline SVG: 0 requests.
- Header JS added (drawer tiles, live region, shrink): **≤ 2 KB gzipped**. Search panel: **≤ 4 KB gzipped**, loaded only on first focus or click of search.
- Header CLS = 0. The header height is reserved by `--header-height`, and the shrink uses `transform` on the bar, not layout.
- Menu photos: 0 bytes until a panel or the drawer opens.

---

## 12. Files that change

| File | Change |
|---|---|
| `theme/snippets/icon.liquid` | Redrawn header glyphs, filled variants, new whatsapp/truck/help |
| `theme/assets/base.css` | `.icon-btn` sizes and states, `--header-height` (desktop/phone/short screens), badge |
| `theme/sections/header.liquid` | New markup for the tools, Shop photo panel, drawer layout, live region, schema settings (WhatsApp number, show labels) |
| `theme/snippets/menu-tile.liquid` (new) | One photo tile: collection image, or the demo photo, or the brand icon |
| `theme/sections/predictive-search.liquid` (new) | The HTML that Shopify's predictive search returns |
| `theme/assets/theme.js` | Search panel, header shrink, cart live region, drawer updates |
| `theme/locales/en.default.json` | New labels: "Cart", "Search bouquets, keychains…", "Chat on WhatsApp", result counts |
| Shopify admin → Main menu | The new menu (§3). Raushan does this in the admin (5 minutes; steps provided at Stage 2) |

---

## 13. Stages (each one shippable on its own, each ends with screenshots + axe)

1. **Icons and icon buttons.** New glyphs, 28px, badge, states, cart live region. *This is the smallest change that fixes the complaint you see first.*
2. **Desktop header.** Menu set up in admin, 14px Cocoa Deep menu text, labelled Cart, search pill, 76 → 64px shrink, Shop photo panel.
3. **Phone header and drawer.** Short-screen static header, drawer rebuilt with photo tiles, help/WhatsApp row.
4. **Search panel.** The `predictive-search` section, phone and desktop panels, popular chips, recent searches. (Could move to build-plan Phase 3 if time is short.)
5. **Full check.** The §10 checklist at every width, a real-phone screen-reader pass, the §11 budget check. Update `decisions.md` and memory.

---

## 14. Decisions for Raushan (recommendation first)

- **D1. Labels on desktop tools.**
  - **(a) Recommended:** "Cart" is always a word, Search is a field-shaped pill, and Account is an icon with a tooltip.
  - (b) All three get words.
  - (c) Bigger icons only, no words.
- **D2. Bottom tab bar on phones** (Home / Shop / Search / Cart, like Meesho and Flipkart).
  - **Recommended: no, for now.** It takes 56px of every phone screen, clashes with the sticky "Add to cart" bar planned for product pages, and with 15–25 products the drawer is enough. Revisit after launch data.
- **D3. Menu contents** (§3).
  - **Recommended:** Shop / Gifts / Bestsellers / Our story / Help, with Home removed. Raushan confirms the category list and the occasion list.
- **D4. WhatsApp in the drawer and the Help menu.**
  - **Recommended: yes.** It needs the business WhatsApp number (stored in a theme setting, not in code).
- **D5. Search panel now (Stage 4) or with the collections phase.**
  - **Recommended:** build Stages 1–3 now and Stage 4 with Phase 3, because predictive search needs real products to tune.
