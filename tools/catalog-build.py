#!/usr/bin/env python3
"""Builds the organised photo folder for the real catalogue from tools/catalog/catalog.json.

Copies each chosen photo (original size, never upscaled) from the source folder to
../catalog/<type>/<handle>/<handle>-<variant>-NN.png, cuts the home page crops (round craft
photos, 4:5 occasion cards) into ../catalog/home/, and writes ../catalog/review.html: every
product with its photos, copy and proposed price, for Raushan to check. The originals are not touched.
Run: python3 tools/catalog-build.py   (needs Pillow)
"""
import csv, html, json, os, re, shutil, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalog_pricing import cost_of, packaging_of, price_of

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'tools/catalog/catalog.json')
OUT = os.path.normpath(os.path.join(ROOT, '..', 'catalog'))


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', (text or '').lower()).strip('-')


def main():
    data = json.load(open(MANIFEST))
    src_root = os.path.expanduser(data['source'])
    built = {'products': {}, 'home': {}}
    for p in data['products']:
        folder = os.path.join(OUT, slug(p['type']), p['handle'])
        os.makedirs(folder, exist_ok=True)
        counts, files = {}, []
        for ph in p['photos']:
            v = slug(ph['variant'])
            counts[v] = counts.get(v, 0) + 1
            name = '-'.join(x for x in [p['handle'], v, f"{counts[v]:02d}"] if x) + '.png'
            dest = os.path.join(folder, name)
            src = os.path.join(src_root, ph['src'])
            if src.lower().endswith('.png'):
                shutil.copyfile(src, dest)
            else:
                Image.open(src).convert('RGB').save(dest)
            files.append({'file': os.path.relpath(dest, OUT), 'alt': ph['alt'], 'variant': ph['variant']})
        built['products'][p['handle']] = files

    home = os.path.join(OUT, 'home')
    os.makedirs(home, exist_ok=True)
    for i, h in enumerate(data['home']['hero']):
        name = f"home-hero-{i + 1}-{slug(h['label'])}.png"
        shutil.copyfile(os.path.join(src_root, h['src']), os.path.join(home, name))
        built['home'][f'hero{i}'] = 'home/' + name
    for c in data['home']['circles']:
        im = Image.open(os.path.join(src_root, c['src'])).convert('RGB')
        w, h = im.size
        x0, y0, x1, y1 = c['box']
        im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
        name = f"home-craft-{c['key']}.jpg"
        im.save(os.path.join(home, name), quality=92)
        built['home'][c['key']] = 'home/' + name
    for o in data['home']['occasions']:
        im = Image.open(os.path.join(src_root, o['src'])).convert('RGB')
        w, h = im.size
        cw = int(h * 4 / 5)
        left = int((w - cw) * o.get('focus', 0.5))
        im = im.crop((left, 0, left + cw, h))
        name = f"home-occasion-{o['collection']}.jpg"
        im.save(os.path.join(home, name), quality=92)
        built['home'][o['key']] = 'home/' + name
    for c in data['collections']:
        name = f"collection-{c['handle']}.png"
        shutil.copyfile(os.path.join(src_root, c['cover']), os.path.join(home, name))
        built['home']['cover-' + c['handle']] = 'home/' + name
    json.dump(built, open(os.path.join(OUT, 'build.json'), 'w'), indent=1)
    review(data, built)
    n = sum(len(v) for v in built['products'].values())
    print(f"{len(built['products'])} products, {n} photos, {len(built['home'])} home files -> {OUT}")


def review(data, built):
    e = html.escape
    out = ['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
           '<title>Yarn Basket catalogue review</title><style>',
           'body{font:16px/1.5 system-ui,sans-serif;color:#4E3A31;background:#FBF1EE;margin:0;padding:24px}',
           'h1,h2{font-weight:600}h2{margin-top:48px;border-bottom:1px solid #E3A69C;padding-bottom:6px}',
           '.p{background:#fff;border-radius:12px;padding:16px;margin:16px 0}.p h3{margin:0 0 4px}',
           '.row{display:flex;gap:8px;overflow-x:auto;padding:8px 0}.row figure{margin:0;flex:none}',
           '.row img{width:180px;height:180px;object-fit:cover;border-radius:8px;display:block}',
           'figcaption{font-size:12px;color:#705B52;max-width:180px}table{border-collapse:collapse;margin:8px 0}',
           'td,th{border:1px solid #F2D4CC;padding:4px 10px;text-align:left;font-size:14px}',
           '.meta{font-size:13px;color:#705B52}.round img{border-radius:50%;width:120px;height:120px}',
           '.tall img{width:160px;height:200px}</style>',
           '<h1>Yarn Basket catalogue review</h1>',
           f"<p>{len(data['products'])} products. {e(data['note'])}</p>"]
    types = []
    for p in data['products']:
        if p['type'] not in types:
            types.append(p['type'])
    for t in types:
        out.append(f'<h2>{e(t)}</h2>')
        for p in (x for x in data['products'] if x['type'] == t):
            out.append(f"<div class=p><h3>{e(p['title'])}</h3><div class=meta>/{e(p['handle'])} · tags: {e(', '.join(p['tags']))}</div>")
            out.append('<div class=row>' + ''.join(
                f"<figure><img loading=lazy src=\"{e(f['file'])}\" alt=\"\"><figcaption>{e(f['variant'] or '')}</figcaption></figure>"
                for f in built['products'][p['handle']]) + '</div>')
            out.append(p['description'])
            pack = packaging_of(data, p)
            out.append(f"<table><tr><th>{e(p['option'] or 'Variant')}</th><th>Cost</th><th>Packaging</th><th>Price</th><th>SKU</th></tr>" + ''.join(
                f"<tr><td>{e(v['value'] or 'One option')}</td><td>{'₹' + str(cost_of(v)) if cost_of(v) is not None else 'NOT KNOWN'}</td><td>₹{pack}</td>"
                f"<td>₹{price_of(data, p, v)}{'' if cost_of(v) is not None else ' (placeholder)'}</td><td>{e(v['sku'])}</td></tr>" for v in p['variants']) + '</table>')
            out.append(f"<div class=meta>Size: {e(p['size'] or 'NOT KNOWN: please tell me the size')}</div></div>")
    out.append('<h2>Home page</h2><h3>Hero photos, in order</h3><div class=row>' + ''.join(
        f"<figure><img src=\"{e(built['home'][f'hero{i}'])}\" alt=\"\"><figcaption>{e(h['label'])}</figcaption></figure>"
        for i, h in enumerate(data['home']['hero'])) + '</div>')
    out.append('<h3>Bestsellers circles</h3><div class="row round">' + ''.join(
        f"<figure><img src=\"{e(built['home'][c['key']])}\" alt=\"\"><figcaption>{e(c['collection'])}</figcaption></figure>"
        for c in data['home']['circles']) + '</div>')
    out.append('<h3>Occasion cards</h3><div class="row tall">' + ''.join(
        f"<figure><img src=\"{e(built['home'][o['key']])}\" alt=\"\"><figcaption>{e(o['collection'])}</figcaption></figure>"
        for o in data['home']['occasions']) + '</div>')
    out.append('<h2>Collections</h2><table><tr><th>Collection</th><th>Filled by</th></tr>' + ''.join(
        f"<tr><td>{e(c['title'])}</td><td>{e('hand-picked' if 'manual' in c else ' or '.join(f'{k} = {v}' for k, v in c['rules']))}</td></tr>"
        for c in data['collections']) + '</table>')
    out.append('<h2>Held back: no photo good enough yet</h2><ul>' + ''.join(f'<li>{e(h)}</li>' for h in data['held_back']) + '</ul>')
    open(os.path.join(OUT, 'review.html'), 'w').write('\n'.join(out))
    # The whole price list as a sheet that opens in Excel; rewritten on every run, so edit costs.json, not this.
    with open(os.path.join(ROOT, 'tools/catalog/prices.csv'), 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['Type', 'Product', 'Variant', 'SKU', 'Parts', 'Making cost', 'Packaging', 'Price', 'Note'])
        for p in data['products']:
            for v in p['variants']:
                cost = cost_of(v)
                w.writerow([p['type'], p['title'], v['value'] or '', v['sku'], ' + '.join(f'{n} {k}' for k, n in v['parts'].items()),
                            '' if cost is None else cost, packaging_of(data, p), price_of(data, p, v), '' if cost is not None else 'placeholder: a part has no cost yet'])


if __name__ == '__main__':
    main()
