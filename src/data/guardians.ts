import type { CosmeticSlot, Guardian, GuardianId } from "@/types";
import lexImg from "@/assets/guardians/lex.png";
import novaImg from "@/assets/guardians/nova.png";
import zoeyImg from "@/assets/guardians/zoey.png";
import jacobImg from "@/assets/guardians/jacob.png";
import dayanaImg from "@/assets/guardians/dayana.png";
import sarahImg from "@/assets/guardians/sarah.png";
import tessImg from "@/assets/guardians/zoey.png";
import byteImg from "@/assets/guardians/jacob.png";
import echoImg from "@/assets/guardians/dayana.png";

export const GUARDIAN_IMAGES: Record<string, string> = {
  lex: lexImg,
  nova: novaImg,
  zoey: zoeyImg,
  zoe: zoeyImg,
  jacob: jacobImg,
  dayana: dayanaImg,
  sarah: sarahImg,
  tess: tessImg,
  byte: byteImg,
  echo: echoImg,
};

export const GUARDIANS: Guardian[] = [
  {
    id: "lex",
    name: "Lex",
    role: "The Analyst",
    tagline: "Sees patterns others miss. Data is his superpower.",
    visualTheme: "guardian-lex",
    level: 12,
    masterySummary: "Pattern recognition and critical thinking specialist.",
    equippedCosmetics: { hoodie: "neon-green", hair: "spike" },
  },
  {
    id: "nova",
    name: "Nova",
    role: "The Investigator",
    tagline: "Asks the right questions. Finds the truth everywhere.",
    visualTheme: "guardian-nova",
    level: 11,
    masterySummary: "Research, verification and source-checking expert.",
    equippedCosmetics: { hoodie: "violet", hair: "ponytail" },
  },
  {
    id: "zoey",
    name: "Zoe",
    role: "The Protector",
    tagline: "Shields up. Keeps you and your friends safe online.",
    visualTheme: "guardian-tess",
    level: 13,
    masterySummary: "Privacy defense and safety-shield mastery.",
    equippedCosmetics: { hoodie: "azure", hair: "curls" },
  },
  {
    id: "jacob",
    name: "Jacob",
    role: "The Builder",
    tagline: "Turns ideas into real things. Code is his toolbox.",
    visualTheme: "guardian-byte",
    level: 10,
    masterySummary: "Creative building and problem-construction skills.",
    equippedCosmetics: { glasses: "round", hoodie: "amber" },
  },
  {
    id: "dayana",
    name: "Dayana",
    role: "The Communicator",
    tagline: "Connects people. Kindness travels far with Dayana.",
    visualTheme: "guardian-echo",
    level: 12,
    masterySummary: "Digital kindness and clear communication mastery.",
    equippedCosmetics: { hat: "beanie", hoodie: "sky" },
  },
  {
    id: "sarah",
    name: "Sarah",
    role: "Security Specialist",
    tagline: "Your AI guide, helper and learning companion.",
    visualTheme: "guardian-echo",
    level: 15,
    masterySummary: "AI safety guidance and real-time support.",
    equippedCosmetics: { hoodie: "sky" },
  },
];

export const COSMETIC_SLOTS: CosmeticSlot[] = [
  {
    id: "hair",
    label: "Hair",
    options: [
      { id: "spike", label: "Spike", swatch: "oklch(0.25 0.03 270)" },
      { id: "ponytail", label: "Ponytail", swatch: "oklch(0.45 0.2 300)" },
      { id: "curls", label: "Curls", swatch: "oklch(0.5 0.1 60)" },
      { id: "short", label: "Short", swatch: "oklch(0.35 0.06 40)" },
      { id: "mohawk", label: "Mohawk", swatch: "oklch(0.7 0.2 150)" },
    ],
  },
  {
    id: "hair-color",
    label: "Hair Color",
    options: [
      { id: "midnight", label: "Midnight", swatch: "oklch(0.22 0.04 270)" },
      { id: "violet", label: "Violet", swatch: "oklch(0.5 0.22 305)" },
      { id: "copper", label: "Copper", swatch: "oklch(0.55 0.13 55)" },
      { id: "teal", label: "Teal", swatch: "oklch(0.65 0.13 200)" },
      { id: "storm", label: "Storm", swatch: "oklch(0.7 0.02 250)" },
    ],
  },
  {
    id: "skin",
    label: "Skin",
    options: [
      { id: "light", label: "Light", swatch: "oklch(0.85 0.06 75)" },
      { id: "tan", label: "Tan", swatch: "oklch(0.72 0.09 65)" },
      { id: "bronze", label: "Bronze", swatch: "oklch(0.58 0.1 60)" },
      { id: "deep", label: "Deep", swatch: "oklch(0.42 0.08 55)" },
    ],
  },
  {
    id: "eyes",
    label: "Eyes",
    options: [
      { id: "brown", label: "Brown", swatch: "oklch(0.45 0.09 60)" },
      { id: "blue", label: "Blue", swatch: "oklch(0.65 0.15 240)" },
      { id: "green", label: "Green", swatch: "oklch(0.65 0.16 150)" },
      { id: "amber", label: "Amber", swatch: "oklch(0.72 0.14 80)" },
    ],
  },
  {
    id: "face-accessory",
    label: "Face Accessory",
    options: [
      { id: "none", label: "None", swatch: "oklch(0.4 0.04 260)" },
      { id: "star-paint", label: "Star Paint", swatch: "oklch(0.85 0.17 92)" },
      { id: "tech-visor", label: "Tech Visor", swatch: "oklch(0.8 0.15 200)" },
      { id: "headphones", label: "Headphones", swatch: "oklch(0.6 0.18 300)" },
    ],
  },
  {
    id: "glasses",
    label: "Glasses",
    options: [
      { id: "none", label: "None", swatch: "oklch(0.4 0.04 260)" },
      { id: "round", label: "Round", swatch: "oklch(0.3 0.03 265)" },
      { id: "square", label: "Square", swatch: "oklch(0.55 0.15 200)" },
      { id: "visor", label: "Visor", swatch: "oklch(0.75 0.18 150)" },
    ],
  },
  {
    id: "hat",
    label: "Hat",
    options: [
      { id: "none", label: "None", swatch: "oklch(0.4 0.04 260)" },
      { id: "beanie", label: "Beanie", swatch: "oklch(0.55 0.15 230)" },
      { id: "cap", label: "Cap", swatch: "oklch(0.6 0.18 150)" },
      { id: "hood", label: "Hood", swatch: "oklch(0.5 0.2 305)" },
    ],
  },
  {
    id: "hoodie",
    label: "Hoodie",
    options: [
      { id: "neon-green", label: "Neon Green", swatch: "oklch(0.84 0.23 150)" },
      { id: "violet", label: "Violet", swatch: "oklch(0.6 0.22 305)" },
      { id: "azure", label: "Azure", swatch: "oklch(0.6 0.15 235)" },
      { id: "amber", label: "Amber", swatch: "oklch(0.8 0.16 85)" },
      { id: "sky", label: "Sky", swatch: "oklch(0.7 0.13 215)" },
    ],
  },
  {
    id: "jacket",
    label: "Jacket",
    options: [
      { id: "none", label: "None", swatch: "oklch(0.4 0.04 260)" },
      { id: "bomber", label: "Bomber", swatch: "oklch(0.35 0.05 265)" },
      { id: "racer", label: "Racer", swatch: "oklch(0.6 0.14 230)" },
      { id: "explorer", label: "Explorer", swatch: "oklch(0.65 0.13 85)" },
    ],
  },
];

export const HOME_DECOR_SLOTS: CosmeticSlot[] = [
  {
    id: "walls",
    label: "Walls",
    options: [
      { id: "deep-space", label: "Deep Space", swatch: "oklch(0.24 0.06 268)" },
      { id: "nebula", label: "Nebula", swatch: "oklch(0.32 0.1 300)" },
      { id: "circuit", label: "Circuit", swatch: "oklch(0.3 0.09 160)" },
      { id: "sunset", label: "Sunset Bay", swatch: "oklch(0.42 0.12 40)" },
    ],
  },
  {
    id: "floor",
    label: "Floor",
    options: [
      { id: "metal", label: "Metal Grid", swatch: "oklch(0.35 0.03 255)" },
      { id: "wood", label: "Warm Wood", swatch: "oklch(0.45 0.09 60)" },
      { id: "glow-tile", label: "Glow Tile", swatch: "oklch(0.3 0.1 200)" },
    ],
  },
  {
    id: "bed",
    label: "Bed",
    options: [
      { id: "pod", label: "Sleep Pod", swatch: "oklch(0.55 0.15 230)" },
      { id: "bunk", label: "Bunk", swatch: "oklch(0.5 0.08 260)" },
      { id: "hammock", label: "Hammock", swatch: "oklch(0.7 0.14 85)" },
    ],
  },
  {
    id: "desk",
    label: "Desk",
    options: [
      { id: "command", label: "Command Desk", swatch: "oklch(0.4 0.08 240)" },
      { id: "workbench", label: "Workbench", swatch: "oklch(0.5 0.1 70)" },
      { id: "holo", label: "Holo Desk", swatch: "oklch(0.65 0.15 200)" },
    ],
  },
  {
    id: "computer",
    label: "Computer",
    options: [
      { id: "dual-screen", label: "Dual Screen", swatch: "oklch(0.7 0.15 200)" },
      { id: "laptop", label: "Laptop", swatch: "oklch(0.6 0.04 260)" },
      { id: "tower", label: "Tower Rig", swatch: "oklch(0.55 0.18 300)" },
    ],
  },
  {
    id: "screen",
    label: "Screens",
    options: [
      { id: "wall-screen", label: "Wall Screen", swatch: "oklch(0.75 0.15 200)" },
      { id: "projector", label: "Projector", swatch: "oklch(0.7 0.15 300)" },
      { id: "none", label: "None", swatch: "oklch(0.4 0.04 260)" },
    ],
  },
  {
    id: "bookshelf",
    label: "Bookshelf",
    options: [
      { id: "archive", label: "Archive Shelf", swatch: "oklch(0.5 0.08 70)" },
      { id: "data-core", label: "Data Core", swatch: "oklch(0.6 0.16 160)" },
      { id: "none", label: "None", swatch: "oklch(0.4 0.04 260)" },
    ],
  },
  {
    id: "poster",
    label: "Poster",
    options: [
      { id: "guardian-crest", label: "Guardian Crest", swatch: "oklch(0.7 0.15 200)" },
      { id: "galaxy", label: "Galaxy Map", swatch: "oklch(0.55 0.18 300)" },
      { id: "code-art", label: "Code Art", swatch: "oklch(0.7 0.18 150)" },
    ],
  },
];

/**
 * Legacy roster ids (tess/byte/echo) still live in mock content and old saves.
 * Map them onto the current roster so lookups never return undefined.
 */
export const GUARDIAN_ALIASES: Record<string, GuardianId> = {
  tess: "zoey",
  zoe: "zoey",
  byte: "jacob",
  echo: "dayana",
};

export function resolveGuardianId(id: string | null | undefined): GuardianId {
  if (!id) return "zoey";
  const alias = GUARDIAN_ALIASES[id];
  if (alias) return alias;
  return (GUARDIANS.find((g) => g.id === id)?.id ?? "zoey") as GuardianId;
}

/** Always returns a Guardian — falls back to Zoe for unknown/legacy ids. */
export function resolveGuardian(id: string | null | undefined): Guardian {
  const resolved = resolveGuardianId(id);
  return (GUARDIANS.find((g) => g.id === resolved) ?? GUARDIANS[0]) as Guardian;
}
