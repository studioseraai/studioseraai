# SERAAI OS
Private artwork inventory and gallery operations for Studio Seraai. The current target is **Vercel + Next.js + Supabase**. The approved logo, charcoal/ivory/gold palette and locally bundled Cormorant Garamond / Manrope fonts are preserved.

## Local use
Use the Node/pnpm versions declared in package.json and install with `pnpm install --frozen-lockfile`. Put the three owner-supplied server variables from [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) in your ignored `.env.local`. Never paste secrets into source files or commit them.

- `pnpm run dev:vercel` - local Next.js application with the same protected proxy used on Vercel.
- `pnpm run build:vercel` - production Next.js build.
- `pnpm run start:vercel` - serve that build locally.

Do not connect a local development session to production for write tests. Use the isolated regression suite or a separately approved staging backend. Legacy Vinext/Cloudflare commands and backend source are retained for the original hosting alternative; they are not the current production target.

## Checks
`pnpm run test`, `pnpm exec tsc --noEmit`, `pnpm run lint`, `pnpm run build:vercel`, then `pnpm run test:smoke`.

For isolated SQL/Edge tests and release gates, see [docs/CEO_REVIEW.md](docs/CEO_REVIEW.md). Tests never require production credentials. The CEO review candidate is not unconditional operational sign-off.

## Current scope
Inventory create/edit, artist-name directory and profile creation, original multi-photo uploads, permanent movements with atomic location updates, fixed location counts, current inventory summaries/CSV and an interactive room visualizer with PNG export. Commercial availability changes do not physically move an artwork.

## Important boundaries
Single shared owner login; no individual staff roles or reliable application logout. Artist links use names, not normalized foreign keys. Artist profile edit/detail screens, editable settings, sales accounting, import, QR labels, saved visualizations, perspective editing and verified backup restoration are not implemented. Photographs through Vercel are limited to 4 MB per file. Lists reveal 36 artworks at a time and lazily load original images; derivative thumbnails are not generated.

Keep coordinated database and original-photo backups independently. A source checkout or CSV is not a complete backup. Confirm verified real demo metadata and complete authenticated browser/restore acceptance before relying on the app as the sole gallery record.
