# Account plan, round 3: the sign-in (code) page, Shopify's profile and order pages, and Help in two places

Status: **Approved 2026-10-03.** AB1 is built (Help is out of the account dropdown). The branding session (§3.7) is next, with Raushan in the admin.

### Raushan's answers (2026-10-03)
- **AB1:** remove Help from the account dropdown (approved). He asked why the navigation's Help holds Track order and Shipping & delivery. The answer:
  - It's the customer-service menu approved in nav-plan §3. "Where is my order?" is the most common question, and most buyers are guests who look under Help, not Account.
  - Shipping & delivery (time, charges, COD) is checked before buying, and it's a required policy page.
  - So that menu stays as it is.
- **AB2:** a product photo. He chose **C, pink tulips with a daisy** (`docs/branding/signin-photo-pink-tulips-daisy.jpg`: a 4:5 portrait crop of `crochet/Bouquet/BQ_TLP_Pink_2_DSY_1 1.png`, 1003 × 1254, 189 KB).
- **AB3:** match our account page (Soft blush page, white cards, Cocoa buttons and links).
- **AB4:** not asked; the recommendation stands (Jost for headings if Cormorant isn't in the list).
- **AB5:** now, at the next sitting.
- **Ready to upload:** `docs/branding/logo-horizontal-640.png` (trimmed, 640 × 196, transparent) and the photo above.

Follows `account-hub-plan.md` (round 2, built: our account page and signed-in menu). Round 2 §8 already listed Shopify's branding as an admin step; this round turns it into an exact spec, and settles Help.

---

## 0. What Raushan raised (2026-10-03)

1. **The code (OTP) page is entirely Shopify's default.** It doesn't follow our theme.
2. **"Edit your details" opens a default-looking profile page** (screenshot: `shopify.com/78941028489/account/profile`: black "Yarn Basket" text, blue Edit / Add / Sign out, grey menu).
3. **Help appears twice:** in the top navigation and in the account dropdown.

---

## 1. Why these pages look like that

Three pages aren't in our theme at all. Shopify hosts them on its own address:

| Page | When people see it | Address today |
|---|---|---|
| **Sign-in / code page** | After typing their email in the sign-in sheet: "Enter the 6-digit code" | `shopify.com/authentication/78941028489/…` |
| **Profile** | "Edit your details" on our account page | `shopify.com/78941028489/account/profile` |
| **Order page** | "Details" on an order card, "All orders" | `shopify.com/78941028489/account/orders/…` |

- **Nobody has styled them yet.** They show Shopify's defaults: no logo (just the shop name in black), blue buttons and links, Shopify's font, a white page. That was round 2 §8, which you'd parked as "item 4, later".
- **We can't move them into our theme.** Signing in and editing your details go through Shopify's Customer Account API, which only works from Shopify's own pages, a Shopify app, or a separate headless site.
  - The old theme templates (`customers/login.liquid`, `customers/account.liquid`) only worked with classic accounts. Those were retired in February 2026 and can't be turned back on.
  - Building our own sign-in would mean a second, separate login, which is worse for shoppers and for security.

**So the fix is styling them, not replacing them.** Shopify's checkout and accounts editor (Settings → Checkout → Customize) styles the sign-in page, the account pages and checkout together. Since May–June 2026 that includes the sign-in page's own brand photo.

## 2. What we can change, and what we can't

| | Sign-in / code page | Profile and order pages | Checkout (same editor, a bonus) |
|---|---|---|---|
| Logo (our horizontal logo instead of black text) | ✅ | ✅ | ✅ |
| Colours: page, header, cards, buttons, links (Cocoa instead of blue) | ✅ | ✅ | ✅ |
| Fonts: from Shopify's font library (Jost and Cormorant if listed, §3.3) | ✅ | ✅ | ✅ |
| Corner roundness | ✅ | ✅ | ✅ |
| A brand photo beside the form (desktop) | ✅ | – | – |
| Menu links (Orders, Profile, Saved, Help) | – | ✅ (done in round 2) | – |
| Product suggestions when there are no orders | – | ✅ (Orders page) | – |
| Our own address instead of `shopify.com/7894…` | ✅ at launch | ✅ at launch | ✅ at launch |
| Layout, wording, our header/footer, our animations | ❌ | ❌ | ❌ |
| Our own font files, or a different look per page | ❌ Plus only | ❌ Plus only | ❌ Plus only |

**What it will feel like afterwards:** the same colours, logo, fonts and rounded shapes as the store, with Shopify's simpler layout. At launch, `account.yarnbasket.in` replaces the `shopify.com/78941028489` address. That address is a big part of the "this isn't the store" feeling, and only the domain move can fix it.

---

## 3. The spec: every editor setting, with its value

### 3.1 Logo

- **File:** `Brand Kit/1-logo/logo-horizontal-colour.png` (basket icon + "Yarn Basket"). I'll export a trimmed 2× PNG (about 640 × 160) into `docs/branding/`, ready to upload.
- **Alignment:** left, as in our header.
- **Width:** about 160px on the sign-in page and 140px on the account and checkout pages.

### 3.2 Colours

Same roles as our account page, which you approved: a Soft blush page with white cards.

| Editor field | Value | Our token |
|---|---|---|
| Header background | `#FBF1EE` | Soft blush (our header) |
| Main background | `#FBF1EE` | Soft blush |
| Sections / cards | `#FFFFFF` | white cards |
| Text | `#4E3A31` | Cocoa Deep |
| Secondary text | `#705B52` | Taupe Ink (passes AA for small text) |
| Buttons (primary) | `#4E3A31` with `#FBF6EF` text | Cocoa Deep / Cream, like our "Sign in" |
| Accent: links, Edit / Add, toggles, focus | `#4E3A31` | Cocoa Deep (never Rose: it fails contrast) |
| Field borders | `#A08A80` | 3.26:1 on white, like our restyled sheet |
| Errors | `#A3341F` | a brick red that passes AA on white and on Soft blush |
| Order summary background (checkout) | `#FBF1EE` | Soft blush |

Every pair is checked for WCAG AA after it's set, using screenshots you send me of the real pages.

### 3.3 Fonts

- **Body:** **Jost**, if it's in the editor's list.
- **Headings:** **Cormorant Garamond**, if it's listed.
- If either is missing, I check the list with you and pick the closest match. **Recommendation (AB4): Jost for both if Cormorant isn't there.** A look-alike serif looks worse than none, and Shopify's headings are small (Cormorant needs size to read well, as we saw in round 1).

### 3.4 Shape

The largest corner radius, so buttons and cards match our rounded pills and cards.

### 3.5 Sign-in page brand photo (desktop: the form on the left, the photo on the right)

- **Recommendation (AB2):** a real product photo, warm and calm, with no baked-in text. For example, the sunflower bouquet held in a hand, which is our hero photo, so the sign-in feels like the store.
- I'll pick 3 candidates from `../crochet/` and show them to you. Then I export the chosen one as a portrait JPG (about 1600 × 2000, under 600 KB) into `docs/branding/`.
- **Phones don't show the photo** (Shopify's layout), so the phone sign-in page is the logo, the form and our colours.

### 3.6 Other editor settings

- **Orders page, no orders yet:** show the **Bestsellers** collection (it replaces Shopify's single random photo with "Ready to shop?").
- **Buy again on order pages:** on, which matches our account page.

### 3.7 How we do it

1. **I prepare** the logo PNG, the 3 photo candidates, and this table as a checklist.
2. **Together** (about 30 minutes, you in the admin, me guiding): Settings → Checkout → **Customize**, then set §3.1–§3.6 and save.
3. **Check:** open the sign-in page (sign out, then Sign in), the code page, Profile and an order page, on desktop and phone. Send me screenshots, and I check contrast and anything that looks off.
4. **Log it:** the values go into `decisions.md`, and the launch checklist item "Checkout & accounts branding" gets ticked.

---

## 4. Help in two places

**Where Help is today:**

| Place | Goes to | Who it's for |
|---|---|---|
| Top navigation **HELP ▾** (desktop), and Help in the phone drawer | The Help menu: FAQ, Track order, Contact, Our story | Everyone |
| Account dropdown **Help** (desktop, signed in) | Our account page's "Need help?" panel (WhatsApp, custom piece) | Signed-in shoppers |
| Shopify's account pages: menu **Help** | Our account page's "Need help?" | Signed-in shoppers on Shopify's pages, where our navigation isn't shown |
| Each order card: **Need help?** | WhatsApp, with the order number filled in | Someone with a problem with that order |

**Recommendation (AB1): remove Help from the account dropdown, and keep the rest.**
- On desktop, the navigation's HELP is about 300px away, so the dropdown copy adds a choice without adding a place.
- Help with an order is better served by **Need help?** on that order's card, which fills in the order number.
- **Keep Help in Shopify's account menu:** those pages have no store navigation, so it's the only way to help from there.
- **The dropdown becomes:** you (→ your account) · Orders · Saved · Your details · Sign out. That's four rows plus you, calmer.

Alternative: rename the dropdown item to **"Order help"** and point it at your latest order's WhatsApp message. It's more specific, but it duplicates the order card's button.

---

## 5. What's not in this round

- **Blocks inside Shopify's pages** (round 2 phase C1/C2), for example "Need help with this order? WhatsApp us" on Shopify's order page. These need a small private app. Later, if needed.
- **Google sign-in** (round 2 §7): its own session, already planned. Once on, it adds a "Continue with Google" button to the sign-in page styled here.
- **The account domain** `account.yarnbasket.in`: at launch, when yarnbasket.in moves to Shopify.

---

## 6. Work and order

| Step | Who | Time |
|---|---|---|
| AB1: remove Help from the dropdown (theme, one snippet, plus a check update) | me | 15 min |
| Prepare the logo PNG and 3 photo candidates | me | 20 min |
| Branding session (§3.7) | you + me | 30 min |
| Check screenshots, contrast, log | me | 15 min |

## 7. Sources (checked 2026-10-03)

- Checkout and accounts editor, style settings: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style
- Sign-in page refresh, customisable in the editor (20 May 2026): https://changelog.shopify.com/posts/draft-a-refreshed-sign-in-page-for-customer-accounts-now-customizable-in-the-editor
- Customer accounts design uplift (17 June 2026): https://changelog.shopify.com/posts/customer-accounts-get-a-design-uplift
- Unified branding across checkout, accounts and sign-in: https://changelog.shopify.com/posts/draft-unified-branding-customization-across-checkout-and-customer-accounts
- What non-Plus stores can customise: https://help.shopify.com/en/manual/customers/customer-accounts/customize-customer-accounts/customize

## 8. Decisions for Raushan

| # | Question | Recommendation |
|---|---|---|
| AB1 | Help in the account dropdown | **Remove it**; keep Help in the navigation, on Shopify's pages and on each order card (§4) |
| AB2 | The sign-in page photo (desktop) | **A real product photo,** from 3 candidates I show you |
| AB3 | Colours on Shopify's pages | **Soft blush page, white cards, Cocoa buttons and links**, matching our account page (§3.2) |
| AB4 | If Cormorant isn't in Shopify's font list | **Jost for headings too** |
| AB5 | When to do the branding session | **Now on the dev store**, as decided in round 2 (AH14); it's the same "item 4" you parked, minus Google |
