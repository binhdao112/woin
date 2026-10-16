# KOI drink registration: TDD evidence

Journeys were derived from the request: choose a real KOI menu item at the coffee station, send the choice to the host's Google Sheet, and group cups for ordering. Existing collection progress and PNG cards must keep working.

## RED → GREEN checkpoints

- `3d08b07`: 7 executed tests RED for missing catalog validation, totals, safe cells and confirmed delivery. `d4bdb52`: the same 7 tests GREEN.
- `0fc7439`: 2 executed tests RED for the missing Sheets service. `f4e8572`: all 9 relevant tests GREEN after private upsert and receipt handling.
- `7bdc402`: 2 executed tests RED for missing durable registration state. `d8ad7c1`: both GREEN.
- UI integration: 51 tests GREEN. Kept checkpoints on `codex/koi-drink-orders`; no history rewrite.

## Guarantees

| Behavior | Evidence | Result |
| --- | --- | --- |
| Server chooses the exact catalog variant and price, one cup per registration | `tests/drink-orders.test.js` | PASS |
| Reject invalid options, unknown drinks, unsafe identifiers and stale menu versions | `tests/drink-orders.test.js` | PASS |
| Group by drink/size/sugar/ice/note; edits replace prior participant choices | `tests/drink-orders.test.js`, `tests/drink-sheets.test.js` | PASS |
| An opaque POST or mismatched receipt never produces success | `tests/drink-orders.test.js` | PASS |
| Retry and reload keep the same pending request ID | `tests/drink-registration.test.js` | PASS |
| Formula-like names/notes remain text; public receipt has no names or list endpoint | `tests/drink-orders.test.js`, `tests/drink-sheets.test.js` | PASS |
| Interrupted summary write is repaired idempotently, closed/full events reject new writes | `tests/drink-sheets.test.js` | PASS |
| Generated Apps Script matches the website's exact menu and validation | `npm run check:drinks` and test | PASS |

## Browser evidence

Tested production artifact in preview mode at 1280×720 and 390×844. Search `hong tra sua` finds Hồng Trà Sữa, switching size updates 57,000 → 76,000 VND, sugar/ice and notes work, and mobile shows reachable controls without horizontal overflow. Preview explicitly says it has not sent a real order.

An ignored QA copy injected a local transport to a server running the actual generated `Code.gs` with simulated Google services. The browser used the real POST/JSONP receipt code:

- Minh Anh registered one small milk tea, then changed to medium/0% sugar.
- Receipt reads were deliberately blocked. Three retries and a reload still left exactly one row. Releasing receipts confirmed that original request.
- Continued from the coffee station to station 3, collection 2/7. Edited the order from the toolbar later; collection stayed 2/7.
- Thu Hà used a separate browser origin/storage and registered the same final small/0%/less-ice cup. The summary had **2 cups, 114,000 VND, both recipient names**.
- No browser errors/warnings. QA server, requests and screenshots remain in gitignored `output/`.

## Commands and limitations

`npm test`: 51/51 passed. `npm run check:pages`: 24 linked resources under `/woin/`. `npm run check:drinks`, JavaScript syntax checks, `actionlint`, `git diff --check` passed.

`npm run test:coverage`: domain validation/aggregation, receipt client and durable state modules each 100% line coverage; branch coverage 84–93%, function coverage 80–100% at the recorded run. The app's DOM/Three.js orchestration is covered by browser checks. The Apps Script service is executed via VM integration tests; V8's file coverage does not count the `.gs` VM source. CLI wrapper paths are checked by running the CLI. Vendored Three.js coverage is not a feature metric.

External setup remains: Google sign-in, host deployment and the `/exec` URL. The published config intentionally has `enabled: false`; no Google Sheet has received live orders during this task. A live Google confirmation/permissions/redirect smoke test is required after setup.
