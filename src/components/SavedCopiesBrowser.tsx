"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import type { AdaptCopyResponse, SavedCopy } from "@/lib/types";

interface Props {
  /**
   * Direct-use mode: called after the backend materializes the saved copy
   * into an adaptation. Used when the flow doesn't need extra inputs
   * (e.g. the adapt-from-winning-ad flow).
   */
  onUse?: (result: AdaptCopyResponse) => void;
  /**
   * Pick mode: called with the raw saved copy so the parent can collect
   * additional inputs (product image, reference image) before calling
   * /use itself. If provided, overrides onUse.
   */
  onPick?: (saved: SavedCopy) => void;
  pickedId?: string | null;
}

export function SavedCopiesBrowser({ onUse, onPick, pickedId }: Props) {
  const [items, setItems] = useState<SavedCopy[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<SavedCopy[]>("/ads/saved-copies")
      .then(setItems)
      .catch(() => setError("No se pudieron cargar los copys guardados."))
      .finally(() => setLoading(false));
  }, []);

  async function handleUse(saved: SavedCopy) {
    if (onPick) {
      onPick(saved);
      return;
    }
    if (!onUse) return;
    setUsingId(saved.id);
    setError("");
    try {
      const res = await api.post<AdaptCopyResponse>(
        `/ads/saved-copies/${saved.id}/use`,
        new FormData(),
      );
      onUse(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No se pudo cargar el copy.");
    } finally {
      setUsingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este copy guardado?")) return;
    try {
      await api.delete(`/ads/saved-copies/${id}`);
      setItems((prev) => prev?.filter((s) => s.id !== id) ?? null);
    } catch {
      setError("No se pudo eliminar.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        Aún no has guardado ningún copy. Genera uno y presiona &quot;Guardar&quot;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-xs text-error">{error}</p>}
      {items.map((s) => {
        const isPicked = pickedId === s.id;
        return (
        <div
          key={s.id}
          className={`rounded-lg border-2 p-4 transition-colors ${
            isPicked
              ? "border-orange bg-orange/5"
              : "border-sand hover:border-orange/30"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {s.label ?? "Copy guardado"}
              {s.product?.name ? ` · ${s.product.name}` : ""}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleUse(s)}
                disabled={usingId === s.id}
                className="text-xs font-medium text-orange hover:opacity-90 disabled:opacity-60"
              >
                {usingId === s.id
                  ? "Cargando..."
                  : isPicked
                    ? "Seleccionado ✓"
                    : onPick
                      ? "Seleccionar"
                      : "Usar este"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="text-xs font-medium text-muted hover:text-error"
              >
                Eliminar
              </button>
            </div>
          </div>
          <h4 className="mt-2 text-base font-semibold text-ink">{s.headline}</h4>
          <p className="mt-1 text-sm text-charcoal">{s.description}</p>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-sm border border-orange/20 bg-orange/10 px-2 py-0.5 text-xs font-semibold text-orange">
              {s.ctaTitle}
            </span>
          </div>
        </div>
        );
      })}
    </div>
  );
}
