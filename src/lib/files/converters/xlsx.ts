import * as XLSX from 'xlsx';

/** Convert a CSV string into a real .xlsx workbook (single sheet). */
export async function csvToXlsx(source: string): Promise<Buffer> {
  const csv = (source ?? '').trim();
  if (!csv) throw new Error('Cannot build a spreadsheet from empty content');

  const workbook = XLSX.read(csv, { type: 'string' });
  if (!workbook.SheetNames.length) throw new Error('No rows parsed from CSV');

  const out = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(out as ArrayBuffer);
}
