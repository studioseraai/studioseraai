# Archive and restore artworks

Artwork Inventory has an Archive / Delete button immediately beside Import Excel. It opens a searchable manager with Active and Archived lists. Select paintings, review the count, then confirm Archive or Restore. Up to 1,000 distinct artworks can be changed per request.

Archiving removes paintings from active inventory, overview counts, valuation reports and visualizer choices. It preserves their record IDs, original photographs, import references and complete movement history. Restoring returns the same records to active inventory. Archive and restore events are recorded in audit history, with timestamps; repeating an action skips records already in that state.

Select all selects every matching artwork, including rows not yet displayed. Archive preserves the record for restoration. Delete permanently removes artwork and photo metadata and queues the original files for removal; it requires typing DELETE in the confirmation panel. Deleted records cannot be restored. Movement and audit history retain their historical references. Failed original-file removal is durably queued with a Retry photo removal action; normal deletion attempts also drain that queue. A stale edit cannot reset an artwork's archive state. Archived paintings must be restored before new movements can be recorded. Re-importing an archived inventory number still counts as a duplicate and does not recreate it.

Apply supabase/archive.sql after the base schema, and deploy the updated art-vault Edge Function. The SQL replaces the existing service-only SECURITY INVOKER action function while preserving its save, movement and seed behavior. Archive requests lock artwork rows in ID order and update the entire selection in one transaction. The Cloudflare adapter implements the same state changes and audit records in an atomic D1 batch.

Verification: active/archived search and payload validation; isolated database tests for archive, restore, audit, retry, stale edits, rejected IDs, movement protection, import duplicate protection and authenticated Edge routing; TypeScript, lint, production build and smoke checks. Tests use an isolated database and do not archive real gallery inventory.

For permanent deletion, also apply `supabase/delete-artworks.sql` and redeploy the art-vault function. These RPCs are executable only by the protected backend service role. No real artwork is deleted as part of development or deployment.
