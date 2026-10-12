import './style.css';
import { OrbitViewer, createMp4Source } from '../src/library';
import shotImageUrl from './assets/shot.png?url';
import impactImageUrl from './assets/impact.png?url';

const find = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const panel = find<HTMLElement>('#orbit-panel');
const canvas = find<HTMLCanvasElement>('#orbit-canvas');
const poster = find<HTMLImageElement>('#hero-poster');
const shotImage = find<HTMLImageElement>('#shot-image');
const impactImage = find<HTMLImageElement>('#impact-image');
const loadState = find<HTMLElement>('#load-state');
const loadLabel = find<HTMLElement>('#load-label');
const loadProgress = find<HTMLElement>('#load-progress');
const status = find<HTMLElement>('#status');
const demoCursor = find<HTMLElement>('#demo-cursor');

poster.src = '../demo/poster.png';
shotImage.src = shotImageUrl;
impactImage.src = impactImageUrl;

const viewer = new OrbitViewer({
  element: panel,
  canvas,
  cacheSize: 18,
  prefetchFrames: 5,
  sensitivity: 0.34,
  onProgress(progress) {
    const percent = Math.round(progress * 100);
    loadProgress.style.width = `${percent}%`;
    loadLabel.textContent = `Preparing scene · ${percent}%`;
  },
});

const captureMode = new URLSearchParams(window.location.search).has('capture');

const wait = (duration: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

async function moveDemoCursor(x: number, y: number, duration: number): Promise<void> {
  const animation = demoCursor.animate(
    { left: `${x}px`, top: `${y}px` },
    { duration, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' },
  );
  await animation.finished;
}

async function runCaptureDemo(): Promise<void> {
  const bounds = panel.getBoundingClientRect();
  const y = bounds.top + bounds.height * 0.49;
  const center = bounds.left + bounds.width * 0.51;

  demoCursor.style.left = `${bounds.left - 78}px`;
  demoCursor.style.top = `${y + 56}px`;
  demoCursor.classList.add('is-visible');

  await wait(550);
  await moveDemoCursor(center, y, 850);
  await wait(230);
  demoCursor.classList.add('is-hand');
  await wait(260);

  demoCursor.classList.add('is-grabbing');
  viewer.setAngle(132, { animate: true, duration: 1050 });
  await moveDemoCursor(bounds.left + bounds.width * 0.73, y, 1050);
  await wait(180);

  viewer.setAngle(298, { animate: true, duration: 1450 });
  await moveDemoCursor(bounds.left + bounds.width * 0.27, y, 1450);
  await wait(200);

  viewer.setAngle(40, { animate: true, duration: 1050 });
  await moveDemoCursor(center, y, 1050);
  demoCursor.classList.remove('is-grabbing');
  await wait(550);
  demoCursor.classList.remove('is-visible');
}

async function prepareScene(): Promise<void> {
  try {
    await viewer.load(createMp4Source('../demo/video_01.mp4'), {
      width: 852,
      height: 480,
      quality: 0.92,
    });

    panel.classList.remove('is-loading');
    panel.classList.add('is-ready');
    loadState.hidden = true;
    poster.hidden = true;
    status.textContent = 'Interactive panel ready. Drag horizontally to change the view.';

    if (captureMode) {
      viewer.setInteractionEnabled(false);
      void runCaptureDemo();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    console.error(error);
    panel.classList.remove('is-loading');
    panel.classList.add('has-error');
    loadLabel.textContent = 'Scene unavailable';
    status.textContent = error instanceof Error ? error.message : 'Unable to prepare the scene.';
  }
}

window.addEventListener('beforeunload', () => viewer.destroy());

void prepareScene();
