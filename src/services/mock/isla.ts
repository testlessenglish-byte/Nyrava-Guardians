import { CRYSTALS, REGIONS, REPORT_CHALLENGE, SECRETS, type Challenge } from "@/data/isla";
import { getIsla, recordMastery } from "@/lib/isla-store";

/**
 * SERVICE BOUNDARY for World 1.
 * The UI never imports world/mission data directly through here-only paths that
 * a real backend can replace: swap these functions for API calls and the
 * renderer, HUD and progress store keep working unchanged.
 */
export const islaService = {
  async getWorld() {
    return { regions: REGIONS, crystals: CRYSTALS, secrets: SECRETS };
  },

  async getClassMission() {
    return {
      id: "class-1-discover-isla-central",
      title: "Class 1 — Discover Isla Central",
      brief:
        "Your first mission is to explore Isla Central and discover what this world has hidden for you. Find the 5 Knowledge Crystals, solve what guards them, then report back to the Academy.",
      objectives: [
        { id: "crystals", label: "Find the 5 Knowledge Crystals", total: 5 },
        { id: "challenges", label: "Solve the challenges guarding them", total: 3 },
        { id: "report", label: "Return to the Academy and report", total: 1 },
      ],
    };
  },

  /** Grades an answer and records mastery evidence for the Intelligence Core. */
  async submitChallenge(sourceId: string, challenge: Challenge, answer: number[]) {
    const correct =
      answer.length === challenge.answer.length &&
      answer.every((v, i) => v === challenge.answer[i]);
    if (correct) recordMastery(challenge.skill, sourceId);
    return {
      correct,
      message: correct ? challenge.success : "Not quite — think it through and try again.",
    };
  },

  getReportChallenge() {
    return REPORT_CHALLENGE;
  },

  /** Mastery evidence stream — Antigravity pipes this into the Guardian Intelligence Core. */
  async getMasteryEvidence() {
    return getIsla().mastery;
  },
};
