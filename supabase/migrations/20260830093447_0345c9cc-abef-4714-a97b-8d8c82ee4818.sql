CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION private.is_approved_guardian(_guardian uuid, _learner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guardian_links
    WHERE guardian_user_id = _guardian AND learner_user_id = _learner AND status = 'approved'
  )
$$;
CREATE OR REPLACE FUNCTION private.shares_room(_viewer uuid, _other uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members mine
    JOIN public.room_members theirs ON theirs.room_id = mine.room_id
    WHERE mine.user_id = _viewer AND theirs.user_id = _other
      AND mine.last_seen_at > now() - interval '2 minutes'
      AND theirs.last_seen_at > now() - interval '2 minutes'
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_approved_guardian(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.shares_room(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_approved_guardian(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.shares_room(uuid, uuid) TO authenticated;

DROP POLICY profiles_read_safe ON public.profiles;
CREATE POLICY profiles_read_safe ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.shares_room(auth.uid(), user_id) OR private.is_approved_guardian(auth.uid(), user_id));
DROP POLICY roles_read_self_or_guardian ON public.user_roles;
CREATE POLICY roles_read_self_or_guardian ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), user_id));
DROP POLICY learner_read_self_guardian ON public.learner_profiles;
CREATE POLICY learner_read_self_guardian ON public.learner_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), user_id));
DROP POLICY memberships_read_self_guardian ON public.memberships;
CREATE POLICY memberships_read_self_guardian ON public.memberships FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), user_id));
DROP POLICY safety_read_self_guardian ON public.safety_settings;
CREATE POLICY safety_read_self_guardian ON public.safety_settings FOR SELECT TO authenticated
USING (learner_user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), learner_user_id));
DROP POLICY room_members_read_shared ON public.room_members;
CREATE POLICY room_members_read_shared ON public.room_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.shares_room(auth.uid(), user_id));
DROP POLICY reports_read_own_guardian ON public.safety_reports;
CREATE POLICY reports_read_own_guardian ON public.safety_reports FOR SELECT TO authenticated
USING (reporter_user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), reporter_user_id) OR private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY moderation_read_subject_guardian ON public.moderation_events;
CREATE POLICY moderation_read_subject_guardian ON public.moderation_events FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_approved_guardian(auth.uid(), user_id) OR private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'));

DROP FUNCTION public.has_role(uuid, public.app_role);
DROP FUNCTION public.is_approved_guardian(uuid, uuid);
DROP FUNCTION public.shares_room(uuid, uuid);