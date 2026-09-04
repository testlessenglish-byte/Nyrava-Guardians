import type { ShieldLevel } from "@/components/badges/NyravaShieldSvg";

export interface ShieldStats {
  defense: number;
  safety: number;
  threat: number;
  courage: number;
}

export interface ShieldDefinition {
  id: string;
  code: string;
  level: ShieldLevel;
  name: { en: string; es: string };
  description: { en: string; es: string };
  unlockType: "class_milestone" | "capstone";
  requiredCompletedClasses: number;
  stats: ShieldStats;
  perkLabel: { en: string; es: string };
  perkType: "real_xp_multiplier" | "cosmetic";
  xpMultiplierBonus: number; // e.g. 0, 0.15, 0.25, 0.50
  displayOrder: number;
  status: "active" | "archived";
  version: number;
}

export interface LearnerBadgeRecord {
  id: string;
  learnerUserId: string;
  badgeId: string;
  qualifyingCompletionId?: string | undefined;
  status: "earned" | "revoked" | "restored";
  earnedAt: string;
  revokedAt?: string | undefined;
  restoredAt?: string | undefined;
  revocationReason?: string | undefined;
  restorationReason?: string | undefined;
  actorId?: string | undefined;
  ruleVersion: number;
}

export interface ShieldProgressionSummary {
  currentLevel: ShieldLevel | 0;
  currentShield: ShieldDefinition | null;
  activeBadges: LearnerBadgeRecord[];
  totalCompletedClasses: number;
  nextShield: ShieldDefinition | null;
  classesUntilNextShield: number;
  progressPercentage: number;
  xpMultiplier: number;
  calloutMessage: { en: string; es: string };
}

// Configurable Default 7-Shield Catalog
export const DEFAULT_SHIELD_DEFINITIONS: ShieldDefinition[] = [
  {
    id: "basic-shield",
    code: "BASIC_SHIELD",
    level: 1,
    name: { en: "Basic Shield", es: "Escudo Básico" },
    description: { en: "Awarded upon successfully completing your 1st class.", es: "Otorgado al completar con éxito tu 1ª clase." },
    unlockType: "class_milestone",
    requiredCompletedClasses: 1,
    stats: { defense: 5, safety: 5, threat: 5, courage: 5 },
    perkLabel: { en: "Access to New Areas (Cosmetic)", es: "Acceso a nuevas áreas (Cosmético)" },
    perkType: "cosmetic",
    xpMultiplierBonus: 0,
    displayOrder: 1,
    status: "active",
    version: 1,
  },
  {
    id: "protector-shield",
    code: "PROTECTOR_SHIELD",
    level: 2,
    name: { en: "Protector Shield", es: "Escudo Protector" },
    description: { en: "Awarded after completing 3 classes.", es: "Otorgado tras completar 3 clases." },
    unlockType: "class_milestone",
    requiredCompletedClasses: 3,
    stats: { defense: 15, safety: 15, threat: 10, courage: 10 },
    perkLabel: { en: "Stronger Defense (Cosmetic)", es: "Mayor Defensa (Cosmético)" },
    perkType: "cosmetic",
    xpMultiplierBonus: 0,
    displayOrder: 2,
    status: "active",
    version: 1,
  },
  {
    id: "guardian-shield",
    code: "GUARDIAN_SHIELD",
    level: 3,
    name: { en: "Guardian Shield", es: "Escudo Guardián" },
    description: { en: "Awarded after completing 6 classes.", es: "Otorgado tras completar 6 clases." },
    unlockType: "class_milestone",
    requiredCompletedClasses: 6,
    stats: { defense: 30, safety: 25, threat: 20, courage: 20 },
    perkLabel: { en: "1.15x Bonus XP Multiplier (Real Perk)", es: "Multiplicador 1.15x XP (Beneficio Real)" },
    perkType: "real_xp_multiplier",
    xpMultiplierBonus: 0.15,
    displayOrder: 3,
    status: "active",
    version: 1,
  },
  {
    id: "defender-shield",
    code: "DEFENDER_SHIELD",
    level: 4,
    name: { en: "Defender Shield", es: "Escudo Defensor" },
    description: { en: "Awarded after completing 10 classes.", es: "Otorgado tras completar 10 clases." },
    unlockType: "class_milestone",
    requiredCompletedClasses: 10,
    stats: { defense: 50, safety: 40, threat: 35, courage: 30 },
    perkLabel: { en: "Special Guardian Emotes (Cosmetic)", es: "Emoticonos Especiales (Cosmético)" },
    perkType: "cosmetic",
    xpMultiplierBonus: 0,
    displayOrder: 4,
    status: "active",
    version: 1,
  },
  {
    id: "champion-shield",
    code: "CHAMPION_SHIELD",
    level: 5,
    name: { en: "Champion Shield", es: "Escudo Campeón" },
    description: { en: "Awarded after completing 15 classes.", es: "Otorgado tras completar 15 clases." },
    unlockType: "class_milestone",
    requiredCompletedClasses: 15,
    stats: { defense: 75, safety: 60, threat: 55, courage: 50 },
    perkLabel: { en: "1.25x Bonus XP Multiplier (Real Perk)", es: "Multiplicador 1.25x XP (Beneficio Real)" },
    perkType: "real_xp_multiplier",
    xpMultiplierBonus: 0.25,
    displayOrder: 5,
    status: "active",
    version: 1,
  },
  {
    id: "elite-shield",
    code: "ELITE_SHIELD",
    level: 6,
    name: { en: "Elite Shield", es: "Escudo de Élite" },
    description: { en: "Awarded after completing 20 classes.", es: "Otorgado tras completar 20 clases." },
    unlockType: "class_milestone",
    requiredCompletedClasses: 20,
    stats: { defense: 100, safety: 80, threat: 70, courage: 70 },
    perkLabel: { en: "Home & World Upgrades (Cosmetic)", es: "Mejoras de Hogar y Mundo (Cosmético)" },
    perkType: "cosmetic",
    xpMultiplierBonus: 0,
    displayOrder: 6,
    status: "active",
    version: 1,
  },
  {
    id: "legendary-shield",
    code: "LEGENDARY_SHIELD",
    level: 7,
    name: { en: "Legendary Shield", es: "Escudo Legendario" },
    description: { en: "Awarded after passing the Capstone Challenge & all published paths.", es: "Otorgado tras aprobar el Reto Capstone y todas las rutas." },
    unlockType: "capstone",
    requiredCompletedClasses: 25,
    stats: { defense: 150, safety: 120, threat: 110, courage: 100 },
    perkLabel: { en: "1.50x Bonus XP Multiplier (Real Perk)", es: "Multiplicador 1.50x XP (Beneficio Real)" },
    perkType: "real_xp_multiplier",
    xpMultiplierBonus: 0.50,
    displayOrder: 7,
    status: "active",
    version: 1,
  },
];

/**
 * Evaluates a learner's qualified shields based on authoritative class completions and capstone status.
 */
export function evalLearnerShieldProgression(
  totalCompletedClasses: number,
  hasPassedCapstone: boolean,
  existingBadges: LearnerBadgeRecord[] = [],
  definitions: ShieldDefinition[] = DEFAULT_SHIELD_DEFINITIONS,
): ShieldProgressionSummary {
  // Filter active (earned or restored) badges
  const activeBadges = existingBadges.filter((b) => b.status === "earned" || b.status === "restored");
  const activeBadgeIds = new Set(activeBadges.map((b) => b.badgeId));

  // Determine earned shield definitions
  const activeDefinitions = definitions
    .filter((d) => d.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Determine current highest level shield
  let currentShield: ShieldDefinition | null = null;
  let nextShield: ShieldDefinition | null = null;

  for (const def of activeDefinitions) {
    const isUnlockedByRule =
      def.unlockType === "capstone"
        ? hasPassedCapstone && totalCompletedClasses >= def.requiredCompletedClasses
        : totalCompletedClasses >= def.requiredCompletedClasses;

    // Must be either already earned in records OR unlocked by current rule
    if (activeBadgeIds.has(def.id) || isUnlockedByRule) {
      if (!currentShield || def.level > currentShield.level) {
        currentShield = def;
      }
    } else if (!nextShield && def.level > (currentShield?.level ?? 0)) {
      nextShield = def;
    }
  }

  const currentLevel: ShieldLevel | 0 = currentShield?.level ?? 0;

  // Calculate progress toward next shield
  let classesUntilNextShield = 0;
  let progressPercentage = 100;

  if (nextShield) {
    const prevThreshold = currentShield?.requiredCompletedClasses ?? 0;
    const req = nextShield.requiredCompletedClasses;
    classesUntilNextShield = Math.max(0, req - totalCompletedClasses);
    const range = req - prevThreshold;
    const progressInRange = totalCompletedClasses - prevThreshold;
    progressPercentage = Math.min(100, Math.max(0, Math.round((progressInRange / Math.max(1, range)) * 100)));
  }

  // Calculate real XP multiplier bonus
  let xpMultiplier = 1.0;
  if (currentShield && currentShield.perkType === "real_xp_multiplier") {
    xpMultiplier = 1.0 + currentShield.xpMultiplierBonus;
  }

  // Construct child-friendly callout message
  let calloutEn = "Complete your first class to unlock the Basic Shield!";
  let calloutEs = "¡Completa tu primera clase para desbloquear el Escudo Básico!";

  if (nextShield) {
    calloutEn = `Complete ${classesUntilNextShield} more ${classesUntilNextShield === 1 ? "class" : "classes"} to unlock your ${nextShield.name.en}!`;
    calloutEs = `¡Completa ${classesUntilNextShield} ${classesUntilNextShield === 1 ? "clase más" : "clases más"} para desbloquear tu ${nextShield.name.es}!`;
  } else if (currentShield) {
    calloutEn = `You have achieved the ultimate ${currentShield.name.en}!`;
    calloutEs = `¡Has alcanzado el máximo ${currentShield.name.es}!`;
  }

  return {
    currentLevel,
    currentShield,
    activeBadges,
    totalCompletedClasses,
    nextShield,
    classesUntilNextShield,
    progressPercentage,
    xpMultiplier,
    calloutMessage: { en: calloutEn, es: calloutEs },
  };
}
