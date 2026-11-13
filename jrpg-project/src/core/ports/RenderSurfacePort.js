/**
 * @typedef {Object} RenderSurfacePort
 * @property {() => CanvasRenderingContext2D | null} getContext2D
 * @property {() => { width: number, height: number }} getCssSize
 * @property {(w: number, h: number) => void} setLogicalSize - Set internal buffer size (logical pixels).
 * @property {(scale: number, offsetX: number, offsetY: number) => void} setDisplayTransform
 * @property {() => HTMLCanvasElement | null} getElement - Optional, for coordinate conversion.
 */

/**
 * @param {unknown} obj
 * @returns {asserts obj is RenderSurfacePort}
 */
export function assertRenderSurfacePort(obj) {
  if (
    !obj ||
    typeof obj.getContext2D !== 'function' ||
    typeof obj.getCssSize !== 'function' ||
    typeof obj.setLogicalSize !== 'function'
  ) {
    throw new TypeError('RenderSurfacePort requires getContext2D, getCssSize, setLogicalSize');
  }
}
