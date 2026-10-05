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
