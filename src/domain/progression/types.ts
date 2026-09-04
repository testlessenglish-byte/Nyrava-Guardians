export type Locale = "en-US" | "es-ES";
export type LocalizedContent = { en: string; es: string };
export type MasterySkill =
  "phishing" | "passwords" | "privacy" | "verification" | "building" | "creator-safety";
export type LearningStatus = "not-started" | "learning" | "practicing" | "completed" | "mastered";
export type InventoryCategory =
  | "ARMOR"
  | "HEAD"
  | "BODY"
  | "LEGS"
  | "BOOTS"
  | "GLOVES"
  | "SHIELD"
  | "TOOL"
  | "BACKPACK"
  | "COMPANION"
  | "VEHICLE"
  | "EMOTE"
  | "EFFECT"
  | "HOUSE_ITEM"
  | "BUILDING_ITEM"
  | "WORLD_ITEM"
  | "BADGE"
  | "SPECIAL";
export type UnlockRequirement =
  | { kind: "joined" }
  | { kind: "level"; count: number }
  | { kind: "missions"; ids: string[] }
  | { kind: "mission-count"; count: number }
  | { kind: "mastery"; skill: MasterySkill; score: number }
  | { kind: "certificates"; count: number; distinctPaths: boolean }
  | { kind: "certificate"; id: string };
export type ShieldRequirement = UnlockRequirement;
export type ShieldTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface ShieldVisualAsset {
  kind: "prototype" | "glb";
  reference: string;
  languageNeutral: boolean;
}
export interface ShieldPerk {
  id: string;
  label: string;
  implemented: boolean;
}
export interface RewardDefinition {
  id: string;
  name: string;
  category: InventoryCategory;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: UnlockRequirement[];
  tradable: false;
  visual: ShieldVisualAsset;
}
export interface ShieldDefinition extends RewardDefinition {
  tier: ShieldTier;
  description: string;
  perks: ShieldPerk[];
  version: number;
}
export interface RequirementProgress {
  requirement: UnlockRequirement;
  current: number;
  target: number;
  met: boolean;
}
export interface ShieldProgress {
  shieldId: string;
  owned: boolean;
  requirements: RequirementProgress[];
}
export interface InventoryItem {
  id: string;
  quantity: number;
  equipped: boolean;
  earnedAt: string;
  source: string;
  tradable: false;
}
export interface PlayerInventory {
  items: InventoryItem[];
}
export interface XPEvent {
  id: string;
  missionId: string;
  amount: number;
  earnedAt: string;
}
export interface RewardGrant {
  id: string;
  source: string;
  xp: number;
  credits: number;
  itemIds: string[];
  earnedAt: string;
}
export interface ShieldUnlockEvent {
  shieldId: string;
  tier: ShieldTier;
  earnedAt: string;
}
export interface MissionProgress {
  status: LearningStatus;
  bestScore: number;
  completedAt: string | null;
  attempts: number;
}
export interface GuardianLevel {
  level: number;
  xp: number;
  floor: number;
  next: number;
  fraction: number;
}
export interface LearningPathProgress {
  pathId: string;
  completed: number;
  mastered: number;
  total: number;
}
export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
}
export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  pathId: string;
  ageRange: [number, number];
  difficulty: number;
  guardianIds: string[];
  prerequisites: UnlockRequirement[];
  world: "isla";
  location: string;
  encounter: { kind: "board"; radius: number };
  activityType: "scenario" | "capstone" | "build";
  minutes: number;
  xp: number;
  credits: number;
  itemRewards: string[];
  badgeId: string;
  certificateContribution: { id: string; weight: number } | null;
  unlocks: string[];
  completionScore: number;
  masteryScore: number;
  skills: MasterySkill[];
  replay: "practice-no-duplicate-rewards";
  lesson: string[];
  questions: AssessmentQuestion[];
  bonusObjectives: string[];
}
export interface LearningPath {
  id: string;
  name: string;
  topics: string;
  guardianIds: string[];
  missionIds: string[];
}
export interface Achievement {
  id: string;
  name: string;
  requirements: UnlockRequirement[];
}
export interface Badge extends Achievement {
  missionId: string;
}
export interface CertificateRequirement {
  missionIds: string[];
  mastery: Partial<Record<MasterySkill, number>>;
  capstoneId: string;
  minimumAssessments: number;
}
export interface CertificateDefinition {
  id: string;
  name: string;
  pathId: string;
  curriculumVersion: string;
  requirements: CertificateRequirement;
}
export interface Certificate {
  id: string;
  course: string;
  level: number;
  skills: MasterySkill[];
  completedAt: string;
  curriculumVersion: string;
  displayName: null;
  verificationId: string;
  verificationUrl: string | null;
  qrPayload: string | null;
  verificationStatus: "demo" | "verified";
}
export interface BuildPermission {
  scope: "approved-home-objects";
  requirements: UnlockRequirement[];
  publicPublish: false;
}
export interface WorldPermission {
  scope: "home" | "land" | "island" | "world";
  requirements: UnlockRequirement[];
  requiresModeration: true;
  requiresParentalApproval: true;
}
export type AllowedObject = "desk" | "lamp" | "plant";
export type AllowedBehavior = "static" | "light-toggle";
export type SafeScriptAction = { kind: "set-light"; enabled: boolean };
export interface CreatorCommand {
  kind: "place-approved-object";
  object: AllowedObject;
  x: number;
  z: number;
  scale: number;
  material: "wood" | "blue" | "green";
}
export type BuildAction = CreatorCommand & { id: string };
export interface ModerationResult {
  status: "approved" | "rejected" | "pending";
  reasons: string[];
  reviewedBy: "allowlist" | "human";
}
export interface WorldValidation {
  valid: boolean;
  moderation: ModerationResult;
  objectCount: number;
}
export interface PublishValidation {
  allowed: false;
  reason: "parental-and-moderation-review-required";
}
export interface PlayerHome {
  version: number;
  objects: BuildAction[];
  history: { version: number; actionId: string; at: string }[];
  published: false;
}
export interface JourneyNode {
  id: string;
  kind: "mission" | "certificate" | "shield" | "creator";
  next: string[];
}
export interface MissionAttempt {
  id: string;
  missionId: string;
  startedAt: string;
  expiresAt: string;
  used: boolean;
}
export interface PlayerProgress {
  schemaVersion: 1;
  authority: "demo-server";
  joined: boolean;
  xp: number;
  credits: number;
  missions: Record<string, MissionProgress>;
  mastery: Partial<Record<MasterySkill, number>>;
  inventory: PlayerInventory;
  grants: RewardGrant[];
  xpEvents: XPEvent[];
  certificates: Certificate[];
  attempts: MissionAttempt[];
  home: PlayerHome;
  worldStates?: Record<string, import("@/domain/world/progress").SingleWorldState>;
}
export interface ProgressionResult {
  progress: PlayerProgress;
  grants: RewardGrant[];
  shields: ShieldUnlockEvent[];
  certificates: Certificate[];
  score: number | null;
}
export interface FamilyProgressSummary {
  completed: number;
  mastered: number;
  skills: Partial<Record<MasterySkill, number>>;
  certificates: string[];
  projects: number;
}
export interface SafeCompetitionScore {
  accuracy: number;
  mastery: number;
  creativityReview: "pending" | "reviewed";
  teamworkReview: "pending" | "reviewed";
}
