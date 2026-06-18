import { describe, it, expect } from 'vitest';
import { convert } from './index';

describe('convert', () => {
  it('routes xlsx', async () => {
    const buf = await convert('xlsx', 'A,B\n1,2');
    expect(buf.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  });
  it('routes pdf', async () => {
    const buf = await convert('pdf', '# Hi');
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF');
  });
  it('rejects an unsupported format', async () => {
    // @ts-expect-error testing runtime guard
    await expect(convert('csv', 'x')).rejects.toThrow();
  });
});
