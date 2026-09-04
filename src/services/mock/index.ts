/**
 * Nyrava Guardians — service boundary (mock implementation).
 *
 * Components call these services only. Antigravity will swap the mock
 * implementations for real providers behind the same interfaces, without
 * touching the visual layer. No provider API keys or provider-specific
 * code may appear here or in components.
 */
import {
  ACADEMY_LABS,
  ACHIEVEMENTS,
  CHILD_WORLD,
  MASTERIES,
  MISSIONS,
  NEXT_OBJECTIVE,
  WORLD_AREAS,
} from "@/data/world";
import { GUARDIANS as GUARDIAN_LIST } from "@/data/guardians";
import type { BuilderRequest, Mission } from "@/types";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const GuardianService = {
  async list() {
    await delay();
    return GUARDIAN_LIST;
  },
  async get(id: string) {
    await delay();
    return GUARDIAN_LIST.find((g) => g.id === id) ?? null;
  },
};

export const WorldService = {
  async getWorld() {
    await delay();
    return CHILD_WORLD;
  },
  async listAreas() {
    await delay();
    return WORLD_AREAS;
  },
};

export const MissionService = {
  async list(): Promise<Mission[]> {
    await delay();
    return MISSIONS;
  },
  async get(id: string) {
    await delay();
    return MISSIONS.find((m) => m.id === id) ?? null;
  },
};

export const AcademyService = {
  async listLabs() {
    await delay();
    return ACADEMY_LABS;
  },
};

export const MasteryService = {
  async listMasteries() {
    await delay();
    return MASTERIES;
  },
  async listAchievements() {
    await delay();
    return ACHIEVEMENTS;
  },
  async nextObjective() {
    await delay();
    return NEXT_OBJECTIVE;
  },
};

import { worldBuilderPipeline } from "@/services/ai/world-builder-pipeline";
import { walletService } from "@/services/wallet-service";

export interface BuilderPlanResult {
  planPreview: string[];
  requestedTheme: string;
  totalCost?: number;
}

/**
 * Production-backed AI entry point routed through worldBuilderPipeline.
 */
export const GuardianAI = {
  async request(input: { prompt: string }): Promise<BuilderPlanResult> {
    const userId = (await walletService.getWallet()).learner_id;
    const res = await worldBuilderPipeline.processRequest(userId, input.prompt);
    if (res.status === "completed" && res.result.plan) {
      return {
        requestedTheme: res.result.plan.theme || "custom",
        planPreview: res.result.plan.items.map(
          (item) => `[${item.category.toUpperCase()}] ${item.name} at (${item.position.join(", ")})`,
        ),
      };
    }
    return {
      requestedTheme: "custom",
      planPreview: [
        "Central hub with a glowing Nyrava beacon",
        "Three explorable zones connected by light bridges",
        "Hidden learning crystals that unlock mini-challenges",
      ],
    };
  },
};

export const BuilderService = {
  async createRequest(prompt: string): Promise<BuilderRequest> {
    const userId = (await walletService.getWallet()).learner_id;
    const res = await worldBuilderPipeline.processRequest(userId, prompt);
    return {
      prompt,
      requestedTheme: "custom",
      status: res.status === "completed" ? "done" : "error",
      planPreview: res.result.plan?.items.map((i) => i.name) || [],
      safetyStatus: res.result.valid ? "passed" : "blocked",
      generatedWorldId: res.result.valid ? `world-${Date.now()}` : null,
    };
  },
};
