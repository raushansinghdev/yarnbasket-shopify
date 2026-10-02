# Account plan, round 2: the account page, the account menu, signing out

Status: **B1–B3 and B5 built 2026-10-03** (theme side). Still to do: things that need a real sign-in (B0, below), the Google setup (§7, G0, with Raushan), Shopify's branding (§8, admin), and the admin steps in `launch-checklist.md` "Account page".

### As built (where it differs from the plan below)
- **Preview without signing in:** `/pages/contact?view=account-demo` shows the signed-in page and header menu with a made-up shopper and three orders (Confirmed, Shipped with Track parcel, an older one with Buy again). This needs Demo content on, and it's deleted before launch. `?view=account` is the real page; once Raushan creates the `account` page, it's `/pages/account`.
- **Signed-in header menu** (`snippets/account-menu`):
  - a native popover anchored under the button (CSS anchor positioning; other browsers put it under the header's right edge)
  - focus stays on the button when it opens, and Tab goes straight into the list; Esc and click-away close it and return focus
  - rows: Orders (with "#1050 · Confirmed" from the latest order), Saved (count), Your details, Help, Sign out, then "Your account ›"
- **Signed out,** Shopify's sheet is restyled: Cocoa text everywhere (the menu text was black), one white surface, a softer shadow, larger corners. The border is `#A08A80` (3.26:1 on white), because the same variable draws the email field's edge.
- **Sign out** goes to `/account/logout?return_url=<this page>`. Shopify honours `return_url` (checked signed out, 2026-10-03; check it once signed in). saved.js clears Recently viewed on the click, and the next page shows "You're signed out" once, adding "Your saved items stay on this device" plus "View saved" when there are any.
- **Order card changes:**
  - **"Details ›" sits at the card's top right,** not under the buttons. On phones the two buttons share the row equally, so every card lines up the same way.
  - **States are the ones Liquid can see:** Confirmed ("We're getting it ready"), Confirmed · pay on delivery, Shipped, Partly shipped, Cancelled, Refunded. No Packed or Delivered, since Liquid has no delivery status. The second line says "Shipped 1 Oct · Delhivery".
  - **Track parcel only for 14 days after shipping;** after that the card offers Buy again.
- **Buy again** is a real form (`items[][id]`, `items[][quantity]`). Without JavaScript it adds and goes to the cart (checked). With it, account-page.js adds through cart.js's queue and the card says "Added 2 pieces to your cart. 1 piece is sold out, so it was left out. View cart". It skips the free gift and draft-order lines.
- **Your details:** one "Edit your details ›" button (Shopify's Profile, through `/account/addresses`), not an Edit link per row, since every row goes to the same place. The phone number isn't masked: it's the shopper's own page.
- **"Download or delete my data"** is a `mailto:` to the store email, with the subject and request written out.
- **Help panel:**
  - **Without a WhatsApp number** (as today), it shows "Contact us" and "Ask for a custom piece" (contact page). With the number, both open WhatsApp.
  - **Links:** Track your order, the Shipping and Refund policies once they exist, and Contact.
- **Page order:** Recently viewed follows Saved in the main column (phones: orders → saved → recently viewed → details → help → sign out).
- **Signed out on desktop,** the page is one column (a sign-in card, then help), because two columns left one side empty.
- **Found while building:** the logo intro played on any page, including Saved, Track and the account page. It's now skipped on all three (`layout/theme.liquid`), as decisions.md "Logo intro" says.
- **Sizes:** `account-page.js` is 2.0 KB gzipped (account page only); `saved.js` grew to 2.8 KB gzipped; theme.js is unchanged.
- **Checks:**
  - `npm run check` §13: axe on the signed-out page and the signed-in demo (phone and desktop, best-practice included), menu keyboard behaviour, Sign out present, and the signed-out pop-up once
  - quick run 91/91 on 2026-10-03
  - scratch tests: Saved and Recently viewed rows, demo Buy again, real Buy again through cart.js, and the no-JS form
- **B0, still to do signed in** (Raushan signs in once on the preview link): real orders render (`customer.orders`, `line_item.fulfillment`, `customer_url`), Your details (`accepts_marketing`, `default_address`), sign-out `return_url`, and whether Shopify's account script still loads when the sheet isn't on the page.

### Raushan's answers (2026-10-02)
- **Every recommendation in §14 (AH1–AH20) is approved.** He chose AH1–AH4, AH9–AH11, AH14, AH15, AH17 and AH20 directly, and left the rest to my recommendation.
- **Order cards (AH6): "not much, not less".** As §4.2 says: at most two buttons, chosen by the order's state (on its way: **Track parcel + Need help?**; delivered: **Buy again + Need help?**), plus a quiet **Details ›** text link to Shopify's order page on every card.
- **Extras (AH12, AH13):** all four are in.
  - "Ask for a custom piece", which he chose directly
  - Download or delete my data
  - Email offers status in Your details
  - Recently viewed, last on the page and only when there's something to show
- **Google sign-in (§7): now, on the dev store.** G0 first, then switch it on. This takes it off the launch-week list; only the domain values are redone at launch.
- **Shopify's branding (§8): now, on the dev store.**
- **"Continue with Shop":** turned off if the admin allows it (G0 checks).

Round 1 (`account-plan.md`) is built: sign-in through Shopify's `<shopify-account>` sheet, the drawer's account row, hearts, the Saved page and the Track page. This round covers what a shopper sees **after** signing in. It follows `brand-direction.md`, `motion-plan.md`, `nav-plan.md`, and the rules "UX before looks" and "calm motion".

---

## 0. What Raushan raised (2026-10-02)

1. **There's no Sign out anywhere on the store.** Is that intentional?
2. **The account dropdown doesn't look good** (screenshot: "Account", the email, then a bordered box with Orders / Profile / Saved / Track an order).
3. **The account pages look immature,** like Shopify's default (screenshot: `shopify.com/78941028489/account/orders`, a plain "Welcome / Ready to shop?" card with a blue "Shop now" button).
4. **Cover every option a customer should have,** with the same look, feel and motion as the rest of the store. It should be intuitive, accessible and rich.

---

## 1. What's going on

### 1.1 Sign out: not intentional, a gap in round 1

- **Shopify's sheet has no Sign out, by design.** Shopify's docs: *"The account component menu doesn't include a sign-out option. Customers sign out by going to their customer account profile page and clicking Sign out."*
- Round 1 §4 assumed the signed-in sheet had "Sign out". It doesn't, and the theme has no logout link anywhere (`routes.account_logout_url` is used nowhere).
- Today, signing out takes four steps: open the sheet → Profile → leave the store for shopify.com → find Sign out. Most people won't find it, and on a shared family phone that's a privacy problem.

### 1.2 The dropdown: we only control its paint, not its shape

The sheet lives inside Shopify's shadow DOM. We get about 25 CSS variables and one `::part` (the signed-out avatar). Here's why it looks off, and whether each problem can be fixed:

| What's wrong | Why | Can we fix it inside Shopify's sheet? |
|---|---|---|
| Menu text is pure black, not Cocoa | `--shopify-account-color-card-text` isn't set, so it falls back to black | **Yes**, one variable |
| A bordered box inside the white sheet (two layers of edges) | the card background and border variables | **Partly.** We can flatten the box, but the same border variable draws the email field's edge on the sign-in screen, which needs 3:1 contrast |
| Plain text list: no icons, no hints, no counts (Saved 3), no greeting | Shopify's layout | **No** |
| No Sign out | Shopify's choice | **No** |
| Heavy shadow and corner | variables | **Yes** (`--shopify-account-color-shadow`, `--shopify-account-radius-dialog`) |
| Motion is Shopify's, not ours | inside the component | **No** |

### 1.3 The account pages: Shopify's unbranded default

- Screenshot 1 is Shopify's **hosted** account (it lives on shopify.com, not in our theme), **with no branding applied yet**:
  - no logo (the plain text "Yarn Basket")
  - Shopify's blue button
  - Shopify's default font
  - grey menu
- Round 1's admin steps 3 (branding) and 4 (`account.` domain) haven't been done. **Most of the "immature" feel is fixable in the admin in about 30 minutes**, but only most of it.
- **What the branding editor can change** (our plan, not Plus): logo and its size, colours (header, page, cards, buttons), fonts from Shopify's font library, corner radius, the sign-in page's photo, the collection shown when someone has no orders ("Ready to shop?"), and the menu.
- **What it can't:** the layout (left menu, one card), our own CSS, our motion, or our header and footer. Uploading our own font files and the Branding API are **Shopify Plus only**.
- **Apps can add to these pages** on every plan (customer account UI extensions): blocks on the order page, and whole new pages. They use Shopify's components, so they look like Shopify's pages, not like our theme.

### 1.4 What our theme can know about a signed-in shopper

- Liquid's `customer` works on storefront pages with current accounts. The drawer greeting and the Track page already use it.
  - Shopify fixed a bug where the store "forgot" the shopper after about a day. Sessions now last 30 days, but only sessions created after the fix, so we sign out and in again once when testing.
- **Still to confirm (spike B0):**
  - whether `customer.orders` (the list), `order.fulfillments` (tracking links) and `customer.default_address` render on a normal page
  - Round 1's `customer.last_order` card hasn't been seen signed in either
- **Editing can't happen in our theme.** Changing name, phone or addresses, starting a return, or seeing the full tracking timeline needs Shopify's Customer Account API. That API needs a headless app with OAuth, not a Liquid theme. The old theme templates (`customers/account.liquid`) only worked with classic accounts, which were retired in Feb 2026 and can't be turned on. **So those actions stay on Shopify's pages, whatever we choose.**

---

## 2. The idea: our own "Your account" page, with Shopify's pages behind it

| | A. Brand Shopify's pages only | **B. Our account page + branded Shopify pages (recommended)** | C. B plus app blocks inside Shopify's pages |
|---|---|---|---|
| What it is | Admin branding + a better dropdown | A page in our theme that does what people want most; Shopify's pages only for editing and full order details | B, plus a small private app adding blocks inside Shopify's pages (e.g. "WhatsApp us about this order") |
| Looks like the store | Partly (colours, fonts, logo) | **Fully**, where shoppers spend their time | Same as B |
| Our motion and layout | No | **Yes** | Yes on ours; Shopify's look inside the app blocks |
| Sign out, greeting, Saved, help, Buy again | Sign out only through our menu | **All, in one place** | All |
| Work | About ½ day + admin | About 3–4 days + admin | B + 2–3 days, and an app to maintain |
| Risk | Low | Low. Depends on B0 confirming that orders render in Liquid; if not, the page shows the latest order only and links to Shopify for the rest | App upkeep with every Shopify API version |

**Recommendation (AH1): B now, C after launch if WhatsApp questions about orders turn out common.**

How it fits together:

```
Header "Account" (signed in) ──► our menu panel ──► Your account page (ours, /pages/account)
                                     │                    │
                                     │                    ├─ Order card ──► "Details & tracking"  ──► Shopify order page
                                     │                    ├─ Your details ──► "Edit"              ──► Shopify Profile
                                     │                    └─ Sign out ──────────────────────────────► signed out, toast
                                     └─ Sign out
Header "Account" (signed out) ──► Shopify's sign-in sheet (restyled) ──► back on the same page, signed in
```

---

## 3. Everything a customer might want, and where it lives

| # | Option | Where | When | Notes |
|---|---|---|---|---|
| 1 | Sign in (email code, Google) | Shopify's sheet | built | Google after the admin setup |
| 2 | **Sign out** | our menu, our account page, Shopify's pages | **now** | §6 |
| 3 | Greeting + who's signed in | menu, account page | now | "Hi, Sneha", or the email if there's no name |
| 4 | **Recent orders with status** | account page | now | §4.2 |
| 5 | Full order details, tracking timeline, invoice | Shopify's order page | Shopify's | We link to it from each order card |
| 6 | **Buy again** | order card (ours), Shopify's order page | now | Adds that order's pieces to the cart, skipping sold-out ones |
| 7 | **Need help with this order / report damage** | order card | now | WhatsApp, prefilled with the order number. Our policy is "Replacement if damaged", so this is the replacement route too |
| 8 | Track an order as a guest | `/pages/track-order` (built) | built | Kept: guests don't know they have an account |
| 9 | Saved items | account page preview + `/pages/saved` | now (preview) | Built page; the account page shows the first 4 |
| 10 | Recently viewed | account page | now | Reuses the Saved page's row |
| 11 | Your details (name, email, phone) | summary on our page, editing on Shopify's | now | "Edit" opens Shopify's Profile |
| 12 | Addresses | summary on our page, editing on Shopify's | now | Shows the default address |
| 13 | Email offers on/off | summary on our page, switch on Shopify's | now | Shown honestly ("You get our emails" / "You don't get our emails") |
| 14 | Ask for a custom piece | account page Help block | now | WhatsApp. A paid custom piece becomes a draft order, then shows in Orders (round 1 AC7) |
| 15 | Help: WhatsApp, FAQ, shipping, replacements, care guide | account page Help block | now | Links to pages we already have or will have |
| 16 | Download or delete my data | quiet link at the bottom of the account page | now | India's DPDP Act gives people this right. Goes to the contact page with the request prefilled; Raushan handles it in the admin (Customers → Erase/Export) |
| 17 | GST invoice download | Shopify's order page or an invoice app | later | With the GST setup (launch checklist) |
| 18 | Saved items on every device | — | later (round 1 L1) | Needs a small app |
| 19 | Gift and birthday reminders | — | later (L3) | |
| 20 | Review a piece you bought | — | later | Needs a reviews app |
| 21 | Points, referrals, store credit | — | later | Needs an offer decision first |
| 22 | Saved cards / UPI | not possible | — | Shop Pay isn't offered in India; the payment gateway handles it |
| 23 | Language / currency | not needed | — | India only, English |

---

## 4. The "Your account" page (`/pages/account`)

`/account` itself is Shopify's address (it forwards to the hosted pages), so our page is `/pages/account`, on the Soft blush ground with white cards, like the Saved and Search pages. It's `noindex`.

### 4.1 Phone, signed in

```
┌ Soft blush ────────────────────────────┐
│ (S)  Hi, Sneha                          │  h1, Cormorant italic; initial on a Blush circle
│      sneha@gmail.com                    │  small, Taupe Ink
│                                         │
│ ┌────────┐ ┌────────┐ ┌────────┐        │  three jump tiles, 48px+ tall, white
│ │📦 Orders│ │♡ Saved 3│ │💬 Help │        │  (they scroll to the sections below)
│ └────────┘ └────────┘ └────────┘        │
│                                         │
│ Your orders                  All orders›│  h2 → Shopify's Orders
│ ┌─────────────────────────────────────┐ │
│ │ [img] Order #1042 · 2 Oct           │ │  white card, one per order (latest 3)
│ │       ● Shipped                     │ │  status chip: words + icon, never colour alone
│ │       Sunflower bouquet + 1 more    │ │
│ │ [ Track parcel ]  [ Need help? ]    │ │  Track = courier link if there is one
│ │ Details ›                           │ │  → Shopify's order page
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [img] Order #1031 · 12 Sep          │ │
│ │       ✓ Delivered                   │ │
│ │ [ Buy again ]     [ Need help? ]    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Saved                         See all › │  h2 → /pages/saved
│ [card][card][card][card] →              │  swipe row, the same cards as the Saved page
│                                         │
│ Your details                            │  h2
│ ┌─────────────────────────────────────┐ │
│ │ Name     Sneha Singh          Edit ›│ │  each row → Shopify's Profile
│ │ Phone    +91 98••• ••210      Edit ›│ │
│ │ Address  Patna 800001         Edit ›│ │
│ │ Emails   You get our offers   Edit ›│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌ Blush panel ────────────────────────┐ │  h2 "Need help?"
│ │ We usually reply within a few hours │ │
│ │ [ 💬 WhatsApp us ]                   │ │
│ │ [ ✿ Ask for a custom piece ]        │ │
│ │ FAQ · Shipping · Replacements · Care│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Recently viewed                         │  swipe row (only if there are any)
│                                         │
│ [ ↪ Sign out ]                          │  outline pill, full width on phones
│ Download or delete my data              │  quiet link
└─────────────────────────────────────────┘
```

### 4.2 The order card

- **Status in plain words:**
  - Confirmed (paid, not packed)
  - Packed
  - Shipped
  - Delivered
  - Cancelled
  - Refunded
  - "Pay on delivery" for COD
- **What decides it:**
  - Liquid gives us `fulfillment_status`, `financial_status`, `cancelled` and each fulfilment's `tracking_url`
  - "Delivered" needs Shopify's delivery status; B0 checks whether Liquid can see it
  - if it can't, the card says "Shipped" with the Track link, and never claims Delivered falsely
- **No progress bar** unless B0 shows we can fill it honestly.
- **Buttons, at most two:**
  - in transit: **Track parcel** (the courier's page, new tab, labelled as such) + **Need help?**
  - delivered or older: **Buy again** + **Need help?**
- **"Need help?"** opens WhatsApp with "Hi! I need help with order #1042." If no number is set, it goes to the contact page with the order number filled in.
- **Buy again:**
  - adds each line that's still for sale through cart.js's existing add
  - shows the usual "Added to cart" pop-up
  - says what it skipped ("1 piece is sold out")
  - custom (draft-order) lines are skipped
- **No orders yet:** "No orders yet. When you order, you'll see it here with its tracking." Then **Bestsellers** as a product row, so the page is never a dead end. This is our version of Shopify's "Ready to shop?".

### 4.3 Signed out

```
Your account                                  (h1)
Sign in to see your orders and tracking.
No password: we email you a code, or use Google.
[ Sign in ]                                   opens Shopify's sheet; without JS → Shopify's sign-in page

Track an order without signing in ›           → /pages/track-order
Saved on this phone (3)        See all ›      swipe row, if any
Need help?                                    the same Blush panel
```

### 4.4 Desktop (900px and up)

Two columns, 80rem wide:
- **Left (wide):** greeting, Your orders, Saved, Recently viewed.
- **Right (narrow, sticky):** Your details card, Need help panel, Sign out.

The phone's jump tiles aren't needed, because everything is in view.

---

## 5. The account menu (the dropdown)

### 5.1 Signed in: our own menu (recommended, AH2)

Shopify's sheet stays only for signing in (§5.2). Once someone is signed in, the header renders **our** button and menu instead, because we know the customer in Liquid.

```
                    [ (S) Account ]   [🛒 Cart ]
                 ┌──────────────────────────────┐   anchored under the button, right-aligned
                 │ (S)  Hi, Sneha               │   white, radius-md, soft shadow, 300px
                 │      sneha@gmail.com         │
                 │ ──────────────────────────── │
                 │ 📦  Orders          1 on its way│  hint only if there's an open order
                 │ ♡   Saved                  3 │
                 │ 👤  Your details              │
                 │ 💬  Help                      │
                 │ ──────────────────────────── │
                 │ ↪   Sign out                  │
                 │ ──────────────────────────── │
                 │     Your account ›            │   → /pages/account
                 └──────────────────────────────┘
```

- **Rows:** 48px tall, our line icons (`package`, `heart`, `account`, `whatsapp`, plus a new `sign-out` icon), Cocoa Deep text, Blush hover and focus wash. No boxed list inside the panel: one surface and thin dividers.
- **"Orders" goes to our page's Your orders section,** not straight to Shopify. Shopify's Orders page is one more tap away ("All orders").
- **Built with the native `popover` attribute and a `<button aria-expanded>`:** Esc, click-away and the top layer come free, with no new theme.js code. It's a list of links, not an ARIA `menu`, so Tab works as people expect.
  - Focus moves to the first link on open, and back to the button on close.
- **Click to open, never hover.** Hover menus open by accident and don't work on touch or for keyboard users.
- **Motion:**
  - opens with a fade and a 6px drop over `--dur-panel` with `--ease-out`
  - closes at 70% of that time with `--ease-exit`
  - no spring or bounce, following the "calm motion" feedback
  - with reduced motion or lite mode: no movement, just a 120ms fade
- **The header button signed in:** the initial on a Blush circle, plus the word "Account" from 1100px, the same pill as Cart. The visible word stays "Account" (WCAG 2.5.3); the email is its description.

### 5.2 Signed out: Shopify's sheet, restyled

It's the only way to sign in without leaving the page, so it stays. Changes, all through its variables:
- **Text:** Cocoa Deep everywhere, including `card-text` (fixes the black text).
- **The inner box:** card background the same white as the sheet, softer line. The email field keeps a 3:1 edge (B0 checks both).
- **Shadow and corners:** a softer, wider shadow; `radius-dialog` set to our `--radius-lg`.
- **Heading:** stays Jost 500 (Cormorant at Shopify's fixed size read too small in round 1).

### 5.3 Phones (under 900px)

- **Signed in:** the drawer's account row ("Hi, Sneha · Orders, saved items & help") **goes to our account page.** A whole page is easier on a phone than a menu over a drawer, and it's one tap.
- **Signed out:** the row opens Shopify's sign-in sheet (as now).
- **The drawer gets no Sign out row** (AH9). It's one tap away on the account page, and a sign-out next to Search is easy to hit by accident.

---

## 6. Signing out

- **Where:** our desktop menu, the bottom of our account page, and Shopify's own pages (their avatar menu and Profile).
- **How:** a plain link to `routes.account_logout_url`. It's a link, not a form, so it works without JavaScript.
- **No "Are you sure?"** Signing back in is one code or one tap, and a confirm step only slows people down.
- **Where you land (AH10):** Shopify sends people to the home page after sign-out. B0 tests whether `?return_url=` can bring them back to the page they were on, which is better. If it can't, they land on home.
- **"You're signed out" pop-up** on the page where they land:
  - polite live region, shown for 4 seconds
  - the sign-out link sets a `sessionStorage` flag, and the next page shows the message if `customer` is now empty
- **What stays on the device (AH11):** Saved items and Recently viewed are kept on the phone, not in the account. Recommendation:
  - **keep Saved** (people save as guests too)
  - **clear Recently viewed** on sign-out, so a shared family phone doesn't show what the last person browsed
  - the pop-up says: "You're signed out. Your saved items stay on this device."

---

## 7. Sign in with Google

Raushan asked for this on 2026-10-02. Round 1 chose it (AC1: email code + Google, Facebook off), and the launch checklist had parked it until just before launch. This section makes it a full plan.

### 7.1 Why Google

- Most Android phones in India are already signed into Google, so signing in is **one tap, with no code to wait for or copy.** That's the biggest drop-off on any sign-in.
- It's built into Shopify's current accounts and costs nothing: **no app, no theme code.**
- Shoppers who don't use Google (many iPhone users) still have the email code. Two clear choices beat four, so Facebook stays off.

### 7.2 What shoppers see

```
┌ Sign in ─────────────────────────────┐   Shopify's sheet (signed out), restyled per §5.2
│ [ G  Continue with Google          ] │   Google first: one tap for most shoppers
│ [ 🛍  Continue with Shop            ] │   Shopify adds this itself (round 1, As built)
│ ─────────────── or ───────────────── │
│ Email  [ you@example.com          ]  │
│ [ Continue ]                         │   → 6-digit code
│ ☐ Email me offers and new pieces     │   unticked by default (DPDP)
└──────────────────────────────────────┘
```

- **Where the Google button appears:** the header sheet, the drawer row's sheet, the signed-out account page (its "Sign in" opens the same sheet), Shopify's hosted sign-in page, and sign-in at checkout. All of these come from one admin switch.
- **The flow:**
  - Tap → Google's account chooser in a pop-up or new tab ("Choose an account to continue to Yarn Basket")
  - Pick an account → back on the same page, signed in, with the cart untouched
  - New shoppers get a customer record with their Google name. That fills "Hi, Sneha" for free, which email-code sign-ups usually lack.
- **Same email, same account:** someone who ordered as a guest or signed in with a code before, then uses Google with the same Gmail, should land in the same account with their orders. G0 checks this.
- **No Google One Tap pop-up** (the floating "Sign in as Sneha?" card). Shopify doesn't offer it on the storefront, and round 1 ruled out pop-ups on arrival anyway.
- **The button's look is Google's:** the "G" logo and wording follow Google's brand rules. Shopify draws it, and we can't restyle it.

### 7.3 Setup (Raushan in the admin and Google Cloud, about 30 minutes; I'll walk through it live)

1. **Which Google account owns it:** the business Gmail, not a personal one. Whoever owns the Cloud project can change sign-in for every customer, so it should outlive any one device.
2. **Shopify:** Settings → Customer accounts → Authentication → Manage → **Connect** next to Google. Keep this page open, because it shows the values Google needs.
3. **Google Cloud Console:** create a new project, **"Yarn Basket"**.
4. **Consent screen** (Google Auth Platform → Branding / Audience):
   - **Audience:** External
   - **App name:** "Yarn Basket" (what shoppers see in Google's chooser)
   - **Support email:** the business Gmail
   - **Links:** home page, privacy policy and terms (Shopify's `/policies/...` pages; the terms draft is `docs/legal/terms-of-service.html`)
   - **Logo:** leave it empty at first. Adding a logo makes Google review the brand, which can take days (G0 confirms). Add it later, once yarnbasket.in is on Shopify.
5. **OAuth client:** type *Web application*, named "Shopify customer accounts". Paste the **JavaScript origins** and **redirect URIs** exactly as Shopify's page lists them.
6. **Back in Shopify:** paste the **Client ID** and **Client secret**, then save.
7. **Publish the Google app** (Audience → Publish app). Until it's published, only listed test users can sign in.
8. **Test before switching on:**
   - Shopify's preview
   - then a real sign-in on an Android phone (Chrome) and an iPhone (Safari)
   - also with a Gmail that already has a guest order (checks §7.2's account matching)
9. **Turn it on.**

**The secret** is pasted straight into Shopify and never written to the repo, a doc or chat, like the storefront password.

### 7.4 Things that can go wrong, and what we do

| Risk | What we do |
|---|---|
| Google shows "continue to shopify.com" instead of "Yarn Basket" | Expected until the brand is verified and accounts use `account.yarnbasket.in`. G0 checks what shows on the dev store; verify the brand at launch, when the domain moves (needs the domain checked in Google Search Console) |
| Sign-in fails while the store's password page is on | G0 tests on the dev store. If it's blocked, the test waits for the launch-week checklist |
| The domain changes at launch (`account.yarnbasket.in`) | Add the new origins and redirect URIs to the same OAuth client that day. It's on the launch checklist |
| Pop-up blockers or in-app browsers (Instagram, WhatsApp) block Google's pop-up | The email code is always there below it. G0 tests Google from an Instagram and a WhatsApp link, because many of our shoppers will arrive that way |
| The secret leaks or the project owner loses access | Rotate the secret in Google Cloud and paste the new one into Shopify; two owners on the Cloud project |

### 7.5 Theme work

Almost none, because Shopify draws the button:
- Signed-out copy that mentions Google ("No password: use Google or an email code"), on the account page (§4.3) and the Track page.
- Check that the restyled sheet (§5.2) still looks right with the Google and Shop buttons above the email field: spacing, the "or" divider, focus order.
- A `check.mjs` line confirming the sheet lists Google once it's on (signed out, so it can be scripted).

### 7.6 G0, a short spike (about 1 hour, with Raushan)

Connect Google on the dev store with the app unpublished (test users only), then check:
- whether it works behind the password page
- what name Google's chooser shows
- that guest and email-code accounts are matched by email
- the in-app browsers
- whether a logo forces review

Then publish, or wait until launch, depending on the answers (AH17).

---

## 8. Shopify's account pages: making them ours

### 8.1 Admin steps (Raushan; I'll guide each one with screenshots of the before and after)

1. **Settings → Checkout → Customize** (one editor styles checkout, sign-in and accounts):
   - **Logo:** the horizontal wordmark, about 140px wide.
   - **Colours:**
     - header and page: Soft blush `#FBF1EE`
     - cards: white
     - text: Cocoa Deep `#4E3A31`
     - buttons and links: Cocoa Deep with Cream text (replaces the blue)
   - **Fonts:** Jost for body and Cormorant Garamond for headings, if both are in Shopify's library (checked in B0). Otherwise Jost for both; a lookalike serif would look worse than none.
   - **Corners:** the largest option, the closest to our rounded cards (pill buttons may not be offered).
   - **Sign-in page:** a desktop photo from `../crochet/` (the sunflower bouquet in hand).
2. **Customer accounts → Orders page:** "When there are no orders, show" → the **Bestsellers** collection.
3. **Menu (Customer account main menu):**
   - **Orders, Profile, Saved, Help**
   - "Track an order" moves to the signed-out sheet only, because it's pointless once you're signed in
   - the same menu also feeds the signed-out sheet, so B0 checks whether one menu can serve both. If not, we keep "Track an order" in it
4. **Domain:** `account.yarnbasket.in`, which can only be connected once yarnbasket.in moves to Shopify (at launch). Until then the address shows `shopify.com/78941028489`.

### 8.2 What will still look like Shopify

The left-hand menu layout, their page widths and their font sizes. We don't send people there for anything routine: only editing and full order details.

---

## 9. Look and motion

| Element | Token / rule |
|---|---|
| Page ground | `scheme-soft` (Soft blush), white cards with `--radius-md` and the card shadow from the results page |
| h1 greeting | Cormorant Garamond italic 600, the same size as the Saved page's h1 |
| Section headings (h2) | the theme's section heading style, with a "See all ›" link at the right |
| Status chips | Jost 500 at 13px; Blush for in-progress, Sage tint for Delivered, Cocoa outline for Cancelled. The word always shows, so colour is never the only signal |
| Help panel | Blush `#F2D4CC` rounded panel, the one Blush moment on the page |
| Buttons | the theme's pills: primary Cocoa Deep, secondary outline |
| Avatar | Blush circle, Cocoa Deep initial, 40px on the page, 32px in the header |
| Arrival | sections use the motion plan's `data-arrive` (fade + 12px rise, `--dur-enter`, `--ease-in-out`, staggered 60ms); nothing moves while scrolling a swipe row |
| Buy again | the button shows "Adding…" and then the cart pop-up, with no spinner |
| Reduced motion / lite | no movement anywhere, fades only |

---

## 10. Accessibility (WCAG 2.2 AA)

| Criterion | How |
|---|---|
| 1.3.1 | One h1 (greeting), h2 per section, and each order card is an `<article>` with an h3 ("Order #1042"). Your details is a `<dl>` |
| 1.4.1 | Status is always a word plus an icon, never colour alone |
| 1.4.3 / 1.4.11 | Taupe Ink for small text; Cocoa outlines on white; status chips checked at 4.5:1 |
| 1.4.10 | Reflows at 320px and 400% zoom; tables are never used for layout |
| 2.4.4 | Link text says where it goes: "Edit name (opens your Shopify profile)" for screen readers, and "Track parcel (courier site, new tab)" |
| 2.4.3 / 2.1.2 | Menu: focus goes in on open and returns on close; Esc closes; no trap |
| 2.5.3 | The header button's name is "Account", matching the word |
| 2.5.8 | 48px targets everywhere |
| 4.1.3 | Status messages: "Added 2 pieces to cart", "1 piece is sold out", "You're signed out" |
| Forced colours | Chips and avatar keep a `CanvasText` border |
| Real phones | VoiceOver (iOS Safari) and TalkBack (Chrome) on the menu, the account page and sign-out, before launch |

---

## 11. Speed

- **The account page is plain Liquid,** drawn on the server. Its only script is Buy again (an `account-page.js` of at most 2 KB gzipped, loaded only on that page) plus the existing `saved-page.js` for the Saved and Recently viewed rows.
- **The menu needs no new JavaScript:** a native popover with CSS anchor positioning. In browsers without anchoring, it's absolutely positioned under the button. theme.js isn't touched (it has about 130 bytes left).
- **Signed-in pages skip Shopify's account script** (about 10 KB) if Shopify only adds it when the component is on the page (B0 checks).
- `noindex` on `/pages/account`, like Saved and Track.

---

## 12. Build stages

- **B0, spike (about half a day, signed in on the dev theme):**
  - `customer.orders`, fulfilments, tracking links, delivery status, `default_address` and `accepts_marketing` in Liquid
  - sign-out `return_url`
  - whether Shopify's script loads when the component is absent
  - the restyled sheet's contrast
  - whether Jost and Cormorant are in the branding editor's font list
  - whether one account menu can serve both the sheet and Shopify's pages

  I report back before B1.
- **B1, sign out + the signed-in menu:**
  - desktop menu panel
  - drawer row → account page
  - the signed-out pop-up
  - the restyled sign-in sheet
- **B2, the account page, signed in:** greeting, orders (cards, Buy again, Need help), Saved, Your details, Help, Recently viewed, Sign out.
- **B3, the account page, signed out and empty:** sign-in card, no orders yet, no saved items.
- **B4, Shopify's pages:** Raushan does §8.1 with me, and we compare screenshots before and after.
- **G0 + Google setup (§7):** can run any time, in parallel with B1–B3, because it's admin only.
- **B5, checks:**
  - `check.mjs`: the signed-out page (axe, phone and desktop), menu keyboard behaviour on a signed-out stand-in, the sign-out link present
  - Signed-in states can't be scripted, because signing in needs a real email code. They get a written checklist that Raushan runs once on his session, with screenshots.

### Files

| File | Change |
|---|---|
| `sections/account.liquid`, `templates/page.account.json` | new: the account page |
| `snippets/account-order-card.liquid` | new |
| `snippets/account-menu.liquid` | new: the signed-in button and popover |
| `snippets/account-button.liquid` | signed in → render `account-menu` instead; more variables for the sheet |
| `sections/header.liquid` | drawer row → account page when signed in (shared hot spot: claim first) |
| `assets/account-page.js` | new, at most 2 KB gzipped: Buy again and the signed-out pop-up |
| `snippets/icon.liquid` | `sign-out` |
| `locales/en.default.json` | `account.*` (read, modify, write) |
| `snippets/meta-tags.liquid` | `noindex` on the account page |
| `tools/check.mjs` | an "Account page" block (shared: claim first; another session has it modified right now) |

### Later (phase C, not in this build)

- **C1:** an app block on Shopify's order page: "Need help with this order? WhatsApp us". Do it if people often message without an order number.
- **C2:** a Saved page inside Shopify's account, with saved items kept on every device (round 1 L1).
- **C3:** a GST invoice download, with the GST setup.

---

## 13. What's not in this plan

Loyalty points, referrals, store credit, reviews, gift reminders and phone OTP sign-in. Each needs an app, a Plus plan or a business decision first (round 1 §14).

---

## 14. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| AH1 | Approach | **B:** our own account page + branded Shopify pages for editing (§2) |
| AH2 | The signed-in dropdown | **Our own menu**, with Sign out; Shopify's sheet only for signing in (§5) |
| AH3 | Phones, signed in | **The drawer row goes to the account page** (§5.3) |
| AH4 | Account page shape | **One scrolling page** with jump tiles on phones; two columns on desktop. Not tabs (§4) |
| AH5 | How many orders on the page | **The latest 3**, then "All orders" on Shopify's page |
| AH6 | Order card actions | **Track parcel / Buy again + Need help? (WhatsApp)** |
| AH7 | Your details on our page | **A read-only summary with "Edit"** going to Shopify's Profile |
| AH8 | Sign out: where | **Desktop menu, the account page, Shopify's pages.** Not in the phone drawer |
| AH9 | Sign out: confirm first? | **No**, with a "You're signed out" pop-up after |
| AH10 | After sign out, land on | **The same page** if Shopify allows it (B0), else home |
| AH11 | What sign-out clears on the device | **Keep Saved, clear Recently viewed** |
| AH12 | "Download or delete my data" link | **Yes** (DPDP), going to the contact page |
| AH13 | "Ask for a custom piece" on the account page | **Yes**, WhatsApp |
| AH14 | Shopify branding: when | **Now on the dev store** (it's UI, not launch admin), domain at launch |
| AH15 | Shopify's account menu | **Orders, Profile, Saved, Help** |
| AH16 | Phase C app blocks | **After launch, only if needed** |
| AH17 | Google sign-in: when | **Now: run G0 on the dev store this week** (it's mostly admin, about 1.5 hours with the spike), turn it on as soon as G0 passes, and redo the domain values at launch. Waiting until launch week means testing sign-in during the busiest week |
| AH18 | Which Google account owns the Cloud project | **The business Gmail**, plus a second owner |
| AH19 | Consent-screen logo | **Not now** (it triggers Google's brand review); add it at launch with the domain |
| AH20 | Shopify's "Continue with Shop" button | **Turn it off if the admin allows it** (G0 checks); otherwise it stays, because we can't hide it inside the sheet |

## 15. Sources (checked 2026-10-02)

- Account component (no sign-out in its menu): https://help.shopify.com/en/manual/customers/customer-accounts/customize-customer-accounts/account-component
- `<shopify-account>` reference (variables, slot, part, events): https://shopify.dev/docs/api/storefront-web-components/components/shopify-account
- Customising customer accounts (what non-Plus can change): https://help.shopify.com/en/manual/customers/customer-accounts/customize-customer-accounts/customize
- Branding API and custom fonts are Plus only: https://shopify.dev/docs/apps/build/checkout/styling/customize-typography
- Customer account UI extensions (all plans, full pages): https://shopify.dev/docs/api/customer-account-ui-extensions/latest
- `customer` in Liquid with current accounts (30-day session fix): https://community.shopify.dev/t/logged-in-customer-details-not-available-in-online-store-theme-with-new-customer-accounts-through-the-customer-liquid-object/16897
- Sign in with Google setup: https://help.shopify.com/en/manual/customers/customer-accounts/sign-in-options/social-sign-in/google
- `routes.account_logout_url`: https://shopify.dev/docs/api/liquid/objects/routes
