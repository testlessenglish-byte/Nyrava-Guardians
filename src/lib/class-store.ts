import { useSyncExternalStore } from "react";
import { getZone } from "@/lib/worlds";

export type ClassMessage = {
  id: string;
  from: "you" | string;
  name: string;
  text: string;
};

export type ClassState = {
  messages: ClassMessage[];
  nearby: string | null;
  speaking: string | null;
  thinking: boolean;
  voiceEnabled: boolean;
  listening: boolean;
  zone: string;
  travelTick: number;
};

let state: ClassState = {
  messages: [],
  nearby: null,
  speaking: null,
  thinking: false,
  voiceEnabled: false,
  listening: false,
  zone: "academy",
  travelTick: 0,
};

const listeners = new Set<() => void>();

export function setClassState(patch: Partial<ClassState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function pushMessage(message: Omit<ClassMessage, "id">) {
  state = {
    ...state,
    messages: [...state.messages, { ...message, id: crypto.randomUUID() }].slice(-30),
  };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useClassState(): ClassState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

/** Live movement + position channel shared between HUD and the 3D scene (no re-renders). */
export const controls = {
  keys: new Set<string>(),
  joystick: { x: 0, y: 0 },
  cameraYaw: 0,
  cameraPitch: 0.4,
  player: { x: 0, y: 0, z: 6 },
  spawn: { x: 0, z: 6 },
};

/** Travel to another world. Resets the player to the zone entrance. */
export function travelTo(zoneId: string) {
  if (state.zone === zoneId) return;
  const z = getZone(zoneId).radius * 0.62;
  controls.player.x = 0;
  controls.player.z = z;
  controls.spawn = { x: 0, z };
  setClassState({ zone: zoneId, nearby: null, travelTick: state.travelTick + 1 });
}
