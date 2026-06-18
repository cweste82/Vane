import { describe, it, expect } from 'vitest';
import { tokenizeMarkdown } from './markdown';

describe('tokenizeMarkdown', () => {
  it('returns typed tokens for headings and paragraphs', () => {
    const tokens = tokenizeMarkdown('# Title\n\nHello world');
    const types = tokens.map((t) => t.type);
    expect(types).toContain('heading');
    expect(types).toContain('paragraph');
  });
});
