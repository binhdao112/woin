# VNG Campus preview · TDD evidence

The journeys were derived from the request to bring the company campus into the existing 20/10 experience. This is a locally served, illustrated scene inspired by public VNG exterior photos, not a measured architectural model.

## Journeys

- Explore eight campus destinations and collect the same seven souvenirs before opening the card studio.
- Revisit earlier destinations along an outdoor path without crossing offices or raised terraces.
- Switch between campus and the existing cloud scene while retaining the same session collection.
- Use the scene and card studio on a narrow phone screen.

## Checkpoints

- `c3a492f` RED: `node --test tests/campus.test.js` failed all three new tests because the campus module, integration and scene selector did not exist.
- `c091e23` GREEN: the same three tests passed; the complete suite passed 18/18 after adding the real Three.js scene, collection markers, walking waypoints and world links.
- `178f666` RED: the outdoor-route test exposed a segment cutting through the raised terrace (1 failure, 2 passes).
- `ee605fc` GREEN: moving the two courtyard stops clear of the terrace made all three campus tests pass.
- Final refinement: viewport-based overview camera, a single scrollable mobile toolbar, active station scrolled into view, and matching campus caption hashtag.

## Guarantees

| Guarantee | Evidence | Result |
| --- | --- | --- |
| Eight finite ground-level destinations, valid forward/backward routes and invalid input rejection | `tests/campus.test.js` | PASS |
| Walking center line remains outside two office footprints and raised terrace, in both directions | Route sampled in both directions in `tests/campus.test.js` | PASS |
| Actual geometry, selectable destinations and markers driven by shared collection policy | Real Three.js objects in `tests/campus.test.js` | PASS |
| Default campus and selectable cloud scene integrated in application | Integration contract in `tests/campus.test.js`; browser checks below | PASS |
| Collection and card regressions | `npm test` | 18 passed, 0 failed |

## Browser verification

Used the local server at `http://127.0.0.1:8765/dist/?world=campus`.

- Entered the example name Minh Anh and collected the ticket.
- Switched to the cloud scene and back; the ticket and name remained in the session (1/7).
- Completed coffee, tarot, lucky number, wheel, fortune letter and photo-frame stages through the visible controls. At the final garden the counter was 7/7 and all four social-card choices opened correctly.
- Removed the previously agent-created `team-qa` test photo and verified the frame placeholder path.
- Clicked the first destination from the final destination; the full reverse route completed at the lobby with the collection still 7/7.
- At 390×844, verified the complete model, horizontal toolbar/route, readable narrative and card studio. Document width was 390; there was no page overflow. Reset the viewport override after checking.
- Desktop scene rendered correctly with no captured warning/error logs.
- Local screenshots: `output/vng-campus-preview.png`, `output/vng-campus-mobile.png` (ignored QA artifacts).

## Coverage and limits

`npm run test:coverage` passed 18/18. `dist/campus.js`: 99.00% lines, 98.61% branches, 100% functions. Other application modules remain above 94% line coverage. The aggregate report includes the vendored Three.js engine, which is not an application coverage target. Browser-only texture labels and the complete WebGL render loop are verified visually, not by pixel assertions.

`node --check dist/app.js` and `git diff --check` passed. No new dependencies or downloaded 3D assets. This work remains local, on the existing `codex/journey-keepsakes-png` branch; no push or deployment was performed.
