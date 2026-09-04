import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeText,
  computeJaccardSimilarity,
  detectCurriculumDuplicates,
  auditQuestionQuality,
} from "../src/domain/curriculum/duplicate-detector.ts";
import {
  archiveQuestionVersion,
  logCurriculumAuditAction,
  getQuestionVersionHistory,
  getCurriculumAuditLogs,
} from "../src/domain/curriculum/content-versioning.ts";
import { getAllCurriculumQuestions } from "../src/domain/curriculum/repository.ts";
import { validateQuestionDuplicateService } from "../src/lib/admin-management.functions.ts";

test("1. Text Normalization: Strips punctuation, accents, and normalizes whitespace", () => {
  const raw = "  ¿Qué   hacer cuando... RECIBES un 'mensaje'?!  ";
  const normalized = normalizeText(raw);
  assert.equal(normalized, "que hacer cuando recibes un mensaje");
});

test("2. Jaccard Similarity: Identifies near-duplicate prompts and exact matches", () => {
  const promptA = "Which password is the strongest choice?";
  const promptB = "Which password is the strongest choice for your account?";
  const sim = computeJaccardSimilarity(promptA, promptB);
  assert.ok(sim >= 0.65, `Expected Jaccard similarity >= 0.65, got ${sim}`);

  const exactSim = computeJaccardSimilarity(promptA, promptA);
  assert.equal(exactSim, 1.0);
});

test("3. Duplicate Detector: Identifies exact and near duplicates across question items", () => {
  const dummyQuestions = [
    {
      id: "dummy_1",
      courseId: "course_a",
      location: "test_loc_1",
      promptEn: "What should you do if a stranger asks for your password?",
      promptEs: "¿Qué debes hacer si un desconocido pide tu contraseña?",
      optionsEn: ["Give it", "Refuse and tell adult", "Share half"],
      optionsEs: ["Darla", "Rechazar y avisar adulto", "Compartir mitad"],
      correctIndex: 1,
      explanationEn: "Never share passwords.",
      explanationEs: "Nunca compartas contraseñas.",
    },
    {
      id: "dummy_2",
      courseId: "course_b",
      location: "test_loc_2",
      promptEn: "What should you do if a stranger asks for your password?",
      promptEs: "¿Qué debes hacer si un desconocido pide tu contraseña?",
      optionsEn: ["Give it", "Refuse and tell adult", "Share half"],
      optionsEs: ["Darla", "Rechazar y avisar adulto", "Compartir mitad"],
      correctIndex: 1,
      explanationEn: "Never share passwords.",
      explanationEs: "Nunca compartas contraseñas.",
    },
  ];

  const flags = detectCurriculumDuplicates(dummyQuestions);
  assert.equal(flags.length, 1);
  assert.equal(flags[0].classification, "accidental_duplicate");
  assert.equal(flags[0].similarityScore, 1.0);
});

test("4. Quality Audit: Detects invalid answer key indices and missing translations", () => {
  const flawedQuestions = [
    {
      id: "flawed_1",
      courseId: "course_a",
      location: "loc_1",
      promptEn: "Sample prompt",
      promptEs: "", // missing translation
      optionsEn: ["Opt A", "Opt B"],
      optionsEs: [],
      correctIndex: 5, // out of bounds
      explanationEn: "", // missing explanation
      explanationEs: "",
    },
  ];

  const issues = auditQuestionQuality(flawedQuestions);
  assert.ok(issues.length >= 3, `Expected at least 3 quality issues, got ${issues.length}`);
  assert.ok(issues.some((i) => i.issueType === "invalid_answer_key"));
  assert.ok(issues.some((i) => i.issueType === "missing_explanation"));
  assert.ok(issues.some((i) => i.issueType === "missing_translation"));
});

test("5. Comprehensive Curriculum Inventory Audit: Zero accidental duplicates in active codebase", () => {
  const questions = getAllCurriculumQuestions();
  assert.ok(questions.length > 0, "Curriculum inventory must contain questions");

  const flags = detectCurriculumDuplicates(questions);
  const accidentalDuplicates = flags.filter((f) => f.classification === "accidental_duplicate");

  assert.equal(
    accidentalDuplicates.length,
    0,
    `Found ${accidentalDuplicates.length} accidental duplicates in active curriculum: ${JSON.stringify(accidentalDuplicates)}`
  );
});

test("6. Comprehensive Curriculum Quality Audit: All active questions pass quality standards", () => {
  const questions = getAllCurriculumQuestions();
  const issues = auditQuestionQuality(questions);

  assert.equal(
    issues.length,
    0,
    `Found ${issues.length} quality issues in active curriculum: ${JSON.stringify(issues)}`
  );
});

test("7. Version-Safe Preservation: Archiving question snapshot creates immutable record and audit entry", () => {
  const dummyQuestion = {
    id: "q_preserve_test",
    courseId: "phishing-defense",
    location: "test",
    promptEn: "Original prompt",
    promptEs: "Prompt original",
    optionsEn: ["A", "B"],
    optionsEs: ["A", "B"],
    correctIndex: 0,
    explanationEn: "Original explanation",
    explanationEs: "Explicación original",
  };

  const archived = archiveQuestionVersion(dummyQuestion, 1, "Audited rewrite for clarity");
  assert.equal(archived.questionId, "q_preserve_test");
  assert.equal(archived.version, 1);

  const logs = logCurriculumAuditAction(
    "UPDATE",
    dummyQuestion.id,
    "admin@nyrava.edu",
    "Rewrote prompt to enhance age-appropriate context"
  );
  assert.equal(logs.targetId, "q_preserve_test");

  const history = getQuestionVersionHistory("q_preserve_test");
  assert.equal(history.length, 1);

  const allLogs = getCurriculumAuditLogs();
  assert.ok(allLogs.length >= 1);
});

test("8. Admin Duplicate Validation Service: Blocks exact duplicate questions for Admin users", async () => {
  const mockAdminToken = "test_super_admin_jwt_token_for_verification_2026";
  const duplicateQuestionPayload = {
    id: "admin_test_q",
    courseId: "phishing-defense",
    promptEn: "A message says: 'You won $1,000! You must claim your prize in the next 5 minutes or it will disappear forever!' Which warning sign is being used?",
    promptEs: "Un mensaje dice: '¡Ganaste $1,000! Debes reclamar tu premio en los próximos 5 minutos o desaparecerá.' ¿Qué señal se está usando?",
    optionsEn: ["Artificial Urgency", "Software Update Notice", "Password Reminder", "Normal Game Notification"],
    optionsEs: ["Urgencia Artificial", "Aviso de Actualización de Software", "Recordatorio de Contraseña", "Notificación Normal del Juego"],
    correctIndex: 0,
    explanationEn: "Short 5-minute countdowns create artificial urgency to force hasty decisions.",
    explanationEs: "Conteos regresivos cortos de 5 minutos crean urgencia artificial para forzar decisiones apresuradas.",
  };

  const result = await validateQuestionDuplicateService({
    accessToken: mockAdminToken,
    question: duplicateQuestionPayload,
  });

  assert.equal(result.isExactDuplicate, true, "Service should detect exact duplicate");
  assert.ok(result.flags.length >= 1);
});
