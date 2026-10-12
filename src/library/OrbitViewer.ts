import type { OrbitSource } from '../core/FrameSource';
import { FrameStore } from '../core/FrameStore';
import {
  OrbitPanel,
  type OrbitDebugState,
  type SetAngleOptions,
} from '../core/OrbitPanel';
import { FRAME_COUNT, normalizedDegrees } from '../core/orbitMath';

export interface OrbitViewerState {
  angle: number;
  frame: number;
  frameCount: number;
  cacheSize: number;
  ready: boolean;
}

export interface OrbitViewerOptions {
  element: HTMLElement;
  canvas?: HTMLCanvasElement;
  initialAngle?: number;
  cacheSize?: number;
  sensitivity?: number;
  inertia?: boolean;
  resetDuration?: number;
  prefetchFrames?: number;
  onChange?: (state: OrbitViewerState) => void;
  onProgress?: (progress: number, phase: string) => void;
}

export interface OrbitLoadOptions {
  frameCount?: number;
  width?: number;
  height?: number;
  quality?: number;
}

export class OrbitViewer {
  readonly canvas: HTMLCanvasElement;
  private store: FrameStore;
  private panel: OrbitPanel | null = null;
  private aborter: AbortController | null = null;
  private readonly ownsCanvas: boolean;
  private destroyed = false;
  private loadingGeneration = 0;

  constructor(private readonly options: OrbitViewerOptions) {
    this.ownsCanvas = !options.canvas;
    this.canvas = options.canvas ?? document.createElement('canvas');
    if (this.ownsCanvas) options.element.append(this.canvas);
    this.store = new FrameStore(options.cacheSize ?? 16);
  }

  async load(source: OrbitSource, options: OrbitLoadOptions = {}): Promise<OrbitViewerState> {
    this.assertActive();
    const generation = ++this.loadingGeneration;
    this.aborter?.abort();
    this.aborter = new AbortController();
    this.panel?.dispose();
    this.panel = null;
    this.store.clear();
    this.store = new FrameStore(this.options.cacheSize ?? 16);

    const width = Math.max(2, Math.round((options.width ?? this.options.element.clientWidth) || 852));
    const height = Math.max(2, Math.round((options.height ?? this.options.element.clientHeight) || 480));
    const prepared = await source.prepare({
      count: options.frameCount ?? FRAME_COUNT,
      width,
      height,
      quality: options.quality ?? 0.9,
      signal: this.aborter.signal,
      onProgress: this.options.onProgress,
    });

    if (generation !== this.loadingGeneration || this.destroyed) {
      prepared.dispose();
      throw new DOMException('Orbit load superseded', 'AbortError');
    }

    this.store.setSource(prepared);
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.aspectRatio = `${width} / ${height}`;
    this.panel = new OrbitPanel(this.options.element, this.canvas, this.store, {
      initialAngle: this.options.initialAngle,
      sensitivity: this.options.sensitivity,
      inertia: this.options.inertia,
      resetDuration: this.options.resetDuration,
      prefetchFrames: this.options.prefetchFrames,
      onChange: (state) => this.options.onChange?.(this.publicState(state)),
    });
    await this.panel.start();
    return this.getState();
  }

  getAngle(): number {
    return this.panel?.getAngle() ?? normalizedDegrees((this.options.initialAngle ?? 0) / 360);
  }

  getState(): OrbitViewerState {
    const state = this.panel?.getState();
    return state ? this.publicState(state) : {
      angle: this.getAngle(),
      frame: 0,
      frameCount: this.store.count,
      cacheSize: this.store.cacheSize,
      ready: false,
    };
  }

  setAngle(angle: number, options?: SetAngleOptions): void {
    this.requirePanel().setAngle(angle, options);
  }

  rotateBy(degrees: number, options?: SetAngleOptions): void {
    this.requirePanel().rotateBy(degrees, options);
  }

  reset(options?: SetAngleOptions): void {
    this.requirePanel().reset(options);
  }

  setInteractionEnabled(enabled: boolean): void {
    this.requirePanel().setInteractionEnabled(enabled);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.loadingGeneration += 1;
    this.aborter?.abort();
    this.panel?.dispose();
    this.panel = null;
    this.store.clear();
    if (this.ownsCanvas) this.canvas.remove();
  }

  private publicState(state: OrbitDebugState): OrbitViewerState {
    return {
      angle: state.angle,
      frame: state.frame,
      frameCount: this.store.count,
      cacheSize: state.cacheSize,
      ready: true,
    };
  }

  private requirePanel(): OrbitPanel {
    this.assertActive();
    if (!this.panel) throw new Error('Load an orbit source before controlling the viewer.');
    return this.panel;
  }

  private assertActive(): void {
    if (this.destroyed) throw new Error('This OrbitViewer has been destroyed.');
  }
}
