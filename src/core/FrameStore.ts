import type { PreparedOrbitSource } from './FrameSource';

export class FrameStore {
  private source: PreparedOrbitSource | null = null;
  private readonly bitmaps = new Map<number, ImageBitmap>();
  private readonly pending = new Map<number, Promise<ImageBitmap | null>>();
  private generation = 0;

  constructor(private readonly cacheLimit = 16) {}

  setSource(source: PreparedOrbitSource): void {
    this.clear();
    this.source = source;
  }

  get count(): number { return this.source?.frameCount ?? 0; }
  get cacheSize(): number { return this.bitmaps.size; }

  peek(index: number): ImageBitmap | undefined {
    const bitmap = this.bitmaps.get(index);
    if (!bitmap) return undefined;
    this.bitmaps.delete(index);
    this.bitmaps.set(index, bitmap);
    return bitmap;
  }

  async get(index: number): Promise<ImageBitmap | null> {
    const cached = this.peek(index);
    if (cached) return cached;
    const active = this.pending.get(index);
    if (active) return active;
    const source = this.source;
    if (!source || index < 0 || index >= source.frameCount) return null;
    const token = this.generation;
    const task = source.getFrame(index).then((blob) => createImageBitmap(blob)).then((bitmap) => {
      if (token !== this.generation) {
        bitmap.close();
        return null;
      }
      this.bitmaps.set(index, bitmap);
      while (this.bitmaps.size > this.cacheLimit) {
        const oldest = this.bitmaps.keys().next().value as number;
        this.bitmaps.get(oldest)?.close();
        this.bitmaps.delete(oldest);
      }
      return bitmap;
    }).finally(() => this.pending.delete(index));
    this.pending.set(index, task);
    return task;
  }

  prefetch(index: number, direction: number, count = 4): void {
    if (!this.source?.frameCount) return;
    for (let step = 1; step <= count; step += 1) {
      const next = ((index + step * direction) % this.source.frameCount + this.source.frameCount) % this.source.frameCount;
      void this.get(next);
    }
  }

  clear(): void {
    this.generation += 1;
    this.bitmaps.forEach((bitmap) => bitmap.close());
    this.bitmaps.clear();
    this.pending.clear();
    this.source?.dispose();
    this.source = null;
  }
}
