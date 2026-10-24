# Multiple paintings on one wall

Art Visualizer supports up to 12 inventory paintings in one composition.

- Click an inventory artwork to add it; clicking an artwork already on the wall selects it.
- Select paintings directly on the canvas or with the keyboard-accessible On this wall list.
- Drag each painting or use its size, rotation and position controls. Frame color, width and shadow apply to the selected painting only.
- Arrange row lays out all loaded paintings with even gaps and equal image heights, preserving aspect ratios. Bring forward / Send backward controls overlap order.
- Changing the room preserves the composition. Removing a painting only changes this composition, never its inventory record.
- Download wall exports every painting, wall tint and foreground overlay without editing guides. Export waits for every photograph to load; failed photos have a retry action.
- Replacement mode still requires a prepared clean background. Arrange row uses a defined placement area when available.

Compositions are local to the open tab, not saved sessions. A painting may appear once per composition. Perspective adjustment is not included.

Validation: 37 unit/render/proxy tests, TypeScript check, lint (no errors; six existing warnings), Vercel production build, and isolated production smoke tests. Browser interaction with authenticated inventory still needs a signed-in session; a protected preview is not an end-to-end acceptance test.
