import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertClockPort } from '../../src/core/ports/ClockPort.js';
import { assertFrameSchedulerPort } from '../../src/core/ports/FrameSchedulerPort.js';
import { assertViewportPort } from '../../src/core/ports/ViewportPort.js';
import { assertRenderSurfacePort } from '../../src/core/ports/RenderSurfacePort.js';
import { assertInputSourcePort } from '../../src/core/ports/InputSourcePort.js';

describe('Port shape checks', () => {
  it('ClockPort', () => {
    assert.doesNotThrow(() => assertClockPort({ now: () => 0 }));
    assert.throws(() => assertClockPort({}), /ClockPort/);
  });

  it('FrameSchedulerPort', () => {
    assert.doesNotThrow(() =>
      assertFrameSchedulerPort({ request: () => 1, cancel: () => {} })
    );
    assert.throws(() => assertFrameSchedulerPort({ request: () => 1 }), /FrameSchedulerPort/);
  });

  it('ViewportPort', () => {
    assert.doesNotThrow(() =>
      assertViewportPort({ getMetrics: () => ({}), onResize: () => () => {} })
    );
    assert.throws(() => assertViewportPort({}), /ViewportPort/);
  });

  it('RenderSurfacePort', () => {
    assert.doesNotThrow(() =>
      assertRenderSurfacePort({
        getContext2D: () => null,
        getCssSize: () => ({ width: 0, height: 0 }),
        setLogicalSize: () => {},
      })
    );
    assert.throws(() => assertRenderSurfacePort({}), /RenderSurfacePort/);
  });

  it('InputSourcePort', () => {
    assert.doesNotThrow(() =>
      assertInputSourcePort({ subscribe: () => () => {}, destroy: () => {} })
    );
    assert.throws(() => assertInputSourcePort({}), /InputSourcePort/);
  });
});
