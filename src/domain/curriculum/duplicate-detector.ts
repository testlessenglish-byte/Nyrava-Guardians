export type DuplicateClassification =
  | "accidental_duplicate"
  | "near_duplicate"
  | "intentional_reinforcement"
  | "required_prerequisite_review"
  | "needs_human_review";

export interface QuestionItem {
  id: string;
  courseId: string;
  location: string; // e.g. 'phishing-defense -> assessment -> q1'
  type?: string;
  skillId?: string;
  promptEn: string;
  promptEs: string;
  optionsEn: string[];
  optionsEs: string[];
  correctIndex: number;
  explanationEn: string;
  explanationEs: string;
  difficulty?: string;
  ageBand?: string;
  publicationStatus?: "published" | "draft" | "archived";
}

export interface DuplicateFlag {
  questionA: QuestionItem;
  questionB: QuestionItem;
  classification: DuplicateClassification;
  similarityScore: number; // 0 to 1
  reasons: string[];
}

export interface QualityIssue {
  questionId: string;
  courseId: string;
  location: string;
  issueType:
    | "invalid_answer_key"
    | "missing_explanation"
    | "missing_translation"
    | "imbalanced_options"
    | "ambiguous_options"
    | "no_correct_option";
  details: string;
}

/**
 * Text Normalization Engine
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents for similarity comparison
    .replace(/[^\w\s]/gi, "") // Remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize string into n-grams
 */
export function getNGrams(text: string, n: number = 2): Set<string> {
  const words = normalizeText(text).split(" ");
  const nGrams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    nGrams.add(words.slice(i, i + n).join(" "));
  }
  return nGrams;
}

/**
 * Compute Jaccard Similarity (0.0 to 1.0)
 */
export function computeJaccardSimilarity(textA: string, textB: string): number {
  const normA = normalizeText(textA);
  const normB = normalizeText(textB);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  const setA = new Set(normA.split(" "));
  const setB = new Set(normB.split(" "));

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0.0;
  return intersection.size / union.size;
}

/**
 * Check if correct answers are functionally identical
 */
export function areCorrectAnswersIdentical(qA: QuestionItem, qB: QuestionItem): boolean {
  const correctAEn = qA.optionsEn[qA.correctIndex] ?? "";
  const correctBEn = qB.optionsEn[qB.correctIndex] ?? "";
  const sim = computeJaccardSimilarity(correctAEn, correctBEn);
  return sim >= 0.85;
}

/**
 * Audit Question Quality (Answer keys, translations, distractor balance)
 */
export function auditQuestionQuality(questions: QuestionItem[]): QualityIssue[] {
  const issues: QualityIssue[] = [];

  for (const q of questions) {
    // 1. Invalid answer key range
    if (q.correctIndex < 0 || q.correctIndex >= q.optionsEn.length) {
      issues.push({
        questionId: q.id,
        courseId: q.courseId,
        location: q.location,
        issueType: "invalid_answer_key",
        details: `Correct index ${q.correctIndex} is out of bounds for ${q.optionsEn.length} options.`,
      });
    }

    // 2. Missing explanations
    if (!q.explanationEn || q.explanationEn.trim().length < 5) {
      issues.push({
        questionId: q.id,
        courseId: q.courseId,
        location: q.location,
        issueType: "missing_explanation",
        details: "English explanation is missing or too short.",
      });
    }

    // 3. Missing Spanish translations
    if (!q.promptEs || q.promptEs.trim().length < 5 || q.optionsEs.length === 0) {
      issues.push({
        questionId: q.id,
        courseId: q.courseId,
        location: q.location,
        issueType: "missing_translation",
        details: "Spanish translation is incomplete or missing options.",
      });
    }

    // 4. Imbalanced options (correct answer is >3x longer than all distractors)
    const correctOpt = q.optionsEn[q.correctIndex] ?? "";
    const wrongOpts = q.optionsEn.filter((_, idx) => idx !== q.correctIndex);
    if (correctOpt && wrongOpts.length > 0) {
      const avgWrongLen = wrongOpts.reduce((acc, o) => acc + o.length, 0) / wrongOpts.length;
      if (correctOpt.length > 3.5 * avgWrongLen && correctOpt.length > 60) {
        issues.push({
          questionId: q.id,
          courseId: q.courseId,
          location: q.location,
          issueType: "imbalanced_options",
          details: `Correct option length (${correctOpt.length} chars) is >3.5x average distractor length (${Math.round(avgWrongLen)} chars).`,
        });
      }
    }
  }

  return issues;
}

/**
 * Detect Duplicates Across Entire Question Inventory
 */
export function detectCurriculumDuplicates(
  questions: QuestionItem[],
  approvedReinforcements: Array<{ qA: string; qB: string; classification: DuplicateClassification }> = []
): DuplicateFlag[] {
  const flags: DuplicateFlag[] = [];

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const qA = questions[i];
      const qB = questions[j];
      if (!qA || !qB) continue;

      const simEn = computeJaccardSimilarity(qA.promptEn, qB.promptEn);
      const simEs = computeJaccardSimilarity(qA.promptEs, qB.promptEs);
      const maxSim = Math.max(simEn, simEs);

      const isExact = maxSim === 1.0;
      const isNear = maxSim >= 0.65;
      const sameSkill = qA.skillId && qB.skillId && qA.skillId === qB.skillId;
      const correctAnswersMatch = areCorrectAnswersIdentical(qA, qB);

      // Check if approved in white-list
      const isApproved = approvedReinforcements.some(
        (ar) =>
          (ar.qA === qA.id && ar.qB === qB.id) ||
          (ar.qA === qB.id && ar.qB === qA.id)
      );

      if (isExact || isNear || (sameSkill && correctAnswersMatch && maxSim >= 0.5)) {
        const reasons: string[] = [];
        let classification: DuplicateClassification = "needs_human_review";

        if (isExact) {
          reasons.push("100% exact prompt match in normalized text.");
          classification = "accidental_duplicate";
        } else if (isNear) {
          reasons.push(`High prompt similarity score: ${Math.round(maxSim * 100)}%`);
          classification = "near_duplicate";
        }

        if (correctAnswersMatch) {
          reasons.push("Correct answer choices are functionally identical.");
        }

        if (qA.courseId === qB.courseId) {
          reasons.push(`Both questions belong to the same course (${qA.courseId}).`);
        } else {
          reasons.push(`Questions cross-reference courses ${qA.courseId} and ${qB.courseId}.`);
        }

        if (isApproved) {
          const approved = approvedReinforcements.find(
            (ar) =>
              (ar.qA === qA.id && ar.qB === qB.id) ||
              (ar.qA === qB.id && ar.qB === qA.id)
          );
          if (approved) {
            classification = approved.classification;
            reasons.push(`Approved by Admin as ${approved.classification}.`);
          }
        }

        flags.push({
          questionA: qA,
          questionB: qB,
          classification,
          similarityScore: maxSim,
          reasons,
        });
      }
    }
  }

  return flags;
}
