/**
 * Immutable-ish configuration for Batch 1.
 * Logical resolution follows D-009.
 */
export const Config = Object.freeze({
  // Base logical viewport. CanvasSurface keeps 320x240 in portrait and expands width
  // responsively in landscape; scenes read the active canvas dimensions at render time.
  LOGICAL_WIDTH: 320,
  LOGICAL_HEIGHT: 240,
  ASPECT: 4 / 3,
  MAX_DELTA: 0.1,
  PIXEL_ART: true,
});
