# SDK reference

## Install

Published package, after it becomes available:

```bash
pnpm add orbit-video-viewer
```

Local SDK repository:

```bash
pnpm --dir /absolute/path/to/orbit-video-viewer install
pnpm --dir /absolute/path/to/orbit-video-viewer build:library
pnpm add /absolute/path/to/orbit-video-viewer
```

Use the host project's package manager when it is not pnpm.

## Minimal integration

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

#viewer canvas { display: block; width: 100%; height: 100%; }
```

```ts
import { OrbitViewer, createMp4Source } from 'orbit-video-viewer';

const element = document.querySelector<HTMLElement>('#viewer');
if (!element) throw new Error('Missing orbit view container.');

const viewer = new OrbitViewer({
  element,
  initialAngle: 0,
  onProgress(progress) {
    console.log(`Loading ${Math.round(progress * 100)}%`);
  },
  onChange({ angle, frame }) {
    console.log(angle, frame);
  },
});

await viewer.load(createMp4Source('/assets/orbit.mp4'));
```

## Public controls

```ts
viewer.getAngle();
viewer.getState();
viewer.setAngle(180);
viewer.setAngle(180, { animate: true, duration: 500 });
viewer.rotateBy(30);
viewer.reset({ animate: true });
viewer.setInteractionEnabled(false);
viewer.destroy();
```

`createMp4Source()` accepts a URL, `File`, or `Blob`. Calling `load()` again replaces the current video and makes that video's configured `initialAngle` the reset target.

Useful constructor options: `initialAngle`, `cacheSize`, `sensitivity`, `inertia`, `resetDuration`, `prefetchFrames`, `onProgress`, and `onChange`.

Useful load options: `frameCount`, `width`, `height`, and `quality`.

## Source guidance

Prefer H.264 MP4 with one continuous horizontal orbit, stable subject scale and camera height, no cuts, and an ending close to the opening view when wraparound is desired. Audio is ignored. The SDK samples only viewpoints already present in the video.
