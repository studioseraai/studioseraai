# Validation
- Production build passed before final styling/timezone updates; final build runs during packaging.
- TypeScript check passed after correcting API response options and client JSON types; final rerun pending packaging.
- Browser: opt-in demo initialization produced 20 fictional artworks; dashboard computed 18 available and 10 in gallery.
- Browser: title search narrowed 20 records to one; artwork detail displayed matching identifier and metadata.
- Browser: transfer from External exhibition to Gallery Wall A saved and appeared in the permanent movement register.
- Browser: new incomplete artwork saved and inventory count increased to 21.
- Visual desktop inspection passed for ivory/charcoal/gold shell and movement table.
- Original file upload, CSV download contents, mobile interaction, staff authorization and restore tests NOT completed.
- tests/smoke.py is a proposed local API integration test, not a passed test: initial invocation lacked Python requests and local supervisor networking was unavailable to the shell.

## Vercel compatibility update
- `VERCEL=1 NEXT_TELEMETRY_DISABLED=1 npm run build`: PASSED (Next.js 16.3.4 webpack; compilation, TypeScript, static generation and tracing).
- `.next/routes-manifest.json`: generated, manifest version 3.
- Token-protected storage Worker: Wrangler deploy --dry-run PASSED; no live resources created.
- Server adapter tests PASSED: missing-password fail closed, wrong-password 401, owner authentication, missing-backend 503, bearer forwarding, POST origin rejection.
- Vercel hosting deployment, actual D1/R2 connectivity and data migration remain unverified; account-specific resources and environment variables must be configured using DEPLOY_VERCEL.md.

## Supabase backend integration
- Active project inspected before changes; public schema was empty.
- Postgres schema, restricted RPC and private photo bucket deployed.
- Edge Function art-vault deployed with its own bearer-token hash verification.
- End-to-end remote tests PASSED: unauthorized request rejection, artwork save/readback, atomic movement, separate sale/location, invalid transfer rejection, original photo upload, hash-verified download, unauthorized photo rejection, archival of fictional test artwork.
- Next.js production build PASSED after integration.
- Supabase path-prefix and token-forwarding unit check PASSED.
- Security advisors: no warnings/errors; two INFO notices for RLS without policies, intentional because direct anon/authenticated table access is revoked and only the protected server backend operates on these tables.
- Vercel environment update was blocked by automatic approval review pending explicit approval to transmit the generated backend token to Vercel. Live Vercel-to-Supabase connection is therefore not verified yet.
