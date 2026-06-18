import { z } from 'zod';
import { convert } from '@/lib/files/converters';
import { enforceOfficeExtension } from '@/lib/files/filename';
import { MIME, isOfficeFormat, OFFICE_FORMATS, type OfficeFormat } from '@/lib/files/formats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SOURCE = 1_000_000; // 1 MB

const bodySchema = z.object({
  format: z.string(),
  filename: z.string().min(1),
  source: z.string().min(1),
});

export const POST = async (req: Request): Promise<Response> => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { format, filename, source } = parsed.data;

  if (!isOfficeFormat(format)) {
    return Response.json(
      { error: `Unsupported format. Allowed: ${OFFICE_FORMATS.join(', ')}` },
      { status: 400 },
    );
  }
  if (source.length > MAX_SOURCE) {
    return Response.json({ error: 'Source content too large (max 1 MB)' }, { status: 413 });
  }

  const safeName = enforceOfficeExtension(filename, format as OfficeFormat);

  try {
    const bytes = await convert(format, source);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': MIME[format as OfficeFormat],
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return Response.json(
      { error: `Failed to generate file: ${err instanceof Error ? err.message : String(err)}` },
      { status: 422 },
    );
  }
};
