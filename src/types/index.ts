/**
 * Nyrava Guardians — frontend contracts.
 * UI-only shapes per 05_MOCK_DATA_CONTRACTS.md.
 * Antigravity may replace storage/implementation; components must not
 * know whether data is mock, REST, or RPC.
 */

export type GuardianId =
  "lex" | "nova" | "zoey" | "jacob" | "dayana" | "sarah" | "tess" | "byte" | "echo";

export interface Guardian {
  id: GuardianId;
  name: string;
  role: string;
  tagline: string;
  visualTheme: string; // tailwind color token suffix, e.g. "guardian-lex"
  level: number;
  masterySummary: string;
  equippedCosmetics: Record<string, string>;
}

export type WorldAreaStatus = "locked" | "unlocked" | "in-progress" | "complete";

export interface WorldArea {
  id: string;
  name: string;
  description: string;
  zone: "home" | "academy" | "missions";
  status: WorldAreaStatus;
  progress: number; // 0-100
  icon: string; // lucide icon name key resolved in UI
}

export interface ChildWorld {
  id: string;
  home: { roomLevel: number };
  unlockedAreas: string[];
  worldObjects: string[];
  worldVersion: number;
}

export interface Mastery {
  skillId: string;
  skillName: string;
  progress: number; // 0-100
  demonstrated: boolean;
  evidenceCount: number;
  lastDemonstratedAt: string;
}

export interface MissionChoice {
  id: string;
  label: string;
  isBest: boolean;
  feedback: string;
}

export interface Mission {
  id: string;
  title: string;
  briefing: string;
  zone: string;
  xpReward: number;
  difficulty: 1 | 2 | 3;
  scenario?: {
    chat: { from: string; text: string; time: string }[];
    question: string;
    choices: MissionChoice[];
  };
}

export type BuilderStatus =
  "idle" | "understanding" | "planning" | "safety" | "generating" | "done" | "error";

export interface BuilderRequest {
  prompt: string;
  requestedTheme: string;
  status: BuilderStatus;
  planPreview: string[];
  safetyStatus: "pending" | "passed" | "blocked";
  generatedWorldId: string | null;
}

export interface CosmeticOption {
  id: string;
  label: string;
  swatch: string; // css color used in previews
}

export interface CosmeticSlot {
  id: string;
  label: string;
  options: CosmeticOption[];
}

export interface LabLesson {
  id: string;
  title: string;
  minutes: number;
  progress: number; // 0-100
  locked: boolean;
}

export interface AcademyLab {
  id: string;
  name: string;
  description: string;
  guardianId: GuardianId;
  lessons: LabLesson[];
}
