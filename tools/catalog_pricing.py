"""The price rule for the catalogue (docs/pricing-plan.md), shared by catalog-build.py and catalog-upload.py.

price = multiplier × (cost + packaging), rounded to the nearest ten, minus one (270 → 269, 495 → 499).
A pack, pair or set that is not a bouquet costs less than its pieces bought singly: every piece after the dearest
is combo_saving cheaper (price_of).
The numbers are in tools/catalog/costs.json: what one of each part costs to make, packaging by product type (counted
once per listing) and the multiplier. A variant's cost is the sum of its "parts" in catalog.json. A variant with a
part that has no cost yet keeps the price typed in the manifest.
"""
import json, math, os

COSTS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'catalog', 'costs.json')))


def cost_of(variant):
    each = [COSTS['parts'][name] for name in variant['parts']]
    if None in each:
        return None
    return sum(c * n for c, n in zip(each, variant['parts'].values()))


def packaging_of(data, product):
    return COSTS['packaging'].get(product['type'], COSTS['packaging']['default'])


def rounded(amount):
    return int(math.floor(amount / 10 + 0.5) * 10) - 1


def price_of(data, product, variant):
    cost = cost_of(variant)
    if cost is None:
        return variant['price']
    plain = rounded(COSTS['multiplier'] * (cost + packaging_of(data, product)))
    pieces = sum(variant['parts'].values())
    if pieces < 2 or product['type'] == 'Bouquets':
        return plain
    # A combo (pack, pair or set): each piece at its own single price, and every piece after the dearest costs
    # combo_saving less, since one parcel needs one delivery and one ad. A bouquet is one arrangement, not a combo.
    singles = sorted((rounded(COSTS['multiplier'] * COSTS['parts'][name]) for name, n in variant['parts'].items() for _ in range(n)), reverse=True)
    combo = min(plain, rounded(sum(singles) - COSTS['combo_saving'] * sum(singles[1:])))
    # A combo that ships free at the plain price stays on the free-delivery line: under it, the buyer would pay
    # delivery and more in all.
    line = COSTS['free_delivery_from']
    if plain >= line and combo < line:
        return line
    return combo
