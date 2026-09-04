export interface SingleWorldState {
  worldId: string;
  discovered: boolean;
  checkpoint: [number, number, number];
  completedDistricts: string[];
  completedActivities: string[];
  collectedItems: string[];
  completionPercentage: number;
  lastVisitedAt: string;
}

const LOCAL_WORLD_STATE_PREFIX = "nyrava_world_state_v1_";
const MEMORY_WORLD_STATES = new Map<string, SingleWorldState>();

export function getIsolatedWorldState(worldId: string): SingleWorldState {
  if (MEMORY_WORLD_STATES.has(worldId)) {
    return MEMORY_WORLD_STATES.get(worldId)!;
  }

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(`${LOCAL_WORLD_STATE_PREFIX}${worldId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        MEMORY_WORLD_STATES.set(worldId, parsed);
        return parsed;
      }
    }
  } catch {}

  const defaultState: SingleWorldState = {
    worldId,
    discovered: worldId === "isla-central" || worldId === "central-city",
    checkpoint: [0, 0, 18],
    completedDistricts: [],
    completedActivities: [],
    collectedItems: [],
    completionPercentage: 0,
    lastVisitedAt: new Date().toISOString(),
  };

  MEMORY_WORLD_STATES.set(worldId, defaultState);
  return defaultState;
}

export function saveIsolatedWorldState(state: SingleWorldState): void {
  MEMORY_WORLD_STATES.set(state.worldId, state);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(`${LOCAL_WORLD_STATE_PREFIX}${state.worldId}`, JSON.stringify(state));
    }
  } catch {}
}

export function recordWorldActivityCompletion(worldId: string, activityKey: string): SingleWorldState {
  const current = getIsolatedWorldState(worldId);
  if (!current.completedActivities.includes(activityKey)) {
    current.completedActivities.push(activityKey);
    current.completionPercentage = Math.min(100, Math.round((current.completedActivities.length / 5) * 100));
    current.lastVisitedAt = new Date().toISOString();
    saveIsolatedWorldState(current);
  }
  return current;
}
