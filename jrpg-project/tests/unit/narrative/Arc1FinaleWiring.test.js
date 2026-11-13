import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Source-text regression (NOT runtime verified): ch5_completed must also set arc1_completed and chapter_06_unlocked.
const src = readFileSync(new URL('../../../src/scenes/GameplayDemoScene.js', import.meta.url), 'utf8');

test('finale flag handler sets arc1_completed and chapter_06_unlocked', () => {
  const i = src.indexOf("fx.flag === 'ch5_completed'");
  assert.ok(i > 0);
  const block = src.slice(i, i + 200);
  assert.match(block, /arc1_completed = true/);
  assert.match(block, /chapter_06_unlocked = true/);
});
