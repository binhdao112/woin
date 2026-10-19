# Full KOI menu photo — 19/10/2026

The host-supplied menu image is available from “Menu full ở đây” beside the menu heading. A separate native dialog shows the full image, readable zoom, zoom out/reset and original image link. Only the image viewport scrolls when enlarged; the close control and toolbar stay visible. Image viewing never edits or submits the order.

- RED `0372d9a`: two counter integration tests failed because the menu action did not exist.
- GREEN `c1c2c7a`: actual counter/viewer integration passes for preserving the selected drink and note, bounded zoom/reset, close/focus restoration, image error/recovery and no registration calls. A further test exercises mouse panning, native touch delegation and resize.
- Full suite129/129; viewer coverage100% lines,85% branches,88.89% functions. Pages71resources; generated Apps Script bundle unchanged and synchronized. Syntax/diff checks passed.
- Browser1280×720 and375×667: opens original2480×1754 image, whole-image fit has no image overflow; mobile dialog x12/y12/351×643 fits without scrolling its controls. First zoom makes text readable; scrolling is confined to the image. Return/Escape restores focus to the opener and preserves “Ít ngọt nhé” plus the chosen milk tea/size. Parent counter remains open, without scrolling. No warning/error console logs.
- Corrected the new header to override the page-wide absolute-positioned, pointer-events-none header rule; actual close button interaction was verified.
- The supplied PNG is copied byte-for-byte, lazy-loaded and hosted with the site. The picture is a visual reference, with a note pointing to the selectable catalog for registration prices. No menu/price/server changes and no real Sheets POSTs in QA.
- Source original workspace output screenshots: full-menu-entry-mobile.png, full-menu-desktop.png, full-menu-zoom-mobile.png. Local mock fixture is ignored and not deployed. Native touch hardware was not used; touch panning is delegated to browser scrolling. Viewport override was reset.
