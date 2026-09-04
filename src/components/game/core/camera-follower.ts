import * as THREE from "three";

const tempDesiredCamPos = new THREE.Vector3();
const tempTargetPos = new THREE.Vector3();
const tempTargetOffset = new THREE.Vector3();
const tempRayDirection = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const EMPTY_COLLISION_OBJECTS: THREE.Object3D[] = [];

export function updateThirdPersonCamera(
  camera: THREE.PerspectiveCamera,
  playerPos: THREE.Vector3,
  yaw: number,
  pitch: number,
  delta: number,
  distance = 4.5,
  targetHeight = 1.5,
  collisionObjects: THREE.Object3D[] = EMPTY_COLLISION_OBJECTS,
  roomBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  },
) {
  tempTargetOffset.set(0, targetHeight, 0);
  tempTargetPos.copy(playerPos).add(tempTargetOffset);

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  const offsetX = Math.sin(yaw) * distance * cosPitch;
  const offsetZ = Math.cos(yaw) * distance * cosPitch;
  const offsetY = distance * sinPitch;

  tempDesiredCamPos.set(
    tempTargetPos.x + offsetX,
    tempTargetPos.y + offsetY,
    tempTargetPos.z + offsetZ,
  );

  if (roomBounds) {
    tempDesiredCamPos.x = THREE.MathUtils.clamp(
      tempDesiredCamPos.x,
      roomBounds.minX,
      roomBounds.maxX,
    );
    tempDesiredCamPos.y = THREE.MathUtils.clamp(
      tempDesiredCamPos.y,
      roomBounds.minY,
      roomBounds.maxY,
    );
    tempDesiredCamPos.z = THREE.MathUtils.clamp(
      tempDesiredCamPos.z,
      roomBounds.minZ,
      roomBounds.maxZ,
    );
  }

  tempRayDirection.subVectors(tempDesiredCamPos, tempTargetPos);
  const maxDist = tempRayDirection.length();

  if (maxDist > 0.001 && collisionObjects.length > 0) {
    tempRayDirection.normalize();
    raycaster.set(tempTargetPos, tempRayDirection);
    raycaster.far = maxDist;

    const intersects = raycaster.intersectObjects(collisionObjects, true);
    if (intersects.length > 0 && intersects[0]?.distance !== undefined) {
      const safeDist = Math.max(1.2, intersects[0].distance - 0.3);
      tempDesiredCamPos.copy(tempTargetPos).addScaledVector(tempRayDirection, safeDist);
    }
  }

  camera.position.lerp(tempDesiredCamPos, 1 - Math.exp(-12 * delta));
  camera.lookAt(tempTargetPos);
}
