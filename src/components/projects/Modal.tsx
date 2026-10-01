"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/contexts/I18nContext";

// Modal accesible simple (overlay + Escape). `wide` para el detalle de tarea.
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const t = useT();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full rounded-md border border-sand bg-cream shadow-xl ${
          wide ? "max-w-4xl" : "max-w-md"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sand px-5 py-3">
          <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Cerrar")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-sand-light hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export interface PromptField {
  kind: "text" | "number";
  label: string;
  required?: boolean;
  placeholder?: string;
}

// Diálogo para pedir un dato antes de una acción (motivo, comentario, horas).
export function PromptDialog({
  open,
  title,
  field,
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
}: {
  open: boolean;
  title: string;
  field: PromptField;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
  busy?: boolean;
}) {
  const t = useT();
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get("value") ?? "").trim();
          if (field.required && !value) return;
          onConfirm(value);
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
          {field.label}
          {field.kind === "number" ? (
            <input
              name="value"
              type="number"
              step="0.25"
              min="0.1"
              autoFocus
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none"
            />
          ) : (
            <textarea
              name="value"
              rows={3}
              autoFocus
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none"
            />
          )}
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-sand bg-sand-light px-3 py-1.5 text-sm font-semibold text-charcoal hover:bg-sand"
          >
            {t("Cancelar")}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-sm border border-orange bg-orange px-3 py-1.5 text-sm font-semibold text-cream hover:bg-orange-hover disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
