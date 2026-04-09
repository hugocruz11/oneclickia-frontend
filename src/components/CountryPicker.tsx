"use client";

import { useState } from "react";

const COUNTRIES = [
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "EC", name: "Ecuador" },
  { code: "US", name: "Estados Unidos" },
  { code: "ES", name: "España" },
  { code: "BR", name: "Brasil" },
  { code: "VE", name: "Venezuela" },
  { code: "PA", name: "Panamá" },
  { code: "CR", name: "Costa Rica" },
  { code: "GT", name: "Guatemala" },
  { code: "DO", name: "República Dominicana" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "HN", name: "Honduras" },
  { code: "SV", name: "El Salvador" },
  { code: "NI", name: "Nicaragua" },
];

interface CountryPickerProps {
  selected: string[];
  onChange: (countries: string[]) => void;
}

export function CountryPicker({ selected, onChange }: CountryPickerProps) {
  const [open, setOpen] = useState(false);

  function toggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">
        Países objetivo
      </label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((code) => {
            const country = COUNTRIES.find((c) => c.code === code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 rounded-sm border border-sand bg-sand-light px-2 py-0.5 text-xs font-medium text-ink"
              >
                {country?.name || code}
                <button
                  type="button"
                  onClick={() => toggle(code)}
                  className="ml-0.5 text-muted hover:text-ink"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-left text-sm text-muted hover:border-orange/50 focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
      >
        {selected.length === 0
          ? "Seleccionar países..."
          : `${selected.length} país${selected.length > 1 ? "es" : ""} seleccionado${selected.length > 1 ? "s" : ""}`}
      </button>

      {open && (
        <div className="mt-1 max-h-48 overflow-auto rounded-md border border-sand bg-cream">
          {COUNTRIES.map((country) => (
            <label
              key={country.code}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-ink hover:bg-sand-light"
            >
              <input
                type="checkbox"
                checked={selected.includes(country.code)}
                onChange={() => toggle(country.code)}
                className="accent-orange"
              />
              {country.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
