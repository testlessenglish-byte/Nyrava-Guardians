-- Nyrava Guardians — Shield & Badge Schema V2 Rollback Script

BEGIN;

DROP INDEX IF EXISTS public.idx_active_learner_badge;
DROP TABLE IF EXISTS public.learner_badges;
DROP TABLE IF EXISTS public.badge_definitions;

COMMIT;
