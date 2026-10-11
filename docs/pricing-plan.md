# Pricing and rewards

Decided with Raushan on 2026-10-04. Built the same day (see "As built").

**Revisited on 2026-10-12** (see "The 2026-10-12 strategy" below, which wins wherever the two differ): single
prices unchanged, free delivery from ₹299 with ₹79 under it, combos a quarter off every piece after the dearest,
the gift from ₹599.

## The 2026-10-12 strategy

Raushan's questions: delivery and ads are paid once per order, so why price them as a share? Shouldn't free
delivery start lower? Shouldn't a pack save something real?

What was found:

- **3 × making cost already puts more of the ad on big pieces** (about ₹100 on a ₹499 bouquet, ₹18 on an ₹89
  keychain), which is what we want if people come for a bouquet and add a keychain. And the prices are genuine:
  crochet keychains sell elsewhere for ₹94 to ₹250 (Amazon, Magic Needles, The Thread Way), a bouquet with keychain
  for ₹499 (Blinkit). **Single prices stay.**
- **The ₹499 free-delivery line was the real problem.** 77 of the 86 choices cost less than ₹499, so nearly
  everything showed a fee when bought alone. At ₹299, 29 ship free alone and the 42 priced ₹149 to ₹298 get there
  with one add-on. A fee seen at checkout is the most quoted reason Indian shoppers leave.
- **About a third of a single piece's price pays for delivery and the ad.** An extra piece in the same parcel
  needs neither, so most of that third is given back on combos.
- **The real ad cost is not known.** Published figures for India run from ₹150 to ₹700 a purchase (agency
  estimates, not our data). It is measured after launch, not guessed into the prices: a higher price lowers the
  share of visitors who buy, which raises the ad cost per order.

The rules:

1. **Single pieces and bouquets: 3 × making cost**, as before.
2. **Free delivery from ₹299. Under ₹299, delivery is ₹79** (Raushan: with the line that easy to cross, the charge
   should cover the courier in full).
3. **Combos (a pack, pair or set that is not a bouquet): each piece at its single price, and every piece after the
   dearest a quarter off.** A combo never costs more than 3 × its cost, and one that ships free at 3 × is never
   priced under ₹299, where it would pay ₹79 delivery and cost the buyer more. A bouquet is one arrangement and the
   piece the ads show, so it is not a combo. `combo_saving` and `free_delivery_from` in `costs.json`; the rule is
   `price_of` in `tools/catalog_pricing.py`.
4. **Free gift from ₹599** (was ₹799): a bouquet buyer at ₹449 to ₹499 has a next goal one or two add-ons away.
   ₹50 off from ₹999 and ₹100 off from ₹1,299 stay.
5. **Ads show bouquets and sets (₹299 and up); small pieces are add-ons.** A lone small piece cannot pay for an ad
   at any fair price.

The 26 combo prices that changed (none went up; no single piece or bouquet moved):

| Combo | Was | Now |
|---|---|---|
| Two flower keychains, lily pair, daisy pair, claw clip pairs (6) | ₹179 | ₹159 |
| Flower + evil eye, peacock or octopus keychain sets (5) | ₹199 | ₹179 |
| Evil eye pair, octopus pairs (3) | ₹209 | ₹189 |
| Chick + flower pairs (2) | ₹259 | ₹239 |
| Three-keychain sets (2 + 2) | ₹269 / ₹289 | ₹219 / ₹239 |
| Headband + clips / + claw clip | ₹199 / ₹289 | ₹189 / ₹249 |
| Chick pair, bee + chick pair, octopus + evil eye set | ₹329 / ₹319 / ₹319 | ₹299 |
| Curtain tie-back, pack of 4 | ₹599 | ₹479 |
| Bee pair, tie-back pack of 2, sunflower + evil eye + octopus set | ₹299 | ₹299 (on the line) |

What a buyer pays, delivery included:

| | One | Two together | The second one costs |
|---|---|---|---|
| Daisy keychain | ₹89 + ₹79 = ₹168 | ₹159 + ₹79 = ₹238 | ₹70 |
| Evil eye keychain | ₹109 + ₹79 = ₹188 | ₹189 + ₹79 = ₹268 | ₹80 |
| Bee keychain | ₹149 + ₹79 = ₹228 | ₹299, free delivery | ₹71 |
| Curtain tie-back | ₹149 + ₹79 = ₹228 | ₹299, free delivery (four: ₹479) | ₹71 |

What it costs us: an order between ₹299 and ₹498 no longer pays a delivery fee, and the combos earn ₹10 to ₹50 less
each (the pack of four ₹110 less), for fewer abandoned checkouts and more pieces in a parcel.

### Measure for 15 days, then tune

Three numbers from the first 15 days of ads: the ad cost per order, the average order value, the share of orders
under ₹299. Compare the ad cost with what an order leaves after making, the courier (₹60 assumed; Shiprocket's
blended cost is about ₹36 to ₹45 a 500g parcel before GST, more for a bulky bouquet) and 7.5% fees:

| Order | Buyer pays | Left for the ad and profit |
|---|---|---|
| One keychain | ₹89 + ₹79 | ₹65 |
| A two-keychain set | ₹159 + ₹79 | ₹100 |
| A ₹299 pair | ₹299 | ₹117 |
| A three-keychain set | ₹239 + ₹79 | ₹139 |
| A three-flower bouquet | ₹499 | ₹236 |
| Bouquet + keychain | ₹588 | ₹289 |

If ads cost more than these leave: better-aimed ads and bigger baskets first, the two lines (₹299, ₹599) next,
prices last.

Not decided here: cash on delivery. 20 to 30% of COD parcels are refused in India and each costs ₹100 to ₹150;
prepaid refusals are under 2%. A prepaid saving and partial COD are on the launch checklist.

Sources (2026-10-12; blogs and tools, to be read as ranges): upgrowth.in/meta-ads-price-benchmarks,
creatorcity.in/blog/meta-ads-d2c-brands-india, funnelhouse.in/meta-ads-cost-india,
instacode.in/blog/how-to-set-shipping-charges-online-store-india, productgrowth.in/insights/ecommerce/fix-cart-abandonment-7-days,
checkthat.ai/brands/shiprocket/pricing, hillteck.com/blog/rto-trends-2026-indian-d2c.html,
magicneedles.in/collections/handmade-cute-keychains, thethreadway.in, blinkit.com (Chubsy Knits bouquet).

Built 2026-10-12: the price rule and the 26 prices; Theme settings (free delivery 299, fee 79, gift 599) and the
announcement bar's words; in the admin (by Raushan) the Domestic "Standard" rate ₹79, free from ₹299, and the gift
discount, now "Free sunflower keychain over ₹599". Checked: `check:money` 10 of 10 (₹294 pays ₹79 delivery, ₹343
pays none); checks 8 and 11, 26 of 26; in the cart ₹229 says "Add ₹70 more for free shipping", ₹338 "Add ₹261 more
for a free gift", ₹628 has the gift and says "Add ₹371 more for ₹50 off". Check 8 now adds the cheapest single
piece: two of the ₹399 set it used earn the gift.

## The price rule

**Price = 3 × making cost**, rounded to the nearest ten, minus one.

1. **Making cost** = the cost of each piece in the listing, added up. A piece's cost already includes its own
   packaging, so nothing is added per listing. Colours don't change the cost.
2. **Multiply by 3.**
3. **Round** to the nearest ten and take one off, so prices end in 9.

Examples:

| Listing | Pieces | Making cost | × 3 | Price |
|---|---|---|---|---|
| Single sunflower bouquet | 1 sunflower | 55 | 165 | ₹169 |
| Rose trio | 3 roses | 165 | 495 | ₹499 |
| Blue tulips + daisy | 2 tulips + 1 daisy | 155 | 465 | ₹469 |
| Sunflower + evil eye keychain set | 30 + 35 | 65 | 195 | ₹199 |
| Headband + clips + claw clip | 50 + 15 + 30 | 95 | 285 | ₹289 |

Cost of one piece, packaging included (Raushan, 2026-10-04; he raised most of them the same day by editing
`costs.json`, which is the source of truth if this table and the file ever differ):

| Piece | ₹ | Piece | ₹ |
|---|---|---|---|
| Sunflower, rose, daisy (bouquet stem) | 55 | Lily charm | 30 |
| Tulip (bouquet stem) | 50 | Flower pot | 75 |
| Bee (bouquet or keychain) | 50 | Headband | 50 |
| Flower keychain (sunflower, daisy) | 30 | Hair clips, pair | 15 |
| Evil eye keychain | 35 | Claw clip | 30 |
| Peacock feather keychain | 35 | Curtain tie-back | 50 |
| Octopus keychain | 35 | Chick keychain | 55 |

Where things are:

- **`tools/catalog/costs.json`**: the piece costs and the multiplier. This is the file to edit.
- `tools/catalog/catalog.json`: each variant lists its `parts` (a trio of roses is `{"rose": 3}`).
- `tools/catalog/prices.csv`: every variant with its parts, cost and price; opens in Excel. Regenerated, don't edit.
- `tools/catalog_pricing.py`: the rule itself.
- After changing a cost: `python3 tools/catalog-build.py && python3 tools/catalog-upload.py prices`. Only prices
  change in the store, the free gift's included (it copies the sunflower keychain).

Notes:

- GST is not a separate line (other business expenses cover it).
- History: on 2026-10-04 Raushan first gave packaging as a separate amount per listing (₹30 bouquets, ₹20 pots, ₹15
  the rest), then gave per-piece costs with packaging inside them. `costs.json` still has a `packaging` table, set to
  0; an amount there would be added once per listing.
- A part with `null` in `costs.json` has no cost yet; listings that use it keep their typed placeholder price.

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
