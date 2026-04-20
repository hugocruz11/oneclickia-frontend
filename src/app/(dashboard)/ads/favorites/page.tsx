"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AdCard } from "@/components/AdCard";
import { api } from "@/lib/api";
import type { CachedAd } from "@/lib/types";

export default function FavoritesPage() {
  const [ads, setAds] = useState<CachedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<CachedAd[]>("/ads/favorites")
      .then(setAds)
      .catch(() => setError("No se pudieron cargar los favoritos."))
      .finally(() => setLoading(false));
  }, []);

  function handleRemove(id: string) {
    setAds((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Anuncios favoritos</h1>
      <p className="mt-1 text-sm text-muted">
        Los anuncios que guardaste para inspirarte más tarde.
      </p>

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

      {!loading && ads.length === 0 && !error && (
        <Card className="mt-6 text-center">
          <p className="text-3xl">❤️</p>
          <p className="mt-2 text-sm font-medium text-ink">
            Aún no tienes favoritos.
          </p>
          <p className="mt-1 text-sm text-muted">
            Busca anuncios y toca el corazón para guardarlos aquí.
          </p>
          <Link href="/ads/search">
            <Button className="mt-4" size="sm">
              Ir a buscar ads
            </Button>
          </Link>
        </Card>
      )}

      {!loading && ads.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              isFavorite
              onFavoriteChange={(id, fav) => {
                if (!fav) handleRemove(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
