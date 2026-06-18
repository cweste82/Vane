import { describe, it, expect } from 'vitest';
import { POST } from './route';

const call = (body: unknown) =>
  POST(
    new Request('http://localhost/api/files/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

describe('POST /api/files/generate', () => {
  it('generates an xlsx with the right headers and magic bytes', async () => {
    const res = await call({ format: 'xlsx', filename: 'data.xlsx', source: 'A,B\n1,2' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('spreadsheetml');
    expect(res.headers.get('content-disposition')).toContain('data.xlsx');
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  });

  it('rejects a non-office format with 400', async () => {
    const res = await call({ format: 'csv', filename: 'x.csv', source: 'a' });
    expect(res.status).toBe(400);
  });

  it('rejects an oversized source with 413', async () => {
    const res = await call({ format: 'pdf', filename: 'big.pdf', source: 'a'.repeat(1_000_001) });
    expect(res.status).toBe(413);
  });

  it('forces the office extension to match the format', async () => {
    const res = await call({ format: 'pdf', filename: 'report.exe', source: '# Hi' });
    expect(res.headers.get('content-disposition')).toContain('report.pdf');
  });
});
