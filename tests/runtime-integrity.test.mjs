import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { InputManager } from "../src/components/game/core/input-manager.ts";
import { isRoomPositionColliding } from "../src/components/game/player/classroom-collision.ts";

test("keyboard interact is consumed exactly once per physical E press", () => {
  const manager = new InputManager();
  manager.onKeyDown({ key: "e", code: "KeyE", repeat: false });
  let snapshot = manager.getSnapshot();
  assert.equal(snapshot.interactPressed, true);

  snapshot = manager.getSnapshot();
  assert.equal(snapshot.interactPressed, false);

  manager.onKeyDown({ key: "e", code: "KeyE", repeat: true });
  snapshot = manager.getSnapshot();
  assert.equal(snapshot.interactPressed, false);
  manager.dispose();
});

test("touch interact is queued for one frame only", () => {
  const manager = new InputManager();
  manager.triggerInteract();
  let snapshot = manager.getSnapshot();
  assert.equal(snapshot.interactPressed, true);

  snapshot = manager.getSnapshot();
  assert.equal(snapshot.interactPressed, false);
  manager.dispose();
});

test("disabled runtime input cannot move or interact", () => {
  const manager = new InputManager();
  manager.setEnabled(false);
  manager.onKeyDown({ key: "w", code: "KeyW", repeat: false });
  manager.triggerInteract();

  const snapshot = manager.getSnapshot();
  assert.equal(snapshot.moveY, 0);
  assert.equal(snapshot.interactPressed, false);
  manager.dispose();
});

test("solid rear classroom wall blocks rear boundary", () => {
  const position = new THREE.Vector3(0, 0, 9.8);
  assert.equal(isRoomPositionColliding("security", position, new Set()), true);
});

test("solid side walls block left and right room boundaries", () => {
  assert.equal(
    isRoomPositionColliding("security", new THREE.Vector3(12.95, 0, 0), new Set()),
    true,
  );
  assert.equal(
    isRoomPositionColliding("security", new THREE.Vector3(-12.95, 0, 0), new Set()),
    true,
  );
});

test("non-security rooms use their own stage and seat collision", () => {
  assert.equal(
    isRoomPositionColliding("builder", new THREE.Vector3(-4.0, 0, -6.2), new Set()),
    true,
  );
  assert.equal(
    isRoomPositionColliding("builder", new THREE.Vector3(-6.5, 0, 3.9), new Set()),
    true,
  );
  assert.equal(isRoomPositionColliding("builder", new THREE.Vector3(0, 0, 4.5), new Set()), false);
});
