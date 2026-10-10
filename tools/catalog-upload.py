#!/usr/bin/env python3
"""Uploads the real catalogue (tools/catalog/catalog.json + ../catalog photos, the studio version where one exists) to the store's admin.

Uses the Shopify CLI's stored login (`shopify store execute`), so it runs as Raushan's app token.
Safe to rerun: a product or collection that already exists by handle is left alone unless --force.
  python3 tools/catalog-upload.py products [handle ...] [--force]
  python3 tools/catalog-upload.py names handle [handle ...]   sends only the name and SEO title (photos, stock, prices and the URL untouched)
  python3 tools/catalog-upload.py prices        sets every variant's price, and the free gift's, from costs.json (photos and stock untouched)
  python3 tools/catalog-upload.py collections [--force]
  python3 tools/catalog-upload.py filters       writes each product's Occasion and Flower & motif (from its tags) for the collection page's filters
  python3 tools/catalog-upload.py covers        replaces every collection's cover photo, nothing else (needs Pillow)
  python3 tools/catalog-upload.py tests         moves the test products to vendor "Yarn Basket Test"
  python3 tools/catalog-upload.py home          uploads the home page photos to Files, prints their names
  python3 tools/catalog-upload.py publish       puts every catalogue product and collection on the Online Store
"""
import json, mimetypes, os, subprocess, sys, tempfile, urllib.request, uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalog_pricing import COSTS, price_of

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.normpath(os.path.join(ROOT, '..', 'catalog'))
# The same photos on the plain studio wall (docs/photo-backdrop-plan.md); used wherever one exists.
STUDIO = os.path.join(OUT, 'studio-depth-batch')
STORE = 'yarn-basket-e4peuhjj.myshopify.com'
LOCATION = 'gid://shopify/Location/89700171913'  # the store's only location
STOCK = 100
DATA = json.load(open(os.path.join(ROOT, 'tools/catalog/catalog.json')))
BUILT = json.load(open(os.path.join(OUT, 'build.json')))


def gql(query, variables=None, mutate=False):
    with tempfile.TemporaryDirectory() as tmp:
        qf, vf, of = (os.path.join(tmp, n) for n in ('q.graphql', 'v.json', 'o.json'))
        open(qf, 'w').write(query)
        cmd = ['shopify', 'store', 'execute', '--store', STORE, '--json', '--query-file', qf, '--output-file', of]
        if variables is not None:
            json.dump(variables, open(vf, 'w'))
            cmd += ['--variable-file', vf]
        if mutate:
            cmd.append('--allow-mutations')
        r = subprocess.run(cmd, capture_output=True, text=True)
        if not os.path.exists(of):
            raise SystemExit(f'GraphQL call failed:\n{r.stdout[-1500:]}\n{r.stderr[-1500:]}')
        res = json.load(open(of))
    return res.get('data', res)


# The collection page's filters (docs/collection-plan.md): Search & Discovery filters by metafield, not by tag, so
# each product's occasion and motif tags are also written as two list metafields. The tags stay the source of truth.
OCCASIONS = {'occasion-birthday': 'Birthday', 'occasion-anniversary': 'Anniversary', 'occasion-thank-you': 'Thank you',
             'occasion-for-her': 'For her', 'occasion-for-him': 'For him'}
MOTIFS = {'sunflower': 'Sunflower', 'daisy': 'Daisy', 'rose': 'Rose', 'tulip': 'Tulip', 'lily': 'Lily', 'evil-eye': 'Evil eye',
          'bee': 'Bee', 'chick': 'Chick', 'octopus': 'Octopus', 'peacock': 'Peacock feather'}
FILTERS = (('occasion', 'Occasion', OCCASIONS), ('motif', 'Flower & motif', MOTIFS))


def filter_fields(p):
    out = []
    for key, _, names in FILTERS:
        values = [names[tag] for tag in names if tag in p['tags']]
        if values:
            out.append({'namespace': 'custom', 'key': key, 'type': 'list.single_line_text_field', 'value': json.dumps(values)})
    return out


def check(errors, what):
    if errors:
        raise SystemExit(f'{what}: {json.dumps(errors, indent=1)}')


def stage(paths, resource='IMAGE'):
    """Uploads local files to Shopify's staging bucket; returns their resource URLs, in order."""
    inputs = [{'filename': os.path.basename(p), 'mimeType': mimetypes.guess_type(p)[0], 'resource': resource,
               'httpMethod': 'POST', 'fileSize': str(os.path.getsize(p))} for p in paths]
    d = gql('mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }',
            {'input': inputs}, mutate=True)['stagedUploadsCreate']
    check(d['userErrors'], 'stagedUploadsCreate')
    urls = []
    for path, t in zip(paths, d['stagedTargets']):
        boundary = uuid.uuid4().hex
        body = b''
        for p in t['parameters']:
            body += f'--{boundary}\r\nContent-Disposition: form-data; name="{p["name"]}"\r\n\r\n{p["value"]}\r\n'.encode()
        body += (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{os.path.basename(path)}"\r\n'
                 f'Content-Type: {mimetypes.guess_type(path)[0]}\r\n\r\n').encode() + open(path, 'rb').read() + f'\r\n--{boundary}--\r\n'.encode()
        req = urllib.request.Request(t['url'], data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
        urllib.request.urlopen(req, timeout=300).read()
        urls.append(t['resourceUrl'])
    return urls


def photo(rel):
    studio = os.path.join(STUDIO, rel)
    return studio if os.path.exists(studio) else os.path.join(OUT, rel)


def existing(kind, handle):
    d = gql('query($h: String!) { p: productByHandle(handle: $h) { id } c: collectionByHandle(handle: $h) { id } }', {'h': handle})
    node = d['p' if kind == 'product' else 'c']
    return node and node['id']


def titles():
    """Two products with one name read as one product at two prices (2026-10-05: a test "Daisy Crochet Flower Pot"
    at 599 showed in the cart's Saved row beside the real one at 229). Stops on a clash inside the catalogue and
    warns about a test product in the store that shares a real name."""
    seen = {}
    for p in DATA['products']:
        seen.setdefault(p['title'].strip().lower(), []).append(p['handle'])
    twice = {t: h for t, h in seen.items() if len(h) > 1}
    if twice:
        sys.exit('two catalogue products share a title: ' + '; '.join(f'{t} ({", ".join(h)})' for t, h in twice.items()))
    for n in gql('{ products(first: 50, query: "tag:test-product") { nodes { handle title } } }')['products']['nodes']:
        if n['title'].strip().lower() in seen:
            print(f'WARNING: test product {n["handle"]} has the same name as {seen[n["title"].strip().lower()][0]}: "{n["title"]}". The theme hides test products from every list; delete it before launch.')


def products(handles, force):
    titles()
    for p in DATA['products']:
        if handles and p['handle'] not in handles:
            continue
        pid = existing('product', p['handle'])
        if pid and not force:
            print('exists, skipped:', p['handle'])
            continue
        photos = BUILT['products'][p['handle']]
        urls = stage([photo(f['file']) for f in photos])
        files = [{'originalSource': u, 'alt': f['alt'], 'contentType': 'IMAGE'} for u, f in zip(urls, photos)]
        option = p['option'] or 'Title'
        variants = []
        for v in p['variants']:
            value = v['value'] or 'Default Title'
            # 100 of everything to start with (Raushan, 2026-10-04); real counts come later.
            item = {'optionValues': [{'optionName': option, 'name': value}], 'price': str(price_of(DATA, p, v)), 'sku': v['sku'],
                    'inventoryPolicy': 'DENY', 'inventoryItem': {'tracked': True},
                    'inventoryQuantities': [{'locationId': LOCATION, 'name': 'available', 'quantity': STOCK}]}
            # The variant's own photo starts its group in the gallery (snippets/product-gallery.liquid).
            first = next((f for f, ph in zip(files, photos) if ph['variant'] == v['value']), None)
            if first and p['option']:
                item['file'] = first
            variants.append(item)
        metafields = [{'namespace': 'custom', 'key': 'size', 'type': 'multi_line_text_field', 'value': p['size']}] if p['size'] else []
        metafields += filter_fields(p)
        inp = {'handle': p['handle'], 'title': p['title'], 'descriptionHtml': p['description'], 'vendor': DATA['vendor'],
               'productType': p['type'], 'tags': p['tags'], 'status': 'ACTIVE',
               'seo': {'title': p['seo_title'], 'description': p['seo_description']},
               'productOptions': [{'name': option, 'values': [{'name': v['value'] or 'Default Title'} for v in p['variants']]}],
               'variants': variants, 'files': files, 'metafields': metafields}
        if pid:
            inp['id'] = pid
            # productSet deletes every metafield it isn't given (2026-10-06: a resend wiped the test ratings), so
            # whatever the product carries beyond ours is sent back as it is.
            kept = gql('query($id: ID!) { product(id: $id) { metafields(first: 50) { nodes { namespace key type value } } } }', {'id': pid})['product']['metafields']['nodes']
            inp['metafields'] = metafields + [m for m in kept if m['namespace'] != 'global' and (m['namespace'], m['key']) not in (('custom', 'size'), ('custom', 'occasion'), ('custom', 'motif'))]
        d = gql('mutation($input: ProductSetInput!) { productSet(synchronous: true, input: $input) { product { id handle variants(first: 20) { nodes { title price } } media(first: 30) { nodes { id } } } userErrors { field message code } } }',
                {'input': inp}, mutate=True)['productSet']
        check(d['userErrors'], p['handle'])
        print('ok:', d['product']['handle'], len(d['product']['variants']['nodes']), 'variants,', len(d['product']['media']['nodes']), 'photos')


def filters():
    """Occasion and Flower & motif on every product, from its tags. Touches nothing else on the product."""
    have = gql('{ metafieldDefinitions(first: 100, ownerType: PRODUCT) { nodes { namespace key } } }')['metafieldDefinitions']['nodes']
    for key, name, _ in FILTERS:
        if {'namespace': 'custom', 'key': key} in have:
            print('definition exists:', key)
            continue
        d = gql('mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { createdDefinition { id name } userErrors { field message code } } }',
                {'d': {'namespace': 'custom', 'key': key, 'name': name, 'type': 'list.single_line_text_field', 'ownerType': 'PRODUCT'}}, mutate=True)['metafieldDefinitionCreate']
        check(d['userErrors'], key)
        print('definition created:', d['createdDefinition']['name'])
    fields = []
    for p in DATA['products']:
        pid = existing('product', p['handle'])
        if not pid:
            print('not in the store, skipped:', p['handle'])
            continue
        fields += [dict(m, ownerId=pid) for m in filter_fields(p)]
    for i in range(0, len(fields), 25):
        d = gql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id } userErrors { field message code } } }', {'m': fields[i:i + 25]}, mutate=True)['metafieldsSet']
        check(d['userErrors'], 'metafieldsSet')
    print('set', len(fields), 'metafields on', len({f['ownerId'] for f in fields}), 'products')


def prices():
    for p in DATA['products']:
        d = gql('query($h: String!) { productByHandle(handle: $h) { id variants(first: 30) { nodes { id sku price } } } }', {'h': p['handle']})['productByHandle']
        by_sku = {v['sku']: v for v in d['variants']['nodes']}
        changes = [{'id': by_sku[v['sku']]['id'], 'price': str(price_of(DATA, p, v))} for v in p['variants']
                   if float(by_sku[v['sku']]['price']) != price_of(DATA, p, v)]
        if not changes:
            continue
        r = gql('mutation($id: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $id, variants: $variants) { userErrors { field message } } }',
                {'id': d['id'], 'variants': changes}, mutate=True)['productVariantsBulkUpdate']
        check(r['userErrors'], p['handle'])
        print('prices:', p['handle'], ', '.join(c['price'] for c in changes))
    # The free gift is its own product and costs what the piece it copies costs (costs.json, "gift").
    gift = COSTS['gift']
    price = next(price_of(DATA, p, v) for p in DATA['products'] for v in p['variants'] if v['sku'] == gift['same_price_as'])
    d = gql('query($h: String!) { productByHandle(handle: $h) { id variants(first: 5) { nodes { id price } } } }', {'h': gift['handle']})['productByHandle']
    changes = [{'id': v['id'], 'price': str(price)} for v in d['variants']['nodes'] if float(v['price']) != price]
    if changes:
        r = gql('mutation($id: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $id, variants: $variants) { userErrors { field message } } }',
                {'id': d['id'], 'variants': changes}, mutate=True)['productVariantsBulkUpdate']
        check(r['userErrors'], gift['handle'])
        print('prices:', gift['handle'], price)


def collections(force):
    cols = {'type': 'TYPE', 'tag': 'TAG', 'price_lt': 'VARIANT_PRICE'}
    for c in DATA['collections']:
        cid = existing('collection', c['handle'])
        if cid and not force:
            print('exists, skipped:', c['handle'])
            continue
        cover = stage([os.path.join(OUT, BUILT['home']['cover-' + c['handle']])])[0]
        inp = {'handle': c['handle'], 'title': c['title'], 'descriptionHtml': c['description'],
               'seo': {'title': c['seo'][0], 'description': c['seo'][1]}, 'image': {'src': cover, 'altText': c['title']}}
        if 'manual' in c:
            inp['sortOrder'] = 'MANUAL'
            inp['products'] = [existing('product', h) for h in c['manual']]
        else:
            # Every automated collection also asks for our vendor, which keeps the test products out.
            rules = [{'column': cols[k], 'relation': 'LESS_THAN' if k == 'price_lt' else 'EQUALS', 'condition': v} for k, v in c['rules']]
            rules.append({'column': 'VENDOR', 'relation': 'EQUALS', 'condition': DATA['vendor']})
            if c['handle'].startswith('gifts-under-'):  # the free gift has a real price and must stay out
                rules.append({'column': 'TYPE', 'relation': 'NOT_EQUALS', 'condition': 'Free gift'})
            inp['ruleSet'] = {'appliedDisjunctively': False, 'rules': rules}
            # No sales yet, so "Best selling" has no meaning: the order is Shopify's default until it does.
            inp['sortOrder'] = 'BEST_SELLING'
        if cid:
            inp['id'] = cid
            inp.pop('products', None)
            d = gql('mutation($input: CollectionInput!) { collectionUpdate(input: $input) { collection { id handle } userErrors { field message } } }', {'input': inp}, mutate=True)['collectionUpdate']
        else:
            d = gql('mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle } userErrors { field message } } }', {'input': inp}, mutate=True)['collectionCreate']
        check(d['userErrors'], c['handle'])
        print('ok:', d['collection']['handle'])


def covers():
    """Replaces each collection's cover photo and nothing else (collections --force would also reset the order)."""
    import io
    from PIL import Image, ImageChops
    for c in DATA['collections']:
        path = os.path.join(OUT, BUILT['home']['cover-' + c['handle']])
        node = gql('query($h: String!) { collectionByHandle(handle: $h) { id image { url } } }', {'h': c['handle']})['collectionByHandle']
        # Shopify refuses a cover identical to the current one ("Error updating collection with this image"), so those are skipped.
        if node['image']:
            live = Image.open(io.BytesIO(urllib.request.urlopen(node['image']['url'], timeout=60).read())).convert('RGB')
            mine = Image.open(path).convert('RGB')
            if live.size == mine.size and not ImageChops.difference(live, mine).getbbox():
                print('cover unchanged:', c['handle'])
                continue
        d = gql('mutation($input: CollectionInput!) { collectionUpdate(input: $input) { collection { handle } userErrors { field message } } }',
                {'input': {'id': node['id'], 'image': {'src': stage([path])[0], 'altText': c['title']}}}, mutate=True)['collectionUpdate']
        check(d['userErrors'], c['handle'])
        print('cover:', d['collection']['handle'])


def tests():
    nodes = gql('{ products(first: 50, query: "tag:test-product") { nodes { id handle } } }')['products']['nodes']
    for n in nodes:
        d = gql('mutation($input: ProductInput!) { productUpdate(input: $input) { userErrors { field message } } }',
                {'input': {'id': n['id'], 'vendor': DATA['vendor'] + ' Test'}}, mutate=True)['productUpdate']
        check(d['userErrors'], n['handle'])
        print('test vendor:', n['handle'])


def names(handles):
    """A rename only. `products --force` would resend photos and stock, and productSet drops metafields it isn't given."""
    titles()
    if not handles:
        sys.exit('names: give the handles to rename')
    by_handle = {p['handle']: p for p in DATA['products']}
    for h in handles:
        p, pid = by_handle.get(h), existing('product', h)
        if not p or not pid:
            sys.exit(f'names: {h} is not in ' + ('the store' if p else 'the catalogue'))
        d = gql('mutation($input: ProductInput!) { productUpdate(input: $input) { product { handle title } userErrors { field message } } }',
                {'input': {'id': pid, 'title': p['title'], 'seo': {'title': p['seo_title']}}}, mutate=True)['productUpdate']
        check(d['userErrors'], h)
        print('name:', d['product']['handle'], '->', d['product']['title'])


def home():
    keys = [k for k in BUILT['home'] if not k.startswith('cover-')]
    alts = {f'hero{i}': h['alt'] for i, h in enumerate(DATA['home']['hero'])}
    alts.update({o['key']: o['alt'] for o in DATA['home']['occasions']})
    urls = stage([os.path.join(OUT, BUILT['home'][k]) for k in keys], 'FILE')
    files = [{'originalSource': u, 'contentType': 'IMAGE', 'alt': alts.get(k, ''), 'duplicateResolutionMode': 'REPLACE',
              'filename': os.path.basename(BUILT['home'][k])} for u, k in zip(urls, keys)]
    d = gql('mutation($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id fileStatus } userErrors { field message } } }', {'files': files}, mutate=True)['fileCreate']
    check(d['userErrors'], 'fileCreate')
    for k in keys:
        print(k, 'shopify://shop_images/' + os.path.basename(BUILT['home'][k]))


def publish():
    pubs = gql('{ publications(first: 20) { nodes { id name } } }')['publications']['nodes']
    online = next(p['id'] for p in pubs if p['name'] == 'Online Store')
    ids = [existing('product', p['handle']) for p in DATA['products']] + [existing('collection', c['handle']) for c in DATA['collections']]
    for i in filter(None, ids):
        d = gql('mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }',
                {'id': i, 'input': [{'publicationId': online}]}, mutate=True)['publishablePublish']
        check(d['userErrors'], i)
    print('published', len(ids))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--force' in sys.argv
    cmd = args[0] if args else ''
    if cmd in ('products', 'prices'):
        import atexit
        atexit.register(lambda: print('\nPrices or products may have changed: run `npm run check:money` (theme dev running) before anything else.'))
    if cmd == 'products':
        products(args[1:], force)
    elif cmd == 'prices':
        prices()
    elif cmd == 'collections':
        collections(force)
    elif cmd == 'filters':
        filters()
    elif cmd == 'covers':
        covers()
    elif cmd == 'names':
        names(args[1:])
    elif cmd == 'tests':
        tests()
    elif cmd == 'home':
        home()
    elif cmd == 'publish':
        publish()
    else:
        print(__doc__)
