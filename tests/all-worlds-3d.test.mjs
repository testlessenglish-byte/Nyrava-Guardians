import assert from "node:assert/strict";
import test from "node:test";
import { WORLD_REGISTRY, validateWorldRegistry } from "../src/domain/world/registry.ts";

test("Nyrava Guardians — All 7 Worlds 3D Activation & Registry Validation", async (t) => {
  await t.test("1. Registry contains all active worlds including primary Nyrava Guardian Realm", () => {
    const keys = Object.keys(WORLD_REGISTRY);
    assert.equal(keys.length, 8, "Expected 8 worlds in registry (1 primary realm + 7 region worlds)");

    const expectedSlugs = [
      "nyrava-guardian-realm",
      "isla-central",
      "central-city",
      "wisdom-forest",
      "history-valley",
      "knowledge-mountains",
      "infinite-ocean",
      "space-zone",
    ];

    expectedSlugs.forEach((slug) => {
      const world = WORLD_REGISTRY[slug];
      assert.ok(world, `Missing registered world for ${slug}`);
      assert.equal(world.status, "active", `World ${slug} must be active`);
      const expectedRoute = slug === "nyrava-guardian-realm" ? "/realm" : `/world/${slug}`;
      assert.equal(world.route, expectedRoute, `World ${slug} route must be ${expectedRoute}`);
    });
  });

  await t.test("2. Every world contains at least 5 districts and 3 playable activities", () => {
    Object.values(WORLD_REGISTRY).forEach((world) => {
      assert.ok(world.districts.length >= 5, `World ${world.id} must have >= 5 districts, got ${world.districts.length}`);
      const playable = world.districts.filter((d) => d.activityKey);
      assert.ok(playable.length >= 3, `World ${world.id} must have >= 3 activities, got ${playable.length}`);
    });
  });

  await t.test("3. Registry validation passes with 0 errors for all 7 active worlds", () => {
    const validation = validateWorldRegistry();
    assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(", ")}`);
    assert.equal(validation.errors.length, 0);
  });

  await t.test("4. Isla Central Hub inter-world portals link to valid active worlds", () => {
    const hub = WORLD_REGISTRY["isla-central"];
    assert.ok(hub, "Isla Central Hub missing");
    assert.equal(hub.portals.length, 6, "Expected 6 inter-world portals on Isla Central Hub");

    hub.portals.forEach((portal) => {
      const target = WORLD_REGISTRY[portal.targetWorldId];
      assert.ok(target, `Portal ${portal.id} targets invalid world ${portal.targetWorldId}`);
      assert.equal(target.status, "active", `Target world ${portal.targetWorldId} must be active`);
    });
  });
});
