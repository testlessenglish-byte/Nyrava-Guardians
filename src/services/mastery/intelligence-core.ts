/**
 * Nyrava Guardians — Guardian Mastery & Intelligence Core Service
 * Evidence-based skill progression service per Section 5 of the Production Directive.
 */

export interface MasteryEvidenceEvent {
  id: string;
  userId: string;
  skillId: string;
  source: "mission_completion" | "academy_lab" | "safety_quiz";
  evidenceReference: string;
  score: number; // 0 - 100
  validationStatus: "validated" | "pending" | "rejected";
  timestamp: string;
  version: number;
}

export interface GuardianCapabilityState {
  level: number;
  xp: number;
  skills: Record<string, { score: number; evidenceCount: number; lastUpdated: string }>;
  intelligenceCoreVersion: number;
}

export class IntelligenceCoreService {
  /**
   * Recalculates capability strictly based on validated evidence events.
   */
  calculateCapability(events: MasteryEvidenceEvent[]): GuardianCapabilityState {
    const validEvents = events.filter((e) => e.validationStatus === "validated");
    const skills: Record<string, { score: number; evidenceCount: number; lastUpdated: string }> =
      {};

    let totalScoreSum = 0;
    let skillCount = 0;

    for (const ev of validEvents) {
      if (!skills[ev.skillId]) {
        skills[ev.skillId] = { score: 0, evidenceCount: 0, lastUpdated: ev.timestamp };
      }
      const s = skills[ev.skillId]!;
      s.evidenceCount += 1;
      // Weighted moving average based on validated score
      s.score = Math.round((s.score * (s.evidenceCount - 1) + ev.score) / s.evidenceCount);
      s.lastUpdated = ev.timestamp;
    }

    const skillKeys = Object.keys(skills);
    skillCount = skillKeys.length;
    for (const key of skillKeys) {
      totalScoreSum += skills[key]!.score;
    }

    const averageMastery = skillCount > 0 ? totalScoreSum / skillCount : 0;
    const xp = Math.round(averageMastery * 35 + validEvents.length * 50);
    const level = Math.max(1, Math.floor(xp / 250) + 1);

    return {
      level,
      xp,
      skills,
      intelligenceCoreVersion: Date.now(),
    };
  }
}

export const intelligenceCoreService = new IntelligenceCoreService();
