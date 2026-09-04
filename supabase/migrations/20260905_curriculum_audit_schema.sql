-- Nyrava Guardians Schema Migration V3 — Curriculum Audit & Versioning Engine
-- Created: 2026-09-05

CREATE TABLE IF NOT EXISTS curriculum_question_bank (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'recognition',
  skill_id TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  prompt_es TEXT NOT NULL,
  options_en JSONB NOT NULL,
  options_es JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation_en TEXT NOT NULL,
  explanation_es TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  age_band TEXT NOT NULL DEFAULT '9-12',
  publication_status TEXT NOT NULL DEFAULT 'published',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_versions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES curriculum_question_bank(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  prompt_en TEXT NOT NULL,
  prompt_es TEXT NOT NULL,
  options_en JSONB NOT NULL,
  options_es JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation_en TEXT NOT NULL,
  explanation_es TEXT NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS approved_reinforcements (
  id TEXT PRIMARY KEY,
  question_id_a TEXT NOT NULL REFERENCES curriculum_question_bank(id) ON DELETE CASCADE,
  question_id_b TEXT NOT NULL REFERENCES curriculum_question_bank(id) ON DELETE CASCADE,
  classification TEXT NOT NULL CHECK (classification IN ('intentional_reinforcement', 'required_prerequisite_review')),
  rationale TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum_editor_audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_bank_course ON curriculum_question_bank(course_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_status ON curriculum_question_bank(publication_status);
CREATE INDEX IF NOT EXISTS idx_question_versions_qid ON question_versions(question_id);
