# FF9 — QA Checklist & Release Gate (2026-11-14)

## Status
PARTIAL — dokumen checklist dan catatan performa. Uji perangkat sungguhan masih NOT TESTED.

## Checklist perangkat
- [ ] iPhone Safari landscape & portrait: layout battle, menu, sentuhan
- [ ] Android Chrome: kontrol sentuh, audio, save/load
- [ ] Desktop keyboard: semua menu dan battle
- [ ] prefers-reduced-motion: tidak ada kilatan berlebih
- [ ] Offline (service worker): shell tetap termuat

## Performa
- Logical resolution 320x240 (landscape up to ~517).
- Hindari drawImage berlebih di loop battle.
- Clamp dt di scene (sudah ada pola MAX_DELTA).

## Gerbang rilis
- Semua unit test lulus.
- `npm run check`, `check:world`, `check:narrative`, `check:enemies` lulus.
- Tidak ada regresi pada mode battle 'round'.
- Save lama (v6) masih termuat.

## Catatan
Batch FF3–FF8 diimplementasikan secara konservatif karena spesifikasi lengkap hanya tersedia untuk FF1–FF2 di dokumen prompt awal. Fitur di atas adalah fondasi yang dapat diperluas.
