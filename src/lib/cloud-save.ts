import { supabase } from "@/integrations/supabase/client";

/**
 * Cloud persistence for single-player progress.
 * Falls back silently to localStorage-only when nobody is signed in.
 */

export type IslaSnapshot = {
  crystals: string[];
  secrets: string[];
  solved: string[];
  hints: Record<string, number>;
  visited: string[];
  mastery: unknown[];
  xp: number;
  classComplete: boolean;
};

export type GuardianSnapshot = {
  guardianId: string | null;
  guardianName: string;
  cosmetics: Record<string, string>;
  homeDecor: Record<string, string>;
  xp: number;
  completedMissions: string[];
};

async function uid(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ---------------- Isla progress ---------------- */

export async function loadIslaCloud(): Promise<Partial<IslaSnapshot> | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await supabase
    .from("isla_progress")
    .select("crystals, secrets, solved, hints, visited, mastery, xp, class_complete")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    crystals: data.crystals ?? [],
    secrets: data.secrets ?? [],
    solved: data.solved ?? [],
    hints: (data.hints ?? {}) as Record<string, number>,
    visited: data.visited ?? [],
    mastery: (data.mastery ?? []) as unknown[],
    xp: data.xp ?? 0,
    classComplete: data.class_complete ?? false,
  };
}

const pushIsla = debounce(async (snap: IslaSnapshot) => {
  const userId = await uid();
  if (!userId) return;
  await supabase.from("isla_progress").upsert(
    {
      user_id: userId,
      crystals: snap.crystals,
      secrets: snap.secrets,
      solved: snap.solved,
      hints: snap.hints,
      visited: snap.visited,
      mastery: snap.mastery as never,
      xp: snap.xp,
      class_complete: snap.classComplete,
    },
    { onConflict: "user_id" },
  );
}, 800);

export function saveIslaCloud(snap: IslaSnapshot) {
  if (typeof window === "undefined") return;
  pushIsla(snap);
}

/* ---------------- Guardian identity ---------------- */

export async function loadGuardianCloud(): Promise<Partial<GuardianSnapshot> | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await supabase
    .from("guardian_state")
    .select("guardian_id, guardian_name, cosmetics, home_decor, xp, completed_missions")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    guardianId: data.guardian_id ?? null,
    guardianName: data.guardian_name ?? "Alex",
    cosmetics: (data.cosmetics ?? {}) as Record<string, string>,
    homeDecor: (data.home_decor ?? {}) as Record<string, string>,
    xp: data.xp ?? 0,
    completedMissions: data.completed_missions ?? [],
  };
}

const pushGuardian = debounce(async (snap: GuardianSnapshot) => {
  const userId = await uid();
  if (!userId) return;
  await supabase.from("guardian_state").upsert(
    {
      user_id: userId,
      guardian_id: snap.guardianId,
      guardian_name: snap.guardianName,
      cosmetics: snap.cosmetics,
      home_decor: snap.homeDecor,
      xp: snap.xp,
      completed_missions: snap.completedMissions,
    },
    { onConflict: "user_id" },
  );
}, 800);

export function saveGuardianCloud(snap: GuardianSnapshot) {
  if (typeof window === "undefined") return;
  pushGuardian(snap);
}
