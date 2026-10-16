# Social card redesign — verification

User request: make the greeting card visually attractive enough for social check-ins. Preserve the collection flow and full keepsake export.

## TDD checkpoints

- RED `ef5c1e1`: `npm test` passed the existing 8 checks and failed the 4 new social-card checks for missing renderer, adaptive names, photo composition and distinct filenames.
- GREEN `c7dde3b`: `npm test` passed all 12 checks after adding fixed social layouts and the preview UI.
- Visual refinement: centered the main typography in the quiet part of the illustration, moved the post photo to the floral side and moved its quote to the clear side. Both photo formats are now covered by the composition test; direct module imports replaced the initial RED fallback.

Final commands: `npm run test:coverage`, `node --check dist/app.js`, `node --check dist/social-card.js`, `git diff --check`.

Coverage for `dist/social-card.js`: 94.55% lines, 98.59% branches, 92.31% functions. The browser image-loading helper is covered manually, not in Node. Existing journey and full card tests remain passing.

## Verified behavior

| Guarantee | Evidence |
| --- | --- |
| Fixed 1080×1350 post and 1080×1920 story | Unit tests and actual browser downloads; PNG headers checked |
| Long Vietnamese names remain within the typography area | Adaptive type unit test |
| Photo and artwork share the same exported canvas | Unit tests for post and story, plus local file-chooser upload and actual downloads |
| Preview and export use the same composition function | `composeWishCanvas` used by both paths; browser inspection of actual outputs |
| Full keepsake export remains available | Existing tests and actual browser download after switching formats |
| Mobile controls fit horizontally | 390×844 viewport: dialog client width and content width both 354px; screenshot inspected |
| No captured console warnings/errors | In-app browser log inspection after post/story/full downloads |

Manual browser QA used a completed sample journey via `output/card-review.html`, a local-only ignored fixture. Photo QA used a generated gradient image, not a real person's picture. The fixture was removed after verification. The social card files under `output/` are local review artifacts and excluded from Git.

No automatic social publishing was added. Native share dialogs, Safari/iOS and real device rendering were not tested. New check-in photos are local to the current page session. Hosting was not updated.
