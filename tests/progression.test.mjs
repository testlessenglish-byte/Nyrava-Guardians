import test from "node:test";
import assert from "node:assert/strict";
import {
  certificateProgress,
  completeMission,
  createProgress,
  equipShield,
  levelFor,
  missionUnlocked,
  placeObject,
  shieldOwned,
  shieldRequirement,
  startMission,
  validateBuild,
} from "../src/domain/progression/engine.ts";

const at = "2026-01-01T00:00:00.000Z";
const completed = (status = "completed") => ({
  status,
  bestScore: status === "mastered" ? 100 : 75,
  completedAt: at,
  attempts: 1,
});

test("Basic Shield is granted and equipped exactly once", () => {
  const p = createProgress(at);
  assert.equal(p.inventory.items.filter((i) => i.id === "basic-shield").length, 1);
  assert.equal(p.grants.filter((g) => g.id === "join:basic:v1").length, 1);
});
test("locked mission cannot start", () =>
  assert.throws(
    () => startMission(createProgress(at), "password-safety", 1),
    /locked|unavailable/i,
  ));
test("prerequisites unlock in order", () => {
  const p = createProgress(at);
  p.missions["phishing-defense"] = completed();
  assert.equal(missionUnlocked(p, "password-safety"), true);
  assert.equal(missionUnlocked(p, "personal-information"), false);
});
test("completion differs from mastery", () => {
  const s = startMission(createProgress(at), "phishing-defense", Date.parse(at));
  const r = completeMission(s.progress, s.attemptId, 75, at);
  assert.equal(r.progress.missions["phishing-defense"].status, "completed");
  assert.equal(r.progress.mastery.phishing, undefined);
});
test("mastery requires the higher score", () => {
  const s = startMission(createProgress(at), "phishing-defense", Date.parse(at));
  const r = completeMission(s.progress, s.attemptId, 100, at);
  assert.equal(r.progress.missions["phishing-defense"].status, "mastered");
  assert.equal(r.progress.mastery.phishing, 100);
});
test("mission grants the fixed rewards", () => {
  const s = startMission(createProgress(at), "phishing-defense", Date.parse(at));
  const r = completeMission(s.progress, s.attemptId, 100, at);
  assert.equal(r.progress.xp, 500);
  assert.equal(r.progress.credits, 150);
  assert.ok(r.progress.inventory.items.some((i) => i.id === "phishing-hunter"));
});
test("duplicate assessment cannot duplicate rewards", () => {
  const s = startMission(createProgress(at), "phishing-defense", Date.parse(at));
  const r = completeMission(s.progress, s.attemptId, 100, at);
  assert.throws(() => completeMission(r.progress, s.attemptId, 100, at), /valid/i);
  assert.equal(r.progress.xp, 500);
});
test("replay practice cannot duplicate XP", () => {
  const s1 = startMission(createProgress(at), "phishing-defense", Date.parse(at));
  const r1 = completeMission(s1.progress, s1.attemptId, 100, at);
  const s2 = startMission(r1.progress, "phishing-defense", Date.parse(at) + 1);
  const r2 = completeMission(s2.progress, s2.attemptId, 100, at);
  assert.equal(r2.progress.xp, 500);
  assert.equal(r2.grants.length, 0);
});
test("reconnect serialization does not duplicate rewards", () => {
  const s = startMission(createProgress(at), "phishing-defense", Date.parse(at));
  const r = completeMission(s.progress, s.attemptId, 100, at);
  const restored = JSON.parse(JSON.stringify(r.progress));
  assert.equal(restored.grants.filter((g) => g.id === "mission:phishing-defense:v1").length, 1);
});
test("Protector requires all three foundation missions", () => {
  const p = createProgress(at);
  p.missions["phishing-defense"] = completed();
  p.missions["password-safety"] = completed();
  assert.deepEqual(shieldRequirement(p, "protector-shield"), { current: 2, target: 3 });
  assert.equal(shieldOwned(p, "protector-shield"), false);
});
test("XP cannot bypass mastery, certificates, or capstone gates", () => {
  const p = createProgress(at);
  p.xp = 99_000;
  assert.deepEqual(shieldRequirement(p, "guardian-shield"), { current: 0, target: 10 });
  assert.deepEqual(shieldRequirement(p, "champion-shield"), { current: 0, target: 2 });
  assert.deepEqual(shieldRequirement(p, "legendary-shield"), { current: 0, target: 1 });
});
test("certificate cannot issue early", () => {
  const p = createProgress(at);
  p.missions["phishing-defense"] = completed("mastered");
  assert.equal(p.certificates.length, 0);
  assert.equal(certificateProgress(p), 33);
});
test("inventory and equipment survive serialization", () => {
  const p = JSON.parse(JSON.stringify(createProgress(at)));
  const e = equipShield(p, "basic-shield");
  assert.equal(e.inventory.items.find((i) => i.id === "basic-shield").equipped, true);
});
test("creator rejects unauthorized objects, bounds, and public publishing", () => {
  assert.equal(validateBuild("desk", 0, 0, 1), true);
  assert.equal(validateBuild("car", 0, 0, 1), false);
  assert.equal(validateBuild("desk", 8, 0, 1), false);
  assert.throws(
    () =>
      placeObject(createProgress(at), {
        id: "bad",
        kind: "place-approved-object",
        object: "desk",
        x: 99,
        z: 0,
        scale: 1,
        material: "wood",
      }),
    /limits/i,
  );
  assert.equal(createProgress(at).home.published, false);
});
test("level XP alone does not mint rewards", () => {
  assert.equal(levelFor(20_000), 21);
  const p = createProgress(at);
  p.xp = 20_000;
  assert.equal(p.inventory.items.length, 1);
});
