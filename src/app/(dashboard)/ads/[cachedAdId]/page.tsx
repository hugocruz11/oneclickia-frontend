"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { CachedAd } from "@/lib/types";

export default function AdDetailPage() {
  const { cachedAdId } = useParams<{ cachedAdId: string }>();
  const [ad, setAd] = useState<CachedAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // The backend doesn't have a GET /ads/:id endpoint, so we use search results
    // stored in sessionStorage from the search page
    const stored = sessionStorage.getItem(`ad_${cachedAdId}`);
    if (stored) {
      setAd(JSON.parse(stored));
      setLoading(false);
    } else {
      setError("No se encontró la información del anuncio. Vuelve a buscarlo.");
      setLoading(false);
    }
  }, [cachedAdId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ad) {
    return (
      <Card>
        <p className="text-error">{error}</p>
        <Link href="/ads/search" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">Volver a buscar</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/ads/search"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Volver a resultados
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.headline || "Ad"}
              className="w-full rounded-lg border border-sand"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-sand bg-sand-light">
              <span className="text-5xl text-muted">📷</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            {ad.advertiserName && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {ad.advertiserName}
              </p>
            )}
            <h1 className="mt-1 text-xl font-semibold text-ink">
              {ad.headline || "Sin título"}
            </h1>
          </div>

          {ad.primaryText && (
            <Card padding="sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Texto del anuncio
              </h3>
              <p className="mt-1 text-sm text-charcoal">{ad.primaryText}</p>
            </Card>
          )}

          {ad.description && (
            <Card padding="sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Descripción
              </h3>
              <p className="mt-1 text-sm text-charcoal">{ad.description}</p>
            </Card>
          )}

          <div className="flex gap-2">
            <Badge>{ad.publisherPlatform}</Badge>
            {ad.displayUrl && (
              <Badge variant="muted">{ad.displayUrl}</Badge>
            )}
          </div>

          <div className="mt-auto pt-4">
            <Link href={`/ads/${ad.id}/adapt`}>
              <Button size="lg" className="w-full">
                Adaptar copy a mi marca
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
