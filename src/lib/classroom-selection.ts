export type ClassroomRoomId = "security" | "builder" | "communication" | "truth";

export const CLASSROOM_ROOMS: Array<{
  id: ClassroomRoomId;
  title: string;
  guardian: string;
  description: string;
}> = [
  {
    id: "security",
    title: "Digital Safety Command Center",
    guardian: "Sarah",
    description: "Phishing, passwords, privacy and online safety training.",
  },
  {
    id: "builder",
    title: "Builder Lab",
    guardian: "Jacob",
    description: "Coding, hardware and hands-on building practice.",
  },
  {
    id: "communication",
    title: "Communication Studio",
    guardian: "Dayana",
    description: "Kind communication, networks and digital citizenship.",
  },
  {
    id: "truth",
    title: "Investigation & Truth Lab",
    guardian: "Nova & Lex",
    description: "Research, evidence, data and truth-checking practice.",
  },
];

export function isClassroomRoomId(value: string | null): value is ClassroomRoomId {
  return (
    value === "security" || value === "builder" || value === "communication" || value === "truth"
  );
}

export function readSelectedClassroom(): ClassroomRoomId {
  if (typeof window === "undefined") return "security";
  const saved = window.sessionStorage.getItem("nyrava-selected-classroom");
  return isClassroomRoomId(saved) ? saved : "security";
}

export function selectClassroom(room: ClassroomRoomId) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("nyrava-selected-classroom", room);
}
