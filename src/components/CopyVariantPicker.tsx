"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CopyVariant, SavedCopy } from "@/lib/types";

interface CopyVariantPickerProps {
  adaptationId: string;
  variants: CopyVariant[];
  selected: number;
  onSelect: (index: number) => void;
  onVariantsChange: (variants: CopyVariant[]) => void;
  productId?: string | null;
}

export function CopyVariantPicker({
  adaptationId,
  variants,
  selected,
  onSelect,
  onVariantsChange,
  productId,
}: CopyVariantPickerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<CopyVariant | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMap, setSavedMap] = useState<Map<number, string>>(new Map());
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<SavedCopy[]>("/ads/saved-copies")
      .then((list) => {
        if (cancelled) return;
        const next = new Map<number, string>();
        variants.forEach((v, i) => {
          const match = list.find(
            (s) =>
              s.headline === v.headline &&
              s.description === v.description &&
              s.ctaTitle === v.ctaTitle,
          );
          if (match) next.set(i, match.id);
        });
        setSavedMap(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [variants]);

  function startEdit(i: number) {
    setEditingIndex(i);
    setDraft({ ...variants[i] });
    setError("");
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraft(null);
    setError("");
  }

  async function saveEdit() {
    if (editingIndex === null || !draft) return;
    setSaving(true);
    setError("");
    try {
      const res = await api.patch<{ variants: CopyVariant[] }>(
        `/ads/adaptations/${adaptationId}/variants/${editingIndex}`,
        {
          headline: draft.headline,
          description: draft.description,
          ctaTitle: draft.ctaTitle,
        },
      );
      onVariantsChange(res.variants);
      setEditingIndex(null);
      setDraft(null);
    } catch {
      setError("No se pudo guardar la edición.");
    } finally {
      setSaving(false);
    }
  }

  async function saveToLibrary(i: number) {
    const v = variants[i];
    setSavingIndex(i);
    try {
      const created = await api.post<{ id: string }>("/ads/saved-copies", {
        headline: v.headline,
        description: v.description,
        ctaTitle: v.ctaTitle,
        rationale: v.rationale,
        sourceAdaptationId: adaptationId,
        productId: productId ?? undefined,
      });
      setSavedMap((prev) => {
        const next = new Map(prev);
        next.set(i, created.id);
        return next;
      });
    } catch {
      setError("No se pudo guardar el copy.");
    } finally {
      setSavingIndex(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.map((variant, i) => {
        const isEditing = editingIndex === i;
        const isSelected = selected === i;
        const isSaved = savedMap.has(i);

        return (
          <div
            key={i}
            className={`w-full rounded-lg border-2 p-4 transition-colors ${
              isSelected
                ? "border-orange bg-orange/5"
                : "border-sand hover:border-orange/30"
            }`}
            onClick={() => {
              if (!isEditing) onSelect(i);
            }}
            role={isEditing ? undefined : "button"}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Variante {i + 1}
              </span>
              <div className="flex items-center gap-3">
                {isSelected && !isEditing && (
                  <span className="text-xs font-semibold text-orange">
                    Seleccionada
                  </span>
                )}
                {!isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSaved) saveToLibrary(i);
                      }}
                      disabled={isSaved || savingIndex === i}
                      className={`text-xs font-medium transition-colors disabled:opacity-60 ${
                        isSaved
                          ? "text-orange"
                          : "text-muted hover:text-orange"
                      }`}
                    >
                      {savingIndex === i
                        ? "Guardando..."
                        : isSaved
                          ? "Guardado ✓"
                          : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(i);
                      }}
                      className="text-xs font-medium text-muted hover:text-orange transition-colors"
                    >
                      Editar
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing && draft ? (
              <div
                className="mt-3 flex flex-col gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <label className="text-xs font-medium uppercase text-muted">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={draft.headline}
                    onChange={(e) =>
                      setDraft({ ...draft, headline: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-sand bg-cream px-3 py-2 text-ink focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-muted">
                    Descripción
                  </label>
                  <textarea
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                    rows={3}
                    className="mt-1 w-full resize-none rounded-md border border-sand bg-cream px-3 py-2 text-ink focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-muted">
                    CTA
                  </label>
                  <input
                    type="text"
                    value={draft.ctaTitle}
                    onChange={(e) =>
                      setDraft({ ...draft, ctaTitle: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-sand bg-cream px-3 py-2 text-ink focus:border-orange focus:outline-none"
                  />
                </div>
                {error && <p className="text-xs text-error">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={saving}
                    className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-md border border-sand px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="mt-2 text-base font-semibold text-ink">
                  {variant.headline}
                </h4>
                <p className="mt-1 text-sm text-charcoal">
                  {variant.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-sm border border-orange/20 bg-orange/10 px-2 py-0.5 text-xs font-semibold text-orange">
                    {variant.ctaTitle}
                  </span>
                </div>

                {variant.rationale && (
                  <p className="mt-2 text-xs italic text-muted">
                    {variant.rationale}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
      {error && editingIndex === null && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}
