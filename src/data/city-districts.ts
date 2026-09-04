export interface DistrictInfo {
  id: string;
  name: string;
  pos: [number, number, number];
  description: string;
  activityName?: string;
  activityKey?: string;
  status: "unlocked" | "completed" | "locked";
  icon: string;
}

export const CITY_DISTRICTS: DistrictInfo[] = [
  {
    id: "arrival-plaza",
    name: "1. Arrival Plaza",
    pos: [0, 0, 18],
    description: "Central welcome plaza with wayfinder signpost and fast-travel portals.",
    status: "unlocked",
    icon: "🛬",
  },
  {
    id: "digital-safety",
    name: "2. Digital Safety Training",
    pos: [-16, 0, 12],
    description: "Phishing investigation terminals & red flag scam signal hunt.",
    activityName: "Phishing Detective",
    activityKey: "phishing-detective",
    status: "unlocked",
    icon: "🔍",
  },
  {
    id: "academy-district",
    name: "3. Academy District",
    pos: [-22, 0, -6],
    description: "Password power lab and direct access to interactive AI classrooms.",
    activityName: "Password Power Lab",
    activityKey: "password-lab",
    status: "unlocked",
    icon: "🔑",
  },
  {
    id: "mission-hub",
    name: "4. Mission Hub District",
    pos: [16, 0, 12],
    description: "Briefing arena for real-world digital citizenship scenarios.",
    activityName: "Mission Scenarios",
    activityKey: "missions",
    status: "unlocked",
    icon: "🎯",
  },
  {
    id: "builder-lab",
    name: "5. Builder Lab District",
    pos: [22, 0, -6],
    description: "Privacy sorting station and entrance to the AI World Builder.",
    activityName: "Privacy Sort Station",
    activityKey: "privacy-sort",
    status: "unlocked",
    icon: "🛠️",
  },
  {
    id: "guardian-gardens",
    name: "6. Guardian Gardens",
    pos: [-14, 0, -20],
    description: "Safe messaging dialogue area and relaxation grounds with Guardian NPCs.",
    activityName: "Safe Messaging",
    activityKey: "safe-messaging",
    status: "unlocked",
    icon: "🌿",
  },
  {
    id: "portal-concourse",
    name: "7. Portal Concourse",
    pos: [14, 0, -20],
    description: "Inter-world transport hub linking Isla Central to other World Map realms.",
    status: "unlocked",
    icon: "🌀",
  },
  {
    id: "central-tower",
    name: "8. Central Nyrava Tower",
    pos: [0, 0, 0],
    description: "The core emblem spire hosting the Guardian Tower Challenge climax assessment.",
    activityName: "Guardian Tower Challenge",
    activityKey: "tower-challenge",
    status: "unlocked",
    icon: "🏰",
  },
];
