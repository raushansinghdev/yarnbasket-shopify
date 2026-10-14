"""The price rule for the catalogue (docs/pricing-plan.md), shared by catalog-build.py and catalog-upload.py.

price = multiplier × (cost + packaging), rounded to the nearest ten, minus one (270 → 269, 495 → 499).
A pack, pair or set that is not a bouquet costs less than its pieces bought singly: every piece after the dearest
is combo_saving cheaper (price_of).
The numbers are in tools/catalog/costs.json: what one of each part costs to make, packaging by product type (counted
once per listing) and the multiplier. A variant's cost is the sum of its "parts" in catalog.json. A variant with a
part that has no cost yet keeps the price typed in the manifest.

The same file says what a parcel weighs and which box it goes in ("parcel": placeholders until the pieces are
weighed). grams_of is what Shopify gets as the variant's weight; parcel_sheet writes every SKU with its weight and
box for Shiprocket's product catalogue, because Shopify has no box size on a product.
"""
import csv, json, math, os

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


def box_of(product, variant):
    """The box one of this variant ships in: (name, {'inches': [l, w, h], 'grams': n}). A bouquet's box is as
    wide as its stems need, three at most."""
    parcel = COSTS['parcel']
    name = parcel['box_by_type'].get(product['type'], parcel['box_by_type']['default'])
    if name == 'bouquet':
        name = f"bouquet {min(3, sum(variant['parts'].values()))}"
    return name, parcel['boxes'][name]


def grams_of(product, variant):
    grams = COSTS['parcel']['grams']
    return sum(grams[name] * n for name, n in variant['parts'].items()) + box_of(product, variant)[1]['grams']


def billed_kg(product, variant):
    """What a courier bills: the higher of the real weight and length x width x height / 5000, in cm."""
    l, w, h = (side * 2.54 for side in box_of(product, variant)[1]['inches'])
    return round(max(grams_of(product, variant) / 1000, l * w * h / 5000), 2)


def parcel_sheet(data, path):
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['SKU', 'Product', 'Variant', 'Weight (kg)', 'Length (cm)', 'Breadth (cm)', 'Height (cm)', 'Box', 'Billed weight (kg)', 'HSN', 'GST %'])
        for p in data['products']:
            for v in p['variants']:
                name, box = box_of(p, v)
                w.writerow([v['sku'], p['title'], v['value'] or '', grams_of(p, v) / 1000, *(round(side * 2.54, 1) for side in box['inches']),
                            name, billed_kg(p, v), COSTS['parcel']['hsn'], COSTS['parcel']['gst_percent']])
