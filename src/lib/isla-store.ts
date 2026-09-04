import { useSyncExternalStore } from "react";
import { CRYSTALS, REGIONS, type RegionId } from "@/data/isla";
import { loadIslaCloud, saveIslaCloud } from "@/lib/cloud-save";
import { readLocal, writeLocal, hydrateNativeProgress } from "@/services/platform/storage";

/**
 * PLAYER PROGRESS for World 1. Pure state + localStorage persistence.
 * Antigravity replaces the persist functions with the real profile service;
 * nothing in the renderer or HUD talks to storage directly.
 */

export type MasteryEvidence = {
  skill: string;
  source: string;
  at: number;
};

export type NearTarget =
  | { kind: "crystal" | "secret"; id: string; label: string }
  | { kind: "academy"; id: "academy"; label: string }
  | { kind: "journey"; id: "journey-board"; label: string }
  | null;

export type IslaState = {
  crystals: string[];
  secrets: string[];
  solved: string[];
  hints: Record<string, number>;
  visited: RegionId[];
  mastery: MasteryEvidence[];
  xp: number;
  classComplete: boolean;
  /** transient */
  near: NearTarget;
  /** Guardian station the player is standing next to (conversation starts only on click/E). */
  nearGuardian: string | null;
  region: RegionId;
  toast: { title: string; body: string } | null;
  challengeFor: string | null;
  reporting: boolean;
};

const KEY = "nyrava.isla.v1";

const initial: IslaState = {
  crystals: [],
  secrets: [],
  solved: [],
  hints: {},
  visited: ["city"],
  mastery: [],
  xp: 0,
  classComplete: false,
  near: null,
  nearGuardian: null,
  region: "city",
  toast: null,
  challengeFor: null,
  reporting: false,
};

let state: IslaState = initial;
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  const { crystals, secrets, solved, hints, visited, mastery, xp, classComplete } = state;
  writeLocal(
    KEY,
    JSON.stringify({ crystals, secrets, solved, hints, visited, mastery, xp, classComplete }),
  );
  saveIslaCloud({ crystals, secrets, solved, hints, visited, mastery, xp, classComplete });
}

export async function hydrateIsla() {
  if (typeof window === "undefined") return;
  await hydrateNativeProgress();
  const raw = readLocal(KEY);
  try {
    if (raw) state = { ...state, ...(JSON.parse(raw) as Partial<IslaState>) };
    emit();
  } catch {
    /* corrupt save — start fresh */
  }
  // Cloud save wins when the signed-in account is further along than this device.
  void loadIslaCloud()
    .then((cloud) => {
      if (!cloud) return;
      if ((cloud.xp ?? 0) < state.xp) {
        persist();
        return;
      }
      state = { ...state, ...(cloud as Partial<IslaState>) };
      emit();
    })
    .catch(() => console.warn("Cloud progress unavailable; keeping local progress."));
}

export function patchIsla(patch: Partial<IslaState>) {
  state = { ...state, ...patch };
  emit();
}

export function useIsla(): IslaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function getIsla() {
  return state;
}

/** The crystal the child is currently hunting (they are found in clue order). */
export function activeCrystal() {
  return CRYSTALS.find((c) => !state.crystals.includes(c.id)) ?? null;
}

export function enterRegion(region: RegionId) {
  if (state.region === region) return;
  const visited = state.visited.includes(region) ? state.visited : [...state.visited, region];
  const first = !state.visited.includes(region);
  state = {
    ...state,
    region,
    visited,
    toast: first
      ? {
          title: `Region discovered — ${REGIONS.find((r) => r.id === region)?.name}`,
          body: REGIONS.find((r) => r.id === region)?.tagline ?? "",
        }
      : state.toast,
    xp: state.xp + (first ? 25 : 0),
  };
  emit();
  if (first) persist();
}

export function isRegionLocked(region: RegionId) {
  const lock = REGIONS.find((r) => r.id === region)?.lock;
  if (!lock) return false;
  return state.crystals.length < lock.requires;
}

export function requestHint(crystalId: string) {
  const level = Math.min(3, (state.hints[crystalId] ?? 0) + 1);
  state = { ...state, hints: { ...state.hints, [crystalId]: level } };
  emit();
  persist();
  return level;
}

/** Opens the challenge gate if the crystal has one, otherwise collects it. */
export function tryCollectCrystal(id: string) {
  const crystal = CRYSTALS.find((c) => c.id === id);
  if (!crystal || state.crystals.includes(id)) return;
  if (crystal.challenge && !state.solved.includes(id)) {
    patchIsla({ challengeFor: id });
    return;
  }
  collectCrystal(id);
}

export function collectCrystal(id: string) {
  const crystal = CRYSTALS.find((c) => c.id === id);
  if (!crystal || state.crystals.includes(id)) return;
  state = {
    ...state,
    crystals: [...state.crystals, id],
    xp: state.xp + 120,
    near: null,
    challengeFor: null,
    toast: { title: `🔷 ${crystal.name} found`, body: crystal.guardianLine },
  };
  emit();
  persist();
}

export function collectSecret(id: string, name: string, note: string) {
  if (state.secrets.includes(id)) return;
  state = {
    ...state,
    secrets: [...state.secrets, id],
    xp: state.xp + 60,
    near: null,
    toast: { title: `✨ ${name} discovered`, body: note },
  };
  emit();
  persist();
}

export function recordMastery(skill: string, source: string) {
  state = {
    ...state,
    mastery: [...state.mastery, { skill, source, at: Date.now() }],
    solved: state.solved.includes(source) ? state.solved : [...state.solved, source],
  };
  emit();
  persist();
}

export function completeClass() {
  if (state.classComplete) return;
  state = {
    ...state,
    classComplete: true,
    reporting: false,
    xp: state.xp + 400,
    toast: { title: "🎉 Class complete — Discover Isla Central", body: "Your Guardian just grew." },
  };
  emit();
  persist();
}

export function clearToast() {
  patchIsla({ toast: null });
}

export function resetIsla() {
  state = { ...initial };
  emit();
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

/** Live movement channel — never triggers React renders. */
export const islaControls = {
  keys: new Set<string>(),
  joystick: { x: 0, y: 0 },
  cameraYaw: 0,
  player: { x: 0, y: 0, z: 12 },
  interact: false,
  /** Camera distance behind the avatar; 0 = first person (avatar's eyes). */
  camDistance: 15,
  view: "third" as "third" | "first",
  cameraPitch: 0.34,
  jump: false,
  sprint: false,
  /** Click-to-walk destination in world space, cleared on arrival. */
  moveTarget: null as { x: number; z: number } | null,
  /** Set while the pointer is being dragged so a look-around isn't read as a click. */
  dragged: false,
};

export function resetIslaControls() {
  islaControls.keys.clear();
  islaControls.joystick.x = 0;
  islaControls.joystick.y = 0;
  islaControls.jump = false;
  islaControls.sprint = false;
  islaControls.interact = false;
  islaControls.moveTarget = null;
  islaControls.dragged = false;
}

/** Toggle between third-person and the avatar's own eyes. */
export function toggleIslaView() {
  islaControls.view = islaControls.view === "third" ? "first" : "third";
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("isla-view", { detail: islaControls.view }));
  }
}
