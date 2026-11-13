import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('Narrative canon registry', () => {
  const reg = JSON.parse(readFileSync(join(root, 'content/narrative/canon-registry.json'), 'utf8'));

  it('has 30 sequential chapters', () => {
    assert.equal(reg.chapters.length, 30);
    assert.equal(reg.chapters[0], 'chapter_01');
    assert.equal(reg.chapters[29], 'chapter_30');
  });

  it('has 6 arcs covering all chapters', () => {
    assert.equal(Object.keys(reg.arcs).length, 6);
    const set = new Set(Object.values(reg.arcs).flat());
    assert.equal(set.size, 30);
  });

  it('has unique IDs', () => {
    const all = [...reg.characters, ...reg.chapters, ...reg.regions, ...reg.factions, ...reg.mysteries];
    assert.equal(all.length, new Set(all).size);
  });

  it('has eight party members plus curator', () => {
    assert.ok(reg.characters.includes('character_orin_vale'));
    assert.ok(reg.characters.includes('character_vaelor_senn'));
    assert.equal(reg.characters.length, 9);
  });
});

describe('Narrative docs presence', () => {
  it('required story bible files exist', () => {
    const files = ['STORY_BIBLE.md', 'MAIN_STORY_OUTLINE.md', 'CHARACTER_BIBLE.md', 'MAGIC_SYSTEM.md'];
    for (const f of files) {
      assert.equal(existsSync(join(root, 'docs/narrative', f)), true, f);
    }
  });
});

describe('narrative-validator.mjs', () => {
  it('exits 0 on current canon', () => {
    const r = spawnSync(process.execPath, [join(root, 'tools/narrative-validator.mjs')], {
      encoding: 'utf8',
    });
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /NARRATIVE VALIDATOR OK/);
  });
});
