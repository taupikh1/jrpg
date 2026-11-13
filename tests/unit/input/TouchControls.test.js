import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TouchControls, TOUCH_BINDINGS, shouldShowTouchControls } from '../../../src/platform/browser/TouchControls.js';
import { Input } from '../../../src/engine/input/Input.js';

/** Records keydown/keyup events the touch source emits. */
function recorder(touch) {
  const events = [];
  touch.subscribe((ev) => events.push(`${ev.type}:${ev.code}`));
  return events;
}

describe('TouchControls press / release', () => {
  it('emits keydown once when a control is pressed and keyup when released', () => {
    const t = new TouchControls();
    const ev = recorder(t);
    t.press(1, 'ArrowUp');
    t.release(1);
    assert.deepEqual(ev, ['keydown:ArrowUp', 'keyup:ArrowUp']);
  });

  it('uses the same codes as the keyboard so gameplay needs no changes', () => {
    assert.deepEqual(TOUCH_BINDINGS, {
      up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', action: 'KeyE', menu: 'KeyP',
    });
  });

  it('keeps a code down while any pointer still holds it (no early release)', () => {
    const t = new TouchControls();
    const ev = recorder(t);
    t.press(1, 'ArrowRight');
    t.press(2, 'ArrowRight');
    t.release(1);
    assert.deepEqual(ev, ['keydown:ArrowRight']);
    assert.deepEqual(t.heldCodes(), ['ArrowRight']);
    t.release(2);
    assert.deepEqual(ev, ['keydown:ArrowRight', 'keyup:ArrowRight']);
  });

  it('supports two directions at once (for example up + right)', () => {
    const t = new TouchControls();
    t.press(1, 'ArrowUp');
    t.press(2, 'ArrowRight');
    assert.deepEqual(t.heldCodes().sort(), ['ArrowRight', 'ArrowUp']);
    t.release(1);
    assert.deepEqual(t.heldCodes(), ['ArrowRight']);
  });

  it('a pointer that presses another control releases its previous one first', () => {
    const t = new TouchControls();
    const ev = recorder(t);
    t.press(1, 'ArrowLeft');
    t.press(1, 'ArrowDown');
    assert.deepEqual(ev, ['keydown:ArrowLeft', 'keyup:ArrowLeft', 'keydown:ArrowDown']);
  });

  it('releasing an unknown pointer does nothing', () => {
    const t = new TouchControls();
    const ev = recorder(t);
    t.release(99);
    assert.deepEqual(ev, []);
  });
});

describe('TouchControls interruptions (no stuck input)', () => {
  it('releaseAll clears every held code (blur, tab hidden, cancel)', () => {
    const t = new TouchControls();
    const ev = recorder(t);
    t.press(1, 'ArrowUp');
    t.press(2, 'KeyE');
    t.releaseAll();
    assert.deepEqual(t.heldCodes(), []);
    assert.ok(ev.includes('keyup:ArrowUp') && ev.includes('keyup:KeyE'));
  });

  it('a cancelled touch is released, so the character stops', () => {
    const t = new TouchControls();
    const input = new Input([t]);
    t.press(7, 'ArrowLeft');
    input.endFrame();
    assert.equal(input.isDown('ArrowLeft'), true);
    // pointercancel → release(pointerId)
    t.release(7);
    assert.equal(input.isDown('ArrowLeft'), false);
  });

  it('hiding the controls releases any held direction', () => {
    const t = new TouchControls();
    const input = new Input([t]);
    t.press(1, 'ArrowDown');
    t.setVisible(false);
    assert.equal(input.isDown('ArrowDown'), false);
  });
});

describe('TouchControls integration with Input', () => {
  it('a quick tap on Action is seen by justPressed even if released in the same frame', () => {
    const t = new TouchControls();
    const input = new Input([t]);
    t.press(1, 'KeyE');
    t.release(1);
    assert.equal(input.justPressed('KeyE'), true);
    assert.equal(input.isDown('KeyE'), false);
    input.endFrame();
    assert.equal(input.justPressed('KeyE'), false);
  });

  it('holding a direction keeps isDown true across frames', () => {
    const t = new TouchControls();
    const input = new Input([t]);
    t.press(1, 'ArrowRight');
    for (let i = 0; i < 5; i++) {
      assert.equal(input.isDown('ArrowRight'), true);
      input.endFrame();
    }
  });
});

describe('shouldShowTouchControls', () => {
  const fakeWin = (search, maxTouchPoints) => ({
    location: { search },
    navigator: { maxTouchPoints },
  });
  it('shows on touch-capable devices', () => {
    assert.equal(shouldShowTouchControls(fakeWin('', 5)), true);
  });
  it('hidden on non-touch desktop by default', () => {
    assert.equal(shouldShowTouchControls(fakeWin('', 0)), false);
  });
  it('?touch=1 forces them on for testing', () => {
    assert.equal(shouldShowTouchControls(fakeWin('?touch=1', 0)), true);
  });
});

describe('TouchControls viewport alignment', () => {
  it('aligns the control overlay to the fitted game canvas bounds', () => {
    const t = new TouchControls();
    t._root = { style: {} };
    t.setBounds({ left: 123.4, top: 45.6, width: 512.7, height: 384.2 });
    assert.deepEqual(t._root.style, {
      left: '123px',
      top: '46px',
      width: '513px',
      height: '384px',
    });
  });
});
