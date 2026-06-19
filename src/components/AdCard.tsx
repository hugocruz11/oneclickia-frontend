"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import type { CachedAd } from "@/lib/types";

interface AdCardProps {
  ad: CachedAd;
  isTop?: boolean;
  isFavorite?: boolean;
  onFavoriteChange?: (adId: string, favorited: boolean) => void;
}

function formatDuration(days: number | null): string | null {
  if (!days) return null;
  if (days >= 365) return `${Math.floor(days / 365)}a ${days % 365 > 30 ? Math.floor((days % 365) / 30) + "m" : ""}`;
  if (days >= 30) return `${Math.floor(days / 30)} meses`;
  return `${days} días`;
}

export function AdCard({
  ad,
  isTop = false,
  isFavorite = false,
  onFavoriteChange,
}: AdCardProps) {
  const [favorited, setFavorited] = useState(isFavorite);
  const [saving, setSaving] = useState(false);

  function handleClick() {
    sessionStorage.setItem(`ad_${ad.id}`, JSON.stringify(ad));
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    const next = !favorited;
    setFavorited(next);
    try {
      if (next) await api.post(`/ads/favorites/${ad.id}`, {});
      else await api.delete(`/ads/favorites/${ad.id}`);
      onFavoriteChange?.(ad.id, next);
    } catch {
      setFavorited(!next);
    } finally {
      setSaving(false);
    }
  }

  const duration = formatDuration(ad.runningDurationDays);

  return (
    <Link
      href={`/ads/${ad.id}`}
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-cream transition-all ${
        isTop
          ? "border-orange ring-2 ring-orange/20 shadow-[0_0_20px_rgba(255,79,0,0.1)]"
          : "border-sand hover:border-orange/50"
      }`}
    >
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${
          favorited
            ? "bg-orange text-white hover:bg-orange/90"
            : "bg-white/90 text-charcoal hover:bg-white"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={favorited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Top badge */}
      {isTop && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-orange px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="shrink-0"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Top para tu marca
          </span>
        </div>
      )}

      {ad.imageUrl ? (
        <div className="aspect-square w-full overflow-hidden bg-sand-light">
          <img
            src={ad.imageUrl}
            alt={ad.headline || "Ad"}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-sand-light">
          <Icon name="camera" size={36} className="text-muted" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {ad.brandName && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {ad.brandName}
          </p>
        )}

        {ad.headline && (
          <h3 className="text-sm font-semibold text-ink line-clamp-2">
            {ad.headline}
          </h3>
        )}

        {ad.description && (
          <p className="text-xs text-charcoal line-clamp-2">
            {ad.description}
          </p>
        )}

        {/* Niches */}
        {ad.niches && ad.niches.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ad.niches.slice(0, 3).map((niche) => (
              <Badge key={niche} variant="orange">{niche}</Badge>
            ))}
          </div>
        )}

        {/* Meta info row */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {ad.publisherPlatform?.map((p) => (
            <Badge key={p} variant="default">{p}</Badge>
          ))}
          {ad.marketTarget && (
            <Badge variant="muted">
              {ad.marketTarget.toUpperCase()}
            </Badge>
          )}
          {duration && (
            <Badge variant="success">
              {duration} activo
            </Badge>
          )}
          {ad.isLive && (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
