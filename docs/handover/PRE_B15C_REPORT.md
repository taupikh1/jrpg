# PRE-B15C — iPhone 13 Landscape Full-Screen Review

**Status:** RESPONSIVE LANDSCAPE VIEWPORT IMPLEMENTED; physical iPhone verification remains pending.
**Target:** iPhone 13, Safari Add to Home Screen standalone Web App, landscape.

## 1. Verified baseline behavior

The current source already contains the Pre-B15 landscape shell work:

- `index.html` declares `viewport-fit=cover`, standalone iOS metadata, and full-viewport `100dvh` body sizing.
- `manifest.json` declares `display: standalone` and `orientation: landscape` as a platform hint.
- `BrowserViewport` reads `visualViewport` dimensions and listens for visual viewport resize, window resize, and orientation changes.
- Touch controls are positioned against the fitted game canvas and use safe-area insets.
- Portrait touch devices receive a Bahasa Indonesia rotate-device notice.
- The app does not rely on `screen.orientation.lock()`.

## 2. Responsive viewport implementation

D-022's approved responsive direction is now implemented as a bounded adaptive logical-width viewport on the existing renderer:

- `Config.LOGICAL_WIDTH=320` and `LOGICAL_HEIGHT=240` remain the base/portrait dimensions; these constants are not silently replaced.
- `CanvasSurface.fitTo()` keeps 320×240 in portrait and expands logical width in landscape to match the available CSS aspect ratio, capped at 2.2:1. For an 844×390 CSS viewport (the expected iPhone 13 landscape ratio), the logical canvas becomes 519×240.
- The canvas backing buffer and CSS display size use the same aspect ratio. The game is not stretched and gameplay is not cropped to fake a full-screen fit.
- `RenderPipeline` synchronizes the camera viewport with the responsive canvas dimensions.
- `Camera` centers maps smaller than the visible viewport and exposes additional horizontal world area on wider maps.
- Main menu, gameplay HUD, dialogue, inventory, quest, battle, status, level-up, and pause layouts read the active canvas dimensions; menu and pause panels remain centered.
- Pointer-to-logical conversion automatically uses the current responsive canvas dimensions. Touch controls remain aligned to the canvas and respect safe-area insets.
- Extreme ultrawide layouts are capped at 2.2:1. Portrait keeps the base 4:3 canvas and the existing rotate-device notice.

This is a viewport/camera/UI adaptation only. It does not migrate the renderer to HD3D, add a dependency, change world IDs, or change save format. The current art assets remain the existing 2D assets; D-021's full visual direction is a separate project-level milestone.

## 3. Verification status

- Responsive canvas sizing and iPhone 13 landscape aspect math: TEST VERIFIED by unit tests.
- Full suite after Pre-B15C + B15 changes: `npm test` **590/590 passed**.
- Project validator: `npm run check` **OK**; world and narrative validators pass.
- Camera viewport synchronization and small-map centering: TEST VERIFIED by unit tests.
- Responsive menu/gameplay screen-space sizing and pointer conversion: source verified and covered by focused unit tests where applicable.
- Browser visual rendering: NOT TESTED in this environment.
- Physical iPhone 13 Safari Add to Home Screen: NOT TESTED; owner device verification remains required.
- Physical Android Chrome: NOT TESTED.

## 4. Remaining validation

The source now sizes the landscape canvas to the available viewport without 4:3 side letterboxing. The actual visual quality, safe-area fit, touch reach, and map composition still require physical iPhone 13 testing. On small maps, the camera centers the map and the canvas background occupies the remaining side area; larger maps reveal more horizontal world. Do not claim physical-device verification until the owner tests the ZIP.

**Conclusion:** Pre-B15C responsive viewport implementation is complete at source/test level. Physical iPhone and Android verification remain pending. No full renderer migration or final HD3D art claim is made.
