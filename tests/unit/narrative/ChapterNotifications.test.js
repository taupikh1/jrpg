import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chapterHookMessage, CHAPTER_HOOK_FALLBACK } from '../../../content/gameplay/chapter-notifications.js';

function hooksInContent() {
  const out = new Set();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.js')) for (const m of fs.readFileSync(p, 'utf8').matchAll(/chapterHook:\s*'([^']+)'/g)) out.add(m[1]);
    }
  };
  walk('content/dialogue');
  return out;
}

describe('chapter hook notifications', () => {
  it('every chapterHook used in dialogue content has Indonesian text without raw ids', () => {
    const hooks = hooksInContent();
    assert.deepEqual([...hooks].sort(), ['chapter_02', 'chapter_03', 'chapter_04', 'chapter_05', 'chapter_06']);
    for (const h of hooks) {
      const msg = chapterHookMessage(h);
      assert.notEqual(msg, CHAPTER_HOOK_FALLBACK, `${h} has a specific message`);
      assert.match(msg, /^Bab /);
      assert.ok(!/chapter_\d+/.test(msg) && !msg.includes('Lanjut:'), msg);
    }
  });

  it('chapter 6 states the exact coming-soon message', () => {
    assert.equal(chapterHookMessage('chapter_06'), 'Bab berikutnya telah terbuka: Kerajaan Mahkota Abu. (Segera hadir)');
  });

  it('unknown or malformed hooks use a safe fallback without leaking the id', () => {
    for (const h of ['chapter_99', undefined, null, '', 42, '__proto__', 'toString']) {
      const msg = chapterHookMessage(h);
      assert.equal(msg, CHAPTER_HOOK_FALLBACK);
      assert.ok(!String(msg).includes(String(h)) || h === '' || h == null);
    }
  });
});
