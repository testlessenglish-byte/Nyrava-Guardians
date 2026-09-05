// Deterministic procedural terrain for Vale of Aurora world.
// Ported from vale-of-aurora-complete by Nyrava Guardians.

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x: number, y: number, octaves = 6) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

export const VALE_WATER_LEVEL = 0;
export const VALE_WORLD_SIZE = 900;

/** Height of the ground at a world position. */
export function valeTerrainHeight(x: number, z: number): number {
  const s = 0.0022;
  const base = fbm(x * s, z * s, 6);

  // Ridged mountains, stronger away from the valley centre.
  const r = Math.sqrt(x * x + z * z);
  const ridge = 1 - Math.abs(fbm(x * s * 1.7 + 100, z * s * 1.7 - 40, 5) * 2 - 1);
  const mountainMask = smooth(Math.min(1, Math.max(0, (r - 90) / 320)));

  // Lake basin in the middle of the valley.
  const basin = Math.exp(-(r * r) / (150 * 150));

  let h = base * 26 - 10;
  h += Math.pow(ridge, 2.1) * 210 * mountainMask;
  h -= basin * 26;
  h += fbm(x * 0.02, z * 0.02, 3) * 2.2 - 1.1;
  return h;
}

export function valeTerrainNormal(x: number, z: number, e = 1.5) {
  const hl = valeTerrainHeight(x - e, z);
  const hr = valeTerrainHeight(x + e, z);
  const hd = valeTerrainHeight(x, z - e);
  const hu = valeTerrainHeight(x, z + e);
  const nx = hl - hr;
  const nz = hd - hu;
  const ny = 2 * e;
  const len = Math.hypot(nx, ny, nz);
  return { x: nx / len, y: ny / len, z: nz / len };
}
