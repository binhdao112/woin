# Google Sheets connection activation

Checked on 16 October 2026 after the host confirmed running `setupKoiOrders`.

- The host's Order 20/10 spreadsheet now has the Đăng ký and Tổng hợp tabs.
- An intentionally outdated `menuVersion` with event `team-2010-2026` returns `rejected / menu`; before setup the event was rejected as `invalid`.
- A browser page using the production `sendDrinkOrder` client successfully sent a cross-origin POST and read the matching JSONP receipt from the actual Google deployment. It received the expected definitive menu rejection. Browser warning/error logs were empty.
- That request is rejected before the Sheets write, so it creates no test cup and submits no name or drink choice.
- The host endpoint is enabled in `dist/assets/drinks/order-config.json`. This URL is the public registration service, not a Google credential.
- `npm test`: 58/58 pass. Pages resource check: 25. Generated Apps Script/menu match; diff check passes.

The first real drink choice must still be checked against its row in Đăng ký and grouped total in Tổng hợp. This activation check proves the live POST/receipt transport and event setup, rather than claiming a test cup was written. The website reports success only after the accepted receipt for the submitted request and sequence.

Publishing scope is `/previews/koi/`; the root and campus snapshots stay separate, and main is not merged.
