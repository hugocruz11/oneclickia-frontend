"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { MetaGeoLocation } from "@/lib/types";

interface CityAutocompleteProps {
  selected: { key: string; name: string }[];
  onChange: (cities: { key: string; name: string }[]) => void;
}

export function CityAutocomplete({ selected, onChange }: CityAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MetaGeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get<{ cities: MetaGeoLocation[] }>(
          `/connections/meta/geo-search?q=${encodeURIComponent(query)}`,
        );
        setResults(res.cities);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

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

  function addCity(city: MetaGeoLocation) {
    if (!selected.find((s) => s.key === city.key)) {
      onChange([...selected, { key: city.key, name: city.name }]);
    }
    setQuery("");
    setOpen(false);
  }

  function removeCity(key: string) {
    onChange(selected.filter((s) => s.key !== key));
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-ink">
        Ciudades objetivo
      </label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((city) => (
            <span
              key={city.key}
              className="inline-flex items-center gap-1 rounded-sm border border-orange/20 bg-orange/10 px-2 py-0.5 text-xs font-medium text-orange"
            >
              {city.name}
              <button
                type="button"
                onClick={() => removeCity(city.key)}
                className="ml-0.5 text-orange/60 hover:text-orange"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          // Don't let Enter submit the whole campaign form — pick the first
          // result instead (a common cause of "I typed the city but it
          // created by country").
          if (e.key === "Enter") {
            e.preventDefault();
            if (results.length > 0) addCity(results[0]);
          }
        }}
        placeholder="Buscar ciudades..."
        className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
      />

      {loading && <p className="mt-1 text-xs text-muted">Buscando...</p>}

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-sand bg-cream shadow-sm">
          {results.map((city) => (
            <li key={city.key}>
              <button
                type="button"
                onClick={() => addCity(city)}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-ink hover:bg-sand-light"
              >
                {city.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-xs text-muted">
        Si eliges ciudades, la campaña se segmentará solo a esas ciudades (en
        lugar del país). Escribe al menos 2 caracteres.
      </p>
    </div>
  );
}
