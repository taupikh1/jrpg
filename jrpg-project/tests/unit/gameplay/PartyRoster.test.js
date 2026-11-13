import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ACTIVE_PARTY_SIZE, getActivePartyIds, getPartyRosterSnapshot,
  isPartyMemberActive, restorePartyRosterFlags,
} from '../../../src/engine/gameplay/party/PartyRoster.js';

describe('Party roster and story membership (B16)', () => {
  it('keeps Orin permanent and gates Mira/Kael on recruitment flags', () => {
    assert.deepEqual(getActivePartyIds({}), ['orin']);
    const flags = { ch1: { ch1_mira_follow: true }, ch6: { ch6_kael_joined: true } };
    assert.deepEqual(getActivePartyIds(flags), ['orin', 'mira', 'kael']);
    assert.equal(isPartyMemberActive('kael', flags), true);
  });

  it('applies departure flags without erasing recruitment history', () => {
    const flags = {
      ch1: { ch1_mira_follow: true, ch1_mira_departed: true },
      ch6: { ch6_kael_joined: true },
    };
    const roster = getPartyRosterSnapshot(flags);
    assert.equal(roster.recruited.mira, true);
    assert.equal(roster.departed.mira, true);
    assert.deepEqual(roster.active, ['orin', 'kael']);
  });

  it('restores known roster flags from save metadata and caps the active party at four', () => {
    const restored = restorePartyRosterFlags({}, {
      recruited: { orin: true, mira: true, kael: true },
      departed: { orin: false, mira: false, kael: false },
    });
    assert.deepEqual(getActivePartyIds(restored), ['orin', 'mira', 'kael']);
    assert.equal(MAX_ACTIVE_PARTY_SIZE, 4);
    assert.deepEqual(getActivePartyIds({ ch1: { ch1_mira_follow: true }, ch6: { ch6_kael_joined: true } }, { maxSize: 2 }), ['orin', 'mira']);
  });
});
