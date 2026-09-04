import assert from "node:assert/strict";
import test from "node:test";
import { WORLD_REGISTRY } from "../src/domain/world/registry.ts";
import { GUARDIAN_TIERS, BUILDABLE_ZONES } from "../src/domain/realm/realm-types.ts";

test("Nyrava Guardians — One Persistent World (Nyrava Guardian Realm)", async (t) => {
  await t.test("1. World Registry contains nyrava-guardian-realm as primary active world", () => {
    const realm = WORLD_REGISTRY["nyrava-guardian-realm"];
    assert.ok(realm, "Missing nyrava-guardian-realm in authoritative registry");
    assert.equal(realm.status, "active");
    assert.equal(realm.route, "/realm");
    assert.equal(realm.districts.length, 6, "Expected 6 district clearings in Nyrava Guardian Realm");
  });

  await t.test("2. Guardian Tiers define 5-stage progression loop", () => {
    const keys = Object.keys(GUARDIAN_TIERS);
    assert.equal(keys.length, 5, "Expected 5 Guardian Tiers");

    assert.equal(GUARDIAN_TIERS[1].title, "New Guardian");
    assert.equal(GUARDIAN_TIERS[2].title, "Developing Guardian");
    assert.equal(GUARDIAN_TIERS[3].title, "Digital Defender");
    assert.equal(GUARDIAN_TIERS[4].title, "AI Guardian");
    assert.equal(GUARDIAN_TIERS[5].title, "Master Guardian");
  });

  await t.test("3. Buildable Zones map to tier unlock requirements", () => {
    assert.equal(BUILDABLE_ZONES.length, 5, "Expected 5 buildable zones");

    const waterfall = BUILDABLE_ZONES.find((z) => z.id === "waterfall-clearing");
    assert.ok(waterfall);
    assert.equal(waterfall.requiredTier, 1);

    const hq = BUILDABLE_ZONES.find((z) => z.id === "hq-plateau");
    assert.ok(hq);
    assert.equal(hq.requiredTier, 4);
  });
});
