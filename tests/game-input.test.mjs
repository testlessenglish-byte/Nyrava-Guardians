import test from "node:test";
import assert from "node:assert/strict";
import {
  analogVector,
  cameraMovement,
  cameraLook,
  PointerOwner,
} from "../src/services/game/input.ts";

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
test("joystick has a dead zone and preserves partial speed", () => {
  assert.deepEqual(analogVector(0.05, 0.05), { x: 0, y: 0 });
  const partial = analogVector(0.5, 0);
  assert.ok(partial.x > 0 && partial.x < 1);
  close(Math.hypot(...Object.values(analogVector(5, -5))), 1);
  assert.deepEqual(analogVector(NaN, 0), { x: 0, y: 0 });
});
test("360 degree movement follows camera yaw", () => {
  for (let step = 0; step < 16; step++) {
    const yaw = (step * Math.PI) / 8;
    const movement = cameraMovement(0, 1, yaw);
    close(movement.x, -Math.sin(yaw));
    close(movement.z, -Math.cos(yaw));
    close(Math.hypot(movement.x, movement.z), 1);
  }
});
test("diagonal movement is capped, analog movement is not inflated", () => {
  close(Math.hypot(...Object.values(cameraMovement(1, 1, 0)).slice(0, 2)), 1);
  const m = cameraMovement(0, 0.25, 0);
  close(m.z, -0.25);
  close(m.magnitude, 0.25);
});
test("back and strafe directions are camera relative", () => {
  close(cameraMovement(0, -1, 0).z, 1);
  close(cameraMovement(1, 0, Math.PI / 2).z, -1);
  close(cameraMovement(-1, 0, 0).x, -1);
});
test("camera yaw changes independently and pitch stays within limits", () => {
  close(cameraLook(0, 0.4, 100, 0).yaw, -0.5);
  close(cameraLook(0, 0.4, 0, 10000).pitch, 0.85);
  close(cameraLook(0, 0.4, 0, -10000).pitch, -0.15);
});
test("two thumbs own independent surfaces; a third finger cannot steal either", () => {
  const move = new PointerOwner(),
    look = new PointerOwner();
  assert.equal(move.claim(1), true);
  assert.equal(look.claim(2), true);
  assert.equal(move.claim(3), false);
  assert.equal(move.release(2), false);
  assert.equal(move.owns(1), true);
  assert.equal(look.owns(2), true);
  move.release(1);
  assert.equal(look.owns(2), true);
});
test("cancel/blur reset releases ownership for the next gesture", () => {
  const pointer = new PointerOwner();
  pointer.claim(12);
  pointer.release();
  assert.equal(pointer.id, null);
  assert.equal(pointer.claim(13), true);
});
