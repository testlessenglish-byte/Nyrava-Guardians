-- Nyrava Guardians — Admin & Parent Panel Database Migration & RLS Security

-- 1. System Settings Table (Global Emergency Controls & System Safety Policy)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default global settings (Emergency AI Builder Kill-Switch is ENABLED by default)
INSERT INTO public.system_settings (key, value) VALUES
  ('ai_builder_global_enabled', 'true'::jsonb),
  ('voice_engine_global_enabled', 'true'::jsonb),
  ('system_safety_policy', '{"systemVoiceSupported": true, "systemAiApproved": true, "systemExternalLinksSafe": false, "systemMultiplayerSafe": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Learning Content Table (Course, Mission, & Lesson Versioning)
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

-- Seed initial courses into learning_content
INSERT INTO public.learning_content (id, title, type, status, version, content, prerequisites) VALUES
  ('phishing-defense', '{"en": "Phishing Defense", "es": "Defensa contra Phishing"}'::jsonb, 'course', 'published', 1, '{"summary": "Recognize suspicious emails, urgency cues, and forged links."}'::jsonb, '{}'),
  ('password-safety', '{"en": "Password Protection", "es": "Protección de Contraseñas"}'::jsonb, 'course', 'published', 1, '{"summary": "Master strong passwords, MFA, and vault security."}'::jsonb, '{"phishing-defense"}'),
  ('personal-information', '{"en": "Personal Information Safety", "es": "Seguridad de Información Personal"}'::jsonb, 'course', 'published', 1, '{"summary": "Safeguard PII, location data, and privacy settings."}'::jsonb, '{"password-safety"}'),
  ('builder-lab', '{"en": "Robotics & AI Workflows", "es": "Robótica y Flujos de IA"}'::jsonb, 'course', 'published', 1, '{"summary": "Learn responsible AI building, model prompts, and automation."}'::jsonb, '{"personal-information"}'),
  ('communication-studio', '{"en": "Digital Civility & Media", "es": "Civismo Digital y Medios"}'::jsonb, 'course', 'published', 1, '{"summary": "Practice constructive digital communication and anti-cyberbullying."}'::jsonb, '{"builder-lab"}'),
  ('truth-lab', '{"en": "Fact Verification & Deepfakes", "es": "Verificación de Hechos y Deepfakes"}'::jsonb, 'course', 'published', 1, '{"summary": "Detect AI synthetic media, deepfakes, and misinfo."}'::jsonb, '{"communication-studio"}')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 3. Audit Events Table (Administrative Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Parental Consent & Safety Settings Updates
ALTER TABLE public.safety_settings 
  ADD COLUMN IF NOT EXISTS allow_ai_builder BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_academy BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_world BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_missions BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_external_links BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip TEXT;

-- 5. Helper Function: Is User Admin
CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin'
  );
END;
$$;

-- RLS POLICIES FOR ADMIN & PARENT TABLES
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Public read learning_content" ON public.learning_content FOR SELECT USING (status = 'published');

CREATE POLICY "Admin manage system_settings" ON public.system_settings 
  FOR ALL USING (is_admin_user(auth.uid()::text));

CREATE POLICY "Admin manage learning_content" ON public.learning_content 
  FOR ALL USING (is_admin_user(auth.uid()::text));

CREATE POLICY "Admin read audit_events" ON public.audit_events 
  FOR SELECT USING (is_admin_user(auth.uid()::text));
