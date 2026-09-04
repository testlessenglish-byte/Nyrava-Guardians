import test from "node:test";
import assert from "node:assert/strict";
import {
  AdventureMusic,
  notesForStep,
  MUSIC_STEP_SECONDS,
} from "../src/services/audio/adventure-music.ts";
test("original theme loops and includes rests rather than continuous humming", () => {
  assert.deepEqual(notesForStep(0), notesForStep(64));
  assert.equal(notesForStep(31).length, 0);
  assert.ok(MUSIC_STEP_SECONDS > 0.25);
  for (let step = 0; step < 64; step++) {
    for (const note of notesForStep(step)) {
      assert.ok(note.length < 0.5 && note.length > 0);
      assert.ok(note.midi >= 40 && note.midi <= 84);
    }
  }
});
test("music start is idempotent and stop releases every scheduled voice", () => {
  let created = 0,
    disconnected = 0;
  const context = {
    state: "running",
    currentTime: 0,
    createOscillator() {
      created++;
      return {
        frequency: { value: 0 },
        connect() {},
        start() {},
        stop() {},
        disconnect() {
          disconnected++;
        },
      };
    },
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    },
  };
  const music = new AdventureMusic(context, {});
  try {
    music.start();
    assert.equal(created, 2);
    music.start();
    assert.equal(created, 2, "a second gesture must not stack another soundtrack");
  } finally {
    music.stop();
  }
  assert.equal(disconnected, created);
  music.stop();
  assert.equal(disconnected, created);
});
