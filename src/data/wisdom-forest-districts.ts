export interface ForestDistrictInfo {
  id: string;
  name: string;
  pos: [number, number, number];
  description: string;
  activityName?: string;
  activityKey?: string;
  status: "unlocked" | "completed" | "locked";
  icon: string;
}

export const WISDOM_FOREST_DISTRICTS: ForestDistrictInfo[] = [
  {
    id: "arrival-grove",
    name: "1. Arrival Grove",
    pos: [0, 0, 24],
    description: "Forest overlook introduction area with Lex's welcome and movement tutorial.",
    activityName: "Knowledge Seed Rescue",
    activityKey: "seed-rescue",
    status: "unlocked",
    icon: "🌱",
  },
  {
    id: "evidence-trail",
    name: "2. Evidence Trail",
    pos: [-18, 0, 14],
    description: "Branching forest path comparing clues, facts, observations, and assumptions.",
    activityName: "Evidence Classifier",
    activityKey: "evidence-trail",
    status: "unlocked",
    icon: "🔍",
  },
  {
    id: "pattern-canopy",
    name: "3. Pattern Canopy",
    pos: [-24, 6, -8],
    description: "Elevated tree bridges with visual sequences, logic puzzles, and memory challenges.",
    activityName: "Pattern Grove & Memory Canopy",
    activityKey: "pattern-grove",
    status: "unlocked",
    icon: "🧩",
  },
  {
    id: "ecosystem-gardens",
    name: "4. Ecosystem Gardens",
    pos: [18, 0, 14],
    description: "Glass botanical domes for habitat restoration, species sorting, and balance.",
    activityName: "Ecosystem Balance",
    activityKey: "ecosystem-balance",
    status: "unlocked",
    icon: "🌿",
  },
  {
    id: "research-treehouses",
    name: "5. Research Treehouses",
    pos: [24, 8, -8],
    description: "Connected treehouse labs comparing research sources and testing hypotheses.",
    activityName: "Research Station & Source Signal",
    activityKey: "research-station",
    status: "unlocked",
    icon: "🔬",
  },
  {
    id: "waterfall-archives",
    name: "6. Waterfall Archives",
    pos: [0, 2, -28],
    description: "Hidden luminous caves behind waterfalls containing knowledge crystals.",
    activityName: "Source Signal Hunt",
    activityKey: "source-signal",
    status: "unlocked",
    icon: "🌊",
  },
  {
    id: "tree-sanctuary",
    name: "7. Tree of Wisdom Sanctuary",
    pos: [0, 0, 0],
    description: "The central core around the ancient Tree of Wisdom hosting the final mastery challenge.",
    activityName: "Wisdom Mastery Challenge",
    activityKey: "wisdom-mastery",
    status: "unlocked",
    icon: "🌳",
  },
];
