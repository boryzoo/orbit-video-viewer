# Library integration guide

Orbit Comic is the Demo. External projects should use the `orbit-video-viewer` Library instead of copying the Demo page or its internal files.

## Build the local package

The first release is not yet published to npm:

```bash
pnpm install
pnpm build:library
```

In another project, add a local file dependency:

```json
{
  "dependencies": {
    "orbit-video-viewer": "file:../path/to/orbit-video-viewer"
  }
}
```

Run that project's normal package installation after the Library has been built.

## Minimal example

```html
<div id="viewer" tabindex="0"></div>
```

```css
#viewer {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

#viewer canvas { width: 100%; height: 100%; display: block; }
```

```ts
import { OrbitViewer, createMp4Source } from 'orbit-video-viewer';

const element = document.querySelector<HTMLElement>('#viewer')!;

const viewer = new OrbitViewer({
  element,
  initialAngle: 0,
  onProgress(progress) {
    console.log(`Loading ${Math.round(progress * 100)}%`);
  },
  onChange(state) {
    console.log(`${state.angle.toFixed(0)}°`, state.frame);
  },
});

await viewer.load(createMp4Source('/assets/orbit.mp4'), {
  frameCount: 124,
  width: 852,
  height: 480,
  quality: 0.9,
});

viewer.setAngle(90, { animate: true });
viewer.rotateBy(-45);
viewer.reset({ animate: true });

window.addEventListener('beforeunload', () => viewer.destroy());
```

`OrbitViewer` creates a Canvas inside the supplied element when a Canvas is not provided. An existing Canvas can be passed with the `canvas` option.

## Loading a visitor's file

```ts
const file = fileInput.files?.[0];
if (file) await viewer.load(createMp4Source(file));
```

The file stays in that browser session and is not uploaded by the Library.

## Connecting product behavior

Use `onChange` to connect viewpoint changes to the surrounding product:

```ts
const viewer = new OrbitViewer({
  element,
  onChange({ angle }) {
    if (angle >= 80 && angle <= 100) showDetails('left-side');
    else hideDetails();
  },
});
```

This can drive product labels, game events, sounds, subtitles, or educational annotations. Those features remain in the host product rather than the Library.

## Controls

```ts
viewer.getAngle();
viewer.getState();
viewer.setAngle(180);
viewer.setAngle(180, { animate: true, duration: 500 });
viewer.rotateBy(30);
viewer.reset();
viewer.setInteractionEnabled(false);
viewer.destroy();
```

## Independent example

[`examples/basic-integration`](../examples/basic-integration) is a separate Vite project with its own `package.json`. It installs the built Library through a file dependency rather than importing `src/` directly.

It verifies:

- package exports and TypeScript declarations;
- MP4 loading from a normal consumer application;
- automatic Canvas creation;
- drag interaction;
- `setAngle()` for front, side, and back views;
- angle/frame reporting;
- `reset()` and `destroy()`.

Run it with:

```bash
pnpm --dir examples/basic-integration install
pnpm --dir examples/basic-integration dev
```

Or run the repeatable build check from the repository root:

```bash
pnpm test:integration
```

## Future source types

The public `OrbitSource` interface separates the Viewer from MP4 decoding. A future source may load preprocessed image frames, but no preprocessing command or manifest loader is implemented in this release.
