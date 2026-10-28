# Studio Seraai public gallery

## Routes and operation

The public gallery lives at `/`. The private inventory remains at `/os`; old `/?view=...` inventory links and `/visualizer` remain protected. The inventory header links to `/os/publishing`.

Public pages: `/collections`, `/artworks/[id]`, `/artists`, `/artists/[name]`, `/events`, `/events/[id]`, `/about`, `/contact`, `/privacy`.

In **SERAAI OS → Public gallery & inquiries**, find an artwork, check **Publish to gallery**, optionally feature it and write a public description, then save. Publishing is opt-in. Fictional samples, archived records, and records without photographs cannot appear publicly. Unpublishing removes access to the public image endpoint on the next request (previously downloaded copies cannot be revoked).

Artist names are derived from approved inventory. No fictional portraits or biographies are used. Authentic portraits and biographies remain an editorial follow-up. No events are seeded. The Events tab supports adding and publishing confirmed events in Karachi time.

The Inquiries tab shows the newest 200 requests. A submitted request is not a confirmed appointment. Requests are stored, not emailed; staff must review this inbox and contact visitors. Newsletter and payment features are intentionally absent because their services and business rules were not supplied.

## Data boundary

The original `art-vault` function, inventory records, and private storage bucket are unchanged. The additive `supabase/public-gallery.sql` creates publication metadata, events, inquiries, and a short-lived rate-limit table. All four tables have RLS enabled, no anonymous/authenticated table grants, and service-role access only.

The separate `public-gallery` Edge Function authenticates the existing backend token, then exposes allowlisted public DTOs. Vercel calls this function server-side. No service key or internal token is sent to the browser. Public image requests check publication, archive and sample state before reading the existing private object; images are not duplicated.

Anonymous clients cannot read inventory or inquiries directly. The admin endpoint requires the existing OS Basic authentication; all mutations verify same-origin requests. Inquiries use validation, a honeypot, bounded fields, consent, and an atomic limit of five submissions per hashed network identifier per hour. Expired limit rows are cleaned on the next inquiry attempt. Consider CAPTCHA or managed abuse protection if traffic warrants it.

## Configuration and deployment

Target: existing Vercel project `studioseraai` (`prj_MZg1EurPhIusEL2qlKVteNxY2WUW`), team `team_2kGgg4cjpDTK0u1J1aN9tw0j`.

Reuse `SERAAI_BACKEND_URL`, `SERAAI_BACKEND_TOKEN`, and `SERAAI_PASSWORD` in **both preview and production**. Do not expose any as `NEXT_PUBLIC_*` variables. The gallery service derives the new function URL from the existing backend origin. The Edge Function uses platform-managed Supabase secrets and the same backend authentication as `art-vault`. The source's `__TOKEN_HASH__` placeholder must be replaced through the secure deployment process if the existing deployment uses hash-based auth instead of `SERAAI_BACKEND_TOKEN` in its environment. Never commit raw credentials.

The additive database migration and authenticated `public-gallery` function were applied during implementation. No inventory items were published. These additions are inert for the existing OS deployment and need not be removed on rollback.

Run `npm run build:vercel`, `npm test`, and `npm run lint`. Local Next development is `npm run dev`; the retained Sites/Vinext workflow is `npm run dev:sites`. Do not run Vinext and Next generation in the same checkout concurrently because both generate `.next/types`.

Before release: deploy the feature branch to Vercel preview, confirm backend variables exist in that environment, test an inquiry end-to-end with clearly marked test data, and verify the private publishing page with the owner's normal OS login. Test on mobile and tablet. Only merge to main after the preview passes. Do not modify DNS or the WordPress domain.

## Validation and limitations

- Next.js production build and TypeScript: passed.
- Automated tests: 81 passed, including seven public-service boundary/validation tests.
- Full repository lint: zero errors; 16 image-element warnings remain. Images use native tags to retain the authenticated/no-store media boundary; do not enable a shared image cache without testing revocation behavior.
- Live database inspection: anonymous inventory/inquiry reads denied, four new tables have RLS, zero artworks published.
- Desktop production preview: hero rendered, menu opened, catalog navigation worked, and empty inquiry submission triggered required-field validation. Public form CSS conflicts were corrected. The development preview had a hydration issue not reproduced in the production preview.
- Local preview has no backend credentials, so it deliberately reports collection unavailability. Live inquiry delivery, admin publication, real artwork detail pages, and Vercel runtime integration require target-environment validation.
- Responsive layouts and reduced-motion fallback are implemented; mobile/tablet browser QA is outstanding.
- Hero uses approved raster artwork with scroll parallax, not a 3D model. The generated gallery interior is explicitly labeled a gallery concept.

Rollback: revert the feature commit or redeploy the previous Vercel production deployment. Preserve the additive tables to retain any submitted inquiries and publication choices.
