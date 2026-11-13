# P2 — Chapter notifications
- Hooks in content: chapter_02..chapter_06 (source verified). No central message registry exists; added `content/gameplay/chapter-notifications.js` (pure). Scene calls `chapterHookMessage`.
- Messages: "Bab N telah terbuka." for 2-5 (canonical titles for 2-4 not found, none invented); Chapter 6: "Bab berikutnya telah terbuka: Kerajaan Mahkota Abu. (Segera hadir)"; unknown hook: "Bab berikutnya telah terbuka."
- Tests: `tests/unit/narrative/ChapterNotifications.test.js` (3, unit + content scan). Duplicate-toast at scene level not browser-verified.
- Note: other toasts (`Quest diterima: <id>`, `Quest selesai: <id>`, `Membeli <itemId>`) still show raw ids — NOT fixed this batch.
