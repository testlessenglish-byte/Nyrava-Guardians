-- Nyrava Guardians — Admin & Parent Panel Database Migration V2 & Hardened RLS Security

-- 1. Enum Types & User Roles Extensions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'guardian', 'learner', 'moderator');
  END IF;
END $$;

-- 2. System Settings Table (Global Emergency Controls & System Safety Policy)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default global settings
INSERT INTO public.system_settings (key, value) VALUES
  ('ai_builder_global_enabled', 'true'::jsonb),
  ('voice_engine_global_enabled', 'true'::jsonb),
  ('system_safety_policy', '{"systemVoiceSupported": true, "systemAiApproved": true, "systemExternalLinksSafe": false, "systemMultiplayerSafe": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Learning Content Table (Course, Mission, & Lesson Versioning)
CREATE TABLE IF NOT EXISTS public.learning_content (
  id TEXT PRIMARY KEY,
  title JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course', 'lesson', 'quiz', 'mission')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'preview', 'published', 'archived')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  prerequisites TEXT[] DEFAULT '{}',
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Append-Only Audit Events Table (Strict Administrative & System Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  request_id TEXT,
  result TEXT NOT NULL DEFAULT 'success' CHECK (result IN ('success', 'failure')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent UPDATE and DELETE on audit_events (Append-Only Enforcement)
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'Audit records are immutable and append-only. UPDATE and DELETE operations are forbidden.';
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_audit_events ON public.audit_events;
CREATE TRIGGER trg_immutable_audit_events
BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

-- 5. COPPA Consent & Disclosure Management Table
CREATE TABLE IF NOT EXISTS public.coppa_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id TEXT NOT NULL,
  learner_user_id TEXT NOT NULL,
  consent_version TEXT NOT NULL DEFAULT 'v2.1',
  disclosure_version TEXT NOT NULL DEFAULT 'v2.1',
  ip_address TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Account & Child Data Deletion Requests Table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 7. Helper Security Functions with Hardened search_path
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role IN ('super_admin', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role IN ('super_admin', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_guardian(p_guardian_id TEXT, p_learner_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.guardian_links
    WHERE guardian_user_id = p_guardian_id 
      AND learner_user_id = p_learner_id 
      AND status = 'approved'
  );
END;
$$;

-- 8. Enable Row-Level Security on All Core Tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coppa_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admin manage system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public read learning_content" ON public.learning_content;
DROP POLICY IF EXISTS "Admin manage learning_content" ON public.learning_content;
DROP POLICY IF EXISTS "Admin read audit_events" ON public.audit_events;

-- System Settings RLS Policies
CREATE POLICY "Public read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage system_settings" ON public.system_settings 
  FOR ALL USING (public.is_admin_user(auth.uid()::text));

-- Learning Content RLS Policies
CREATE POLICY "Public read published learning_content" ON public.learning_content FOR SELECT USING (status = 'published');
CREATE POLICY "Admin manage learning_content" ON public.learning_content 
  FOR ALL USING (public.is_admin_user(auth.uid()::text));

-- Audit Events RLS Policies
CREATE POLICY "Admin read audit_events" ON public.audit_events 
  FOR SELECT USING (public.is_admin_user(auth.uid()::text));
CREATE POLICY "System insert audit_events" ON public.audit_events 
  FOR INSERT WITH CHECK (true);

-- COPPA Consents RLS Policies
CREATE POLICY "Guardian manage coppa_consents" ON public.coppa_consents
  FOR ALL USING (guardian_user_id = auth.uid()::text OR public.is_admin_user(auth.uid()::text));

-- Account Deletion Requests RLS Policies
CREATE POLICY "Guardian manage deletion_requests" ON public.account_deletion_requests
  FOR ALL USING (guardian_user_id = auth.uid()::text OR public.is_admin_user(auth.uid()::text));
