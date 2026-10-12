---
name: integrate-orbit-video
description: Integrate a user's pre-rendered orbit MP4 into an existing web project as a drag-controlled view using orbit-video-viewer. Use when the user wants to add, replace, or wire an orbit video into a website, game UI, product page, interactive story, exhibit, or other browser experience without building a 3D scene.
license: MIT
---

# Integrate Orbit Video

Add the SDK to the user's existing product. Do not copy the Orbit Comic Demo page or rebuild the SDK internals.

Requires a browser-based project, Node.js 20 or newer, a supported JavaScript package manager, and access to the `orbit-video-viewer` package or repository.

## Inputs

Find or obtain:

- the host web project;
- the user's orbit MP4;
- the intended page or component.

Inspect the project before editing. Detect its framework, package manager, build command, styling conventions, and component lifecycle. Preserve its visual language and existing behavior. Ask the user only when the video or intended placement cannot be found and a safe inference is not possible.

Read [references/sdk-api.md](references/sdk-api.md) before implementation.

## Workflow

1. Confirm the host is a browser project and identify where the interactive view belongs.
2. Inspect the MP4 with available media tools when possible. Record its codec, dimensions, duration, and whether it appears to form a continuous orbit. Do not upload or alter the user's source unless requested.
3. Install `orbit-video-viewer` from the source available in the environment:
   - use the existing installed dependency when present;
   - use the published package when available;
   - during local SDK development, build the SDK and use a file dependency.
4. Add one viewer container and the minimum CSS required for sizing, pointer input, and Canvas display. Adapt these rules to the host project instead of replacing its page styles.
5. Create one `OrbitViewer`, then load the MP4 through `createMp4Source()`.
6. Connect loading and error feedback to the host product quietly. Add Reset only when it fits the product. Treat reset as returning to the current video's configured initial angle, never as restoring the Demo video.
7. Dispose the Viewer when the component or page is removed. If the user changes video, call `load()` on the same Viewer unless the host architecture makes replacement cleaner.
8. Run the host project's type check, tests, and production build. Fix integration errors without changing SDK internals.
9. When browser control is available, verify initial render, horizontal drag, both directions, reset or programmatic angle control, and the absence of console errors.

## Framework lifecycle

- Vanilla JavaScript: create after the container exists; call `destroy()` during page cleanup.
- React: create in an effect after the ref is mounted; return `viewer.destroy()` from the effect.
- Vue or Svelte: create in the mounted lifecycle; destroy in the matching unmount lifecycle.
- Server-rendered apps: import and instantiate only in browser code. The SDK requires DOM, Canvas, and browser media APIs.

## Product boundaries

- Keep labels, game events, hotspots, sounds, and product-specific state in the host application. Use `onChange` or `getAngle()` to connect them.
- Do not claim real 3D, arbitrary camera movement, relighting, collision, or unseen viewpoints.
- Do not add a preprocessing pipeline, backend upload, large framework, or unrelated UI unless the user explicitly requests it.
- Do not expose the Orbit Comic title, credits, buttons, or artwork in the host product unless the user specifically wants the Demo.

## Completion report

State plainly:

1. where the viewer was added;
2. which video is used;
3. how the user interacts with it;
4. which checks passed;
5. any real browser or codec limitation that remains.
