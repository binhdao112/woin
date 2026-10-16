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

The local push attempt was rejected with HTTP 403: Git used account `nhaTahn`, which cannot write to `binhdao112/woin`. The review branch has not been created remotely, so GitHub-hosted CI and deployment cannot yet be verified. Local checks above do not claim a successful remote run.
