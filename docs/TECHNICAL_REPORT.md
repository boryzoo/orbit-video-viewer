# Orbit Video Viewer: turning an authored orbit video into a controllable view

## Summary

Orbit Video Viewer is a browser Library that maps user input to viewpoints sampled from a pre-generated orbit video. It creates an art-directed, 3D-like viewing interaction without shipping geometry, materials, lighting, or a 3D runtime.

Orbit Comic is the demonstration application. The open-source capability is the reusable Viewer API beneath it. The optional `integrate-orbit-video` Skill is a workflow layer that teaches compatible AI coding agents how to add the same SDK to an existing browser project; it is not a second engine.

## Input and processing

The current source adapter accepts an MP4 URL or a browser `Blob`. MP4Box reads the H.264 track and supplies encoded samples to WebCodecs. The decoder walks the timeline once and selects evenly spaced target timestamps. Each selected frame is resized and encoded to an in-memory JPEG blob.

When WebCodecs or the H.264 path is unavailable, an offscreen `<video>` element seeks to the same target positions and copies them through Canvas.

The current Demo requests 124 frames at up to 852 × 480 pixels. These are application choices, not protocol requirements.

## Runtime interaction

Horizontal pointer distance is converted into a continuous turn value. The turn wraps cyclically and maps to a frame index. The same mapping supports both directions and any number of complete rotations.

Recent pointer samples estimate release velocity. Exponential decay creates a short inertial glide. Reset and programmatic angle changes can use an eased animation.

The public Library exposes the current angle and frame, allowing a host product to attach labels, game events, sound, educational annotations, or other state to a viewpoint.

## Frame storage and memory

JPEG blobs hold the sampled sequence. Rendering uses decoded `ImageBitmap` objects. A least-recently-used cache retains a small number of bitmaps, while directional prefetch prepares nearby frames.

Destroying a Viewer aborts active work, removes input listeners, closes cached bitmaps, and releases the prepared source.

All extracted frames remain in the visitor's browser memory. The Library does not upload them.

## Architecture

The repository separates three responsibilities:

1. **Core:** angle math, motion, frame storage, rendering, and the general source contract.
2. **Library:** the stable `OrbitViewer` API and the current `Mp4Source` adapter.
3. **Demo:** Orbit Comic's artwork, layout, title, buttons, loading UI, and local-file control.

The Demo uses the public Library API instead of assembling Core classes directly. A separate consumer project installs the built package to verify that the Library boundary is real.

Distribution adds a fourth, non-runtime layer: the integration Skill. Its `SKILL.md` inspects a host project, installs the Library, follows that project's component lifecycle, and verifies the resulting build. Applications created with the Skill still import the public Library API and do not depend on the Demo.

## Runtime MP4 versus preprocessed frames

Runtime MP4 processing keeps authoring simple and enables local visitor uploads. Its trade-offs are startup decoding work, memory use, and browser codec differences.

A production deployment may eventually preprocess frames and load them from a manifest or CDN. The `OrbitSource` contract was added so that such a source can be introduced later without changing the Viewer API. This release deliberately does not include that preprocessing tool.

## Limits

The Library can only show viewpoints present in its source. It cannot move freely through 3D space, repair discontinuities, change geometry, calculate collisions, or relight a scene.

The verified fast path uses H.264 MP4. Browser fallbacks depend on codecs supported by each browser. Source continuity remains an authoring responsibility.

The current manual browser verification covers a Chromium-based browser. Other modern browsers are feature-detected but should not be described as fully verified until the same interaction matrix has been run there.

## Credits

The interaction direction was learned from a Claude Artifact shared by [monoradio (@monoradio102)](https://x.com/monoradio102). This repository is an independent implementation written with Codex and does not copy the reference Artifact's source code.
