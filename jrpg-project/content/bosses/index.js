import { BOSSES_ARC_01 } from './arc_01.js';
import { BOSSES_ARC_02 } from './arc_02.js';
import { BOSSES_ARC_03 } from './arc_03.js';
import { BOSSES_ARC_04 } from './arc_04.js';
import { BOSSES_ARC_05 } from './arc_05.js';
import { BOSSES_ARC_06 } from './arc_06.js';

export const BOSS_CATALOG = Object.freeze([
  ...BOSSES_ARC_01, ...BOSSES_ARC_02, ...BOSSES_ARC_03,
  ...BOSSES_ARC_04, ...BOSSES_ARC_05, ...BOSSES_ARC_06,
]);
export function getBossById(id) { return BOSS_CATALOG.find((boss) => boss.id === id) ?? null; }
