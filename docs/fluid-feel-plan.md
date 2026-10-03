# Fluid feel plan: why the store feels heavy, and what to change

Status: **proposed 2026-10-04, waiting for Raushan's go.** Nothing in the theme has been changed yet.

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
| When an arrival starts | 10% inside the screen | 15% before it enters the screen |
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
