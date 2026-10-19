# Visible template choices from final check-in — 19/10/2026

Journey derived from the user's screenshot: a participant viewing a pose must be able to find the other card designs immediately, choose another design and keep their existing journey, name and selected image.

The four-design link was hidden inside the Save/share tab. It is now a persistent “Đổi mẫu thiệp” action above all four tabs, with a “4 phong cách” label. It opens the existing Mây hoa, Bìa tạp chí, Sổ tay vui and Đêm sao gallery. Entering this way selects the template tab, exits enlarged-preview mode and changes a full keepsake layout to a social post so the four choices are visible. Existing Story selection is preserved. Other gallery entry paths retain their current behavior.

- RED `8f4375e`: `node --test tests/checkin-templates.test.js` executed two tests; the gallery remained in full-keepsake format instead of showing its templates (one intended failure).
- GREEN `240fec8`: same target passed 2/2. Tests exercise the actual `openWish` function in an isolated VM against DOM adapters: full/enlarged state resets, template tab selection, preserved Story format, normal gallery opening and incomplete-journey gating.
- Follow-up `2d56de3`: retained whitespace across the responsive heading break; 4/4 targeted gallery/photo tests passed.
- `npm test`: 132/132 passed. `npm run check:pages`: 71 resources passed. `npm run check:drinks`: generated Apps Script synchronized. JavaScript syntax and diff checks passed.
- Actual browser at 1280×720 and 375×667: the shortcut is visible in Khung hình, Tạo dáng, Đổi ảnh and Lưu / chia sẻ. All four designs update the selected preview. Returning after full-keepsake + enlarged preview shows the four choices again. Name, seven keepsakes, lucky set and selected team image remain available. Neither the final panel nor mobile gallery scrolls; final mobile canvas area remains about289px tall.
- Screenshots in the original workspace's ignored output directory: `checkin-templates-desktop.png`, `checkin-templates-entry-mobile.png`, `checkin-templates-gallery-mobile.png`. Local seed fixture uses a simulated accepted receipt only in localhost storage; it never posts an order to the real Sheet.
- Coverage limitation: VM tests cover the gallery state transition, rather than instrumenting the whole app or WebGL renderer. Browser checks cover the real UI integration; all existing renderer, photo and recorder tests remain passing. No new designs or print artifacts were generated.
