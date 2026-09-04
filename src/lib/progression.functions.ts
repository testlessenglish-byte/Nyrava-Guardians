import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { answerKey } from "@/domain/progression/catalog";
import {
  completeMission,
  createProgress,
  equipShield,
  placeObject,
  startMission,
} from "@/domain/progression/engine";
import type { AllowedObject, PlayerProgress } from "@/domain/progression/types";

type ProgressSession = { progress: PlayerProgress };
const sessionConfig = () => ({
  name: "nyrava-progress-v1",
  password:
    process.env["PROGRESSION_SIGNING_SECRET"] ??
    (process.env["NODE_ENV"] === "production"
      ? (() => {
          throw new Error("Progression service is not configured.");
        })()
      : "nyrava-local-development-secret-change-me"),
  maxAge: 60 * 60 * 24 * 365,
  cookie: {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: "/",
  },
});

async function useProgressSession() {
  // TanStack's request-scoped server session utility is not a React hook.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useSession<ProgressSession>(sessionConfig());
  const progress = session.data.progress ?? createProgress();
  if (!session.data.progress) await session.update({ progress });
  return { session, progress };
}

export const getProgression = createServerFn({ method: "GET" }).handler(
  async () => (await useProgressSession()).progress,
);

export const beginProgressionMission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ missionId: z.string().max(80) }).parse(data))
  .handler(async ({ data }) => {
    const current = await useProgressSession();
    const result = startMission(current.progress, data.missionId);
    await current.session.update({ progress: result.progress });
    return result;
  });

export const submitProgressionAssessment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        attemptId: z.string().uuid(),
        answers: z.array(z.number().int().min(0).max(8)).max(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const current = await useProgressSession();
    const attempt = current.progress.attempts.find((item) => item.id === data.attemptId);
    if (!attempt) throw new Error("Assessment attempt was not found.");
    const key = answerKey[attempt.missionId];
    if (!key || data.answers.length !== key.length)
      throw new Error("Assessment response is incomplete.");
    const correct = key.reduce(
      (total, answer, index) => total + (data.answers[index] === answer ? 1 : 0),
      0,
    );
    const result = completeMission(
      current.progress,
      data.attemptId,
      Math.round((correct / key.length) * 100),
    );
    await current.session.update({ progress: result.progress });
    return result;
  });

export const equipProgressionShield = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ shieldId: z.string().max(80) }).parse(data))
  .handler(async ({ data }) => {
    const current = await useProgressSession();
    const progress = equipShield(current.progress, data.shieldId);
    await current.session.update({ progress });
    return progress;
  });

export const buildHomeObject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        object: z.enum(["desk", "lamp", "plant"]),
        x: z.number(),
        z: z.number(),
        scale: z.number(),
        material: z.enum(["wood", "blue", "green"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const current = await useProgressSession();
    const progress = placeObject(current.progress, {
      id: crypto.randomUUID(),
      kind: "place-approved-object",
      object: data.object as AllowedObject,
      x: data.x,
      z: data.z,
      scale: data.scale,
      material: data.material,
    });
    await current.session.update({ progress });
    return progress;
  });

export const getWorldProgress = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ worldId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const current = await useProgressSession();
    const worldStates = current.progress.worldStates || {};
    return (
      worldStates[data.worldId] || {
        worldId: data.worldId,
        discovered: data.worldId === "isla-central" || data.worldId === "central-city",
        checkpoint: [0, 0, 18],
        completedDistricts: [],
        completedActivities: [],
        collectedItems: [],
        completionPercentage: 0,
        lastVisitedAt: new Date().toISOString(),
      }
    );
  });

export const completeWorldActivity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        worldId: z.string().max(80),
        activityKey: z.string().max(80),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const current = await useProgressSession();
    const worldStates = current.progress.worldStates || {};
    const worldState = worldStates[data.worldId] || {
      worldId: data.worldId,
      discovered: true,
      checkpoint: [0, 0, 18],
      completedDistricts: [],
      completedActivities: [],
      collectedItems: [],
      completionPercentage: 0,
      lastVisitedAt: new Date().toISOString(),
    };

    if (!worldState.completedActivities.includes(data.activityKey)) {
      worldState.completedActivities = [...worldState.completedActivities, data.activityKey];
      worldState.completionPercentage = Math.min(
        100,
        Math.round((worldState.completedActivities.length / 5) * 100),
      );
      worldState.lastVisitedAt = new Date().toISOString();
    }

    const updatedProgress = {
      ...current.progress,
      worldStates: {
        ...worldStates,
        [data.worldId]: worldState,
      },
    };

    await current.session.update({ progress: updatedProgress });
    return worldState;
  });

