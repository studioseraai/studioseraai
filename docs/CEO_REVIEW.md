# SERAAI OS v1.0 - CEO Review Candidate

This is a review candidate, not unconditional operational sign-off. The approved charcoal/ivory/gold layout, logo and fonts are unchanged. No production records, credentials, schemas or environment variables were modified.

## Audited platform
Next.js 16.3.4, React 19.2.6, TypeScript 5.9.3 and pnpm 11.25.0; Node engines >=22.13.0. Vercel selects the standard Next.js build. Supabase provides Postgres records, a protected Edge Function and private original-photo storage. Styling uses the existing CSS and UI components.

## Focused corrections
- Preserve UUID photo identifiers when selecting multiple photographs in Art Visualizer.
- Show missing prices as Not recorded; preserve explicitly recorded zero prices.
- Add non-destructive incomplete-metadata indicators and honest missing/broken-photo states.
- Bound inventory and visualizer lists to 36 entries, with Load more, lazy original images, and inventory title/artist sorting.
- Use Pakistan time consistently and label historical activity involving archived artworks.
- Add an immediate ref lock against duplicate submissions, keep failed forms intact, and harden CSV quoting including whitespace-prefixed formulas and UTF-8 text.
- Reset visualizer placement to the current room's defaults and show accurate export feedback.
- Return a safe configuration error for malformed backend URLs.
- Reuse the approved logo in application metadata/favicon.
- Resolve legacy backend lint errors with type-only annotations and const declarations; these do not require a live backend redeployment.

## Repeatable checks
```
pnpm run test
pnpm exec tsc --noEmit
pnpm run lint
VERCEL=1 pnpm run build
```
The regular suite includes renderer, UI data-formatting and authentication/proxy tests.

For isolated Postgres and Edge-handler regression, install `@electric-sql/pglite@0.5.11` outside the application (for example an empty QA directory), set `SERAAI_QA_PGLITE` to its absolute `dist/index.js`, then run `pnpm run test:db`. No application dependency was added. The suite loads the committed schema into a fresh in-memory database. Storage HTTP responses use an in-memory adapter; no production credentials or live records are used.

## Evidence boundaries
- Local automated tests and production HTTP tests do not prove complete browser usability.
- Live database RLS/grants, private bucket configuration, active Edge Function and anonymous rejection were checked read-only. Owner-authenticated live browser operations were not exercised.
- Browser checks at 1440, 1280, 1024, 768 and 390 pixels remain pending. Desktop/tablet/mobile CSS was reviewed, but responsive visual acceptance must not be marked passed without screenshots and interaction checks.
- Repeated original image fetching is reduced through bounded/lazy lists; generated thumbnail derivatives are not implemented.
- API-level token and image-signature checks were verified in the committed handler. Actual managed Storage uploads were not repeated against production.

## Current capabilities and gaps
Inventory create/edit, artist names and profile creation, photographs, movements, fixed location directories, inventory statistics/CSV and client-side visualization exist. Artist profile editing/detail views, individual staff roles, a reliable application logout, settings persistence, date-filtered reports, backup restore drills, saved visualizations and perspective editing are not implemented. Do not present these as finished features. Artist links currently use names rather than immutable artist IDs.

## Required sign-off before office reliance
1. Owner reviews the private data-quality report and chooses complete, verified demonstration artworks. Do not delete or rename suspected test data automatically.
2. Complete authenticated browser acceptance, including navigation/history, form failures, 600-record fixture browsing, photo selection, movement and downloaded PNG review. Use an isolated environment for any writes.
3. Confirm off-site database and original-photo backups, retention, recovery ownership and a successful isolated restore drill. Database backups do not include original Storage objects.
4. Record Vercel/Supabase/GitHub ownership and recovery access. Shared owner credentials do not provide individual staff accountability.
5. Approve the exact release commit before merging to main. Existing production remains unchanged until approval.

## CEO walkthrough (5-7 minutes)
Introduce the private collection workspace; show the dashboard, an owner-approved artwork and its original photograph, artist filtering, location counts, historical handovers, room visualization and PNG export, then inventory reports. Keep the production presentation read-only. Explain operational gaps before asking for executive approval.
