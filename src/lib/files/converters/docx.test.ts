import { describe, it, expect } from 'vitest';
import { markdownToDocx } from './docx';

const PK = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

describe('markdownToDocx', () => {
  it('produces a non-empty docx (zip) buffer from markdown', async () => {
    const md = '# Title\n\nA **bold** and *italic* paragraph.\n\n- one\n- two\n\n| A | B |\n|---|---|\n| 1 | 2 |';
    const buf = await markdownToDocx(md);
    expect(buf.length).toBeGreaterThan(200);
    expect(buf.subarray(0, 4)).toEqual(PK);
  });

  it('handles empty/plain input without throwing', async () => {
    const buf = await markdownToDocx('just text');
    expect(buf.subarray(0, 4)).toEqual(PK);
  });
});
