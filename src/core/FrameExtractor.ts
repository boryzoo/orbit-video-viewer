import { DataStream, createFile, type Movie, type Sample, type VisualSampleEntry } from 'mp4box';

export type ExtractionMode = 'WebCodecs + MP4Box' | 'video fallback';

export interface ExtractionOptions {
  count: number;
  width: number;
  height: number;
  quality: number;
  signal?: AbortSignal;
  onProgress?: (progress: number, phase: string) => void;
}

export interface ExtractionResult {
  frames: Blob[];
  mode: ExtractionMode;
  sourceWidth: number;
  sourceHeight: number;
  duration: number;
}

function aborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Frame extraction aborted', 'AbortError');
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('The browser could not encode a JPEG frame.')),
    'image/jpeg', quality,
  ));
}

async function encodeSource(
  source: CanvasImageSource,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  quality: number,
): Promise<Blob> {
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, quality);
}

function avcDescription(entry: VisualSampleEntry): Uint8Array | undefined {
  const box = entry.avcC;
  if (!box) return undefined;
  const stream = new DataStream();
  box.write(stream as never);
  return new Uint8Array(stream.buffer).slice(8);
}

async function extractWithWebCodecs(file: Blob, options: ExtractionOptions): Promise<ExtractionResult | null> {
  if (!('VideoDecoder' in window) || !('EncodedVideoChunk' in window)) return null;
  const source = await file.arrayBuffer();
  aborted(options.signal);
  const mp4 = createFile();

  return new Promise<ExtractionResult | null>((resolve, reject) => {
    let settled = false;
    const finish = (value: ExtractionResult | null) => {
      if (!settled) { settled = true; resolve(value); }
    };
    mp4.onError = (_module, message) => {
      if (!settled) reject(new Error(`MP4 parsing failed: ${message}`));
    };
    mp4.onReady = (info: Movie) => {
      const track = info.videoTracks[0];
      if (!track || !track.video || !track.codec.startsWith('avc1')) { finish(null); return; }
      const videoInfo = track.video;
      mp4.setExtractionOptions(track.id, undefined, { nbSamples: track.nb_samples });
      mp4.onSamples = async (_id, _user, samples: Sample[]) => {
        const first = samples[0];
        const description = first ? avcDescription(first.description as VisualSampleEntry) : undefined;
        if (!first || !description) { finish(null); return; }
        const config: VideoDecoderConfig = {
          codec: track.codec,
          codedWidth: videoInfo.width,
          codedHeight: videoInfo.height,
          description,
        };
        const support = await VideoDecoder.isConfigSupported(config);
        if (!support.supported) { finish(null); return; }

        const canvas = document.createElement('canvas');
        canvas.width = options.width; canvas.height = options.height;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) { reject(new Error('Unable to create a Canvas 2D context.')); return; }
        const frames = new Array<Blob>(options.count);
        const jobs: Promise<void>[] = [];
        let encodeChain = Promise.resolve();
        const durationUs = (track.duration / track.timescale) * 1_000_000;
        let nextTarget = 0;
        let decoderFailed = false;

        const decoder = new VideoDecoder({
          output: (frame) => {
            const targetTime = ((nextTarget + 0.5) / options.count) * durationUs;
            if (nextTarget < options.count && frame.timestamp >= targetTime) {
              const target = nextTarget;
              nextTarget += 1;
              const bitmapPromise = createImageBitmap(frame);
              encodeChain = encodeChain.then(async () => {
                const bitmap = await bitmapPromise;
                frames[target] = await encodeSource(bitmap, canvas, context, options.quality);
                bitmap.close();
                options.onProgress?.((target + 1) / options.count, 'Extracting frames with WebCodecs');
              });
              jobs.push(encodeChain);
            }
            frame.close();
          },
          error: () => { decoderFailed = true; },
        });

        try {
          decoder.configure(config);
          for (const sample of samples) {
            aborted(options.signal);
            decoder.decode(new EncodedVideoChunk({
              type: sample.is_sync ? 'key' : 'delta',
              timestamp: Math.round((sample.cts / sample.timescale) * 1_000_000),
              duration: Math.round((sample.duration / sample.timescale) * 1_000_000),
              data: sample.data!,
            }));
            if (decoder.decodeQueueSize > 18) await new Promise((done) => setTimeout(done, 0));
          }
          await decoder.flush();
          await Promise.all(jobs);
          decoder.close();
          if (decoderFailed || frames.some((frame) => !frame)) { finish(null); return; }
          finish({
            frames,
            mode: 'WebCodecs + MP4Box',
            sourceWidth: videoInfo.width,
            sourceHeight: videoInfo.height,
            duration: track.duration / track.timescale,
          });
        } catch (error) {
          try { decoder.close(); } catch { /* already closed */ }
          if (error instanceof DOMException && error.name === 'AbortError') reject(error);
          else finish(null);
        }
      };
      mp4.start();
    };

    const buffer = source as ArrayBuffer & { fileStart: number };
    buffer.fileStart = 0;
    mp4.appendBuffer(buffer, true);
    mp4.flush();
  });
}

async function waitForEvent(target: HTMLVideoElement, event: 'loadedmetadata' | 'seeked'): Promise<void> {
  return new Promise((resolve, reject) => {
    const clean = () => { target.removeEventListener(event, success); target.removeEventListener('error', failure); };
    const success = () => { clean(); resolve(); };
    const failure = () => { clean(); reject(new Error('The browser could not decode this video.')); };
    target.addEventListener(event, success, { once: true });
    target.addEventListener('error', failure, { once: true });
  });
}

async function extractWithVideo(file: Blob, options: ExtractionOptions): Promise<ExtractionResult> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto'; video.src = url;
  try {
    await waitForEvent(video, 'loadedmetadata');
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('The video duration is invalid.');
    const canvas = document.createElement('canvas');
    canvas.width = options.width; canvas.height = options.height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Unable to create a Canvas 2D context.');
    const frames: Blob[] = [];
    for (let index = 0; index < options.count; index += 1) {
      aborted(options.signal);
      const target = Math.min(video.duration - 0.001, ((index + 0.5) / options.count) * video.duration);
      video.currentTime = target;
      await waitForEvent(video, 'seeked');
      frames.push(await encodeSource(video, canvas, context, options.quality));
      options.onProgress?.((index + 1) / options.count, 'Extracting frames with the video fallback');
    }
    return {
      frames,
      mode: 'video fallback',
      sourceWidth: video.videoWidth,
      sourceHeight: video.videoHeight,
      duration: video.duration,
    };
  } finally {
    video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url);
  }
}

export async function extractFrames(file: Blob, options: ExtractionOptions): Promise<ExtractionResult> {
  options.onProgress?.(0, 'Parsing MP4');
  const fast = await extractWithWebCodecs(file, options).catch((error) => {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    console.warn('WebCodecs fast path unavailable, using video fallback.', error);
    return null;
  });
  return fast ?? extractWithVideo(file, options);
}
