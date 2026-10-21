# Studio Seraai OS — Art Vault
Private first release. Built with React/Vinext, Cloudflare D1 and R2 through Sites.

## Run
Node 22+, npm install, npm run db:generate, npm run build; apply the generated SQL locally using the starter D1 command; npm run dev. Hosted publishing applies migrations automatically. Sites private owner access is required; do not make this deployment public or share it until per-user authorization is implemented. Hosted platform authentication protects both API records and media.

## Implemented
Persistent artwork create/edit, database-sequence inventory identifiers, artist profiles, search and availability filter, grid/table, original multi-file image upload (20 MB per file), SHA-256 integrity metadata, permanent movement register with atomic conditional location changes, dashboard statistics, CSV export and opt-in 20 fictional records. Editing availability never triggers delivery. Existing artwork locations change only through movement events.

## Architecture decision
Providence repository inspected through GitHub: PHP 8.2/8.3, GPL-3.0, cataloging backend, native media and GraphQL. Sites runs JS Workers rather than PHP, so Providence cannot be installed into this runtime. No Providence code copied. Smaller repository retrieval failed; no assumptions made about completeness or license. The present app is an independent foundation, not a Providence integration. Actual database model consists of typed records plus media references. Artist many-to-many normalization and full metadata schema remain future work.

## Known limitations
Owner-only access; no staff roles. No sales ledger, payments, bulk import, QR printing, archive/reversal workflow, return reconciliation, image variants, primary/reordering controls, background uploads, automatic backups or verified recovery. Artist links currently use names rather than normalized relations. Timestamps record effective and creation time; no authenticated actor audit yet. Inventory ID uses a global sequence shared by record types, with intentional gaps. Original media are preserved; placeholder abstract graphics are explicitly demo visuals, not actual paintings. Prices stored as integer PKR in the interface; commercial decimal accounting remains unimplemented. No production-readiness claim.

## Before real migration
Implement and validate staff permissions, normalized artist links, complete artwork schema, safe CSV/Excel import, backup export and restoration, media processing and movement corrections. Keep existing source inventory and originals backed up independently. Database and object storage require coordinated snapshots; restore into an isolated staging environment and verify photo hashes, record counts and movement locations before cutover. No recovery test has been completed.
