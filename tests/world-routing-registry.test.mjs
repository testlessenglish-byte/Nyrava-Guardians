import assert from "node:assert/strict";
import test from "node:test";
import { WORLD_REGISTRY, validateWorldRegistry } from "../src/domain/world/registry.ts";
import { getIsolatedWorldState, recordWorldActivityCompletion } from "../src/domain/world/progress.ts";

test("Nyrava Guardians — Authoritative World Registry & Routing Restructure", async (t) => {
  await t.test("1. World Registry contains all worlds including Nyrava Guardian Realm", () => {
    const keys = Object.keys(WORLD_REGISTRY);
    assert.equal(keys.length, 8, "Expected 8 worlds in authoritative registry");
    
    assert.ok(WORLD_REGISTRY["nyrava-guardian-realm"], "Missing Nyrava Guardian Realm");
    assert.ok(WORLD_REGISTRY["isla-central"], "Missing Isla Central Hub");
    assert.ok(WORLD_REGISTRY["central-city"], "Missing Digital Central City");
    assert.ok(WORLD_REGISTRY["wisdom-forest"], "Missing Wisdom Forest");
    assert.ok(WORLD_REGISTRY["history-valley"], "Missing History Valley");
    assert.ok(WORLD_REGISTRY["knowledge-mountains"], "Missing Knowledge Mountains");
    assert.ok(WORLD_REGISTRY["infinite-ocean"], "Missing Infinite Ocean");
    assert.ok(WORLD_REGISTRY["space-zone"], "Missing Space Zone");
  });

  await t.test("2. Registry validation passes with zero errors", () => {
    const validation = validateWorldRegistry();
    assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(", ")}`);
    assert.equal(validation.errors.length, 0);
  });

  await t.test("3. Every active world has an explicit route", () => {
    Object.values(WORLD_REGISTRY).forEach((world) => {
      assert.ok(world.route.startsWith("/world/") || world.route === "/realm", `Route must start with /world/ or be /realm, got ${world.route}`);
      assert.equal(world.route, world.slug === "nyrava-guardian-realm" ? "/realm" : `/world/${world.slug}`, `Route does not match slug for ${world.id}`);
      assert.equal(world.status, "active", `World ${world.id} status should be active`);
    });
  });

  await t.test("4. Isla Central Hub has 6 valid inter-world portals", () => {
    const hub = WORLD_REGISTRY["isla-central"];
    assert.equal(hub.portals.length, 6, "Isla Central Hub must have 6 inter-world portals");

    const targetWorlds = hub.portals.map((p) => p.targetWorldId);
    assert.ok(targetWorlds.includes("central-city"), "Missing Central City portal");
    assert.ok(targetWorlds.includes("wisdom-forest"), "Missing Wisdom Forest portal");
    assert.ok(targetWorlds.includes("history-valley"), "Missing History Valley portal");
    assert.ok(targetWorlds.includes("knowledge-mountains"), "Missing Knowledge Mountains portal");
    assert.ok(targetWorlds.includes("infinite-ocean"), "Missing Infinite Ocean portal");
    assert.ok(targetWorlds.includes("space-zone"), "Missing Space Zone portal");
  });

  await t.test("5. World progress is isolated per world ID", () => {
    const stateForest = getIsolatedWorldState("wisdom-forest");
    const stateCity = getIsolatedWorldState("central-city");

    assert.equal(stateForest.worldId, "wisdom-forest");
    assert.equal(stateCity.worldId, "central-city");

    recordWorldActivityCompletion("wisdom-forest", "test-forest-activity");
    
    const updatedForest = getIsolatedWorldState("wisdom-forest");
    const updatedCity = getIsolatedWorldState("central-city");

    assert.ok(updatedForest.completedActivities.includes("test-forest-activity"));
    assert.ok(!updatedCity.completedActivities.includes("test-forest-activity"), "City progress leaked into Forest state");
  });
});
