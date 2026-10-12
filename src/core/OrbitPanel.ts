import { FrameStore } from './FrameStore';
import { easeOutCubic, frameIndex, normalizedDegrees, pixelsPerTurn } from './orbitMath';

export interface OrbitDebugState {
  frame: number;
  angle: number;
  turn: number;
  cacheSize: number;
}

export interface OrbitPanelOptions {
  initialAngle?: number;
  sensitivity?: number;
  inertia?: boolean;
  resetDuration?: number;
  prefetchFrames?: number;
  onChange?: (state: OrbitDebugState) => void;
}

export interface SetAngleOptions {
  animate?: boolean;
  duration?: number;
}

export class OrbitPanel {
  private readonly context: CanvasRenderingContext2D;
  private turn = 0;
  private velocity = 0;
  private dragging = false;
  private lastX = 0;
  private samples: Array<[number, number]> = [];
  private raf = 0;
  private lastTick = 0;
  private direction = 1;
  private lastIndex = -1;
  private wantIndex = 0;
  private angleAnimation: { from: number; to: number; started: number; duration: number } | null = null;
  private disposed = false;
  private interactionEnabled = true;
  private readonly initialTurn: number;
  private readonly sensitivity: number;
  private readonly inertia: boolean;
  private readonly resetDuration: number;
  private readonly prefetchFrames: number;
  private readonly onChange: (state: OrbitDebugState) => void;

  constructor(
    private readonly element: HTMLElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly store: FrameStore,
    options: OrbitPanelOptions = {},
  ) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Unable to create a Canvas 2D context.');
    this.context = context;
    this.initialTurn = (options.initialAngle ?? 0) / 360;
    this.turn = this.initialTurn;
    this.sensitivity = options.sensitivity ?? 1;
    this.inertia = options.inertia ?? true;
    this.resetDuration = options.resetDuration ?? 600;
    this.prefetchFrames = options.prefetchFrames ?? 4;
    this.onChange = options.onChange ?? (() => {});
    element.addEventListener('pointerdown', this.onPointerDown);
    element.addEventListener('pointermove', this.onPointerMove);
    element.addEventListener('pointerup', this.onPointerUp);
    element.addEventListener('pointercancel', this.onPointerUp);
    element.addEventListener('keydown', this.onKeyDown);
  }

  async start(): Promise<void> { await this.draw(true); }

  getAngle(): number { return normalizedDegrees(this.turn); }

  getState(): OrbitDebugState {
    return { frame: frameIndex(this.turn, this.store.count), angle: this.getAngle(), turn: this.turn, cacheSize: this.store.cacheSize };
  }

  setAngle(angle: number, options: SetAngleOptions = {}): void {
    if (!Number.isFinite(angle)) throw new TypeError('Angle must be a finite number.');
    this.velocity = 0;
    const targetBase = angle / 360;
    const target = this.turn + ((((targetBase - this.turn) + 0.5) % 1 + 1) % 1 - 0.5);
    if (options.animate) {
      this.angleAnimation = {
        from: this.turn,
        to: target,
        started: performance.now(),
        duration: Math.max(0, options.duration ?? this.resetDuration),
      };
      this.kick();
      return;
    }
    this.angleAnimation = null;
    this.turn = target;
    void this.draw(true);
  }

  rotateBy(degrees: number, options: SetAngleOptions = {}): void {
    this.setAngle(this.getAngle() + degrees, options);
  }

  reset(options: SetAngleOptions = { animate: true }): void {
    if (this.dragging) return;
    this.setAngle(this.initialTurn * 360, options);
  }

  setInteractionEnabled(enabled: boolean): void {
    this.interactionEnabled = enabled;
    if (!enabled) {
      this.dragging = false;
      this.velocity = 0;
      this.element.classList.remove('is-dragging');
    }
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.element.removeEventListener('pointermove', this.onPointerMove);
    this.element.removeEventListener('pointerup', this.onPointerUp);
    this.element.removeEventListener('pointercancel', this.onPointerUp);
    this.element.removeEventListener('keydown', this.onKeyDown);
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    if (!this.interactionEnabled || !this.store.count) return;
    this.angleAnimation = null;
    this.velocity = 0;
    this.dragging = true;
    this.lastX = event.clientX;
    this.samples = [[event.timeStamp, event.clientX]];
    this.element.setPointerCapture(event.pointerId);
    this.element.classList.add('is-dragging');
    this.kick();
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.dragging) return;
    const previous = this.turn;
    this.turn += (event.clientX - this.lastX) / pixelsPerTurn(this.element.getBoundingClientRect().width, this.sensitivity);
    this.direction = this.turn >= previous ? 1 : -1;
    this.lastX = event.clientX;
    this.samples.push([event.timeStamp, event.clientX]);
    this.samples = this.samples.filter(([time]) => event.timeStamp - time < 90);
    this.kick();
  };

  private readonly onPointerUp = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.element.classList.remove('is-dragging');
    const first = this.samples[0];
    const last = this.samples.at(-1);
    if (first && last && first !== last) {
      const seconds = (last[0] - first[0]) / 1000;
      if (seconds > 0.02) {
        const velocity = ((last[1] - first[1]) / seconds) / pixelsPerTurn(this.element.getBoundingClientRect().width, this.sensitivity);
        this.velocity = this.inertia ? Math.max(-0.9, Math.min(0.9, velocity)) : 0;
      }
    }
    this.kick();
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.interactionEnabled || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    const previous = this.turn;
    this.turn += event.key === 'ArrowRight' ? 1 / this.store.count : -1 / this.store.count;
    this.direction = this.turn >= previous ? 1 : -1;
    void this.draw();
  };

  private kick(): void {
    if (!this.raf && !this.disposed) {
      this.lastTick = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private readonly tick = (now: number) => {
    const delta = Math.min(0.05, (now - this.lastTick) / 1000);
    this.lastTick = now;
    this.raf = 0;
    const before = this.turn;
    if (this.angleAnimation) {
      const progress = this.angleAnimation.duration === 0 ? 1 : Math.min(1, (now - this.angleAnimation.started) / this.angleAnimation.duration);
      this.turn = this.angleAnimation.from + (this.angleAnimation.to - this.angleAnimation.from) * easeOutCubic(progress);
      if (progress >= 1) { this.turn = this.angleAnimation.to; this.angleAnimation = null; }
    } else if (!this.dragging) {
      if (Math.abs(this.velocity) > 0.0005) {
        this.turn += this.velocity * delta;
        this.velocity *= Math.exp(-3.2 * delta);
      } else this.velocity = 0;
    }
    if (this.turn !== before) this.direction = this.turn > before ? 1 : -1;
    void this.draw();
    if (this.dragging || this.velocity || this.angleAnimation) this.raf = requestAnimationFrame(this.tick);
  };

  private async draw(force = false): Promise<void> {
    const index = frameIndex(this.turn, this.store.count);
    this.wantIndex = index;
    this.store.prefetch(index, this.direction, this.prefetchFrames);
    if (force || index !== this.lastIndex) {
      const bitmap = this.store.peek(index) ?? await this.store.get(index);
      if (bitmap && this.wantIndex === index && !this.disposed) {
        this.context.drawImage(bitmap, 0, 0, this.canvas.width, this.canvas.height);
        this.lastIndex = index;
      }
    }
    this.onChange({ frame: index, angle: normalizedDegrees(this.turn), turn: this.turn, cacheSize: this.store.cacheSize });
  }
}
