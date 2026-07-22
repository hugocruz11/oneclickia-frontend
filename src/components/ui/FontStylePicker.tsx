"use client";

import { Input } from "@/components/ui/Input";

interface FontStyleFieldProps {
  value: string;
  onChange: (v: string) => void;
  /** true mientras se guarda la preferencia en la marca. */
  saving?: boolean;
  saved?: boolean;
}

/**
 * Campo de texto libre para la tipografía de la imagen. El usuario escribe
 * cualquier fuente o estilo (ej. "Montserrat", "Bebas Neue mayúsculas",
 * "serif elegante"). Se guarda a nivel de marca y se puede editar.
 */
export function FontStyleField({
  value,
  onChange,
  saving,
  saved,
}: FontStyleFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Input
        label="Tipografía"
        placeholder='Ej: "Montserrat", "Bebas Neue en mayúsculas", "una serif elegante"…'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted">
        Se aplica a todas tus imágenes y se guarda como tu preferencia. Déjalo
        vacío para que la IA elija.
        {saving && <span className="ml-1 text-orange">Guardando…</span>}
        {saved && !saving && (
          <span className="ml-1 text-green-600">Guardada ✓</span>
        )}
      </p>
    </div>
  );
}
