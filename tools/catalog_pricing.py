"""The price rule for the catalogue (docs/pricing-plan.md), shared by catalog-build.py and catalog-upload.py.

price = multiplier × (cost + packaging), rounded to the nearest ten, minus one (270 → 269, 495 → 499).
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


def price_of(data, product, variant):
    cost = cost_of(variant)
    if cost is None:
        return variant['price']
    return int(math.floor(COSTS['multiplier'] * (cost + packaging_of(data, product)) / 10 + 0.5) * 10) - 1
