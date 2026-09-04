import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { isRoomPositionColliding } from "../src/components/game/player/classroom-collision.ts";
import {
  FOUNDATION_CERTIFICATE,
  FOUNDATION_MISSIONS,
  missions,
} from "../src/domain/progression/catalog.ts";

test("only one authoritative classroom scene renders and SecurityClassroomCorrection patch component is removed", () => {
  const patchPath = path.resolve("src/components/meta/security-classroom-correction.tsx");
  assert.equal(
    fs.existsSync(patchPath),
    false,
    "Patch component security-classroom-correction.tsx must be completely deleted.",
  );

  const classroomRoutePath = path.resolve("src/routes/classroom.tsx");
  const routeContent = fs.readFileSync(classroomRoutePath, "utf8");
  assert.equal(
    routeContent.includes("SecurityClassroomCorrection"),
    false,
    "classroom.tsx must not import SecurityClassroomCorrection.",
  );
});

test("classroom has zero doors and no door prompts", () => {
  const setPath = path.resolve("src/components/meta/academy-classroom-set.tsx");
  const setContent = fs.readFileSync(setPath, "utf8");
  assert.match(setContent, /CLASSROOM_DOORS: DoorData\[\] = \[\]/);

  const scenePath = path.resolve("src/components/meta/classroom-scene.tsx");
  const sceneContent = fs.readFileSync(scenePath, "utf8");
  assert.equal(
    sceneContent.includes("Press E to Open Door"),
    false,
    "Must not contain door prompts.",
  );
});

test("digital safety foundations sign is completely removed from classroom set", () => {
  const setPath = path.resolve("src/components/meta/academy-classroom-set.tsx");
  const content = fs.readFileSync(setPath, "utf8");
  assert.equal(
    content.includes("DIGITAL SAFETY FOUNDATIONS"),
    false,
    "DIGITAL SAFETY FOUNDATIONS sign must be completely removed.",
  );
  assert.equal(
    content.includes("LessonBoard"),
    false,
    "The classroom set must not render a lesson board component.",
  );
});

test("classroom scene renders 3D world-space text for teacher and player labels without 2D HTML occlusion", () => {
  const scenePath = path.resolve("src/components/meta/classroom-scene.tsx");
  const content = fs.readFileSync(scenePath, "utf8");

  assert.match(content, /Text font/);
  assert.equal(content.includes("occlude={false}"), false, "Labels must not disable occlusion.");
});

test("player spawn and travel bounds keep player inside classroom and prevent wall clipping", () => {
  const spawn = new THREE.Vector3(0, 0, 5.0);
  const openDoors = new Set();

  assert.equal(isRoomPositionColliding("security", spawn, openDoors, 0.45), false);
  assert.equal(
    isRoomPositionColliding("security", new THREE.Vector3(0, 0, -9.8), openDoors, 0.45),
    true,
  );
  assert.equal(
    isRoomPositionColliding("security", new THREE.Vector3(-13.0, 0, 0), openDoors, 0.45),
    true,
  );
  assert.equal(
    isRoomPositionColliding("security", new THREE.Vector3(0, 0, 9.8), openDoors, 0.45),
    true,
  );
});

test("existing progression and certificate rules remain intact", () => {
  assert.equal(missions.length >= 3, true);
  assert.equal(FOUNDATION_MISSIONS.length, 3);
  assert.equal(FOUNDATION_CERTIFICATE.id, "digital-safety-foundations");
});
