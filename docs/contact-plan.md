# Contact page

**Status: built 2026-10-08, waiting for Raushan's look on a phone and one real send.** Decisions in `decisions.md`. Guarded by `npm run check -- --only 23`. Preview: `/pages/contact?view=contact` (until the page's template is set to `contact`, plain `/pages/contact` shows the page without the quick answers).

Mockups (the page as built): `docs/mockups/contact-360.png`, `contact-1280.png`.

## Context

`/pages/contact` is the store's default Contact page and shows only its title: `theme/sections/page.liquid` has no case for it. Seven places already send shoppers there when WhatsApp isn't set or as a plain "Contact us" link (footer Help list, header Help menu, account Help block, order cards, Track order, Saved, the product page's "ask" link, search's "custom piece" card). `docs/account-hub-plan.md` also promises that the page arrives with the order number or the data request filled in, which nothing does yet.

The page has two jobs: get a shopper to the right help in one tap, and give everyone else a form that works.

Decided with Raushan (2026-10-08):

- **WhatsApp first, form below.** A damage claim needs a video, and only WhatsApp carries one.
- **Short legal block.** Full address and GSTIN stay in the Terms.
- **No Call button.** The number is shown as text beside WhatsApp.
- **Reply promise: "usually within a day"**, Monday to Saturday, 10am to 6pm. Complaints keep the Terms' promise: acknowledged within 48 hours.

## The page

One calm Soft blush background (`scheme-soft`), the same left-aligned head as Track order, the form on a white card.

### Phone (360 wide), top to bottom

```
(mail icon)
SAY HELLO                                   eyebrow
We'd love to hear from you                  h1, serif italic
We usually reply within a day.              lead
Mon to Sat, 10am to 6pm

[ (W) Chat on WhatsApp ]                    primary button, full width
+91 93219 79410                             plain text, selectable

WHAT DO YOU NEED?                           h2 as eyebrow
(package) Track an order                >   → /pages/track-order
(hook)    Custom or bulk order          >   → WhatsApp, prefilled
(replace) Damaged or wrong item         >   → WhatsApp, prefilled
          Within 48 hours, with your unboxing video
(mail)    Something else                >   → #ContactForm

┌ Send us a message ──────────────────┐     h2, white card
│ Name                                │
│ Email                               │
│ Phone or WhatsApp number (optional) │
│ What is it about?   [select]        │
│ Order number (optional)             │
│ Message                    0 / 1000 │
│ [ Send message ]                    │
│ We use your details only to reply.  │
│ Privacy policy                      │
└─────────────────────────────────────┘

OTHER WAYS TO REACH US
(@) weyarnbasket@gmail.com    (I) @yarnbasket.in

BUSINESS DETAILS                            small, muted
Yarn Basket · Bihar, India
Grievance officer: Priya Singh, email, number,
"We acknowledge complaints within 48 hours."
Full details in our Terms of service  >

— then the FAQ section (compact), 4 questions —
```

### Desktop (990px and up)

Two columns on the FAQ section's grid (`4fr / 7fr`): the head, WhatsApp button, shortcuts, other channels and business details on the left, sticky under the header; the form card on the right. 750 to 989px: one column, 34rem wide like Track order.

### The shortcut rows

Each row is one link, 56px tall, icon + label + arrow, with the arrow nudge on hover used by `.track-order`. They exist so most people never need the form.

- Without a WhatsApp number in Theme settings → Social, the WhatsApp button and the two WhatsApp rows are left out, and "Custom or bulk order" and "Damaged or wrong item" jump to the form with the topic chosen (`#ContactForm` + `?topic=`).
- Email and Instagram show only when filled in, as in the footer.

### The form: fields

| Field | Name sent to Shopify | Type | Required | Notes |
|---|---|---|---|---|
| Name | `contact[name]` | text | yes | `autocomplete="name"`; filled from the signed-in customer |
| Email | `contact[email]` | email | yes | `autocomplete="email"`, `inputmode="email"`, no spellcheck; filled when signed in |
| Phone or WhatsApp number | `contact[phone]` | tel | no | `autocomplete="tel"`; hint "So we can reply on WhatsApp" |
| What is it about? | `contact[Topic]` | native `<select>` | yes | Order help · Custom or bulk order · Damaged or wrong item · A question about a product · My data (download or delete) · Something else |
| Order number | `contact[Order number]` | text | no | Hint "It starts with #, and is in your order email". Shown for Order help and Damaged; always shown without JavaScript |
| Message | `contact[body]` | textarea | yes | 5 rows, `maxlength="1000"`, a characters-left count as in `cart-note` |

Choosing "Damaged or wrong item" shows a note under the select: "Photos and videos can't be sent from this form. WhatsApp is quickest", with the WhatsApp link. Shopify's contact form can't take attachments.

**How Shopify's contact form works** (the only Shopify-specific part):

- `{% form 'contact' %}` posts to `/contact` and Shopify emails the submission to the store's email. No app, no backend, nothing stored in the theme.
- Any `contact[Anything]` field is added to that email under its name, which is how Topic and Order number get through.
- Shopify may put its own bot check (hCaptcha) between the post and the result. A `fetch` submit breaks on that, so **the form posts as a normal page load**; JavaScript only adds polish.
- After the post the page reloads with `form.posted_successfully?` or `form.errors`, and typed values come back through the `form` object.

### The form: behaviour

- **Labels sit above the fields, always visible.** No placeholder-as-label. Optional fields say "(optional)"; required ones don't carry an asterisk. A line above the form says "All fields are needed unless marked optional."
- **Fields:** 48px tall, 16px text (iOS doesn't zoom), 1.5px line, `--radius-sm`, white, the site's rose focus ring. Same look as `.cart-note__field`.
- **Errors:** checked when a field is left and on submit, never while typing. The message sits under its field with `aria-describedby` and `aria-invalid`, in the newsletter's error colour (#9A3F33) with an icon, so colour isn't the only signal. On submit, focus goes to the first wrong field. Server errors (`form.errors`) render the same way, plus a summary at the top with `role="alert"` that links to each field.
- **Sending:** the button reads "Sending…" and can't be pressed twice.
- **Sent:** the form is replaced by a panel with `role="status"`, focused: a check icon, "Thank you! Your message is on its way.", "We usually reply within a day, Monday to Saturday.", and two links (Continue shopping, Track an order). It arrives with the newsletter's `msg-in` spring, and stays still under reduced motion.
- **Arriving with the form filled in:** a small script reads `?topic=`, `?order=` and `?about=` from the address, sets the select and order number, and starts the message. Liquid can't read the query string, so this is JavaScript; without it the form is just empty.
- **Motion:** `data-arrive="lines"` on the head and `data-arrive="stagger"` on the shortcut rows, as on other pages. Opacity and transform only.

### Accessibility checklist

- One `h1`; "What do you need?", "Send us a message", "Other ways to reach us" and "Business details" are `h2`.
- Every control has a real `<label for>`; hints and errors are tied with `aria-describedby`.
- Every tap target is 44px or more. Everything works at 320px and at 200% text with no sideways scroll.
- Links that open WhatsApp or Instagram say "opens in a new tab" to screen readers (`accessibility.new_window`).
- The whole page works by keyboard and without JavaScript.
- axe (WCAG 2.2 AA) clean on phone and desktop, in the empty, error and sent states.

## Build

### New files

- `theme/snippets/contact-body.liquid`: the whole page and its `{% stylesheet %}`, following `track-order-body.liquid`.
- `theme/sections/contact.liquid`: renders the snippet, like `sections/track-order.liquid`.
- `theme/templates/page.contact.json`: the `contact` section, then the existing `faq` section with `compact` on and four questions (delivery time, the "Shipping and offers" block, damaged items, custom orders).
- `theme/assets/contact.js`: deferred, loaded only on this page. Validation messages, the order-number show/hide, the character count, the prefill from the address, the "Sending…" state. Target: under 2KB.
- `docs/contact-plan.md`: this plan, kept up to date as built, plus mockups in `docs/mockups/contact-360.png` and `-1280.png`.

### Changed files

- `theme/sections/page.liquid`: add `when 'contact'` → `render 'contact-body'`, so the page works whatever template the admin has picked (the existing pattern for saved, track-order and account). The FAQ rows only appear through the `page.contact` template.
- `theme/locales/en.default.json`: a new `contact` group for every string on the page.
- `theme/config/settings_schema.json`: under Social, a "Contact hours" text setting (default "Monday to Saturday, 10am to 6pm") and a "Grievance officer" text setting (default "Priya Singh"). The email setting's info line changes from "Shown as an email button in the footer" to cover the contact page too.
- Fallback links that should arrive with the form filled in:
  - `theme/snippets/account-body.liquid`: order help → `?topic=order&order=<name>`; "Ask for a custom piece" → `?topic=custom`
  - `theme/snippets/track-order-body.liquid`: `?topic=order`
  - `theme/sections/product.liquid`: `?topic=product&about=<product title>`
  - `theme/snippets/search-start.liquid`: `?topic=custom&about=<typed words>`
  - `theme/sections/saved-item.liquid`: `?topic=product`
- `theme/snippets/structured-data.liquid`: on this page, `ContactPage` data with the Organization's `contactPoint` (customer service, email, the number, English and Hindi, India). **SEO-sensitive: flagged for your approval at review.**
- `tools/check.mjs`: a new check 23 (below). `tools/audit.mjs` already crawls `/pages/contact`.
- `docs/decisions.md` and `docs/launch-checklist.md`: the four decisions above, and the launch items below.

### Reused, not rebuilt

- `icon` snippet: `mail`, `whatsapp`, `instagram`, `package`, `hook`, `replace`, `arrow`, `check` all exist.
- `.btn`, `.btn--ghost`, `.link`, `.eyebrow`, `.section`, `scheme-soft`, the focus ring and the arrival system from `theme/assets/base.css`.
- The WhatsApp link pattern (strip `+`, spaces and dashes; `wa.me/<number>?text=`) from `track-order-body.liquid`.
- The FAQ section as it is; its "Shipping and offers" answer writes itself from the cart settings.
- The characters-left pattern from `cart-note.liquid` and `cart.js`.

### Admin (Admin API, with your go at build time)

- Set the Contact page's template to `contact`, and its SEO title and description ("Contact Yarn Basket: WhatsApp, email or a message. We usually reply within a day.").
- Launch checklist additions: send a test message and confirm which inbox it lands in (Settings → Notifications → sender email); confirm the live theme's Social settings carry the hours and grievance officer after publishing.

### Order of work

1. ListAgents, and claim the shared files (`en.default.json`, `page.liquid`, `check.mjs`, `decisions.md`, `account-body.liquid`, `product.liquid`). The working tree has another session's uncommitted changes in the locale file and `check.mjs`.
2. Confirm the `contact` form's field names and the `form` object's values against the Shopify Dev MCP before writing markup.
3. Snippet, section, template, locale strings, settings.
4. `contact.js`.
5. Prefill links in the five other files.
6. Structured data.
7. Check 23, mockup screenshots, docs, decisions.
8. Commit with explicit paths only. No push until you've looked at it on your phone.

## Verification

- `shopify theme check` on the new and changed files.
- **Check 23** (`npm run check -- --only 23`), on a 360px phone and a 1280px desktop:
  - axe clean in three states: empty, submitted with errors, sent
  - no sideways scroll at 320px; every control at least 44px tall; inputs at 16px text
  - an empty submit puts focus on the first wrong field, and every wrong field has a message tied to it
  - `?topic=order&order=1042` selects Order help and fills the order number
  - the order number field hides for "Something else" and shows for "Order help"
  - with JavaScript off, every field is visible and the form posts
  - the WhatsApp links carry the right prefilled messages
  - no script errors
- `npm run check -- --only 4,5,9,13,20` for the pages whose links changed (accessibility, reduced motion, account, product).
- One real submission on the dev store: the email arrives with Name, Email, Phone, Topic, Order number and Message; the sent panel shows; a second run with a bad email shows the error and keeps what was typed.
- By hand: VoiceOver on iPhone through the whole form; the page at 200% text; reduced motion on.
- Not needed: `npm run check:money`. Nothing here touches prices, the cart or a product list.

## As built (2026-10-08)

What differs from the plan above, and what was found on the way:

- **Shopify's bot check opens over the page, not on another page.** An automated send from the check's browser got a "drag the icon" puzzle on top of the form. The form still posts as a normal page load once it is solved. The Send button goes back to "Send message" after 6 seconds, so closing the puzzle doesn't leave it stuck on "Sending…".
- **The sent panel and Shopify's own error list have not been seen yet.** Claude doesn't solve bot checks, so no message was sent. One real send by hand is still owed (launch checklist).
- **Field edges are Taupe (#8E7468), not the page's faint line.** 4:1 on white, so the edge of a field can be seen (WCAG 1.4.11). The faint line is 1.5:1.
- **The left column is not sticky on desktop.** It is as tall as the form, so there is nothing to hold.
- **"Full details in our Terms of service" is a plain underlined link.** The capitals link style wrapped on a phone and its underline ran through the second line.
- **The topic and order number survive a failed send through the browser's session storage.** Shopify hands back the name, email, phone and message, but not fields of our own.
- **`contact.js` is 4KB (about 1.6KB gzipped)**, over the 2KB target; it loads on this page only.
- **The form's field names were not confirmed against the Shopify Dev MCP** (not connected in the session). `shopify theme check` passes and the form posts to `/contact#ContactForm`.
- **Check 23 has 18 lines** on 360, 320 and 1280px: fit, one h1, 44px controls, 16px labelled fields, the empty send, messages clearing, the order number following the topic, axe as the page opens and with messages, a filled-in arrival, the WhatsApp messages, and no JavaScript.
- **Found, not fixed (not this page):** the phone menu's "Custom orders" tile opens WhatsApp with "I&#39;d like to ask…" in the message. The `t` filter escapes the apostrophe before `url_encode`; `replace: '&#39;', "'"` first fixes it, as the product page does. It is in `theme/sections/header.liquid`, which another session has open.

Still to do, with Raushan's go: set the page's template to `contact` and its SEO title and description (Admin API); approve the `ContactPage` structured data.
