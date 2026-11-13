/** Story-flag driven party roster helpers. Runtime IDs are stable save/gameplay keys. */
export const MAX_ACTIVE_PARTY_SIZE = 4;

export const PARTY_MEMBER_DEFS = Object.freeze({
  orin: Object.freeze({ id: 'orin', joinFlag: null, leaveFlags: Object.freeze([]), permanent: true }),
  mira: Object.freeze({ id: 'mira', joinFlag: 'ch1_mira_follow', leaveFlags: Object.freeze(['ch1_mira_departed']) }),
  kael: Object.freeze({ id: 'kael', joinFlag: 'ch6_kael_joined', leaveFlags: Object.freeze(['ch6_kael_departed']) }),
});

function flagValue(worldFlags, flag) {
  if (!flag || !worldFlags || typeof worldFlags !== 'object') return false;
  if (worldFlags[flag] === true) return true;
  return Object.values(worldFlags).some((chapter) => chapter && typeof chapter === 'object' && chapter[flag] === true);
}

export function isPartyMemberActive(id, worldFlags = {}, definitions = PARTY_MEMBER_DEFS) {
  const def = definitions[id];
  if (!def) return false;
  if (def.permanent) return true;
  return flagValue(worldFlags, def.joinFlag)
    && !(def.leaveFlags || []).some((flag) => flagValue(worldFlags, flag));
}

export function getActivePartyIds(worldFlags = {}, { maxSize = MAX_ACTIVE_PARTY_SIZE, definitions = PARTY_MEMBER_DEFS } = {}) {
  const limit = Math.max(1, Math.min(MAX_ACTIVE_PARTY_SIZE, Math.floor(Number(maxSize) || MAX_ACTIVE_PARTY_SIZE)));
  return Object.keys(definitions).filter((id) => isPartyMemberActive(id, worldFlags, definitions)).slice(0, limit);
}

export function getPartyRosterSnapshot(worldFlags = {}, definitions = PARTY_MEMBER_DEFS) {
  const recruited = {};
  const departed = {};
  for (const [id, def] of Object.entries(definitions)) {
    recruited[id] = !!def.permanent || flagValue(worldFlags, def.joinFlag);
    departed[id] = (def.leaveFlags || []).some((flag) => flagValue(worldFlags, flag));
  }
  return { recruited, departed, active: getActivePartyIds(worldFlags, { definitions }) };
}

/** Restore only known roster flags; never overwrite unrelated story flags. */
export function restorePartyRosterFlags(worldFlags = {}, roster = {}, definitions = PARTY_MEMBER_DEFS) {
  const restored = { ...worldFlags };
  for (const [id, def] of Object.entries(definitions)) {
    const chapterFor = (flag) => {
      const match = /^ch(\d+)_/.exec(flag || '');
      return match ? `ch${match[1]}` : 'meta';
    };
    if (def.joinFlag && typeof roster.recruited?.[id] === 'boolean') {
      const key = chapterFor(def.joinFlag);
      restored[key] = { ...(restored[key] || {}), [def.joinFlag]: roster.recruited[id] };
    }
    for (const flag of def.leaveFlags || []) {
      if (typeof roster.departed?.[id] === 'boolean') {
        const key = chapterFor(flag);
        restored[key] = { ...(restored[key] || {}), [flag]: roster.departed[id] };
      }
    }
  }
  return restored;
}
