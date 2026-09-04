import { useSyncExternalStore } from "react";
import { type PlayerMode } from "@/components/game/core/player-state-machine";

export type GameStoreState = {
  mode: PlayerMode;
  playerPos: [number, number, number];
  cameraYaw: number;
  cameraPitch: number;
  activeSeatId: string | null;
  openDoorIds: Set<string>;
  activeInteraction: {
    id: string;
    type: string;
    label: { en: string; es: string };
    action: () => void;
  } | null;
};

let state: GameStoreState = {
  mode: "idle",
  playerPos: [0, 0, 0],
  cameraYaw: 0,
  cameraPitch: 0.15,
  activeSeatId: null,
  openDoorIds: new Set<string>(),
  activeInteraction: null,
};

const listeners = new Set<() => void>();

export function setGameState(patch: Partial<GameStoreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useGameStore(): GameStoreState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export const gameRuntime = {
  player: { x: 0, y: 0, z: 0 },
  cameraYaw: 0,
  cameraPitch: 0.15,
  mode: "idle" as PlayerMode,
};
