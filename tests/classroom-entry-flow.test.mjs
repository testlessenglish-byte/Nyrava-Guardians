import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const classroom = readFileSync(new URL("../src/routes/classroom.tsx", import.meta.url), "utf8");
const academy = readFileSync(
  new URL("../src/components/academy/academy-course-dashboard.tsx", import.meta.url),
  "utf8",
);
const home = readFileSync(new URL("../src/routes/home.tsx", import.meta.url), "utf8");
const isla = readFileSync(new URL("../src/routes/isla.tsx", import.meta.url), "utf8");

test("classroom starts from saved room and has no in-room room switcher", () => {
  assert.match(classroom, /readSelectedClassroom/);
  assert.doesNotMatch(classroom, /Command Center.*Builder Lab.*Studio.*Truth Lab/s);
});

test("Academy owns classroom selection before navigation", () => {
  assert.match(academy, /CLASSROOM_ROOMS/);
  assert.match(academy, /selectClassroom\(room\)/);
  assert.match(academy, /Choose your classroom\. Enter\. Learn\./);
});

test("Guardian home uses authoritative progression instead of mock objectives", () => {
  assert.match(home, /getProgression/);
  assert.match(home, /certificateProgress/);
  assert.doesNotMatch(home, /MasteryService/);
  assert.doesNotMatch(home, /services\/mock/);
});

test("Isla renders real Nyrava logo overlays", () => {
  assert.match(isla, /IslaBrandOverlays/);
});
