import { FOUNDATION_CERTIFICATE, FOUNDATION_MISSIONS, missions, shields } from "./catalog.ts";
import type {
  AllowedObject,
  BuildAction,
  Certificate,
  LearningStatus,
  MasterySkill,
  PlayerProgress,
  ProgressionResult,
  RewardGrant,
  ShieldUnlockEvent,
} from "./types.ts";

export function createProgress(now = new Date().toISOString()): PlayerProgress {
  const basic: RewardGrant = {
    id: "join:basic:v1",
    source: "onboarding",
    xp: 0,
    credits: 0,
    itemIds: ["basic-shield"],
    earnedAt: now,
  };
  return {
    schemaVersion: 1,
    authority: "demo-server",
    joined: true,
    xp: 0,
    credits: 0,
    missions: {},
    mastery: {},
    inventory: {
      items: [
        {
          id: "basic-shield",
          quantity: 1,
          equipped: true,
          earnedAt: now,
          source: basic.id,
          tradable: false,
        },
      ],
    },
    grants: [basic],
    xpEvents: [],
    certificates: [],
    attempts: [],
    home: { version: 1, objects: [], history: [], published: false },
  };
}

export function levelFor(xp: number) {
  return Math.max(1, Math.floor(xp / 1000) + 1);
}
export function hasMission(progress: PlayerProgress, id: string) {
  return !!progress.missions[id]?.completedAt;
}
export function missionUnlocked(progress: PlayerProgress, id: string) {
  const mission = missions.find((item) => item.id === id);
  return !!mission && mission.prerequisiteIds.every((required) => hasMission(progress, required));
}
export function startMission(progress: PlayerProgress, missionId: string, now = Date.now()) {
  const mission = missions.find((item) => item.id === missionId);
  if (!mission || !mission.playable || !missionUnlocked(progress, missionId))
    throw new Error("Mission is locked or unavailable.");
  const existing = progress.attempts.find(
    (attempt) =>
      attempt.missionId === missionId && !attempt.used && Date.parse(attempt.expiresAt) > now,
  );
  if (existing) return { progress, attemptId: existing.id };
  const attempt = {
    id: crypto.randomUUID(),
    missionId,
    startedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 30 * 60_000).toISOString(),
    used: false,
  };
  return {
    progress: { ...progress, attempts: [...progress.attempts.slice(-5), attempt] },
    attemptId: attempt.id,
  };
}

const skillForMission = (missionId: string): MasterySkill | null => {
  if (missionId === "phishing-defense") return "phishing";
  if (missionId === "password-safety") return "passwords";
  if (missionId === "personal-information") return "privacy";
  return null;
};

function maybeIssueFoundationCertificate(progress: PlayerProgress, now: string) {
  const already = progress.certificates.some((item) => item.course === FOUNDATION_CERTIFICATE.id);
  if (already || !FOUNDATION_MISSIONS.every((id) => hasMission(progress, id))) {
    return { progress, certificates: [] as Certificate[] };
  }
  const passedScores = FOUNDATION_MISSIONS.map((id) => progress.missions[id]?.bestScore ?? 0);
  if (passedScores.some((score) => score < 75)) {
    return { progress, certificates: [] as Certificate[] };
  }
  const certificate: Certificate = {
    id: crypto.randomUUID(),
    course: FOUNDATION_CERTIFICATE.id,
    level: levelFor(progress.xp),
    skills: ["phishing", "passwords", "privacy"],
    completedAt: now,
    curriculumVersion: FOUNDATION_CERTIFICATE.curriculumVersion,
    displayName: null,
    verificationId: `NYR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    verificationUrl: null,
    qrPayload: null,
    verificationStatus: "demo",
  };
  return {
    progress: { ...progress, certificates: [...progress.certificates, certificate] },
    certificates: [certificate],
  };
}

export function completeMission(
  progress: PlayerProgress,
  attemptId: string,
  score: number,
  now = new Date().toISOString(),
): ProgressionResult {
  const attempt = progress.attempts.find((item) => item.id === attemptId);
  if (!attempt || attempt.used || Date.parse(attempt.expiresAt) < Date.parse(now))
    throw new Error("This assessment attempt is no longer valid.");
  const mission = missions.find((item) => item.id === attempt.missionId)!;
  const passed = score >= 75;
  const previous = progress.missions[mission.id];
  const status: LearningStatus =
    previous?.status === "mastered" || score >= 80
      ? "mastered"
      : previous?.completedAt || passed
        ? "completed"
        : "practicing";
  const missionProgress = {
    status,
    bestScore: Math.max(previous?.bestScore ?? 0, score),
    completedAt: passed ? (previous?.completedAt ?? now) : (previous?.completedAt ?? null),
    attempts: (previous?.attempts ?? 0) + 1,
  };
  const masterySkill = skillForMission(mission.id);
  let next: PlayerProgress = {
    ...progress,
    missions: { ...progress.missions, [mission.id]: missionProgress },
    attempts: progress.attempts.map((item) =>
      item.id === attemptId ? { ...item, used: true } : item,
    ),
    mastery: {
      ...progress.mastery,
      ...(masterySkill && score >= 80
        ? { [masterySkill]: Math.max(progress.mastery[masterySkill] ?? 0, score) }
        : {}),
    },
  };
  const grants: RewardGrant[] = [];
  const grantId = `mission:${mission.id}:v1`;
  if (passed && !next.grants.some((grant) => grant.id === grantId)) {
    const grant = {
      id: grantId,
      source: mission.id,
      xp: mission.xp,
      credits: mission.credits,
      itemIds: [mission.badgeId],
      earnedAt: now,
    };
    grants.push(grant);
    next = {
      ...next,
      xp: next.xp + grant.xp,
      credits: next.credits + grant.credits,
      grants: [...next.grants, grant],
      xpEvents: [
        ...next.xpEvents,
        { id: `${grantId}:xp`, missionId: mission.id, amount: grant.xp, earnedAt: now },
      ],
      inventory: {
        items: [
          ...next.inventory.items,
          {
            id: mission.badgeId,
            quantity: 1,
            equipped: false,
            earnedAt: now,
            source: grantId,
            tradable: false,
          },
        ],
      },
    };
  }
  const shieldEvents: ShieldUnlockEvent[] = [];
  if (
    FOUNDATION_MISSIONS.every((id) => hasMission(next, id)) &&
    !next.inventory.items.some((item) => item.id === "protector-shield")
  ) {
    const event = { shieldId: "protector-shield", tier: 2 as const, earnedAt: now };
    shieldEvents.push(event);
    next = {
      ...next,
      inventory: {
        items: [
          ...next.inventory.items,
          {
            id: event.shieldId,
            quantity: 1,
            equipped: false,
            earnedAt: now,
            source: "shield:protector:v1",
            tradable: false,
          },
        ],
      },
    };
  }
  const certificateResult = maybeIssueFoundationCertificate(next, now);
  next = certificateResult.progress;
  return {
    progress: next,
    grants,
    shields: shieldEvents,
    certificates: certificateResult.certificates,
    score,
  };
}

export function equipShield(progress: PlayerProgress, id: string) {
  if (!progress.inventory.items.some((item) => item.id === id && item.id.endsWith("-shield")))
    throw new Error("Shield is not owned.");
  return {
    ...progress,
    inventory: {
      items: progress.inventory.items.map((item) =>
        item.id.endsWith("-shield") ? { ...item, equipped: item.id === id } : item,
      ),
    },
  };
}
export function shieldOwned(progress: PlayerProgress, id: string) {
  return progress.inventory.items.some((item) => item.id === id);
}
export function shieldRequirement(progress: PlayerProgress, id: string) {
  const shield = shields.find((item) => item.id === id)!;
  if (shield.gate === "joined") return { current: progress.joined ? 1 : 0, target: 1 };
  if (shield.gate === "foundations")
    return {
      current: FOUNDATION_MISSIONS.filter((mission) => hasMission(progress, mission)).length,
      target: 3,
    };
  if (shield.gate === "ten-mastery")
    return {
      current: Object.values(progress.missions).filter((item) => item.status === "mastered").length,
      target: 10,
    };
  if (shield.gate === "level10-challenge") return { current: levelFor(progress.xp), target: 10 };
  if (shield.gate === "two-certificates")
    return { current: new Set(progress.certificates.map((item) => item.course)).size, target: 2 };
  if (shield.gate === "level20-creator") return { current: levelFor(progress.xp), target: 20 };
  return { current: hasMission(progress, "guardian-capstone") ? 1 : 0, target: 1 };
}
export function certificateProgress(progress: PlayerProgress) {
  const completed = FOUNDATION_MISSIONS.filter((id) => hasMission(progress, id)).length;
  return Math.round((completed / FOUNDATION_MISSIONS.length) * 100);
}
export function validateBuild(object: AllowedObject, x: number, z: number, scale: number) {
  return (
    ["desk", "lamp", "plant"].includes(object) &&
    Math.abs(x) <= 4 &&
    Math.abs(z) <= 4 &&
    scale >= 0.5 &&
    scale <= 1.5
  );
}
export function placeObject(
  progress: PlayerProgress,
  action: BuildAction,
  now = new Date().toISOString(),
) {
  if (
    !validateBuild(action.object, action.x, action.z, action.scale) ||
    progress.home.objects.length >= 8
  )
    throw new Error("Creator action is outside the approved prototype limits.");
  return {
    ...progress,
    home: {
      ...progress.home,
      version: progress.home.version + 1,
      objects: [...progress.home.objects, action],
      history: [
        ...progress.home.history,
        { version: progress.home.version + 1, actionId: action.id, at: now },
      ],
    },
  };
}
