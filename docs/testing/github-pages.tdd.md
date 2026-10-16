# GitHub Pages readiness

Journeys were derived from the request to push a review branch and ensure GitHub Pages compatibility.

## Test evidence

- RED `56e886e`: `node --test tests/pages.test.js` failed four new tests because the Pages checker did not exist.
- GREEN `b5e05de`: the same four tests passed after adding the artifact checker. `npm run check:pages` fetched 13 actual resources successfully below `/woin/`.
- Final refinement: syntax checks propagate failure for every JavaScript file; README explains the existing `gh-pages` setup and the one-time switch to Actions after review.

| Guarantee | Verification | Result |
| --- | --- | --- |
| Relative HTML/module/style/artwork links work at a repository subpath | `tests/pages.test.js` | PASS |
| A root-absolute link escaping `/woin/` is rejected | `tests/pages.test.js` | PASS |
| Missing and case-mismatched JavaScript is rejected, including on macOS | `tests/pages.test.js` | PASS |
| Current dist contains all reachable resources | `npm run check:pages` | 13 resources PASS |
| Existing collection, campus and card logic remains valid | `npm test` | 22 passed, 0 failed |
| Workflows and expressions are valid | `actionlint .github/workflows/checks.yml .github/workflows/pages.yml` | PASS |
| JavaScript parses | `find dist scripts -type f \( -name '*.js' -o -name '*.mjs' \) -print0 \| xargs -0 -n 1 node --check` | PASS |

`npm run test:coverage`: checker line coverage 91.03%, branch coverage 86.96%, functions 100%. The remaining lines are its standalone CLI entry point, verified directly by `npm run check:pages`.

## Deployment boundaries

Checks run for the review branch and PR; the Pages publishing job is restricted to `main`. No main merge or production deployment was attempted. The existing repository uses a `gh-pages` branch; after approval, an administrator must select GitHub Actions as the Pages source before using the new publishing workflow.

The initial push was rejected with HTTP 403. After repository write access was granted, `codex/journey-keepsakes-png` was successfully pushed and [PR #1](https://github.com/binhdao112/woin/pull/1) was opened for review into `main`. The remote Pages configuration was confirmed as `legacy`, publishing from `gh-pages` at `/`; it has not been changed. GitHub-hosted Checks run on the review branch and PR. Their live results and downloadable website artifact are available from the PR checks; no production deployment or main merge has been performed.
