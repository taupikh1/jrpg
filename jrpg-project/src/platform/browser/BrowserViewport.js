/**
 * @implements {import('../../core/ports/ViewportPort.js').ViewportPort}
 */
export class BrowserViewport {
  constructor() {
    /** @type {Set<Function>} */
    this._listeners = new Set();
    this._onResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);
    window.visualViewport?.addEventListener('resize', this._onResize);
  }

  getMetrics() {
    const viewport = window.visualViewport;
    const w = viewport?.width ?? window.innerWidth;
    const h = viewport?.height ?? window.innerHeight;
    return {
      cssWidth: w,
      cssHeight: h,
      dpr: window.devicePixelRatio || 1,
      orientation: w >= h ? 'landscape' : 'portrait',
    };
  }

  onResize(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _handleResize() {
    const metrics = this.getMetrics();
    for (const fn of this._listeners) {
      try {
        fn(metrics);
      } catch (e) {
        console.error('[BrowserViewport] listener error', e);
      }
    }
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    window.visualViewport?.removeEventListener('resize', this._onResize);
    this._listeners.clear();
  }
}
