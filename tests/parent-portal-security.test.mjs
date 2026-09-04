import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PARENTAL_CONTROLS,
  resolveChildPolicy,
  SYSTEM_SAFETY_POLICY,
  TIER_ENTITLEMENTS,
} from "../src/domain/policy/resolver.ts";

test("missing subscription defaults safely to free tier without paid capabilities", () => {
  const policy = resolveChildPolicy({});
  assert.equal(policy.entitlements, TIER_ENTITLEMENTS.free);
  assert.equal(policy.entitlements.builderAccess, false);
  assert.equal(policy.canAccessBuilder, false);
});

test("missing safety settings default to safe restrictions (voice/mic/builder disabled by default)", () => {
  assert.equal(DEFAULT_PARENTAL_CONTROLS.allowVoice, false);
  assert.equal(DEFAULT_PARENTAL_CONTROLS.allowMicrophone, false);
  assert.equal(DEFAULT_PARENTAL_CONTROLS.allowAiBuilder, false);
  assert.equal(DEFAULT_PARENTAL_CONTROLS.allowExternalLinks, false);

  const policy = resolveChildPolicy({});
  assert.equal(policy.canUseVoice, false);
  assert.equal(policy.canUseMicrophone, false);
  assert.equal(policy.canAccessBuilder, false);
});

test("parent restriction overrides premium entitlement", () => {
  const policy = resolveChildPolicy({
    tier: "premium",
    parentalControls: { allowAiBuilder: false, allowVoice: false },
  });
  assert.equal(policy.entitlements.builderAccess, true);
  assert.equal(policy.canAccessBuilder, false);
  assert.equal(policy.canUseVoice, false);
});

test("system safety policy overrides parent permission and entitlement", () => {
  const policy = resolveChildPolicy({
    tier: "premium",
    parentalControls: { allowMultiplayer: true, allowExternalLinks: true },
    systemPolicy: {
      systemVoiceSupported: true,
      systemAiApproved: true,
      systemExternalLinksSafe: false,
      systemMultiplayerSafe: false,
    },
  });
  assert.equal(policy.canUseMultiplayer, false);
  assert.equal(policy.canOpenExternalLinks, false);
});

test("daily time limits lock access when played minutes exceed limit", () => {
  const activePolicy = resolveChildPolicy({
    currentMinutesPlayed: 110,
    parentalControls: { dailyLimitMinutes: 120 },
  });
  assert.equal(activePolicy.timeAccessAllowed, true);

  const expiredPolicy = resolveChildPolicy({
    currentMinutesPlayed: 125,
    parentalControls: { dailyLimitMinutes: 120 },
  });
  assert.equal(expiredPolicy.timeAccessAllowed, false);
});
