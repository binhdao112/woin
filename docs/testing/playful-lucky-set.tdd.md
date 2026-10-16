# Playful lucky set: TDD evidence

The request adds a playful six-number set at the lucky-number station. The existing 01–99 number, collection progress and cards must keep working. The chosen format is six distinct numbers from 01–45, as described in the [official 6/45 rules](https://media.vietlott.vn/vi/04.2019/system/archivedate/the-le-mega-6.45.pdf). The feature is presented as “Bộ số vui 6/45”.

## RED → GREEN checkpoints

- `79cdd70`: 16 relevant tests executed; 11 passed and 5 failed for the missing draw helper, validation, card data and exports.
- `b21fb8e`: the same 16 tests passed after implementing generation and card support.
- Final UI integration: 58/58 tests passed, including station locking, copy availability and structured collection data. Checkpoints are retained on `codex/koi-drink-orders`.

## Behavior and evidence

| Behavior | Evidence |
| --- | --- |
| Generate one 01–99 number and six unique, sorted numbers in 01–45 | Deterministic boundaries and 300 WebCrypto draws in `tests/lucky-numbers.test.js` |
| Avoid modulo bias | Rejection-sampling boundary test |
| Reject corrupt stored sets and preserve old journeys without inventing a set | Normalization and card-model tests |
| One station action saves both draws; copy stays available without rerolling or increasing progress | `tests/lucky-number-flow.test.js` and browser flow |
| All four templates include the same set in post/story exports | `tests/social-card.test.js` |
| Full keepsake card contains the same set | `tests/wish-card.test.js` |

## Browser evidence

The production files were tested locally at 1280×720 and 390×844 through the full journey. One actual draw returned single number **53** and set **01 · 14 · 18 · 24 · 25 · 41**. Copy produced that exact set. Reloading kept the same result and collection progress at 4/7. Completing the journey preserved it in the copied caption and downloaded PNGs.

The mobile dialog fits at 390×844 without internal scrolling; all six numbers, copy and continue controls remain visible. Reduced-motion users skip the staggered number reveal. Browser error/warning logs were empty after the journey and exports.

Actual downloaded files were inspected: Mây hoa post **1080×1350** and Đêm sao story **1080×1920**, both showing the original six-number set. Screenshots and exports are local evidence in gitignored `output/lucky-set-*`, not production assets.

## Validation

- `npm test`: 58/58 passed.
- `npm run test:coverage`: lucky-number helper 100% lines, branches and functions; card model 100% lines; social renderer 95.45% lines.
- `npm run check:pages`: 25 linked resources under `/woin/`.
- `npm run check:drinks`: existing generated Sheets bundle still matches.
- JavaScript syntax and `git diff --check` passed.

The root website and `/previews/campus/` snapshots remain separate. This feature is published with the current source branch to `/previews/koi/`; Google Sheets registration still requires the host's Apps Script `/exec` URL.
