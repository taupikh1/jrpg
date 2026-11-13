import { PixBuf, makeStrip, darken, lighten, rng } from './PixBuf.js';
import { C } from './Palette.js';

/** Enemy sprites, 16x16 native (battle draws them at 2x). 2 idle frames. */
const VARIANTS = {
  green: { body: '#2c6a38', mid: '#3f8a46', hi: '#62ad55', dark: '#1f4a2e', eye: '#f1c94b', thorn: '#e8dcb8' },
  autumn: { body: '#8a4a2a', mid: '#b3683a', hi: '#d9964a', dark: '#5a2f1c', eye: '#8ff0ff', thorn: '#f0e0c0' },
};

export function paintThornSprite(frame, variant = 'green') {
  const P = VARIANTS[variant] || VARIANTS.green;
  const pb = new PixBuf(16, 16);
  const squash = frame === 1 ? 1 : 0;
  const top = 2 + squash;
  // body: bramble ball
  pb.ellipse(7.5, 8 + squash * 0.5, 6, 5.2 - squash * 0.4, P.body);
  pb.ellipse(7, 7 + squash * 0.5, 4.6, 3.8 - squash * 0.4, P.mid);
  pb.ellipse(6, 6 + squash * 0.5, 2.6, 2, P.hi);
  const r = rng(5);
  for (let i = 0; i < 10; i++) {
    const x = 3 + Math.floor(r() * 10);
    const y = top + 2 + Math.floor(r() * 7);
    if (pb.alpha(x, y)) pb.set(x, y, i % 2 ? P.dark : P.hi);
  }
  // thorns
  const thorns = [[1, 5], [0, 8], [2, 11], [14, 5], [15, 8], [13, 11], [4, top - 1], [8, top - 2], [11, top - 1]];
  for (const [x, y] of thorns) {
    pb.set(x, y, P.thorn);
    pb.set(x + (x < 8 ? 1 : -1), y + (y < 7 ? 1 : 0), P.thorn);
  }
  // eyes
  pb.rect(5, 8 + squash, 2, 2, P.eye);
  pb.rect(9, 8 + squash, 2, 2, P.eye);
  pb.set(6, 9 + squash, '#14101e');
  pb.set(10, 9 + squash, '#14101e');
  pb.hline(5, 7 + squash, 3, P.dark);
  pb.hline(9, 7 + squash, 3, P.dark);
  // mouth
  pb.hline(6, 11 + squash, 4, '#14101e');
  pb.set(7, 11 + squash, P.thorn);
  pb.set(9, 11 + squash, P.thorn);
  // root feet
  pb.rect(4, 13, 3, 2, '#5a3a24');
  pb.rect(9, 13, 3, 2, '#5a3a24');
  pb.hline(4, 14, 3, '#38231a');
  pb.hline(9, 14, 3, '#38231a');
  pb.outline(C.ink);
  return pb;
}

export function paintEnemyStrip(id, variant) {
  return makeStrip(2, 16, 16, (pb, f) => pb.blit(paintThornSprite(f, variant)));
}

/** Which sprite does a battler use? */
export function enemyVisual(participant) {
  const id = String(participant?.id || '');
  const variant = /2$|b$/.test(id) ? 'autumn' : 'green';
  return { kind: 'thorn', variant };
}

void darken; void lighten;
