import test from "node:test";
import assert from "node:assert/strict";
import { resolveChildPolicy, TIER_ENTITLEMENTS } from "../src/domain/policy/resolver.ts";

test("subscription tier unlocks features but parent restriction overrides commercial entitlement", () => {
  const policy = resolveChildPolicy({
    tier: "family",
    parentalControls: { allowAiBuilder: false },
  });
  assert.equal(policy.entitlements.builderAccess, true);
  assert.equal(policy.canAccessBuilder, false);
  assert.equal(policy.canUseAI, false);
});

test("system safety policy overrides parent settings and entitlements", () => {
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

test("time limits enforce daily play time limit", () => {
  const openPolicy = resolveChildPolicy({
    currentMinutesPlayed: 45,
    parentalControls: { dailyLimitMinutes: 60 },
  });
  assert.equal(openPolicy.timeAccessAllowed, true);

  const lockedPolicy = resolveChildPolicy({
    currentMinutesPlayed: 75,
    parentalControls: { dailyLimitMinutes: 60 },
  });
  assert.equal(lockedPolicy.timeAccessAllowed, false);
});

test("quiet hours block access outside allowed start/end window", () => {
  const nightPolicy = resolveChildPolicy({
    currentTimeString: "22:30",
    parentalControls: { allowedStart: "07:00", allowedEnd: "21:00" },
  });
  assert.equal(nightPolicy.timeAccessAllowed, false);

  const dayPolicy = resolveChildPolicy({
    currentTimeString: "14:00",
    parentalControls: { allowedStart: "07:00", allowedEnd: "21:00" },
  });
  assert.equal(dayPolicy.timeAccessAllowed, true);
});
