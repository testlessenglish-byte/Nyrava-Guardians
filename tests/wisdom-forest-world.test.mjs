import assert from "node:assert/strict";
import test from "node:test";
import { WISDOM_FOREST_DISTRICTS } from "../src/data/wisdom-forest-districts.ts";

test("Nyrava Guardians — World 2: Wisdom Forest & Activity Engine", async (t) => {
  await t.test("1. Wisdom Forest contains all 7 distinct districts", () => {
    assert.equal(WISDOM_FOREST_DISTRICTS.length, 7, "Expected 7 distinct districts in Wisdom Forest");
    
    const districtIds = WISDOM_FOREST_DISTRICTS.map((d) => d.id);
    assert.ok(districtIds.includes("arrival-grove"), "Missing Arrival Grove");
    assert.ok(districtIds.includes("evidence-trail"), "Missing Evidence Trail");
    assert.ok(districtIds.includes("pattern-canopy"), "Missing Pattern Canopy");
    assert.ok(districtIds.includes("ecosystem-gardens"), "Missing Ecosystem Gardens");
    assert.ok(districtIds.includes("research-treehouses"), "Missing Research Treehouses");
    assert.ok(districtIds.includes("waterfall-archives"), "Missing Waterfall Archives");
    assert.ok(districtIds.includes("tree-sanctuary"), "Missing Tree of Wisdom Sanctuary");
  });

  await t.test("2. Every district has 3D coordinates, status, and valid descriptions", () => {
    WISDOM_FOREST_DISTRICTS.forEach((district) => {
      assert.ok(Array.isArray(district.pos) && district.pos.length === 3, `Invalid pos for ${district.name}`);
      assert.ok(district.description.length > 10, `Description too short for ${district.name}`);
      assert.equal(district.status, "unlocked", `District ${district.name} should be unlocked`);
    });
  });

  await t.test("3. Core interactive activities are mapped to their respective districts", () => {
    const grove = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "arrival-grove");
    assert.equal(grove?.activityKey, "seed-rescue", "Arrival Grove should map to seed-rescue");

    const evidence = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "evidence-trail");
    assert.equal(evidence?.activityKey, "evidence-trail", "Evidence Trail should map to evidence-trail");

    const pattern = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "pattern-canopy");
    assert.equal(pattern?.activityKey, "pattern-grove", "Pattern Canopy should map to pattern-grove");

    const eco = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "ecosystem-gardens");
    assert.equal(eco?.activityKey, "ecosystem-balance", "Ecosystem Gardens should map to ecosystem-balance");

    const research = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "research-treehouses");
    assert.equal(research?.activityKey, "research-station", "Research Treehouses should map to research-station");

    const archive = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "waterfall-archives");
    assert.equal(archive?.activityKey, "source-signal", "Waterfall Archives should map to source-signal");

    const sanctuary = WISDOM_FOREST_DISTRICTS.find((d) => d.id === "tree-sanctuary");
    assert.equal(sanctuary?.activityKey, "wisdom-mastery", "Sanctuary should map to wisdom-mastery");
  });
});
