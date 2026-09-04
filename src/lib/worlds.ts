export type PropSpec = {
  kind: "box" | "cyl" | "cone" | "sphere" | "torus";
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  rot?: number;
};

export type Portal = {
  to: string;
  pos: [number, number];
  label: string;
};

export type Zone = {
  id: string;
  name: string;
  blurb: string;
  accent: string;
  sky: string;
  ground: string;
  groundTextured: boolean;
  radius: number;
  walls: boolean;
  banner: string;
  bannerSub: string;
  npcs: string[];
  props: PropSpec[];
  portals: Portal[];
};

const ring = (
  count: number,
  radius: number,
  make: (x: number, z: number, i: number) => PropSpec,
): PropSpec[] =>
  Array.from({ length: count }, (_, i) => {
    const a = ((i + 0.5) / count) * Math.PI * 2;
    return make(Math.cos(a) * radius, Math.sin(a) * radius, i);
  });

const grid = (xs: number[], zs: number[], make: (x: number, z: number) => PropSpec): PropSpec[] =>
  xs.flatMap((x) => zs.map((z) => make(x, z)));

export const ZONES: Zone[] = [
  {
    id: "academy",
    name: "Academy Classroom",
    blurb: "Live class with all six Guardians. Walk up to anyone and talk.",
    accent: "#38bdf8",
    sky: "#060910",
    ground: "#5b6474",
    groundTextured: true,
    radius: 13,
    walls: true,
    banner: "NYRAVA LIVE CLASS",
    bannerSub: "Today: spotting strangers & staying safe online",
    npcs: ["lex", "nova", "tess", "byte", "echo"],
    props: [
      ...grid([-3.5, 0, 3.5], [-3, 0, 3], (x, z) => ({
        kind: "box",
        pos: [x, 0.38, z],
        size: [1.5, 0.1, 0.9],
        color: "#243044",
      })),
      ...grid([-3.5, 0, 3.5], [-3, 0, 3], (x, z) => ({
        kind: "box",
        pos: [x, 0.19, z],
        size: [1.3, 0.38, 0.1],
        color: "#151d2c",
      })),
      ...grid([-3.5, 0, 3.5], [-3, 0, 3], (x, z) => ({
        kind: "box",
        pos: [x, 0.22, z + 1.1],
        size: [0.7, 0.45, 0.7],
        color: "#1b2436",
      })),
      ...[-6, 6].map<PropSpec>((z) => ({
        kind: "box",
        pos: [-12.2, 1.4, z],
        size: [0.6, 2.8, 3],
        color: "#182131",
        emissive: "#38bdf8",
        emissiveIntensity: 0.25,
      })),
      ...[-6, 6].map<PropSpec>((z) => ({
        kind: "box",
        pos: [12.2, 1.4, z],
        size: [0.6, 2.8, 3],
        color: "#182131",
        emissive: "#38bdf8",
        emissiveIntensity: 0.25,
      })),
    ],
    portals: [
      { to: "home", pos: [-9, 11], label: "My Home" },
      { to: "missions", pos: [0, 11.5], label: "Mission Hub" },
      { to: "adventure", pos: [9, 11], label: "Adventure Zone" },
    ],
  },
  {
    id: "home",
    name: "My Home HQ",
    blurb: "Your private base — command desk, sleep pod and trophy wall.",
    accent: "#22e07a",
    sky: "#04120c",
    ground: "#2c3a33",
    groundTextured: false,
    radius: 11,
    walls: true,
    banner: "GUARDIAN HQ",
    bannerSub: "Your base. Your rules. Your gear.",
    npcs: ["byte"],
    props: [
      {
        kind: "box",
        pos: [0, 0.5, -7],
        size: [5, 1, 1.6],
        color: "#1f3a2c",
        emissive: "#22e07a",
        emissiveIntensity: 0.3,
      },
      {
        kind: "box",
        pos: [0, 1.6, -7.7],
        size: [4.4, 1.6, 0.12],
        color: "#07130d",
        emissive: "#22e07a",
        emissiveIntensity: 0.8,
      },
      {
        kind: "cyl",
        pos: [-7, 0.6, 2],
        size: [1.6, 1.6, 1.2],
        color: "#16281f",
        emissive: "#22e07a",
        emissiveIntensity: 0.4,
      },
      {
        kind: "sphere",
        pos: [-7, 1.7, 2],
        size: [1.5, 1.5, 1.5],
        color: "#0d1c15",
        emissive: "#22e07a",
        emissiveIntensity: 0.25,
      },
      {
        kind: "box",
        pos: [7, 1.2, 0],
        size: [0.4, 2.4, 5],
        color: "#12241b",
        emissive: "#22e07a",
        emissiveIntensity: 0.35,
      },
      ...ring(6, 4.5, (x, z) => ({
        kind: "cyl",
        pos: [x, 0.15, z],
        size: [0.5, 0.5, 0.3],
        color: "#1a3325",
        emissive: "#22e07a",
        emissiveIntensity: 0.6,
      })),
    ],
    portals: [
      { to: "academy", pos: [0, 9.5], label: "Academy" },
      { to: "missions", pos: [8, 8], label: "Mission Hub" },
    ],
  },
  {
    id: "missions",
    name: "Mission Hub",
    blurb: "Briefing arena where real-world scenarios launch.",
    accent: "#ffb020",
    sky: "#120a03",
    ground: "#3a3128",
    groundTextured: false,
    radius: 14,
    walls: false,
    banner: "MISSION HUB",
    bannerSub: "Real scenarios. Real choices. Real impact.",
    npcs: ["tess", "nova"],
    props: [
      {
        kind: "cyl",
        pos: [0, 0.12, 0],
        size: [6, 6, 0.24],
        color: "#4a3c26",
        emissive: "#ffb020",
        emissiveIntensity: 0.08,
      },
      {
        kind: "torus",
        pos: [0, 3.4, 0],
        size: [3.2, 0.15, 0],
        color: "#ffb020",
        emissive: "#ffb020",
        emissiveIntensity: 1.4,
        rot: Math.PI / 2,
      },
      ...ring(8, 9.5, (x, z, i) => ({
        kind: "box",
        pos: [x, 1.6, z],
        size: [1, 3.2, 1],
        color: "#2a2116",
        emissive: "#ffb020",
        emissiveIntensity: i % 2 ? 0.5 : 0.2,
      })),
      ...ring(5, 5.4, (x, z) => ({
        kind: "box",
        pos: [x, 0.9, z],
        size: [1.6, 1.2, 0.2],
        color: "#1d1710",
        emissive: "#ffb020",
        emissiveIntensity: 0.7,
      })),
    ],
    portals: [
      { to: "academy", pos: [-11, 10], label: "Academy" },
      { to: "adventure", pos: [11, 10], label: "Adventure Zone" },
      { to: "city", pos: [0, 12.5], label: "Digital City" },
    ],
  },
  {
    id: "adventure",
    name: "Adventure Zone",
    blurb: "Open terrain full of quests, crystals and hidden challenges.",
    accent: "#a468ff",
    sky: "#0a0518",
    ground: "#2b2340",
    groundTextured: false,
    radius: 16,
    walls: false,
    banner: "ADVENTURE ZONE",
    bannerSub: "Explore. Collect. Level up your Guardian.",
    npcs: ["lex"],
    props: [
      ...ring(9, 12, (x, z, i) => ({
        kind: "cone",
        pos: [x, 2.4, z],
        size: [2.2, 4.8, 0],
        color: "#241b3a",
        emissive: "#a468ff",
        emissiveIntensity: i % 3 === 0 ? 0.5 : 0.15,
      })),
      ...ring(6, 6, (x, z) => ({
        kind: "cone",
        pos: [x, 1.1, z],
        size: [0.7, 2.2, 0],
        color: "#3b2a63",
        emissive: "#c084fc",
        emissiveIntensity: 1.1,
      })),
      {
        kind: "sphere",
        pos: [0, 3.2, 0],
        size: [1.6, 1.6, 1.6],
        color: "#1b1330",
        emissive: "#a468ff",
        emissiveIntensity: 1,
      },
      { kind: "cyl", pos: [0, 0.4, 0], size: [3, 3, 0.8], color: "#332a4d" },
    ],
    portals: [
      { to: "academy", pos: [-12, 11], label: "Academy" },
      { to: "future", pos: [12, 11], label: "Future Lab" },
    ],
  },
  {
    id: "city",
    name: "Digital City",
    blurb: "A living neon city where Guardians meet between missions.",
    accent: "#22d3ee",
    sky: "#03101a",
    ground: "#1d2a33",
    groundTextured: true,
    radius: 16,
    walls: false,
    banner: "DIGITAL CITY",
    bannerSub: "Meet other Guardians. Watch what you share.",
    npcs: ["echo", "nova"],
    props: [
      ...grid([-12, -6, 6, 12], [-12, -6, 6, 12], (x, z) => ({
        kind: "box",
        pos: [x, 4, z],
        size: [3.4, 8, 3.4],
        color: "#0f1c26",
        emissive: "#22d3ee",
        emissiveIntensity: 0.35,
      })),
      ...grid([-12, -6, 6, 12], [-12, -6, 6, 12], (x, z) => ({
        kind: "box",
        pos: [x, 8.4, z],
        size: [1, 1.2, 1],
        color: "#0b141c",
        emissive: "#f472b6",
        emissiveIntensity: 0.9,
      })),
      {
        kind: "cyl",
        pos: [0, 0.06, 0],
        size: [7, 7, 0.12],
        color: "#16232c",
        emissive: "#22d3ee",
        emissiveIntensity: 0.05,
      },
      {
        kind: "torus",
        pos: [0, 0.18, 0],
        size: [5, 0.1, 0],
        color: "#22d3ee",
        emissive: "#22d3ee",
        emissiveIntensity: 0.8,
        rot: Math.PI / 2,
      },
    ],
    portals: [
      { to: "missions", pos: [0, 13], label: "Mission Hub" },
      { to: "future", pos: [13, 6], label: "Future Lab" },
    ],
  },
  {
    id: "future",
    name: "Future Lab",
    blurb: "Prototype tomorrow's tech with Jacob in the zero-gravity lab.",
    accent: "#f472b6",
    sky: "#100518",
    ground: "#2f2536",
    groundTextured: false,
    radius: 12,
    walls: true,
    banner: "FUTURE LAB",
    bannerSub: "Build it, test it, break it, build it better.",
    npcs: ["byte", "lex"],
    props: [
      ...ring(4, 6.5, (x, z) => ({
        kind: "cyl",
        pos: [x, 1.4, z],
        size: [1.1, 1.1, 2.8],
        color: "#241a2c",
        emissive: "#f472b6",
        emissiveIntensity: 0.7,
      })),
      ...ring(4, 6.5, (x, z) => ({
        kind: "sphere",
        pos: [x, 3.4, z],
        size: [0.9, 0.9, 0.9],
        color: "#160f1c",
        emissive: "#f9a8d4",
        emissiveIntensity: 1.1,
      })),
      {
        kind: "box",
        pos: [0, 0.5, 0],
        size: [6, 1, 3],
        color: "#3a2c42",
        emissive: "#f472b6",
        emissiveIntensity: 0.25,
      },
      {
        kind: "torus",
        pos: [0, 2.8, -6],
        size: [2.4, 0.18, 0],
        color: "#f472b6",
        emissive: "#f472b6",
        emissiveIntensity: 1.3,
      },
    ],
    portals: [
      { to: "adventure", pos: [-9, 9], label: "Adventure Zone" },
      { to: "city", pos: [9, 9], label: "Digital City" },
    ],
  },
];

export const ZONE_MAP: Record<string, Zone> = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export function getZone(id: string): Zone {
  return ZONE_MAP[id] ?? (ZONES[0] as Zone);
}
