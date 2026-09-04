import assert from "node:assert/strict";
import test from "node:test";
import { CITY_DISTRICTS } from "../src/data/city-districts.ts";

test("Nyrava Guardians — World 1: Isla Central & City Activity Engine", async (t) => {
  await t.test("1. Isla Central contains all 8 distinct districts", () => {
    assert.equal(CITY_DISTRICTS.length, 8, "Expected 8 distinct districts in Isla Central");
    
    const districtIds = CITY_DISTRICTS.map((d) => d.id);
    assert.ok(districtIds.includes("arrival-plaza"), "Missing Arrival Plaza");
    assert.ok(districtIds.includes("digital-safety"), "Missing Digital Safety Training District");
    assert.ok(districtIds.includes("academy-district"), "Missing Academy District");
    assert.ok(districtIds.includes("mission-hub"), "Missing Mission Hub District");
    assert.ok(districtIds.includes("builder-lab"), "Missing Builder Lab District");
    assert.ok(districtIds.includes("guardian-gardens"), "Missing Guardian Gardens");
    assert.ok(districtIds.includes("portal-concourse"), "Missing Portal Concourse");
    assert.ok(districtIds.includes("central-tower"), "Missing Central Nyrava Tower");
  });

  await t.test("2. Every district has 3D coordinates and valid descriptions", () => {
    CITY_DISTRICTS.forEach((district) => {
      assert.ok(Array.isArray(district.pos) && district.pos.length === 3, `Invalid pos for ${district.name}`);
      assert.ok(district.description.length > 10, `Description too short for ${district.name}`);
      assert.equal(district.status, "unlocked", `District ${district.name} should be unlocked`);
    });
  });

  await t.test("3. Core interactive activities are mapped to their respective districts", () => {
    const safety = CITY_DISTRICTS.find((d) => d.id === "digital-safety");
    assert.equal(safety?.activityKey, "phishing-detective", "Digital Safety should map to phishing-detective");

    const academy = CITY_DISTRICTS.find((d) => d.id === "academy-district");
    assert.equal(academy?.activityKey, "password-lab", "Academy should map to password-lab");

    const builder = CITY_DISTRICTS.find((d) => d.id === "builder-lab");
    assert.equal(builder?.activityKey, "privacy-sort", "Builder Lab should map to privacy-sort");

    const gardens = CITY_DISTRICTS.find((d) => d.id === "guardian-gardens");
    assert.equal(gardens?.activityKey, "safe-messaging", "Gardens should map to safe-messaging");

    const tower = CITY_DISTRICTS.find((d) => d.id === "central-tower");
    assert.equal(tower?.activityKey, "tower-challenge", "Central Tower should map to tower-challenge");
  });
});
