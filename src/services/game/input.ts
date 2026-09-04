export type Vector2 = { x: number; y: number };

export function analogVector(x: number, y: number, deadZone = 0.12): Vector2 {
  const length = Math.hypot(x, y);
  if (!Number.isFinite(length) || length <= deadZone) return { x: 0, y: 0 };
  const magnitude = (Math.min(1, length) - deadZone) / (1 - deadZone);
  return { x: (x / length) * magnitude, y: (y / length) * magnitude };
}

/** Forward is negative Z at yaw zero. Retain analog magnitude, clamp diagonals. */
export function cameraMovement(x: number, forward: number, yaw: number) {
  const length = Math.hypot(x, forward);
  const scale = length > 1 ? 1 / length : 1;
  return {
    x: (x * Math.cos(yaw) - forward * Math.sin(yaw)) * scale,
    z: (-x * Math.sin(yaw) - forward * Math.cos(yaw)) * scale,
    magnitude: Math.min(length, 1),
  };
}

export function cameraLook(
  yaw: number,
  pitch: number,
  dx: number,
  dy: number,
  sensitivity = 0.005,
) {
  return {
    yaw: yaw - dx * sensitivity,
    pitch: Math.min(0.85, Math.max(-0.15, pitch + dy * sensitivity * 0.6)),
  };
}

/** Each surface owns exactly one pointer; other fingers cannot steal or release it. */
export class PointerOwner {
  id: number | null = null;
  claim(id: number) {
    if (this.id !== null) return false;
    this.id = id;
    return true;
  }
  owns(id: number) {
    return this.id === id;
  }
  release(id?: number) {
    if (id !== undefined && !this.owns(id)) return false;
    this.id = null;
    return true;
  }
}

export function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))
  );
}
