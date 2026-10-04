# Offers plan: announcement bar and cart rewards

Status: **approved and built 2026-10-02** (O1–O10 as recommended). Stages R1–R4 and the automated part of R5 are done. R0 (the admin) is Raushan's: see `launch-checklist.md` "Offers". Everything stays hidden until Theme settings → Cart turns it on.

### As built (where it differs from the plan below)
- **2026-10-04, superseded in part by `docs/pricing-plan.md`:** free shipping is from ₹499 (fee ₹49), the gift from ₹799, and there are two money-off goals (₹50 from ₹999, ₹100 from ₹1,299). The rewards bar shows one goal at a time with ticks for what's earned, not two markers; "Small add-ons" shows in the drawer whenever a goal is ahead.
- **One line, decided for good:** see `decisions.md` 2026-10-02 (offers) for why one message beats several.
  - The standing line has two parts on phones and three from 768px: free shipping, COD, ships in 1–3 days, handmade in India, in that order of priority.
  - With no offer on, it's "Handmade in India · Ships in 1–3 days".
  - Max 2 dated message blocks; the first live one replaces the line. A message without a date stays until it's removed.
  - The old fixed "terms" block in `header-group.json` was removed, because it would have overridden the line forever.
  - The bar keeps only its ResizeObserver (for `--announce-h`). `[data-announce-track]` is still on the message, so check §10's "plain text" test holds.
- **Rewards** (`snippets/cart-rewards.liquid`, rendered by `cart-summary`):
  - States: ship / gift / ready / declined / done / charged.
  - The amounts show under the markers (O10). The first amount hides when the markers are closer than 20% of the bar.
  - In the drawer, "Small add-ons" sits on the amounts row, left of the first marker, so it costs no extra line. It only shows when that marker is past 40% of the bar, and it links to all products sorted by price.
  - A hidden sentence gives screen readers both amounts.
- **The bar's motion** is a CSS transition (600ms `--ease-out`). cart.js sets the old width for one frame after a refresh, and it's off under reduced motion and `html.lite`.
- **Spoken updates:** cart.js speaks a changed step after its own message, for example "…Subtotal ₹1,298. Free shipping unlocked · ₹201 more for a free gift". The pop-up gets the same rewards line.
- **cart.js budget:** it's at 21.9 of 22 KB. It only gained a `window.ybCart` hook, a `cart:rendered` event, the spoken step and the pop-up line, with no gift logic. **Any further cart.js work needs minifying or a split first.**
- **rewards.js** (3.4 KB):
  - It loads only when a gift product is set and its amount is above free shipping.
  - All changes go through `/cart/update.js` keyed by the gift's variant, with `_gift_declined` as a hidden cart attribute.
  - Its click handler runs in the capture phase, so the drawer's "leave via Back" link handling never sees "Add it".
  - **Charged-gift guard:** if the gift arrives still charged (the discount is missing), it's taken straight out, a console warning is logged, and it isn't auto-added again on that page. The cart line shows the badge and "Free" only when the line really is ₹0.
- **No JavaScript:** "Add it" is a link to `/cart/add?id=…&quantity=1`, which Shopify adds and returns to /cart. The gift's remove button submits the cart form with that line at 0.
- **Product page** (`snippets/offer-terms.liquid`, agreed with session 63 as the one trust row for the coming product page):
  - a 2 × 2 grid (two rows at most), 13px
  - "Replacement if damaged", linked to the refund policy once it exists, instead of "Easy returns"
  - new icons: `cash`, `replace`
- **Little extras:** pieces that would reach the next step come first, and the gift is never suggested. The heading text stays generic, because the section isn't redrawn as the cart changes and a "₹151 more…" line would go stale.
- **FAQ:** a new "Shipping and offers" block whose answer (and FAQPage JSON-LD) is written from the settings and hides while nothing is on. It's added to the home FAQ.
- **The fee line (O8):** "Taxes included. Shipping ₹79." below the amount, "Taxes included. Free shipping." from it. It stays "calculated at checkout" while the fee is 0.
- **Tests:**
  - `npm run check` section 11: the bar is one line at 360, there's no bar on /cart, the product terms are ≤ 2 rows, and axe passes on the cart with rewards.
  - Admin drift: Shopify's real Delhi rates against the theme amounts and fee, and the gift arriving free. These skip while the offers are off.
  - Section 8's cart-page axe check now waits for the cart to settle.
  - Results with test values on (₹999 / ₹79 / ₹1,499, the ₹249 keychain as a stand-in gift): every state works and axe is 0. The two admin checks fail correctly: the rates are ₹379 at every total, and there's no gift discount yet.
  - With the real settings (all off): 73/73 quick.
- **Not testable until R0:** the gift's "done" look (badge, "Free ~~₹149~~"), because it needs the real discount.

Original plan below, kept as written.

This plan covers two connected things:
- **the announcement bar:** what goes in it, and how it stays one quiet line as offers grow
- **cart rewards:** a two-step progress bar (free shipping, then a free gift)

They're one plan because they say the same things (free shipping, COD, gifts). If they're built separately, the numbers end up in five places and drift apart.

It builds on `cart-plan.md` (D4: the one-step free-shipping line is already built and hidden at ₹0), `motion-plan.md` (the "progress" pattern), `home-hero-plan.md` §4 (the trust bar) and the "Announcement bar: off by default" entry in `decisions.md`.

---

## 1. The short answer

**Announcement bar: keep it, but cap it at one line forever.**
- It never gets a second message, arrows or rotation. Today's 3-message carousel goes.
- Its one line is built from Theme settings, so it can't disagree with the cart: for example "Free shipping over ₹999 · Cash on delivery".
- A dated message (a Diwali cut-off, a sale) replaces that line until its "Show until" date, then the normal line comes back.
- Every other message moves to the place where the shopper decides: the product page's buy box, the add-to-cart pop-up and the cart.

**Cart rewards: yes, build it, but swap the order.**
- **Free shipping comes first, at the lower amount; the free gift comes second, at the higher one.**
- Provisional amounts are **₹999 and ₹1,499**, to be checked against real order values from Meesho (§7).
- Use one bar with two markers and one line of text, not two bars.
- It's built in the theme with Shopify's own discounts. No app, so there's no extra script on every page and no monthly fee.

---

## 2. What the research says

| Finding | Source | What it means for us |
|---|---|---|
| Unexpected extra costs (shipping, fees) are the top fixable reason for leaving a cart: 48% of abandonments in Baymard's 2026 data | Baymard, eMarketer | Say what shipping costs early and plainly. Free shipping is the reward people care about most, so it should be the first and easiest step |
| **27% of test users missed free-shipping info that was only in a site-wide banner,** even when they read the product page carefully. 32% of sites put it only there | Baymard, "Free shipping should not only be in a site-wide banner" | The bar can't be the only place, so it doesn't need to carry everything. Put the shipping terms near the Add to cart button |
| Content that moves on its own for more than 5 s needs a pause control (WCAG 2.2.2). Auto-rotating banners take control away from readers | WCAG 2.2, UX research on carousels | No rotation. More messages would mean arrows, which is clutter. One line removes the problem |
| Banner blindness: people skip anything that looks like an ad strip | Baymard, Conversion Bible | The bar works best when it's calm and part of the design, which is what we have. A louder bar would get ignored more, not less |
| A free-shipping threshold works best at about **15–30% above the current average order value** | Several vendor guides (directional, not peer-reviewed) | Base the amounts on real order values, not round numbers |
| A live "₹X away" line with a bar converts better than a fixed "Free shipping over ₹X" | Vendor studies (directional) | Worth building. We'll measure it ourselves (§8) instead of trusting their uplift numbers |
| In India, about 60% of D2C orders are COD. COD parcels come back (RTO) about 24% of the time, against about 3% for prepaid. A flat ₹50–100 prepaid discount converts better than a percentage | Razorpay, Indian logistics blogs | COD has to be visible: people look for it before they trust a new shop. A prepaid nudge belongs at checkout, not as a third step on our bar |
| **Shopify never adds the free "get" item to the cart by itself.** Buy X Get Y does support "customer spends a minimum amount" | Shopify Help Center, Buy X Get Y | Our theme has to add and remove the gift itself (§5.3) |
| Shopify Functions in a custom app need Shopify Plus | Shopify developer forum | A custom discount app isn't an option. Native discounts plus theme code is |
| Shopify's "based on order price" shipping rates use the total **after** discounts | Shopify community, shipping guides | Our bar has to use the discounted total (`cart.total_price`), which it already does |

### 2.1 Reference: Floreal's cart drawer (floreal.in, checked 2026-10-02 at 360 × 800)
Raushan shared it as a reference. It's a similar handmade-flowers shop, so this is mood only, not a copy.

**Their setup:**
- a free surprise gift from ₹1,199, then free shipping from ₹1,999 (gift first)
- a two-marker bar with icons
- a label above each marker and its amount below
- a "Congrats!" headline
- a rotating promo strip with arrows inside the drawer
- a Shiprocket "Buy now" checkout

**Worth taking:**
- **Two markers on one bar with icons:** it reads at a glance. We already planned this.
- **Each step's amount next to its marker.** Our plan only had amounts in the text. Floreal shows that a small amount under each marker (12px, one line) makes the two-step structure clear without reading. **Added to §5.2 as O10.**

**Worth avoiding:**
- **The space it takes.** The rotating strip, the "Congrats" headline, the labels above and the amounts below take about 340px of an 800px screen before the first product. Only about 2 items show. Ours stays in the footer at about 60px.
- **Saying the same thing twice.** The rotating strip repeats the gift offer the bar already shows, and it rotates, which is the announcement-bar problem again inside the cart.
- **Gift first, with free shipping at ₹1,999.** It works for them because their discounted prices are high (₹899–1,299 a line), so a typical cart lands between the two steps. For us, shipping is what makes people leave (Baymard), and our small items are ₹249–449. A free-shipping step at ₹1,999 would mean 5+ keychains. We keep shipping first, unless the Meesho order values say otherwise (§7).
- **Heavy strike-through prices** ("Rs. 5,197" crossed out, "Discount −₹2,100"). It's the discount-shop look we decided against ("calm, honest").
- **"Rs. 1,199.00"** with decimals. Ours will show ₹1,199 once the money format is changed (cart-plan.md).

---

## 3. Where each message lives

The rule: **say it where the decision happens.** Every message gets at most two homes, and the bar holds one line.

| Message | Announcement bar | Product buy box | Add-to-cart pop-up | Cart (drawer + page) | Home (promise / FAQ) | Footer |
|---|---|---|---|---|---|---|
| Free shipping over ₹999 | ✓ (the standing line) | ✓ | ✓ as "₹X away" | ✓ the progress bar | FAQ | — |
| Cash on delivery (+ any fee) | ✓ (the standing line) | ✓ | — | payment icons (page) | FAQ | — |
| Free gift over ₹1,499 | — | — | — | ✓ the progress bar | FAQ | — |
| Ships in 1–3 days | — | ✓ | — | ✓ (already there) | promise | — |
| Handmade in India | only until shipping and COD are live | — | — | — | hero, story | ✓ |
| Easy returns | — | ✓ as a link | — | — | promise, FAQ | ✓ policy link |
| Dated news (Diwali cut-off, sale) | ✓ replaces the standing line until its date | — | — | — | — | — |

The free gift stays out of the bar on purpose. It's a reason to add one more thing, so it lives where adding happens.

---

## 4. Announcement bar

### 4.1 What changes
- **One message, always.** Drop the carousel: no arrows, no swipe track, no JavaScript (about 1 KB less on every page).
- **The standing line is built from settings,** in this order:
  1. "Free shipping over ₹{threshold}" if the free-shipping amount is set
  2. "Cash on delivery" if the new COD setting is on
  3. "Ships in 1–3 days" if only one of the above is set
  4. today's "Handmade in India · Ships in 1–3 days" if none are
  
  Two parts at most, joined with " · ". It never shows more than two.
- **Dated messages** stay as blocks with "Show until". While one is live, it replaces the standing line; with two live, the first wins. Max 2 blocks.
- **A length guard.** The schema info says "about 40 characters". `npm run check` fails if the bar wraps to two lines at 360px.
- **Hidden on `/cart`,** where the progress bar already says it with real numbers. Shown everywhere else.
- **It looks the same as now:** Blush, Cocoa Deep text, a hairline, about 33px tall, and it scrolls away while the header stays sticky. (The optional slightly deeper tint from our header chat is decision O2.)

### 4.2 What it looks like at 360px
```
┌────────────────────────────────────┐
│ 🚚 Free shipping over ₹999 · COD    │ ← one line, 13px, never moves
├────────────────────────────────────┤
│ ☰        Yarn Basket       🔍  🛒² │
```
During a dated message:
```
│ 🎁 Order by 26 Oct for Diwali delivery │
```

### 4.3 Accessibility
- An `<aside>` with a label ("Store information"). The text is static and optionally a link.
- Nothing moves and nothing needs pausing, so it meets 2.2.2 by design.
- Screen readers skip the " · " (already done) and read a comma instead.

---

## 5. Cart rewards (two steps)

### 5.1 Settings (Theme settings → Cart)
| Setting | Exists? | Notes |
|---|---|---|
| Free shipping from (₹) | yes | 0 hides it |
| Free gift from (₹) | new | 0 hides it. Must be higher than free shipping, or the theme ignores it and shows a warning in the editor |
| Free gift product | new | product picker. When it's sold out, the gift step hides itself |
| Cash on delivery available | new | feeds the announcement bar and the buy box |
| Standard shipping fee (₹) | new, optional | lets the cart say "Shipping ₹79" below the threshold (O8) |

Max two steps. A third step (for example "10% off over ₹2,499") makes the bar a game and the cart busy. If you ever want one, it replaces the gift step.

### 5.2 Layout (drawer footer and cart page summary, 360px)
```
├────────────────────────────────────┤
│ Add ₹151 more for free shipping    │ ← the line that matters (14px)
│ ━━━━━━━━━━━━━━━━━━━━━━━🚚───────🎁 │ ← 4px bar; markers at 67% and 100%
│                        ₹999  ₹1,499│ ← 12px amounts under the markers (O10)
│                                    │
│ Subtotal                    ₹848   │
│ Taxes included. Shipping ₹79       │
│ ┌────────────────────────────────┐ │
│ │          Checkout  🔒           │ │
```
- The markers are 16px line icons (truck, gift) placed by their share of the top amount: 999 ÷ 1,499 = 67%.
- The amounts are said in the text, not printed under the markers, so it stays one line of words.
- It adds about 34px to today's free-shipping line (18px for the markers, 16px for the amounts); the drawer footer goes from about 170px to about 205px. Floreal's version takes about 340px.

### 5.3 States
| Cart total | Text | Bar |
|---|---|---|
| Empty cart | hidden | hidden |
| Under ₹999 | "Add ₹151 more for free shipping" | Cocoa fill; both markers outlined |
| ₹999 – ₹1,498 | "Free shipping unlocked · ₹350 more for a free gift" | the truck marker turns Sage |
| ₹1,499 and up | "Free shipping and a free mini heart are yours" | full, Sage; both markers filled |
| Gift sold out | single-step text, as built today | gift marker hidden |
| Drops back below a step | the text for the new state; a spoken line says what changed (§5.6) | the bar shrinks |

### 5.4 How the free gift works
**What we build:**
- The gift is a **real product with its real price** (say ₹149), stock tracked, kept out of collections and search.
- An **automatic Buy X Get Y discount** makes it free: customer spends ₹1,499 on the "Shop" collection (every product except the gift) and gets 1 gift at 100% off, once per order.
- **The theme adds the gift** (`cart.js`, after any cart change) when the total crosses ₹1,499, and removes it when the total drops below.
- **"No thanks" is respected.** If the shopper removes the gift, a hidden cart attribute (`_gift_declined`) remembers it and we don't add it again. The progress line then says "Free gift available · Add it back".
- **The gift line is plain:**
  - a "Free gift" badge
  - the price as "Free" with "₹149" struck through ("worth ₹149" for screen readers)
  - no quantity stepper, only a remove (bin) button

**Why this way, and what fails safely:**
- If the discount ever stops applying (someone edits it in the admin), the gift shows at full price in the cart. The shopper sees it before paying, and we never give stock away by accident.
- A ₹0 gift product would be simpler, but anyone could add it to any cart through `/cart/add.js`. Blocking that needs a checkout validation Function, which needs Plus.
- A gift app (BOGOS, EasyGift and similar) costs ₹800–2,000 a month and adds 30–100 KB of script to every page, which threatens our LCP and INP gates.

**Known gap:** "Buy it now" skips the cart, so a shopper using it doesn't get the gift. Only orders of ₹1,499 or more are affected (one product today). The gift step's text appears in the cart, not on the product page, so nobody is promised a gift they then don't get. We accept this gap.

### 5.5 How free shipping works
- **In the admin, Settings → Shipping and delivery, zone India:**
  - "Standard": ₹79 (or the real fee), condition: order price ₹0 – ₹998.99
  - "Free shipping": ₹0, condition: order price ₹999 and up
- Shopify uses the total **after discounts**, and so does our bar (`cart.total_price`), so they always agree.
- The gift is ₹0 after its discount, so it never pushes an order over the free-shipping line.
- **COD fee:** if partial COD or a COD fee comes with the gateway, it's a payment fee shown at checkout, not shipping. "Free shipping" stays true, and the FAQ explains the fee.

### 5.6 Speech, focus and accessibility
- **The text is the truth.** The bar is decoration (`aria-hidden`, as now). Contrast is checked on both the Cocoa and Sage fills against the track.
- **Changes are spoken only when a step changes,** through the drawer's existing status line, after the subtotal:
  - "Free shipping unlocked."
  - "Free gift added: mini heart."
  - "Your total is under ₹1,499 now, so the free gift was removed."
  
  Losing a reward is announced as clearly as winning it.
- **Focus never moves** when the gift is added or removed. If focus was on a + button, it stays there.
- **Tap targets:** "Add it back" and the gift's remove button are 48px.
- **Forced colours:** the bar keeps a border, and the markers stay as icons with names.
- **Reduced motion:** the bar jumps to its new width.
- **Without JavaScript** the text and bar are rendered by the server. The gift isn't added automatically; the line says "Add your free gift" with a plain form button.

### 5.7 Motion (from motion-plan.md "Progress")
- The fill grows over 600ms with `--ease-out`.
- A marker that's reached turns Sage with a 200ms fade.
- The gift line arrives like any other line.
- No confetti, no shake, no sound, no counting-up numbers, matching the "calm" motion rule.

### 5.8 Copy (en.default.json)
| Key | Text |
|---|---|
| `rewards.ship_away` | Add {{ amount }} more for free shipping |
| `rewards.ship_done_gift_away` | Free shipping unlocked · {{ amount }} more for a free gift |
| `rewards.all_done` | Free shipping and a free {{ gift }} are yours |
| `rewards.gift_declined` | Free gift available · Add it back |
| `rewards.gift_badge` | Free gift |
| `rewards.spoken_gift_removed` | Your total is under {{ amount }} now, so the free gift was removed |

There's no "Hurry!", no exclamation marks and no countdowns.

---

## 6. Messages in context (outside the bar)

1. **Product page buy box,** under Add to cart, as one muted row with icons, every part from settings:
   ```
   🚚 Free shipping over ₹999 · 💵 COD available · 📦 Ships in 1–3 days
   ```
   It wraps to two lines at 360px if needed, never three. "Easy returns" links to the policy. This is Baymard's "near, but not in, the buy section".
2. **Add-to-cart pop-up:** one muted line under the product name: "₹151 away from free shipping" or "Free shipping unlocked". It's the moment people decide whether to add more (O6).
3. **Gap fillers** (O7):
   - Cart page: "Little extras" is sorted so items close to the gap come first. For example, at ₹151 away a ₹249 keychain comes before a ₹649 pot.
   - Drawer: the progress line gets a quiet link, "Small add-ons from ₹249", to a "Little extras" collection sorted by price. There's no product row in the drawer.
4. **FAQ:** "Do you offer free shipping / COD / gifts?" answers that read the same settings, so the FAQ never goes stale.

---

## 7. The business side (Raushan's call)

**Which amounts.** Today's prices fall into three groups:

| Group | Prices | Under ₹999 / ₹1,499 |
|---|---|---|
| Keychains, charms, clips | ₹249 – ₹449 | 2–3 items reach free shipping; 4–5 reach the gift |
| Pots, headband | ₹449 – ₹649 | 2 items reach free shipping |
| Bouquets | ₹999 – ₹1,999 | one bouquet gets free shipping, and **one keychain more gets the gift** |

**Why ₹999 / ₹1,499 and not gift ₹999 / shipping ₹1,299:**
- With shipping at ₹1,299, a ₹1,299 Sunflower bouquet unlocks both steps at once, so the bar does nothing for our main product.
- With ₹999 / ₹1,499, a bouquet buyer is "₹200–500 away from a free gift". That gap fits a ₹249–449 keychain or charm exactly, which is the add-on we want.
- Shipping first because it's what makes people leave (§2). The gift is the "one more" nudge.

**Check before launch:** pull the average order value from Meesho (Payments or Orders report, last 3 months). If it's around ₹800, ₹999 is right (about 25% above). If it's ₹500, ₹699 may suit free shipping better.

**The gift itself:**
- It should be quick to make: under 15 minutes and ₹30–60 in materials. For example, a mini heart, a tiny flower clip, or a sticker with a thank-you card.
- It must be light enough that **the parcel stays in the same courier weight slab.** A gift that pushes a 480g parcel past 500g costs more in shipping than it's worth.
- Keep 30+ made before launch. The gift step hides itself at 0 stock.

**Tax:** ask the CA how to treat free gifts under GST. Input tax credit on goods given away free may need reversing (Section 17(5)(h)). Add this to the CA questions in `launch-checklist.md`.

**Terms:** one line in the Terms of service and FAQ: "Free gift while stocks last, one per order. If part of an order is refunded and it falls under ₹1,499, the gift is yours to keep." It's simple, and nobody has to post a gift back. (There are no change-of-mind returns, only refunds for damaged, wrong or missing items.)

**Prepaid nudge (separate):** a flat "₹50 off with UPI" belongs to the payment gateway decision and is shown at checkout. It isn't a third step on our bar.

---

## 8. Keeping numbers in sync, and measuring

**One source of truth:** the theme settings hold the amounts. The bar, buy box, pop-up, cart and FAQ all read them. The admin (shipping rates, discount) has to match by hand, so:
- **A drift check in `npm run check`:**
  1. fill a test cart just under and just over the threshold
  2. ask Shopify for rates (`/cart/prepare_shipping_rates.json` with a Delhi pincode, then `/cart/async_shipping_rates.json`)
  3. fail if a ₹0 rate is missing above, or present below
  
  The gift is checked the same way: over ₹1,499, the gift line's final price must be ₹0. (Whether those endpoints answer on our store gets checked in Stage R5.)
- **A checklist line** in `launch-checklist.md`: "Changing an amount? Change Theme settings, the shipping rate and the discount, then run the check."

**Measuring (4 weeks after launch, then adjust):**
- Average order value
- The share of orders under ₹999, between ₹999 and ₹1,498, and ₹1,499 and up (from Shopify Analytics → Orders, exported)
- Cart-to-checkout rate
- Clarity recordings of the drawer

Shopify has no built-in A/B testing, so we compare 4 weeks before and after any amount change. Never change two things at once.

---

## 9. Decisions for Raushan

| # | Question | Options | Recommendation |
|---|---|---|---|
| O1 | Announcement bar | (a) one line built from settings; dated news replaces it for a while (b) remove the bar completely (c) keep up to 3 with arrows | **(a).** COD and free shipping are what Indian shoppers look for before trusting a new shop, so one calm line earns its 33px. (b) hides that; (c) is the clutter you're worried about |
| O2 | Bar colour | (a) as now, Blush (b) a slightly deeper Blush so it reads as separate from the header | **(a) for now.** Look at it again once the real line ("Free shipping over ₹999 · COD") is in |
| O3 | Amounts and order | (a) free shipping ₹999, gift ₹1,499 (b) gift ₹999, free shipping ₹1,299 (yours) | **(a)**, confirmed against the Meesho average order value (§7) |
| O4 | Adding the gift | (a) added automatically, removable, with "Add it back" (b) a "Claim your free gift" button | **(a).** Nobody misses a reward they've earned, and removing it is one tap |
| O5 | Which gift | your pick (§7 constraints) | something under 15 min to make, light, same courier weight slab |
| O6 | "₹X away" in the add-to-cart pop-up | (a) yes, one muted line (b) no | ~~(a)~~ **Reversed to (b) on 2026-10-03** (`cart-compact-plan.md`): the line wrapped to five lines on phones |
| O7 | Gap fillers | (a) a link in the drawer + sorted Little extras on the page (b) a product row in the drawer (c) none | **(a).** It helps without crowding the drawer |
| O8 | Show the shipping fee below the threshold | (a) "Shipping ₹79" in the cart summary (b) "Shipping at checkout" (now) | **(a), if India has one flat fee.** Baymard: show the full cost before checkout |
| O9 | Hide the announcement bar on `/cart` | (a) yes (b) no | **(a).** The progress bar says the same thing with real numbers |
| O10 | Amounts under the markers (Floreal-style, §2.1) | (a) a 12px "₹999" / "₹1,499" under each marker (b) amounts only in the text line | **(a).** About 16px more, and the two steps read at a glance. No labels above the bar; the icons say which is which |

---

## 10. Stages

| Stage | What | Who | Done when |
|---|---|---|---|
| R0 | Meesho average order value; amounts; the gift product; shipping rates; the Buy X Get Y discount; CA question | Raushan (Claude writes the exact admin steps) | The admin matches §5.4–5.5 |
| R1 | Announcement bar: one line from settings, dated override, no carousel or JS, hidden on `/cart`, 360px one-line check | Claude | theme check clean; axe 0; the check fails on a two-line bar |
| R2 | Two-step progress bar in Liquid (works without JS), states, copy, motion, spoken step changes | Claude | `npm run check` covers every state in §5.3 at 360 and 1440; axe 0 |
| R3 | Gift add/remove in JS, `_gift_declined`, the gift line style. **Budget:** `cart.js` is at 21.2 of 22 KB, so this goes in a small `rewards.js` loaded only when a gift is set | Claude | tests: cross up, cross down, decline, add back, sold out, slow 3G, no layout shift |
| R4 | Buy box row, pop-up line, gap fillers, FAQ from settings | Claude | the same checks; the product page row is ≤ 2 lines at 360 |
| R5 | Drift check (§8), launch-checklist lines, Terms line | Claude + Raushan | the check passes against the real admin setup |
| — | Real-phone pass: Android + TalkBack, iPhone + VoiceOver | Raushan | no blockers |

**Files:**
- `sections/announcement-bar.liquid`, `sections/header-group.json`
- `snippets/cart-summary.liquid`, `snippets/cart-line.liquid`, the new `assets/rewards.js`, `assets/cart.js` (the pop-up line)
- `config/settings_schema.json`, `locales/en.default.json`
- `sections/product.liquid`, `sections/faq.liquid`, `tools/check.mjs`

The hero session also edits the announcement bar and `check.mjs`, and `en.default.json` is shared, so check ListAgents and claim those files before R1.

---

## Sources
- Baymard: [Free shipping should not only be in a site-wide banner](https://baymard.com/blog/avoid-banners-only-free-shipping), [Reduce cart abandonment](https://baymard.com/blog/reduce-cart-abandonment), [Checkout usability research](https://baymard.com/research/checkout-usability)
- eMarketer: [Extra costs are the No. 1 reason consumers abandon carts](https://www.emarketer.com/content/extra-costs-are-the-top-reason-consumers-abandon-online-carts)
- Shopify: [Buy X Get Y discounts](https://help.shopify.com/en/manual/discounts/discount-types/buy-x-get-y), [Functions in custom apps need Plus](https://community.shopify.dev/t/cart-transform-discount-functions-require-plus-for-custom-apps-but-not-public-apps-need-clarification-for-single-store-wholesale-pricing/25232), [Shipping rates calculated after discounts](https://community.shopify.com/c/shopify-discussions/calculating-shipping-rates-before-applying-discounts/td-p/1537656)
- Gift apps and why they're needed natively: [BOGOS guide](https://bogos.io/shopify-add-free-gift-to-cart/)
- Thresholds (directional): [GrowthSuite](https://www.growthsuite.net/resources/shopify-upsell-cross-sell/increase-average-order-value/free-shipping-threshold), [Ryder](https://www.ryder.com/en-us/insights/blogs/e-comm/free-shipping-threshold)
- Tiered bars (directional): [Rebuy tiered progress bar](https://help.rebuyengine.com/en/articles/6120478-tiered-progress-bar-and-the-smart-cart)
- Announcement bars: [Conversion Bible](https://theconversionbible.com/tactical-implementation-design/designing-effective-announcement-bars-and-banners-on-shopify-without-annoying-users)
- India COD and RTO: [Razorpay on COD](https://razorpay.com/blog/cash-on-delivery/), [Base: RTO rates in India](https://base.com/en-IN/blog/rto-rates-in-india/)
