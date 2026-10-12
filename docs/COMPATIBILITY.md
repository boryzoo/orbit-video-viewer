# Browser compatibility

## What has been verified

- The Demo and independent integration project were exercised in a Chromium-based browser.
- The WebCodecs H.264 path loaded the bundled 852 × 480 MP4, supported dragging, angle controls, reset, and cleanup without console errors.
- The package build and TypeScript declarations were consumed by a separate Vite project.

## Runtime requirements

The Viewer needs JavaScript modules, Canvas, Pointer Events, `fetch`, `Blob`, and normal browser media support. The fast path also needs WebCodecs and H.264 decoding.

The code feature-detects the fast path and includes an offscreen `<video>` fallback. That fallback still depends on the browser being able to play the source codec.

## Honest support statement

Chromium with H.264 MP4 is the verified target for this release. Safari and Firefox are intended to use the feature-detected paths, but they have not yet completed the same manual browser matrix. Until that testing is done, they should be described as expected rather than guaranteed support.

The Skill does not change these runtime requirements. It integrates the same SDK into another browser project.
