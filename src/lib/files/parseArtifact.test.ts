import { describe, it, expect } from 'vitest';
import { parseArtifact } from './parseArtifact';

describe('parseArtifact', () => {
  it('parses a well-formed block', () => {
    const body = 'filename: top.csv\nformat: csv\n---\nA,B\n1,2';
    expect(parseArtifact(body)).toEqual({
      filename: 'top.csv',
      format: 'csv',
      source: 'A,B\n1,2',
    });
  });

  it('infers format from filename when format is missing', () => {
    const body = 'filename: notes.md\n---\n# Hello';
    const r = parseArtifact(body);
    expect(r.format).toBe('md');
    expect(r.source).toBe('# Hello');
  });

  it('strips surrounding quotes on header values', () => {
    const body = 'filename: "my file.json"\n---\n{}';
    expect(parseArtifact(body).filename).toBe('my file.json');
  });

  it('falls back to defaults when there is no header/separator', () => {
    const body = 'just some text';
    expect(parseArtifact(body)).toEqual({
      filename: 'file.txt',
      format: 'txt',
      source: 'just some text',
    });
  });
});
