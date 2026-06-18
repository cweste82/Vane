import { describe, it, expect } from 'vitest';
import { validateImages } from './imageValidation';

// 4 base64 chars == 3 bytes; build a string of N base64 chars.
const b64 = (chars: number) => 'A'.repeat(chars);
const uri = (mime: string, chars = 8) => `data:${mime};base64,${b64(chars)}`;

describe('validateImages', () => {
  it('accepts an empty list', () => {
    expect(validateImages([])).toEqual({ ok: true });
  });

  it('accepts a valid png data URI', () => {
    expect(validateImages([uri('image/png')])).toEqual({ ok: true });
  });

  it('rejects more than 4 images', () => {
    const imgs = Array.from({ length: 5 }, () => uri('image/png'));
    expect(validateImages(imgs).ok).toBe(false);
  });

  it('rejects a non-data-URI string', () => {
    expect(validateImages(['https://example.com/x.png']).ok).toBe(false);
  });

  it('rejects an unsupported mime type', () => {
    expect(validateImages([uri('image/svg+xml')]).ok).toBe(false);
  });

  it('rejects an image larger than 5 MB', () => {
    // > 5 MB decoded -> need > 5*1024*1024 bytes -> > ~6.99M base64 chars
    const big = uri('image/png', 7_000_000);
    expect(validateImages([big]).ok).toBe(false);
  });
});
