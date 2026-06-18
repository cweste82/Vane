'use client';

import React, { useMemo, useState } from 'react';
import { DownloadSimple, FileText, FileCsv, FilePdf, FileDoc, FileXls, CircleNotch } from '@phosphor-icons/react';
import { parseArtifact } from '@/lib/files/parseArtifact';
import { isOfficeFormat, MIME, type FileFormat } from '@/lib/files/formats';
import { sanitizeFilename } from '@/lib/files/filename';

const iconFor = (format: FileFormat) => {
  switch (format) {
    case 'csv': return FileCsv;
    case 'xlsx': return FileXls;
    case 'pdf': return FilePdf;
    case 'docx': return FileDoc;
    default: return FileText;
  }
};

const triggerDownload = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const ArtifactCard = ({ rawBody }: { rawBody: string }) => {
  const { filename, format, source } = useMemo(() => parseArtifact(rawBody), [rawBody]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const Icon = iconFor(format);
  const safeName = sanitizeFilename(filename);

  const handleDownload = async () => {
    setError(null);
    try {
      if (isOfficeFormat(format)) {
        setLoading(true);
        const res = await fetch('/api/files/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format, filename: safeName, source }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Generation failed (${res.status})`);
        }
        const blob = await res.blob();
        triggerDownload(safeName, blob);
      } else {
        const blob = new Blob([source], { type: MIME[format] || 'text/plain' });
        triggerDownload(safeName, blob);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-light-200 dark:border-dark-200 bg-light-secondary dark:bg-dark-secondary p-3">
      <div className="flex items-center gap-3">
        <Icon size={28} className="text-black/70 dark:text-white/70 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-black dark:text-white">{safeName}</div>
          <div className="text-xs uppercase text-black/50 dark:text-white/50">{format}</div>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-[#24A0ED] px-3 py-1.5 text-sm text-white disabled:opacity-60"
        >
          {loading ? <CircleNotch size={16} className="animate-spin" /> : <DownloadSimple size={16} />}
          {loading ? 'Generating…' : 'Download'}
        </button>
      </div>

      {error && <div className="mt-2 text-sm text-red-500">{error} <button onClick={handleDownload} className="underline">Retry</button></div>}

      <button
        onClick={() => setShowPreview((v) => !v)}
        className="mt-2 text-xs text-black/50 dark:text-white/50 hover:underline"
      >
        {showPreview ? 'Hide content' : 'Show content'}
      </button>
      {showPreview && (
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-light-primary dark:bg-dark-primary p-3 text-xs whitespace-pre-wrap break-words">
          {source}
        </pre>
      )}
    </div>
  );
};

export default ArtifactCard;
