CREATE TABLE public.isla_progress (
  user_id uuid PRIMARY KEY,
  crystals text[] NOT NULL DEFAULT '{}',
  secrets text[] NOT NULL DEFAULT '{}',
  solved text[] NOT NULL DEFAULT '{}',
  hints jsonb NOT NULL DEFAULT '{}'::jsonb,
  visited text[] NOT NULL DEFAULT '{}',
  mastery jsonb NOT NULL DEFAULT '[]'::jsonb,
  xp integer NOT NULL DEFAULT 0,
  class_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.isla_progress TO authenticated;
GRANT ALL ON public.isla_progress TO service_role;

ALTER TABLE public.isla_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY isla_progress_read_self_guardian ON public.isla_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), user_id));

CREATE POLICY isla_progress_insert_self ON public.isla_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY isla_progress_update_self ON public.isla_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER isla_progress_updated BEFORE UPDATE ON public.isla_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.guardian_state (
  user_id uuid PRIMARY KEY,
  guardian_id text,
  guardian_name text NOT NULL DEFAULT 'Alex',
  cosmetics jsonb NOT NULL DEFAULT '{}'::jsonb,
  home_decor jsonb NOT NULL DEFAULT '{}'::jsonb,
  xp integer NOT NULL DEFAULT 0,
  completed_missions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.guardian_state TO authenticated;
GRANT ALL ON public.guardian_state TO service_role;

ALTER TABLE public.guardian_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY guardian_state_read_self_guardian ON public.guardian_state
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), user_id));

CREATE POLICY guardian_state_insert_self ON public.guardian_state
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY guardian_state_update_self ON public.guardian_state
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER guardian_state_updated BEFORE UPDATE ON public.guardian_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();