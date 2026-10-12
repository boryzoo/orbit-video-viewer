import { describe, expect, it } from 'vitest';
import { easeOutCubic, frameIndex, normalizedDegrees, pixelsPerTurn } from '../src/core/orbitMath';

describe('orbit math', () => {
  it('wraps turns in both directions', () => {
    expect(frameIndex(0)).toBe(0);
    expect(frameIndex(1)).toBe(0);
    expect(frameIndex(-1)).toBe(0);
    expect(frameIndex(0.5)).toBe(62);
    expect(frameIndex(-0.5)).toBe(62);
  });

  it('uses the reference drag sensitivity', () => {
    expect(pixelsPerTurn(100)).toBe(240);
    expect(pixelsPerTurn(500)).toBe(600);
    expect(pixelsPerTurn(500, 2)).toBe(300);
  });

  it('normalizes angles around the front view', () => {
    expect(normalizedDegrees(0)).toBe(0);
    expect(normalizedDegrees(0.75)).toBe(-90);
    expect(normalizedDegrees(-0.25)).toBe(-90);
  });

  it('clamps easing input', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
  });
});
