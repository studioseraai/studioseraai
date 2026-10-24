# SERAAI OS — Vercel with Supabase

The production backend is Supabase project `igkabecikbcjsccndjol`, Edge Function `art-vault`.
The application keeps its owner password login and server-side proxy. No Supabase privileged key is sent to the browser.

## Vercel configuration
- SERAAI_PASSWORD: existing owner password, at least 16 characters.
- SERAAI_BACKEND_URL: `https://igkabecikbcjsccndjol.supabase.co/functions/v1/art-vault`
- SERAAI_BACKEND_TOKEN: private integration token matching the deployed function's SHA-256 verifier. Never commit or disclose it publicly.

Set these in Production, then redeploy `main`. Use the Next.js preset, `pnpm run build`, output `.next`.
The proxy preserves the backend URL path prefix, which is required for Supabase Functions.

## Backend
`supabase/schema.sql` describes the schema deployed using the migration `seraai_inventory_foundation`.
Records and photo metadata use Postgres, atomic movement transactions use a restricted RPC, and originals use private bucket `seraai-artworks`.
RLS is enabled with direct anon/authenticated access revoked; this first release allows the protected server backend only. Individual staff accounts and policies remain future work.
The function authenticates a high-entropy bearer token by its SHA-256 hash before performing any database or storage action. `verify_jwt=false` is intentional because the body performs authentication. Platform-provided Supabase server credentials stay inside the function.

`supabase/functions/art-vault/index.ts` supports the `SERAAI_BACKEND_TOKEN` Edge Function secret. Configure the same high-entropy value in Supabase Function Secrets and Vercel, without committing it. The function hashes the configured token before comparison. `__TOKEN_HASH__` is only the legacy fallback template; when no secret or real fallback hash exists, access fails closed. Supabase service credentials remain platform-managed inside the function.

For Preview deployments, explicitly select Preview for the required variables if the owner wants that preview connected. Do not point a preview used for write testing at production; use a separately approved staging backend. Vercel deployment protection may require the owner's Vercel sign-in in addition to the app login.

The earlier Cloudflare backend under `backend/` is retained as an alternative and is not required for this deployment. Existing Sites data have not been migrated. Do not assume an empty database: existing Supabase inventory and original files must be preserved.

Vercel Function payload limits still apply; use photographs under 4 MB for this release. Direct-to-storage signed uploads and large-file originals are future work. Full staff permissions, sales accounting, normalized artist relationships, imports, QR labels and backup restoration remain unfinished.

## Verification
The preferred no-production-write checks are documented in `docs/CEO_REVIEW.md`. The legacy `python tests/supabase_smoke.py` must only target a separately approved disposable test workspace; it reads its URL and token from hidden stdin, creates a fictional artwork and tiny photo, tests readback, movement, sale/location separation and private media, then archives the test artwork while retaining its audit history.

Keep coordinated database and original-photo backups independently. A Postgres backup alone does not include Storage file bodies.
