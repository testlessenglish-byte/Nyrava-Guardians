import test from "node:test";
import assert from "node:assert/strict";
import { quietStartup } from "../src/services/audio/audio-policy.ts";

test("startup is quiet even when older settings enabled the continuous hum", () => {
  const saved = { backgroundMusic: true, sfxVolume: 0.7, voiceVolume: 0.9 };
  assert.deepEqual(quietStartup(saved), { ...saved, backgroundMusic: false });
  assert.equal(saved.backgroundMusic, true, "do not mutate callers' preferences");
});
test("quiet startup keeps sound effects and voice settings", () => {
  const saved = { backgroundMusic: false, soundEffects: true, voiceVolume: 0.5 };
  assert.deepEqual(quietStartup(saved), saved);
});
