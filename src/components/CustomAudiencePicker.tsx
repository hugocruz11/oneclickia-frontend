"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { MetaCustomAudience } from "@/lib/types";

interface CustomAudiencePickerProps {
  adAccountId: string;
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function CustomAudiencePicker({
  adAccountId,
  selected,
  onChange,
}: CustomAudiencePickerProps) {
  const [audiences, setAudiences] = useState<MetaCustomAudience[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adAccountId) {
      setAudiences([]);
      return;
    }
    setLoading(true);
    setError("");
    api
      .get<{ audiences: MetaCustomAudience[] }>(
        `/connections/meta/ad-accounts/${adAccountId}/custom-audiences`,
      )
      .then((res) => setAudiences(res.audiences))
      .catch(() => setError("No se pudieron cargar los públicos."))
      .finally(() => setLoading(false));
  }, [adAccountId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const selectedAudiences = audiences.filter((a) => selected.includes(a.id));
  const available = audiences.filter((a) => a.operation_status?.code !== 471);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-ink">
        Públicos personalizados{" "}
        <span className="font-normal text-muted">(opcional)</span>
      </label>

      {selectedAudiences.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedAudiences.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 rounded-sm border border-orange/20 bg-orange/10 px-2 py-0.5 text-xs font-medium text-orange"
            >
              {a.name}
              <button
                type="button"
                onClick={() => toggle(a.id)}
                className="ml-0.5 text-orange/60 hover:text-orange"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!adAccountId || loading}
        className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-left text-sm text-ink hover:border-orange disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Cargando..."
          : audiences.length === 0
            ? "No hay públicos en esta cuenta"
            : selected.length === 0
              ? "Seleccionar públicos..."
              : `${selected.length} público${selected.length > 1 ? "s" : ""} seleccionado${selected.length > 1 ? "s" : ""}`}
      </button>

      {open && available.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-sand bg-cream shadow-sm">
          {available.map((a) => {
            const isSelected = selected.includes(a.id);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => toggle(a.id)}
                  className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-sand-light ${
                    isSelected ? "bg-sand-light" : ""
                  }`}
                >
                  <span className="flex-1">
                    <span className="block font-medium text-ink">{a.name}</span>
                    <span className="block text-xs text-muted">
                      {a.subtype}
                      {a.approximate_count_lower_bound
                        ? ` · ~${a.approximate_count_lower_bound.toLocaleString()}`
                        : ""}
                    </span>
                  </span>
                  {isSelected && (
                    <span className="text-orange">✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      <p className="mt-1 text-xs text-muted">
        ¿Necesitas crear uno?{" "}
        <Link href="/meta/audiences" className="text-orange hover:underline">
          Ir a Públicos
        </Link>
      </p>
    </div>
  );
}
