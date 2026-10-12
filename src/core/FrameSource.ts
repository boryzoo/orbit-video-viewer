export interface OrbitPrepareOptions {
  count: number;
  width: number;
  height: number;
  quality: number;
  signal?: AbortSignal;
  onProgress?: (progress: number, phase: string) => void;
}

export interface PreparedOrbitSource {
  readonly frameCount: number;
  readonly width: number;
  readonly height: number;
  readonly duration?: number;
  getFrame(index: number): Promise<Blob>;
  dispose(): void;
}

export interface OrbitSource {
  prepare(options: OrbitPrepareOptions): Promise<PreparedOrbitSource>;
}
