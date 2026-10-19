# Receipt-driven drink loading — 19/10/2026

- RED `48916a8`: loading lifecycle and uncertain-send/retry tests failed before implementation.
- A cup with a rotating ring and three dots appears only while the selected participant's send is active. It stays visible until transport/receipt completes; acceptance reveals continue, errors remove loading and leave the same pending request available for retry. Repeated taps cannot send another order.
- The form exposes aria-busy; the existing polite status region stays outside that form. Decorative loading markup is aria-hidden; reduced-motion CSS disables all new animation. No percentage or success is invented.
- The close button remains above the loading panel and Escape stays available. Changing participants while another receipt is pending does not show the previous person's loading as a new send.
- Node:126/126 tests pass,69 Pages resources, generated KOI bundle synchronized, syntax/diff checks passed.
- Browser mock transport: desktop1280×720 and mobile390×844, animations running; mobile dialog x12.08/y71.43/365.85×701.13 with no scroll. Closing while waiting and returning after a mocked error hides loading and allows retry without revealing continue. No warning/error logs; no real Sheets writes.
- Screenshot: output/drink-loading-mobile.png in the original workspace. Mock fixtures are ignored and not published. Viewport override reset after verification.

## Primary action sizing follow-up

The single remaining footer group still used space-between alignment after skip removal, leaving desktop actions narrow and left-aligned. Both submit and confirmed-continue now use a centered grid, 520px maximum desktop width / full mobile content width, 64px minimum height, 17px bold text, deeper green fill and shadow. Choice/status text is centered as well. Hidden actions remain hidden.

Browser actual counter + mock receipt:1280×720 and375×667, both action states centered within0.001px of the dialog midpoint; mobile submit56.1px and continue53.0px tall after popup scaling. No scroll, exactly one visible primary action, no warnings/errors, continue completes the callback. No real Sheet writes. Screenshots: drink-actions-order-mobile.png, drink-actions-confirm-mobile.png, drink-actions-confirm-desktop.png in original workspace output. Existing126tests and69resource checks passed. Cosmetic CSS change; no new implementation-mirroring tests added.
