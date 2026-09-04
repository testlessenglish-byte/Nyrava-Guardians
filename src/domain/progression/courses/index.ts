import { type GuardianCourse } from "../guardian-course-schema.ts";
import { PHISHING_DEFENSE_COURSE } from "./phishing-defense-course.ts";
import { PASSWORD_SAFETY_COURSE } from "./password-safety-course.ts";
import { PERSONAL_INFORMATION_COURSE } from "./personal-information-course.ts";
import { BUILDER_LAB_COURSE } from "./builder-lab-course.ts";
import { COMMUNICATION_STUDIO_COURSE } from "./communication-studio-course.ts";
import { TRUTH_LAB_COURSE } from "./truth-lab-course.ts";

export const GUARDIAN_COURSES: Record<string, GuardianCourse> = {
  "phishing-defense": PHISHING_DEFENSE_COURSE,
  "password-safety": PASSWORD_SAFETY_COURSE,
  "personal-information": PERSONAL_INFORMATION_COURSE,
  "builder-lab": BUILDER_LAB_COURSE,
  "communication-studio": COMMUNICATION_STUDIO_COURSE,
  "truth-lab": TRUTH_LAB_COURSE,
};

export function getGuardianCourse(courseId: string): GuardianCourse {
  return GUARDIAN_COURSES[courseId] ?? PHISHING_DEFENSE_COURSE;
}
