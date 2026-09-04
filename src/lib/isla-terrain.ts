/**
 * Isla Central terrain — a single shared height field.
 * WORLD VISUALS sample it to build geometry; the player controller samples it
 * to walk on it. Keep this file pure so both sides always agree.
 */

/** Everything on Isla Central is authored in "design units" then blown up by
 * this factor so the island reads as a real, large world next to a 1.8m child. */
export const WORLD_SCALE = 2.2;

export const ISLAND_RADIUS = 96 * WORLD_SCALE;
export const SHORE_RADIUS = 78 * WORLD_SCALE;
export const WATER_LEVEL = 0;

/** Scale a design-unit coordinate pair into world space. */
export function ws(p: [number, number]): [number, number] {
  return [p[0] * WORLD_SCALE, p[1] * WORLD_SCALE];
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function bump(x: number, z: number, cx: number, cz: number, radius: number) {
  const d = Math.hypot(x - cx, z - cz);
  return smoothstep(radius, 0, d);
}

/** Ground height in world units. Anything below WATER_LEVEL is ocean. */
export function terrainHeight(worldX: number, worldZ: number): number {
  const x = worldX / WORLD_SCALE;
  const z = worldZ / WORLD_SCALE;
  const r = Math.hypot(x, z);
  const land = smoothstep(96, 78 - 12, r);

  let h = 1.6 * land - (1 - land) * 9;

  // Knowledge Mountains — north-east massif with a stepped shoulder.
  h += bump(x, z, 44, -46, 34) * 26;
  h += bump(x, z, 52, -34, 15) * 10;

  // Forest of Wisdom — rolling north-west hills.
  const forest = bump(x, z, -44, -40, 34);
  h += forest * (5 + Math.sin(x * 0.11) * Math.cos(z * 0.13) * 2.6);

  // Desert Zone — western dunes.
  const desert = bump(x, z, -58, 16, 32);
  h += desert * (3 + Math.sin(x * 0.09 + 1.2) * 2.4 + Math.cos(z * 0.11) * 1.6);

  // History Valley — south-west sunken plateau.
  const valley = bump(x, z, -26, 48, 26);
  h += valley * 2.4 - valley * 4.2 * smoothstep(26, 6, Math.hypot(x + 26, z - 48));

  // Emerald Beach — south-east, gently sloping to the water.
  h -= bump(x, z, 30, 52, 28) * 3.4;

  // Space Port — eastern tech plateau.
  const port = bump(x, z, 62, 8, 24);
  h += port * 7;
  h = h * (1 - port * 0.55) + 7.4 * port * 0.55;

  // Central City plaza is dead flat so the tutorial reads clearly.
  const plaza = smoothstep(22, 12, r);
  h = h * (1 - plaza) + 2.2 * plaza;

  // Micro relief everywhere except the plaza.
  h += (1 - plaza) * land * Math.sin(x * 0.31) * Math.cos(z * 0.27) * 0.35;

  return h * WORLD_SCALE * 0.8;
}

/** Walkable = above the waterline and not a cliff-side wall. */
export function isWalkable(x: number, z: number): boolean {
  if (Math.hypot(x, z) > ISLAND_RADIUS - 2) return false;
  return terrainHeight(x, z) > WATER_LEVEL + 0.35;
}
