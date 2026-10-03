# Fluid feel plan: why the store feels heavy, and what to change

Status: **Phases A and B done 2026-10-04** (Raushan's go: phase by phase, test, then push, without giving up the alive
feel, smoothness or accessibility). **Phase C: the switch is built, the decision waits for Raushan's comparison.**
**Phase D: the CSS split is measured and dropped; the rest waits for the theme to be published.** Results are in section 6.

Raushan's report: the whole store feels heavy, even on the local server. Scrolling and clicking feel slow.
This plan is a tuning pass on `docs/motion-plan.md`, not a replacement. The motion plan's principles stand
("fast first, then smooth"; "never a wait in front of content"); several of its own budgets are not being met.

---

## 1. What was measured (local dev server, 2026-10-04)

| Check | Result | Verdict |
|---|---|---|
| Wait before a page starts arriving (`localhost:9292`) | 0.75–1.05s on every page | Slow, mostly the dev setup |
| Shopify's own share of that wait (its `server-timing` header) | about 0.14s | Fine |
| Cart and search requests through the local server | about 0.5s each | Slow, dev setup |
| Tap on a link → next page painted (phone and desktop, no hover) | about 0.9s | Slow, same cause |
| After a scroll stops, time until everything on screen has finished arriving (home, phone) | 1.1–1.6s per screen | **Over our own 1s budget** |
| Main-thread frame rate while scrolling (warm) | steady 60fps | Fine |
| Main-thread blocking at load, 4x slower CPU | 152ms in total | Fine |
| Tap handling at 4x slower CPU (menu button) | 80ms | Fine (budget 150ms) |
| Our own JavaScript | about 61 KB raw across six files | Fine |
| Our compiled section CSS (`compiled_assets/styles.css`) | 175 KB raw on every page | **Over the 60 KB budget** |
| Elements with a backdrop blur on the home page | 11 | Not measured, see below |

Not measured: GPU cost. The tests ran in headless Chrome, which cannot show what the header blur and the other
blurred elements cost on a real phone or a Retina screen. That needs a real-device check (Phase C).

---

## 2. Will the live site fix it?

Partly.

- **The server wait should shrink.** Shopify renders the page in about 0.14s; the rest of the 0.75–1.05s is the
  `shopify theme dev` proxy and the trip to Shopify and back for a development theme. The password page on the
  same store answered in 0.19–0.33s when timed directly (0.84s at worst). A published theme should be in that
  range, but this is an estimate until the theme is published and timed.
- **The shared preview link is slow for the same reason** as the local server: development and unpublished
  themes are rendered fresh on every request.
- **The motion will not change.** The 1.1–1.6s of arriving content, the page cross-fade and the header behaviour
  are in our code, so they feel the same on yarnbasket.in.
- **Real shoppers are worse off than this Mac.** A mid-range Android on 4G has a slower network and GPU.

---

## 3. Causes in our code, in order of how much they are felt

1. **Arrivals take too long and start too late.**
   - Each item animates for 800–1000ms, and siblings start 90ms apart for up to six steps, so a row of cards
     settles about 1.3–1.5s after it appears.
   - They only start once the item is already 10% inside the screen (`rootMargin: -10%` in `theme.js`), so a
     normal scroll shows blank space first, then content rising into it.
2. **Taps on links get no answer for up to a second.**
   - Chrome's hover prerender only helps with a mouse. On phones it starts at touch, so there is no head start.
   - Safari gets no prefetch at all.
   - Nothing on screen changes until the next page arrives, then a 260ms cross-fade plays on top.
3. **The header reacts to every small scroll.** It hides or returns after only 6px of travel in either
   direction, sliding for 320ms each time, so a small reverse scroll covers content.
4. **Photos still loading fade in over 700ms.**
5. **Blur.** The sticky header blurs whatever scrolls under it (14px), and ten more elements on the home page
   use a blur. Cost unknown until tested on a device.

Checked and not a cause: our JavaScript, long tasks, tap handling, DOM size (1,351 elements on home).

Correction to the first diagnosis: the cart is mostly fine already. "Add to cart" changes to "Adding…" at once
and quantity taps update at once; only the toast and count wait for the server. No optimistic rewrite is needed.

---

## 4. The plan

### Phase A: timing pass (small, CSS tokens and two numbers in `theme.js`)

| Change | Now | Proposed |
|---|---|---|
| Arrival duration | 800ms (photos 1000ms) | 450ms (photos 500ms) |
| Stagger between siblings | 90ms, up to 6 steps | 50ms, up to 4 steps |
| Rise distance | 24px | 12px |
| When an arrival starts | 10% inside the screen | As its first pixel enters the screen (not earlier, so a slow scroller still sees it) |
| Ink-rise headings | 900ms | 600ms |
| Photo fade-in | 700ms | 250ms |
| Page cross-fade | 260ms | 150ms |
| Header returns on scroll up | after 6px | after about 48px of upward travel |

Target: everything on screen settled within 700ms of a scroll stopping (today 1.1–1.6s). The choreography
stays (lines in turn, photos settle, stitches sew, stars pop); it just finishes sooner.

Left alone on purpose: the logo intro, the "One stitch at a time" hook writing, the hero slideshow, the product
card hover crossfade, drawers and accordions (320ms is right for those).

### Phase B: an answer to every tap

- A pressed state on every link that leads to a page (cards, craft circles, nav), using the existing `.tap`.
- Phones: start fetching a page when its card or link has been on screen for a moment, capped at a few links,
  never in lite mode or data saver. Needs a check that the live theme's pages can be cached by the browser.
- Decision needed: a thin progress line under the header if a page takes longer than about 300ms. The motion
  plan says "no spinners on page loads" on the assumption that prerender covers it; on phones and Safari it
  does not.

### Phase C: blur, decided on a real device

- Compare the home page with and without blur on Raushan's phone and one budget Android.
- If scrolling is visibly smoother without it: the header becomes a near-solid Blush Soft (about 96%) and the
  small blurred chips become solid. If there is no visible difference, the blur stays.

### Phase D: after the theme is published

- Time real pages on yarnbasket.in and run PageSpeed Insights (already in motion-plan Phase 6).
- Section CSS: 175 KB raw on every page against a 60 KB budget. Move the large page-specific styles (cart,
  account, search) into asset files loaded only on those pages. Not felt on a fast device, so it waits.
- Shopify's own scripts (analytics, checkout preload, the `<shopify-account>` sign-in component) are several
  times larger than ours. They are the platform's; revisit only if PageSpeed flags them.

### Gate

Add one check to `npm run check`: after jumping to each screen of the home page, everything visible has finished
arriving within 700ms. This would have caught the problem.

---

## 5. Decisions needed from Raushan

1. **Phase A go-ahead.** It shortens motion that was asked for on 2026-10-02 ("fluid, animated, smooth and
   alive"). Recommended: yes; the same motion, about twice as quick.
2. **Progress line for slow page loads** (Phase B). Recommended: yes, shown only after 300ms.
3. **Blur** (Phase C): decide after the device comparison.

---

## 6. Results

### Phase A (2026-10-04)

- Built as in the table in section 4, with two additions in the same spirit: stitches sew in 900ms (was 1400ms),
  and review stars and promise icons pop sooner.
- Home page on a phone, time until nothing in view is still moving after a scroll stops: 1.1–1.6s before,
  0.7–1.0s after. The longest part left is the stitched border sewing, which hides nothing.
- New gate (check 1b): 700ms after landing on any screen, nothing in view is hidden or faded. Passes on desktop
  and phone.
- Header: stays hidden through a 40px wobble, returns after 60px up, returns near the top, and stays shown while
  focus is inside it.
- `npm run check`: 188/188 across Chrome desktop and phone, iPhone WebKit and Firefox. 0 slow frames at 4x CPU,
  axe 0, reduced motion still static.

### Phase B (2026-10-04)

- **The line:** a 3px Cocoa line across the top, 300ms after a tap on a link or a form that leaves the page. Not for
  links within the page, new-tab links, or taps a script handles (cart drawer, search). Gone on the new page and
  after Back.
- **Safari:** it freezes CSS animations once a page is on its way, so the line would have stayed at zero width.
  It now starts 30% across, so Safari shows a still line and other browsers a growing one.
- **Fetch-ahead on phones (Chrome):** links at least half on screen for 400ms are fetched, six a page at most.
  Locally the tapped page then starts arriving in 6ms instead of about 750ms; tap to painted went from about
  0.9s to 0.5s. Off in lite mode and with data saver.
- **Press states:** already on cards, craft circles, tiles, chips and buttons. iOS Safari only shows them when the
  page listens for touches, and nothing did in Safari; `page-turn.js` now does.
- **Not possible:** Safari has no way to fetch a page ahead, so on iPhones the line and the press state are the
  answer to a tap.
- **To check after publish:** that fetched-ahead pages are not counted as visits in Shopify analytics (the fetch
  runs no scripts, so they should not be).
- Check section 17 (six checks). `npm run check`: 194/194.

### Phase C (2026-10-04): switch built, decision open

- **The switch:** open any page with `?blur=off` and the blur is gone for the rest of that tab's visit; `?blur=on`
  brings it back. Without blur the header is Blush Soft at 96% (was 88% with a 14px blur) and the chips on photos
  are white at 96%.
- **Lite mode drops the blur for good** (data saver, 2G, phones with 2 GB or less): those are the phones a blur
  costs most on, and lite mode already skips decoration.
- **Raushan tests on a Galaxy S24 Ultra in Chrome.** That is a flagship: it shows whether the blur is worth its
  look, but it will probably scroll smoothly either way. Whether a budget Android stutters is still unmeasured.
- **Recommendation:** if the two look close to the same on the S24, remove the blur for everyone. It can only cost
  frames on cheaper phones, and at 88–94% opacity it shows very little.
- Check 6 (lite has no blurred element) and 6b (the switch).

### Phase D (2026-10-04): the CSS split is not worth doing

- The 175 KB figure is the local dev server's copy: uncompressed, with every comment ("GENERATED LOCALLY").
- Compressed it is about 29 KB (brotli) to 36 KB (gzip), fetched once and then cached; minified, about 23 KB.
- Parsing it takes 3.7ms on a phone at 4x slower CPU.
- Splitting it across some twenty files would save a few KB on a first visit and nothing felt, and would risk
  styles arriving late. **Dropped**, unless PageSpeed on the live site says otherwise.
- The motion plan's "CSS < 60 KB raw" budget measured the wrong thing; it is now 40 KB compressed.
- Still waiting for the theme to be published: real page timings on yarnbasket.in, PageSpeed, and the analytics
  check for fetched-ahead pages.
