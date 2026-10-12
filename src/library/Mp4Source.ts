import { extractFrames, type ExtractionMode } from '../core/FrameExtractor';
import type { OrbitPrepareOptions, OrbitSource, PreparedOrbitSource } from '../core/FrameSource';

export type Mp4Input = Blob | string | URL;

class MemoryFrameSource implements PreparedOrbitSource {
  readonly frameCount: number;

  constructor(
    private frames: Blob[],
    readonly width: number,
    readonly height: number,
    readonly duration: number,
    readonly mode: ExtractionMode,
  ) {
    this.frameCount = frames.length;
  }

  async getFrame(index: number): Promise<Blob> {
    const frame = this.frames[index];
    if (!frame) throw new RangeError(`Frame ${index} is unavailable.`);
    return frame;
  }

  dispose(): void { this.frames = []; }
}

export class Mp4Source implements OrbitSource {
  constructor(private readonly input: Mp4Input) {}

  async prepare(options: OrbitPrepareOptions): Promise<PreparedOrbitSource> {
    const blob = this.input instanceof Blob ? this.input : await this.fetchBlob(this.input, options.signal);
    const result = await extractFrames(blob, options);
    return new MemoryFrameSource(
      result.frames,
      result.sourceWidth,
      result.sourceHeight,
      result.duration,
      result.mode,
    );
  }

  private async fetchBlob(input: string | URL, signal?: AbortSignal): Promise<Blob> {
    const response = await fetch(input, { signal });
    if (!response.ok) throw new Error(`Unable to load MP4: HTTP ${response.status}`);
    return response.blob();
  }
}

export function createMp4Source(input: Mp4Input): Mp4Source {
  return new Mp4Source(input);
}
