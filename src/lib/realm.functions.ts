import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  type GuardianTier,
  type NyravaRealmState,
  type PlacedStructure,
  type BuildableZoneId,
  BUILDABLE_ZONES,
  GUARDIAN_TIERS,
} from "@/domain/realm/realm-types";
import { getProgression } from "./progression.functions";

type RealmSession = { realmState: NyravaRealmState };

const realmSessionConfig = () => ({
  name: "nyrava-realm-session-v1",
  password:
    process.env["PROGRESSION_SIGNING_SECRET"] ??
    (process.env["NODE_ENV"] === "production"
      ? (() => {
          throw new Error("Realm progression service is not configured.");
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

async function useRealmSession() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useSession<RealmSession>(realmSessionConfig());
  const progress = await getProgression();

  // Calculate tier based on XP
  let tier: GuardianTier = 1;
  if (progress.xp >= 10000) tier = 5;
  else if (progress.xp >= 5000) tier = 4;
  else if (progress.xp >= 2500) tier = 3;
  else if (progress.xp >= 1000) tier = 2;

  const defaultState: NyravaRealmState = {
    worldId: "nyrava-guardian-realm",
    tier,
    xp: progress.xp,
    points: progress.credits || 250,
    placedStructures: [],
    unlockedZones: BUILDABLE_ZONES.filter((z) => z.requiredTier <= tier).map((z) => z.id),
    lastVisitedAt: new Date().toISOString(),
  };

  const realmState = session.data.realmState || defaultState;
  realmState.tier = tier;
  realmState.xp = progress.xp;
  realmState.points = Math.max(realmState.points, progress.credits || 250);

  if (!session.data.realmState) await session.update({ realmState });
  return { session, realmState };
}

export const getRealmState = createServerFn({ method: "GET" }).handler(
  async () => (await useRealmSession()).realmState,
);

export const placeRealmStructure = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        kind: z.string().max(80),
        name: z.string().max(120),
        zoneId: z.enum([
          "waterfall-clearing",
          "river-bend",
          "forest-clearing",
          "mountain-overlook",
          "hq-plateau",
        ]),
        pos: z.tuple([z.number(), z.number(), z.number()]),
        rotY: z.number().default(0),
        scale: z.number().default(1),
        cost: z.number().int().min(0).max(1000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { session, realmState } = await useRealmSession();

    if (realmState.points < data.cost) {
      throw new Error(`Insufficient Guardian Points. Needed: ${data.cost}, Available: ${realmState.points}`);
    }

    const zone = BUILDABLE_ZONES.find((z) => z.id === data.zoneId);
    if (!zone) throw new Error(`Invalid buildable zone: ${data.zoneId}`);

    if (zone.requiredTier > realmState.tier) {
      throw new Error(
        `Zone ${zone.name} requires ${GUARDIAN_TIERS[zone.requiredTier].title} (Tier ${zone.requiredTier}). Current tier: ${realmState.tier}`,
      );
    }

    const newStructure: PlacedStructure = {
      id: crypto.randomUUID(),
      kind: data.kind,
      name: data.name,
      tier: realmState.tier,
      zoneId: data.zoneId as BuildableZoneId,
      pos: data.pos,
      rotY: data.rotY,
      scale: data.scale,
      cost: data.cost,
      placedAt: new Date().toISOString(),
    };

    const updatedState: NyravaRealmState = {
      ...realmState,
      points: realmState.points - data.cost,
      placedStructures: [...realmState.placedStructures, newStructure],
      lastVisitedAt: new Date().toISOString(),
    };

    await session.update({ realmState: updatedState });
    return updatedState;
  });
