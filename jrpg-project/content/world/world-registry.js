/**
 * Content-layer world registry — does not replace ZoneManager.
 * Links canon regions to playable zones and planned stubs.
 */

/** @typedef {{ id: string, name: string, nameId?: string, type: string, climate: string, biome: string, chapterHints: string[], status: 'playable'|'planned', zoneIds: string[], neighbors: string[] }} RegionDef */

/** @type {RegionDef[]} */
export const REGIONS = [
  {
    id: 'region_ashwillow',
    name: 'Lembah Ashwillow',
    nameId: 'Ashwillow Vale',
    type: 'vale',
    climate: 'sedang',
    biome: 'sungai_ladang',
    chapterHints: ['chapter_01'],
    status: 'playable',
    zoneIds: ['village'],
    neighbors: ['region_whispering_wood', 'region_bellhaven'],
  },
  {
    id: 'region_whispering_wood',
    name: 'Hutan Berbisik',
    nameId: 'Whispering Wood',
    type: 'forest',
    climate: 'sedang',
    biome: 'hutan_tropis_ringan',
    chapterHints: ['chapter_02'],
    status: 'playable',
    zoneIds: ['forest'],
    neighbors: ['region_ashwillow', 'region_bellhaven'],
  },
  {
    id: 'region_bellhaven',
    name: 'Wilayah Bellhaven',
    type: 'trade_hills',
    climate: 'sedang',
    biome: 'bukit_jalan',
    chapterHints: ['chapter_03', 'chapter_04'],
    status: 'planned',
    zoneIds: ['road_bellhaven', 'bellhaven_gate', 'bellhaven_plaza', 'bellhaven_market', 'bellhaven_archive_hall', 'bellhaven_archive_stacks', 'bellhaven_archive_restricted', 'resonance_ancient_site'],
    neighbors: ['region_ashwillow', 'region_whispering_wood', 'region_starfall_plain', 'region_glass_lantern'],
  },
  {
    id: 'region_ashen_crown',
    name: 'Jantung Ashen Crown',
    type: 'kingdom_core',
    climate: 'sejuk',
    biome: 'dataran',
    chapterHints: ['chapter_06'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_silent_march', 'region_starfall_plain'],
  },
  {
    id: 'region_silent_march',
    name: 'March yang Sunyi',
    type: 'border',
    climate: 'sejuk',
    biome: 'rawa_perbatasan',
    chapterHints: ['chapter_07'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_ashen_crown'],
  },
  {
    id: 'region_glass_lantern',
    name: 'Glass Lantern',
    type: 'port_city',
    climate: 'lembab',
    biome: 'pesisir_kota',
    chapterHints: ['chapter_08'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_bellhaven', 'region_starfall_plain'],
  },
  {
    id: 'region_starfall_plain',
    name: 'Dataran Starfall',
    type: 'corridor',
    climate: 'sejuk',
    biome: 'padang_rumput',
    chapterHints: ['chapter_10'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_bellhaven', 'region_ashen_crown', 'region_glass_lantern'],
  },
  {
    id: 'region_verdant_veil',
    name: 'Tirai Hijau',
    type: 'ruin_jungle',
    climate: 'hangat',
    biome: 'hutan_lebat',
    chapterHints: ['chapter_11'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_underdeep', 'region_sleeping_kings'],
  },
  {
    id: 'region_underdeep',
    name: 'Underdeep',
    type: 'subterranean',
    climate: 'dingin_gua',
    biome: 'gua',
    chapterHints: ['chapter_12'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_verdant_veil'],
  },
  {
    id: 'region_sleeping_kings',
    name: 'Pegunungan Raja Tidur',
    type: 'highland',
    climate: 'berkabut',
    biome: 'pegunungan',
    chapterHints: ['chapter_13'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_verdant_veil', 'region_echo_road'],
  },
  {
    id: 'region_echo_road',
    name: 'Jalan Gema yang Hilang',
    type: 'scar_road',
    climate: 'tidak stabil',
    biome: 'jalan_runtuh',
    chapterHints: ['chapter_21'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_sleeping_kings', 'region_heart_lumerra'],
  },
  {
    id: 'region_heart_lumerra',
    name: 'Jantung Lumerra',
    type: 'core_anomaly',
    climate: 'anomali',
    biome: 'inti_resonansi',
    chapterHints: ['chapter_25', 'chapter_29', 'chapter_30'],
    status: 'planned',
    zoneIds: [],
    neighbors: ['region_echo_road'],
  },
];

/** Zone metadata overlay (does not change ZoneManager IDs). */
export const ZONE_META = {
  village: {
    regionId: 'region_ashwillow',
    subregionId: 'subregion_ashwillow_core',
    settlementId: 'settlement_ashwillow_village',
    displayNameId: 'Desa Ashwillow',
    chapter: 'chapter_01',
  },
  forest: {
    regionId: 'region_whispering_wood',
    subregionId: 'subregion_wood_edge',
    displayNameId: 'Tepi Hutan Berbisik',
    chapter: 'chapter_02',
  },
  road_bellhaven: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_approach',
    displayNameId: 'Jalan Menuju Bellhaven',
    chapter: 'chapter_03',
  },
  bellhaven_gate: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_gate',
    displayNameId: 'Gerbang Bellhaven',
    chapter: 'chapter_03',
  },
  bellhaven_plaza: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_plaza',
    displayNameId: 'Alun-Alun Bellhaven',
    chapter: 'chapter_03',
  },
  bellhaven_market: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_market',
    displayNameId: 'Pasar Bellhaven',
    chapter: 'chapter_03',
  },
  bellhaven_archive_hall: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_archive',
    displayNameId: 'Balai Arsip Bellhaven',
    chapter: 'chapter_04',
  },
  bellhaven_archive_stacks: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_archive',
    displayNameId: 'Ruang Rak Tanpa Nama',
    chapter: 'chapter_04',
  },
  bellhaven_archive_restricted: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_bellhaven_archive',
    displayNameId: 'Ruang Arsip Terlarang',
    chapter: 'chapter_04',
  },
  resonance_ancient_site: {
    regionId: 'region_bellhaven',
    subregionId: 'subregion_resonance_site',
    displayNameId: 'Situs Resonansi Kuno',
    chapter: 'chapter_05',
  },
};




export const CONNECTIONS = [
  { id: 'conn_road_to_resonance', fromZoneId: 'road_bellhaven', toZoneId: 'resonance_ancient_site', implemented: true },
  { id: 'conn_resonance_to_road', fromZoneId: 'resonance_ancient_site', toZoneId: 'road_bellhaven', implemented: true },

  { id: 'conn_plaza_to_archive', fromZoneId: 'bellhaven_plaza', toZoneId: 'bellhaven_archive_hall', implemented: true },
  { id: 'conn_archive_to_plaza', fromZoneId: 'bellhaven_archive_hall', toZoneId: 'bellhaven_plaza', implemented: true },
  { id: 'conn_hall_to_stacks', fromZoneId: 'bellhaven_archive_hall', toZoneId: 'bellhaven_archive_stacks', implemented: true },
  { id: 'conn_stacks_to_hall', fromZoneId: 'bellhaven_archive_stacks', toZoneId: 'bellhaven_archive_hall', implemented: true },
  { id: 'conn_stacks_to_restricted', fromZoneId: 'bellhaven_archive_stacks', toZoneId: 'bellhaven_archive_restricted', implemented: true },
  { id: 'conn_restricted_to_stacks', fromZoneId: 'bellhaven_archive_restricted', toZoneId: 'bellhaven_archive_stacks', implemented: true },

  { id: 'conn_road_to_gate', fromZoneId: 'road_bellhaven', toZoneId: 'bellhaven_gate', implemented: true },
  { id: 'conn_gate_to_road', fromZoneId: 'bellhaven_gate', toZoneId: 'road_bellhaven', implemented: true },
  { id: 'conn_gate_to_plaza', fromZoneId: 'bellhaven_gate', toZoneId: 'bellhaven_plaza', implemented: true },
  { id: 'conn_plaza_to_gate', fromZoneId: 'bellhaven_plaza', toZoneId: 'bellhaven_gate', implemented: true },
  { id: 'conn_plaza_to_market', fromZoneId: 'bellhaven_plaza', toZoneId: 'bellhaven_market', implemented: true },
  { id: 'conn_market_to_plaza', fromZoneId: 'bellhaven_market', toZoneId: 'bellhaven_plaza', implemented: true },

  {
    id: 'conn_forest_to_road_bellhaven',
    fromZoneId: 'forest',
    toZoneId: 'road_bellhaven',
    implemented: true,
  },
  {
    id: 'conn_road_bellhaven_to_forest',
    fromZoneId: 'road_bellhaven',
    toZoneId: 'forest',
    implemented: true,
  },

  {
    id: 'conn_village_to_forest',
    fromZoneId: 'village',
    toZoneId: 'forest',
    implemented: true,
  },
  {
    id: 'conn_forest_to_village',
    fromZoneId: 'forest',
    toZoneId: 'village',
    implemented: true,
  },
];

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id) ?? null;
}

export function getRegionForZone(zoneId) {
  const meta = ZONE_META[zoneId];
  if (!meta) return null;
  return getRegion(meta.regionId);
}

export function listPlayableZones() {
  return Object.keys(ZONE_META);
}
