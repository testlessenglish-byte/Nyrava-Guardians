import test from "node:test";
import assert from "node:assert/strict";

import { resolveChildPolicy } from "../src/domain/policy/resolver.ts";
import {
  verifyGeanAccountService,
  traceAiBuilderAccessDecisionService,
} from "../src/lib/admin-management.functions.ts";

test("1. Gean Account Verification: Identifies account ID, role super_admin, and unlimited entitlement", async () => {
  const result = await verifyGeanAccountService();

  assert.equal(result.success, true);
  assert.equal(result.userId, "usr_gean_admin");
  assert.equal(result.authoritativeRole, "super_admin");
  assert.equal(result.entitlementStatus, "UNLIMITED_AI_BUILDER_ENTITLEMENT");
  assert.equal(result.pointDeductionPerRoom, 0);
  assert.equal(result.parentApprovalRequired, false);
  assert.equal(result.ageRestrictionsApplied, false);
  assert.equal(result.sessionRefreshed, true);
});

test("2. Trace Access Decision: Evaluates complete 14-point decision matrix for Super Admin", async () => {
  const trace = await traceAiBuilderAccessDecisionService({
    role: "super_admin",
    userId: "usr_gean_admin",
  });

  assert.equal(trace.authentication.status, "PASS");
  assert.equal(trace.userRole.role, "super_admin");
  assert.equal(trace.adminEntitlement.unlimitedPoints, true);
  assert.equal(trace.adminEntitlement.zeroPointDeduction, true);
  assert.equal(trace.parentApproval.detail.includes("Bypassed"), true);
  assert.equal(trace.ageBandRestriction.detail.includes("Bypassed"), true);
  assert.equal(trace.pointsBalance.detail.includes("bypassed"), true);
  assert.equal(trace.finalAccessDecision.granted, true);
});

test("3. Policy Resolver: Super Admin role bypasses parental restrictions and age limits", () => {
  const policy = resolveChildPolicy({
    role: "super_admin",
    tier: "super_admin",
    parentalControls: { allowAiBuilder: false }, // Even if parent controls are false, Super Admin bypasses!
  });

  assert.equal(policy.canAccessBuilder, true, "Super Admin must bypass parental restrictions");
  assert.equal(policy.canUseAI, true, "Super Admin must have AI access");
  assert.equal(policy.timeAccessAllowed, true, "Super Admin must bypass time access limits");
  assert.equal(policy.entitlements.adminUnlimitedPoints, true);
});

test("4. Policy Resolver: Learner role enforces parental restrictions when allowAiBuilder is false", () => {
  const learnerPolicy = resolveChildPolicy({
    role: "learner",
    tier: "free",
    parentalControls: { allowAiBuilder: false },
  });

  assert.equal(learnerPolicy.canAccessBuilder, false, "Learner must respect parental controls");
});
