export interface WorldPortalSpec {
  id: string;
  targetWorldId: string;
  targetRoute: string;
  label: string;
  pos: [number, number, number];
}

export interface WorldDistrictSpec {
  id: string;
  name: string;
  pos: [number, number, number];
  description: string;
  activityKey?: string;
  activityName?: string;
  status: "unlocked" | "completed" | "locked";
  icon: string;
}

export interface WorldSpec {
  id: string;
  slug: string;
  displayName: string;
  route: string;
  status: "active" | "coming_soon" | "locked";
  requiredLevel: number;
  requiredClasses: string[];
  conceptAsset: string;
  entrySpawn: [number, number, number];
  leadGuardian: string;
  description: string;
  districts: WorldDistrictSpec[];
  portals: WorldPortalSpec[];
}

export const WORLD_REGISTRY: Record<string, WorldSpec> = {
  "nyrava-guardian-realm": {
    id: "nyrava-guardian-realm",
    slug: "nyrava-guardian-realm",
    displayName: "Nyrava Guardian Realm",
    route: "/realm",
    status: "active",
    requiredLevel: 1,
    requiredClasses: [],
    conceptAsset: "media_1788489263906.jpg",
    entrySpawn: [0, 0, 18],
    leadGuardian: "lex",
    description: "The child's primary, expandable, persistent Guardian Realm combining nature, tech, and AI learning.",
    districts: [
      { id: "arrival-meadow", name: "Arrival Meadow", pos: [0, 0, 18], description: "Plaza arrival overlook & pathway entrance.", status: "unlocked", icon: "🌱" },
      { id: "waterfall-clearing", name: "Waterfall Clearing", pos: [-18, 0, -12], description: "Cascading waterfall clearing for treehouses and water structures.", activityKey: "realm-treehouse", activityName: "Waterfall Treehouse Builder", status: "unlocked", icon: "🌊" },
      { id: "river-bend", name: "River Bend Meadow", pos: [18, 0, 12], description: "Lush meadow by the river for gardens and wooden bridges.", activityKey: "realm-bridge", activityName: "River Eco Bridge", status: "unlocked", icon: "🌿" },
      { id: "forest-clearing", name: "Forest Grove Clearing", pos: [-22, 0, 14], description: "Shaded clearing for workshops and companion havens.", activityKey: "realm-workshop", activityName: "Guardian Workshop", status: "unlocked", icon: "🌳" },
      { id: "mountain-overlook", name: "Mountain Overlook", pos: [22, 0, -14], description: "High ridge for security towers and privacy scanners.", activityKey: "realm-scanner", activityName: "Privacy Shield Scanner", status: "unlocked", icon: "🏔️" },
      { id: "hq-plateau", name: "Central Guardian Plateau", pos: [0, 0, 0], description: "Primary plateau for the AI Learning Lab and Master Guardian HQ.", activityKey: "realm-ai-lab", activityName: "AI Learning Lab", status: "unlocked", icon: "🏰" },
    ],
    portals: [],
  },
  "isla-central": {
    id: "isla-central",
    slug: "isla-central",
    displayName: "Isla Central Hub",
    route: "/world/isla-central",
    status: "active",
    requiredLevel: 1,
    requiredClasses: [],
    conceptAsset: "media_1788485548906.jpg",
    entrySpawn: [0, 0, 18],
    leadGuardian: "lex",
    description: "The primary central island hub connecting all worlds of the Nyrava archipelago.",
    districts: [
      { id: "arrival-plaza", name: "Arrival Plaza", pos: [0, 0, 18], description: "Welcome plaza with World Map exit and portals.", status: "unlocked", icon: "🛬" },
      { id: "academy-gateway", name: "Academy Gateway", pos: [-18, 0, 8], description: "Entrance to interactive AI classrooms.", activityKey: "academy", activityName: "AI Academy", status: "unlocked", icon: "🎓" },
      { id: "mission-gateway", name: "Mission Hub Gateway", pos: [18, 0, 8], description: "Gateway to digital citizenship missions.", activityKey: "missions", activityName: "Mission Hub", status: "unlocked", icon: "🎯" },
      { id: "builder-gateway", name: "Builder District", pos: [18, 0, -12], description: "Portal to the AI World Builder.", activityKey: "builder", activityName: "AI Builder", status: "unlocked", icon: "🛠️" },
      { id: "home-gateway", name: "Home HQ Route", pos: [-18, 0, -12], description: "Pathway leading to Guardian Home HQ.", activityKey: "home-hq", activityName: "Home HQ", status: "unlocked", icon: "🏠" },
      { id: "central-spire", name: "Central Guardian Tower", pos: [0, 0, 0], description: "Central emblem spire with energy core.", status: "unlocked", icon: "🏰" },
    ],
    portals: [
      { id: "portal-city", targetWorldId: "central-city", targetRoute: "/world/central-city", label: "Central City Portal", pos: [12, 0, 18] },
      { id: "portal-forest", targetWorldId: "wisdom-forest", targetRoute: "/world/wisdom-forest", label: "Wisdom Forest Portal", pos: [-12, 0, 18] },
      { id: "portal-history", targetWorldId: "history-valley", targetRoute: "/world/history-valley", label: "History Valley Portal", pos: [-22, 0, 0] },
      { id: "portal-mountains", targetWorldId: "knowledge-mountains", targetRoute: "/world/knowledge-mountains", label: "Knowledge Mountains Portal", pos: [22, 0, 0] },
      { id: "portal-ocean", targetWorldId: "infinite-ocean", targetRoute: "/world/infinite-ocean", label: "Infinite Ocean Portal", pos: [-16, 0, -22] },
      { id: "portal-space", targetWorldId: "space-zone", targetRoute: "/world/space-zone", label: "Space Zone Portal", pos: [16, 0, -22] },
    ],
  },
  "central-city": {
    id: "central-city",
    slug: "central-city",
    displayName: "Digital Central City",
    route: "/world/central-city",
    status: "active",
    requiredLevel: 1,
    requiredClasses: [],
    conceptAsset: "media_1788486892466.jpg",
    entrySpawn: [0, 0, 18],
    leadGuardian: "lex",
    description: "Living neon digital metropolis for cyber safety, phishing detective, and password labs.",
    districts: [
      { id: "arrival-plaza", name: "Arrival Plaza", pos: [0, 0, 18], description: "Plaza welcome station.", status: "unlocked", icon: "🛬" },
      { id: "digital-safety", name: "Digital Safety Training", pos: [-16, 0, 12], description: "Phishing detective terminals.", activityKey: "phishing-detective", activityName: "Phishing Detective", status: "unlocked", icon: "🔍" },
      { id: "academy-district", name: "Academy District", pos: [-22, 0, -6], description: "Password power lab.", activityKey: "password-lab", activityName: "Password Power Lab", status: "unlocked", icon: "🔑" },
      { id: "mission-hub", name: "Mission Hub District", pos: [16, 0, 12], description: "Scenario terminals.", activityKey: "missions", activityName: "Mission Scenarios", status: "unlocked", icon: "🎯" },
      { id: "builder-lab", name: "Builder Lab District", pos: [22, 0, -6], description: "Privacy sorting station.", activityKey: "privacy-sort", activityName: "Privacy Sort Station", status: "unlocked", icon: "🛠️" },
      { id: "guardian-gardens", name: "Guardian Gardens", pos: [-14, 0, -20], description: "Safe messaging dialogue.", activityKey: "safe-messaging", activityName: "Safe Messaging", status: "unlocked", icon: "🌿" },
      { id: "portal-concourse", name: "Portal Concourse", pos: [14, 0, -20], description: "Inter-world transport hub.", status: "unlocked", icon: "🌀" },
      { id: "central-tower", name: "Central Nyrava Tower", pos: [0, 0, 0], description: "Guardian tower climax challenge.", activityKey: "tower-challenge", activityName: "Guardian Tower Challenge", status: "unlocked", icon: "🏰" },
    ],
    portals: [
      { id: "portal-hub", targetWorldId: "isla-central", targetRoute: "/world/isla-central", label: "Return to Isla Central Hub", pos: [0, 0, 22] },
    ],
  },
  "wisdom-forest": {
    id: "wisdom-forest",
    slug: "wisdom-forest",
    displayName: "Wisdom Forest",
    route: "/world/wisdom-forest",
    status: "active",
    requiredLevel: 1,
    requiredClasses: ["sf-1"],
    conceptAsset: "media_1788487197301.jpg",
    entrySpawn: [0, 0, 24],
    leadGuardian: "lex",
    description: "Ancient forest surrounding the Tree of Wisdom for scientific research and evidence evaluation.",
    districts: [
      { id: "arrival-grove", name: "Arrival Grove", pos: [0, 0, 24], description: "Forest introduction area.", activityKey: "seed-rescue", activityName: "Knowledge Seed Rescue", status: "unlocked", icon: "🌱" },
      { id: "evidence-trail", name: "Evidence Trail", pos: [-18, 0, 14], description: "Branching evidence path.", activityKey: "evidence-trail", activityName: "Evidence Classifier", status: "unlocked", icon: "🔍" },
      { id: "pattern-canopy", name: "Pattern Canopy", pos: [-24, 0, -8], description: "Elevated tree bridges.", activityKey: "pattern-grove", activityName: "Pattern Grove", status: "unlocked", icon: "🧩" },
      { id: "ecosystem-gardens", name: "Ecosystem Gardens", pos: [18, 0, 14], description: "Glass botanical domes.", activityKey: "ecosystem-balance", activityName: "Ecosystem Balance", status: "unlocked", icon: "🌿" },
      { id: "research-treehouses", name: "Research Treehouses", pos: [24, 0, -8], description: "Treehouse labs.", activityKey: "research-station", activityName: "Research Station", status: "unlocked", icon: "🔬" },
      { id: "waterfall-archives", name: "Waterfall Archives", pos: [0, 0, -28], description: "Hidden waterfall caves.", activityKey: "source-signal", activityName: "Source Signal Hunt", status: "unlocked", icon: "🌊" },
      { id: "tree-sanctuary", name: "Tree of Wisdom Sanctuary", pos: [0, 0, 0], description: "Central climax area.", activityKey: "wisdom-mastery", activityName: "Wisdom Mastery Challenge", status: "unlocked", icon: "🌳" },
    ],
    portals: [
      { id: "portal-hub", targetWorldId: "isla-central", targetRoute: "/world/isla-central", label: "Return to Isla Central Hub", pos: [0, 0, 28] },
    ],
  },
  "history-valley": {
    id: "history-valley",
    slug: "history-valley",
    displayName: "History Valley",
    route: "/world/history-valley",
    status: "active",
    requiredLevel: 2,
    requiredClasses: ["history-1"],
    conceptAsset: "world_map.jpg",
    entrySpawn: [0, 0, 20],
    leadGuardian: "nova",
    description: "Cultural valley with ancient ruins, historical archives, and artifact preservation challenges.",
    districts: [
      { id: "valley-entrance", name: "Valley Entrance", pos: [0, 0, 20], description: "Ancient stone gateway with world portal entrance.", status: "unlocked", icon: "🏛️" },
      { id: "archives-ruins", name: "Archives Ruins", pos: [-18, 0, 12], description: "Reconstruct historical documents and ancient artifacts.", activityKey: "artifact-reconstruction", activityName: "Artifact Reconstruction", status: "unlocked", icon: "📜" },
      { id: "ancient-library", name: "Ancient Library", pos: [-22, 0, -8], description: "Sequencing historical events and primary source context.", activityKey: "timeline-decoder", activityName: "Timeline Decoder", status: "unlocked", icon: "📖" },
      { id: "cultural-amphitheater", name: "Cultural Amphitheater", pos: [18, 0, 12], description: "Historical storytelling & perspective analysis.", status: "unlocked", icon: "🎭" },
      { id: "preservation-vault", name: "Preservation Vault", pos: [22, 0, -8], description: "Distinguish authentic historical records from falsified media.", activityKey: "preservation-vault", activityName: "Preservation Vault", status: "unlocked", icon: "🏺" },
      { id: "historical-sanctuary", name: "Historical Sanctuary", pos: [0, 0, 0], description: "Climax historical analysis challenge.", activityKey: "history-mastery", activityName: "History Mastery Challenge", status: "unlocked", icon: "👑" },
    ],
    portals: [
      { id: "portal-hub", targetWorldId: "isla-central", targetRoute: "/world/isla-central", label: "Return to Isla Central Hub", pos: [0, 0, 24] },
    ],
  },
  "knowledge-mountains": {
    id: "knowledge-mountains",
    slug: "knowledge-mountains",
    displayName: "Knowledge Mountains",
    route: "/world/knowledge-mountains",
    status: "active",
    requiredLevel: 3,
    requiredClasses: ["logic-1"],
    conceptAsset: "world_map.jpg",
    entrySpawn: [0, 0, 20],
    leadGuardian: "tess",
    description: "Mountain summits featuring strategic reasoning and advanced puzzle challenges.",
    districts: [
      { id: "mountain-base", name: "Summit Base Camp", pos: [0, 0, 20], description: "Base camp overlook & portal concourse.", status: "unlocked", icon: "🏔️" },
      { id: "logic-peak", name: "Logic Peak Lab", pos: [-18, 0, 12], description: "Formal logic puzzles and multi-step deduction.", activityKey: "logic-peak", activityName: "Logic Peak Lab", status: "unlocked", icon: "🧩" },
      { id: "crystal-summit", name: "Crystal Summit", pos: [-22, 0, -8], description: "Constraint solving and decision matrix challenges.", activityKey: "strategic-matrix", activityName: "Strategic Matrix", status: "unlocked", icon: "💎" },
      { id: "observatory-ridge", name: "Observatory Ridge", pos: [18, 0, 12], description: "High-altitude critical thinking observatory.", status: "unlocked", icon: "🔭" },
      { id: "wind-ridge-lab", name: "Wind Ridge Lab", pos: [22, 0, -8], description: "Identify logical fallacies and false equivalencies.", activityKey: "fallacy-spotter", activityName: "Fallacy Spotter", status: "unlocked", icon: "💨" },
      { id: "mount-nyrava-sanctuary", name: "Mount Nyrava Sanctuary", pos: [0, 0, 0], description: "Climax strategic reasoning summit challenge.", activityKey: "mountain-mastery", activityName: "Mountain Mastery Challenge", status: "unlocked", icon: "⛰️" },
    ],
    portals: [
      { id: "portal-hub", targetWorldId: "isla-central", targetRoute: "/world/isla-central", label: "Return to Isla Central Hub", pos: [0, 0, 24] },
    ],
  },
  "infinite-ocean": {
    id: "infinite-ocean",
    slug: "infinite-ocean",
    displayName: "Infinite Ocean",
    route: "/world/infinite-ocean",
    status: "active",
    requiredLevel: 4,
    requiredClasses: ["ocean-1"],
    conceptAsset: "world_map.jpg",
    entrySpawn: [0, 0, 20],
    leadGuardian: "echo",
    description: "Crystal ocean reef for aquatic exploration, marine biology, and deep ocean discovery.",
    districts: [
      { id: "reef-harbor", name: "Reef Harbor", pos: [0, 0, 20], description: "Sub-aquatic glass arrival port dock.", status: "unlocked", icon: "🌊" },
      { id: "coral-gardens", name: "Coral Gardens", pos: [-18, 0, 12], description: "Marine biology sorting and ecosystem balance.", activityKey: "coral-restoration", activityName: "Coral Restoration", status: "unlocked", icon: "🪸" },
      { id: "bioluminescent-trench", name: "Bioluminescent Trench", pos: [-22, 0, -8], description: "Acoustic frequency analysis and deep-sea signals.", activityKey: "sonar-signal", activityName: "Sonar Signal Decoder", status: "unlocked", icon: "💡" },
      { id: "oceanography-lab", name: "Oceanography Lab", pos: [18, 0, 12], description: "Water quality testing and aquatic micro-plastic cleanup.", status: "unlocked", icon: "🔬" },
      { id: "submarine-station", name: "Submarine Station", pos: [22, 0, -8], description: "Deep sea exploration vessel terminal.", status: "unlocked", icon: "🤿" },
      { id: "abyssal-sanctuary", name: "Abyssal Sanctuary", pos: [0, 0, 0], description: "Climax marine truth research challenge.", activityKey: "ocean-mastery", activityName: "Ocean Mastery Challenge", status: "unlocked", icon: "🔱" },
    ],
    portals: [
      { id: "portal-hub", targetWorldId: "isla-central", targetRoute: "/world/isla-central", label: "Return to Isla Central Hub", pos: [0, 0, 24] },
    ],
  },
  "space-zone": {
    id: "space-zone",
    slug: "space-zone",
    displayName: "Space Zone",
    route: "/world/space-zone",
    status: "active",
    requiredLevel: 5,
    requiredClasses: ["space-1"],
    conceptAsset: "world_map.jpg",
    entrySpawn: [0, 0, 20],
    leadGuardian: "byte",
    description: "Futuristic spaceport and orbital launch complex for astronomy and zero-gravity engineering.",
    districts: [
      { id: "space-launchpad", name: "Orbital Launchpad", pos: [0, 0, 20], description: "Orbital spaceport launch concourse.", status: "unlocked", icon: "🚀" },
      { id: "zero-g-bay", name: "Zero-G Engineering Bay", pos: [-18, 0, 12], description: "Modular satellite assembly and orbital power grid.", activityKey: "satellite-repair", activityName: "Zero-G Satellite Repair", status: "unlocked", icon: "🛠️" },
      { id: "star-observatory", name: "Star Observatory", pos: [-22, 0, -8], description: "Astronomy pattern matching and stellar navigation.", activityKey: "constellation-logic", activityName: "Constellation Logic", status: "unlocked", icon: "⭐" },
      { id: "satellite-grid", name: "Cyber Satellite Grid", pos: [18, 0, 12], description: "Global cyber communications relay.", status: "unlocked", icon: "📡" },
      { id: "habitat-dome", name: "Planetary Habitat Dome", pos: [22, 0, -8], description: "Planetary life support & oxygen balance station.", status: "unlocked", icon: "🛸" },
      { id: "celestial-core", name: "Celestial Core Sanctuary", pos: [0, 0, 0], description: "Climax cosmic safety challenge.", activityKey: "space-mastery", activityName: "Space Mastery Challenge", status: "unlocked", icon: "🪐" },
    ],
    portals: [
      { id: "portal-hub", targetWorldId: "isla-central", targetRoute: "/world/isla-central", label: "Return to Isla Central Hub", pos: [0, 0, 24] },
    ],
  },
};

export function getWorldBySlug(slug: string): WorldSpec | undefined {
  return WORLD_REGISTRY[slug] || Object.values(WORLD_REGISTRY).find((w) => w.slug === slug || w.id === slug);
}

export function validateWorldRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const routes = new Set<string>();
  const ids = new Set<string>();

  for (const world of Object.values(WORLD_REGISTRY)) {
    if (ids.has(world.id)) errors.push(`Duplicate World ID: ${world.id}`);
    ids.add(world.id);

    if (routes.has(world.route)) errors.push(`Duplicate World Route: ${world.route}`);
    routes.add(world.route);

    if (!world.route.startsWith("/world/") && world.route !== "/realm") {
      errors.push(`World ${world.id} route must start with /world/ or be /realm, got ${world.route}`);
    }

    for (const portal of world.portals) {
      const target = WORLD_REGISTRY[portal.targetWorldId];
      if (!target) {
        errors.push(`World ${world.id} portal ${portal.id} targets invalid world ${portal.targetWorldId}`);
      }
    }

    // Strict validation for active worlds
    if (world.status === "active") {
      if (!world.conceptAsset) errors.push(`Active world ${world.id} is missing approved conceptAsset`);
      if (world.districts.length < 5) errors.push(`Active world ${world.id} must contain at least 5 districts, got ${world.districts.length}`);
      const playableActivities = world.districts.filter((d) => d.activityKey);
      if (playableActivities.length < 3) errors.push(`Active world ${world.id} must contain at least 3 playable activities, got ${playableActivities.length}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
