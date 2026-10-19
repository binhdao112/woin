# Participant-bound check-in photos — 19/10/2026

The user reported another person's portrait on the selected participant's card. Card composition previously reused the station-seven photo, while private check-in photos were one global variable. The host chose filename prefixes in `/Users/lap15111/Downloads/album` to provide the identity mapping; no face/name inference is used.

- RED `ecff094`: `node --test tests/participant-photos.test.js` reproduced the wrong-person card and missing binding/store functionality (4 intended failures).
- GREEN `652885e`: 4/4 passed. Cards use stable participant IDs, an explicitly configured group fallback and separate private photo/hidden states. Slow renders capture the owner before awaiting assets; superseded photo decodes cannot replace a newer selection. Full-keepsake composition also uses the assigned participant photo.
- Module coverage: `node --experimental-test-coverage --test tests/participant-photos.test.js` reports participant-photos.js100% lines/functions and85.71% branches. App composition is exercised from its actual function in a VM; that part is not instrumented app-wide coverage.
- RED `267eb9d`: `node --test tests/prepare-album.test.js` added two failing cases for prefix-based binding generation and removing a former group fallback when explicitly renamed as a portrait.
- GREEN `71a3c05`: 7/7 importer tests passed. All five canonical codes, case-insensitive prefixes, numbered priority, content-stable IDs after renames, duplicate content assigned to multiple explicit prefixes, safe unrenamed group fallback and invalid-input preservation are checked.
- `npm test` before the importer addition passed136/136; Pages73resources and Apps Script bundle checks passed. Importer additions were checked separately as described above.
- At this checkpoint, the host is renaming files. The configured fallback remains the previously approved group photo19, with no inferred individual assignments. The renamed-folder import and deployment must be verified after the host supplies the filenames; this report does not claim those steps are complete.
