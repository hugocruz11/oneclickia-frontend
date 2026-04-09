"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AdCard } from "@/components/AdCard";
import { api, ApiError } from "@/lib/api";
import type { CachedAd, AdsSearchResponse } from "@/lib/types";

const STORAGE_KEY = "ads_search_state";

interface SearchState {
  query: string;
  order: string;
  limit: number;
  ads: CachedAd[];
  nextCursor: string | null;
}

function saveSearch(state: SearchState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSearch(): SearchState | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export default function AdsSearchPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("longest_running");
  const [limit, setLimit] = useState(6);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [ads, setAds] = useState<CachedAd[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Restore previous search on mount
  useEffect(() => {
    const saved = loadSearch();
    if (saved && saved.ads.length > 0) {
      setQuery(saved.query);
      setOrder(saved.order);
      setLimit(saved.limit);
      setAds(saved.ads);
      setNextCursor(saved.nextCursor);
      setSearched(true);
    }
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setError("");
    setLoading(true);
    setAds([]);
    setNextCursor(null);
    setSearched(true);

    try {
      const res = await api.post<AdsSearchResponse>("/ads/search", {
        query: query.trim(),
        order,
        limit,
      });
      setAds(res.ads);
      setNextCursor(res.nextCursor);
      saveSearch({
        query: query.trim(),
        order,
        limit,
        ads: res.ads,
        nextCursor: res.nextCursor,
      });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al buscar ads.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (!nextCursor) return;

    setLoadingMore(true);
    try {
      const res = await api.post<AdsSearchResponse>("/ads/search", {
        query: query.trim(),
        order,
        limit,
        cursor: nextCursor,
      });
      const allAds = [...ads, ...res.ads];
      setAds(allAds);
      setNextCursor(res.nextCursor);
      saveSearch({
        query: query.trim(),
        order,
        limit,
        ads: allAds,
        nextCursor: res.nextCursor,
      });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Buscar Ads</h1>
      <p className="mt-1 text-sm text-muted">
        Encuentra anuncios ganadores para inspirar tu campaña.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Ej: suplementos naturales, ropa deportiva, café artesanal..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>
            <Button type="submit" loading={loading}>
              Buscar
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="w-48">
              <Select
                label="Ordenar por"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                options={[
                  { value: "longest_running", label: "Mayor duración" },
                  { value: "newest", label: "Más recientes" },
                  { value: "oldest", label: "Más antiguos" },
                  { value: "most_relevant", label: "Más relevantes" },
                ]}
              />
            </div>
            <div className="w-32">
              <Select
                label="Resultados"
                value={String(limit)}
                onChange={(e) => setLimit(Number(e.target.value))}
                options={[
                  { value: "3", label: "3" },
                  { value: "6", label: "6" },
                  { value: "9", label: "9" },
                ]}
              />
            </div>
          </div>
        </form>
      </Card>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-red-50 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && ads.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>

          {nextCursor && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="ghost"
                onClick={handleLoadMore}
                loading={loadingMore}
              >
                Cargar más
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && searched && ads.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-3xl">🔍</p>
          <p className="mt-2 text-sm text-muted">
            No se encontraron anuncios para esa búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
