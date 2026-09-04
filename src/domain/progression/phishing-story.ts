export type PhishingStoryStep =
  | "SPAWN_ISLA"
  | "GOTO_MISSION_HUB"
  | "TALK_SARAH"
  | "TRAVEL_DIGITAL_CITY"
  | "INSPECT_TERMINAL"
  | "COMPLETE_ACADEMY_LESSON"
  | "SOLVE_INCIDENT"
  | "RETURN_SARAH"
  | "MISSION_COMPLETED";

export type PhishingStoryState = {
  step: PhishingStoryStep;
  xpEarned: number;
  certificateEarned: boolean;
};

export const STORY_STEP_LABELS: Record<
  PhishingStoryStep,
  { title: string; objective: string; route: string }
> = {
  SPAWN_ISLA: {
    title: "Step 1: Welcome to Isla Central",
    objective: "Explore Isla Central Plaza and head to Mission Hub when you are ready.",
    route: "/isla",
  },
  GOTO_MISSION_HUB: {
    title: "Step 2: Head to Mission Hub",
    objective: "Travel to Mission Hub to check incident reports.",
    route: "/missions",
  },
  TALK_SARAH: {
    title: "Step 3: Briefing with Sarah",
    objective: "Accept The Phishing Attack mission from Sarah.",
    route: "/missions",
  },
  TRAVEL_DIGITAL_CITY: {
    title: "Step 4: Deploy to Digital City",
    objective: "Travel to Digital City to investigate the reported phishing terminal.",
    route: "/city",
  },
  INSPECT_TERMINAL: {
    title: "Step 5: Inspect Suspicious Terminal",
    objective: "Approach the suspicious terminal and inspect the fake login message.",
    route: "/city",
  },
  COMPLETE_ACADEMY_LESSON: {
    title: "Step 6: Phishing Defense Training",
    objective: "Complete and pass Phishing Defense in the Academy Command Center.",
    route: "/classroom",
  },
  SOLVE_INCIDENT: {
    title: "Step 7: Solve Phishing Incident",
    objective: "Return to Digital City and select Report & Delete Message.",
    route: "/city",
  },
  RETURN_SARAH: {
    title: "Step 8: Debriefing with Sarah",
    objective: "Return to Mission Hub to report your successful defense.",
    route: "/missions",
  },
  MISSION_COMPLETED: {
    title: "Mission Complete: The Phishing Attack",
    objective:
      "Phishing Defense progress and its real engine rewards are saved. Continue all three Foundation classes to earn the Digital Safety Foundations certificate.",
    route: "/missions",
  },
};
