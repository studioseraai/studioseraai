# Art Visualizer 2.0

True Scale is integrated alongside the existing free room styling visualizer. Inventory and Excel/photo import remain the same records and endpoints.

## Measurement contract

Existing inventory width/height remain centimetres. Optional `framedWidth`, `framedHeight`, `dimensionUnit`, `measurementVerified` live in the existing artwork JSON. Legacy measurements are unverified until physically checked in Edit artwork. No backfill or automatic verification occurs.

Wall dimensions, margins, exclusion zones, layer centres and footprints are millimetres. Unit selection and viewport zoom never modify geometry. Rotation is explicit and cardinal. Framed mode uses recorded outside sizes; unknown frames stay clearly unverified and are excluded from framed recommendations. Invalid geometry blocks proposals. Missing photos render explicit placeholders.

Single, pair, triptych, salon, statement/support, grid, vertical and freeform compositions preserve real artwork size. Recommendations use bounded candidate searches (up to 2,500 attempts) and deterministic final fit validation. Searches are not exhaustive. Default filters require Available status; sold/reserved never enter recommendations.

Room projection uses the same coordinates and a homography from four user-marked corners. It depends on correct wall-plane measurements, a clean photo and calibration. It does not reconstruct depth, remove existing objects or calculate furniture occlusion. Installation references remain the measured wall and physical site checks.

## Saved layouts and release

`supabase/wall-layouts.sql` adds a private RLS-enabled table, accessible only to service_role. Layout JSON is validated in the shared browser/Edge validator. Existing artwork and photos are not duplicated. Cloudflare stores layout-kind JSON separately in its existing records table and excludes it from inventory reads.

The additive table migration was applied. The Edge Function update is **not deployed**: automatic approval review rejected replacement of the shared live function under the preview-first instruction. Cloud save/list/load will work after that reviewed backend update is approved and deployed. JSON backup/open works independently. No application changes are merged into main.

Deploy `supabase/functions/art-vault/index.ts` with both sibling validation modules. Preserve the currently deployed TOKEN_HASH privately (or use the existing environment token); never deploy the committed placeholder or change authentication. The existing verify_jwt=false function performs its own bearer-hash authentication. Do not print or commit deployed credentials/hash.

## Verification

- 73 unit tests: geometry, scale, units, invalid dimensions, frames, overlap, exclusions, saved snapshots, locked transforms, bounded 600-record matching, projection and SVG escaping, plus all existing tests.
- 33 isolated PGlite/Edge integration tests including save/list/reload, malformed layouts and private table permissions; no production inventory writes.
- TypeScript, production build and production auth/assets smoke pass.
- ESLint: zero errors, nine warnings (existing image conventions plus two lazy image lists).
- Browser acceptance script: `tests/wall-browser.mjs`, requires external Playwright install via `SERAAI_QA_PLAYWRIGHT` and optional `SERAAI_QA_CHROMIUM`. It uses only fixture inventory and intercepted API requests. Browser execution is currently blocked by this runtime's socket restrictions; it has **not passed**. Manual preview QA remains necessary for dragging, image export downloads, calibration, responsive UI and cloud save after activation.

## Preview review steps

1. Edit a test artwork with 121.92 × 121.92 cm canvas and verified measurements. On an 8 × 8 ft wall it must occupy half the width/height and leave 2 ft each edge when centred.
2. Change units and zoom: physical sizes/positions must stay unchanged. Drag, lock, undo and redo; check inspector distances.
3. Add oversize or overlapping works: resolve errors before export. Missing measurements must refuse placement. Missing frame dimensions must show draft warnings.
4. Try pairs/triptychs/collections on 5 × 3 ft and larger walls. Check margins, gaps, obstacles and available inventory filtering.
5. Save/open JSON and export PNG/PDF. Confirm legend, same geometry, missing-price disclosure and draft marks.
6. Select a room, mark four corners clockwise and confirm matching wall dimensions. Custom rooms require clean-wall confirmation. Check old free styling mode independently.
7. After backend approval, cloud save/reopen and verify position/rotation/frame snapshots. Inventory edits or archived/missing records must invalidate stale saved geometry.
