# Participant-bound check-in photos — 19/10/2026

The user reported another person's portrait on the selected participant's card. Card composition previously reused the station-seven photo, while private check-in photos were one global variable. The host chose filename prefixes in `/Users/lap15111/Downloads/album` to provide the identity mapping; no face/name inference is used.

- RED `ecff094`: `node --test tests/participant-photos.test.js` reproduced the wrong-person card and missing binding/store functionality (4 intended failures).
- GREEN `652885e`: 4/4 passed. Cards use stable participant IDs, an explicitly configured group fallback and separate private photo/hidden states. Slow renders capture the owner before awaiting assets; superseded photo decodes cannot replace a newer selection. Full-keepsake composition also uses the assigned participant photo.
- Module coverage: `node --experimental-test-coverage --test tests/participant-photos.test.js` reports participant-photos.js100% lines/functions and85.71% branches. App composition is exercised from its actual function in a VM; that part is not instrumented app-wide coverage.
- RED `267eb9d`: `node --test tests/prepare-album.test.js` added two failing cases for prefix-based binding generation and removing a former group fallback when explicitly renamed as a portrait.
- GREEN `71a3c05`: 7/7 importer tests passed. All five canonical codes, case-insensitive prefixes, numbered priority, content-stable IDs after renames, duplicate content assigned to multiple explicit prefixes, safe unrenamed group fallback and invalid-input preservation are checked.
- `npm test` before the importer addition passed136/136; Pages73resources and Apps Script bundle checks passed. Importer additions were checked separately as described above.
- At this checkpoint, the host is renaming files. The configured fallback remains the previously approved group photo19, with no inferred individual assignments. The renamed-folder import and deployment must be verified after the host supplies the filenames; this report does not claim those steps are complete.

## Renamed album sync

The host subsequently confirmed the renamed/updated folder and requested official publication. All26filenames have one of the five supplied identity prefixes or `team_`. There are25unique images; the shared LyHK/ThaoNTK JPEG is imported once and can be referenced by both explicit prefixes. Five participant mappings are present and every ID resolves to the imported album. Group fallback retains the same supplied team photo used by the print cards. No face-based identity guesses were made.

- RED `a68c59f`: `node --test tests/memory-album.test.js tests/prepare-album.test.js` reproduced26images truncated at24. GREEN `4c9d941`:15/15 passed after raising the album capacity to48, retaining bounded loading and limit checks.
- Real-folder import:25photos,18existing IDs retained,7new assets. Six oversized input files (one duplicate) get web derivatives at2200px/JPEG88 with EXIF orientation;26input files total170.55MiB become26.38MiB. SHA-256 confirms all26host originals unchanged. Existing repo image bytes and print artifacts are preserved.
- `npm test`:139/139. `npm run check:pages`:79resources. Apps Script bundle, JavaScript syntax and diff checks pass.
- Browser1280×720: explicitly selected all five roster names; each check-in renders the photo selected from that code's filenames. Private Hân photo survives Hân→Ngọc→Hân, without appearing on Ngọc. Restoring the assigned photo updates the existing four-template gallery. Browser375×667 fits without scrolling. No warning/error console logs. No real Sheet POSTs.
- A real browser download of the Hân editorial PNG is1080×1350; the rendered gallery and exported photo were checked. Screenshots in the original workspace's ignored output directory: participant-photo-{ly,thao,nhan,ngoc,han}-desktop.png, participant-photo-ngoc-after-custom.png, participant-photo-han-restored-custom.png, participant-photo-gallery-mobile.png. Mapping sheet: participant-portraits-mapping.jpg. File/hash proof: renamed-album-optimization.json.
- Temporary viewport override reset; local fixture tab closed. The fixture only seeds simulated receipts in localhost storage. Live publishing verification is recorded separately in participant-photos-deploy-proof.json after release.
