import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MainMenuScene, SAVE_SLOT } from '../../../src/scenes/MainMenuScene.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';
import { SaveManager } from '../../../src/engine/persistence/SaveManager.js';
import { createEmptySave } from '../../../src/engine/persistence/SaveSchema.js';

/** Frame-based fake input: justPressed is true only for the codes given to press() this frame. */
function fakeInput() {
  let pressed = new Set();
  let downs = [];
  return {
    press(...codes) { pressed = new Set(codes); },
    /** A tap is one pointer-down event within the frame, like Input records it. */
    tap(x, y) { downs.push({ x, y, pointerType: 'touch' }); },
    justPressed(code) { return pressed.has(code); },
    pointerDownsThisFrame() { return downs; },
    endFrame() { pressed = new Set(); downs = []; },
  };
}

function fakeStarter() {
  const calls = [];
  return {
    calls,
    /** Mirrors the composition root: called with the start mode and the surface data. */
    onStartGame: async (startMode, data) => { calls.push({ startMode, data }); },
  };
}

/** Context stub: any drawing call is a no-op, property writes are kept. */
function stubCtx() {
  return new Proxy(
    {},
    {
      get: (t, k) => {
        if (k in t) return t[k];
        // measureText is needed by fitText; report a fixed 6px-per-character width.
        if (k === 'measureText') return (s) => ({ width: String(s).length * 6 });
        return () => {};
      },
      set: (t, k, v) => { t[k] = v; return true; },
    }
  );
}

async function menuWith(save) {
  const adapter = new MemoryStorageAdapter();
  if (save === 'valid') {
    await new SaveManager({ adapter }).save(SAVE_SLOT, createEmptySave(SAVE_SLOT));
  } else if (save === 'corrupt') {
    await adapter.put(SAVE_SLOT, { garbage: true });
  }
  const sm = fakeStarter();
  const input = fakeInput();
  const menu = new MainMenuScene({ saveAdapter: adapter, onStartGame: sm.onStartGame });
  await menu.enter({ input });
  return { menu, input, sm };
}

/** Advance one frame with the given key codes pressed. */
function frame(menu, input, ...codes) {
  input.press(...codes);
  menu.update();
  input.endFrame();
}

describe('MainMenuScene', () => {
  it('without a save: Continue is unavailable and selecting it does not start the game', async () => {
    const { menu, input, sm } = await menuWith(null);
    assert.equal(menu._selected, 'new', 'defaults to New Game when there is no save');
    menu._selected = 'continue';
    frame(menu, input, 'Enter');
    await Promise.resolve();
    assert.equal(sm.calls.length, 0);
    assert.match(menu._message, /Belum ada/);
  });

  it('with a valid save: Continue is selected by default and starts gameplay in continue mode', async () => {
    const { menu, input, sm } = await menuWith('valid');
    assert.equal(menu._selected, 'continue');
    frame(menu, input, 'Enter');
    await new Promise((r) => setImmediate(r));
    assert.equal(sm.calls.length, 1);
    assert.equal(sm.calls[0].startMode, 'continue');
  });

  it('with a corrupted save: Continue never starts a new game silently', async () => {
    const { menu, input, sm } = await menuWith('corrupt');
    assert.equal(menu._saveStatus, 'invalid');
    assert.equal(menu._selected, 'new');
    menu._selected = 'continue';
    frame(menu, input, 'Enter');
    await new Promise((r) => setImmediate(r));
    assert.equal(sm.calls.length, 0);
    assert.match(menu._message, /tidak bisa dibaca/);
  });

  it('New Game always starts gameplay in new mode, even if a save exists', async () => {
    const { menu, input, sm } = await menuWith('valid');
    frame(menu, input, 'ArrowDown');
    assert.equal(menu._selected, 'new');
    frame(menu, input, 'KeyE');
    await new Promise((r) => setImmediate(r));
    assert.equal(sm.calls.length, 1);
    assert.equal(sm.calls[0].startMode, 'new');
  });

  it('arrow keys wrap between the two options', async () => {
    const { menu, input } = await menuWith(null);
    assert.equal(menu._selected, 'new');
    frame(menu, input, 'ArrowUp');
    assert.equal(menu._selected, 'continue');
    frame(menu, input, 'ArrowUp');
    assert.equal(menu._selected, 'new');
  });

  it('a tap on the New Game button starts a new game', async () => {
    const { menu, input, sm } = await menuWith(null);
    input.tap(240, 180); // inside the New Game button
    menu.update();
    await new Promise((r) => setImmediate(r));
    assert.equal(sm.calls.length, 1);
    assert.equal(sm.calls[0].startMode, 'new');
  });

  it('a tap is consumed once: it does not repeat on later frames', async () => {
    const { menu, input, sm } = await menuWith(null);
    input.tap(240, 180);
    menu.update();
    input.endFrame();
    menu.update();
    menu.update();
    await new Promise((r) => setImmediate(r));
    assert.equal(sm.calls.length, 1);
  });

  it('a tap outside any button does nothing', async () => {
    const { menu, input, sm } = await menuWith(null);
    input.tap(10, 10);
    menu.update();
    await new Promise((r) => setImmediate(r));
    assert.equal(sm.calls.length, 0);
  });

  it('render draws only the two menu options and no demo labels', async () => {
    const { menu } = await menuWith('valid');
    const texts = [];
    const ctx = stubCtx();
    ctx.fillText = (t) => texts.push(t);
    menu.render(ctx);
    const joined = texts.join('|');
    assert.match(joined, /Lanjutkan/);
    assert.match(joined, /Permainan Baru/);
    assert.doesNotMatch(joined, /Demo|debug|fps|F5/i);
    assert.equal(texts.filter((t) => /Lanjutkan|Permainan Baru/.test(t)).length, 2);
  });
});
