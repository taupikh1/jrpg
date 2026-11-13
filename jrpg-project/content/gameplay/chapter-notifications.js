/**
 * Player-facing toast text for dialogue `chapterHook` effects.
 * Internal ids (chapter_0X) are never shown to the player.
 */
export const CHAPTER_HOOK_MESSAGES = {
  chapter_02: 'Bab 2 telah terbuka.',
  chapter_03: 'Bab 3 telah terbuka.',
  chapter_04: 'Bab 4 telah terbuka.',
  chapter_05: 'Bab 5 telah terbuka.',
  chapter_06: 'Bab berikutnya telah terbuka: Kerajaan Mahkota Abu. (Segera hadir)',
};

export const CHAPTER_HOOK_FALLBACK = 'Bab berikutnya telah terbuka.';

/** @param {unknown} hook */
export function chapterHookMessage(hook) {
  return Object.prototype.hasOwnProperty.call(CHAPTER_HOOK_MESSAGES, hook)
    ? CHAPTER_HOOK_MESSAGES[hook]
    : CHAPTER_HOOK_FALLBACK;
}
