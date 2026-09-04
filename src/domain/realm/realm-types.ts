export type GuardianTier = 1 | 2 | 3 | 4 | 5;

export interface GuardianTierInfo {
  tier: GuardianTier;
  title: string;
  minLevel: number;
  minXp: number;
  description: string;
  unlockedFeatures: string[];
}

export const GUARDIAN_TIERS: Record<GuardianTier, GuardianTierInfo> = {
  1: {
    tier: 1,
    title: "New Guardian",
    minLevel: 1,
    minXp: 0,
    description: "Natural landscape with trees, river, lake, basic paths, and starter clearing.",
    unlockedFeatures: ["Starter Shelter", "Natural Path", "Small Lake", "River Overlook"],
  },
  2: {
    tier: 2,
    title: "Developing Guardian",
    minLevel: 2,
    minXp: 1000,
    description: "Expanded realm with tree houses, wooden bridges, gardens, animals, and path lighting.",
    unlockedFeatures: ["Tree House", "Wooden Bridge", "Flower Garden", "Path Lanterns", "Animal Haven"],
  },
  3: {
    tier: 3,
    title: "Digital Defender",
    minLevel: 3,
    minXp: 2500,
    description: "Defensive tech upgrades including Guardian workshop, privacy scanners, and security towers.",
    unlockedFeatures: ["Guardian Workshop", "Privacy Shield Scanner", "Security Tower", "Companion Robot Base"],
  },
  4: {
    tier: 4,
    title: "AI Guardian",
    minLevel: 4,
    minXp: 5000,
    description: "Advanced AI infrastructure with AI Learning Lab, holograms, intelligent drones, and energy systems.",
    unlockedFeatures: ["AI Learning Lab", "Holographic Projection Ring", "Intelligent Drone Dock", "Energy Conduit"],
  },
  5: {
    tier: 5,
    title: "Master Guardian",
    minLevel: 5,
    minXp: 10000,
    description: "Transformative Master HQ, advanced research complex, legendary creatures, aurora sky, and portals.",
    unlockedFeatures: ["Master Guardian HQ", "Advanced AI Research Complex", "Aurora Sky Effect", "Realm Portal"],
  },
};

export type BuildableZoneId =
  | "waterfall-clearing"
  | "river-bend"
  | "forest-clearing"
  | "mountain-overlook"
  | "hq-plateau";

export interface BuildableZone {
  id: BuildableZoneId;
  name: string;
  pos: [number, number, number];
  requiredTier: GuardianTier;
  description: string;
}

export const BUILDABLE_ZONES: BuildableZone[] = [
  {
    id: "waterfall-clearing",
    name: "Waterfall Clearing",
    pos: [-18, 0, -12],
    requiredTier: 1,
    description: "Scenic area beside the cascading waterfall for tree houses and water structures.",
  },
  {
    id: "river-bend",
    name: "River Bend Meadow",
    pos: [18, 0, 12],
    requiredTier: 1,
    description: "Lush meadow by the river for gardens, bridges, and starter shelters.",
  },
  {
    id: "forest-clearing",
    name: "Forest Grove Clearing",
    pos: [-22, 0, 14],
    requiredTier: 2,
    description: "Shaded clearing suitable for workshops and companion animal havens.",
  },
  {
    id: "mountain-overlook",
    name: "Mountain Overlook",
    pos: [22, 0, -14],
    requiredTier: 3,
    description: "High elevation ridge for security towers and privacy scanners.",
  },
  {
    id: "hq-plateau",
    name: "Central Guardian Plateau",
    pos: [0, 0, 0],
    requiredTier: 4,
    description: "Primary plateau for the AI Learning Lab and Master Guardian Headquarters.",
  },
];

export interface PlacedStructure {
  id: string;
  kind: string;
  name: string;
  tier: GuardianTier;
  zoneId: BuildableZoneId;
  pos: [number, number, number];
  rotY: number;
  scale: number;
  cost: number;
  placedAt: string;
}

export interface NyravaRealmState {
  worldId: "nyrava-guardian-realm";
  tier: GuardianTier;
  xp: number;
  points: number;
  placedStructures: PlacedStructure[];
  unlockedZones: BuildableZoneId[];
  lastVisitedAt: string;
}
