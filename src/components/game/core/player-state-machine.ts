export type PlayerMode =
  "idle" | "walking" | "running" | "seated" | "interacting" | "conversation" | "course";

export function isMovementAllowed(mode: PlayerMode): boolean {
  return mode === "idle" || mode === "walking" || mode === "running";
}

export function isCameraRotationAllowed(mode: PlayerMode): boolean {
  return mode !== "course";
}

export function isInteractionAllowed(mode: PlayerMode): boolean {
  return mode === "idle" || mode === "walking" || mode === "running" || mode === "seated";
}
