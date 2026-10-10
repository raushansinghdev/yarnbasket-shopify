# Footer

**Status: built 2026-10-06.** Replaces `footer-compact-plan.md`. Decision recorded in `decisions.md`. Guarded by `npm run check -- --only 19`.

Mockups: `docs/mockups/footer-new-320.png`, `-360.png`, `-768.png`, `-1280.png` (as it is today), and `footer-new-contacts-360.png`, `-1280.png` (with the contact channels filled in).

## Why

The old footer was a centred logo, four craft links, a lone "Search" link (which the header already has), a copyright line and two policy links. It had no way to reach help and no contact. Raushan asked for a from-scratch footer: professional, properly aligned, modern, calm, with everything a shop footer needs and no more height than that takes.

## What good practice says

Usability research (Baymard, Nielsen Norman Group) and the large shops agree:

- The footer is the safety net. People scroll to it for help, contact, returns and policies, so those are visible and in plain words.
- Short lists under clear headings, on one grid, left-aligned. Three or four groups.
- A real way to reach a person. For an Indian shop that is WhatsApp and Instagram.
- Legal lines and payment marks last, small.
- One brand moment, and quiet otherwise.
- On phones, open lists up to about 12 links; fold them only beyond that.

## The design: links first, signature last, one left edge

### Phone (526px at 360 wide; the old one was 369px with 7 links)

```
SHOP                 HELP
Bouquets             Track order
Keychains            Contact us
Hair                 Your account
Bag charms           Saved items
Flower pots
Home decor           SAY HELLO
Shop all             (W) (I) (@)

- - - - - - - - - - - - - - - - - - -   (row of stitches)

[basket]  Yarn Basket
          HANDMADE WITH LOVE

© 2026 Yarn Basket · Handmade in India     (↑)
Privacy policy   Terms of service
```

Raushan chose open lists over folded ones (about 380px) and over showing Help only (about 400px): every link is visible with no tap, and the footer is the last thing on the page, so its height pushes nothing down.

### Desktop (424px at 1280; the old one was 441px)

```
[basket] Yarn Basket            SHOP          HELP           SAY HELLO
         HANDMADE WITH LOVE     Bouquets      Track order    (W) (I) (@)
                                Keychains     Contact us
                                …
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
© 2026 Yarn Basket · Handmade in India          Privacy · Terms  [payments] (↑)
```

The signature takes the left five of twelve columns, the lists the rest. From 750 to 989px the signature is on its own row with the lists in a row under it.

### Parts

| Part | Where it comes from |
|---|---|
| Shop list | The main menu's first dropdown, so a craft added to the header appears here too. The section's "Shop list" setting overrides it. The menu's "Hair" reads "Hair accessories" here (`general.hair_accessories`): a bare list needs the whole name |
| Help list | The store's `footer` menu (section setting "Help list"). The menu's name is the heading |
| Say hello | Round buttons for WhatsApp, Instagram and email: only the ones filled in under Theme settings → Social. With none, the column is left out, because Help already has "Contact us" |
| Signature | The basket, the shop's name as text, and the tagline in spaced capitals, linking home. Beside it, one faint outline flower from the brand banner, which never moves (added 2026-10-07 as the footer's one brand touch; 52px on phones, 32px under 350px wide, 68px on desktop) |
| Last lines | Copyright, the store's policies (automatic), payment icons (automatic, once a gateway is on), Back to top |

- Ground: Soft blush, with a hairline on top. The newsletter stays the only Blush band.
- Links: 36px rows on phones and tablets, 32px on desktop, with the underline that draws on hover. Policy links 32px. Contact buttons 40px on phones (three fit half of a 320px screen), 44px from 750px.
- One divider: the row of stitches, above the signature on phones and above the last lines from 750px.
- The signature is first in the markup, so keyboard order matches what a desktop shows; on phones it is moved under the lists with `order`.
- Large text: the two columns become one when the footer is narrower than 15em.

## Tried and dropped

- **The tagline drawn in yarn** (a still "handmade with love" from `tools/yarn-lettering.mjs`). At footer size (about 180px wide on a phone, 220px on desktop) the strand is about 1px and the words read as a scribble. It needs 300px or more, which would make the tagline louder than the name. The tool and its snippet are unchanged.

## What went away

- The four floating corner flowers, their motion and their clearance test (one still flower came back beside the logo on 2026-10-07). With aligned lists there is no clear corner for them. The WCAG 2.2.2 exception recorded for them on 2026-10-01 no longer applies to the footer. They stay in the hero.
- The centred crafts line with dots, and the short rule.
- "Search" in the footer menu.

## Left out on purpose

- A second newsletter form: the home page has the Blush band.
- A Meesho link: it sends shoppers off our own shop.
- Shipping, Returns, FAQ and Our story: those pages don't exist yet. Add each as a line in the Help menu (Content → Menus → Help) when it does; no code change. Help holds seven lines before the phone footer grows.

## Files

- `theme/sections/footer.liquid` (rewritten), `theme/sections/footer-group.json`
- `theme/snippets/icon.liquid`: a `mail` icon
- `theme/config/settings_schema.json`: "Contact email" under Social
- `theme/locales/en.default.json`: `general.say_hello`, `general.email`, `general.back_to_top`
- `tools/check.mjs`, section 19
- Admin, 2026-10-06 (Admin API `menuUpdate`): the `footer` menu was "Footer menu" with one item, Search. It is now "Help": Track order, Contact us, Your account, Saved items.

## Check 19

- 360px: at most 540px tall; Shop and Help side by side; the lists, the signature and the last lines share one left edge; every link at least 32px tall.
- 320, 360, 390: nothing cut off, no sideways scroll.
- 1280: at most 440px; the list headings on one line with the signature beside them.
- Payment icons and Help or Shop lines beyond seven add their own height to the limits.
