"""The price rule for the catalogue (docs/pricing-plan.md), shared by catalog-build.py and catalog-upload.py.

price = multiplier × (cost + packaging), rounded to the nearest ten, minus one (270 → 269, 495 → 499).
The multiplier and the packaging table are in tools/catalog/catalog.json ("pricing"). A variant whose cost isn't
known yet (cost: null) keeps the price typed in the manifest.
"""
import math


def price_of(data, product, variant):
    cost = variant.get('cost')
    if cost is None:
        return variant['price']
    rule = data['pricing']
    packaging = rule['packaging'].get(product['type'], rule['packaging']['default'])
    return int(math.floor(rule['multiplier'] * (cost + packaging) / 10 + 0.5) * 10) - 1


def packaging_of(data, product):
    rule = data['pricing']
    return rule['packaging'].get(product['type'], rule['packaging']['default'])
