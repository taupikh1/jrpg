import { ENEMIES as ARC_01_ENEMIES } from './arc_01.js';
import { ENEMIES_ARC_02 } from './arc_02.js';
import { ENEMIES_ARC_03 } from './arc_03.js';
import { ENEMIES_ARC_04 } from './arc_04.js';
import { ENEMIES_ARC_05 } from './arc_05.js';
import { ENEMIES_ARC_06 } from './arc_06.js';

export const ENEMY_CATALOG = Object.freeze([
  ...ARC_01_ENEMIES, ...ENEMIES_ARC_02, ...ENEMIES_ARC_03,
  ...ENEMIES_ARC_04, ...ENEMIES_ARC_05, ...ENEMIES_ARC_06,
]);
export function getEnemyById(id) { return ENEMY_CATALOG.find((enemy) => enemy.id === id) ?? null; }
