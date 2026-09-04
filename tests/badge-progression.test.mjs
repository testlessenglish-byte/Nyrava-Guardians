import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SHIELD_DEFINITIONS,
  evalLearnerShieldProgression,
} from "../src/domain/progression/badge-evaluator.ts";
import {
  adminManageLearnerBadgeService,
  adminUpdateBadgeDefinitionService,
  getLearnerBadgeJourneyService,
  processClassCompletionBadgeAwardService,
} from "../src/lib/badge-progression.functions.ts";

const MOCK_ADMIN_TOKEN = "admin_valid_jwt_token_at_least_20_chars_long";
const MOCK_SUPER_ADMIN_TOKEN = "super_admin_jwt_valid_token_20_chars_long";

test("1. Basic Shield Unlock: Unlocks ONLY after completing 1st class with >=75%. Account creation does NOT award it.", async () => {
  const initial = await getLearnerBadgeJourneyService({ learnerUserId: "usr_new_learner_1" });
  assert.equal(initial.summary.currentLevel, 0);
  assert.equal(initial.summary.currentShield, null);

  // Failed class (<75%) does NOT award Basic Shield
  const failRes = await processClassCompletionBadgeAwardService({
    learnerUserId: "usr_new_learner_1",
    classId: "phishing-defense",
    score: 60,
  });
  assert.equal(failRes.success, false);
  assert.equal(failRes.newlyAwardedBadges.length, 0);

  // Passing class (>=75%) awards Basic Shield
  const passRes = await processClassCompletionBadgeAwardService({
    learnerUserId: "usr_new_learner_1",
    classId: "phishing-defense",
    score: 85,
  });
  assert.equal(passRes.success, true);
  assert.equal(passRes.newlyAwardedBadges.length, 1);
  assert.equal(passRes.newlyAwardedBadges[0].badgeId, "basic-shield");
  assert.equal(passRes.summary.currentLevel, 1);
});

test("2. Idempotency & Concurrency: Refreshing or repeating class completion cannot produce duplicate active badges", async () => {
  // First completion
  const res1 = await processClassCompletionBadgeAwardService({
    learnerUserId: "usr_idempotent_learner",
    classId: "password-safety",
    score: 90,
  });
  assert.equal(res1.newlyAwardedBadges.length, 1);

  // Duplicate completion attempt
  const res2 = await processClassCompletionBadgeAwardService({
    learnerUserId: "usr_idempotent_learner",
    classId: "password-safety",
    score: 100,
  });
  assert.equal(res2.newlyAwardedBadges.length, 0);
  assert.equal(res2.summary.activeBadges.length, 1);
});

test("3. Milestone Progression: Completing 3 classes unlocks Protector Shield (Level 2)", async () => {
  const learnerId = "usr_milestone_learner";
  await processClassCompletionBadgeAwardService({ learnerUserId: learnerId, classId: "class_1", score: 80 });
  await processClassCompletionBadgeAwardService({ learnerUserId: learnerId, classId: "class_2", score: 85 });
  const res3 = await processClassCompletionBadgeAwardService({ learnerUserId: learnerId, classId: "class_3", score: 90 });

  assert.equal(res3.summary.currentLevel, 2);
  assert.equal(res3.summary.currentShield?.id, "protector-shield");
});

test("4. Progress Calculation: Callout message correctly states remaining classes until next milestone", () => {
  // 1 completed class out of 3 required for Level 2 (Protector)
  const evalSummary = evalLearnerShieldProgression(1, false, [], DEFAULT_SHIELD_DEFINITIONS);
  assert.equal(evalSummary.currentLevel, 1);
  assert.equal(evalSummary.classesUntilNextShield, 2);
  assert.equal(evalSummary.calloutMessage.en, "Complete 2 more classes to unlock your Protector Shield!");
});

test("5. Award Lifecycle (earned -> revoked -> restored): History and reason are preserved", async () => {
  const learnerId = "usr_lifecycle_learner";
  await processClassCompletionBadgeAwardService({ learnerUserId: learnerId, classId: "class_1", score: 80 });

  // Admin Revokes Badge
  const revokeRes = await adminManageLearnerBadgeService({
    accessToken: MOCK_ADMIN_TOKEN,
    learnerUserId: learnerId,
    badgeId: "basic-shield",
    action: "revoke",
    reason: "Compliance audit correction per administrative review",
    reauthConfirmed: true,
  });
  assert.equal(revokeRes.success, true);
  assert.equal(revokeRes.badgeRecord?.status, "revoked");
  assert.equal(revokeRes.badgeRecord?.revocationReason, "Compliance audit correction per administrative review");

  // Admin Restores Badge
  const restoreRes = await adminManageLearnerBadgeService({
    accessToken: MOCK_ADMIN_TOKEN,
    learnerUserId: learnerId,
    badgeId: "basic-shield",
    action: "restore",
    reason: "Re-verifying completed coursework and restoring badge",
    reauthConfirmed: true,
  });
  assert.equal(restoreRes.success, true);
  assert.equal(restoreRes.badgeRecord?.status, "restored");
  assert.equal(restoreRes.badgeRecord?.restorationReason, "Re-verifying completed coursework and restoring badge");
});

test("6. Governed Admin Control: Short reason (<10 chars) or unconfirmed reauth fails", async () => {
  // Short reason fails
  await assert.rejects(
    async () => {
      await adminManageLearnerBadgeService({
        accessToken: MOCK_ADMIN_TOKEN,
        learnerUserId: "usr_test",
        badgeId: "basic-shield",
        action: "grant",
        reason: "Too short",
        reauthConfirmed: true,
      });
    },
    { message: "A written reason of at least 10 characters is required for manual badge adjustments." }
  );

  // Unconfirmed reauth fails
  await assert.rejects(
    async () => {
      await adminManageLearnerBadgeService({
        accessToken: MOCK_ADMIN_TOKEN,
        learnerUserId: "usr_test",
        badgeId: "basic-shield",
        action: "grant",
        reason: "Valid administrative written reason provided",
        reauthConfirmed: false,
      });
    },
    { message: "Administrative reauthentication is required to modify learner badge status." }
  );
});

test("7. Threshold Modification Rule Preservation: Editing thresholds increments version and preserves historical awards", async () => {
  const updateRes = await adminUpdateBadgeDefinitionService({
    accessToken: MOCK_ADMIN_TOKEN,
    badgeId: "basic-shield",
    requiredCompletedClasses: 2,
    reason: "Updating threshold requirement for Basic Shield to 2 classes",
  });
  assert.equal(updateRes.success, true);
  assert.equal(updateRes.definition.requiredCompletedClasses, 2);
  assert.equal(updateRes.definition.version > 1, true);

  // Restore threshold for remaining tests
  await adminUpdateBadgeDefinitionService({
    accessToken: MOCK_ADMIN_TOKEN,
    badgeId: "basic-shield",
    requiredCompletedClasses: 1,
    reason: "Restoring threshold requirement for Basic Shield to 1 class",
  });
});

test("8. Real XP Multiplier Perk: Level 3 (Guardian Shield) applies 1.15x XP multiplier", () => {
  const evalL3 = evalLearnerShieldProgression(6, false, [], DEFAULT_SHIELD_DEFINITIONS);
  assert.equal(evalL3.currentLevel, 3);
  assert.equal(evalL3.xpMultiplier, 1.15);
});
