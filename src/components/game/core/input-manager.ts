export interface GameInputState {
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  run: boolean;
  jump: boolean;
  interactPressed: boolean;
  menuPressed: boolean;
  inputMethod: "keyboard" | "mouse" | "touch";
}

let gameInputPaused = false;
const managers = new Set<InputManager>();

export function setGameInputPaused(paused: boolean) {
  gameInputPaused = paused;
  if (paused) {
    managers.forEach((manager) => manager.reset());
    if (typeof window !== "undefined") window.dispatchEvent(new Event("nyrava-input-reset"));
  }
}

export function isGameInputPaused() {
  return gameInputPaused;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
}

export class InputManager {
  private keys = new Set<string>();
  private prevInteract = false;
  private currentInteract = false;
  private queuedInteract = false;
  private enabled = true;

  /** Mutable targets consumed directly by touch controls without a React render loop. */
  readonly joystick = { x: 0, y: 0 };
  cameraYaw = 0;
  cameraPitch = 0.15;

  /** Backward-compatible channels kept temporarily for callers not yet migrated. */
  joystickX = 0;
  joystickY = 0;
  lookDeltaX = 0;
  lookDeltaY = 0;
  sprint = false;
  jump = false;
  inputMethod: "keyboard" | "mouse" | "touch" = "keyboard";

  constructor() {
    managers.add(this);
  }

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    if (!enabled) this.reset();
  }

  setCameraLook(deltaX: number, deltaY: number, sensitivity = 0.005) {
    if (!this.enabled || gameInputPaused) return;
    this.cameraYaw -= deltaX * sensitivity;
    this.cameraPitch = Math.min(
      0.85,
      Math.max(-0.15, this.cameraPitch + deltaY * sensitivity * 0.6),
    );
    this.inputMethod = "mouse";
  }

  triggerInteract() {
    if (!this.enabled || gameInputPaused) return;
    this.queuedInteract = true;
    this.inputMethod = "touch";
  }

  onKeyDown(e: KeyboardEvent) {
    if (!this.enabled || gameInputPaused || isTypingTarget(e.target)) return;
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      if (key.startsWith("arrow")) e.preventDefault();
      this.keys.add(key);
      this.inputMethod = "keyboard";
    }
    if (key === "shift") this.sprint = true;
    if (key === "e" && !e.repeat) {
      this.currentInteract = true;
      this.inputMethod = "keyboard";
    }
    if (e.code === "Space") {
      e.preventDefault();
      this.jump = true;
    }
  }

  onKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    this.keys.delete(key);
    if (key === "shift") this.sprint = false;
    if (key === "e") {
      this.currentInteract = false;
      this.prevInteract = false;
    }
    if (e.code === "Space") this.jump = false;
  }

  reset() {
    this.keys.clear();
    this.joystick.x = 0;
    this.joystick.y = 0;
    this.joystickX = 0;
    this.joystickY = 0;
    this.sprint = false;
    this.jump = false;
    this.prevInteract = false;
    this.currentInteract = false;
    this.queuedInteract = false;
  }

  dispose() {
    this.reset();
    managers.delete(this);
  }

  getSnapshot(): GameInputState {
    if (!this.enabled || gameInputPaused) {
      return {
        moveX: 0,
        moveY: 0,
        lookX: 0,
        lookY: 0,
        run: false,
        jump: false,
        interactPressed: false,
        menuPressed: gameInputPaused,
        inputMethod: this.inputMethod,
      };
    }

    let moveX = 0;
    let moveY = 0;
    if (this.keys.has("w") || this.keys.has("arrowup")) moveY += 1;
    if (this.keys.has("s") || this.keys.has("arrowdown")) moveY -= 1;
    if (this.keys.has("d") || this.keys.has("arrowright")) moveX += 1;
    if (this.keys.has("a") || this.keys.has("arrowleft")) moveX -= 1;

    const touchX = this.joystick.x + this.joystickX;
    const touchY = this.joystick.y + this.joystickY;
    if (Math.hypot(touchX, touchY) > 0.08) {
      moveX += touchX;
      moveY += -touchY;
      this.inputMethod = "touch";
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 1) {
      moveX /= len;
      moveY /= len;
    }

    const interactPressed = this.queuedInteract || (this.currentInteract && !this.prevInteract);
    this.queuedInteract = false;
    this.prevInteract = this.currentInteract;

    return {
      moveX,
      moveY,
      lookX: this.lookDeltaX,
      lookY: this.lookDeltaY,
      run: this.sprint,
      jump: this.jump,
      interactPressed,
      menuPressed: false,
      inputMethod: this.inputMethod,
    };
  }
}
