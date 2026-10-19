# Pastel pink version of the night print card

The host requested the layout of physical print template 02, Đêm ánh kim, in pastel pink. Template 05, Ánh hồng pastel, shares its drawing branch and changes the palette to blush pink, plum text and rose accents. The four existing print PDFs and previews remain byte-for-byte unchanged. The four online card styles are a separate feature.

## Red and green

- `878a007` adds `scripts/check-pastel-print.py`. Before implementation it fails because the new PDF does not exist.
- `e6ebeb4` adds the shared-layout pastel variant and optional `--style` generation. The artifact check passes after generating `--style anh-hong-pastel`.
- The check compares all ten pages against template 02: text, coordinates and font sizes match; all five roster names and codes appear on both sides. It also checks the pastel background operators, TrimBox 148 × 105 mm, 3 mm bleed, preview assets, and the official QR URI/metadata.

## Print and browser evidence

- One PDF contains five front/back pairs, ten pages in total. Vietnamese font subsets are embedded and text remains vector. Rendered front and back for the long Ngọc name were visually inspected without overlap or clipping.
- Independently rendered the five back pages from the final PDF and scanned them with `scripts/check-print-card-qr.swift`: 5/5 decode to `https://binhdao112.github.io/woin/`.
- Local browser QA at 1280 × 720 and 375 × 667 verifies the direct `#anh-hong-pastel` link, all five print concepts, name/side changes, loaded previews, no horizontal overflow and no browser warnings/errors.
- Downloaded the PDF through the gallery link and compared its bytes with the source artifact: exact match. SHA-256: `a82b07d4ea9e3081361b6290a8704fd5904dc7aa59d4751fb7340e79b72a3119`.
- Preserved hashes for 46 prior print assets excluding the intentionally updated manifest. No original album files or real drink registrations were changed.

## Regression checks

- `npm test`: 142/142 passed.
- `npm run check:pages`: 80 linked resources passed.
- `npm run check:drinks`: generated Apps Script bundle synchronized.
- Gallery JavaScript syntax and `git diff --check` passed.

Ignored local evidence is stored under the host checkout's `output/`: `pastel-print-assets-proof.json`, `pastel-print-gallery-desktop.png`, `pastel-print-gallery-mobile.png` and the downloaded PDF. PDF render/QR evidence is under the managed checkout's `output/pdf/` and `output/pastel-qr-proof.json`.
