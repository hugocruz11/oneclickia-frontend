"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AdCard } from "@/components/AdCard";
import { api, ApiError } from "@/lib/api";
import { scoreAds } from "@/lib/ad-scoring";
import type { CachedAd, AdsSearchResponse, Brand } from "@/lib/types";

const STORAGE_KEY = "ads_search_state";
const HISTORY_KEY = "ads_search_history";
const MAX_HISTORY = 10;

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addToHistory(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const history = getHistory().filter((h) => h !== trimmed);
  history.unshift(trimmed);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function removeFromHistory(q: string) {
  const history = getHistory().filter((h) => h !== q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

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
  const [brand, setBrand] = useState<Brand | null>(null);
  const [topAdId, setTopAdId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCustomCta, setShowCustomCta] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show custom CTA after 30 seconds on the page
  useEffect(() => {
    timerRef.current = setTimeout(() => setShowCustomCta(true), 30000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Load brand, history, and favorites on mount
  useEffect(() => {
    api.get<Brand>("/brand").then(setBrand).catch(() => {});
    api
      .get<string[]>("/ads/favorites/ids")
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => {});
    setHistory(getHistory());
  }, []);

  // Recalculate top ad when ads or brand change
  useEffect(() => {
    if (ads.length > 0) {
      const scored = scoreAds(ads, brand);
      const top = scored.find((s) => s.isTop);
      setTopAdId(top ? top.ad.id : null);
    }
  }, [ads, brand]);

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
    setShowHistory(false);

    addToHistory(query.trim());
    setHistory(getHistory());

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
      const existingIds = new Set(ads.map((a) => a.id));
      const newAds = res.ads.filter((a) => !existingIds.has(a.id));
      const allAds = [...ads, ...newAds];

      if (newAds.length === 0) {
        setError(
          "No hay más anuncios nuevos para esta búsqueda. Prueba con otra palabra clave o cambia el orden.",
        );
        setNextCursor(null);
        return;
      }

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
            <div className="relative flex-1">
              <Input
                placeholder="Ej: suplementos naturales, ropa deportiva, café artesanal..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                required
              />
              {showHistory && history.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-sand bg-cream shadow-sm">
                  {history
                    .filter((h) => !query.trim() || h.toLowerCase().includes(query.toLowerCase()))
                    .map((h) => (
                    <li key={h} className="flex items-center">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setQuery(h);
                          setShowHistory(false);
                        }}
                        className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-sand-light"
                      >
                        <span className="text-muted">🕐</span>
                        {h}
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          removeFromHistory(h);
                          setHistory(getHistory());
                        }}
                        className="px-3 py-2 text-xs text-muted hover:text-error"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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

      {/* CTA: show after 30s */}
      {showCustomCta && !loading && (
        <Card className="mt-4 border-orange/30 bg-orange/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                ¿Prefieres crear tu propio anuncio?
              </p>
              <p className="text-xs text-muted">
                Sube tus propias imágenes de referencia y describe exactamente lo
                que necesitas.
              </p>
            </div>
            <Link href="/ads/custom" className="shrink-0">
              <Button size="sm" variant="ghost">
                Crear personalizado
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
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
              <AdCard
                key={ad.id}
                ad={ad}
                isTop={ad.id === topAdId}
                isFavorite={favoriteIds.has(ad.id)}
                onFavoriteChange={(id, fav) => {
                  setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    if (fav) next.add(id);
                    else next.delete(id);
                    return next;
                  });
                }}
              />
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
          <Card className="mt-6 text-left">
            <p className="text-sm font-semibold text-ink">
              ¿No encuentras lo que buscas?
            </p>
            <p className="mt-1 text-sm text-muted">
              Crea tu propio anuncio desde cero. Sube una imagen de referencia,
              tu producto y describe lo que necesitas.
            </p>
            <Link href="/ads/custom">
              <Button className="mt-3" size="sm">
                Crear anuncio personalizado
              </Button>
            </Link>
          </Card>
        </div>
      )}

    </div>
  );
}
