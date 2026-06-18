import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { tokenizeMarkdown, type MarkdownToken } from '../markdown';

const HEADINGS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

// marked inline tokens -> docx TextRuns (bold/italic/code).
function inlineRuns(tokens: any[] | undefined, fallback: string): TextRun[] {
  if (!tokens || !tokens.length) return [new TextRun(fallback)];
  const runs: TextRun[] = [];
  for (const t of tokens) {
    if (t.type === 'strong') runs.push(new TextRun({ text: t.text, bold: true }));
    else if (t.type === 'em') runs.push(new TextRun({ text: t.text, italics: true }));
    else if (t.type === 'codespan') runs.push(new TextRun({ text: t.text, font: 'Courier New' }));
    else runs.push(new TextRun({ text: t.text ?? t.raw ?? '' }));
  }
  return runs.length ? runs : [new TextRun(fallback)];
}

function tableToDocx(tok: any): Table {
  const headerCells = (tok.header ?? []).map(
    (c: any) =>
      new TableCell({ children: [new Paragraph({ children: inlineRuns(c.tokens, c.text ?? '') })] }),
  );
  const rows: TableRow[] = [new TableRow({ children: headerCells })];
  for (const r of tok.rows ?? []) {
    rows.push(
      new TableRow({
        children: r.map(
          (c: any) =>
            new TableCell({
              children: [new Paragraph({ children: inlineRuns(c.tokens, c.text ?? '') })],
            }),
        ),
      }),
    );
  }
  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

/** Convert Markdown into a .docx Word document. */
export async function markdownToDocx(source: string): Promise<Buffer> {
  const tokens = tokenizeMarkdown(source);
  const children: (Paragraph | Table)[] = [];

  for (const tok of tokens as any[]) {
    switch (tok.type) {
      case 'heading':
        children.push(
          new Paragraph({
            heading: HEADINGS[Math.min((tok.depth ?? 1) - 1, 5)],
            children: inlineRuns(tok.tokens, tok.text ?? ''),
          }),
        );
        break;
      case 'paragraph':
        children.push(new Paragraph({ children: inlineRuns(tok.tokens, tok.text ?? '') }));
        break;
      case 'list':
        (tok.items ?? []).forEach((item: any, i: number) => {
          if (tok.ordered) {
            children.push(new Paragraph({ text: `${i + 1}. ${item.text}` }));
          } else {
            children.push(new Paragraph({ text: item.text, bullet: { level: 0 } }));
          }
        });
        break;
      case 'code':
        children.push(
          new Paragraph({ children: [new TextRun({ text: tok.text ?? '', font: 'Courier New' })] }),
        );
        break;
      case 'table':
        children.push(tableToDocx(tok));
        break;
      case 'space':
        break;
      default:
        if (tok.raw && tok.raw.trim()) children.push(new Paragraph(tok.raw.trim()));
    }
  }

  if (!children.length) children.push(new Paragraph(''));

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBuffer(doc);
}
