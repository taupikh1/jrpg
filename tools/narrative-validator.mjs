#!/usr/bin/env node
/**
 * Narrative canon validator — checks structured registry + doc presence.
 * Does not judge literary quality.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

const registryPath = join(root, 'content/narrative/canon-registry.json');
if (!existsSync(registryPath)) {
  fail('missing content/narrative/canon-registry.json');
} else {
  const reg = JSON.parse(readFileSync(registryPath, 'utf8'));

  // Unique IDs across major lists
  const all = [
    ...reg.characters,
    ...reg.chapters,
    ...reg.regions,
    ...reg.factions,
    ...reg.mysteries,
  ];
  const seen = new Set();
  for (const id of all) {
    if (seen.has(id)) fail(`duplicate id ${id}`);
    seen.add(id);
  }

  // Exactly 30 chapters sequential
  if (reg.chapters.length !== 30) fail(`expected 30 chapters, got ${reg.chapters.length}`);
  for (let i = 1; i <= 30; i++) {
    const id = `chapter_${String(i).padStart(2, '0')}`;
    if (reg.chapters[i - 1] !== id) fail(`chapter order mismatch at ${i}: ${reg.chapters[i - 1]}`);
  }

  // Six arcs, each 5 chapters, partition of 30
  const arcKeys = Object.keys(reg.arcs || {});
  if (arcKeys.length !== 6) fail(`expected 6 arcs, got ${arcKeys.length}`);
  const arcChapters = new Set();
  for (const [k, list] of Object.entries(reg.arcs)) {
    if (!Array.isArray(list) || list.length !== 5) fail(`arc ${k} must have 5 chapters`);
    for (const c of list) {
      if (arcChapters.has(c)) fail(`chapter ${c} in multiple arcs`);
      arcChapters.add(c);
      if (!reg.chapters.includes(c)) fail(`arc refs unknown chapter ${c}`);
    }
  }
  if (arcChapters.size !== 30) fail('arcs do not cover all chapters');

  // Core party size
  const party = reg.characters.filter((c) => c !== 'character_vaelor_senn');
  if (party.length !== 8) fail(`expected 8 party characters + antagonist separate, party=${party.length}`);

  // Required narrative docs
  const narrativeDir = join(root, 'docs/narrative');
  const requiredDocs = [
    'README.md',
    'STORY_BIBLE.md',
    'WORLD_BIBLE.md',
    'WORLD_HISTORY.md',
    'MAGIC_SYSTEM.md',
    'STILLNESS_LORE.md',
    'CHARACTER_BIBLE.md',
    'PARTY_RELATIONSHIPS.md',
    'ANTAGONIST_BIBLE.md',
    'FACTION_BIBLE.md',
    'REGIONAL_BIBLE.md',
    'MAIN_STORY_OUTLINE.md',
    'SIDE_QUEST_ARCHITECTURE.md',
    'MONSTER_LORE_ARCHITECTURE.md',
    'DIALOGUE_STYLE_GUIDE.md',
    'NARRATIVE_CONTINUITY_RULES.md',
    'MASTER_TIMELINE.md',
    'MYSTERY_REGISTER.md',
    'FORESHADOWING_REGISTER.md',
    'CHARACTER_KNOWLEDGE_MATRIX.md',
    'STORY_DEPENDENCY_GRAPH.md',
    'CONTENT_ID_REGISTRY.md',
    'CONTENT_SCHEMA.md',
    'CHANGELOG.md',
  ];
  for (const f of requiredDocs) {
    const p = join(narrativeDir, f);
    if (!existsSync(p)) fail(`missing docs/narrative/${f}`);
    else {
      const size = readFileSync(p, 'utf8').trim().length;
      if (size < 80) warn(`${f} is very short (${size} chars)`);
    }
  }

  // Mysteries should appear in MYSTERY_REGISTER text
  const mysteryDoc = readFileSync(join(narrativeDir, 'MYSTERY_REGISTER.md'), 'utf8');
  for (const m of reg.mysteries) {
    if (!mysteryDoc.includes(m)) warn(`mystery ${m} not mentioned in MYSTERY_REGISTER.md`);
  }
}

if (errors.length) {
  console.error('NARRATIVE VALIDATOR FAIL');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log('NARRATIVE VALIDATOR OK');
if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log(' -', w);
}
process.exit(0);
