import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const scene = readFileSync(
  new URL("../src/components/missions/mission-hub-scene.tsx", import.meta.url),
  "utf8",
);
const route = readFileSync(new URL("../src/routes/missions.tsx", import.meta.url), "utf8");

test("Mission Hub permanent signage uses world-space text instead of giant HTML boards", () => {
  assert.match(scene, /MISSION COMMAND CENTER/);
  assert.match(scene, /<Text/);
  assert.doesNotMatch(scene, /w-\[820px\]/);
});

test("Mission Hub player label does not append Guardian name", () => {
  assert.match(route, /const playerLabel = guardianName \|\|/);
  assert.doesNotMatch(route, /guardianName \|\| \(es \? "Tú" : "You"\)\}\$\{chosen/);
});

test("Mission Hub configures player spawn and floor height evaluation", () => {
  assert.match(scene, /getSurfaceHeight/);
  assert.match(scene, /PLAYER_SPAWN/);
});
