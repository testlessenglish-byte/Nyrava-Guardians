import type { PhishingStoryStep } from "@/domain/progression/phishing-story";

const STORAGE_KEY = "nyrava-phishing-story-v1";
const EVENT_NAME = "nyrava-phishing-story-change";

export const PHISHING_STEPS: PhishingStoryStep[] = [
  "SPAWN_ISLA",
  "GOTO_MISSION_HUB",
  "TALK_SARAH",
  "TRAVEL_DIGITAL_CITY",
  "INSPECT_TERMINAL",
  "COMPLETE_ACADEMY_LESSON",
  "SOLVE_INCIDENT",
  "RETURN_SARAH",
  "MISSION_COMPLETED",
];

export function getPhishingStoryStep(): PhishingStoryStep {
  if (typeof window === "undefined") return "SPAWN_ISLA";
  const saved = window.localStorage.getItem(STORAGE_KEY) as PhishingStoryStep | null;
  return saved && PHISHING_STEPS.includes(saved) ? saved : "SPAWN_ISLA";
}

export function setPhishingStoryStep(step: PhishingStoryStep) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, step);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: step }));
}

export function advancePhishingStory(expected: PhishingStoryStep, next: PhishingStoryStep) {
  if (getPhishingStoryStep() === expected) setPhishingStoryStep(next);
}

export function startPhishingStory() {
  setPhishingStoryStep("GOTO_MISSION_HUB");
}

export function subscribePhishingStory(listener: (step: PhishingStoryStep) => void) {
  if (typeof window === "undefined") return () => undefined;
  const customHandler = (event: Event) =>
    listener((event as CustomEvent<PhishingStoryStep>).detail);
  const storageHandler = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) listener(getPhishingStoryStep());
  };
  window.addEventListener(EVENT_NAME, customHandler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, customHandler);
    window.removeEventListener("storage", storageHandler);
  };
}
