# Account plan: sign-in, account menu, saved items, order tracking

Status: **Built 2026-10-02 (stages A0–A4).** Raushan chose every recommendation in §13 (AC1–AC9). Still to do: the admin steps in §11 (Raushan), a real sign-in to check the signed-in states, and real-phone VoiceOver/TalkBack.

### As built (where it differs from the plan below)
- **A0 result: we use Shopify's `<shopify-account>`.**
  - **Loading:** its script (`account.js`, about 10 KB compressed) is added by Shopify, `async`, with low priority. More code loads only when the sheet opens, so it doesn't delay the page.
  - **Keyboard:** the sheet is a modal `<dialog>` with a heading. Focus starts on its close button, Tab stays inside, and Esc closes it and returns focus to the account button.
  - **axe:** the only finding is a missing `title` on Shop's sign-in frame. That frame is refused on `127.0.0.1` (Shop only allows our own domains), so check it again on the preview link.
  - **Styling:** the sheet takes our colours, pill buttons and Jost. Its heading is Jost 500, because Cormorant at Shopify's fixed 18px read too small.
- **The sheet shows "Sign in with Shop" too.** Shopify includes it, so it appears for us after all (§3 guessed it wouldn't). Google will appear above the email field once it's connected in the admin (§11 step 2).
- **The account menu:** while the store has its password page on, Shopify's API is locked ("Online Store channel is locked"). So the component can't read `customer-account-main-menu`, falls back to Orders and Profile, and logs a warning on every page (the audit lists it). This stops at launch. Once Raushan creates that menu with Saved and Track an order (§11 step 5), those links appear in the sheet too.
- **Phones and small tablets:** the drawer's account row calls the component's own `showModal()`.
  - The header's button is hidden below 900px, so it's "summoned": present but invisible while the sheet is open.
  - When the sheet closes, focus goes to the menu button.
  - Checked in Chrome, Safari (WebKit) and Firefox.
  - Without the component (or JavaScript), the row is a link to the account.
- **Header:** the button shows from 900px, not 768px as planned (AC3): at 768–899px it brought the centred name within 8–30px of the search field. Until the component is ready, a plain link with the same glyph stands in at the same size and place, so nothing moves.
- **The Saved and Track pages show up once Raushan creates them** (§11 step 6, handles `saved` and `track-order`). Until then:
  - the drawer's Saved row and the pop-up's "View saved" are left out
  - Help → Track order still goes to the account
  - for previews and checks: `/pages/contact?view=saved` and `?view=track-order`
- **No "Account" theme setting:** the menu is always `customer-account-main-menu`, the one Shopify's account pages use too.
- **Hearts:**
  - on every product card (real products, not demo cards)
  - not in the search panel's picks: the panel's typed results have none, and it's for getting somewhere fast
  - `snippets/save-button`, beside the card's link
- **The Saved pop-up is its own snippet** (`snippets/saved-toast`), in the cart pop-up's look and place. Showing one hides the other.
- **A deleted product** comes back from Shopify as a 200 with an empty card, so it's recognised by its missing handle. It's dropped from the list, with "1 saved piece is no longer available."
- **Sizes:** theme.js didn't change. `saved.js` (every page) is 2.4 KB gzipped; `saved-page.js` (the Saved page only) is 3.1 KB.
- **Checks (2026-10-02):**
  - theme check clean
  - `npm run check:quick` 61/61, including 12 new account & saved checks:
    - heart + pop-up + reload
    - drawer row → sheet → Esc
    - Saved page draws the list (axe)
    - Remove + Undo
    - shared list + Save all
    - empty state (axe)
    - Track page (axe)
    - no script errors
  - Scratch scripts also checked:
    - Add to cart from Saved
    - "Ask us to make one" for sold-out pieces
    - Choose options for multi-option products
    - Recently viewed
    - the product page's Save
- **Not tested yet:**
  - **signed in** (needs a real sign-in): the drawer greeting and initial, the header avatar, and the Track page's latest-order card (`customer.last_order`)
  - Google sign-in (needs the admin setup)
  - real-phone VoiceOver/TalkBack and the iOS share sheet

Raushan's answers so far (2026-10-02):
- Shopify's current customer accounts, not classic.
- Sign-in with an email code, plus whatever is smoothest (this plan adds Google, §3).
- Saved items (wishlist), plus whatever else is best.
- Plan first, then wait.

It follows `brand-direction.md` (tokens, fonts, line icons), `motion-plan.md` (durations, easing, budgets), `nav-plan.md` (header and drawer layout), `cart-plan.md` (the added-to-cart pop-up, which saved items reuse), and the "products first, UX before looks" rule.

---

## 1. What exists today

- **Header, desktop (1100px and up):** an Account icon with a tooltip, linking to `routes.account_url` (`theme/sections/header.liquid:159`).
- **Phones and tablets:** Account is a row in the drawer's bottom list, under Search (`header.liquid:222`).
- **Help → Track order** links to `routes.account_url`.
- **No customer templates in the theme** (`templates/customers/` doesn't exist). With current customer accounts, Shopify hosts the sign-in, order and profile pages itself, so the theme doesn't need them.
- **Nothing for saving products:** no heart, no saved list, no recently viewed.

## 2. Goals

1. **Signing in takes one tap or one code.** No passwords, and never a form longer than one field.
2. **Nothing makes you sign in first.** Browsing, saving, cart and checkout all work as a guest. We offer sign-in only where it clearly helps (seeing your orders).
3. **Shoppers stay on the page they were on.** Signing in happens in a sheet over the page, not a trip to another site and back.
4. **One obvious place for "my stuff":** orders, profile, saved items and order help are all reached from the account button.
5. **Calm, not cluttered.** At most one new icon on any screen, and nothing new on the phone header.
6. **WCAG 2.2 AA, with 48px targets,** like the rest of the theme.
7. **No cost to page speed.** Nothing new loads before the page is drawn, theme.js doesn't grow (it has about 130 bytes left), and the new script is 3 KB gzipped at most.

---

## 3. Sign-in: what's possible and what we pick

Checked 2026-10-02 against Shopify's docs (links in §15).

| Method | On our plan? | Cost | Notes |
|---|---|---|---|
| **Email + 6-digit code** | Yes, built in | Free | The default. No password. Phones often offer the code from the email to autofill. |
| **Google** | Yes, built in since Aug 2025 | Free | Needs a one-time Google Cloud setup, about 20 minutes (§11). Shoppers are signed in with one tap, using an account they're already signed into on their phone. |
| **Facebook** | Yes, built in | Free | Possible, but few people use it to sign in now. A third button adds clutter. |
| **Shop app** | Only with Shop Pay | Free | Shop Pay needs Shopify Payments, which isn't offered in India, so this likely won't appear. Check in A0. |
| **Phone number + OTP (SMS or WhatsApp)** | **No** | Plus, about $2,300/month | Shopify has no SMS sign-in. Apps that add it (Simplify My Login, OTP+, FastPass) work with current accounts **only on Shopify Plus**, using Plus's own-identity-provider feature. Classic accounts, which non-Plus OTP apps rely on, were deprecated in Feb 2026 and can't be turned on any more. |

**Recommendation (AC1): email code + Google. Facebook stays off.**
- Google covers almost every Android phone in India (people are already signed in), so for most shoppers signing in is a single tap.
- The email code covers everyone else, including iPhone users who don't use Google.
- Two clear choices beat four.

**About phone numbers:** you're right that Indian shoppers expect them. The place it matters most is **checkout**: phone-based address autofill and COD checks. Indian checkout services do exactly this:
- Razorpay Magic Checkout
- GoKwik (KwikPass)
- Shiprocket Checkout

These tie in with the payment decision that's still open (Razorpay + partial COD, `decisions.md` "Still open"). So we pick phone-first checkout together with the payment gateway, not as an account feature.

What we can do now:
- **Ask for a phone number at checkout,** for delivery updates (Settings → Checkout → Customer contact).
- **Let people message us on WhatsApp** from any order (§7).

If the store moves to Plus later, phone OTP sign-in becomes an app install (L4 in §12).

---

## 4. The account button: Shopify's `<shopify-account>` component

**Shopify released a ready-made account button for themes in 2026** (`<shopify-account>`; since 30 July 2026 it's required in Theme Store themes). It shows an avatar, and tapping it opens a sheet over the page:
- **Signed out:** the sign-in choices (Google, then email code), an email-marketing opt-in, and the account menu links below.
- **Signed in:** the shopper's initial in a circle, and a sheet with the menu links (Orders, Profile, then ours) and Sign out.

**Why use it (AC2).** It does the hardest part, signing in without leaving the page, which our own code can't do with current accounts. Shopify also keeps it up to date with new sign-in methods.

What we control:
- **Colours, fonts, corner radius and avatar size,** through CSS variables (§9).
- **The signed-out avatar:** a slot, so we keep our own account glyph.
- **The menu links:** a store menu (`customer-account-main-menu`). We add "Saved" and "Track an order" there. The same menu feeds Shopify's hosted account pages, so the links match everywhere.

**What we can't control.** The sheet's layout and wording are Shopify's. Two things are checked before we commit, in stage A0:
- **Accessibility:** axe, keyboard and VoiceOver.
- **JavaScript cost:** the component's script must not delay the first paint.

**Fallback (if A0 fails).** We build our own small popover with plain links:
- "Sign in" goes to `routes.storefront_login_url`, Shopify's sign-in page, which includes Google and returns the shopper to the page they were on.
- Orders, Saved, Track and Sign out are plain links.

The fallback uses the native `popover` attribute: Esc, click-away and the top layer come built in, with no theme.js code.

### 4.1 Where it sits

| Width | Place | Why |
|---|---|---|
| **1100px and up** | In the header icon row, between search and Cart, where the Account icon is now | No layout change. |
| **768–1099px** | Also in the header (new at this size) | There's room between the search pill and Cart. Tablets lose a trip through the drawer. |
| **Under 768px** | In the drawer, as its first bottom row (§4.2) | The phone header can't fit a 4th icon at 360px with the name still centred: the name is about 140px, which leaves about 90px per side, and 2 icons need 96px. Ordering is done in the drawer anyway. |

### 4.2 Phone drawer

The bottom list today is Search · Account · WhatsApp · Instagram. Account becomes a two-line row, so it reads as "you", not as just another link:

```
Signed out                              Signed in
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│ (👤)  Sign in                  › │    │ (R)  Hi, Riya                  › │
│       Orders, saved items & help │    │      Orders, saved items & help  │
├──────────────────────────────────┤    ├──────────────────────────────────┤
│ ♡  Saved items                 3 │    │ ♡  Saved items                 3 │
│ 🔍 Search                        │    │ 🔍 Search                        │
│ 💬 WhatsApp us                   │    │ 💬 WhatsApp us                   │
└──────────────────────────────────┘    └──────────────────────────────────┘
```
- The Account row is the component's trigger (the slot holds our markup). If A0 shows the component can't be stretched to a full row, the row becomes a plain link: "Sign in" goes to `routes.storefront_login_url`, and "Hi, Riya" goes to `routes.account_url`.
- **"Saved items"** shows its count once saved.js runs. The count is hidden at 0, and the row stays.
- **"Hi, Riya"** uses `customer.first_name`. Many code sign-ups have no name, so the fallback is "Your account". There's never a nudge to add a name.

### 4.3 Signed-in cue in the header

When signed in, the avatar shows the initial on a Blush circle (Cocoa Deep letter), and the tooltip says "Your account". That one change is the whole cue: no greeting text in the header.

---

## 5. Signing in: the smooth path

1. The shopper taps the avatar (or the drawer row). The sheet opens over the page.
2. **Continue with Google** (one tap on Android; Google's own pop-up elsewhere), or email → **6-digit code** → done.
3. The sheet shows the menu, and **the shopper is still on the same product, with the same cart.**

When we ask (and only then):
- **Track order** (Help menu and the §7 page): "Sign in with the email you ordered with to see every order and its tracking." Guest orders show up once they sign in with that email (checked in A0).
- **Saved items page,** a quiet line: "Saved on this phone. Sign in to see your orders and details anywhere." Once cross-device sync exists (L1), it becomes "Sign in to keep your saved items on every device".
- **Never:** pop-ups on arrival, a sign-in wall before checkout, or "create an account" prompts mid-browse.

**Checkout stays guest-friendly (admin, Raushan):**
- Settings → Customer accounts → sign-in at checkout **optional**.
- Shoppers who sign in get their address and contact filled in.

**Marketing opt-in** in the sign-in sheet stays **unticked by default**: that's the consent rule under India's DPDP Act, and it builds trust.

---

## 6. Shopify's hosted account pages (Orders, Profile)

We don't build these. We brand them, so moving between store and account doesn't feel like leaving.

- **Branding** (Settings → Checkout → Customize; the same editor styles checkout and accounts):
  - logo: the horizontal wordmark
  - background: White, with Soft Blush for sections
  - accent and buttons: Cocoa Deep `#4E3A31` with Cream text
  - corner radius: medium
  - fonts: Jost for body and Cormorant Garamond for headings, if they're in Shopify's font library (check in A0); otherwise the closest serif and sans
- **Own address (AC5):** connect `account.<our domain>` (Settings → Domains), so the address bar keeps our name instead of `shopify.com/…`.
- **What shoppers get there, free:**
  - an order list
  - each order's status and tracking
  - Buy again
  - profile and saved addresses
  - **self-serve returns** if turned on (AC8)
- **Menu:** the same `customer-account-main-menu` as the header button, so "Saved" and "Track an order" appear on the hosted pages too and link back to the store.

---

## 7. Track an order page (`/pages/track-order`)

**Help → Track order** links here instead of straight to the account, because a guest who never "made an account" doesn't know they have one.

```
Track your order                              (h1, Cormorant italic)

[ Signed out ]
Sign in with the email or Google account you used
at checkout. No password needed.
[ Sign in to see your orders ]               → routes.account_login_url (lands on Orders)
Or open the tracking link in your shipping email.

[ Signed in ]
[ See your orders ]                          → routes.account_url

──────────────
Need help with an order?
[ 💬 WhatsApp us ]  "Hi! I have a question about order #____"
Usually replies within a few hours · 10am–7pm
```
- A WhatsApp row appears once the number is set (Theme settings → Social). Until then it's "Contact us" → `/pages/contact`.
- **Signed in with orders:** the newest order is shown as a small card above the button: photo, order number, date, status, and "Track" (`customer.last_order`). If A0 shows Liquid can't read orders with current accounts, the card is left out.

---

## 8. Saved items (wishlist)

### 8.1 How it works

- **A heart on every product card** (top-right of the photo), and a **"Save" button** beside Add to cart on the product page.
- **Works for everyone, no sign-in.** The list is kept in this browser (`localStorage` `yb-saved`: handle, id and date, newest first, at most 60). It stays in step across tabs through the `storage` event.
- Saving shows the cart's pop-up style:
  - **"Saved · View saved"** for 3 seconds
  - Removing shows nothing but the heart, plus a spoken status
- The phone drawer row and the account menu show the count.

### 8.2 The heart

```
┌────────────────────┐
│ Sale         ( ♡ ) │   white 90% circle, 40px drawn, 48px tap area
│                    │   outline: Cocoa 2px · saved: Rose fill + Cocoa outline
│      photo         │
└────────────────────┘
Rose bouquet
₹449
```
- **Markup:** a `<button>` *next to* the card's link, never inside it, so there's no nested interactive element.
  - `aria-pressed="true|false"`
  - label "Save Rose bouquet"
  - the pressed state tells screen readers whether it's saved
- **Rendered `hidden`;** saved.js reveals it. Without JavaScript there's no heart, since there would be nothing to save into.
- **Motion:** a 400ms spring pop (`--ease-spring`, scale 1 → 1.18 → 1) and the Rose fill drawing in. None with reduced motion or `html.lite`.
- On the product page: an outline 48px button **"♡ Save" / "♥ Saved"**, with words, because there's room.
- **Spoken, polite:** "Saved. 3 items in your list." / "Removed from saved."

### 8.3 The Saved page (`/pages/saved`)

**Phone (360–767px):**
```
Saved                                     (h1)
3 pieces · on this phone        [ ⇪ Share ]

┌────────┐  ┌────────┐
│ photo ♥│  │ photo ♥│                     compact cards (results-page variant), 2 across
└────────┘  └────────┘
Rose bouquet  Bunny keychain
₹449          ₹199
[Add to cart] [Choose options]             one tap; multi-option products go to the product
                                            page instead
┌────────┐
│ photo ♥│  Sold out
└────────┘
Daisy clip
[Ask us to make one]                       WhatsApp, with the product named

Sign in to see your orders anywhere ›      (one quiet line, signed out only)

Recently viewed                            swipe row (product-row snippet)
```

**Desktop (768px and up):**
- The same order: the h1 row with the count and Share on the right, then the grid 3 / 4 / 5 across (the results-page grid), then Recently viewed 6 across.
- Width 80rem.
- Soft Blush ground (`scheme-soft`), like the search page.

**Empty:**
- A line icon (the kit's keychain heart), then **"Nothing saved yet"**.
- "Tap ♡ on anything you love, and it waits here for you."
- Then **Bestsellers** as a product row, so the page is never a dead end.

**Behaviour:**
- **Loading:**
  - The page knows the count straight away, from localStorage, so it draws that many placeholder cards first: no jump, no spinner.
  - Cards come from the Section Rendering API: `/products/<handle>?section_id=saved-item`, 6 in parallel. So they are the real product card, with the live price and stock.
  - A product that's gone (404) is dropped quietly. If any were dropped, one line says "1 saved piece is no longer available."
- **Remove:** tap the heart, and the card folds away with an **"Undo"** pop-up (5s), like removing a cart line. Focus moves to the next card's heart (or the h1 if none are left).
- **Add to cart:** uses cart.js's existing add, with its "Added to cart · View cart" pop-up. The item **stays saved**: shoppers expect that.

### 8.4 Share your list (AC6)

Made for gifting ("send this to your sister before your birthday"):
- **Share:**
  - Phones: the Web Share sheet (WhatsApp is right there).
  - Desktop: copy link, with a "Link copied" confirmation.
- **The link:** `/pages/saved?list=handle1,handle2,…` (at most 30).
- **Opening a shared link shows:**
  - title "A wishlist for you"
  - the same cards, without hearts filled
  - **"Save all to my list"**
  - the receiver's own list is never overwritten
- **Shared pages are `noindex`.**

### 8.5 Recently viewed

- Product pages record the last 8 handles (`yb-recent-products`).
- They're shown only on the Saved page and its empty state, so nothing new is added to the home or product pages.
- Stored on the device only, with a "Clear" link.

---

## 9. Look and theme fit

| Element | Token |
|---|---|
| Component accent / buttons | `--shopify-account-color-accent: var(--cocoa-deep)` (Cream text) |
| Component background / text | `var(--white)` / `var(--cocoa)` |
| Component fonts | heading `var(--font-serif)` (italic 600), body `var(--font-sans)` |
| Component radius | `--shopify-account-radius-base: var(--radius-md)` (18px) |
| Signed-in avatar | `var(--blush)` circle, `var(--cocoa-deep)` initial, 32px |
| Heart | Cocoa outline 2px; saved = `var(--rose)` fill |
| Saved page ground | `scheme-soft` (Soft Blush), white cards as on the results page |
| Headings | Cormorant Garamond italic 600, as everywhere |
| Labels ("3 PIECES") | Jost 500 uppercase, `--tracking-label`, `--color-muted` |

**New line icons, in the nav-plan icon style** (24px box, 1.8px stroke, `icon__fill` for the filled "current" state):
- `heart`
- `share`
- `package`, for Track order

---

## 10. Accessibility checklist (WCAG 2.2 AA)

| Criterion | How |
|---|---|
| 1.3.1 / 4.1.2 | The heart is a toggle button: `aria-pressed`, with the product name in its label. The Saved page has h1 → h2 (Recently viewed) → card h3. |
| 1.4.3 / 1.4.11 | The heart's outline is Cocoa on a white circle (more than 3:1 on any photo). Rose is never the only sign of "saved", since the outline and `aria-pressed` change too. |
| 2.1.1 / 2.4.3 | Tab order: card link → heart → next card. In the drawer: Account row → Saved → Search. The sheet traps focus and returns it to the avatar (A0 checks this). |
| 2.4.7 / 2.4.11 | Focus rings as in the theme, never hidden under the sticky header. |
| 2.5.8 | 48px targets for the heart, avatar and drawer rows. |
| 3.3.7 / 3.3.8 | No passwords and no re-typing (accessible authentication): email code with autofill, or Google. |
| 4.1.3 | Status messages for save, remove, undo, share and "link copied". The Saved page's count updates are spoken once. |
| 2.2.1 | Undo pop-ups pause on hover and focus, like the cart pop-up. |
| Forced colours | The heart uses `CanvasText` / `Highlight`. |
| Real phones | VoiceOver (iOS Safari) and TalkBack (Chrome) on the sign-in sheet and the hearts, before launch. |

---

## 11. Admin setup (Raushan; I'll guide each step)

1. **Settings → Customer accounts:**
   - confirm the current version is on
   - sign-in at checkout: **optional**
   - self-serve returns per AC8
2. **Sign in with Google**, about 20 minutes, once:
   - Settings → Customer accounts → Authentication → Manage → Connect next to Google.
   - Google Cloud Console: new project "Yarn Basket", then the OAuth consent screen:
     - External audience
     - app name "Yarn Basket"
     - support email
     - home page, privacy policy and terms links (Shopify's `/policies/...` pages)
   - Create an OAuth client of type *Web application*, with the origins and redirect URIs that Shopify's setup page shows.
   - Paste the Client ID and secret into Shopify, publish the Google app, then preview in Shopify and turn it on.
3. **Branding** (Settings → Checkout → Customize): logo, colours, fonts and radius per §6.
4. **Account domain:** Settings → Domains → connect `account.<domain>` (AC5).
5. **Menu** (Content → Menus → *Customer account main menu*): Orders, Profile, **Saved** (`/pages/saved`), **Track an order** (`/pages/track-order`).
6. **Pages:** create the "Saved" and "Track your order" pages, using the `saved` and `track-order` templates.
7. **Notification emails** (Settings → Notifications): logo and Cocoa accent, so order and shipping emails look like the store.
8. **Checkout:** collect the phone number for delivery updates (Settings → Checkout).

---

## 12. Build

### Files

| File | Change | Owner today |
|---|---|---|
| `sections/header.liquid` | The component at 768px and up (signed-out slot = our glyph and tooltip); drawer Account row and Saved row; Help → Track order link | mine (shared hot spot: claim first) |
| `snippets/account-button.liquid` | New: the component with its CSS variables, plus the no-JS / legacy fallback link | new |
| `snippets/save-button.liquid` | New: the heart (card) and "Save" (product page) | new |
| `snippets/product-card.liquid` | Render the heart beside the link | shared with the home/results sessions: claim |
| `sections/product.liquid` | Save button by Add to cart; record recently viewed | claim |
| `sections/saved.liquid`, `templates/page.saved.json` | New Saved page | new |
| `sections/saved-item.liquid` | New: one compact card, the Section Rendering target | new |
| `sections/track-order.liquid`, `templates/page.track-order.json` | New | new |
| `assets/saved.js` | New: hearts, counts, page loading, undo, share, recently viewed. **≤ 3 KB gzipped**, deferred, loaded where cards or the product form exist | new |
| `snippets/icon.liquid` | `heart`, `share`, `package` | mine |
| `config/settings_schema.json` | "Account" group: account menu (link_list, default `customer-account-main-menu`) | claim |
| `locales/en.default.json` | `account.*`, `saved.*`, `track.*` (read-modify-write) | claim |
| `snippets/meta-tags.liquid` | `noindex` on the Saved and Track pages | mine |
| `tools/check.mjs` | New "Account & saved" checks (§12 A4) | shared |

theme.js stays as it is. The component and the native popover need no code there, and saved.js does the rest.

### Stages

- **A0 (spike, about half a day, plus Raushan's admin steps 1–5).** On the dev theme, put the component in the header and drawer, then check:
  - axe, keyboard, focus return and VoiceOver
  - its script weight and whether it delays LCP
  - styling with our tokens
  - whether the drawer row can be the trigger
  - that `customer` / `customer.last_order` work in Liquid after signing in
  - that guest orders appear after signing in with the same email
  - that `return_to` works
  - that the fonts are in the branding editor

  **Outcome:** keep the component, or switch to the §4 fallback. I report back before A1.
- **A1: account entry.** Header button (768px and up), drawer rows, signed-in cue, Track order page, Help link.
- **A2: saved items.** Hearts on cards and the product page, saved.js, pop-ups, Saved page with empty state and undo.
- **A3: extras.** Recently viewed, Share your list and shared-list view.
- **A4: checks.**
  - `check.mjs`:
    - heart toggles and survives a reload
    - count in the drawer
    - Saved page renders N cards, and remove + undo
    - shared link opens read-only
    - axe on the Saved, empty and Track pages, at phone and desktop sizes
  - Also check: budgets, theme check, every breakpoint, forced colours, and Firefox and WebKit.

### Later (not in this build)

- **L1. Saved items on every device.** For signed-in shoppers, sync the list to a customer metafield through a small private app (app proxy). Alternatively, a wishlist app such as Swym, if we'd rather not run one. Worth it once people actually use Saved.
- **L2. Inside the hosted account.** A "Saved" page and a "Need help with this order? WhatsApp us" block, as customer account UI extensions (needs the same private app).
- **L3. Gift reminders.** A birthday or occasion field, plus a Shopify Flow / Shopify Email reminder.
- **L4. Phone OTP sign-in.** Only on Shopify Plus (§3), or through the checkout provider chosen with the payment gateway.

---

## 13. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| AC1 | Sign-in methods | **Email code + Google.** Facebook off. Phone OTP isn't possible on our plan; pick phone-first checkout together with the payment gateway (§3). |
| AC2 | Account button | **Shopify's `<shopify-account>` sheet** (sign in without leaving the page), if it passes the A0 accessibility and speed checks; otherwise our own popover. |
| AC3 | Account on phones | **In the drawer** as a two-line row; the phone header stays 3 icons. Tablets (768px and up) get it in the header. |
| AC4 | Where hearts go | **Every product card + the product page.** |
| AC5 | Account address | **`account.<our domain>`** instead of `shopify.com/...`. |
| AC6 | Share your list | **Yes**, it suits gifting. |
| AC7 | Custom (made-to-order) pieces | **Create them as Shopify draft orders and send the invoice.** Once paid, they appear in the customer's Orders with tracking, like any order, so there's no separate "custom order status" to build. |
| AC8 | Self-serve returns | **On, with made-to-order and personalised pieces as final sale** (return rules by tag). This is a business call: off is also fine. |
| AC9 | Saved without signing in | **Yes, on this device first;** sync across devices later (L1). |

## 14. What's not in this plan

Loyalty points, referrals, reviews from the account and store credit. Each needs an app or a decision on the offer first. All are left for after launch.

## 15. Sources (checked 2026-10-02)

- Customer accounts sign-in options: https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts
- Sign in with Google setup: https://help.shopify.com/en/manual/customers/customer-accounts/sign-in-options/social-sign-in/google
- Social sign-in launch (13 Aug 2025): https://changelog.shopify.com/posts/social-sign-in-options-now-available-on-customer-accounts
- `<shopify-account>` component: https://shopify.dev/docs/api/storefront-web-components/components/shopify-account and https://shopify.dev/docs/storefronts/themes/customer-engagement/account-component
- Theme Store requirement (30 Jul 2026): https://shopify.dev/changelog/the-shopify-account-component-for-customer-accounts-is-now-a-theme-store-requirement
- Sign-in links and `return_to`: https://shopify.dev/docs/storefronts/themes/sign-in
- Legacy accounts deprecated (Feb 2026): https://changelog.shopify.com/posts/legacy-customer-accounts-are-now-deprecated
- No native SMS sign-in (community, Oct 2025): https://community.shopify.com/t/sms-authentication-for-new-customer-accounts/572185
- Phone OTP apps need Plus with current accounts: https://apps.shopify.com/login-using-otp , https://apps.shopify.com/idp
