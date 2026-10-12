import { OrbitViewer, createMp4Source } from 'orbit-video-viewer';
import './style.css';

const element = document.querySelector<HTMLElement>('#viewer');
const angleOutput = document.querySelector<HTMLOutputElement>('#angle');

if (!element || !angleOutput) throw new Error('Integration test markup is incomplete.');

const viewer = new OrbitViewer({
  element,
  initialAngle: 0,
  onProgress(progress) {
    angleOutput.value = `Loading ${Math.round(progress * 100)}%`;
  },
  onChange(state) {
    angleOutput.value = `${state.angle.toFixed(0)}° · frame ${state.frame}`;
  },
});

await viewer.load(createMp4Source('/demo/video_01.mp4'), {
  width: 852,
  height: 480,
});

document.querySelectorAll<HTMLButtonElement>('[data-angle]').forEach((button) => {
  button.addEventListener('click', () => {
    viewer.setAngle(Number(button.dataset.angle), { animate: true });
  });
});

document.querySelector<HTMLButtonElement>('#reset')?.addEventListener('click', () => {
  viewer.reset({ animate: true });
});

window.addEventListener('beforeunload', () => viewer.destroy());
