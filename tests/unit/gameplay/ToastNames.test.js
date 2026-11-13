import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ITEMS, QUEST_COLLECT_WOOD } from '../../../content/gameplay/demo-content.js';
import { BELLHAVEN_QUESTS } from '../../../content/quests/arc_01/bellhaven_quests.js';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../../../content');

function walk(dir, ext) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

// every quest definition shipped with content
async function allQuestDefs() {
  const defs = new Map([[QUEST_COLLECT_WOOD.id, QUEST_COLLECT_WOOD]]);
  for (const d of BELLHAVEN_QUESTS) defs.set(d.id, d);
  for (const f of walk(join(ROOT, 'quests'), '.js')) {
    const m = await import(pathToFileURL(f).href);
    for (const v of Object.values(m)) for (const q of Array.isArray(v) ? v : [v]) if (q?.id && q?.objectives) defs.set(q.id, q);
  }
  return defs;
}

// quest / item ids referenced by dialogue effects
function referencedIds() {
  const quests = new Set(), items = new Set();
  for (const f of walk(join(ROOT, 'dialogue'), '.js')) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:acceptQuest|completeQuest):\s*'([^']+)'/g)) quests.add(m[1]);
    for (const m of src.matchAll(/shopBuy:\s*\{\s*itemId:\s*'([^']+)'/g)) items.add(m[1]);
  }
  return { quests, items };
}

describe('toast names: no raw ids for quests and items (D8)', () => {
  it('every quest referenced by dialogue effects has a display name', async () => {
    const defs = await allQuestDefs();
    const { quests } = referencedIds();
    const missing = [...quests].filter((id) => !defs.get(id)?.name || defs.get(id).name === id);
    assert.deepEqual(missing, []);
  });

  it('every item bought in shops has a display name', () => {
    const { items } = referencedIds();
    const byId = new Map(ITEMS.map((i) => [i.id, i]));
    const missing = [...items].filter((id) => !byId.get(id)?.name || byId.get(id).name === id);
    assert.deepEqual(missing, []);
  });
});
