/**
 * Connects gameplay events on the EventBus to sound effects and ambience.
 * It only listens. It never changes battle, quest, save, or dialogue logic.
 *
 * Every sound here corresponds to an event the game already emits after a successful action.
 * Clicks alone never trigger sound. Menu cursor and open or close sounds are handled by the scene.
 */

/**
 * @param {import('../../core/EventBus.js').EventBus} events
 * @param {import('./AudioManager.js').AudioManager} audio
 * @param {object} ctx
 * @param {(id: string) => boolean} ctx.isEnemy - true when the participant is on the enemy side
 * @param {(skillId: string) => ('heal'|'magic'|'physical')} ctx.skillKindOf
 * @param {(zoneId: string) => (string|null)} ctx.ambientForZone
 * @returns {() => void} dispose: removes every listener this call added
 */
export function bindAudioEvents(events, audio, ctx) {
  const { isEnemy, skillKindOf, ambientForZone } = ctx;
  const subs = [];
  const on = (name, fn) => subs.push(events.on(name, fn));

  // Turn-based combat
  on('battle.started', () => {
    audio.setAmbientHold('battle', true);
    audio.playSfx('battle_start');
  });
  on('battle.action_resolved', (e) => {
    if (!e) return;
    if (e.type === 'attack') {
      const fromEnemy = isEnemy(e.actorId);
      audio.playSfx(fromEnemy ? 'enemy_attack' : 'attack_physical');
      if (e.damage > 0) {
        audio.playSfx('impact_weapon', { delay: 0.08 });
        if (isEnemy(e.targetId)) audio.playSfx('damage_enemy', { delay: 0.12 });
        else audio.playSfx('damage_player', { delay: 0.12 });
      }
    } else if (e.type === 'skill') {
      const kind = skillKindOf(e.skill);
      if (kind === 'heal') {
        audio.playSfx('heal');
      } else {
        audio.playSfx(kind === 'physical' ? 'attack_physical' : 'magic_cast');
        if (isEnemy(e.targetId)) audio.playSfx('damage_enemy', { delay: 0.25 });
        else audio.playSfx('damage_player', { delay: 0.25 });
      }
    } else if (e.type === 'item') {
      audio.playSfx('item_use');
    } else if (e.type === 'defend') {
      audio.playSfx('defend');
    }
  });
  on('battle.participant_defeated', (e) => {
    audio.playSfx(isEnemy(e?.id) ? 'enemy_defeat' : 'party_ko');
  });
  on('battle.victory', () => audio.playSfx('battle_victory'));
  on('battle.defeat', () => audio.playSfx('battle_defeat'));
  on('battle.escaped', () => audio.playSfx('battle_escape'));
  on('battle.ended', () => audio.setAmbientHold('battle', false));

  // Items, quests, dialogue
  on('inventory.item_added', () => audio.playSfx('item_pickup'));
  on('inventory.item_used', () => audio.playSfx('item_use'));
  on('quest.accepted', () => audio.playSfx('quest_accept'));
  on('quest.completed', (e) => {
    audio.playSfx('quest_complete');
    const r = e?.rewards;
    if (r && (r.gold || (Array.isArray(r.items) && r.items.length))) {
      audio.playSfx('reward', { delay: 0.45 });
    }
  });
  on('dialogue.started', () => audio.playSfx('npc_talk'));

  // Saves (failures are reported directly by the scene because no event exists for them)
  on('save.written', () => audio.playSfx('ui_save_ok'));

  // Character progression
  on('progression.exp_gained', (e) => {
    if ((e?.amount ?? 0) > 0) audio.playSfx('exp_gain');
  });
  on('progression.level_up', () => {
    audio.playSfx('level_up');
  });
  on('progression.stat_up', () => {
    audio.playSfx('stat_up', { delay: 0.18 });
  });
  on('progression.skill_unlock', (e) => {
    const hasSkill = Array.isArray(e?.skills) ? e.skills.length > 0 : !!e?.skillId;
    if (hasSkill) audio.playSfx('skill_unlock', { delay: 0.35 });
  });

  // Area ambience follows the zone that became active
  on('zone:activated', (e) => {
    const zoneId = e?.zone?.id;
    if (zoneId) audio.playAmbient(ambientForZone(zoneId));
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    for (const off of subs) off();
    subs.length = 0;
  };
}
