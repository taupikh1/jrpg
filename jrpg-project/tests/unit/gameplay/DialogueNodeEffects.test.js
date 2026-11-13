// Integration tests: real DialogueEngine + EventBus + all real dialogue content.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { EventBus } from '../../../src/core/EventBus.js';

async function loadAllDialogues() {
  const defs = new Map();
  const walk = async (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (p.endsWith('.js')) {
        const m = await import(pathToFileURL(path.resolve(p)).href);
        for (const v of Object.values(m)) {
          for (const d of Array.isArray(v) ? v : [v]) {
            if (d && d.id && d.startNode && d.nodes) defs.set(d.id, d);
          }
        }
      }
    }
  };
  await walk('content');
  return defs;
}

function make(def) {
  const events = new EventBus();
  const log = [];
  events.on('dialogue.node_effects', (p) => log.push(['node', p.nodeId, p.effects]));
  events.on('dialogue.choice_selected', (p) => log.push(['choice', p.nodeId, p.effects]));
  const eng = new DialogueEngine(events);
  eng.register(def);
  return { eng, log };
}

const mini = {
  id: 't', startNode: 'a',
  nodes: {
    a: { text: 'a', next: 'b' },
    b: { text: 'b', effects: { flag: 'ch4_fragment_found' } },
  },
};

describe('DialogueEngine node effects (integration)', () => {
  it('delivers terminal node effects exactly once, only on advancing past the node', () => {
    const { eng, log } = make(mini);
    eng.start('t');
    assert.equal(eng.advance(), 'advanced');
    assert.equal(log.length, 0, 'not applied merely by reaching the node');
    assert.equal(eng.advance(), 'ended');
    assert.deepEqual(log, [['node', 'b', { flag: 'ch4_fragment_found' }]]);
    assert.equal(eng.advance(), null);
    assert.equal(log.length, 1, 'no duplicate after completion');
  });

  it('interrupted dialogue (end() / Escape) grants no node effect and cleans state', () => {
    const { eng, log } = make(mini);
    eng.start('t'); eng.advance();
    eng.end();
    assert.equal(log.length, 0);
    assert.equal(eng.isActive, false);
    assert.equal(eng.active, null);
    assert.equal(eng.nodeId, null);
  });

  it('repeat interaction replays the effect once per completed run (scene must guard flags idempotently)', () => {
    const { eng, log } = make(mini);
    for (let i = 0; i < 2; i++) { eng.start('t'); eng.advance(); eng.advance(); }
    assert.equal(log.length, 2);
  });

  it('choice effects still delivered', () => {
    const { eng, log } = make({
      id: 'c', startNode: 'q',
      nodes: { q: { text: 'q', choices: [{ text: 'ya', next: 'z', effects: { acceptQuest: 'x' } }] }, z: { text: 'z' } },
    });
    eng.start('c');
    assert.equal(eng.advance(), 'choices');
    eng.choose(0);
    assert.deepEqual(log, [['choice', 'q', { acceptQuest: 'x' }]]);
  });

  it('mid-dialogue effect node fires once and dialogue continues', () => {
    const { eng, log } = make({
      id: 'm', startNode: 'a',
      nodes: { a: { text: 'a', effects: { completeQuest: 'q' }, next: 'b' }, b: { text: 'b' } },
    });
    eng.start('m'); eng.advance();
    assert.equal(log.length, 1);
    assert.equal(eng.advance(), 'ended');
    assert.equal(log.length, 1);
  });

  it('every real content dialogue: each effect node fires exactly its own effects when played linearly', async () => {
    const defs = await loadAllDialogues();
    let withEffects = 0;
    for (const def of defs.values()) {
      const effectNodes = Object.entries(def.nodes).filter(([, n]) => n.effects && !n.choices?.length);
      if (!effectNodes.length) continue;
      const { eng, log } = make(def);
      // walk every effect node by directly positioning the engine on it (isolated per node)
      for (const [nid, n] of effectNodes) {
        log.length = 0;
        eng.active = def; eng.nodeId = nid; eng.finished = false;
        eng.advance();
        withEffects++;
        assert.equal(log.length, 1, `${def.id}/${nid}`);
        assert.deepEqual(log[0][2], n.effects);
      }
    }
    assert.ok(withEffects >= 47, `expected >= 47 effect nodes, got ${withEffects}`);
  });

  it('ch4_fragment_discovery delivers ch4_fragment_found', async () => {
    const defs = await loadAllDialogues();
    const def = defs.get('ch4_fragment_discovery');
    assert.ok(def, 'dialogue exists');
    const { eng, log } = make(def);
    eng.start('ch4_fragment_discovery');
    let guard = 0;
    while (eng.isActive && guard++ < 50) {
      if (eng.currentNode().choices?.length) eng.choose(0); else eng.advance();
    }
    assert.ok(log.some((l) => l[2]?.flag === 'ch4_fragment_found'));
  });
});
