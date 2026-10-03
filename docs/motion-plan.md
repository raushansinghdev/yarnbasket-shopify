# Motion and performance plan: smooth, fluid, lightweight

Status: **Phase 0 done (2026-10-02).** Raushan approved the plan with all recommendations: lite mode yes, card → product
photo morph yes (built with the product page), quick add yes (details decided with the collection page). Phases 1–6
follow the pages as we build them. Run the checks with `npm run check` (section 6).

The goal is a store that feels light in the hand on a mid-range Android over 4G, and premium on an iPhone. Pages
should appear almost instantly, every touch should get an answer, and motion should explain what happened rather
than decorate. This plan covers the home page we have and every page we add later (collection, product, cart,
search, content pages, 404), so new pages inherit the feel instead of each being animated by hand.

---

## 1. Principles (the test every animation must pass)

1. **Motion explains, it doesn't decorate.** Each animation answers one of three questions: *what just arrived*,
   *what did my tap do*, or *where did that come from / go to*. If it answers none, it goes.
2. **Fast first, then smooth.** "Lightweight" is mostly perceived speed: instant navigation, no layout jumps,
   immediate tap feedback. Animation is the finish on top, never a wait in front of content.
3. **One quiet voice.** One easing family, one set of durations, one way to arrive. A shopper should never see two
   different "styles" of motion on the same screen.
4. **Plays once, then rests.** Arrivals play once. The only things that loop are the hero slideshow (pausable) and
   the faint outline flowers. No new loops without a decision entry.
5. **GPU-only by default.** Animate `transform`/`translate`/`scale`/`rotate` and `opacity`. Anything else
   (`clip-path`, `outline-offset`, SVG strokes) is allowed only on a few small elements and listed in section 7.
6. **Never scroll-jack.** Native scrolling only. No smooth-scroll libraries, no scroll-locked storytelling. (We
   tried scroll-linked reveals; under a notched mouse wheel they stepped and read as jitter. See decisions.md.)
7. **Respect the person.** Reduced motion gives a complete, still page. Low-end or data-saver devices get a lighter
   page. WCAG 2.2.2: anything moving more than 5s on its own has a pause, except the logged footer-flowers exception.

---

## 2. Where we are (baseline, measured 2026-10-02)

| Area | Today |
|---|---|
| Weight | `base.css` 20 KB (6.5 KB gzip), `theme.js` 12.6 KB (4 KB gzip), no frameworks, no third-party apps yet |
| Fonts | 2 self-hosted WOFF2 files, preloaded, `font-display: swap` (no metric-matched fallback yet) |
| Navigation | Speculation Rules prerender on hover (moderate); cross-document View Transitions, 260ms cross-fade; header keeps its place |
| LCP | Hero photo, ~0.9s on a 4x-throttled phone (local dev; real numbers come after publish) |
| Scroll | 0 slow frames, desktop and phone, 4x CPU throttle; no layout shifts while scrolling |
| Arrivals | Time-based on arrival (IntersectionObserver + CSS): lines in turn, ink-rise headings, photos settle, icons pop, stitches sew, stars pop. Swipe rows don't animate (below) |
| Accessibility | axe 0 on phone and desktop; reduced motion static |
| Pages not designed yet | Product, collection, cart, search, content, 404 (Skeleton starters) |

**Gaps this plan closes:**
1. The arrival system is wired to home-page class names, so new pages wouldn't get it.
2. The font swap can shift text slightly.
3. Nothing adapts to low-end devices or data saver.
4. Our motion and speed tests live in a temp folder, not the repo.
5. No shared patterns yet for drawers, swaps, add-to-cart, filtering or galleries.

---

## 3. Foundations: build once, every page inherits

### 3.1 Motion tokens (one source of truth)

Already in `base.css`; to be completed and documented so new code never invents numbers:

| Token | Value | Use |
|---|---|---|
| `--dur-press` | 120ms | Tap or press feedback |
| `--dur-state` | 200ms | Colour, hover, small state changes |
| `--dur-panel` | 320ms | Drawers, dropdowns, accordions, swaps |
| `--dur-arrive` | 450ms | Arrivals (was 800ms until 2026-10-04, fluid-feel-plan.md) |
| `--dur-hero` | 900ms | Hero entrance, ink-rise headings |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Default for anything entering |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Things moving between two places |
| `--ease-spring` | `linear(...)` | Tiny playful pops only (icons, badge bump) |
| **new** `--stagger` | 50ms | Delay step between siblings (was 90ms) |
| **new** `--rise` | 12px | Arrival distance (was 24px) |
| **new** `--ease-exit` | `cubic-bezier(.4,0,1,1)` | Things leaving (exits are faster: about 70% of the entry duration) |

Rule: exits are quicker than entries, and nothing a shopper waits on is longer than `--dur-panel`.

### 3.2 Arrival system → a small, declarative API

Replace the hard-coded selector lists with attributes any section can use:

```html
<div data-arrive>                  <!-- block rises in -->
<div data-arrive="lines">          <!-- children arrive in turn; an h2 inside gets the ink rise -->
<ul data-arrive="stagger">         <!-- items stagger by index (no more hand-written --i) -->
<figure data-arrive="settle">      <!-- photo settles from 94% -->
```

- **Swipe rows (`.scroller`) are calm (Raushan, 2026-10-02: the old ones were jittery and pulled the eye):**
  - nothing in a row scales, slides or pops while you swipe; the grow-as-it-slides effect and the `glide` arrival were removed
  - the snap is `proximity`, not `mandatory`
  - stars on cards inside a row just show
  - a row's lazy photos start loading when the row is within 600px, so none pops in mid-swipe
  - "there's more" is a 36px edge fade on whichever side has more to scroll to (`.can-left` / `.can-right`, set by theme.js only while the row overflows)
  - the row has 10px room top and bottom for focus rings, and its own focus ring is drawn inside it
  - choice rows (craft circles, occasion chips) have no arrival animation; content rows (reviews) still rise in as a whole
- `theme.js` sets `--i` automatically and handles swipe rows as a whole. It also re-scans when Shopify re-renders a
  section (theme editor, `shopify:section:load`) and when content is injected (filters, load more, cart).
- Same behaviour as today (below-the-fold only, plays once, `backwards` fill so hovers keep working).
- Migrating the home page is mechanical; the visuals stay identical.

### 3.3 Instant-feeling navigation

- **Speculation Rules:** keep the hover prerender (already live). Add **prefetch on `pointerdown`/`touchstart`**
  for browsers without Speculation Rules (Safari, Firefox) via `<link rel="prefetch">`, so the tap → page gap
  shrinks there too. Keep the exclusions (cart, checkout, account, query strings, add-to-cart).
  *Check before launch:* Shopify analytics and pixels must not count prerendered-but-unvisited pages (Chrome
  delays most pixels until activation; verify in the Shopify analytics test).
- **View Transitions (cross-document)** are already on, with a 260ms cross-fade.
  - Add **shared-element morphs**: the product card photo morphs into the product page photo, and the collection
    tile into the collection header (`view-transition-name` set on the clicked card only).
  - Supported in Chrome and Safari 18.2+; Firefox navigates normally.
  - Cap: 2 named elements per transition, so it stays cheap.
- **Back/forward cache:** keep pages bfcache-eligible (no `unload` handlers, no `Cache-Control: no-store` from
  apps), so going back is instant. Audit after apps are added.

### 3.4 No layout jumps (CLS ≈ 0)

- Every image keeps width and height (`image` snippet already does this).
- **Font fallbacks with matched metrics:** declare local fallback faces (Georgia for Cormorant, Arial for Jost)
  with `size-adjust`/`ascent-override` tuned so swapping fonts doesn't move text.
- `scrollbar-gutter: stable` on `html`, so locking scroll for drawers doesn't shift the page sideways.
- Reserve space for anything async: price, stock badges, review stars, cart count.

### 3.5 Feedback within 100ms (INP < 150ms)

- Every tappable element gets a press state (`scale(.97)` over `--dur-press`). Most have it; add it to the rest via
  a shared `.tap` rule.
- Network actions are **optimistic**: the UI changes at once (button → "Added ✓", count bumps), and the request
  confirms or rolls back.
- No long tasks on interaction. Heavy work (parsing section HTML, filtering) is split with `scheduler.yield()`
  where supported.

### 3.6 Images that feel light

- Photos fade in on arrival (live); the LCP photo is never held back.
- Correct `sizes` everywhere so phones never download desktop images. Audit each new section.
- Product galleries: eager-load only the first image; preload the next one when a swipe starts.
- Keep Shopify CDN `image_url` widths to our ladder (240 → 2400) so the CDN cache stays warm.

### 3.7 Lite mode (low-end devices and data saver)

`theme.js` adds `html.lite` when `navigator.connection.saveData` is on, `deviceMemory` ≤ 2, or the network is 2G.
Lite mode:
- stops the decorative loops (floating flowers), the hero slideshow autoplay and the story video autoplay;
- skips photo fade-ins;
- keeps every tap and drawer animation, because those are feedback, not decoration.

### 3.8 Reduced motion

Unchanged and global: everything static, arrivals show immediately, page transitions instant. Every new pattern
in section 4 states its reduced-motion behaviour.

---

## 4. Shared interaction patterns (for the pages we add)

Each pattern is built once, as a snippet or a small module in `theme.js`, and reused.

| Pattern | Behaviour | Duration | Reduced motion |
|---|---|---|---|
| **Drawer** (menu, cart, filters) | Slides from its edge; backdrop fades; swipe to close (menu has this); focus trapped; returns focus | 320ms in, 220ms out | Appears/disappears |
| **Swap** (price, stock, variant image, subtotal) | Old value fades and lifts out 4px; new fades in | 200ms | Instant swap |
| **Collapse** (accordion, cart line removal) | Height animates (`::details-content` or `grid-template-rows: 0fr → 1fr`); content fades | 320ms | Instant |
| **Count change** (cart badge, quantity) | Digit rolls up; badge does one spring bump (exists) | 300ms | Instant |
| **Add to cart** | Button → "Adding…" → "Added ✓" (width locked, no jump); cart count bumps; cart drawer slides in | ≈ 600ms total | No movement, text only |
| **Grid reflow** (filter, sort, load more) | Same-document View Transition: cards that stay glide to their new spot; new ones settle in; removed ones fade | 320ms | Instant |
| **Gallery** | Phones: native swipe with dots (as the hero). Desktop: thumbnails cross-fade the main photo; click opens a lightbox that morphs from the photo | 320ms | Instant |
| **Sticky buy bar** (phones, product page) | Slides up from the bottom once the main button scrolls out of view; hides near the footer | 320ms | Appears |
| **Progress** (free-shipping bar) | Bar fills as a stitched line growing | 600ms | Static |
| **Loading** | No spinners on page loads (prerender covers it). Inline actions show the button text state. Search results fade in. Blush placeholders, no shimmer | — | — |
| **Toast/status** | Small pill rises from the bottom, stays 3s, can be dismissed, announced via `role="status"` | 320ms | Appears |

---

## 5. Page by page

### Home (now)
- Migrate to `data-arrive` (no visual change).
- Shared-element morph from Bestsellers and craft circles to their pages, once those pages exist.
- Lite mode for the flowers and slideshow.

### Collection page
- Header: title arrives with the ink rise; the craft photo morphs in from the tile tapped on home.
- Filters and sort: a drawer on phones, a sticky bar on desktop. Results update with the **Section Rendering API**
  (no page reload) and a **grid reflow** transition. The URL updates so back/forward and sharing work.
- **"Load more"** button, not infinite scroll (better for SEO, the footer and focus); new cards stagger in.
- Cards: hover second photo (desktop only). Built 2026-10-02 as a calm crossfade after Raushan found the first version fast and bouncy:
  - the second photo fades in over 700ms after a 120ms pause (so sweeping the pointer across the grid doesn't flicker)
  - both photos drift to 2% bigger over 1.4s
  - everything uses `--ease-in-out`, and leaving eases back over about 450ms
  - never use a spring or a fast ease-out here
- Optional **quick add** that opens a small variant sheet (later, with the cart drawer).

### Product page
- Gallery pattern (swipe on phones, thumbnails and lightbox on desktop); the first photo morphs from the card tapped.
- Variant changes: **swap** price, stock and photo; the URL updates; no reload.
- **Add to cart** pattern → cart drawer. **Sticky buy bar** on phones.
- Details (care, shipping, gift note) as **collapse** accordions; reviews and recommendations arrive with stagger.

### Cart drawer and cart page
- Drawer pattern. Line items: quantity **count change**, removal **collapse**, subtotal **swap**.
- Free-shipping **progress** (stitched line).
- Gift note field expands smoothly. Checkout button always visible at the bottom of the drawer.

### Search
- Predictive search in the header: results panel drops in (`--dur-panel`); results update as you type (debounced
  150ms, stale requests cancelled); product photos fade in.
- Results page reuses the collection grid and its reflow.

### Content pages, blog, 404
- `data-arrive="lines"` for headings and text; photos settle. Nothing else; reading pages stay quiet.

### Checkout
- Shopify-controlled. Only branding (colours, fonts, logo) via checkout settings; no custom motion.

---

## 6. Budgets and gates (checked before every merge)

| Budget | Limit |
|---|---|
| LCP (mid Android, 4G) | < 2.0s (CWV "good" is 2.5s) |
| INP | < 150ms (good is 200ms) |
| CLS | < 0.05 (good is 0.1) |
| Slow frames while scrolling (4x CPU) | 0 |
| `theme.js` | < 25 KB raw; per-page modules loaded only where used |
| CSS on any page | < 60 KB raw |
| Third-party apps | Each one justified in decisions.md, loaded deferred or on interaction |
| Arrival durations | Everything in view settled within 700ms of landing on a screen; stagger ≤ 4 steps (fluid-feel-plan.md) |
| Loops on screen | ≤ 1 decorative loop per screen |

**Test harness, moved into the repo** (`tools/`, run with `npm run check`):
- `check-jank`: frame times during a scroll, phone and desktop, 4x throttle.
- `check-lcp`: LCP element and time.
- `check-arrivals`: nothing left hidden after scrolling; order of arrivals; hovers still work after arrival.
- `check-a11y`: axe on phone and desktop.
- **Cross-engine:** Chromium, WebKit (iPhone), Firefox via Playwright (all installed); reduced-motion pass.
- **Before launch:** PageSpeed Insights on the preview URL; Raushan's iPhone plus one budget Android for feel;
  after launch, real-user CWV from Shopify's Web Performance dashboard.

---

## 6b. Phase 0 results (2026-10-02)

- **`data-arrive` API live:** home sections migrated (no visual change). Section-specific touches (craft ring,
  promise icons, footer rule) moved into their sections. `window.ybArrive(el)` is ready for injected content, and
  theme-editor re-renders are rescanned.
- **Tokens:** `--stagger` (90ms), `--rise` (24px) and `--ease-exit` added and used by the arrivals.
- **Fonts:** metric-matched fallbacks ("Cormorant Fallback" on Georgia Italic at 79.82%; "Jost Fallback" on Arial at
  96.39%; values measured from the font files). The font-swap layout shift with fonts delayed 1.5s went from 0.0017 to 0.
- **Lite mode:** decided before first paint (data saver, 2G, ≤ 2 GB memory). It skips the floating flowers, the logo
  intro, the photo fade-ins, the hero autoplay and the story video autoplay (the play buttons still work).
- **Hero on phones loads one photo ahead** instead of all four: about 216 KB less on first load (phone images
  880 → 664 KB). Verified in Pixel 7 and iPhone WebKit: the next photo is always ready before the swipe.
- **Firefox gets a prefetch** when the pointer rests on a link (80ms) or a finger lands on it. Chrome and Edge keep the
  hover prerender. Safari supports neither (skipped).
- **`scrollbar-gutter: stable`**, a shared `.tap` press, and a press on the FAQ toggle.
- **`npm run check`** (`tools/check.mjs`, Playwright 1.63 + axe-core 4.10.2, dev-only, outside `theme/`): 25 checks
  across Chrome desktop and phone, iPhone WebKit and Firefox. Covers arrivals, photos, sideways scroll, JS errors,
  slow frames at 4x CPU, LCP, phone image weight, our JS size, axe on phone and desktop, reduced motion and lite
  mode. First run: **25/25**. LCP 804ms on the hero photo, 0 slow frames, axe 0, theme.js 14.3 KB.

## 7. Allowed non-GPU animations (kept small on purpose)

| What | Property | Why it's fine |
|---|---|---|
| Ink-rise headings | `clip-path` | One heading at a time, under 1s |
| Craft ring opening | `outline-offset` | Small elements, hover or arrival only |
| Stitches sewing in, story strand | SVG stroke | One element in view at a time |
| Accordions, cart line removal | height (`::details-content`, grid rows) | Content must reflow; brief |

Anything else that isn't GPU-friendly needs a decision entry.

---

## 8. What we will not do

- Smooth-scroll or scroll-jacking libraries (Lenis, Locomotive). They fight trackpads and accessibility and hurt INP.
- GSAP or animation frameworks: about 70 KB for things CSS and a few lines of JS already do.
- Parallax on text, cursor followers, magnetic buttons, confetti, animated gradients, page-load spinners, shimmer
  skeletons.
- Autoplaying video with sound; autoplay anywhere on phones (the hero is swipe-only there). **One exception**
  (Raushan, decisions.md 2026-10-02): the "Made by hand" clip plays muted and inline while at least half of it is on
  screen, fetched only when near, and never with reduced motion, lite mode or data saver (home-media-plan.md §4).
- Motion longer than 1s that blocks content (only the logo intro, once a day, skippable).

---

## 9. Phases

| Phase | What | When |
|---|---|---|
| **0. Foundations** ✅ done 2026-10-02 | Tokens completed (3.1), `data-arrive` API and home migration (3.2), prefetch on tap for Safari and Firefox (3.3), font metric fallbacks and scrollbar gutter (3.4), shared `.tap` (3.5), lite mode (3.7), test harness into `tools/` (6). | 1 session, after go |
| **1. Shared patterns** | Drawer, swap, collapse, count change, toast as reusable code (4), built against the existing menu drawer | With the first new page |
| **2. Collection page** | Section 5 plus grid reflow and load more | When we build it |
| **3. Product page** | Gallery, variants, add to cart, sticky buy bar, card → product morph | When we build it |
| **4. Cart** | Cart drawer and page, progress bar | With product page |
| **5. Search, content, 404** | Predictive search; quiet arrivals elsewhere | After cart |
| **6. Pre-launch pass** (before 30 Nov) | PageSpeed on the preview, real devices, app audit, bfcache check, analytics-with-prerender check | Week of 23 Nov |

---

## 10. Decisions (answered 2026-10-02: all recommendations accepted)

Kept for the record:

1. **Lite mode:** on low-end phones and data saver, stop the floating flowers and the hero autoplay. *Recommended: yes.*
2. **Shared-element morph** (card photo → product page photo): Chrome and Safari 18.2+ only; Firefox navigates
   normally. *Recommended: yes.*
3. **Quick add on collection cards:** faster buying, but one more thing on each card. *Recommended: yes, as a
   small "+" button on phones and a hover button on desktop; decide when we build the collection page.*
4. **Phase 0 go-ahead.** *Given; done.*
