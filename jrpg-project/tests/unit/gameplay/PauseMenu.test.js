import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';

/** Frame-based input: justPressed only for the codes passed to press(). */
function fakeInput() {
  let pressed = new Set();
  let downs = [];
  return {
    press(...codes) { pressed = new Set(codes); },
    tap(x, y) { downs.push({ x, y, pointerType: 'touch' }); },
    isDown() { return false; },
    justPressed(code) { return pressed.has(code); },
    pointerDownsThisFrame() { return downs; },
    primaryPointer() { return null; },
    endFrame() { pressed = new Set(); downs = []; },
  };
}

/** Run one frame with the given keys pressed. */
function frame(scene, input, ...codes) {
  input.press(...codes);
  scene.update(1 / 60);
  input.endFrame();
}

const tick = () => new Promise((r) => setTimeout(r, 10));

/** A gameplay scene in free exploration, initialised like the real game. */
function worldScene({ adapter = new MemoryStorageAdapter(), onReturnToMenu = null, startMode = 'new' } = {}) {
  const input = fakeInput();
  const scene = new GameplayDemoScene({ saveAdapter: adapter, onReturnToMenu });
  scene.init({ events: new EventBus(), input, startMode });
  scene.mode = 'world'; // skip the Chapter 1 opening in these tests
  return { scene, input, adapter };
}

describe('Pause menu opens and closes', () => {
  it('MENU key (KeyP) and Escape open pause from world mode', () => {
    const { scene, input } = worldScene();
    frame(scene, input, 'KeyP');
    assert.equal(scene.mode, 'pause');
    scene.mode = 'world';
    frame(scene, input, 'Escape');
    assert.equal(scene.mode, 'pause');
  });

  it('Resume closes the menu and keeps the player where they were', () => {
    const { scene, input } = worldScene();
    scene.player.x = 123;
    scene.player.y = 77;
    scene.stats.hp = 42;
    const zoneBefore = scene.zones.activeZone?.id;
    frame(scene, input, 'KeyP');
    frame(scene, input, 'Enter'); // Lanjutkan is the first item
    assert.equal(scene.mode, 'world');
    assert.equal(scene.player.x, 123);
    assert.equal(scene.player.y, 77);
    assert.equal(scene.stats.hp, 42);
    assert.equal(scene.zones.activeZone?.id, zoneBefore);
  });

  it('Escape while paused resumes', () => {
    const { scene, input } = worldScene();
    frame(scene, input, 'KeyP');
    frame(scene, input, 'Escape');
    assert.equal(scene.mode, 'world');
  });

  it('movement keys in pause do not move the character', () => {
    const { scene, input } = worldScene();
    frame(scene, input, 'KeyP');
    const x = scene.player.x;
    frame(scene, input, 'ArrowRight');
    frame(scene, input, 'ArrowLeft');
    assert.equal(scene.mode, 'pause');
    assert.equal(scene.player.x, x);
  });

  it('action key in pause activates the selected row (it does not start NPC interaction)', () => {
    const { scene, input } = worldScene();
    const dialogueBefore = scene.dialogue.isActive; // the Chapter 1 opening is queued by init()
    frame(scene, input, 'KeyP');
    // Row 4: Simpan Permainan (Status & Skill is row 3)
    for (let i = 0; i < 4; i++) frame(scene, input, 'ArrowDown');
    frame(scene, input, 'KeyE');
    assert.equal(scene.mode, 'pause', 'save runs; the menu stays open');
    assert.equal(scene.dialogue.isActive, dialogueBefore, 'no new dialogue is started');
  });

  it('a tap on Lanjutkan resumes', () => {
    const { scene, input } = worldScene();
    frame(scene, input, 'KeyP');
    // Row 0 of the main pause panel: x 56..264, y 50..72 (logical pixels).
    input.tap(120, 60);
    frame(scene, input);
    assert.equal(scene.mode, 'world');
  });
});

describe('Save from pause menu', () => {
  it('reports success only when the save actually succeeds', async () => {
    const { scene, input, adapter } = worldScene();
    frame(scene, input, 'KeyP');
    for (let i = 0; i < 4; i++) frame(scene, input, 'ArrowDown'); // Simpan Permainan
    frame(scene, input, 'Enter');
    await tick();
    assert.equal(scene._pauseNotice, 'Permainan tersimpan.');
    const stored = await adapter.get('slot1');
    assert.equal(stored.ok, true, 'slot1 really exists after the save');
  });

  it('reports failure honestly when the save fails', async () => {
    const { scene, input } = worldScene();
    scene.saveManager.save = async () => ({ ok: false, reason: 'quota' });
    frame(scene, input, 'KeyP');
    for (let i = 0; i < 4; i++) frame(scene, input, 'ArrowDown');
    frame(scene, input, 'Enter');
    await tick();
    assert.match(scene._pauseNotice, /^Gagal menyimpan: /);
    assert.doesNotMatch(scene._pauseNotice, /tersimpan\./);
  });

  it('a saved position is restored by Continue in a fresh session', async () => {
    const adapter = new MemoryStorageAdapter();
    const a = worldScene({ adapter });
    a.scene.player.x = 150;
    a.scene.player.y = 90;
    frame(a.scene, a.input, 'KeyP');
    for (let i = 0; i < 4; i++) frame(a.scene, a.input, 'ArrowDown');
    frame(a.scene, a.input, 'Enter');
    await tick();

    const b = new GameplayDemoScene({ saveAdapter: adapter });
    b.init({ events: new EventBus(), input: fakeInput(), startMode: 'continue' });
    b.update(1 / 60); // first frame runs the load
    await tick();
    assert.equal(b.player.x, 150);
    assert.equal(b.player.y, 90);
  });
});

describe('Return to Main Menu', () => {
  it('asks for confirmation first and defaults to Batal', () => {
    let returned = 0;
    const { scene, input } = worldScene({ onReturnToMenu: () => { returned++; } });
    frame(scene, input, 'KeyP');
    frame(scene, input, 'ArrowUp'); // wraps to Kembali ke Menu Utama
    frame(scene, input, 'Enter');
    assert.equal(scene._pauseSub, 'confirm');
    assert.equal(scene._pauseIndex, 1, 'Batal is selected');
    frame(scene, input, 'Enter');
    assert.equal(returned, 0, 'Batal does not leave');
    assert.equal(scene._pauseSub, 'main');
  });

  it('confirming calls the menu hook exactly once and stops updating', () => {
    let returned = 0;
    const { scene, input } = worldScene({ onReturnToMenu: () => { returned++; } });
    frame(scene, input, 'KeyP');
    // Kembali ke Menu Utama is row 6 since Status & Skill (row 3) and Pengaturan Audio (row 5) were added.
    for (let i = 0; i < 6; i++) frame(scene, input, 'ArrowDown');
    frame(scene, input, 'Enter');
    frame(scene, input, 'ArrowUp'); // Ya, kembali ke menu
    frame(scene, input, 'Enter');
    assert.equal(returned, 1);
    assert.equal(scene._leaving, true);
    frame(scene, input, 'Enter'); // further input is ignored
    assert.equal(returned, 1);
  });

  it('a tap on the confirmation row also works', () => {
    let returned = 0;
    const { scene, input } = worldScene({ onReturnToMenu: () => { returned++; } });
    frame(scene, input, 'KeyP');
    input.tap(120, 186); // main row 6: Kembali ke Menu Utama (row top 176, height 20)
    frame(scene, input);
    input.tap(120, 91); // confirm row 0: Ya, kembali ke menu
    frame(scene, input);
    assert.equal(returned, 1);
  });

  it('Escape in the confirmation goes back to the main pause menu', () => {
    const { scene, input } = worldScene({ onReturnToMenu: () => {} });
    frame(scene, input, 'KeyP');
    frame(scene, input, 'ArrowUp'); // wraps to Kembali ke Menu Utama
    frame(scene, input, 'Enter');
    assert.equal(scene._pauseSub, 'confirm');
    frame(scene, input, 'Escape');
    assert.equal(scene._pauseSub, 'main');
    assert.equal(scene.mode, 'pause');
  });

  it('Status & Skill row opens status overlay and closes back to pause', () => {
    const { scene, input } = worldScene();
    scene._ch1Flags.ch1_mira_follow = true;
    frame(scene, input, 'KeyP');
    for (let i = 0; i < 3; i++) frame(scene, input, 'ArrowDown'); // row 3: Status & Skill
    frame(scene, input, 'Enter');
    assert.equal(scene.mode, 'status');
    assert.equal(scene._statusMemberIdx, 0);
    frame(scene, input, 'ArrowRight');
    assert.equal(scene._statusMemberIdx, 1); // switches to Mira
    frame(scene, input, 'Escape');
    assert.equal(scene.mode, 'pause');
  });
});
