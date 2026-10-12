import './style.css';
import { OrbitViewer, createMp4Source, type Mp4Input } from '../library';
import { FRAME_COUNT } from '../core/orbitMath';

const find = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const stage = find<HTMLElement>('#stage');
const canvas = find<HTMLCanvasElement>('#canvas');
const poster = find<HTMLImageElement>('#poster');
const input = find<HTMLInputElement>('#video-input');
const resetButton = find<HTMLButtonElement>('#reset');
const loading = find<HTMLElement>('#loading');
const phase = find<HTMLElement>('#phase');
const progress = find<HTMLElement>('#progress');
const progressLabel = find<HTMLElement>('#progress-label');
const dragHint = find<HTMLElement>('#drag-hint');
const status = find<HTMLElement>('#status');
const artworkTitle = find<HTMLElement>('#artwork-title');
const sourceLabel = find<HTMLElement>('#source-label');

let hasInteracted = false;

const viewer = new OrbitViewer({
  element: stage,
  canvas,
  cacheSize: 16,
  prefetchFrames: 4,
  onProgress: (value) => {
    const percent = Math.round(value * 100);
    progress.style.width = `${percent}%`;
    progressLabel.textContent = `${percent}%`;
  },
});

function targetDimensions(): { width: number; height: number } {
  const bounds = stage.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const sourceRatio = 852 / 480;
  let width = Math.max(2, Math.round(bounds.width * ratio));
  let height = Math.max(2, Math.round(width / sourceRatio));
  if (height > bounds.height * ratio) {
    height = Math.max(2, Math.round(bounds.height * ratio));
    width = Math.max(2, Math.round(height * sourceRatio));
  }
  return { width: Math.min(852, width), height: Math.min(480, height) };
}

type ArtworkIdentity = {
  title: string;
  source: string;
};

async function loadVideo(input: Mp4Input, label: string, identity: ArtworkIdentity): Promise<void> {
  resetButton.disabled = true;
  dragHint.hidden = true;
  dragHint.classList.remove('is-dismissed');
  loading.hidden = false;
  poster.hidden = false;
  stage.classList.add('is-loading');
  stage.classList.remove('is-ready', 'has-error');
  phase.textContent = 'Loading';
  progress.style.width = '0%';
  progressLabel.textContent = '0%';
  status.textContent = `Loading ${label}.`;
  artworkTitle.textContent = identity.title;
  sourceLabel.textContent = identity.source;
  sourceLabel.title = identity.source;

  try {
    const dimensions = targetDimensions();
    await viewer.load(createMp4Source(input), {
      frameCount: FRAME_COUNT,
      width: dimensions.width,
      height: dimensions.height,
      quality: 0.9,
    });
    stage.classList.remove('is-loading');
    stage.classList.add('is-ready');
    loading.hidden = true;
    poster.hidden = true;
    dragHint.hidden = hasInteracted;
    resetButton.disabled = false;
    status.textContent = 'Artwork ready.';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    console.error(error);
    stage.classList.remove('is-loading');
    stage.classList.add('has-error');
    phase.textContent = 'Unable to load video';
    progressLabel.textContent = 'Choose another file';
    status.textContent = error instanceof Error ? error.message : 'Unable to load video.';
  }
}

input.addEventListener('change', () => {
  const file = input.files?.[0];
  if (file) void loadVideo(file, file.name, { title: 'Untitled Orbit', source: file.name });
});

function dismissHint(): void {
  hasInteracted = true;
  dragHint.classList.add('is-dismissed');
  window.setTimeout(() => { dragHint.hidden = true; }, 280);
}

stage.addEventListener('pointerdown', dismissHint);
stage.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') dismissHint();
});
resetButton.addEventListener('click', () => viewer.reset());
window.addEventListener('beforeunload', () => viewer.destroy());

void loadVideo('./demo/video_01.mp4', 'artwork', { title: 'Desert Standoff', source: 'Panel 01' });
