import test from "node:test";
import assert from "node:assert/strict";
import { toggleGamePanel } from "../src/services/game/panels.ts";

test("opening a HUD drawer closes the other drawers and releases movement", () => {
  const events = [];
  const previous = globalThis.window;
  globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
  try {
    const mission = { open: true };
    const voice = { open: true };
    const settings = {
      open: true,
      closest: () => ({ querySelectorAll: () => [mission, voice, settings] }),
    };
    toggleGamePanel(settings);
    assert.equal(mission.open, false);
    assert.equal(voice.open, false);
    assert.equal(settings.open, true);
    assert.deepEqual(events, ["nyrava-input-reset"]);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test("closing a HUD drawer does not close another drawer or reset input again", () => {
  toggleGamePanel({ open: false, closest: () => assert.fail("must not inspect other drawers") });
});
