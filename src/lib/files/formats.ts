export const OFFICE_FORMATS = ['pdf', 'docx', 'xlsx'] as const;
export const TEXT_FORMATS = ['md', 'txt', 'csv', 'json', 'code'] as const;

export type OfficeFormat = (typeof OFFICE_FORMATS)[number];
export type FileFormat = OfficeFormat | (typeof TEXT_FORMATS)[number];

export const MIME: Record<FileFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  md: 'text/markdown',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  code: 'text/plain',
};

// File extension produced for office formats (used to force the download name).
export const OFFICE_EXT: Record<OfficeFormat, string> = {
  pdf: 'pdf',
  docx: 'docx',
  xlsx: 'xlsx',
};

const EXT_TO_FORMAT: Record<string, FileFormat> = {
  pdf: 'pdf',
  docx: 'docx',
  xlsx: 'xlsx',
  md: 'md',
  markdown: 'md',
  txt: 'txt',
  text: 'txt',
  csv: 'csv',
  json: 'json',
};

export function isOfficeFormat(format: string): format is OfficeFormat {
  return (OFFICE_FORMATS as readonly string[]).includes(format);
}

/** Infer a format from a filename's extension; unknown extensions → 'code', no extension → 'txt'. */
export function inferFormatFromFilename(filename: string): FileFormat {
  const dot = filename.lastIndexOf('.');
  if (dot === -1 || dot === filename.length - 1) return 'txt';
  const ext = filename.slice(dot + 1).toLowerCase();
  return EXT_TO_FORMAT[ext] ?? 'code';
}
