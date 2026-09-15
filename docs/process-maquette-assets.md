# Process maquette

Approved concept: `exec-c8b838e6-39f3-4443-89ce-47494985e9cc.png`.
Created with the built-in Imagegen tool, not Fal or Flow. The original concept
and generated PNG masters remain in the Codex generated-images directory.

## Production assets

All paths are relative to `public/images/v2/how/`:

- `maquette-base-finished.webp`: 1983 × 793 opaque desktop plate, with
  completed roofs at the design and installation stations.
- `maquette-panel.webp`: 500 × 500 RGBA roof-panel sprite.
- `maquette-truck.webp`: 640 × 360 RGBA delivery-truck sprite.
- `maquette-boom.webp`: 640 × 427 RGBA crane-arm and suspended-panel sprite.
- `process-journey-mobile-finished.webp`: 1122 × 1402 opaque portrait
  composition for screens up to 700px. It is rendered uncropped at its native
  aspect ratio and uses completed roofs at both building stages.

PNG sources were resized/encoded with Sharp, quality 90, alpha quality 100.
No raster warping or runtime inpainting is used. The previous panorama is kept
on disk as a recoverable design alternative but is no longer rendered.

## Generation prompt set

1. Static plate, editing the approved concept: preserve camera, panoramic
   composition, architectural models, ivory layered terrain, navy inset ribbon,
   trees, pallets and forklift. Remove all text/logos, the delivery truck and
   uppermost floating solar roof array. Reconstruct ivory ground. Use an opaque
   pale cool white background.
2. Truck extraction from the approved concept: isolate one white box truck,
   cab toward lower-left, cargo box extending upper-right. Match the miniature
   camera and materials; genuine transparent alpha, no terrain, trees, forklift,
   text or logos.
3. Panel extraction from the approved concept: isolate the uppermost navy
   photovoltaic array over the second station, preserve its oblique roof plane,
   white aluminum frame and cell grid. No rafters, house, terrain, text or shadow;
   genuine transparent alpha.
4. Final static-plate edit: remove only the installation crane boom above the
   cab and its suspended panel. Keep the wheeled vehicle, exposed roof rafters,
   installed array and all other composition unchanged.
5. Boom extraction: isolate the navy articulated arm and its small suspended
   solar panel. Preserve connected rigid segments, base pivot at lower-left,
   rising elbow and rightward lifting head. No vehicle, house, background or
   text; genuine transparent alpha.
6. Finished-roof desktop edit: preserve the exact panorama and replace exposed
   timber framing at the design and installation stations with completed dark
   roofs. The installation array remains on the finished roof so the scene
   communicates panel fitting rather than roof construction.

## Rendering and motion

`ProcessScene.tsx` uses an inline SVG with the source coordinate system.
The viewBox removes only empty top/bottom margins, not architectural content.
Panel alignment is an artwork-specific affine transform; do not reuse its
matrix with a replacement asset. The crane uses a nested local coordinate
system so rotation stays anchored to its stationary cab.

Three CSS animations share a 14-second timeline with separate motion windows
and holds. The panel lowers, the truck makes a short delivery movement, and
the crane arm lifts its panel. These are rigid 2D layers, not an articulated
3D simulation. No video, WebGL, or new dependency is required.

Pause/play, document visibility, intersection visibility and reduced-motion
are supported. Without JS, the full scene renders in its static rest pose.
Below 700px, the horizontal scene is replaced with the selected portrait S
composition as true responsive art direction. The image uses `width: 100%` and
`height: auto`, so it is scaled directly without `object-fit` cropping. HTML
markers identify each stop while the full descriptions remain in the semantic
list below. A solid cyan SVG line follows the baked navy route while a single
cyan-white light point travels over it from start to finish. Its continuous
motion uses linear timing and stops when paused, offscreen or reduced motion
is set.
