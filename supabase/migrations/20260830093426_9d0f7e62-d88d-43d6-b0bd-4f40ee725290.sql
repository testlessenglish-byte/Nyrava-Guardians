CREATE TYPE public.app_role AS ENUM ('guardian', 'learner', 'moderator', 'admin');
CREATE TYPE public.grade_band AS ENUM ('k_2', '3_5', '6_8', '9_12');
CREATE TYPE public.membership_tier AS ENUM ('free', 'explorer', 'guardian', 'academy');
CREATE TYPE public.membership_status AS ENUM ('active', 'paused', 'cancelled');
CREATE TYPE public.link_status AS ENUM ('pending', 'approved', 'revoked');
CREATE TYPE public.room_status AS ENUM ('open', 'full', 'closed');
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'blocked');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 24),
  avatar_guardian text NOT NULL DEFAULT 'lex',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.learner_profiles (
  user_id uuid PRIMARY KEY,
  grade_band public.grade_band NOT NULL,
  interests text[] NOT NULL DEFAULT '{}',
  matching_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.learner_profiles TO authenticated;
GRANT ALL ON public.learner_profiles TO service_role;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guardian_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id uuid NOT NULL,
  learner_user_id uuid NOT NULL,
  status public.link_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guardian_user_id, learner_user_id),
  CHECK (guardian_user_id <> learner_user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.guardian_links TO authenticated;
GRANT ALL ON public.guardian_links TO service_role;
ALTER TABLE public.guardian_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.memberships (
  user_id uuid PRIMARY KEY,
  tier public.membership_tier NOT NULL DEFAULT 'free',
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
  status public.membership_status NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.safety_settings (
  learner_user_id uuid PRIMARY KEY,
  multiplayer_consent boolean NOT NULL DEFAULT false,
  voice_enabled boolean NOT NULL DEFAULT false,
  daily_limit_minutes integer NOT NULL DEFAULT 45 CHECK (daily_limit_minutes BETWEEN 10 AND 240),
  allowed_start time,
  allowed_end time,
  activity_reports_enabled boolean NOT NULL DEFAULT true,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.safety_settings TO authenticated;
GRANT ALL ON public.safety_settings TO service_role;
ALTER TABLE public.safety_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id text NOT NULL,
  grade_band public.grade_band NOT NULL,
  interest_tags text[] NOT NULL DEFAULT '{}',
  minimum_tier public.membership_tier NOT NULL DEFAULT 'free',
  minimum_level integer NOT NULL DEFAULT 1 CHECK (minimum_level BETWEEN 1 AND 100),
  capacity integer NOT NULL DEFAULT 12 CHECK (capacity BETWEEN 2 AND 24),
  status public.room_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.room_members (
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  session_started_at timestamptz NOT NULL DEFAULT now(),
  position_x real NOT NULL DEFAULT 0,
  position_y real NOT NULL DEFAULT 0,
  position_z real NOT NULL DEFAULT 0,
  rotation_y real NOT NULL DEFAULT 0,
  is_speaking boolean NOT NULL DEFAULT false,
  PRIMARY KEY (room_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_members TO authenticated;
GRANT ALL ON public.room_members TO service_role;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  moderation_status public.moderation_status NOT NULL DEFAULT 'pending',
  moderation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.room_messages TO authenticated;
GRANT ALL ON public.room_messages TO service_role;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_blocks (
  blocker_user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id <> blocked_user_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL,
  reported_user_id uuid,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('bullying', 'unsafe_language', 'personal_information', 'voice', 'other')),
  details text CHECK (details IS NULL OR char_length(details) <= 1000),
  status public.report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT ON public.safety_reports TO authenticated;
GRANT ALL ON public.safety_reports TO service_role;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity integer NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  summary text NOT NULL CHECK (char_length(summary) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.moderation_events TO authenticated;
GRANT ALL ON public.moderation_events TO service_role;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_approved_guardian(_guardian uuid, _learner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guardian_links
    WHERE guardian_user_id = _guardian AND learner_user_id = _learner AND status = 'approved'
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_approved_guardian(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.shares_room(_viewer uuid, _other uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members mine
    JOIN public.room_members theirs ON theirs.room_id = mine.room_id
    WHERE mine.user_id = _viewer AND theirs.user_id = _other
      AND mine.last_seen_at > now() - interval '2 minutes'
      AND theirs.last_seen_at > now() - interval '2 minutes'
  )
$$;
GRANT EXECUTE ON FUNCTION public.shares_room(uuid, uuid) TO authenticated;

CREATE POLICY profiles_read_safe ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.shares_room(auth.uid(), user_id) OR public.is_approved_guardian(auth.uid(), user_id));
CREATE POLICY profiles_create_self ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY roles_read_self_or_guardian ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), user_id));

CREATE POLICY learner_read_self_guardian ON public.learner_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), user_id));
CREATE POLICY learner_create_self ON public.learner_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY learner_update_self ON public.learner_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY links_read_participant ON public.guardian_links FOR SELECT TO authenticated
USING (guardian_user_id = auth.uid() OR learner_user_id = auth.uid());
CREATE POLICY links_request_guardian ON public.guardian_links FOR INSERT TO authenticated
WITH CHECK (guardian_user_id = auth.uid() AND status = 'pending');
CREATE POLICY links_approve_learner ON public.guardian_links FOR UPDATE TO authenticated
USING (learner_user_id = auth.uid()) WITH CHECK (learner_user_id = auth.uid());

CREATE POLICY memberships_read_self_guardian ON public.memberships FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), user_id));

CREATE POLICY safety_read_self_guardian ON public.safety_settings FOR SELECT TO authenticated
USING (learner_user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), learner_user_id));

CREATE POLICY rooms_read_eligible ON public.rooms FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.learner_profiles lp
  WHERE lp.user_id = auth.uid() AND lp.grade_band = rooms.grade_band
));

CREATE POLICY room_members_read_shared ON public.room_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.shares_room(auth.uid(), user_id));
CREATE POLICY room_members_join_self ON public.room_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.rooms r
    JOIN public.learner_profiles lp ON lp.user_id = auth.uid() AND lp.grade_band = r.grade_band
    JOIN public.memberships m ON m.user_id = auth.uid() AND m.status = 'active'
    JOIN public.safety_settings s ON s.learner_user_id = auth.uid()
    WHERE r.id = room_id AND r.status = 'open' AND s.multiplayer_consent AND lp.matching_enabled
      AND CASE r.minimum_tier WHEN 'free' THEN 0 WHEN 'explorer' THEN 1 WHEN 'guardian' THEN 2 ELSE 3 END
          <= CASE m.tier WHEN 'free' THEN 0 WHEN 'explorer' THEN 1 WHEN 'guardian' THEN 2 ELSE 3 END
      AND m.level >= r.minimum_level
  )
);
CREATE POLICY room_members_update_self ON public.room_members FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY room_members_leave_self ON public.room_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY messages_read_shared_approved ON public.room_messages FOR SELECT TO authenticated
USING (
  moderation_status = 'approved'
  AND EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_messages.room_id AND rm.user_id = auth.uid())
  AND NOT EXISTS (SELECT 1 FROM public.user_blocks b WHERE (b.blocker_user_id = auth.uid() AND b.blocked_user_id = sender_user_id) OR (b.blocker_user_id = sender_user_id AND b.blocked_user_id = auth.uid()))
);
CREATE POLICY messages_submit_pending ON public.room_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_user_id = auth.uid() AND moderation_status = 'pending'
  AND EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_messages.room_id AND rm.user_id = auth.uid())
);

CREATE POLICY blocks_manage_self ON public.user_blocks FOR ALL TO authenticated
USING (blocker_user_id = auth.uid()) WITH CHECK (blocker_user_id = auth.uid());

CREATE POLICY reports_read_own_guardian ON public.safety_reports FOR SELECT TO authenticated
USING (reporter_user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), reporter_user_id) OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY reports_create_self ON public.safety_reports FOR INSERT TO authenticated
WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY moderation_read_subject_guardian ON public.moderation_events FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_approved_guardian(auth.uid(), user_id) OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER learners_updated BEFORE UPDATE ON public.learner_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER links_updated BEFORE UPDATE ON public.guardian_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER memberships_updated BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER safety_updated BEFORE UPDATE ON public.safety_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;
ALTER TABLE public.room_messages REPLICA IDENTITY FULL;

CREATE INDEX room_members_user_idx ON public.room_members(user_id);
CREATE INDEX room_members_presence_idx ON public.room_members(room_id, last_seen_at DESC);
CREATE INDEX room_messages_room_idx ON public.room_messages(room_id, created_at DESC);
CREATE INDEX rooms_match_idx ON public.rooms(world_id, grade_band, status, minimum_level);
CREATE INDEX reports_status_idx ON public.safety_reports(status, created_at DESC);