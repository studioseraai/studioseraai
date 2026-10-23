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
