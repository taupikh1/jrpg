import { ENEMIES as ARC_01 } from '../content/enemies/arc_01.js';
import { ENEMIES_ARC_02 } from '../content/enemies/arc_02.js';
import { ENEMIES_ARC_03 } from '../content/enemies/arc_03.js';
import { ENEMIES_ARC_04 } from '../content/enemies/arc_04.js';
import { ENEMIES_ARC_05 } from '../content/enemies/arc_05.js';
import { ENEMIES_ARC_06 } from '../content/enemies/arc_06.js';
import { BOSS_CATALOG } from '../content/bosses/index.js';
import { ITEMS } from '../content/items/arc_01.js';
import { ELEMENT_IDS } from '../content/combat/elements.js';
import { STATUS_EFFECTS } from '../content/combat/status_effects.js';

const errors = [];
const arcs = [ARC_01, ENEMIES_ARC_02, ENEMIES_ARC_03, ENEMIES_ARC_04, ENEMIES_ARC_05, ENEMIES_ARC_06];
const all = arcs.flat();
const enemyIds = new Set();
const bossIds = new Set();
const regions = new Set([
  'region_ashwillow', 'region_whispering_wood', 'region_bellhaven', 'region_ashen_crown',
  'region_silent_march', 'region_glass_lantern', 'region_starfall_plain', 'region_verdant_veil',
  'region_underdeep', 'region_sleeping_kings', 'region_echo_road', 'region_heart_lumerra',
]);
const categories = new Set([
  'common_wildlife', 'magical_wildlife', 'hostile_creature', 'ancient_guardian', 'corrupted_creature', 'rare_elite',
]);
const affinities = new Set(['weak', 'resist', 'immune', 'neutral']);
const itemIds = new Set(ITEMS.map((item) => item.id));

function validateActions(actions, prefix) {
  if (!Array.isArray(actions) || actions.length === 0) { errors.push(`${prefix}: at least one action is required`); return; }
  for (const action of actions) {
    if (!action.id || !action.name || !['physical', 'magical'].includes(action.type)) errors.push(`${prefix}/${action.id ?? '(missing action id)'}: invalid action definition`);
    if (!Number.isFinite(action.power) || action.power <= 0) errors.push(`${prefix}/${action.id}: power must be positive`);
    if (action.element && !ELEMENT_IDS.includes(action.element)) errors.push(`${prefix}/${action.id}: unknown element ${action.element}`);
    if (action.effect && !STATUS_EFFECTS[action.effect.id]) errors.push(`${prefix}/${action.id}: unknown status ${action.effect.id}`);
    if (action.effect?.chance != null && (action.effect.chance < 0 || action.effect.chance > 1)) errors.push(`${prefix}/${action.id}: effect chance must be 0..1`);
    if (['regen', 'haste', 'attack_up'].includes(action.effect?.id)) errors.push(`${prefix}/${action.id}: hostile action cannot apply beneficial status ${action.effect.id} to the player target`);
  }
}

for (let index = 0; index < arcs.length; index++) {
  const arc = index + 1;
  const entries = arcs[index];
  if (entries.length < 8 || entries.length > 10) errors.push(`Arc ${arc}: expected 8–10 enemies, got ${entries.length}`);
  for (const enemy of entries) {
    const prefix = enemy?.id ?? '(missing id)';
    if (!enemy || typeof enemy !== 'object') { errors.push(`${prefix}: definition must be an object`); continue; }
    if (!/^[a-z][a-z0-9_]*$/.test(enemy.id ?? '')) errors.push(`${prefix}: invalid stable id`);
    if (enemyIds.has(enemy.id)) errors.push(`${prefix}: duplicate enemy id`);
    enemyIds.add(enemy.id);
    if (enemy.arc !== arc) errors.push(`${prefix}: expected arc ${arc}`);
    if (!enemy.name?.trim() || !enemy.description?.trim() || !enemy.habitat?.trim()) errors.push(`${prefix}: name, description and habitat are required`);
    if (!regions.has(enemy.regionId)) errors.push(`${prefix}: unknown region ${enemy.regionId}`);
    if (!categories.has(enemy.category)) errors.push(`${prefix}: invalid category ${enemy.category}`);
    for (const stat of ['maxHp', 'attack', 'defense', 'magicAttack', 'magicDefense', 'speed']) {
      if (!Number.isFinite(enemy[stat]) || enemy[stat] < 0 || (stat === 'maxHp' && enemy[stat] <= 0)) errors.push(`${prefix}: invalid ${stat}`);
    }
    for (const reward of ['exp', 'gold']) if (!Number.isFinite(enemy[reward]) || enemy[reward] < 0) errors.push(`${prefix}: invalid ${reward}`);
    for (const [element, affinity] of Object.entries(enemy.affinities ?? {})) {
      if (!ELEMENT_IDS.includes(element)) errors.push(`${prefix}: unknown affinity element ${element}`);
      if (!affinities.has(affinity)) errors.push(`${prefix}: invalid affinity ${element}:${affinity}`);
    }
    if (!enemy.ai?.style) errors.push(`${prefix}: AI style is required`);
    validateActions(enemy.ai?.actions, prefix);
  }
}

for (const boss of BOSS_CATALOG) {
  const prefix = boss?.id ?? '(missing boss id)';
  if (!boss || typeof boss !== 'object') { errors.push(`${prefix}: boss definition must be an object`); continue; }
  if (!/^[a-z][a-z0-9_]*$/.test(boss.id ?? '')) errors.push(`${prefix}: invalid stable boss id`);
  if (bossIds.has(boss.id) || enemyIds.has(boss.id)) errors.push(`${prefix}: duplicate global content id`);
  bossIds.add(boss.id);
  if (!boss.name?.trim() || !boss.description?.trim()) errors.push(`${prefix}: name and description are required`);
  if (!Number.isInteger(boss.arc) || boss.arc < 1 || boss.arc > 6) errors.push(`${prefix}: invalid arc`);
  if (!Number.isInteger(boss.chapter) || boss.chapter < 1 || boss.chapter > 30) errors.push(`${prefix}: invalid chapter`);
  if (!regions.has(boss.regionId)) errors.push(`${prefix}: unknown region ${boss.regionId}`);
  if (!['main_boss', 'mini_boss', 'optional_boss'].includes(boss.role)) errors.push(`${prefix}: invalid role ${boss.role}`);
  if (typeof boss.optional !== 'boolean' || typeof boss.requiredForMainStory !== 'boolean') errors.push(`${prefix}: optional/main-story metadata required`);
  if (boss.optional === boss.requiredForMainStory) errors.push(`${prefix}: optional and requiredForMainStory must be opposites`);
  if (!/^ch\d+_boss_[a-z0-9_]+_defeated$/.test(boss.flagKey ?? '')) errors.push(`${prefix}: invalid persistent flagKey`);
  for (const stat of ['maxHp', 'attack', 'defense', 'magicAttack', 'magicDefense', 'speed']) {
    if (!Number.isFinite(boss[stat]) || boss[stat] < 0 || (stat === 'maxHp' && boss[stat] <= 0)) errors.push(`${prefix}: invalid ${stat}`);
  }
  if (!Array.isArray(boss.phases) || boss.phases.length < 2) errors.push(`${prefix}: at least two phases are required`);
  let previousThreshold = 1.01;
  for (const phase of boss.phases ?? []) {
    if (!phase.id || !Number.isFinite(phase.hpBelowPct) || phase.hpBelowPct < 0 || phase.hpBelowPct > 1) errors.push(`${prefix}: invalid phase threshold/id`);
    if (phase.hpBelowPct >= previousThreshold) errors.push(`${prefix}: phase thresholds must strictly descend`);
    previousThreshold = phase.hpBelowPct;
    validateActions(phase.actions, `${prefix}/${phase.id}`);
  }
  const rewards = boss.rewards;
  if (!rewards || !Number.isFinite(rewards.exp) || rewards.exp < 0 || !Number.isFinite(rewards.gold) || rewards.gold < 0) errors.push(`${prefix}: valid EXP and gold rewards are required`);
  for (const item of rewards?.items ?? []) {
    if (!itemIds.has(item.id) || !Number.isInteger(item.qty) || item.qty <= 0) errors.push(`${prefix}: invalid reward item ${item.id}`);
  }
}

const mainBosses = BOSS_CATALOG.filter((boss) => boss.role === 'main_boss');
const optionalBosses = BOSS_CATALOG.filter((boss) => boss.optional);
if (all.length !== 50) errors.push(`Expected 50 regular enemies across six arcs, got ${all.length}`);
if (mainBosses.length !== 6) errors.push(`Expected six main story bosses, got ${mainBosses.length}`);
if (optionalBosses.length < 2) errors.push(`Expected at least two optional bosses, got ${optionalBosses.length}`);
for (let arc = 1; arc <= 6; arc++) {
  if (mainBosses.filter((boss) => boss.arc === arc).length !== 1) errors.push(`Arc ${arc}: expected exactly one main boss`);
}
if (enemyIds.size !== all.length) errors.push('Enemy IDs are not globally unique');
if (errors.length) {
  for (const error of errors) console.error(`GAGAL: ${error}`);
  process.exit(1);
}
console.log(`OK: ${arcs.map((entries, i) => `Arc ${i + 1} ${entries.length}`).join(', ')}; ${all.length} enemies, ${mainBosses.length} main bosses, ${optionalBosses.length} optional/mini bosses validated.`);
