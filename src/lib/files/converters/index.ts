import { csvToXlsx } from './xlsx';
import { markdownToDocx } from './docx';
import { markdownToPdf } from './pdf';
import { type OfficeFormat, isOfficeFormat } from '../formats';

const REGISTRY: Record<OfficeFormat, (source: string) => Promise<Buffer>> = {
  xlsx: csvToXlsx,
  docx: markdownToDocx,
  pdf: markdownToPdf,
};

/** Convert source text into office-format bytes. Throws on unsupported format. */
export async function convert(format: string, source: string): Promise<Buffer> {
  if (!isOfficeFormat(format)) {
    throw new Error(`Unsupported office format: ${format}`);
  }
  return REGISTRY[format](source);
}
