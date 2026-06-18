import { describe, it, expect } from 'vitest';
import { sanitizeFilename, enforceOfficeExtension } from './filename';

describe('sanitizeFilename', () => {
  it('strips path components', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('a/b/c.csv')).toBe('c.csv');
  });
  it('removes unsafe characters', () => {
    expect(sanitizeFilename('my file*?.csv')).toBe('my_file_.csv');
  });
  it('falls back to a default when empty', () => {
    expect(sanitizeFilename('')).toBe('file.txt');
    expect(sanitizeFilename('///')).toBe('file.txt');
  });
  it('caps very long names', () => {
    const long = 'a'.repeat(200) + '.csv';
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(110);
  });
});

describe('enforceOfficeExtension', () => {
  it('forces the office extension to match the format', () => {
    expect(enforceOfficeExtension('report.exe', 'pdf')).toBe('report.pdf');
    expect(enforceOfficeExtension('data', 'xlsx')).toBe('data.xlsx');
    expect(enforceOfficeExtension('doc.docx', 'docx')).toBe('doc.docx');
  });
});
