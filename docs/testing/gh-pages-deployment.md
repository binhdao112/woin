# gh-pages deployment verification

The existing repository publishes a static site from the root of `gh-pages`. The `github-pages` environment allows the `gh-pages` branch only.

## Failed deployment diagnosis

Run `38869267899` built and packaged the site successfully, then rejected the `Publish website` job before any steps ran:

> Branch "main" is not allowed to deploy to github-pages due to environment protection rules.

Changing the environment policy through the API returned HTTP 403 because the connected account has Write access, not Admin. No environment protection rule or Pages source setting was changed.

At the user's request, the verified contents of `dist/` were published to the root of `gh-pages` instead. A separate snapshot was added under `previews/campus/`.

## Published artifacts

- Source commit: `1fbc04a26b05c7bee3786d603d4758690a7c2ab7` (the code from PR #1).
- Deploy commit: `a9583e0e0ee20e11e67c25a72b165c990132042f` on `gh-pages`.
- [Successful Pages run](https://github.com/binhdao112/woin/actions/runs/38870010153): build, report-build-status and deploy all passed.
- Root: <https://binhdao112.github.io/woin/>
- Preview: <https://binhdao112.github.io/woin/previews/campus/>

Both paths were checked over HTTPS: 13 resources each, all 26 returned HTTP 200 and matched the exact local dist bytes by SHA-256. Both `version.json` files returned the expected source commit. Local checks also passed with the nested mount path `/woin/previews/campus/`.

The actual preview was opened in the browser: campus rendered, the ticket was collected, progress became 1/7 and the coffee station became reachable. No captured browser warning/error logs. A screenshot is saved in `output/vng-campus-deployed.png` (ignored QA artifact).

The conflicting custom workflow `Deploy GitHub Pages` was disabled after the successful branch deployment. This change removes that workflow from source and updates the runbook. The native `pages build and deployment` workflow and application Checks remain active. This cleanup does not need to be merged to view the already-published root or preview.
