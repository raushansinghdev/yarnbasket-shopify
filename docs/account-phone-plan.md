# Account plan, round 3: the account page on phones

Status: **Built 2026-10-03.** Follows `account-hub-plan.md` (round 2). Raushan asked for all three parts and said to plan, build, test and push in one go.

## 0. What Raushan raised (2026-10-03)

1. On phones the name and email at the top should end in an arrow, be tappable, and open a dedicated "Your details" page. Today the details card is far down the page (after orders, Saved and Recently viewed).
2. Recently viewed on the account page can't be cleared. The Saved page has a "Clear" button for it; it should be the same everywhere.
3. Overall: the account page on phones should be accessible, intuitive and sensible.

## 1. What a phone shows today (signed in)

Greeting → shortcuts (Orders, Saved, Help) → Your orders → Saved → Recently viewed → Your details → Need help? → Sign out → "Download or delete my data".

- The demo page is 2,684 px tall at 390 px wide: about 3.5 screens. Your details starts at about 1,180 px with three orders, and lower still with Saved and Recently viewed rows.
- The greeting looks like the header menu's top row (initial, name, email) but isn't a link, and has no arrow.
- With no orders, the "Bestsellers" label touches the product photos under it (0 px gap).

## 2. The greeting row opens "Your details" (phones)

- **The whole row is one tap target** (initial, "Hi, Raushan", email, and a `›` at the right end), like the header menu's top row and like Google and Amazon.
- **Under 900 px only.** On desktop the Your details card sits beside the orders, so a link to it would be noise. There the row stays plain text, with no arrow.
- **How it's built:** the h1 and email stay plain text. One link at the end of the row holds the `›` and the hidden words "Your details"; its tap area is stretched over the whole row. So a screen reader hears "Hi, Raushan" (heading), the email, then one link, "Your details", and the heading isn't wrapped in a link.
- **Focus:** the ring goes around the whole row. The row is at least 56 px tall (the avatar).

## 3. The "Your details" page

- **Address:** the account page with `?view=account-details` (`/pages/account?view=account-details`). It's an alternate template of the same page, so there is **no admin step** and no new page to create.
- **What's on it,** top to bottom:
  1. "‹ Your account" back link
  2. h1 "Your details"
  3. the same card as before: Name, Email, Phone, Address, Offers by email
  4. "Edit your details ›" (Shopify's Profile, as before)
  5. Sign out
  6. "Download or delete my data"
- **Signed out,** the address shows the normal signed-out account page (sign-in card), so a stale link is never a dead end.
- **Desktop:** the page works there too (one narrow column), but nothing on desktop links to it; the header menu's "Your details" still goes to the card on the account page.
- **Not indexed,** like the account page (`?view=` pages share the page's `noindex`).
- **Demo:** `?view=account-details-demo` shows it with the made-up shopper, for tests. Deleted with the other demo files before launch.

## 4. The account page on phones, after

Greeting `›` → shortcuts → Your orders → Saved → Recently viewed (with Clear) → Need help? → Sign out.

- **Your details leaves the phone page** (it has its own page now). Desktop keeps the card in the right column.
- **"Download or delete my data" moves with it** on phones: it's about the shopper's details, and it was a stray line under Sign out. Desktop keeps it under Sign out.
- **Sign out stays at the end of the page** and is also on the details page, where people look for it.
- **Shortcuts stay** as Orders, Saved, Help. Details doesn't need a fourth tile: the row above them is the way in.
- **"Bestsellers" (no orders yet)** gets a 12 px gap above its photos.

## 5. Recently viewed: Clear

- The row's heading gets the same button as the Saved page, with the same word: **"Clear"**, beside the "Recently viewed" heading.
- A tap empties the list on this device, hides the row, tells screen readers "Recently viewed cleared", and moves focus to the page's heading so keyboard users aren't left on a button that's gone.
- Same on desktop.
- No confirm step and no undo: it's a browsing trail, not a saved list, and the Saved page has none either.

## 6. Accessibility (WCAG 2.2 AA)

| | |
|---|---|
| 1.3.1 | One h1 per page ("Hi, Raushan" / "Your details"). The details are still a `<dl>`. |
| 2.4.4 | The row's link is named "Your details". The back link is "Your account". The clear button says "Clear" and sits in the "Recently viewed" section, right after its heading. |
| 2.4.7, 2.4.11 | Focus ring around the whole greeting row, never hidden under the sticky header. |
| 2.5.8 | Row 56 px, Clear and the back link 44 px tall. |
| 4.1.3 | Clearing is announced in a status line. |
| No JS | The greeting link, the details page and Sign out are plain links. Recently viewed needs JavaScript, so without it there's no row and no Clear. |

## 7. Files

| File | Change |
|---|---|
| `theme/snippets/account-body.liquid` | Greeting link, the details view, Clear button, phone/desktop visibility, Bestsellers gap |
| `theme/sections/account.liquid` | "Show" setting: the account page or Your details |
| `theme/templates/page.account-details.json`, `page.account-details-demo.json` | New: the details view (the demo one goes before launch) |
| `theme/assets/account-page.js` | Clear Recently viewed |
| `theme/locales/en.default.json` | `account.back`, `account.cleared_recent` (the button reuses `saved.clear_recent`) |
| `tools/check.mjs` §13 | New checks, below |

## 8. Checks added (`npm run check` §13)

- Phone: the greeting row's link is shown, is at least 44 px tall, and goes to the details page; the details card isn't on the phone page.
- Desktop: the greeting has no link; the details card is shown.
- The details page (demo), phone and desktop: axe 0 violations, one h1, the details list, Edit, Sign out, and a back link to the account page.
- Recently viewed on the account page: Clear empties the list, hides the row and moves focus to the heading.
