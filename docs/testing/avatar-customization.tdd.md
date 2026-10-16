# Avatar customization: TDD evidence

Journeys were derived from the request to customize a character rather than only entering a name:

- Pick hair, hair color, outfit, outfit color, skin tone and accessory; preview and rotate the same 3D character that walks through the world.
- Randomize without changing the name; save to apply or cancel to preserve the committed appearance.
- Reopen, reload and upgrade an older journey without losing collected gifts or the active drink-registration service.

## Checkpoints

- `c6bdf1b`: `node --test tests/avatar.test.js` executed 7 tests, all RED because the requested profile/rig implementation did not exist.
- `ce4ff01`: the same 7 tests GREEN after safe catalog normalization, draft state and the shared Three.js rig were implemented.
- UI integration: all 65 tests pass, including the existing collection, lucky-set, card and KOI tests. Checkpoints remain on `codex/avatar-customization`, based on `codex/koi-drink-orders`.

## Guarantees

| Guarantee | Evidence |
| --- | --- |
| Only catalog IDs survive saved-data normalization; old/corrupt profiles fall back safely | `tests/avatar.test.js` |
| Every catalog choice round-trips through JSON; random draws cover both boundaries | `tests/avatar.test.js` |
| Draft changes and random styling do not overwrite the committed appearance until saved | `tests/avatar.test.js` and browser cancel/reopen flow |
| Preview alternative text describes the selected choices | Description test and browser accessibility tree |
| The model uses chosen skin/hair/clothing colors and retains two walking-leg pivots | Real Three.js geometry/material test |
| Every hair/outfit/accessory combination produces finite, visible geometry | 60 real-rig combinations in `tests/avatar.test.js` |
| Replacing the rig disposes its own geometry/materials exactly once, sharing no resources with another character | Dispose-event integration test |

## Browser verification

Production files were tested at 1280×720 and 390×844:

- Selected long black hair, lilac hoodie, honey skin and round glasses for Minh Anh; the same appearance was visible on the player in the campus.
- Random styling, both rotation controls and all six choice categories worked. A native radio ArrowLeft selected the neighboring accessory and updated the preview.
- Collected the departure ticket (1/7), changed outfit/color and canceled with the close button and Escape. Reopening restored the saved hoodie/lilac appearance and the counter stayed 1/7.
- Reload restored the same name, appearance and collection. The mobile preview and submit button remain visible while options scroll; the explicit Đổi mục control returns to the categories. No horizontal overflow at 390px.
- A separate ignored fixture loaded an old journey with one ticket and no avatar into the cloud world. It received the default character, preserved Hà's name and stayed at 1/7 after saving.
- Browser warnings/errors were empty during these checks. No drink selection was submitted to Google Sheets by avatar QA.

Two integration defects caught in browser checks were corrected: the old decorative `header` CSS disabled pointer events on the new cancel button, and the mobile grid could shrink its first row beneath the preview. The final header accepts clicks; mobile uses a fixed preview and separately scrolling controls. Native radio labels remain stable when their visible checkmark changes.

## Validation and limits

`npm run test:coverage`: 65/65 pass; both `avatar-profile.js` and `avatar-rig.js` have 100% line, branch and function coverage. DOM/WebGL studio orchestration is verified through the browser flows above rather than a simulated renderer. Existing vendored Three.js coverage is not used as a feature metric.

`npm run check:pages`: 29 linked resources under `/woin/`. JavaScript syntax, generated Sheets bundle match and diff checks pass. The preview uses the existing bundled Three.js; there are no external avatar models, uploads or new dependencies. It renders when options, rotation or size change, with no extra animation loop.

Screenshots remain in gitignored `output/avatar-*`. Published scope is the KOI preview; Sheets stays enabled and the root/campus snapshots are preserved. Main is not merged.
