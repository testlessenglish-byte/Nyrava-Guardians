-- Rollback script for 20260904_admin_parent_schema_v2.sql

DROP TRIGGER IF EXISTS trg_immutable_audit_events ON public.audit_events;
DROP FUNCTION IF EXISTS public.prevent_audit_modification();
DROP FUNCTION IF EXISTS public.is_super_admin(TEXT);
DROP FUNCTION IF EXISTS public.is_admin_user(TEXT);
DROP FUNCTION IF EXISTS public.is_approved_guardian(TEXT, TEXT);

DROP TABLE IF EXISTS public.account_deletion_requests;
DROP TABLE IF EXISTS public.coppa_consents;
DROP TABLE IF EXISTS public.audit_events;
DROP TABLE IF EXISTS public.learning_content;
DROP TABLE IF EXISTS public.system_settings;
