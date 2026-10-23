# Art Visualizer · first integrated version

Open **Art Visualizer** in the existing sidebar, or `/visualizer`.
It uses the existing inventory data and authenticated `/api/media` photographs.
No schema, backend, authentication, environment variables or inventory writes were changed.

## Present a painting
1. Search title, artist or SS inventory identifier and select a photographed work.
2. Use the labelled illustrated demo room, or upload a JPG/PNG/WebP room (20 MB / 40 MP maximum).
3. Drag the painting, or use the position sliders. Size preserves the image's aspect ratio.
4. Set rotation, frame color and shadow. Download the 1600 × 1000 PNG.
Room photographs are letterboxed as needed to preserve their aspect ratio. Scale is approximate.

## Prepared replacement
Upload the original room and select **Replace existing painting**. Then upload a clean version with the old painting completely removed, using the same aspect ratio. Define a rectangular placement region and use **Fit to placement area** after choosing an artwork. Optional transparent foreground PNGs preserve objects in front. The new painting is never rendered or exported against an unprepared replacement room.

Room categories label the current scene; they are not a library of real room photographs. No original gallery mockup files were available in this checkout. The demo is an original canvas illustration. Client images remain local to the tab, not uploaded or saved. Leaving this module clears the composition.

## Validation
- `VERCEL=1 pnpm run build`: passed with the integrated `/visualizer` route and shared renderer.
- `pnpm exec tsc --noEmit`: passed.
- `node --experimental-strip-types --test tests/visualizer.test.mjs`: 5 passing renderer tests (aspect ratio, transform, frame/shadow, export guides, replacement safety/layer order).
- Targeted ESLint: no errors; authenticated thumbnail `<img>` has a Next image optimization warning.
- Repository lint has existing failures in the starter and original studio component.
- Interactive browser verification unavailable: no Chromium executable; browser download returned an invalid archive. Login, live Supabase image access, pointer interaction and actual PNG download still need browser acceptance checks on preview. Renderer tests are not a substitute for these checks.

## Deferred
Saved sessions and reusable template persistence; perspective warp; calibration; comparison; automatic artwork removal. No live records were changed.

## Preview acceptance
Existing login → inventory loads → open visualizer → choose actual painting → custom room upload → drag/resize/rotate → frame/shadow → PNG matches the editor without selection guides. Then check missing photos, invalid uploads, unprepared replacement blocking, clean-background replacement and existing inventory/photo vault navigation.

## Realistic rooms upgrade
Five bundled photorealistic generated interiors replace the illustrated fallback: living room, corridor, guest room, dining hall and office. Assets were generated using the built-in image-generation tool with frontal empty plaster walls, then optimized to WebP. They are illustrative interiors, not photographs of Studio Seraai or a specific client's property.

Each room includes a prepared alpha wall mask that excludes furniture, openings and major foreground objects. Wall presets and custom HEX colors apply a texture-preserving multiply tint within this mask; paint strength is adjustable. For custom uploads, define a rectangular wall region manually. This is an approximate visualization, not calibrated paint color matching or automatic wall segmentation. Arbitrary foreground objects inside a manually selected region are not automatically excluded.

Frames now support custom colors and adjustable thickness. PNG exports use the same wall/frame rendering as the editor. Resetting the wall color restores the original background. Room switches reset artwork placement to the room's suggested starting position and preserve selected wall/frame colors.

Validation for upgrade: 9 renderer tests pass, including custom frame geometry, wall clipping, tint layer ordering, and original-wall reset; image/mask dimensions and selected wall/furniture alpha samples pass for all five rooms. TypeScript and targeted lint pass (image optimization warnings remain). Browser interaction and actual download still require acceptance testing; no live inventory records were modified.
Local production-server checks also passed: `/visualizer` returns 401 without credentials and 200 with a temporary valid owner login. All five room photographs and five wall masks returned 200 with byte-for-byte matching SHA-256 hashes. This checks the local serving/authentication boundary; it does not replace a live browser acceptance test.
