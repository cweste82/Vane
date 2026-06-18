import { useState, useCallback } from 'react';

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX = 4;

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function useImageAttachments() {
  const [images, setImages] = useState<string[]>([]);

  const addFiles = useCallback(async (files: File[]) => {
    const usable = files.filter((f) => ACCEPT.includes(f.type));
    if (usable.length === 0) return;
    const uris = await Promise.all(usable.map(fileToDataUri));
    setImages((prev) => [...prev, ...uris].slice(0, MAX));
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => setImages([]), []);

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.items || [])
        .filter((i) => i.type.startsWith('image/'))
        .map((i) => i.getAsFile())
        .filter((f): f is File => !!f);
      if (files.length) {
        e.preventDefault();
        void addFiles(files);
      }
    },
    [addFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) void addFiles(files);
    },
    [addFiles],
  );

  return { images, addFiles, removeImage, clearImages, onPaste, onDrop };
}
