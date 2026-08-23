"use client";

import { useEffect, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { useT } from "@/contexts/I18nContext";

interface FileUploadProps {
  label?: string;
  accept?: string;
  error?: string;
  helperText?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function FileUpload({
  label,
  accept = "image/png,image/jpeg,image/webp",
  error,
  helperText,
  value,
  onChange,
}: FileUploadProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Sync internal visual state with the controlled `value` prop so the
  // preview survives parent re-mounts (e.g., toggling between flows).
  useEffect(() => {
    if (value === undefined) return; // uncontrolled mode: ignore
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(null);
      setFileName(null);
      return;
    }
    setFileName(value.name);
    if (value.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  function handleFile(file: File | null) {
    if (!file) {
      setPreview(null);
      setFileName(null);
      onChange(null);
      return;
    }

    setFileName(file.name);
    onChange(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] || null);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleRemove() {
    handleFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-charcoal">{label}</label>
      )}

      {preview ? (
        <div className="relative flex items-center gap-4 rounded-md border border-sand bg-cream p-4">
          <img
            src={preview}
            alt="Preview"
            className="h-16 w-16 rounded-md border border-sand object-contain"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-ink">{fileName}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-muted hover:text-error transition-colors"
          >
            {t("Quitar")}
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors ${
            dragging
              ? "border-orange bg-orange/5"
              : error
                ? "border-error"
                : "border-sand hover:border-orange/50"
          }`}
        >
          <p className="text-sm text-muted">
            {t("Arrastra un archivo o")}{" "}
            <span className="font-medium text-orange">
              {t("haz clic para subir")}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {t("PNG, JPG o WEBP (max 5MB)")}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-sm text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-muted">{helperText}</p>
      )}
    </div>
  );
}
