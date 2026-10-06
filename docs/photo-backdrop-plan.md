# Studio wall for the product photos

Status (2026-10-05): **live.** 138 photos on the store have the studio wall; 18 are kept as shot.

## Why

The catalogue photos are the real piece in a real hand, but most sat in front of busy settings
(blurred plants, doors, vases, lanterns). Raushan first liked Rare You's plain colour backdrops,
then chose something calmer: one warm studio wall with soft window light behind every piece, so the
shop reads as one shoot.

## What was done

- ChatGPT changed the backgrounds. Its output is `../catalog/studio-depth-batch/`, with the same
  sub-folders and file names as `../catalog/`, all 1254 × 1254. Its own before/after sheet is
  `../catalog/studio-depth-batch/review.html`.
- 138 photos have the new look (128 in the first pass, 10 in a second). 18 are byte-identical copies of the originals.
- Checked 2026-10-05: all 156 on contact sheets, and 12 products against the originals at full size
  (sunflowers, roses, tulips, bee, chick, octopus, peacock, evil eye, bag charm, pot). No change
  found in stitches, faces, colours, the wrap, ribbons or keyrings; hands and the bag are kept.
  This keeps the photo rule in docs/catalog-plan.md: only the setting changes.
- A local cutout script was tried first and dropped. For the record: `rembg`'s `birefnet-general`
  loses the hand, `birefnet-portrait` keeps it, and Bria RMBG is non-commercial.

## How the scripts use it

- `../catalog/` stays the originals. Nothing is copied over them.
- `tools/catalog-build.py` cuts the home page photos and collection covers from the studio version
  of a photo when one exists (`STUDIO`).
- `tools/catalog-upload.py products` uploads the studio version when one exists (`photo()`).
- `tools/catalog-upload.py covers` replaces collection cover photos only. Don't use
  `collections --force` for this: it resets the hand-picked order of Bouquets and Keychains.
- To go back to the originals, point `STUDIO` at a folder that doesn't exist and rerun.

To swap in a redone photo: put it in `../catalog/studio-depth-batch/` under the same name, then

```
python3 tools/catalog-build.py
python3 tools/catalog-upload.py products <handle> --force
python3 tools/catalog-upload.py home && python3 tools/catalog-upload.py covers   # only if it is a home or cover photo
```

`products --force` resends the product from the manifest (copy, prices from costs.json, 100 stock),
so check the store still matches the manifest first if anything may have been edited by hand.

## Second batch: 26 more products and 31 extra photos (live 2026-10-06)

Done: ChatGPT's results came back in `../catalog/studio-depth-batch-2/` (93 photos), all checked against the
originals on before/after sheets (pieces unchanged, every badge and label gone) and filed into
`../catalog/studio-depth-batch/`. One repeat was dropped (the same chick shot twice). The 26 products are uploaded
and published, the 13 existing products were resent with their extra photos (only their photos changed: prices,
stock and the test ratings read back the same), and `npm run check:money` passes for 55 products, 86 variants.
`catalog-upload.py products --force` now sends a product's other metafields back, because productSet deletes any
it isn't given: the first resend wiped the bee keychain's test ratings, which were put back from the snapshot.
What follows is how the batch was prepared; `pending` and `pending_photos` are empty again and the same steps work for a next one.

The second wave of sets, 41 photos, all SKU-named and held in a hand: 4 bouquets (sunflower duo with a
daisy, rose or bee; three mixed trios) and 9 keychain pairs and sets. They sit under `pending` in
`tools/catalog/catalog.json`, which the upload script and the money check don't read, so nothing is in the store yet.

Raushan then allowed photos with a Meesho pack badge, as long as the piece is real and the photo is clear (not a
raw phone shot on a bedsheet): ChatGPT removes the badge with the background. That added 6 products, 10 photos:
curtain tie-back packs of 2 and 4, an evil eye pair, flower claw clips, flower chain headbands, tricolour clips
(badge photos, in `to-studio/remove-badge/`) and the white and lavender clips. How "real" was judged: against his
raw phone photos where one exists, and by whether the same piece shows in two differently styled versions (then
the neater one is the redraw). The manifest's `held_back` says why each of the rest stays out. The headbands and
tricolour clips have no cost yet (placeholder prices).

Raushan's own review (2026-10-06): every photo still unused was copied to `../catalog/left-out/`, he deleted the
ones he didn't want and 56 stayed. His verdict on what is real replaces Claude's (he kept the chick, bee and octopus
keychains held by a sleeve, the heart pins, the sunflower claw clips and the scrunchies). 49 of them are in: 7 new
products (heart hair pins, sunflower claw clips, scrunchies, sunflower accessory set, bee pair, chick pair, octopus
pair), one more headband photo, and 32 extra photos for products already live (`pending_photos` in the manifest).
7 are repeats of a photo that is in. 7 photos with text all over or collages are marked `as_shot`: used as they
are, not sent to ChatGPT. Heart pins, scrunchies and the hair tie have no cost yet.

1. `python3 tools/catalog-build.py` copies their photos into `../catalog/<type>/<handle>/` and, flat, into
   `../catalog/to-studio/`. That folder is the one to hand to ChatGPT.
2. Save the results under the same file names in `../catalog/studio-depth-batch/` (loose is fine) and run the
   build again: it files each one in its product folder and drops it from `to-studio/`.
3. Check them against the originals, move the entries from `pending` to `products` and each `pending_photos`
   entry into its product's `photos` (then `products <handle> --force` for those), add the handles to
   `collection_order`, then `python3 tools/catalog-upload.py products && python3 tools/catalog-upload.py publish`
   and `npm run check:money`.

## Kept as shot (18)

- 14 flat-lays on cloth: six bouquets lying down and the hair set.
- The bag charm worn in hair (two photos) and the two curtain tie-backs.

## Second pass (10)

Still busy after the first pass, so Raushan had them redone the same day:

- Five pots standing on a table: same wall, plain table top, props removed.
- Two hair-set photos worn in hair: the wall instead of a doorway.
- `sunflower-crochet-bouquet-3-sunflowers-04.png`: plain cream cloth instead of a table with a sign.
- `crochet-flower-hair-clips-blue-02.png`: cream cloth instead of pure white.
- `sunflower-crochet-bouquet-1-sunflower-01.png`: the plant at the left edge removed.

## A Shopify quirk

`collectionUpdate` refuses a cover image identical to the current one ("Error updating collection
with this image"), so `covers` compares first and skips those.
