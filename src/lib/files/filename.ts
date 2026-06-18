import { OFFICE_EXT, type OfficeFormat } from './formats';

/** Make a filename safe: drop any path, allow only [A-Za-z0-9._-], collapse repeats, cap length. */
export function sanitizeFilename(name: string): string {
  const base = (name ?? '').split(/[\\/]/).pop() ?? '';
  let safe = base
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._]+/, '')
    .slice(0, 100);
  if (!safe || safe === '.' ) safe = 'file.txt';
  return safe;
}

/** Ensure the filename ends with the correct extension for an office format. */
export function enforceOfficeExtension(name: string, format: OfficeFormat): string {
  const ext = OFFICE_EXT[format];
  const base = sanitizeFilename(name).replace(/\.[^.]*$/, '');
  const clean = base || 'file';
  return `${clean}.${ext}`;
}
