# Three feminine pink print concepts

The host wanted more feminine pink options after the pastel version of Đêm ánh kim. Added three independent vector layouts: 06 Nơ hồng ballet (milk pink, bow), 07 Hồng trà hoa (warm tea rose, botanical linework), and 08 Pink Muse (rose pink, editorial typography). Each retains the approved collective photograph and five roster names. The gallery now contains eight physical print concepts; four online card styles are unchanged.

## Artifact verification

- Three PDFs, ten pages each: five personalized front/back pairs. Extracted every page to confirm the correct name/code, A6 148 × 105 mm TrimBox, 3 mm bleed, and official QR metadata/links.
- Independently rendered all fifteen new PDF back pages and scanned them with macOS Vision: 15/15 decode to `https://binhdao112.github.io/woin/`.
- Scanned all forty gallery back-preview JPEGs: 40/40 decode to the official URL. Preview pages now isolate canvas graphics state like the print pages, keeping QR modules visible on later pages.
- Visually reviewed all three new fronts with the long Ngọc name and all three back layouts. Bow, floral and editorial decorations remain outside the message and QR areas.
- Preserved hashes for all 57 existing print assets except the intentionally updated manifest. Original album photos remain unchanged.

## UI and regression verification

- Browser at 1280 × 720 and 375 × 667: all eight concepts, direct links for 06/07/08, correct name/side preview changes, loaded 1600px images and no horizontal overflow.
- Downloaded Pink Muse through its gallery link and compared the bytes with the source PDF: exact match.
- Browser warning/error log empty. Temporary viewport restored and QA tab closed.
- `npm test`: 142/142 passed. `npm run check:pages`: 80 resources passed. Gallery JavaScript syntax and diff whitespace checks passed.

Ignored evidence: `output/pink-collection-artifact-proof.json`, `output/pink-collection-qr-proof.json`, `output/pink-all-preview-qr-proof.json`, and `output/pdf/pink-collection/` in the managed checkout. Browser screenshots and final artifact proof are copied to the host checkout's ignored `output/` directory.
