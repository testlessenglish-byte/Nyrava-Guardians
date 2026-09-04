import * as THREE from "three";

const CAMERA_TARGET_HEIGHT = 1.5;
const CAMERA_DISTANCE = 5.5;
const CAMERA_HEIGHT = 2.8;
const CAMERA_SMOOTHNESS = 12;

const tempTarget = new THREE.Vector3();
const tempOffset = new THREE.Vector3();
const tempDesiredCamPos = new THREE.Vector3();
const tempRayDir = new THREE.Vector3();
const tempEuler = new THREE.Euler(0, 0, 0, "YXZ");
const cameraRaycaster = new THREE.Raycaster();

export function updateFollowCamera(
  camera: THREE.PerspectiveCamera,
  playerPosition: THREE.Vector3,
  yaw: number,
  pitch: number,
  delta: number,
  colliders?: THREE.Object3D[],
) {
  // 1. Target torso / shoulders
  tempTarget.copy(playerPosition);
  tempTarget.y += CAMERA_TARGET_HEIGHT;

  // 2. Clamp pitch
  const clampedPitch = THREE.MathUtils.clamp(
    pitch,
    THREE.MathUtils.degToRad(-20),
    THREE.MathUtils.degToRad(65),
  );

  // 3. Compute desired camera position offset using spherical Euler angles
  tempOffset.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
  tempEuler.set(clampedPitch, yaw, 0, "YXZ");
  tempOffset.applyEuler(tempEuler);

  tempDesiredCamPos.copy(tempTarget).add(tempOffset);

  // 4. Camera collision raycasting
  if (colliders && colliders.length > 0) {
    tempRayDir.subVectors(tempDesiredCamPos, tempTarget);
    const maxDist = tempRayDir.length();
    if (maxDist > 0.001) {
      tempRayDir.normalize();
      cameraRaycaster.set(tempTarget, tempRayDir);
      cameraRaycaster.far = maxDist;

      const intersects = cameraRaycaster.intersectObjects(colliders, true);
      if (intersects.length > 0 && intersects[0]!.distance < maxDist) {
        // Position camera slightly in front of the hit point
        const hitDist = Math.max(0.6, intersects[0]!.distance - 0.3);
        tempDesiredCamPos.copy(tempTarget).addScaledVector(tempRayDir, hitDist);
      }
    }
  }

  // 5. Smooth lerp position & lookAt
  camera.position.lerp(tempDesiredCamPos, 1 - Math.exp(-CAMERA_SMOOTHNESS * delta));
  camera.lookAt(tempTarget);
}
