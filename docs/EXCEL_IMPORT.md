# Excel inventory import

Open Artwork Inventory → Import Excel. Choose an `.xlsx` workbook up to 300 MB, select one worksheet, confirm the header row and column mapping, and review the preview. Select valid rows and press Import artworks. Repeat for another inventory worksheet.

Seraai inventory formats are detected automatically: Sr.No Inv / Old Sr In, NEW WEB, WEB ID NO / ID No., Artist, Title / Subject, Size (inches), Surface, Medium, Web CODE and Price. Header rows may appear within the first 30 rows. Comparison sheets have no title mapping and cannot be imported until a valid artwork column is mapped.

Sizes are interpreted as width × height. Inches (including fractional dimensions) convert to centimetres; original size text and source units are preserved. Missing prices stay missing. A Sold or Reserved marker in the price column becomes availability, with no invented price. Blank availability and location stay unrecorded. Pre-numbered rows with no artwork data are ignored.

The preview displays actual Excel row numbers, validation errors, duplicate references and possible matches. Old inventory references, new web numbers, web IDs, surface and source provenance are preserved separately from new database-generated SERAAI IDs. Inventory search, detail view and CSV export include legacy references. Uploading a file alone does not save it.

Imports only add artworks and never replace existing records. Repeated old inventory numbers are skipped. Without an old ID, an exact title/artist/dimension signature is used. Similar existing manual records start unselected and require review. Up to 1,000 artworks / 2 MB of selected data may be committed per import. Database transactions roll back every insert if any submitted row is invalid; a unique import key prevents retry/concurrent import duplicates. Photos and movement records are not changed.

The data import does not attach images. Use the separate Import Excel photos action to extract and attach embedded pictures to existing artwork records, or upload photographs individually from artwork details. The original workbook is read locally, not uploaded to the application server. Older `.xls` workbooks must first be saved as `.xlsx`.

## Backend setup

After applying `supabase/schema.sql`, apply `supabase/import.sql`. Redeploy `supabase/functions/art-vault` with both index.ts and import-validation.ts. Keep the existing authentication token configuration (including the legacy verifier hash when used). The import RPC is SECURITY INVOKER and executable only by service_role; browser clients still use the protected server API. Cloudflare's existing D1 backend supports the same import action using an atomic batch of conditional inserts.

Validation includes size/header/mapping/duplicate tests, server payload validation, isolated Postgres transaction and retry tests, a 1,000-row import, Edge Function import routing, and protected production smoke checks. The supplied Seraai workbook was parsed locally with 508 artwork rows on INVENTORY-A (header row 3) and 60 on INVENTORY-B (header row 7). Its real data has not been committed to the repository or imported into production during development.
