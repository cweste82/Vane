import { describe, it, expect } from 'vitest';
import { csvToXlsx } from './xlsx';

const PK = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // ZIP magic (xlsx is a zip)

describe('csvToXlsx', () => {
  it('produces a non-empty xlsx (zip) buffer', async () => {
    const buf = await csvToXlsx('Name,Age\nAda,36\nGrace,40');
    expect(buf.length).toBeGreaterThan(100);
    expect(buf.subarray(0, 4)).toEqual(PK);
  });

  it('throws on empty input', async () => {
    await expect(csvToXlsx('   ')).rejects.toThrow();
  });
});
