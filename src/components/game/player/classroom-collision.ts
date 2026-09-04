import * as THREE from "three";

export type ClassroomCollisionRoom = "security" | "builder" | "communication" | "truth";

export type BoxCollider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

/**
 * Bounded classroom travel boundaries.
 * Player remains strictly on the walkable floor inside the room shell.
 */
export const CLASSROOM_TRAVEL_BOUNDS = {
  minX: -12.3,
  maxX: 12.3,
  minZ: -9.2,
  maxZ: 9.2,
};

export const CLASSROOM_BOUNDS = CLASSROOM_TRAVEL_BOUNDS;

const WALL_X = 12.5;
const WALL_Z = 9.5;
const WALL_HALF_THICKNESS = 0.22;

const SECURITY_INTERIOR: BoxCollider[] = [
  // Front teaching podium for Sarah
  { minX: -5.8, maxX: -2.2, minZ: -7.5, maxZ: -5.2 },
  // Student desks
  { minX: -7.9, maxX: -5.1, minZ: 1.65, maxZ: 3.35 },
  { minX: -7.9, maxX: -5.1, minZ: 5.15, maxZ: 6.85 },
  { minX: 5.1, maxX: 7.9, minZ: 1.65, maxZ: 3.35 },
  { minX: 5.1, maxX: 7.9, minZ: 5.15, maxZ: 6.85 },
  // Mission Hub portal base
  { minX: 10.5, maxX: 12.4, minZ: 0.65, maxZ: 3.35 },
];

export const CLASSROOM_COLLIDERS = SECURITY_INTERIOR;

const SIMPLE_ROOM_INTERIOR: BoxCollider[] = [{ minX: -5.8, maxX: -2.2, minZ: -7.5, maxZ: -5.2 }];

const SECURITY_SEATS: Array<[number, number]> = [
  [-6.5, 3.9],
  [-5.3, 3.9],
  [-6.5, 7.4],
  [-5.3, 7.4],
  [5.3, 3.9],
  [6.5, 3.9],
];

const STANDARD_SEATS: Array<[number, number]> = [
  [-6.5, 3.9],
  [-5.3, 3.9],
  [5.3, 3.9],
  [6.5, 3.9],
];

function overlapsBox(pos: THREE.Vector3, box: BoxCollider, radius: number) {
  return (
    pos.x + radius > box.minX &&
    pos.x - radius < box.maxX &&
    pos.z + radius > box.minZ &&
    pos.z - radius < box.maxZ
  );
}

function collidesWithSeat(pos: THREE.Vector3, room: ClassroomCollisionRoom, radius: number) {
  const seats = room === "security" ? SECURITY_SEATS : STANDARD_SEATS;
  const seatRadius = 0.42;
  for (const [x, z] of seats) {
    if (Math.hypot(pos.x - x, pos.z - z) < radius + seatRadius) return true;
  }
  return false;
}

function isInsideApprovedWalkZone(
  _room: ClassroomCollisionRoom,
  pos: THREE.Vector3,
  radius: number,
) {
  return (
    pos.x >= -WALL_X + radius &&
    pos.x <= WALL_X - radius &&
    pos.z >= -WALL_Z + radius &&
    pos.z <= WALL_Z - radius
  );
}

function collidesWithShell(_room: ClassroomCollisionRoom, pos: THREE.Vector3, radius: number) {
  const touchingRearWall = pos.z + radius > WALL_Z - WALL_HALF_THICKNESS;
  if (touchingRearWall) return true;

  const touchingFrontWall = pos.z - radius < -WALL_Z + WALL_HALF_THICKNESS;
  if (touchingFrontWall) return true;

  const touchingLeftWall = pos.x - radius < -WALL_X + WALL_HALF_THICKNESS;
  if (touchingLeftWall) return true;

  const touchingRightWall = pos.x + radius > WALL_X - WALL_HALF_THICKNESS;
  if (touchingRightWall) return true;

  return false;
}

export function isRoomPositionColliding(
  room: ClassroomCollisionRoom,
  pos: THREE.Vector3,
  _openDoorIds: ReadonlySet<string> = new Set<string>(),
  playerRadius = 0.45,
): boolean {
  if (!isInsideApprovedWalkZone(room, pos, playerRadius)) return true;
  if (collidesWithShell(room, pos, playerRadius)) return true;

  const interior = room === "security" ? SECURITY_INTERIOR : SIMPLE_ROOM_INTERIOR;
  for (const box of interior) {
    if (overlapsBox(pos, box, playerRadius)) return true;
  }

  return collidesWithSeat(pos, room, playerRadius);
}

export function isPositionColliding(pos: THREE.Vector3, playerRadius = 0.5): boolean {
  return isRoomPositionColliding("security", pos, new Set<string>(), playerRadius);
}
