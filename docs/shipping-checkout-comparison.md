# Shipping and checkout: Shiprocket vs Shopify's own (research, 2026-10-03)

Status: **decided 2026-10-03 (§7), to be set up at launch;** steps in launch-checklist.md "Shipping, payments and checkout". Raushan asked for this after looking at rareyou.com and floreal.in (Shiprocket checkout pop-up) and knotsngifts.in (Shopify's checkout with Razorpay). India only.

Figures marked (vendor) are the seller's own marketing. Figures marked (third party) come from review or comparison sites and should be confirmed on a Shiprocket sales call or in the dashboard's rate calculator before we rely on them.

## 1. These are two decisions, not one

| | What it is | Who can do it |
|---|---|---|
| **A. Shipping** | Who picks up the parcel, prints the label, tracks it, collects COD cash, brings back returns | Shopify has **no shipping service in India** (label buying is only for AU, CA, FR, DE, IT, ES, UK, US). Every Indian store uses a courier or an aggregator such as Shiprocket |
| **B. Checkout** | The pages between "Checkout" and "Order placed" | Shopify's own checkout with a payment gateway (Razorpay), **or** a replacement such as Shiprocket Checkout (Fastrr), GoKwik, Razorpay Magic |

The screenshots show decision B. Rareyou and Floreal use **Shiprocket Checkout**. Knotsngifts uses Shopify's checkout with Razorpay, and we can't tell from the page who ships for them; it could well be Shiprocket too.

The two are independent: Shiprocket shipping works with Shopify's checkout.

## 2. Decision A: shipping

Shopify can't do it, so the choice is which aggregator. Shiprocket is the default pick for a new store.

**Shiprocket shipping, what it costs (third party)**
- Plan: Lite is free. Paid plans ₹199–799/month lower the per-parcel rate.
- Freight: from about ₹26–29 per 500 g on Lite, more for far zones. 18% GST on top.
- COD fee: about ₹27–36 or 1.5–2.5% of the order, whichever is higher.
- COD money reaches us 8 working days after delivery. Earlier costs 0.49–0.99%.
- RTO (parcel refused or undelivered, returned to us): we lose the forward freight and pay the return freight. The COD fee is reversed. Roughly ₹100–150 lost per RTO parcel, plus a handmade item that has travelled twice.
- Up to 3 delivery attempts before RTO. The dashboard lets us act on a failed attempt (call the buyer, reschedule).
- Customer returns: booked from the dashboard as a reverse pickup, charged as another shipment. Our return policy stays ours.

**Known problems (Shopify App Store 4.0/5 from 657 reviews, 21% one-star; Trustpilot 1.7/5)**
- **Weight disputes.** The courier re-weighs the parcel and bills the difference. We get 7 working days to dispute with photos, or it's deducted.
- COD payouts held when the wallet goes negative from those deductions.
- Missed pickups, slow support.

**What matters for us**
- **Volumetric weight.** Couriers bill the higher of real weight and L × W × H ÷ 5000 (cm). A bouquet box of 30 × 20 × 15 cm bills as 1.8 kg even if it weighs 300 g. Our ₹99 flat fee and free shipping from ₹999 need checking against real box sizes.
- Photograph every parcel on the scale with a tape measure. That's the evidence for disputes.
- Changing aggregator later (NimbusPost, iThink Logistics, Shipway, Delhivery direct) is an app swap. Customers never see it. So this choice is low-risk.

## 3. Decision B: checkout, in depth

Raushan's inputs (2026-10-03): partial COD from day one and no full COD; a smooth checkout matters most; he likes Floreal's Shiprocket flow (name, address, pay). Floreal doesn't ask for a phone login, Rareyou and shuddhswad.shop do, so the OTP step is the store's choice. On all four Shiprocket stores the cart's button is Shiprocket's own "BUY NOW" with UPI logos and "Powered by Shiprocket", in the store's colour.

Three candidates:
- **S: Shopify's checkout + Razorpay + a partial-COD app** (Partialy is the example looked at)
- **F: Shiprocket Checkout** (now called fastrr Checkout) with Razorpay connected inside it
- **M: Razorpay Magic Checkout**, the same idea as F from the gateway's side

How F and M work: the cart's button opens their pop-up, their page takes the money through the gateway, and the finished order is pushed into Shopify through the API as "paid outside Shopify". Shopify's checkout never runs.

### 3.1 What the shopper goes through

| | S: Shopify + Razorpay | F: Shiprocket Checkout |
|---|---|---|
| Opening | A new page | A pop-up over the cart; the shop stays visible behind it |
| Sign-in | None needed. Signed-in shoppers get their address filled | Optional phone + OTP. With it, the address is filled if the shopper has bought on any Shiprocket store ("95% autofilled" is the vendor's figure) |
| Address | One form, with address suggestions | One form; pincode fills city and state |
| Paying | "You'll be redirected to Razorpay" and a second page | UPI QR on desktop and UPI apps on phones, cards, net banking, wallets, all inside the pop-up |
| Failed payment | Back to checkout, try again | Offers another payment mode automatically (vendor) |
| Coupons | A code box, hidden by our choice | Available coupons listed with "Save ₹X", one tap |
| Partial COD | Through the app; how it looks on the Basic plan is **not confirmed** (§6) | A payment option with the advance amount, by rule |
| Looks | Our colours, logo, fonts (set 2026-10-03) | Shiprocket's layout with our logo, a banner line and a button colour |
| Familiar to Indian shoppers | Yes | Yes, it's on many small Indian stores |

Both are short. F's real edge for the shopper is paying without leaving the pop-up, and the address filling for people already in Shiprocket's network.

### 3.2 COD, partial COD and returns to origin

| | S | F |
|---|---|---|
| Partial COD | App. Partialy: 20–50% or a fixed amount upfront; free up to 25 orders a month with 2.5% commission, then $10 a month for 300 orders; 4.7/5 from 78 reviews; says it works with Shiprocket | Built in. A rule sets the percentage, with or without shipping |
| Rules by | Whatever the app offers | SKU, tag, collection, pincode, order value, weight, risk profile, phone number, ad campaign |
| No full COD | COD payment method off, app's partial option on | "Disable COD" rule plus the partial rule |
| Phone check | None | OTP if we turn it on |
| Risky buyers | No information | Risk profile from Shiprocket's delivery history; "30% RTO reduction" (vendor) |
| Courier collects only the balance | Depends on the app passing it to Shiprocket; **must be tested** | Same company on both ends; expected to work, still test |

Partial COD already cuts most refusals, because the buyer has paid something. So F's risk tools matter less for us than for a full-COD store.

### 3.3 Money

Per ₹1,000 order paid fully online:

| | S | F | M |
|---|---|---|---|
| Razorpay, 2% + GST | ₹23.60 | ₹23.60 | ₹23.60 |
| Shopify's fee for an outside gateway | ₹20 on Basic, ₹10 on Grow | ₹0 | ₹0 |
| Checkout's own fee | ₹0 | **Not published.** One source says plans are flat or a share of sales, "some from about ₹5,000 a month" | About 0.65%, ₹6.50 (third party) |
| Partial-COD app | $0–10 a month | included | included |

- If F is a small percentage with no monthly minimum, it costs about the same as S or less.
- If F has a fixed ₹5,000 a month, it only pays for itself above about ₹2.5 lakh a month of online payments on Basic. Below that it's a cost with no saving.
- **This is the one number that decides it, and only a sales call gives it.**
- Shiprocket's terms let it change fees on its own; we accept or leave.
- Online money settles from Razorpay to our bank in all three. COD cash comes from Shiprocket shipping, 8 working days after delivery.

### 3.4 Our offers

| | S | F |
|---|---|---|
| Free shipping from ₹999, ₹99 below | The Shopify shipping rates | Set again in Shiprocket's dashboard (fixed charge per method, plus rules). Not synced from Shopify |
| Free keychain over ₹1,499 | The Shopify automatic discount, done | Set again. Their "Buy X get Y" can be automatic, triggered by cart value, with Y free, and capped per order. Whether a gift our cart already added is priced at ₹0 **must be tested** |
| Coupon codes | Shopify discounts | Imported from Shopify or made there |
| Sale ("compare at") prices | Work | Work, shown as "You've saved ₹X" |
| Keeping the amounts in step | `npm run check` section 11 compares theme and admin | A fourth place for each amount, which the check can't read |
| Prepaid discount | A Shopify discount can't depend on the payment method without an app | A built-in rule |

### 3.5 What Shopify gives that F replaces

| Feature | With F |
|---|---|
| Order in Shopify admin, stock, order emails | Kept; the order is created in Shopify |
| Customer account and order history | Expected to work when the order carries the shopper's email; **test** that it shows under our email-code and Google sign-in |
| Abandoned-checkout emails | Shopify's stop. Shiprocket has its own abandoned-cart report and messages |
| Refund button in Shopify admin | Marks the refund but can't send the money, since Shopify didn't take it; the refund is made in Razorpay. This follows from how the order is recorded; confirm on the call |
| Analytics and ad tracking | Shopify fires view and add-to-cart; Shiprocket fires checkout, payment and purchase. The purchase event has to be wired by hand (Tag Manager or server-side) or ads lose track of sales |
| Checkout apps, Shopify fraud analysis | Not used |
| Cart note and gift message | Floreal passes a personal message this way; **test** ours |

### 3.6 Our theme

- Shiprocket's button replaces our cart's Checkout button, in the drawer and on the cart page. Whether our own button can open their pop-up, so the cart keeps its look, is **not confirmed**.
- Their script loads on our pages. It has to be measured against our speed gates and loaded late.
- The cart script is at 21.4 of 22 KB, so any glue code goes in its own small file.
- The checkout branding done on 2026-10-03 would only be seen on Shopify's sign-in and account pages.

### 3.7 Risk and dependence

| | S | F |
|---|---|---|
| Platform rules | None | Shopify's app rule 2.3.18 forbids apps that bypass checkout. Nothing is announced, and thousands of Indian stores run this way, but it's Shopify's call |
| Vendor terms | Shopify's | Shiprocket may end service without notice, accepts no liability, and sets fees alone |
| If it breaks | Shopify's uptime | Checkout is down until fixed; reviews mention UPI apps not opening and slow support |
| Way out | — | Put Shopify's Checkout button back. Minutes, if Razorpay is also connected in Shopify |
| One company for checkout and parcels | No | Yes: simpler when it works, more exposed when it doesn't |
| Shopper data | Stays with us and Shopify | Also feeds Shiprocket's shared address network |

### 3.8 Razorpay Magic Checkout (M)

Same idea as F, by the gateway we'd use anyway. Partial COD in slabs, address filling from its own network, about 0.65% per order and no monthly fee (third party). But its Shopify app has 2.6/5 from 31 reviews, with payment failures and slow support. Worth one quote as a comparison, not the first choice.

### 3.9 Coupons in the cart (momsmade.shop, 2026-10-03)

Raushan shared a cart that lists coupons, a three-step offers bar, add-on products and "Extra discount on online payment". That's a cart app (Shiprocket, GoKwik and Shopflo each sell one; Shiprocket's is listed at $9.99 a month up to 50 orders and $120 a month up to 1,000). It's a separate product from the checkout, and the screenshot doesn't show whose it is.

- We don't need one: our cart is already built, with its own rewards bar.
- Our offers are automatic, so shoppers get the best price with no code to find. A coupon list only matters once we run code-based offers; it can then be added to our own cart, to be confirmed against Shopify's cart API at that point.
- The checkout choice doesn't depend on this.

## 4. Why these stores use Shiprocket Checkout

1. **Shopify's 2% disappears.** Shopify charges it on every order paid through an outside gateway, and India has no Shopify gateway. Orders pushed in as "paid outside" aren't charged.
2. **COD rules.** Shopify's checkout can only turn COD on or off unless the store is on Plus or adds apps. Partial COD, COD fees, blocking by pincode or risk all come built in.
3. **Paying inside the pop-up.** No redirect to a gateway page, UPI first.
4. **Address filling** across every store on Shiprocket's network.
5. **Coupons shown at checkout,** and prepaid discounts.
6. **It comes with the shipping account.** They already ship with Shiprocket, and Shiprocket sells checkout to its shipping customers.

Reasons 1 and 2 are the main ones. Reason 2 applies to us from day one because of partial COD.

## 5. Scorecard for Yarn Basket

| What matters | S: Shopify + Razorpay + app | F: Shiprocket Checkout |
|---|---|---|
| Smooth checkout | Good; one redirect to pay | **Better**; pays in the pop-up |
| Partial COD only | Possible, unproven on Basic | **Built in, proven on stores like ours** |
| Returns to origin | Partial COD alone | Partial COD plus rules and optional OTP |
| Cost at launch volume | **Known:** 2% + $0–10 a month | Unknown until the quote |
| Offers stay correct | **One place** | Set up twice; must be tested |
| Account, sign-in, order history | **Native** | Should work; must be tested |
| Ad and analytics tracking | **Automatic** | Manual wiring, our job |
| Speed and cart design | **Untouched** | Their script and their button |
| Dependence | **Shopify only** | Shiprocket for checkout and parcels |
| Running it day to day | Shopify admin and Shiprocket shipping | Shopify admin, Shiprocket checkout dashboard, Shiprocket shipping |

## 6. Still unknown

1. Shiprocket Checkout's price for a new store, and whether there's a monthly minimum.
2. Whether it needs our own Razorpay account or can supply the gateway.
3. Whether our own Checkout button can open their pop-up.
4. How a partial-COD app works on Shopify's checkout on the Basic plan. Shopify allows apps inside the checkout steps only on Plus, so on Basic the app must work another way, and that decides how smooth S really is.
5. Which Shopify plan we launch on.

## 7. Recommendation

**Shipping: Shiprocket, Lite plan.** Unchanged.

**Checkout: Shiprocket Checkout, if two conditions hold. Otherwise Shopify's checkout with Razorpay and a partial-COD app.**

Why it changed from the first version of this document: partial COD only. It's the one thing Shopify's checkout can't do by itself, it's built into Shiprocket's, and every reference store that sells like us runs it this way. The costs of F (offers set up twice, tracking wired by hand, their script) are work for us, not friction for the shopper.

Condition 1, the quote: a percentage of sales with no monthly minimum, or a minimum small enough to accept. A fixed ₹5,000 a month at launch is a no.

Condition 2, a dev-store trial passes all of these:
- partial COD order: the advance is charged, and the Shiprocket label shows only the balance
- cart over ₹1,499: the keychain is ₹0; cart at ₹999: shipping is free; below: ₹99
- the order appears in Shopify with the right customer, and under "Orders" when that shopper signs in on our site
- the gift note arrives on the order
- a purchase reaches analytics
- phone page speed stays inside our gates with their script loaded late

**Update, 2026-10-03, Raushan expects ₹2–3 lakh of sales in the first month.** At that level Shopify's 2% on fully online orders is ₹4,000–6,000 a month, so even a fixed ₹5,000 checkout fee roughly pays for itself, and condition 1 mostly falls away. Still ask for a percentage plan, which costs nothing in a slow month. It's about 200–300 parcels a month, so the shipping plan to price is Shiprocket's ₹499 or ₹799 one, not Lite.

**Either way: connect Razorpay in Shopify too,** so Shopify's checkout is a working fallback we can switch to in minutes.

## 8. Next steps (Raushan)
1. Open a free Shiprocket account, and check freight for our real box sizes from Piro in the rate calculator.
2. Ask Shiprocket for the checkout quote with the questions in §6 (1–3).
3. Start the Razorpay account (it needs business KYC, so it takes days).
4. Say go, and Claude runs the dev-store trial in §7.

## Sources
- [Shopify Shipping countries](https://www.shopify.com/in/blog/shopify-shipping-services)
- [Shiprocket pricing breakdown (checkthat.ai)](https://checkthat.ai/brands/shiprocket/pricing)
- [Shiprocket app reviews (Shopify App Store)](https://apps.shopify.com/shiprocket/reviews)
- [Shiprocket Checkout](https://checkout.shiprocket.in/)
- [Shiprocket vs Razorpay Magic vs GoKwik](https://arulmjoseph.com/shiprocket-checkout-vs-razorpay-magic-checkout-vs-gokwik/)
- [Shopify transaction fees and quick checkouts in India](https://www.maydayinternet.com/why-shopify-transaction-fees-dont-apply-to-quick-checkouts-like-gokwik-razorpay-magic-checkout-shopflo-in-india-and-how-long-this-will-last)
- [Shopify community: how third-party checkouts work](https://community.shopify.com/t/i-m-trying-to-understand-the-technical-payment-architecture-behind-some-of-the-third-party-checkout-solutions-in-india/673270)
- [Shopify community: quick checkouts and bundle apps](https://community.shopify.com/t/quick-checkout-apps-gokwik-shiprocket-razorpay-not-supporting-bundle-apps-any-workaround/420736)
- [Razorpay: Shopify checkout issues in India](https://razorpay.com/blog/shopify-checkout-issues-india-fixes/)
- [Shiprocket Checkout: payment settings](https://support.shiprocket.in/support/solutions/articles/152000000915-sr-checkout-payment)
- [Shiprocket Checkout: shipping settings and partial COD rule](https://support.shiprocket.in/support/solutions/articles/152000000892-sr-checkout-manage-shipping-settings)
- [Shiprocket: NDR and RTO](https://www.shiprocket.in/blog/what-is-ndr-rto/)
- [Shipping aggregators in India (vedwix)](https://vedwix.com/best/shipping-aggregators-in-india)
- [fastrr Checkout: Buy X get Y](https://support.shiprocket.in/support/solutions/articles/152000000912-fastrr-checkout-discount-buy-y-get-x-)
- [fastrr Checkout: import discounts](https://support.shiprocket.in/support/solutions/articles/152000000914-sr-checkout-discount-import-discounts)
- [Shiprocket Checkout seller terms](https://checkout.shiprocket.in/seller-terms-conditions/)
- [Tracking with fastrr checkout (CustomerLabs)](https://www.customerlabs.com/docs/installation/shopify-one-click-checkout-tracking/fastrr-shiprocket/)
- [Partialy, partial COD app](https://apps.shopify.com/partialy-partial-payment-cod)
- [Razorpay COD & Magic Checkout app](https://apps.shopify.com/razorpay-checkout)
- [Shiprocket shipping plans](https://www.shiprocket.in/pricing/)
