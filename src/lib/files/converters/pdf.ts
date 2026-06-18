import { jsPDF } from 'jspdf';
import { tokenizeMarkdown } from '../markdown';

// Strip inline markdown markers for plain-text rendering in the PDF.
const stripInline = (s: string) =>
  (s ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1');

/** Convert Markdown into a simple, paginated PDF (headings, paragraphs, lists, code, basic tables). */
export async function markdownToPdf(source: string): Promise<Buffer> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 50;
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (text: string, size: number, font: 'helvetica' | 'courier', style: 'normal' | 'bold') => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text || ' ', maxW);
    for (const line of lines) {
      ensure(size * 1.25);
      doc.text(line, margin, y);
      y += size * 1.25;
    }
  };

  for (const tok of tokenizeMarkdown(source) as any[]) {
    switch (tok.type) {
      case 'heading':
        y += 6;
        write(stripInline(tok.text ?? ''), 20 - Math.min((tok.depth ?? 1) - 1, 4) * 2, 'helvetica', 'bold');
        y += 2;
        break;
      case 'paragraph':
        write(stripInline(tok.text ?? ''), 12, 'helvetica', 'normal');
        y += 4;
        break;
      case 'list':
        (tok.items ?? []).forEach((item: any, i: number) =>
          write(`${tok.ordered ? `${i + 1}.` : '•'} ${stripInline(item.text)}`, 12, 'helvetica', 'normal'),
        );
        y += 4;
        break;
      case 'code':
        write(tok.text ?? '', 10, 'courier', 'normal');
        y += 4;
        break;
      case 'table': {
        const header = (tok.header ?? []).map((c: any) => c.text).join('  |  ');
        write(header, 11, 'helvetica', 'bold');
        for (const r of tok.rows ?? []) write(r.map((c: any) => c.text).join('  |  '), 11, 'helvetica', 'normal');
        y += 4;
        break;
      }
      case 'space':
        y += 6;
        break;
      default:
        if (tok.raw && tok.raw.trim()) write(stripInline(tok.raw.trim()), 12, 'helvetica', 'normal');
    }
  }

  const ab = doc.output('arraybuffer');
  return Buffer.from(ab);
}
