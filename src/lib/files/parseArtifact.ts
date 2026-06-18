import { inferFormatFromFilename, type FileFormat } from './formats';

export type ParsedArtifact = {
  filename: string;
  format: FileFormat;
  source: string;
};

const unquote = (v: string) => v.replace(/^["']|["']$/g, '').trim();

/**
 * Parse the BODY of a ```artifact fenced block (i.e. everything after the info
 * string, which markdown-to-jsx gives us as `node.text`). Lenient:
 * - a line that is exactly `---` (within the first 8 lines) separates header from body
 * - header lines look like `key: value`; only `filename`/`format` are used
 * - missing format is inferred from the filename extension
 * - no header/separator → the whole text is the source, with safe defaults
 */
export function parseArtifact(raw: string): ParsedArtifact {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');

  let sepIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    if (lines[i].trim() === '---') {
      sepIdx = i;
      break;
    }
  }

  const header: Record<string, string> = {};
  let bodyStart = 0;
  if (sepIdx >= 0) {
    for (const line of lines.slice(0, sepIdx)) {
      const m = /^([A-Za-z_]+)\s*:\s*(.+)$/.exec(line.trim());
      if (m) header[m[1].toLowerCase()] = unquote(m[2]);
    }
    bodyStart = sepIdx + 1;
  }

  const source = lines.slice(bodyStart).join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
  const filename = header['filename'] || 'file.txt';
  const format = (header['format']?.toLowerCase() as FileFormat) || inferFormatFromFilename(filename);

  return { filename, format, source };
}
