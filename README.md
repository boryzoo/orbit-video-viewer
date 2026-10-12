<p align="right"><strong>English</strong> · <a href="README.zh-CN.md">简体中文</a></p>

<p align="center">
  <a href="https://huggingface.co/spaces/BreadStudio/orbit-video-viewer"><img src="docs/assets/orbit-comic-demo.gif" alt="A comic panel whose viewpoint changes as the user drags" width="720"></a>
</p>

<h1 align="center">Orbit Video Viewer</h1>

<p align="center"><strong>Turn an orbit video into a drag-controlled view on the web. No 3D model required.</strong></p>

<p align="center">
  <a href="https://huggingface.co/spaces/BreadStudio/orbit-video-viewer"><strong>Try the Live Demo</strong></a> ·
  <a href="#use-it-with-an-ai-coding-agent">Use the Skill</a> ·
  <a href="#use-the-sdk">Use the SDK</a>
</p>

Orbit Video Viewer is a small browser library for interactive product views, game items, characters, exhibits, comics, and other experiences that need controllable viewpoints.

## Live Demo

Open the public [Orbit Comic demo on Hugging Face Spaces](https://huggingface.co/spaces/BreadStudio/orbit-video-viewer), wait for the artwork to load, then drag horizontally across it.

Use **Change video** to try your own MP4. The selected file is processed inside your browser and is not uploaded by the app.

## How It Works

An orbit video already contains the viewpoints. The viewer maps horizontal dragging to positions in that video, extracts the required frames in the browser, and displays the current frame on a canvas. It does not reconstruct a 3D scene or invent angles that are missing from the source video.

For best results, use an H.264 MP4 with:

- one continuous horizontal orbit and no cuts;
- stable subject scale and camera height;
- an ending close to the opening view if seamless wraparound is desired.

Audio is ignored. No preprocessing tool is included in this release.

## What Can You Build?

<table>
  <tr>
    <td width="33%"><img src="docs/assets/concepts/product-viewer.jpg" alt="Concept for a drag-controlled product viewer"></td>
    <td width="33%"><img src="docs/assets/concepts/game-item-inspection.jpg" alt="Concept for inspecting a game item from different angles"></td>
    <td width="33%"><img src="docs/assets/concepts/interactive-comic.jpg" alt="Concept for exploring viewpoint changes in an interactive comic"></td>
  </tr>
  <tr>
    <td align="center"><strong>Product Viewer</strong></td>
    <td align="center"><strong>Game Item Inspection</strong></td>
    <td align="center"><strong>Interactive Comic</strong></td>
  </tr>
</table>

These images illustrate possible uses; they are not separate applications included in the repository.

## How to Use

### Use it with an AI coding agent

Give a compatible AI coding agent these three things:

1. your web project;
2. your orbit MP4;
3. [`skills/integrate-orbit-video/SKILL.md`](skills/integrate-orbit-video/SKILL.md).

Then ask:

```text
Use the integrate-orbit-video Skill to add my orbit MP4 to this project.
```

The Skill tells the agent how to integrate the library while preserving the host project's existing design. See the Skill file for its full workflow and requirements.

### Use the SDK

The npm package has not been published yet. Clone and build this repository, then install it as a local file dependency:

```bash
git clone https://github.com/boryzoo/orbit-video-viewer.git
cd orbit-video-viewer
pnpm install
pnpm build:library

# Run this in your own project:
pnpm add /absolute/path/to/orbit-video-viewer
```

Add a container:

```html
<div id="orbit-view" tabindex="0"></div>
```

Give it a size:

```css
#orbit-view {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
}

#orbit-view canvas { display: block; width: 100%; height: 100%; }
```

Load a video:

```ts
import { OrbitViewer, createMp4Source } from 'orbit-video-viewer';

const element = document.querySelector<HTMLElement>('#orbit-view');
if (!element) throw new Error('Missing orbit view.');

const viewer = new OrbitViewer({ element, initialAngle: 0 });
await viewer.load(createMp4Source('/assets/orbit.mp4'));
```

See the [integration guide](docs/INTEGRATION.md) and independent [`basic-integration`](examples/basic-integration) example for a complete setup.

## Public API

| API | Purpose |
|---|---|
| `createMp4Source(urlOrFile)` | Load an MP4 URL, `File`, or `Blob` |
| `load(source, options?)` | Prepare and display a source |
| `getAngle()` / `getState()` | Read the current view |
| `setAngle(degrees, options?)` | Move to an exact viewpoint |
| `rotateBy(degrees, options?)` | Move relative to the current viewpoint |
| `reset(options?)` | Return to the current video's initial angle |
| `setInteractionEnabled(boolean)` | Enable or disable user input |
| `destroy()` | Release resources and listeners |

## Run the Demo Locally

```bash
pnpm install
pnpm dev
```

Open the local address printed by Vite. Do not open `index.html` directly.

The current release has been manually validated in Chromium. See [browser compatibility](docs/COMPATIBILITY.md) for the current Safari and Firefox status.

## Documentation

- [简体中文 README](README.zh-CN.md)
- [Integration guide](docs/INTEGRATION.md)
- [Technical report](docs/TECHNICAL_REPORT.md)
- [Browser compatibility](docs/COMPATIBILITY.md)
- [Origin and attribution](docs/ORIGIN_AND_ATTRIBUTION.md)

## Attribution

The interaction was inspired by work shared by [monoradio (@monoradio102)](https://x.com/monoradio102). See [Origin and attribution](docs/ORIGIN_AND_ATTRIBUTION.md) for details.

## License

The library, demo source, and Skill are released under the [MIT License](LICENSE). Demo and README media have separate terms in [ASSETS.md](ASSETS.md). Third-party software is listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
