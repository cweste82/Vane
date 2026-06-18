import { describe, it, expect } from 'vitest';
import { markdownToPdf } from './pdf';

describe('markdownToPdf', () => {
  it('produces a non-empty PDF buffer starting with %PDF', async () => {
    const md = '# Report\n\nSome **content** here.\n\n- bullet one\n- bullet two';
    const buf = await markdownToPdf(md);
    expect(buf.length).toBeGreaterThan(200);
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF');
  });
});
