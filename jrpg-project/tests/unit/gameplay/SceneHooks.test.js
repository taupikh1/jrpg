// Source validation: every unguarded this._maybe*() call in GameplayDemoScene must be defined.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('GameplayDemoScene hooks (source validation)', () => {
  const src = fs.readFileSync('src/scenes/GameplayDemoScene.js', 'utf8');
  it('unguarded this._maybe* calls have definitions', () => {
    const called = new Set([...src.matchAll(/this\.(_maybe\w+)\(/g)].map((m) => m[1]));
    for (const name of called) assert.match(src, new RegExp(`^  ${name}\\(`, 'm'), `${name} is called but not defined`);
  });
  it('chapter 3 first-view dialogue is started by a hook', () => {
    assert.match(src, /_startDialogue\('ch3_road_bellhaven_first_view'\)/);
  });
});
