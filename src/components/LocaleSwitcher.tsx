"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { Icon } from "@/components/ui/Icon";

// Selector de idioma. `compact` muestra solo el icono (barra superior);
// sin él muestra también el nombre del idioma (páginas públicas y auth,
// donde hay más espacio y conviene que se vea).
export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next !== locale) setLocale(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("Cambiar idioma")}
        title={t("Cambiar idioma")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-9 items-center justify-center gap-1.5 rounded-md border border-sand text-charcoal transition-colors hover:bg-sand-light ${
          compact ? "w-9" : "px-3 text-sm font-medium"
        }`}
      >
        <Icon name="globe" size={18} />
        {!compact && <span>{LOCALE_LABELS[locale]}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-sand bg-cream py-1 shadow-lg"
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === locale}
              onClick={() => choose(code)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-sand-light ${
                code === locale ? "font-semibold text-ink" : "text-charcoal"
              }`}
            >
              {LOCALE_LABELS[code]}
              {code === locale && (
                <Icon name="check" size={16} className="text-cyan-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
