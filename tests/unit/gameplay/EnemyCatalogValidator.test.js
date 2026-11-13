import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('enemy-catalog-validator.mjs', () => {
  it('validates all six enemy arcs and the Phase 3 boss roster', () => {
    const result = spawnSync(process.execPath, [join(root, 'tools/enemy-catalog-validator.mjs')], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Arc 1 9, Arc 2 9, Arc 3 8, Arc 4 8, Arc 5 8, Arc 6 8; 50 enemies, 6 main bosses, 2 optional\/mini bosses validated/);
  });
});
