"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import type { CachedAd } from "@/lib/types";

function formatDuration(days: number | null): string | null {
  if (!days) return null;
  if (days >= 365)
    return `${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? "s" : ""} y ${Math.floor((days % 365) / 30)} meses`;
  if (days >= 30) return `${Math.floor(days / 30)} meses`;
  return `${days} días`;
}

export default function AdDetailPage() {
  const { cachedAdId } = useParams<{ cachedAdId: string }>();
  const [ad, setAd] = useState<CachedAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

  const duration = formatDuration(ad.runningDurationDays);

  return (
    <div className="max-w-4xl">
      <Link
        href="/ads/search"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Volver a resultados
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Image */}
        <div>
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.headline || "Ad"}
              className="w-full rounded-lg border border-sand"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-sand bg-sand-light">
              <Icon name="camera" size={56} className="text-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            {ad.brandName && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {ad.brandName}
              </p>
            )}
            <h1 className="mt-1 text-xl font-semibold text-ink">
              {ad.headline || "Sin título"}
            </h1>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {ad.publisherPlatform?.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
            {ad.isLive && (
              <Badge variant="success">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </Badge>
            )}
            {ad.marketTarget && (
              <Badge variant="muted">{ad.marketTarget.toUpperCase()}</Badge>
            )}
            {ad.displayFormat && (
              <Badge variant="muted">{ad.displayFormat}</Badge>
            )}
          </div>

          {/* Running duration */}
          {duration && (
            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Tiempo activo
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-success">
                    {duration}
                  </p>
                </div>
                {ad.startedRunningAt && (
                  <div className="text-right">
                    <p className="text-xs text-muted">Desde</p>
                    <p className="text-sm text-charcoal">
                      {new Date(ad.startedRunningAt).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Copy */}
          {ad.description && (
            <Card padding="sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Texto del anuncio
              </h3>
              <p className="mt-1 text-sm text-charcoal">{ad.description}</p>
            </Card>
          )}

          {/* CTA & Link */}
          {(ad.ctaTitle || ad.linkUrl) && (
            <Card padding="sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Call to Action
              </h3>
              <div className="mt-2 flex items-center gap-2">
                {ad.ctaTitle && (
                  <Badge variant="orange">{ad.ctaTitle}</Badge>
                )}
                {ad.ctaType && ad.ctaType !== ad.ctaTitle && (
                  <Badge variant="muted">{ad.ctaType}</Badge>
                )}
              </div>
              {ad.linkUrl && (
                <p className="mt-2 truncate text-xs text-muted">
                  → {ad.linkUrl}
                </p>
              )}
            </Card>
          )}

          {/* Niches & Categories */}
          {((ad.niches && ad.niches.length > 0) ||
            (ad.categories && ad.categories.length > 0) ||
            ad.productCategory) && (
            <Card padding="sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Clasificación
              </h3>
              <div className="mt-2 flex flex-col gap-2">
                {ad.niches && ad.niches.length > 0 && (
                  <div>
                    <p className="text-xs text-muted">Nichos</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ad.niches.map((n) => (
                        <Badge key={n} variant="orange">{n}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {ad.categories && ad.categories.length > 0 && (
                  <div>
                    <p className="text-xs text-muted">Categorías</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ad.categories.map((c) => (
                        <Badge key={c} variant="default">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {ad.productCategory && (
                  <div>
                    <p className="text-xs text-muted">Categoría de producto</p>
                    <Badge variant="default">{ad.productCategory}</Badge>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Languages */}
          {ad.languages && ad.languages.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Idiomas:</span>
              {ad.languages.map((l) => (
                <Badge key={l} variant="muted">{l}</Badge>
              ))}
            </div>
          )}

          {/* Action */}
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
