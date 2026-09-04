-- Production Build Directive Schema & RLS Hardening

-- Helper function for parent/guardian authorization checks
CREATE OR REPLACE FUNCTION public.is_approved_guardian(_guardian uuid, _learner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _guardian = _learner;
$$;
GRANT EXECUTE ON FUNCTION public.is_approved_guardian(uuid, uuid) TO authenticated;

-- Entities
CREATE TABLE IF NOT EXISTS public.guardian_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  selected_guardian text NOT NULL DEFAULT 'lex',
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 24),
  cosmetics jsonb NOT NULL DEFAULT '{}'::jsonb,
  progression_summary jsonb NOT NULL DEFAULT '{"level": 1, "xp": 0}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guardian_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_id text NOT NULL,
  mastery_score integer NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  demonstrated_count integer NOT NULL DEFAULT 0,
  confidence real NOT NULL DEFAULT 0.0 CHECK (confidence BETWEEN 0.0 AND 1.0),
  evidence_version integer NOT NULL DEFAULT 1,
  last_demonstrated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.mastery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_id text NOT NULL,
  source text NOT NULL,
  evidence_reference text,
  result text NOT NULL,
  confidence real NOT NULL DEFAULT 1.0,
  validation_state text NOT NULL DEFAULT 'validated',
  timestamp timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.worlds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_version integer NOT NULL DEFAULT 1,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.world_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  version integer NOT NULL,
  state jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(world_id, version)
);

CREATE TABLE IF NOT EXISTS public.world_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  object_id text NOT NULL,
  asset_type text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  validated boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.world_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  performed_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.missions (
  id text PRIMARY KEY,
  title text NOT NULL,
  briefing text NOT NULL,
  zone text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 100,
  difficulty integer NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mission_id text NOT NULL REFERENCES public.missions(id),
  outcome text NOT NULL,
  learning_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_class text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  latency_ms integer NOT NULL DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  usage_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  safety_outcome text NOT NULL DEFAULT 'passed',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_builder_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'planning', 'safety_review', 'generating', 'completed', 'rejected', 'failed')),
  world_plan jsonb,
  safety_result text NOT NULL DEFAULT 'pending',
  generated_world_version integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safety_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  reason_code text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.guardian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_builder_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.guardian_profiles TO authenticated;
GRANT SELECT ON public.guardian_mastery TO authenticated;
GRANT SELECT ON public.mastery_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.worlds TO authenticated;
GRANT SELECT ON public.world_versions TO authenticated;
GRANT SELECT ON public.world_objects TO authenticated;
GRANT SELECT ON public.world_change_events TO authenticated;
GRANT SELECT ON public.missions TO authenticated;
GRANT SELECT, INSERT ON public.mission_attempts TO authenticated;
GRANT SELECT, INSERT ON public.ai_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ai_builder_requests TO authenticated;
GRANT SELECT ON public.safety_events TO authenticated;
GRANT SELECT ON public.audit_events TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- RLS Policies (Idempotent: Drop if exists then Create)
DROP POLICY IF EXISTS guardian_profiles_self ON public.guardian_profiles;
CREATE POLICY guardian_profiles_self ON public.guardian_profiles FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS guardian_mastery_read ON public.guardian_mastery;
CREATE POLICY guardian_mastery_read ON public.guardian_mastery FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), user_id));

DROP POLICY IF EXISTS mastery_events_read ON public.mastery_events;
CREATE POLICY mastery_events_read ON public.mastery_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), user_id));

DROP POLICY IF EXISTS worlds_self ON public.worlds;
CREATE POLICY worlds_self ON public.worlds FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS world_versions_read ON public.world_versions;
CREATE POLICY world_versions_read ON public.world_versions FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS mission_attempts_self ON public.mission_attempts;
CREATE POLICY mission_attempts_self ON public.mission_attempts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ai_builder_requests_self ON public.ai_builder_requests;
CREATE POLICY ai_builder_requests_self ON public.ai_builder_requests FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
