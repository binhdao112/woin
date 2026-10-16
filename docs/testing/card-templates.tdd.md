# Four selectable card templates — TDD evidence

Request: add multiple distinct greeting card designs. Preserve the existing collection journey, social formats, photo and full keepsake export.

## Checkpoints and automated checks

- RED `1681e02`: `npm test` passed the existing 12 checks and failed 3 new checks because the four-template registry and rendering/fallback behavior were missing.
- GREEN `030c633`: `npm test` passed all 15 checks after the new renderers, template metadata, copy and filenames were added.
- Final validation: `npm run test:coverage`, `node --check dist/app.js`, `git diff --check`.

The new matrix covers all 4 templates × 2 formats × photo/no photo (16 rendering cases), plus long Vietnamese names in every template/format, invalid-template fallback, distinct filenames and template-specific copy. The original journey, full card and PNG error-path tests remain passing.

Coverage: `dist/card-templates.js` 100% lines/functions and 98.47% branches; `dist/social-card.js` 94.83% lines, 98.65% branches and 92.31% functions. This is not a coverage claim for the entire legacy application.

## Browser checks

Used the in-app browser and an ignored local completed-journey fixture:

- Inspected the four actual layouts side by side. Fixed the scrapbook heading color after visual inspection found yellow text on its yellow highlight.
- Verified actual selectable thumbnails and downloaded all four 1080×1350 PNGs from the application's download button. Filenames distinguished editorial/scrapbook/midnight from the original bloom export.
- Uploaded a generated local image fixture and downloaded all three new 1080×1920 story templates with that image. Inspected each output for frame, text and name placement.
- Reloaded and confirmed the midnight choice was restored in the same tab session.
- Confirmed the template picker hides for the full keepsake export and the selected style returns when switching back to a social format.
- At a 390×844 viewport, the picker had 4 choices and the dialog's client width and content width were both 354px.
- Captured no browser warning/error log entries during the completed verification.

Review artifacts: `output/card-templates-gallery.jpg`, `output/card-templates-studio.jpg`, `output/card-template-*.png`. Outputs are local-only and excluded from Git. Photo samples use an artificial gradient fixture, not a person's photograph. Temporary viewport settings are reset after verification.

## Scope limits

No hosting update or automatic social posting. Safari/iOS and physical devices were not tested. Three new designs use deterministic canvas drawing; the original bloom design continues to use the existing generated artwork. New photo uploads remain local to the page session.
