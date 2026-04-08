## Summary

<!-- What does this PR do and why? 1-3 bullets. -->

## Test plan

- [ ] Manually tested the happy path
- [ ] Edge cases / error states covered
- [ ] `npm run build` succeeds locally
- [ ] Backend tests pass (if touched)

## Security checklist

Tick every box that applies. If a box is not applicable, strike it through
(`~~like this~~`) rather than leaving it unchecked.

### Database (Supabase migrations)

- [ ] Every new table has `ENABLE ROW LEVEL SECURITY` **and** at least one policy.
- [ ] Every new view is created `WITH (security_invoker = on)`.
- [ ] No view, function or RPC exposes columns from `auth.users` to `anon` or `authenticated`.
- [ ] No new `GRANT ... TO anon` or `GRANT ... TO authenticated` on the `auth` schema.
- [ ] All schema changes are in `supabase/migrations/` — nothing applied only via the Supabase dashboard.
- [ ] Ran `bash scripts/sql-lint.sh` locally and it reports OK.

### Backend (FastAPI)

- [ ] All new endpoints validate input with Pydantic schemas.
- [ ] No raw f-string SQL — only parameterised queries / ORM.
- [ ] Auth-sensitive endpoints verify the Supabase JWT (aud / exp / iss).
- [ ] CORS `allow_origins` is an explicit allow-list, not `"*"`.
- [ ] Rate-limited where relevant (login, signup, password reset).

### Frontend (Vite / React)

- [ ] No new `VITE_*` env var contains a secret. Only the anon key and public URLs.
- [ ] No new `dangerouslySetInnerHTML` without DOMPurify on untrusted content.
- [ ] No service-role key, OpenAI key, Stripe secret, etc. shipped in the bundle.

### Scraping / AI pipeline

- [ ] URLs fetched by the scraper are domain-whitelisted (no SSRF into `127.0.0.1`, `10.*`, `169.254.*`).
- [ ] Scraped content is treated as data, never concatenated into a system prompt.
- [ ] Cost caps on OpenAI / embedding calls are still in place.

### Secrets & dependencies

- [ ] No `.env`, `credentials.json`, private key, token or JWT in the diff.
- [ ] New dependencies are needed, maintained, and from a trusted source.
- [ ] `npm audit --audit-level=high --omit=dev` passes locally (CI will re-check).

## Deploy notes

<!-- Anything reviewers / ops need to know before merging. Migrations to
     run, env vars to set, feature flags to flip, rollback plan, etc. -->
