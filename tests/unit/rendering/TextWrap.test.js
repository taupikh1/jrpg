import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wrapLines } from '../../../src/engine/rendering/TextWrap.js';

const measure = (s) => s.length * 6; // monospace 10px approximation

describe('wrapLines', () => {
  it('keeps short text on one line', () => {
    assert.deepEqual(wrapLines('halo dunia', 100, measure), ['halo dunia']);
  });

  it('breaks on spaces so no line exceeds maxWidth', () => {
    const lines = wrapLines('satu dua tiga empat lima enam tujuh', 60, measure);
    assert.ok(lines.length > 1);
    for (const l of lines) assert.ok(measure(l) <= 60, `"${l}" too wide`);
    assert.equal(lines.join(' '), 'satu dua tiga empat lima enam tujuh');
  });

  it('hard-splits a single word wider than maxWidth', () => {
    const lines = wrapLines('abcdefghijklmnop', 30, measure);
    for (const l of lines) assert.ok(measure(l) <= 30);
    assert.equal(lines.join(''), 'abcdefghijklmnop');
  });

  it('honours explicit newlines and empty input', () => {
    assert.deepEqual(wrapLines('a\nb', 100, measure), ['a', 'b']);
    assert.deepEqual(wrapLines('', 100, measure), ['']);
  });
});
