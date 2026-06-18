import { marked, type Token } from 'marked';

export type MarkdownToken = Token;

/** Tokenize Markdown into a flat list of block tokens (headings, paragraphs, lists, code, tables, ...). */
export function tokenizeMarkdown(source: string): MarkdownToken[] {
  return marked.lexer(source ?? '');
}
