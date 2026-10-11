# Help pages and policies

## Context

The shop pages are built, but everything a shopper (or Razorpay's KYC reviewer) looks for under "Help" is missing. Today the store has four pages (Contact, Saved, Track your order, Your account), a Privacy policy, and Help menus with only two real links. There is no Refund policy, no Shipping policy, no Contact information policy, no FAQ page and no Our story page, and the Terms are still a draft file. Delivery time is also worded three different ways across the site.

Outcome: every Help link leads somewhere real, every rule is written once, and the store passes a payment-gateway review.

Decided with Raushan (2026-10-11):
- Shipping & delivery and Returns & refunds are **Shopify's own policy pages** (one copy each, styled by our theme). No duplicate theme pages.
- Dispatch is **1 to 2 working days for every listed piece**. Custom orders: time agreed on WhatsApp.
- Our story: **I draft, Raushan corrects** and sends 2 to 3 real photos.
- Raushan adds the legal-policy scopes to my store login; I save the policies and read them back.

## What gets made

| # | Thing | Where it lives | URL |
|---|---|---|---|
| 1 | Refund policy (returns, cancellations, refunds) | Settings → Policies | `/policies/refund-policy` |
| 2 | Shipping policy | Settings → Policies | `/policies/shipping-policy` |
| 3 | Contact information policy | Settings → Policies | `/policies/contact-information` |
| 4 | Terms of service (existing draft, corrected) | Settings → Policies | `/policies/terms-of-service` |
| 5 | Privacy policy (exists, "Automated") | read once, check our contact details are in it | `/policies/privacy-policy` |
| 6 | FAQ page | theme template + store page | `/pages/faq` |
| 7 | Our story page | theme template + store page | `/pages/our-story` |

## Steps

### 1. Policy text (files in `docs/legal/`, then saved to the store)
- **`refund-policy.html`** (new), matching Terms §6: no change-of-mind returns; damaged, wrong or missing reported within 48 hours with an unboxing video or clear photos; replacement or full refund; refunds in 5 to 7 working days to the original method (COD to UPI or bank); cancellation free before dispatch; custom pieces not cancellable once started; creased bouquet paper is not damage; refused or undeliverable parcels; how to claim (WhatsApp or the Contact form, with the order number).
- **`shipping-policy.html`** (new): India only; dispatch in 1 to 2 working days; courier time after dispatch; fee and free-delivery line taken from Theme settings → Cart at the time of writing (today ₹79 under ₹299, free from ₹299); tracking link by email/WhatsApp and the Track page; wrong address, refused or undelivered parcels; festival delays.
- **`contact-information.html`** (new): Yarn Basket, sole proprietorship of Priya Singh; the Piro address; weyarnbasket@gmail.com; +91 93219 79410; GSTIN 10SVFPS1772F1ZB; grievance officer. (The phone number stays off the Contact page as decided; the law wants it in this policy.)
- **`terms-of-service.html`** (edit): §3 dispatch becomes 1 to 2 working days and the "made-to-order 3 to 7" sentence goes; §5 COD wording becomes partial COD "where available"; "Last updated" date.
- Policies can't hold Liquid, so amounts are plain text. A check (step 6) fails if they stop matching Theme settings.
- Save with `shopPolicyUpdate` through `shopify store execute` (permanent domain), then read each back.

### 2. Policy pages look like ours
Shopify renders `/policies/*` inside our layout with its own classes and no template.
- `theme/assets/base.css`: style `.shopify-policy__container`, `__title`, `__body` (reading width about 40rem, our h1 and `.rte` rhythm, section spacing, 360px safe).
- `theme/layout/theme.liquid`: on `request.page_type == 'policy'`, one quiet line under the text: "Still have a question? Contact us" → `/pages/contact` (help has one place).

### 3. FAQ page
- `theme/sections/faq.liquid`: add a **"Group heading"** block type and raise `max_blocks` from 8 to 30, so one section holds grouped questions and still writes **one** FAQPage JSON-LD. Home, product and contact uses are unchanged.
- `theme/templates/page.faq.json` (new): the `faq` section, full size, about 16 questions:
  - *Orders & delivery:* delivery time; delivery charge, free delivery and gift (the existing automatic "Shipping and offers" block, `snippets/faq-offers-answer.liquid`); where we ship; tracking; changing or cancelling an order.
  - *Returns & refunds:* damaged or wrong item; change of mind; how refunds are paid (each ends with a link to the Refund policy).
  - *Our pieces:* really handmade; will it match the photo; fading; care; small parts and children.
  - *Gifts & custom:* gift note; custom and bulk orders.
  - *Payment & account:* ways to pay; do I need an account.
- Closing line links to the Contact page.
- `theme/templates/page.contact.json`: fix the delivery answer to 1 to 2 working days; add "All questions" link to `/pages/faq`. Same link on the home FAQ (`templates/index.json`, the section's existing `link_label`/`link_url`).
- Create the store page (`pageCreate`, handle `faq`, template `faq`, SEO title and description).

### 4. Our story page
- **Mockup picture first** (phone and desktop) for Raushan's yes, before building.
- Proposed shape, built from the brand kit: a short opening (label, h1, two lines); three chapters of one photo + a few lines each (how it started; who makes it: Priya Singh, Piro, Bihar (Raushan, 2026-10-11: name only Priya, not Punam); how a piece is made); the existing `promise` section; a close with "Shop bestsellers" and "Ask for a custom piece" (→ Contact).
- `theme/sections/story-chapters.liquid` (new, image + text blocks, photos lazy with alt text) and `theme/templates/page.our-story.json` (new). Photos from `../crochet` stand in until the real ones arrive; unknown facts are marked `[to confirm]` in the draft I show, never published as fact.
- `theme/templates/index.json`: the home story section's "Our story" link gets its `link_url` (today it falls back to the home page).
- Create the store page (handle `our-story`, SEO title and description). AboutPage JSON-LD in `snippets/structured-data.liquid`.

### 5. Menus and links
- **Main menu → Help** (`menuUpdate`, full item list): Track order, Shipping & delivery, Returns & refunds, FAQ, Contact us, Our story.
- **Footer → Help:** the same six. "Your account" and "Saved items" leave the footer list (both are in the header on every page); this keeps the list inside its seven-line limit.
- `theme/sections/footer.liquid`: the small policy row skips any policy already linked in the Help list, so Shipping and Refund aren't listed twice.
- `theme/sections/header.liquid`: the demo menu's Help links point at the real URLs.
- `snippets/offer-terms.liquid` already links "Replacement if damaged" to the Refund policy once it exists: verify it does.

### 6. Checks (`tools/check.mjs`, new section 25 "Help pages")
- every link in the header's and footer's Help lists opens a real page (not the home page, not a 404)
- each policy page and both new pages: one h1, axe clean, nothing off the side at 360px and at 200% text
- **the Shipping policy's fee and free-delivery amounts equal Theme settings → Cart** (same idea as check 11)
- "1 to 2" dispatch wording agrees across the product page, Terms, Shipping policy and FAQ
- the FAQ page has exactly one valid FAQPage JSON-LD; the footer lists no policy twice
- run `npm run check -- --only 19,23,25`, then look at each page myself at 360 and 1280.

### 7. Records
- `docs/help-pages-plan.md` (this plan, with "As built"), `docs/decisions.md` entry, `docs/launch-checklist.md` (tick sender email, account page, policies; add "change an amount → also the Shipping policy"), memory.
- Other sessions share this tree: claim `faq.liquid`, `footer.liquid`, `header.liquid`, `base.css`, `check.mjs` first, and commit only my hunks (`base.css` has another session's uncommitted work).

## Needed from Raushan
1. Rerun the store login with two scopes added to the usual list: `read_legal_policies,write_legal_policies`.
2. Confirm for the policies: usual courier time after dispatch (I'll write "3 to 7 days, by location" unless told otherwise); grievance hours Mon to Sat 10am to 6pm; a photo before dispatch for custom pieces; reviews credited by first name.
3. Our story: correct my draft's facts and send 2 to 3 real photos of the making.
4. Read all four policies once before launch (and the CA or lawyer review already on the checklist).

## Not in this piece (kept on the checklist, not dropped)
- Return-policy markup in the product's Google data (SEO step).
- "Partial COD" lines in the policies and FAQ switch on with Theme settings → Cart → Cash on delivery, once Shiprocket Checkout works.
- GST registration in the admin, notification email branding.

## As built (2026-10-11)

Everything in the plan is built and in the store. Not committed.

- **Policies** (`docs/legal/`): Refund, Shipping, Contact information and the corrected Terms, saved with `shopPolicyUpdate` and read back on the storefront. To change one: edit the file, save it again the same way.
- **Policy pages:** `.policy` rules in `theme/assets/base.css`; the wrapper and "Still have a question? Contact us" in `theme/layout/theme.liquid`.
- **FAQ:** group headings and the page-title setting in `theme/sections/faq.liquid`; `theme/templates/page.faq.json` (17 questions, 5 groups); store page `/pages/faq`; "All questions" links on the home and Contact FAQs.
- **Our story:** `theme/sections/our-story.liquid`, `theme/templates/page.our-story.json`, store page `/pages/our-story`, AboutPage data, the home story section's link. Words from Raushan's facts (2026-10-11): Priya taught herself from YouTube, friends loved the pieces and began buying; a keychain takes about half an hour and a bouquet about an hour. Only Priya is named. Two chapters borrow a product photo (the block's "Stand-in photo"); the "Priya" chapter is words only until her photo comes.
- **Menus** (`menuUpdate`): main menu → Help and the footer's Help list are Track order, Shipping & delivery, Returns & refunds, FAQ, Contact us, Our story.
- **Footer:** the policy row skips policies the Help list links. On a 360px phone it is 607px (was 526px): two more Help lines and a second row for "Contact information". Check 19's limit now counts those.
- **Check 25:** 9 checks, all pass. Also passing: 19 (footer), 21 (phone menu), 23 (contact), 4 (axe).

Still open:
- **Raushan:** 2 to 3 real photos for Our story (Theme editor → Our story page → each chapter's Photo, or send them to Claude).
- **Raushan:** read the four policies once; CA or lawyer review (launch checklist).
- Courier time is written as "usually 3 to 7 days after dispatch": correct it if the couriers say otherwise.
- Found on the way, not changed: the announcement bar says "Partial COD available" although COD isn't set up; the theme says free delivery "over ₹299" where the rate is "from ₹299".
