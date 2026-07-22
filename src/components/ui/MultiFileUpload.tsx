"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

interface MultiFileUploadProps {
  label?: string;
  accept?: string;
  error?: string;
  helperText?: string;
  max?: number;
  value: File[];
  onChange: (files: File[]) => void;
}

/**
 * Selector de hasta `max` imágenes. Muestra un preview por archivo con botón
 * para quitarlo y un tile para agregar mientras haya cupo.
 */
export function MultiFileUpload({
  label,
  accept = "image/png,image/jpeg,image/webp",
  error,
  helperText,
  max = 3,
  value,
  onChange,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      value.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) ?? "");
            reader.readAsDataURL(file);
          }),
      ),
    ).then((urls) => {
      if (!cancelled) setPreviews(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const next = [...value, ...incoming].slice(0, max);
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const canAdd = value.length < max;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-charcoal">{label}</label>
      )}

      <div className="grid grid-cols-3 gap-3">
        {value.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="relative aspect-square overflow-hidden rounded-md border border-sand bg-cream"
          >
            {previews[i] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previews[i]}
                alt={file.name}
                className="h-full w-full object-cover"
              />
            )}
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-orange px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Principal
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-ink/70 px-1.5 text-xs text-white hover:bg-error"
              aria-label="Quitar imagen"
            >
              ×
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            className={`flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed p-2 text-center transition-colors ${
              dragging
                ? "border-orange bg-orange/5"
                : error
                  ? "border-error"
                  : "border-sand hover:border-orange/50"
            }`}
          >
            <span className="text-2xl leading-none text-orange">+</span>
            <span className="mt-1 text-xs text-muted">Agregar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-sm text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-muted">
          {helperText} Máx. {max} · La primera es la principal.
        </p>
      )}
    </div>
  );
}
