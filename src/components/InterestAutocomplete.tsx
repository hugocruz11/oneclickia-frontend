"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { MetaInterest } from "@/lib/types";

interface InterestAutocompleteProps {
  selected: { id: string; name: string }[];
  onChange: (interests: { id: string; name: string }[]) => void;
}

export function InterestAutocomplete({
  selected,
  onChange,
}: InterestAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MetaInterest[]>([]);
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
        const res = await api.get<{ interests: MetaInterest[] }>(
          `/connections/meta/targeting-search?q=${encodeURIComponent(query)}`,
        );
        setResults(res.interests);
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

  function addInterest(interest: MetaInterest) {
    if (!selected.find((s) => s.id === interest.id)) {
      onChange([...selected, { id: interest.id, name: interest.name }]);
    }
    setQuery("");
    setOpen(false);
  }

  function removeInterest(id: string) {
    onChange(selected.filter((s) => s.id !== id));
  }

  function formatAudience(size: number): string {
    if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)}M`;
    if (size >= 1_000) return `${(size / 1_000).toFixed(0)}K`;
    return String(size);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-ink">
        Intereses
      </label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((interest) => (
            <span
              key={interest.id}
              className="inline-flex items-center gap-1 rounded-sm border border-orange/20 bg-orange/10 px-2 py-0.5 text-xs font-medium text-orange"
            >
              {interest.name}
              <button
                type="button"
                onClick={() => removeInterest(interest.id)}
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
        placeholder="Buscar intereses..."
        className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
      />

      {loading && (
        <p className="mt-1 text-xs text-muted">Buscando...</p>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-sand bg-cream shadow-sm">
          {results.map((interest) => (
            <li key={interest.id}>
              <button
                type="button"
                onClick={() => addInterest(interest)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-sand-light"
              >
                <span>{interest.name}</span>
                <span className="text-xs text-muted">
                  {formatAudience(interest.audience_size)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-xs text-muted">
        Escribe al menos 2 caracteres para buscar.
      </p>
    </div>
  );
}
