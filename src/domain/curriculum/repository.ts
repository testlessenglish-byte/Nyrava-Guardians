import { missions as catalogMissions } from "../progression/catalog.ts";
import { GUARDIAN_COURSES } from "../progression/courses/index.ts";
import type { QuestionItem } from "./duplicate-detector.ts";

/**
 * Aggregates all questions from catalog missions and full course assessment objects
 */
export function getAllCurriculumQuestions(): QuestionItem[] {
  const items: QuestionItem[] = [];

  // 1. Catalog Missions Questions
  for (const mission of catalogMissions) {
    mission.questions.forEach((q, idx) => {
      const correctIdx = mission.id === "phishing-defense"
        ? [1, 2, 0, 1][idx] ?? 0
        : mission.id === "password-safety"
        ? [1, 1, 1, 0][idx] ?? 0
        : [0, 1, 1, 1][idx] ?? 0;

      items.push({
        id: `catalog_${mission.id}_${q.id}`,
        courseId: mission.id,
        location: `catalog -> ${mission.id} -> ${q.id}`,
        promptEn: q.prompt.en,
        promptEs: q.prompt.es,
        optionsEn: q.options.map((o) => o.en),
        optionsEs: q.options.map((o) => o.es),
        correctIndex: correctIdx,
        explanationEn: `Lesson context: ${mission.lesson[Math.min(idx, mission.lesson.length - 1)]?.en ?? ""}`,
        explanationEs: `Contexto de lección: ${mission.lesson[Math.min(idx, mission.lesson.length - 1)]?.es ?? ""}`,
        publicationStatus: "published",
        ageBand: "9-12",
        difficulty: "medium",
      });
    });
  }

  // 2. Rich Guardian Courses Assessments
  Object.values(GUARDIAN_COURSES).forEach((course) => {
    course.assessment.questions.forEach((q) => {
      items.push({
        id: q.id,
        courseId: course.id,
        location: `courses -> ${course.id} -> assessment -> ${q.id}`,
        type: q.type,
        skillId: q.skillId,
        promptEn: q.prompt.en,
        promptEs: q.prompt.es,
        optionsEn: q.options.map((o) => o.en),
        optionsEs: q.options.map((o) => o.es),
        correctIndex: q.correctIndex,
        explanationEn: q.explanation.en,
        explanationEs: q.explanation.es,
        publicationStatus: "published",
        ageBand: "9-12",
        difficulty: "medium",
      });
    });
  });

  return items;
}
