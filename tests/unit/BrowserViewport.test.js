import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BrowserViewport } from '../../src/platform/browser/BrowserViewport.js';

describe('BrowserViewport visual viewport support', () => {
  it('uses visual viewport dimensions and listens for its resize event', () => {
    const windowListeners = new Map();
    const visualListeners = new Map();
    const fakeWindow = {
      innerWidth: 1000,
      innerHeight: 700,
      devicePixelRatio: 2,
      addEventListener(name, fn) { windowListeners.set(name, fn); },
      removeEventListener(name) { windowListeners.delete(name); },
      visualViewport: {
        width: 900,
        height: 600,
        addEventListener(name, fn) { visualListeners.set(name, fn); },
        removeEventListener(name) { visualListeners.delete(name); },
      },
    };
    const previous = globalThis.window;
    globalThis.window = fakeWindow;
    try {
      const viewport = new BrowserViewport();
      assert.deepEqual(viewport.getMetrics(), {
        cssWidth: 900,
        cssHeight: 600,
        dpr: 2,
        orientation: 'landscape',
      });
      let latest = null;
      viewport.onResize((metrics) => { latest = metrics; });
      fakeWindow.visualViewport.width = 600;
      fakeWindow.visualViewport.height = 900;
      visualListeners.get('resize')();
      assert.equal(latest.orientation, 'portrait');
      assert.equal(latest.cssWidth, 600);
      assert.equal(latest.cssHeight, 900);
      viewport.destroy();
      assert.equal(windowListeners.size, 0);
      assert.equal(visualListeners.size, 0);
    } finally {
      if (previous === undefined) delete globalThis.window;
      else globalThis.window = previous;
    }
  });
});
