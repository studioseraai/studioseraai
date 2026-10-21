# Deploy Studio Seraai OS on Vercel

## Why the original build failed
The repository originally builds with Vinext for Cloudflare Workers. Vercel detected the Next.js dependency and searched for `.next/routes-manifest.json`, which Vinext does not produce. The build launcher now runs real `next build --webpack` on Vercel. Existing Sites/Vinext builds keep their original command.

## Vercel settings
Import this GitHub repository. Use Next.js framework preset, root directory `./`, Node 22.x, default install command, build command `pnpm run build`, output directory `.next`. vercel.json supplies the framework, build and output settings. Remove conflicting dashboard overrides. Redeploy the latest commit.

## Storage and private access are required separately
Vercel does not supply the D1 database, R2 bucket, or ChatGPT private sign-in from the existing Sites deployment. A successful build alone does not migrate them. This version uses a token-protected Cloudflare storage Worker and password-protected Vercel application. Do not point at the existing private Sites URL: its sign-in is not a storage service token.

Create resources in a Cloudflare account you control (requires D1/R2 availability):

```sh
pnpm exec wrangler d1 create seraai-inventory
pnpm exec wrangler r2 bucket create seraai-photos
```
Copy the returned database ID into `backend/wrangler.jsonc`. The bucket name must match the resource you created. Initialize the schema:

```sh
pnpm exec wrangler d1 migrations apply seraai-inventory --remote --config backend/wrangler.jsonc
pnpm exec wrangler secret put SERAAI_BACKEND_TOKEN --config backend/wrangler.jsonc
pnpm exec wrangler deploy --config backend/wrangler.jsonc
```
Use a strong randomly generated secret for the backend token. Enter it only in Cloudflare's secure prompt and Vercel environment settings, never in GitHub or chat. Record the Worker HTTPS URL returned by deployment.

In Vercel Project → Settings → Environment Variables add:

| Variable | Value |
| --- | --- |
| SERAAI_PASSWORD | Strong unique workspace password, at least 16 characters |
| SERAAI_BACKEND_URL | HTTPS URL returned by the storage Worker deployment |
| SERAAI_BACKEND_TOKEN | Same secret entered into the Cloudflare Worker |

Redeploy after changing environment variables. Sign in with username `owner` and SERAAI_PASSWORD. If the password is missing, the application intentionally returns 503; missing backend settings return a descriptive 503 from the API. No inventory is fabricated on failure. Staff roles remain unimplemented; this is a single-owner workspace.

## Photos on Vercel
Vercel Function request limits apply before application code, including multipart overhead. Upload small images (under 4 MB) through this release; large original images need a direct-to-storage upload flow, which is not implemented here. The existing Sites release supports its original 20 MB validation. The new Cloudflare resources start empty; existing Sites records and photos are not automatically copied. Keep original records and files until a verified migration is complete.

## Verify after setup
Sign-in must protect both the dashboard and API. Add one test artwork, refresh to confirm persistence, upload a small photo, record a transfer, and verify its location and history. Storage Worker must reject requests without its bearer token. Back up records and media before migrating real inventory.
