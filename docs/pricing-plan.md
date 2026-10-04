# Pricing and rewards

Decided with Raushan on 2026-10-04. Built the same day (see "As built").

## The price rule

**Price = 3 × (product cost + packaging)**, rounded to the nearest ten, minus one (270 → ₹269, 495 → ₹499).

- Packaging, once per listing (a set counts once): **₹30** bouquets (sheet, ribbon, labour, corrugated box),
  **₹20** flower pots, **₹15** everything else.
- Costs include GST; GST is not a separate line (other business expenses cover it).
- Colours of one piece share one cost.
- The rule lives in `tools/catalog_pricing.py`. **The numbers are in `tools/catalog/costs.json`**: what one of each
  part costs to make (one sunflower, one tulip, one flower keychain…), the packaging table and the multiplier. Each
  variant in `tools/catalog/catalog.json` lists its `parts` (a trio of roses is `{"rose": 3}`), so a listing's cost is
  the sum of its parts and a set never needs its own figure.
- To change a cost: edit `costs.json`, then `python3 tools/catalog-build.py && python3 tools/catalog-upload.py prices`.
  The build rewrites `tools/catalog/prices.csv` (every variant: parts, cost, packaging, price; opens in Excel) and the
  upload changes only prices, the free gift's included (it copies the sunflower keychain).
- A part with `null` has no cost yet; listings that use it keep their typed placeholder price.

### Costs from Raushan, 2026-10-04 (per piece, before packaging)

Sunflower, rose, daisy ₹50; tulip ₹45; bee ₹45; flower keychain ₹15; evil eye ₹30; peacock feather ₹25; octopus ₹30;
lily charm ₹20; flower pot ₹70; headband ₹50; claw clip ₹30; curtain tie-back ₹50. Chick keychain ₹55 (from the Meesho
cost file). These replaced the Meesho file's figures, which had single bouquets ₹10 higher. He wrote "including
packaging of only one product"; I read that as packaging counted once per listing, since a ₹15 keychain can't contain
₹15 of packaging and his older figures for pairs and trios are these per-flower costs with no packaging in them.
**Not known yet: a pair of hair clips** (four hair listings wait on it).

Where a rupee of the price goes at 3×:

| Share | % | Note |
|---|---|---|
| Product + packaging | 33.3 | |
| Profit | 25 | Raushan's target |
| Ads | 20 | What is left for Meta ads. Above this, ads eat profit first |
| Delivery | 14 | About ₹70 a parcel on a ₹499 order (assumed until Shiprocket is set up) |
| Gateway + Shopify's fee | 4.5 | About 2.4% + 2% |
| Returns, RTO, damage | 3 | |

Why not the Meesho formula: there the costs are per item; here delivery and the ad are per order, so small orders
are protected by a delivery fee and the rewards below pull baskets up.

## The reward ladder

| From | Reward | Costs us |
|---|---|---|
| under ₹499 | Delivery ₹49 | |
| ₹499 | Free delivery | covered by the 14% in the prices |
| ₹799 | Free gift (the sunflower keychain) | about ₹50 |
| ₹999 | ₹50 off | ₹50 |
| ₹1,299 | ₹100 off (replaces the ₹50, never both) | ₹100 |

The calculation: delivery costs about ₹70 whatever the basket, so the 14% leaves ₹42 spare at ₹799, ₹70 at ₹999 and
₹112 at ₹1,299. The rewards cost ₹50, ₹100 and ₹150, so profit on those orders is about 24%, 22% and 22% if ads stay
at 20% of sales, and above 25% if an ad-bought order costs the same to win whatever its size. **The figures are
provisional:** redo this once the real courier rate and the real ad cost per order are known.

## The cart bar: one goal at a time

Raushan: don't show every step from the start; show the next one, and unlock the one after when it is reached.
`snippets/cart-rewards.liquid` shows one line for the next goal ("Add ₹230 more for free shipping"), one bar that
runs from the last goal reached to the next, that goal's amount under its marker, and short ticks above for what is
already earned. After the last goal: one line, no bar.

## As built (2026-10-04)

- **Theme settings → Cart:** free shipping from 499, fee 49, gift from 799, and four new settings: money off step 1
  (from 999, ₹50) and step 2 (from 1,299, ₹100). They only draw the bar; the savings are the admin discounts below.
- **Admin:** Domestic "Standard" rate ₹49, free from ₹499. "Free sunflower keychain over ₹799" (the existing Buy X
  get Y, minimum changed). New automatic discounts "₹50 off orders over ₹999" and "₹100 off orders over ₹1,299":
  order discounts that combine with product and shipping discounts but not with each other.
- The money-off goals are measured on the items' subtotal before order discounts, as Shopify does. The gift's
  discount counts only products in the Shop collection, so test products don't earn it.
- "Gifts under ₹999" is now **"Gifts under ₹299"** (`/collections/gifts-under-299`, old address redirects).
- Prices set by the rule where the cost is known: single rose and sunflower ₹269, single tulip ₹259, two sunflowers
  and red rose duo ₹389, rose trio ₹539, pastel tulip trio ₹499, sunflower pot ₹299, chick keychain ₹209, bee & chick
  pair ₹329 (cost 95, the higher of two figures), lily charm pair ₹229.
- cart.js is at 21.5 of 22 KB: a new goal's bar starts from empty instead of sliding back.
- Checked: theme check clean; `npm run check -- --only 8,11` 23/23; carts of ₹269, ₹538, ₹808, ₹1,078 and ₹1,347
  show the right goal, ticks, gift and discount.

## Still open

- Costs from Raushan for: three sunflowers, daisy bouquet, the blue tulip bouquets, pink tulips & daisy, sunflower +
  daisy + bee, sunflower & roses; every keychain and set except the chick and the bee & chick pair (the cost file
  has `KC_SF_1_DSY_01` 100 but `kc_fl_02` 50 for two flowers); lily charm single; daisy pots; the blue daisy hair
  pieces; flower hair clips; the curtain tie-back. Until then these keep placeholder prices.
- The gift product's own price (₹249) should follow the sunflower keychain once that has a cost.
- Compare the new prices with Meesho's, since some shoppers see both.
- Shiprocket's real rate, then redo the reward figures.
