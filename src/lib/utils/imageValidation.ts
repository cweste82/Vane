const ALLOWED_MIME = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB decoded
const MAX_IMAGES = 4;

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/** Validate inline base64 data-URI images: mime allowlist, size, count. */
export function validateImages(images: string[]): ImageValidationResult {
  if (images.length > MAX_IMAGES) {
    return { ok: false, error: `At most ${MAX_IMAGES} images are allowed` };
  }

  for (const dataUri of images) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUri);
    if (!match) {
      return { ok: false, error: 'Each image must be a base64 data URI' };
    }
    const [, mime, payload] = match;
    if (!ALLOWED_MIME.includes(mime)) {
      return { ok: false, error: `Unsupported image type: ${mime}` };
    }
    const approxBytes = Math.floor((payload.length * 3) / 4);
    if (approxBytes > MAX_BYTES) {
      return { ok: false, error: 'Image exceeds the 5 MB limit' };
    }
  }

  return { ok: true };
}
