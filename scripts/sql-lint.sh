#!/usr/bin/env bash
#
# Static analyser for Supabase migration files.
#
# Catches a small, precise set of dangerous patterns that we have seen
# cause real incidents:
#
#   1. CREATE [MATERIALIZED] VIEW without `security_invoker` set anywhere
#      in the same migration file. In Postgres 15+ views default to
#      SECURITY DEFINER semantics, which bypass caller RLS.
#
#   2. GRANT ... ON auth.<anything> TO anon / authenticated. This is the
#      exact pattern that exposes `auth.users` via PostgREST.
#
#   3. Hard-coded JWT-looking strings or a literal SUPABASE_SERVICE_ROLE_KEY
#      assignment inside a migration file.
#
# Exit code 0 = clean, 1 = one or more findings.

set -euo pipefail

MIGRATIONS_DIR="supabase/migrations"
FAIL=0

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "sql-lint: no migrations directory at $MIGRATIONS_DIR, skipping."
  exit 0
fi

shopt -s nullglob
files=("$MIGRATIONS_DIR"/*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "sql-lint: no .sql files in $MIGRATIONS_DIR, skipping."
  exit 0
fi

echo "sql-lint: scanning ${#files[@]} migration file(s) in $MIGRATIONS_DIR"

for file in "${files[@]}"; do
  # --- Rule 1: views must set security_invoker somewhere in the file ---
  if grep -qiE 'create[[:space:]]+(or[[:space:]]+replace[[:space:]]+)?(materialized[[:space:]]+)?view' "$file"; then
    if ! grep -qi 'security_invoker' "$file"; then
      echo "ERROR [$file]: defines a view but does not set 'security_invoker'."
      echo "        Fix: append WITH (security_invoker = on) to the CREATE VIEW,"
      echo "             or add ALTER VIEW <name> SET (security_invoker = on);"
      FAIL=1
    fi
  fi

  # --- Rule 2: grants on the auth schema to PostgREST-facing roles ---
  # Matches things like: GRANT SELECT ON auth.users TO anon;
  if grep -qiE 'grant[[:space:]]+[^;]*[[:space:]]on[[:space:]]+(table[[:space:]]+)?auth\.[a-z_]+[^;]*[[:space:]]to[[:space:]]+(anon|authenticated)' "$file"; then
    echo "ERROR [$file]: grants privileges on the auth schema to anon/authenticated."
    echo "        Fix: never expose auth.* to PostgREST roles. Copy the fields you"
    echo "             need into a public.profiles table with its own RLS."
    FAIL=1
  fi

  # --- Rule 3: hard-coded JWT / service_role key ---
  if grep -qE 'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}' "$file"; then
    echo "ERROR [$file]: contains what looks like a hard-coded JWT."
    FAIL=1
  fi
  if grep -qiE 'service_role_key[[:space:]]*(=|:=|:)[[:space:]]*['\''\"][A-Za-z0-9_\.-]+' "$file"; then
    echo "ERROR [$file]: contains what looks like a hard-coded service_role key."
    FAIL=1
  fi
done

if [ "$FAIL" -eq 0 ]; then
  echo "sql-lint: OK — no dangerous patterns found."
fi

exit "$FAIL"
