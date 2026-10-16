# Avatar actions and free walking · 16/10/2026

## Journeys and checkpoint evidence

A guest can move with held WASD/arrow keys or four touch buttons, stop on release, approach an unlocked station and press E. Movement must preserve collection gates and never register a drink. A guest can open six cute gestures, replace/stop them, and change clothes without leaving a displaced body or leaked GPU resources.

| Behavior | Test target | RED checkpoint | GREEN checkpoint |
| --- | --- | --- | --- |
| Articulated arms/head, six distinct finite poses, palms-up 67, reduced motion, cancel/replace/complete and resource cleanup | `tests/avatar-actions.test.js` (8 tests) | `bc25722`: 8 intended failures, first missing arms/head and remaining action modules absent | `97ed044`: all 8 pass |
| Frame-rate/diagonal speed, wall sliding and bounds, routes from arbitrary positions, connected cloud bridges, station gates and key release | `tests/avatar-movement.test.js` (5 tests) | `e9a0ec8`: 5 intended failures because the movement module did not exist | `13264bc`: all 5 pass |
| Existing main action still collects at the station and routes back first when far away | `tests/journey.test.js` | Existing collection test plus distance regression | Full suite: 78 pass, 0 fail |

Raw RED/GREEN logs were captured locally in `/tmp/woin-avatar-actions-red.log`, `/tmp/woin-avatar-movement-red.log` and `/tmp/woin-avatar-all-tests.log`. Checkpoint commits retain the reproducible test sources and implementation boundaries.

## Local checks

- Node 23.11.0, `npm run test:coverage`: 78/78 pass.
- New action sampler/player: 100% line/branch/function coverage.
- Action effects: 100% lines/functions, 98.08% branches.
- Movement/collision/pathfinding: 100% lines/functions, 94.05% branches.
- Shared avatar rig: 100% lines/branches/functions with all appearance variants.
- Browser controller and app wiring are exercised in browser QA; the percentages above refer to the tested core modules, not DOM wiring or the vendored Three.js library.
- `npm run check:pages`: 34 linked resources resolve under the GitHub project subpath.
- `npm run check:drinks`: generated Apps Script bundle still matches the menu and validation.

## Browser QA

Tested the actual static app over HTTP in the Codex in-app browser at desktop width and 390×844. These are interaction checks and visual inspection, not a claim of a full accessibility audit or a pixel-baseline comparison.

- Named custom avatar starts the campus, retains appearance and gift counts.
- Held S key and held touch-down button move away continuously; release removes pressed styling and stops. Far from a station, E is disabled and the main button offers to walk back.
- Clicking the return button routes from the current position; E opens the station ticket. A held movement key while its panel is open does not move the avatar.
- All six gesture buttons replace each other and announce the current action. Actual 67 animation displays the two moving forearms and separate 6/7 labels. Stop and Escape reset the rig.
- Mobile free-walking camera leaves the avatar above the touch controls. Six gesture buttons fit in a 3×2 grid without horizontal page overflow.
- The existing KOI counter still loads its menu. No drink was submitted during QA.

## Design boundaries

- Walkable campus ground excludes the two office wings, raised terrace, pool, counter, major planters/benches and several trunks; decorative foliage is not a full physics mesh.
- Cloud movement stays on the union of islands and the consecutive bridge corridors.
- Automatic navigation searches from actual coordinates, checks each segment, and smooths only clear segments. Manual input cancels that route.
- Camera-relative direction and normalized vectors prevent diagonal acceleration. Substeps prevent fast frames from jumping through walls.
- Keyboard input clears on keyup, blur, hidden document and overlays. Text fields retain their normal editing keys. Memory-gallery arrows retain photo navigation.
- Actions change only local rig joints; the player anchor, souvenirs, gift map, lucky set, order config and Google endpoint are untouched.
- Each action replaces the previous action, with no timer queue. Effects own and dispose geometry/material/label textures once.
- Reduced motion uses a still pose and still effects. No licensed audio or new dependency is required.
- Reloading returns to the saved station; arbitrary walking coordinates are intentionally not persisted.
- Work is isolated in the attached `avatar-actions` worktree because the original checkout has a user placeholder edit. That edit was not staged or modified.

## Scope update: retire the cloud world

The user subsequently asked to remove “Văn phòng trên mây”. The final app has one campus scene. Commit `db82747` records two intended RED tests: old menu/branding still present and the canonical-URL helper missing. Commit `9b34e83` records GREEN: old cloud URLs normalize to campus while preserving the preview path, extra query parameters and hash; the cloud scene/selector and card branding are removed. Historical cloud route tests above describe the earlier milestone; that retired behavior is no longer shipped or required. The final movement suite has four campus/input tests and campus tests include the legacy-link regression.

Rechecked locally in browser by reloading the old cloud URL: it became `?world=campus`, title was `VNG Campus · Một vòng cùng team · 20/10`, and no world-switch element remained. Final static smoke count is 35 linked resources. Final full suite remains 78 passing tests. After removing the retired branch, the movement module has 100% lines/functions and 93.42% branch coverage; the canonical URL helper has 100% lines/branches/functions.
