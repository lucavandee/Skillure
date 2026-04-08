/*
  # Fix view security issues flagged by Supabase database linter

  Addresses two classes of linter errors:

  1. `security_definer_view` (0010): Views created with the default
     SECURITY DEFINER behaviour enforce the view creator's permissions
     and RLS rather than the querying user's. We switch every affected
     view to `security_invoker = on` so queries are evaluated with the
     caller's privileges and RLS policies (Postgres 15+).

  2. `auth_users_exposed` (0002): The `analytics_recruiter_performance`
     view exposes `auth.users` data to the `anon` role via PostgREST.
     We revoke the `anon` (and `authenticated`) grants so that this
     view is only reachable by privileged roles (e.g. `service_role`).

  Each statement is idempotent and guarded with `IF EXISTS` so that
  this migration can be safely re-run.
*/

-- 1. Switch SECURITY DEFINER views to security_invoker semantics.
DO $$
DECLARE
  v_name text;
  affected_views text[] := ARRAY[
    'hotlist_candidates',
    'overdue_tasks',
    'pipeline_overview',
    'system_health_metrics',
    'pending_follow_ups',
    'user_activity_stats',
    'analytics_match_quality',
    'tasks_overview',
    'analytics_pipeline_funnel',
    'analytics_daily_metrics',
    'job_interview_counts',
    'analytics_time_to_hire',
    'candidate_current_stage',
    'today_tasks',
    'candidate_summary',
    'analytics_recruiter_performance'
  ];
BEGIN
  FOREACH v_name IN ARRAY affected_views LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = v_name
        AND c.relkind = 'v'
    ) THEN
      EXECUTE format(
        'ALTER VIEW public.%I SET (security_invoker = on)',
        v_name
      );
    END IF;
  END LOOP;
END
$$;

-- 2. Prevent `analytics_recruiter_performance` from exposing `auth.users`
--    to PostgREST-facing roles. Only privileged roles should query it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'analytics_recruiter_performance'
      AND c.relkind IN ('v', 'm')
  ) THEN
    REVOKE ALL ON public.analytics_recruiter_performance FROM anon;
    REVOKE ALL ON public.analytics_recruiter_performance FROM authenticated;
  END IF;
END
$$;
