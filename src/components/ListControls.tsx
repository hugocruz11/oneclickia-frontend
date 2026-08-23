"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/contexts/I18nContext";

export type StatusValue = "all" | "active" | "paused";

/* ─────────────────────────── Rango de fechas ─────────────────────── */

export type DateRange =
  | { kind: "preset"; preset: string }
  | { kind: "custom"; since: string; until: string };

// Preset por defecto (coincide con lo que mostraba Meta por defecto).
export const DEFAULT_RANGE: DateRange = { kind: "preset", preset: "last_30d" };

// `label` es el texto en español y a la vez su clave de traducción.
const DATE_PRESETS: { value: string; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "last_7d", label: "Últimos 7 días" },
  { value: "last_14d", label: "Últimos 14 días" },
  { value: "last_30d", label: "Últimos 30 días" },
  { value: "this_month", label: "Este mes" },
  { value: "last_month", label: "Mes pasado" },
  { value: "maximum", label: "Máximo" },
];

/** Convierte el rango a query string para la API (sin el "?"). */
export function rangeToQueryParams(range: DateRange): string {
  const p = new URLSearchParams();
  if (range.kind === "preset") {
    p.set("datePreset", range.preset);
  } else {
    p.set("since", range.since);
    p.set("until", range.until);
  }
  return p.toString();
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Selector de rango: dropdown de presets + opción "Personalizado" que
 * revela dos inputs de fecha (since/until).
 */
export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const t = useT();
  const isCustom = value.kind === "custom";
  const [since, setSince] = useState(isCustom ? value.since : "");
  const [until, setUntil] = useState(isCustom ? value.until : "");

  const inputCls =
    "rounded-lg border border-sand bg-cream px-2 py-1.5 text-sm text-ink focus:border-orange focus:outline-none";

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === "custom") {
      const u = until || isoDay(new Date());
      const s = since || isoDay(new Date(Date.now() - 29 * 86400000));
      setSince(s);
      setUntil(u);
      onChange({ kind: "custom", since: s, until: u });
    } else {
      onChange({ kind: "preset", preset: v });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={isCustom ? "custom" : value.preset}
        onChange={handlePresetChange}
        className={inputCls}
      >
        {DATE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {t(p.label)}
          </option>
        ))}
        <option value="custom">{t("Personalizado…")}</option>
      </select>

      {isCustom && (
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={since}
            max={until || undefined}
            onChange={(e) => {
              setSince(e.target.value);
              if (e.target.value && until) {
                onChange({ kind: "custom", since: e.target.value, until });
              }
            }}
            className={inputCls}
          />
          <span className="text-sm text-muted">{t("a")}</span>
          <input
            type="date"
            value={until}
            min={since || undefined}
            onChange={(e) => {
              setUntil(e.target.value);
              if (since && e.target.value) {
                onChange({ kind: "custom", since, until: e.target.value });
              }
            }}
            className={inputCls}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Pills para filtrar por estado. `counts` es opcional; si se pasa,
 * muestra el número de elementos en cada grupo.
 */
export function StatusFilter({
  value,
  onChange,
  counts,
}: {
  value: StatusValue;
  onChange: (v: StatusValue) => void;
  counts?: Record<StatusValue, number>;
}) {
  const t = useT();
  const options: { value: StatusValue; label: string }[] = [
    { value: "active", label: t("Activas") },
    { value: "paused", label: t("Pausadas") },
    { value: "all", label: t("Todas") },
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const isActive = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-orange bg-orange text-cream"
                : "border-sand bg-cream text-charcoal hover:bg-sand-light"
            }`}
          >
            {o.label}
            {counts ? ` (${counts[o.value]})` : ""}
          </button>
        );
      })}
    </div>
  );
}

/** Input de búsqueda controlado. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const t = useT();
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? t("Buscar…")}
      className="w-full rounded-lg border border-sand bg-cream px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none sm:w-64"
    />
  );
}

/**
 * Paginado simple (página 0-indexed). No renderiza nada si no hay
 * elementos. El padre calcula totalItems sobre la lista ya filtrada.
 */
export function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const t = useT();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;
  const from = page * pageSize + 1;
  const to = Math.min(totalItems, (page + 1) * pageSize);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-muted">
        {t("{from}–{to} de {total}", { from, to, total: totalItems })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          {t("← Anterior")}
        </Button>
        <span className="text-muted">
          {t("Página {page} de {total}", {
            page: page + 1,
            total: totalPages,
          })}
        </span>
        <Button
          size="sm"
          variant="ghost"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          {t("Siguiente →")}
        </Button>
      </div>
    </div>
  );
}
