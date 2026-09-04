import type { AcademyLab, ChildWorld, Mastery, Mission, WorldArea } from "@/types";

export const WORLD_AREAS: WorldArea[] = [
  {
    id: "my-home",
    name: "My Home",
    description: "Your personal HQ. Workshop, Garage and Garden live here.",
    zone: "home",
    status: "unlocked",
    progress: 40,
    icon: "home",
  },
  {
    id: "academy",
    name: "Academy",
    description: "AI Lab, Safety Lab and Build Lab. Where Guardians train.",
    zone: "academy",
    status: "in-progress",
    progress: 60,
    icon: "graduation-cap",
  },
  {
    id: "mission-hub",
    name: "Mission Hub",
    description: "Real scenarios. Real choices. Real impact.",
    zone: "missions",
    status: "in-progress",
    progress: 45,
    icon: "target",
  },
  {
    id: "adventure-zone",
    name: "Adventure Zone",
    description: "Explore quests and hidden challenges across Nyrava.",
    zone: "missions",
    status: "unlocked",
    progress: 20,
    icon: "compass",
  },
  {
    id: "digital-city",
    name: "Digital City",
    description: "A living city of the digital world. Meet other Guardians.",
    zone: "missions",
    status: "locked",
    progress: 0,
    icon: "building",
  },
  {
    id: "future-lab",
    name: "Future Lab",
    description: "Prototype tomorrow's technology. Advanced Guardians only.",
    zone: "missions",
    status: "locked",
    progress: 0,
    icon: "flask",
  },
];

export const CHILD_WORLD: ChildWorld = {
  id: "world-demo-1",
  home: { roomLevel: 3 },
  unlockedAreas: ["my-home", "academy", "mission-hub", "adventure-zone"],
  worldObjects: ["command-desk", "sleep-pod", "guardian-crest-poster"],
  worldVersion: 1,
};

export const ACADEMY_LABS: AcademyLab[] = [
  {
    id: "ai-lab",
    name: "AI Lab",
    description: "Learn how AI thinks — and how to think with it.",
    guardianId: "byte",
    lessons: [
      { id: "ai-1", title: "What is AI, really?", minutes: 8, progress: 100, locked: false },
      { id: "ai-2", title: "Training data & bias", minutes: 10, progress: 65, locked: false },
      { id: "ai-3", title: "Prompting like a pro", minutes: 12, progress: 0, locked: false },
      { id: "ai-4", title: "When AI gets it wrong", minutes: 10, progress: 0, locked: true },
    ],
  },
  {
    id: "safety-lab",
    name: "Safety Lab",
    description: "Shields, passwords, privacy — your defense training.",
    guardianId: "tess",
    lessons: [
      { id: "sf-1", title: "Password power", minutes: 7, progress: 100, locked: false },
      { id: "sf-2", title: "Spot the phishing trap", minutes: 9, progress: 90, locked: false },
      { id: "sf-3", title: "Your digital footprint", minutes: 8, progress: 30, locked: false },
      { id: "sf-4", title: "Stranger danger online", minutes: 10, progress: 0, locked: true },
    ],
  },
  {
    id: "build-lab",
    name: "Build Lab",
    description: "Create technology that helps people.",
    guardianId: "lex",
    lessons: [
      { id: "bl-1", title: "Ideas → prototypes", minutes: 9, progress: 80, locked: false },
      { id: "bl-2", title: "First steps of code", minutes: 11, progress: 45, locked: false },
      { id: "bl-3", title: "Design for everyone", minutes: 8, progress: 0, locked: false },
      { id: "bl-4", title: "Ship your first build", minutes: 12, progress: 0, locked: true },
    ],
  },
];

export const MISSIONS: Mission[] = [
  {
    id: "stranger-in-dms",
    title: "The Stranger in DMs",
    briefing:
      "An unknown user messages you. Every choice has a consequence — think before you act!",
    zone: "Digital City",
    xpReward: 150,
    difficulty: 1,
    scenario: {
      chat: [
        { from: "Unknown User", text: "Hey! 😊", time: "10:21 AM" },
        { from: "Unknown User", text: "You're cute! Where do you go to school?", time: "10:22 AM" },
        { from: "Unknown User", text: "No one has to know... 😉", time: "10:23 AM" },
      ],
      question: "What should you do?",
      choices: [
        {
          id: "a",
          label: "Tell them my school",
          isBest: false,
          feedback:
            "Careful! Never share personal info like your school with strangers online. Zoe's shield would not approve.",
        },
        {
          id: "b",
          label: "Ignore and block",
          isBest: true,
          feedback:
            "Good thinking! Ignoring and blocking keeps you safe. You're being a real Guardian.",
        },
        {
          id: "c",
          label: "Keep chatting",
          isBest: false,
          feedback:
            "Risky move. Strangers who ask personal questions and want secrets are a red flag. Block and tell an adult.",
        },
        {
          id: "d",
          label: "Ask a trusted adult",
          isBest: true,
          feedback:
            "Excellent! Trusted adults are part of your Guardian team. Telling them is always a strong choice.",
        },
      ],
    },
  },
  {
    id: "phishing-trap",
    title: "The Phishing Trap",
    briefing: "Detect the scam hiding in your inbox and protect your account.",
    zone: "Safety Zone",
    xpReward: 200,
    difficulty: 2,
  },
  {
    id: "fake-news-frontline",
    title: "Fake News Frontline",
    briefing: "A wild rumor is spreading through Digital City. Investigate before it explodes.",
    zone: "Digital City",
    xpReward: 250,
    difficulty: 2,
  },
  {
    id: "build-a-bridge",
    title: "Build-a-Bridge Challenge",
    briefing: "Use the Build Lab to create a tool that helps new Guardians feel welcome.",
    zone: "Future Lab",
    xpReward: 300,
    difficulty: 3,
  },
];

export const MASTERIES: Mastery[] = [
  {
    skillId: "critical-thinking",
    skillName: "Critical Thinking",
    progress: 87,
    demonstrated: true,
    evidenceCount: 14,
    lastDemonstratedAt: "2026-08-28",
  },
  {
    skillId: "privacy",
    skillName: "Privacy",
    progress: 91,
    demonstrated: true,
    evidenceCount: 17,
    lastDemonstratedAt: "2026-08-29",
  },
  {
    skillId: "ai-literacy",
    skillName: "AI Literacy",
    progress: 76,
    demonstrated: true,
    evidenceCount: 9,
    lastDemonstratedAt: "2026-08-27",
  },
  {
    skillId: "scam-detection",
    skillName: "Scam Detection",
    progress: 89,
    demonstrated: true,
    evidenceCount: 12,
    lastDemonstratedAt: "2026-08-29",
  },
  {
    skillId: "cyber-safety",
    skillName: "Cyber Safety",
    progress: 84,
    demonstrated: true,
    evidenceCount: 11,
    lastDemonstratedAt: "2026-08-25",
  },
];

export const ACHIEVEMENTS = [
  {
    id: "ach-1",
    title: "Shield Bearer",
    description: "Blocked your first unsafe contact",
    icon: "shield",
  },
  {
    id: "ach-2",
    title: "Truth Seeker",
    description: "Verified 5 sources with Nova",
    icon: "search",
  },
  { id: "ach-3", title: "Kind Signal", description: "Sent 10 positive messages", icon: "heart" },
  {
    id: "ach-4",
    title: "First Build",
    description: "Completed your first Build Lab project",
    icon: "code",
  },
];

export const NEXT_OBJECTIVE = {
  title: "Master 'Spot the phishing trap'",
  description: "Finish the Safety Lab lesson to raise Scam Detection above 90%.",
  guardianId: "tess" as const,
};
