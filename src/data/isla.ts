/**
 * WORLD DATA for World 1 — Isla Central.
 * Pure data: no React, no three.js. Antigravity can swap this for a
 * server-driven world definition without touching the renderer.
 */

import { WORLD_SCALE, ws } from "@/lib/isla-terrain";

export type RegionId =
  "city" | "forest" | "mountains" | "valley" | "desert" | "beach" | "ocean" | "spaceport";

export type Region = {
  id: RegionId;
  name: string;
  tagline: string;
  center: [number, number];
  radius: number;
  accent: string;
  /** Locked regions are visible but gated behind mission progress. */
  lock?: { requires: number; label: string };
};

export const REGIONS: Region[] = [
  {
    id: "city",
    name: "Central City",
    tagline: "Command Center · Guardian Plaza · Academy",
    center: [0, 0],
    radius: 24,
    accent: "#38bdf8",
  },
  {
    id: "forest",
    name: "Forest of Wisdom",
    tagline: "Nature · Science · Life",
    center: [-44, -40],
    radius: 32,
    accent: "#22e07a",
  },
  {
    id: "mountains",
    name: "Everest Peak",
    tagline: "Summit · Logic · Mastery",
    center: [44, -46],
    radius: 34,
    accent: "#a5b4fc",
  },
  {
    id: "valley",
    name: "History Valley",
    tagline: "Culture · Art · The Past",
    center: [-26, 48],
    radius: 26,
    accent: "#fbbf24",
  },
  {
    id: "desert",
    name: "Desert Zone",
    tagline: "Grit · Survival · Ingenuity",
    center: [-58, 16],
    radius: 30,
    accent: "#f59e0b",
  },
  {
    id: "beach",
    name: "Emerald Beach",
    tagline: "Rest · Art · Culture",
    center: [30, 52],
    radius: 28,
    accent: "#2dd4bf",
  },
  {
    id: "spaceport",
    name: "Space Port",
    tagline: "Discover · Build · Dream",
    center: [62, 8],
    radius: 24,
    accent: "#c084fc",
    lock: { requires: 3, label: "Find 3 Knowledge Crystals to open the launch gate" },
  },
  {
    id: "ocean",
    name: "Infinite Ocean",
    tagline: "Adventure · Exploration · Future",
    center: [76, 70],
    radius: 26,
    accent: "#38bdf8",
    lock: { requires: 5, label: "Complete Class 1 to unlock deep-ocean diving" },
  },
];

export type ChallengeKind = "memory" | "logic" | "safety" | "observation";

export type Challenge = {
  kind: ChallengeKind;
  /** Skill recorded as mastery evidence when solved. */
  skill: string;
  prompt: string;
  options: string[];
  /** Indices into options, in the order the child must pick them. */
  answer: number[];
  /** Shown before the child answers (memory challenges flash this). */
  study?: string;
  success: string;
};

export type Crystal = {
  id: string;
  name: string;
  region: RegionId;
  position: [number, number];
  clue: string;
  hints: [string, string, string];
  challenge?: Challenge;
  guardianLine: string;
};

/** The five Knowledge Crystals of Class 1. Locations are never shown on the map. */
export const CRYSTALS: Crystal[] = [
  {
    id: "crystal-city",
    name: "Crystal of Beginnings",
    region: "city",
    position: [-15, 14],
    clue: "One crystal waits where Guardians gather but nobody looks — behind the tallest thing you see first.",
    hints: [
      "Landmarks cast shadows. Shadows hide things.",
      "The Command Center tower is the first thing you see in Central City.",
      "Walk around the back of the Command Center tower, south-west of the plaza.",
    ],
    guardianLine: "You looked behind the obvious. That is exactly how a Guardian thinks.",
  },
  {
    id: "crystal-forest",
    name: "Crystal of Roots",
    region: "forest",
    position: [-52, -54],
    clue: "One is hidden where the trees are older than the buildings, past the water that falls but the path disappears.",
    hints: [
      "Old trees grow far from the city — head north-west.",
      "Follow the forest until you hear falling water, then keep going deeper.",
      "The crystal sits in the clearing beyond the waterfall, at the far north-west edge of the forest.",
    ],
    challenge: {
      kind: "memory",
      skill: "Memory",
      prompt: "Repeat the light sequence the forest pylons just showed you.",
      study: "green · blue · green · amber",
      options: ["green", "blue", "amber"],
      answer: [0, 1, 0, 2],
      success: "Perfect recall. Memory is how explorers stay safe.",
    },
    guardianLine: "Most Guardians walk right past this clearing. You did not.",
  },
  {
    id: "crystal-mountains",
    name: "Crystal of Heights",
    region: "mountains",
    position: [46, -52],
    clue: "The third rests where the island touches the sky, guarded by three ancient symbols.",
    hints: [
      "Higher ground means a longer climb — go north-east.",
      "Climb the stepped shoulder of the mountains, not the cliff face.",
      "The observation temple at the mountain summit holds the crystal.",
    ],
    challenge: {
      kind: "logic",
      skill: "Logic",
      prompt:
        "Three symbols guard the temple. Order them: the one that gives light, the one that holds water, the one that carries a message.",
      options: ["Wave", "Sun", "Signal"],
      answer: [1, 0, 2],
      success: "Clean reasoning. You ordered it by meaning, not by guesswork.",
    },
    guardianLine: "You earned the height. Nothing up here was given away for free.",
  },
  {
    id: "crystal-valley",
    name: "Crystal of Memory",
    region: "valley",
    position: [-30, 54],
    clue: "The oldest secret on the island is not above the ground.",
    hints: [
      "Ruins remember what people forget. Look south-west.",
      "The valley floor sits lower than everything around it.",
      "Enter the sunken chamber at the centre of the History Valley ruins.",
    ],
    guardianLine: "History is not a lesson screen. You just dug it up yourself.",
  },
  {
    id: "crystal-beach",
    name: "Crystal of Tides",
    region: "beach",
    position: [38, 60],
    clue: "The last one is where the island ends and the water begins — but a stranger is waiting there too.",
    hints: [
      "Follow the coast to the south-east.",
      "Look near the docks on Emerald Beach, past the boats.",
      "It rests beside the furthest dock, right at the tideline.",
    ],
    challenge: {
      kind: "safety",
      skill: "Digital Safety",
      prompt:
        "A player you have never met messages you: 'Hey! Send me your home address and I'll mail you a free crystal.' What do you do?",
      options: [
        "Send the address — a free crystal sounds great",
        "Don't share it, and tell a trusted adult",
        "Send a fake address to be funny",
      ],
      answer: [1],
      success: "Exactly right. Never share where you live, and always tell someone you trust.",
    },
    guardianLine: "You protected yourself first, then took the reward. That is a real Guardian.",
  },
];

/** Extra discoveries that are not required, but reward curiosity. */
export type Secret = {
  id: string;
  name: string;
  region: RegionId;
  position: [number, number];
  note: string;
};

export const SECRETS: Secret[] = [
  {
    id: "secret-book",
    name: "Ancient Book",
    region: "valley",
    position: [-18, 41],
    note: "A book written before the city existed.",
  },
  {
    id: "secret-tech",
    name: "Technology Piece",
    region: "desert",
    position: [-64, 8],
    note: "A Nyrava component half-buried in the dunes.",
  },
  {
    id: "secret-key",
    name: "Guardian Key",
    region: "mountains",
    position: [34, -34],
    note: "Old metal, still warm. Something this opens.",
  },
  {
    id: "secret-map",
    name: "Torn Map",
    region: "forest",
    position: [-33, -25],
    note: "Half a map. The other half is somewhere on Isla Central.",
  },
  {
    id: "secret-shell",
    name: "Signal Shell",
    region: "beach",
    position: [21, 47],
    note: "Hold it to your ear and you hear Nyrava code.",
  },
];

/** The final report challenge, asked when the child returns to the Academy. */
export const REPORT_CHALLENGE: Challenge = {
  kind: "observation",
  skill: "Observation",
  prompt:
    "Before you report in: which region of Isla Central sits at the highest point of the island?",
  options: ["Emerald Beach", "Everest Peak", "History Valley"],
  answer: [1],
  success: "You were paying attention while you explored. That is the whole skill.",
};

export const ACADEMY_DOOR: [number, number] = [0, -18];
export const COMMAND_CENTER: [number, number] = [0, 0];

/* ---------------------------------------------------------------- world scale
 * Regions, crystals and secrets above are authored in design units. The
 * renderer works in world units, so lift them once at module load. */
for (const region of REGIONS) {
  region.center = ws(region.center);
  region.radius *= WORLD_SCALE;
}
for (const crystal of CRYSTALS) {
  crystal.position = ws(crystal.position);
}
for (const secret of SECRETS) {
  secret.position = ws(secret.position);
}
ACADEMY_DOOR[0] *= WORLD_SCALE;
ACADEMY_DOOR[1] *= WORLD_SCALE;
COMMAND_CENTER[0] *= WORLD_SCALE;
COMMAND_CENTER[1] *= WORLD_SCALE;
