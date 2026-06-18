import { describe, it, expect } from 'vitest';
import {
  isOfficeFormat,
  inferFormatFromFilename,
  MIME,
  OFFICE_FORMATS,
} from './formats';

describe('formats', () => {
  it('marks office formats', () => {
    expect(isOfficeFormat('pdf')).toBe(true);
    expect(isOfficeFormat('docx')).toBe(true);
    expect(isOfficeFormat('xlsx')).toBe(true);
    expect(isOfficeFormat('csv')).toBe(false);
    expect(isOfficeFormat('md')).toBe(false);
  });

  it('infers format from filename extension', () => {
    expect(inferFormatFromFilename('a.csv')).toBe('csv');
    expect(inferFormatFromFilename('Report.DOCX')).toBe('docx');
    expect(inferFormatFromFilename('data.json')).toBe('json');
    expect(inferFormatFromFilename('script.py')).toBe('code');
    expect(inferFormatFromFilename('noext')).toBe('txt');
  });

  it('has a MIME type for every office format', () => {
    for (const f of OFFICE_FORMATS) expect(typeof MIME[f]).toBe('string');
  });
});
