"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { CachedAd } from "@/lib/types";

interface AdCardProps {
  ad: CachedAd;
}

export function AdCard({ ad }: AdCardProps) {
  function handleClick() {
    sessionStorage.setItem(`ad_${ad.id}`, JSON.stringify(ad));
  }

  return (
    <Link
      href={`/ads/${ad.id}`}
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-sand bg-cream transition-colors hover:border-orange/50"
    >
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
          <span className="text-3xl text-muted">📷</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {ad.advertiserName && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {ad.advertiserName}
          </p>
        )}

        {ad.headline && (
          <h3 className="text-sm font-semibold text-ink line-clamp-2">
            {ad.headline}
          </h3>
        )}

        {ad.primaryText && (
          <p className="text-xs text-charcoal line-clamp-3">
            {ad.primaryText}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Badge variant="default">{ad.publisherPlatform}</Badge>
        </div>
      </div>
    </Link>
  );
}
