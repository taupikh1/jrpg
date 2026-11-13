import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { wrapLines } from '../../../src/engine/rendering/TextWrap.js';

// Mirrors the layout in GameplayDemoScene dialogue render (LOGICAL 320x240).
const W = 320;
const H = 240;
const LINE = 12;
const measure = (s) => s.length * 6; // 10px monospace approximation
const MIN_TOP = 4;

function boxFits(node) {
  const textLines = wrapLines(node?.text || '', W - 48, measure);
  const choiceLines = node?.choices
    ? node.choices.reduce((n, c, i) => n + wrapLines(`${i ? ' ' : '>'} ${c.text}`, W - 56, measure).length, 0)
    : 1;
  const footerTop = 30 + textLines.length * LINE + 6;
  const boxH = Math.max(80, footerTop + choiceLines * LINE + 6);
  return H - 10 - boxH >= MIN_TOP;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../content/dialogue');
function collectDialogues(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectDialogues(p));
    else if (entry.name.endsWith('.js')) out.push(p);
  }
  return out;
}

describe('dialogue box text fit', () => {
  it('every dialogue node fits inside the logical canvas after wrapping', async () => {
    const failures = [];
    for (const file of collectDialogues(root)) {
      const mod = await import(pathToFileURL(file).href);
      for (const value of Object.values(mod)) {
        const list = Array.isArray(value) ? value : [value];
        for (const d of list) {
          if (!d?.nodes) continue;
          for (const [nid, node] of Object.entries(d.nodes)) {
            if (!boxFits(node)) failures.push(`${d.id}:${nid}`);
          }
        }
      }
    }
    assert.deepEqual(failures, []);
  });

  it('ch2_mira_personal_scene and ch3_road_bellhaven_first_view are present and fit', async () => {
    const wanted = ['ch2_mira_personal_scene', 'ch3_road_bellhaven_first_view'];
    const found = new Set();
    for (const file of collectDialogues(root)) {
      const mod = await import(pathToFileURL(file).href);
      for (const value of Object.values(mod)) {
        const list = Array.isArray(value) ? value : [value];
        for (const d of list) {
          if (!wanted.includes(d?.id)) continue;
          found.add(d.id);
          for (const node of Object.values(d.nodes)) assert.ok(boxFits(node), `${d.id} node overflows`);
        }
      }
    }
    assert.deepEqual([...found].sort(), [...wanted].sort());
  });
});
