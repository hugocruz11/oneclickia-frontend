"use client";

import { Card } from "@/components/ui/Card";
import type { CopyVariant } from "@/lib/types";

interface CopyVariantPickerProps {
  variants: CopyVariant[];
  selected: number;
  onSelect: (index: number) => void;
}

export function CopyVariantPicker({
  variants,
  selected,
  onSelect,
}: CopyVariantPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      {variants.map((variant, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
            selected === i
              ? "border-orange bg-orange/5"
              : "border-sand hover:border-orange/30"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Variante {i + 1}
            </span>
            {selected === i && (
              <span className="text-xs font-semibold text-orange">
                Seleccionada
              </span>
            )}
          </div>

          <h4 className="mt-2 text-base font-semibold text-ink">
            {variant.headline}
          </h4>
          <p className="mt-1 text-sm text-charcoal">{variant.description}</p>

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
        </button>
      ))}
    </div>
  );
}
