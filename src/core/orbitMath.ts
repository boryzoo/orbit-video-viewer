export const FRAME_COUNT = 124;

export function frameIndex(turn: number, count = FRAME_COUNT): number {
  const phase = ((turn % 1) + 1) % 1;
  return Math.round(phase * count) % count;
}

export function pixelsPerTurn(width: number, sensitivity = 1): number {
  return Math.max(240, width * 1.2) / Math.max(0.1, sensitivity);
}

export function normalizedDegrees(turn: number): number {
  let degrees = (((turn % 1) + 1) % 1) * 360;
  if (degrees > 180) degrees -= 360;
  return degrees;
}

export function easeOutCubic(progress: number): number {
  const value = Math.max(0, Math.min(1, progress));
  return 1 - (1 - value) ** 3;
}
