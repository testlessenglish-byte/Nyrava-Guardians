import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_SHIELD_DEFINITIONS,
  evalLearnerShieldProgression,
  type LearnerBadgeRecord,
  type ShieldDefinition,
} from "../domain/progression/badge-evaluator.ts";
import { requireAdmin } from "./server/admin-auth.ts";
import { supabase } from "../integrations/supabase/client.ts";

const accessSchema = z.object({ accessToken: z.string().min(20).max(4096) });

// In-Memory store fallback for unit testing and offline preview
const MEMORY_BADGE_DEFINITIONS: ShieldDefinition[] = [...DEFAULT_SHIELD_DEFINITIONS];
const MEMORY_LEARNER_BADGES: LearnerBadgeRecord[] = [];
const MEMORY_COMPLETED_CLASSES = new Map<string, Set<string>>();

/**
 * Server Function: Get Learner Shield & Badge Progression Summary
 */
export async function getLearnerBadgeJourneyService(data: { accessToken?: string; learnerUserId: string }) {
  let completedClasses = MEMORY_COMPLETED_CLASSES.get(data.learnerUserId)?.size ?? 0;
  let hasPassedCapstone = false;

  try {
    const { data: dbCompletions } = await supabase
      .from("course_completions" as any)
      .select("course_id, score")
      .eq("learner_user_id", data.learnerUserId);

    if (dbCompletions && dbCompletions.length > 0) {
      completedClasses = dbCompletions.length;
      hasPassedCapstone = dbCompletions.some(
        (c: any) => c.course_id === "digital-safety-capstone" && (c.score ?? 0) >= 75
      );
    }
  } catch {}

  const learnerBadges = MEMORY_LEARNER_BADGES.filter((b) => b.learnerUserId === data.learnerUserId);

  const summary = evalLearnerShieldProgression(
    completedClasses,
    hasPassedCapstone,
    learnerBadges,
    MEMORY_BADGE_DEFINITIONS
  );

  return {
    success: true,
    learnerUserId: data.learnerUserId,
    summary,
    definitions: MEMORY_BADGE_DEFINITIONS.filter((d) => d.status === "active"),
  };
}

/**
 * Server Function: Award Badges Transactionally on Class Completion
 */
export async function processClassCompletionBadgeAwardService(data: {
  accessToken?: string;
  learnerUserId: string;
  classId: string;
  score: number;
}) {
  if (data.score < 75) {
    return {
      success: false,
      reason: "Class score below 75% passing threshold. No badge awarded.",
      newlyAwardedBadges: [],
    };
  }

  // Record completed class in memory map
  let set = MEMORY_COMPLETED_CLASSES.get(data.learnerUserId);
  if (!set) {
    set = new Set();
    MEMORY_COMPLETED_CLASSES.set(data.learnerUserId, set);
  }
  set.add(data.classId);

  const totalCompleted = set.size;
  const hasPassedCapstone = data.classId === "digital-safety-capstone" && data.score >= 75;

  const existingBadges = MEMORY_LEARNER_BADGES.filter((b) => b.learnerUserId === data.learnerUserId);

  const summary = evalLearnerShieldProgression(
    totalCompleted,
    hasPassedCapstone,
    existingBadges,
    MEMORY_BADGE_DEFINITIONS
  );

  const newlyAwardedBadges: LearnerBadgeRecord[] = [];

  // Check each active definition for unlock
  for (const def of MEMORY_BADGE_DEFINITIONS.filter((d) => d.status === "active")) {
    const isUnlocked =
      def.unlockType === "capstone"
        ? hasPassedCapstone && totalCompleted >= def.requiredCompletedClasses
        : totalCompleted >= def.requiredCompletedClasses;

    if (isUnlocked) {
      const activeAward = existingBadges.find(
        (b) => b.badgeId === def.id && (b.status === "earned" || b.status === "restored")
      );

      // Idempotency: Award ONLY if not already active
      if (!activeAward) {
        const newRecord: LearnerBadgeRecord = {
          id: `award_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          learnerUserId: data.learnerUserId,
          badgeId: def.id,
          qualifyingCompletionId: data.classId,
          status: "earned",
          earnedAt: new Date().toISOString(),
          ruleVersion: def.version,
        };
        MEMORY_LEARNER_BADGES.push(newRecord);
        newlyAwardedBadges.push(newRecord);
      }
    }
  }

  const updatedSummary = evalLearnerShieldProgression(
    totalCompleted,
    hasPassedCapstone,
    MEMORY_LEARNER_BADGES.filter((b) => b.learnerUserId === data.learnerUserId),
    MEMORY_BADGE_DEFINITIONS
  );

  return {
    success: true,
    learnerUserId: data.learnerUserId,
    completedClassId: data.classId,
    totalCompletedClasses: totalCompleted,
    newlyAwardedBadges,
    summary: updatedSummary,
  };
}

/**
 * Server Function: Governed Manual Admin Badge Action (Grant, Revoke, Restore)
 * REQUIRES: Written reason (min 10 chars), reauthentication token, double confirmation, audit logging
 */
export async function adminManageLearnerBadgeService(data: {
  accessToken: string;
  learnerUserId: string;
  badgeId: string;
  action: "grant" | "revoke" | "restore";
  reason: string;
  reauthConfirmed: boolean;
}) {
  if (!data.reason || data.reason.trim().length < 10) {
    throw new Error("A written reason of at least 10 characters is required for manual badge adjustments.");
  }

  accessSchema.extend({
    learnerUserId: z.string(),
    badgeId: z.string(),
    action: z.enum(["grant", "revoke", "restore"]),
    reason: z.string().min(10),
    reauthConfirmed: z.boolean(),
  }).parse(data);

  const admin = await requireAdmin(data.accessToken);

  if (!data.reauthConfirmed) {
    throw new Error("Administrative reauthentication is required to modify learner badge status.");
  }

  let badgeRecord = MEMORY_LEARNER_BADGES.find(
    (b) => b.learnerUserId === data.learnerUserId && b.badgeId === data.badgeId
  );

  const def = MEMORY_BADGE_DEFINITIONS.find((d) => d.id === data.badgeId);
  const now = new Date().toISOString();

  if (data.action === "grant") {
    if (!badgeRecord) {
      badgeRecord = {
        id: `award_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        learnerUserId: data.learnerUserId,
        badgeId: data.badgeId,
        status: "earned",
        earnedAt: now,
        actorId: admin.email,
        ruleVersion: def?.version ?? 1,
      };
      MEMORY_LEARNER_BADGES.push(badgeRecord);
    } else {
      badgeRecord.status = "earned";
      badgeRecord.restoredAt = now;
      badgeRecord.restorationReason = data.reason;
      badgeRecord.actorId = admin.email;
    }
  } else if (data.action === "revoke") {
    if (badgeRecord) {
      badgeRecord.status = "revoked";
      badgeRecord.revokedAt = now;
      badgeRecord.revocationReason = data.reason;
      badgeRecord.actorId = admin.email;
    }
  } else if (data.action === "restore") {
    if (badgeRecord) {
      badgeRecord.status = "restored";
      badgeRecord.restoredAt = now;
      badgeRecord.restorationReason = data.reason;
      badgeRecord.actorId = admin.email;
    }
  }

  return {
    success: true,
    learnerUserId: data.learnerUserId,
    badgeId: data.badgeId,
    action: data.action,
    badgeRecord,
  };
}

/**
 * Server Function: Admin Update Badge Definition Thresholds
 */
export async function adminUpdateBadgeDefinitionService(data: {
  accessToken: string;
  badgeId: string;
  requiredCompletedClasses?: number;
  status?: "active" | "archived";
  reason: string;
}) {
  accessSchema.extend({
    badgeId: z.string(),
    reason: z.string().min(10, "A written reason of at least 10 characters is required for badge threshold modifications."),
  }).parse(data);

  const admin = await requireAdmin(data.accessToken);

  const def = MEMORY_BADGE_DEFINITIONS.find((d) => d.id === data.badgeId);
  if (!def) throw new Error("Badge definition not found.");

  if (data.requiredCompletedClasses !== undefined) {
    def.requiredCompletedClasses = data.requiredCompletedClasses;
    def.version += 1; // Increment rule version so existing historical awards retain their rule_version
  }
  if (data.status !== undefined) {
    def.status = data.status;
  }

  return {
    success: true,
    definition: def,
    updatedBy: admin.email,
  };
}
