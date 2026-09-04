import type { QuestionItem } from "./duplicate-detector.ts";

export interface QuestionVersionRecord {
  versionId: string;
  questionId: string;
  version: number;
  promptEn: string;
  promptEs: string;
  optionsEn: string[];
  optionsEs: string[];
  correctIndex: number;
  explanationEn: string;
  explanationEs: string;
  archivedAt: string;
  archivedReason: string;
}

export interface CurriculumAuditLogRecord {
  id: string;
  action: "CREATE" | "UPDATE" | "REPLACE" | "ARCHIVE" | "APPROVE_REINFORCEMENT";
  targetId: string;
  actor: string;
  reason: string;
  metadata?: Record<string, any> | undefined;
  createdAt: string;
}

// In-memory store for test environment & fallback execution
const QUESTION_VERSIONS_STORE: QuestionVersionRecord[] = [];
const CURRICULUM_AUDIT_LOGS_STORE: CurriculumAuditLogRecord[] = [];

/**
 * Archive a historical question version before mutation
 */
export function archiveQuestionVersion(
  currentQuestion: QuestionItem,
  version: number,
  reason: string
): QuestionVersionRecord {
  const record: QuestionVersionRecord = {
    versionId: `qv_${currentQuestion.id}_v${version}_${Date.now()}`,
    questionId: currentQuestion.id,
    version,
    promptEn: currentQuestion.promptEn,
    promptEs: currentQuestion.promptEs,
    optionsEn: [...currentQuestion.optionsEn],
    optionsEs: [...currentQuestion.optionsEs],
    correctIndex: currentQuestion.correctIndex,
    explanationEn: currentQuestion.explanationEn,
    explanationEs: currentQuestion.explanationEs,
    archivedAt: new Date().toISOString(),
    archivedReason: reason,
  };

  QUESTION_VERSIONS_STORE.push(record);
  return record;
}

/**
 * Record an append-only audit log entry for curriculum changes
 */
export function logCurriculumAuditAction(
  action: CurriculumAuditLogRecord["action"],
  targetId: string,
  actor: string,
  reason: string,
  metadata?: Record<string, any>
): CurriculumAuditLogRecord {
  const log: CurriculumAuditLogRecord = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    targetId,
    actor,
    reason,
    metadata,
    createdAt: new Date().toISOString(),
  };

  CURRICULUM_AUDIT_LOGS_STORE.push(log);
  return log;
}

/**
 * Retrieve version history for a given question ID
 */
export function getQuestionVersionHistory(questionId: string): QuestionVersionRecord[] {
  return QUESTION_VERSIONS_STORE.filter((v) => v.questionId === questionId);
}

/**
 * Retrieve all audit log entries
 */
export function getCurriculumAuditLogs(): CurriculumAuditLogRecord[] {
  return [...CURRICULUM_AUDIT_LOGS_STORE];
}
