# Studio Seraai V4 — WordPress → Supabase reconciliation

Status: **Extraction and matching tools ready. No catalog merge has been executed.**

## Scope and guarantees
- Source: private cPanel backup `backup-10.27.2026_16-46-36_studiose.tar.gz`.
- Product data: `mysql/studiose_w957.sql` (the file displayed by the user is approximately 24 MB).
- Images: `homedir/public_html/wp-content/uploads/`. These are separate from the SQL rows.
- Destination: existing Supabase `public.seraai_records`, `public.seraai_media`, and `public.seraai_publications`.
- Existing Supabase record IDs, movement/audit history, and publication flags must survive. **No TRUNCATE, DELETE, bulk overwrite, or mass publication.**
- Never commit the original SQL dump, credentials, or CSV exports containing private fields to GitHub. Run these commands **on your own PC**, outside the repo if you prefer.

## Step 1 — Extract backup locally
Using 7-Zip, extract the full `.tar.gz` to a local directory. Find the `mysql` folder and `studiose_w957.sql`. **Do not import this MySQL dump into Supabase Postgres directly.**

In PowerShell from your cloned repo:

```powershell
cd E:\studio-seraai-workspace\studioseraai
git pull origin main
python .\scripts\wordpress-catalog-extract.py "C:\YOUR-EXTRACTED-BACKUP\mysql\studiose_w957.sql" --out "C:\YOUR-WORK\wp-catalog.csv"
```

The script reads WordPress SQL and creates two private local files:
- `wp-catalog.csv`: WooCommerce product titles, descriptions, slugs, SKU, prices, taxonomies/categories, attributes, thumbnail/gallery attachment paths.
- `wp-catalog.report.json`: actual number of products and information-completeness counts.

This is a **read-only parser**, not an importer. Check the counts and inspect several example rows before proceeding.

## Step 2 — Export current Supabase artwork IDs read-only
In Supabase Dashboard → SQL Editor, run:

```sql
select id, data
from public.seraai_records
where kind = 'artwork'
order by id;
```

Export the result as `seraai-artworks.csv` to your **private PC**. The `data` column should be JSON. Do not commit this export.

## Step 3 — Generate matching review
```powershell
python .\scripts\wordpress-catalog-match.py "C:\YOUR-WORK\wp-catalog.csv" "C:\YOUR-WORK\seraai-artworks.csv" --out "C:\YOUR-WORK\v4-matching-report.csv"
```

Statuses:
- `candidate_exact_id`: WordPress product ID matches a legacy web ID, or SKU matches a legacy identifier. **Verify before applying.**
- `possible_title_match_review`: title-only evidence is **not** enough for automatic updates.
- `conflicting_ids_review`: ID collision; human resolution required.
- `unmatched_review`: potential new product, or a record with different identifiers.

**Important:** WordPress product IDs are not Supabase record IDs. The match tool never assumes they are equal.

## Step 4 — Merge only approved fields (next phase)
Once the match report is reviewed, introduce a private staging dataset and perform transactional updates. Preserve the existing artwork row ID, operational status, location, notes, sales and movements. Only add/refresh reviewed public catalog fields such as title/artist where justified, description, theme, style, subject, medium, categories and imported WordPress references. Keep a before/after report and a rollback path.

Media migration must separately map attachment IDs to files under `wp-content/uploads`, verify they exist, deduplicate, upload to managed storage, and link to the correct artwork. Do not place 1.5 GB of raw WordPress backups in GitHub, Next.js `public`, or exposed Supabase tables.

## Step 5 — Publish
SERAAI OS remains the editor, Supabase remains the single database, and the V4 Next.js public site reads approved publications through the existing `public-gallery` backend. GitHub tracks code changes; Vercel deploys code from `main`. Inventory edits should not require a Git push.

## Verified baseline on 2026-11-03
- `seraai_records`: 511 artwork records (includes archived/test data).
- `seraai_publications`: 499 rows marked published.
- `seraai_media`: 500 linked rows.
- Legacy inventory IDs: 508 artwork records.
- Nonempty web IDs: 443 artwork records.
- `style` key: 2 artwork records.
- `theme` key: 0 artwork records.

These are Supabase counts, **not** a guarantee of matching WordPress products. Verify the WordPress count from the extraction report.
