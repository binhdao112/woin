# Guest drink menu without prices — 19/10/2026

The guest counter omits currency values from all menu cards, size choices and confirmation. It invites guests with “Gu của bạn, team bao. Chọn món mình mê, hôm nay cứ để được chiều!”. The host explicitly asked to leave the full menu image unchanged; the image, its original link and the Grab link remain available. Catalog prices, order validation and the host's Sheet totals are preserved.

- RED `98e54aa`: counter integration test failed on the existing displayed prices.
- GREEN `1d9c5a8`: the same test exercises the actual counter and Apps Script fixture, checks all 88 cards, size choices and confirmation, then confirms one explicit submission retains the correct catalog price in both Đăng ký and Tổng hợp.
- Full suite: 130/130 tests passed. Pages: 71 linked resources passed. Generated Apps Script bundle remains synchronized. JavaScript syntax and diff checks passed.
- Browser at 1280×720 and 375×667: invitation visible, size-only choices, no currency in selection or accepted confirmation, prominent centered action, popup without scrolling, no warning/error console logs. Acceptance used an injected local mock transport, with no real Sheet writes. Viewport override reset and QA tab closed afterward.
- Screenshots in the original workspace's ignored output directory: `team-treat-menu-mobile.png` and `team-treat-confirm-mobile.png`. The local mock fixture is ignored and not published.
- This change does not deploy the earlier Apps Script summary patch; that update still requires the host's authenticated Google session.
