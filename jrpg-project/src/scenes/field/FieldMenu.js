/**
 * Field menu structure ala FF4 (FF4).
 * Pure data + helpers. Scene still owns drawing and input.
 */
export const FIELD_MENU_ITEMS = Object.freeze([
  { id: 'item', label: 'Item', desc: 'Pakai atau lihat barang' },
  { id: 'skill', label: 'Skill', desc: 'Lihat kemampuan' },
  { id: 'equip', label: 'Perlengkapan', desc: 'Ganti senjata dan armor' },
  { id: 'formation', label: 'Formasi', desc: 'Atur posisi party' },
  { id: 'status', label: 'Status', desc: 'Lihat atribut anggota' },
  { id: 'settings', label: 'Pengaturan', desc: 'Audio dan mode battle' },
  { id: 'save', label: 'Simpan', desc: 'Simpan progres' },
  { id: 'resume', label: 'Lanjut', desc: 'Kembali ke permainan' },
]);

export function fieldMenuAt(index) {
  const i = ((index % FIELD_MENU_ITEMS.length) + FIELD_MENU_ITEMS.length) % FIELD_MENU_ITEMS.length;
  return FIELD_MENU_ITEMS[i];
}
