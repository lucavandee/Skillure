/*
  # Security audit helper (NON-DESTRUCTIVE)

  Intentionally does **not** enable RLS on any existing table. The live
  Skillure database already has tables we do not fully understand from
  the repo migrations, so flipping `ENABLE ROW LEVEL SECURITY` without
  policies would instantly lock reads for the app.

  Instead this migration:

    1. Creates a private `internal` schema that is NOT exposed to
       PostgREST (only `public` is by default in Supabase).
    2. Adds `internal.security_audit()`, a `SECURITY INVOKER`,
       read-only function that reports, for every base table in
       `public`:
         - whether RLS is enabled
         - how many policies it has
         - whether `anon` / `authenticated` currently hold SELECT
         - a human-readable status (`CRITICAL` / `WARN` / `OK` / ...)
    3. Locks execute permission on that function to `postgres` and
       `service_role` — `anon` and `authenticated` cannot call it.

  How to use (from the Supabase dashboard SQL editor, which runs as
  `postgres`):

      SELECT * FROM internal.security_audit();

  Rows flagged `CRITICAL` are the ones to address first: they have no
  RLS yet are selectable by anon/authenticated. Fix each one in its own
  follow-up migration, then rerun the function to confirm.
*/

-- 1. Private schema (not on the PostgREST search path).
CREATE SCHEMA IF NOT EXISTS internal;

REVOKE ALL ON SCHEMA internal FROM PUBLIC;
REVOKE ALL ON SCHEMA internal FROM anon;
REVOKE ALL ON SCHEMA internal FROM authenticated;
GRANT USAGE ON SCHEMA internal TO postgres, service_role;

COMMENT ON SCHEMA internal IS
  'Private schema for security tooling. Not exposed via PostgREST.';

-- 2. Audit function. SECURITY INVOKER + STABLE + read-only.
CREATE OR REPLACE FUNCTION internal.security_audit()
RETURNS TABLE (
  schema_name              text,
  table_name               text,
  rls_enabled              boolean,
  policy_count             bigint,
  exposed_to_anon          boolean,
  exposed_to_authenticated boolean,
  status                   text
)
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = pg_catalog, public
AS $$
  WITH tbls AS (
    SELECT
      n.nspname::text AS schema_name,
      c.relname::text AS table_name,
      c.relrowsecurity AS rls_enabled,
      format('%I.%I', n.nspname, c.relname) AS qualified
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
  ),
  enriched AS (
    SELECT
      t.schema_name,
      t.table_name,
      t.rls_enabled,
      COALESCE((
        SELECT count(*)
        FROM pg_policies p
        WHERE p.schemaname = t.schema_name
          AND p.tablename  = t.table_name
      ), 0) AS policy_count,
      CASE WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
           THEN has_table_privilege('anon', t.qualified, 'SELECT')
           ELSE false
      END AS exposed_to_anon,
      CASE WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
           THEN has_table_privilege('authenticated', t.qualified, 'SELECT')
           ELSE false
      END AS exposed_to_authenticated
    FROM tbls t
  )
  SELECT
    e.schema_name,
    e.table_name,
    e.rls_enabled,
    e.policy_count,
    e.exposed_to_anon,
    e.exposed_to_authenticated,
    CASE
      WHEN NOT e.rls_enabled
           AND (e.exposed_to_anon OR e.exposed_to_authenticated)
        THEN 'CRITICAL: no RLS and selectable by anon/authenticated'
      WHEN e.rls_enabled AND e.policy_count = 0
        THEN 'WARN: RLS enabled but no policies (effectively locked to service_role)'
      WHEN NOT e.rls_enabled
        THEN 'INFO: no RLS, but not PostgREST-exposed'
      WHEN e.rls_enabled AND e.policy_count > 0
        THEN 'OK'
      ELSE 'UNKNOWN'
    END AS status
  FROM enriched e
  ORDER BY
    CASE
      WHEN NOT e.rls_enabled
           AND (e.exposed_to_anon OR e.exposed_to_authenticated) THEN 0
      WHEN e.rls_enabled AND e.policy_count = 0                  THEN 1
      WHEN NOT e.rls_enabled                                     THEN 2
      ELSE 3
    END,
    e.table_name;
$$;

COMMENT ON FUNCTION internal.security_audit() IS
  'Reports RLS state and PostgREST exposure for every base table in public. '
  'Read-only. Run from the Supabase SQL editor: SELECT * FROM internal.security_audit();';

-- 3. Lock down execute privileges.
REVOKE ALL ON FUNCTION internal.security_audit() FROM PUBLIC;
REVOKE ALL ON FUNCTION internal.security_audit() FROM anon;
REVOKE ALL ON FUNCTION internal.security_audit() FROM authenticated;
GRANT EXECUTE ON FUNCTION internal.security_audit() TO postgres, service_role;
