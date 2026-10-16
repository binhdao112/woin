# Collection flow and personalized PNG — TDD evidence

## Scope and user journeys

Derived from the user's request to fix souvenir collection, unify counters and download a personalized PNG. No separate plan file was supplied.

1. A visitor receives each station's souvenir before continuing, using the same rule for navigation and progress.
2. Game results save immediately, and the photo station keeps the currently selected picture.
3. The final card includes the visitor's name, fixed wish, actual souvenirs and an optional local photo, and downloads as PNG.
4. Reloading the same tab restores the journey; replay starts again at 0/7.

## RED → GREEN checkpoints

- `9a0669f` — RED, `npm test`: 8 failing tests. The regression test executed the original main-button handler and observed `move(1)` with an empty collection, where `collect(0)` was required. Other tests specified the missing shared collection policy and PNG APIs.
- `3e354ff` — GREEN, `npm test`: 8/8 passing after the policy, navigation integration and PNG implementation. `npm run test:coverage` also passed.
- `496bd34` — Refactor, `npm test`: 8/8 passing after removing the obsolete visit-based progress state, using direct test imports, preserving display capitalization and waiting for restored photos before export.

These checkpoints are on `codex/journey-keepsakes-png`. Preserve this evidence if squashing.

## Automated guarantees

| Guarantee | Test | Type | Result |
| --- | --- | --- | --- |
| Main action opens the first missing gift instead of leaving station 0 | `tests/journey.test.js` — main button regression | Handler integration | PASS |
| Progress counts souvenirs and detects holes in older collections | `tests/journey.test.js` — progress and invalid destinations | Unit | PASS |
| All 7 stations require a gift before unlocking the following station | `tests/journey.test.js` — every station | Unit | PASS |
| Personalized card data reflects the actual 7 choices | `tests/wish-card.test.js` — card model | Unit | PASS |
| Vietnamese filenames and long unbroken text are handled | `tests/wish-card.test.js` — filenames and wrapping | Unit | PASS |
| PNG encoding handles success, null output and canvas exceptions | `tests/wish-card.test.js` — encoding | Unit | PASS |
| Layout expands for long text, includes an optional photo and handles unavailable canvas | `tests/wish-card.test.js` — renderer | Unit | PASS |

Commands: `npm test`, `npm run test:coverage`, `node --check dist/app.js`, `node --check dist/experience.js`, `git diff --check`.

Measured coverage for the new modules: `dist/journey.js` 100% lines/branches/functions; `dist/wish-card.js` 100% lines/functions and 93.65% branches. This does not measure the entire legacy Three.js application.

## Browser verification

Executed locally with the Codex in-app browser against `http://127.0.0.1:8765`:

- Entered a Vietnamese name and verified station 1 remained locked until receiving the departure ticket.
- Completed the full 8-station journey with tea, tarot, lucky number, wheel, fortune and a generated test photo. Counters consistently reached 7/7.
- Downloaded the actual PNG and checked its PNG signature and 1200×1774 dimensions. Visually inspected Vietnamese text, the seven personalized entries and the selected image.
- Reloaded, reopened the same card (wish 167/200), and downloaded again with the restored IndexedDB photo.
- Checked the card at 390×844 and reset the temporary viewport override afterwards.
- Replayed and verified 0/7, station 0 active and all later stations locked.
- No warning/error console entries were captured during the final verification.

Local review artifacts, ignored by Git: `output/upgrade-preview.jpg` and `output/thiep-20-10-demo.png`. The picture in the sample card is a generated QA fixture, not a real team photograph.

## Limits

Browser coverage is a manual end-to-end verification, not a checked-in browser automation suite. Safari/iOS, real low-end devices and browser-forced download failures were not tested. Shared team albums and GitHub Pages deployment were not implemented; selected photos remain browser-local as documented in `README.md`.
