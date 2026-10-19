# Drink profiles and blank-row summary fix — 19/10/2026

## Reproduced issues

- Event-wide browser storage reused a confirmed drink and participant UUID after selecting a different colleague. A subsequent update could overwrite the earlier colleague's row.
- The skip button could create a default water souvenir without a registration.
- The current host Sheet's Tổng hợp visibly contained a blank group of 5 cups and 1 named cup. The old summary counted event rows even when their name/variant had been cleared. A subsequent XLSX export confirmed five source rows (2–6) retaining only A:D identity fields; their E:P drink fields were empty. The named summary cup was stale relative to the exported details. This read-only inspection did not change the host Sheet.

## Checkpoints and behavior

- RED `62848c3`: per-person storage, legacy ownership, nickname identity, souvenir reconciliation (7 failures reproduced).
- RED `2a7ae20`: blank summary rows counted as 6 cups instead of 1.
- GREEN: scoped stores, one-owner legacy migration, captured async store context, explicit receipt gating, no skip/default souvenir, and validation of summary source rows.
- A roster nickname keeps its canonical pickup name. Another roster selection gets its own stored UUID and starts without a choice; existing own accepted orders can be restored.
- The Apps Script change preserves invalid source rows for review and excludes them from totals. It requires updating the existing host script and deployment; publishing GitHub Pages alone cannot update Google Apps Script.

## Verification

- Node tests exercise the actual counter and generated Apps Script: two colleagues create two rows; editing one leaves the other unchanged; no selection creates no POST; a late receipt after switching people confirms only the original store; ambiguous sends retry the identical request; blank source rows are retained but not counted.
- Browser fixture uses the production counter with an injected mock transport. Desktop and 390×844: no skip button; new colleague has no selected drink, submission disabled; nickname restores only its own accepted choice. Mobile dialog fit: x12, y77.6, 365.8×688.8, no scroll.
- Browser full app migration fixture: an old unconfirmed default-water souvenir is removed, progress becomes 1/7 and the cafe is the next required station. No browser warnings/errors observed.
- No real registration requests or Sheet writes were made during verification.
- Host Apps Script project redirected to its sign-in landing page: this browser is not authenticated to update the deployed script.

Final local verification: `npm test` 124/124; `check:pages` 69 linked resources; `check:drinks` synchronized; all dist JS syntax and diff checks passed.
