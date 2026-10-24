# Import photographs from Excel

Open Artwork Inventory → Import Excel photos and choose the original .xlsx workbook (up to 300 MB). The file stays in the browser. The importer reads workbook metadata and extracts image files on demand rather than uploading the workbook to Vercel.

Supported image links:
- Drawing images anchored to a row in a Painting Image, Image, Photo or Photograph column.
- Excel local in-cell images, following value metadata, rich-value structure and image relationships. Cached #VALUE! cells do not prevent extraction.
- PNG, JPEG and WebP embedded files. Header images, external links and images without a safe artwork-row association are excluded.

Match preview compares old inventory numbers with existing records and checks title/artist consistency. Source worksheet/row provenance and unique exact title/artist/dimensions provide fallbacks when old identifiers are absent. Conflicting old identifiers, multiple artwork matches, archived artworks and existing photographs are excluded. When multiple Excel images match the same artwork, the pictures start unchecked and the user can select one explicitly. Bulk selection does not make that choice.

Review thumbnails and artwork IDs, then Upload photos. Uploads run sequentially with progress and Pause after the current request. The app refreshes inventory after the run. Previously photographed artworks are skipped on repeat runs; a database row lock prevents overlapping Excel imports from adding duplicate first photographs. No artwork details or existing pictures are overwritten.

Original image bytes are uploaded when below 3.5 MB. Larger images are converted to a JPEG copy with longest edge up to 2800 pixels to fit Vercel request limits. The original workbook is unchanged. Unsupported/oversized/unreadable images are reported per row and remain available for manual correction. The upload tab must stay open; progress is not a background job. A new scan after interruption uses existing photo records to resume safely.

Apply supabase/excel-photo-import.sql and deploy the updated art-vault function. The service-only attachment RPC checks that the artwork exists, is active and still has no photographs before inserting metadata. If another photograph won the race, the redundant newly uploaded object is removed. The Cloudflare backend uses a conditional metadata insert for the same behavior.

Verification includes drawing and rich-image fixtures with deliberately reordered metadata, external-path rejection, duplicate/conflicting identifier matching, archived/existing photo exclusion, on-demand ZIP extraction, database retry and archive protection, TypeScript, lint, build and smoke checks. The supplied workbook yielded 562 image links for 561 unique artwork rows: 503 links on INVENTORY-A and 59 on INVENTORY-B, including one row with two different images requiring review. These checks did not upload real inventory photographs to production.
