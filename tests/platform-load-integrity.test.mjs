import test from "node:test";
import assert from "node:assert/strict";
import { isImmersiveGameRoute } from "../src/lib/game-route.ts";
import { initialQuality } from "../src/services/game/quality.ts";

test("all real-time 3D routes use immersive full-screen mode", () => {
  for (const route of ["/isla", "/classroom", "/missions", "/city", "/home-hq"]) {
    assert.equal(isImmersiveGameRoute(route), true, `${route} must be immersive`);
  }
});

test("ordinary application routes stay in the standard shell", () => {
  for (const route of ["/", "/home", "/academy", "/account", "/admin", "/builder", "/core"]) {
    assert.equal(isImmersiveGameRoute(route), false, `${route} must not be immersive`);
  }
});

test("nested immersive paths remain full-screen", () => {
  assert.equal(isImmersiveGameRoute("/classroom/course"), true);
  assert.equal(isImmersiveGameRoute("/missions/story"), true);
});

test("automatic quality selection never starts at HIGH", () => {
  assert.equal(initialQuality(16, 16, false), "MEDIUM");
  assert.equal(initialQuality(8, 8, true), "MEDIUM");
  assert.equal(initialQuality(4, 8, false), "LOW");
  assert.equal(initialQuality(16, 4, false), "LOW");
});
