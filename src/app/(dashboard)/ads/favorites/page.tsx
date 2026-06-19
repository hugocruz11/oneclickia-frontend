"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { AdCard } from "@/components/AdCard";
import { api } from "@/lib/api";
import type { CachedAd } from "@/lib/types";

type Filter = "all" | "images" | "videos";

interface VideoAd {
  id: string;
  brandName: string | null;
  headline: string | null;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  videoDuration: number | null;
  publisherPlatform: string[];
}

function formatDuration(secs: number | null): string {
  if (!secs || secs < 1) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function FavoritesPage() {
  const [ads, setAds] = useState<CachedAd[]>([]);
  const [videos, setVideos] = useState<VideoAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    Promise.allSettled([
      api.get<CachedAd[]>("/ads/favorites"),
      api.get<VideoAd[]>("/video-ads/favorites"),
    ])
      .then(([adsRes, videosRes]) => {
        if (adsRes.status === "fulfilled") setAds(adsRes.value);
        if (videosRes.status === "fulfilled") setVideos(videosRes.value);
        if (adsRes.status === "rejected" && videosRes.status === "rejected") {
          setError("No se pudieron cargar los favoritos.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleRemoveImage(id: string) {
    setAds((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleRemoveVideo(id: string) {
    const prev = videos;
    setVideos((p) => p.filter((v) => v.id !== id));
    try {
      await api.delete(`/video-ads/favorites/${id}`);
    } catch {
      setVideos(prev); // revert
    }
  }

  const showImages = filter !== "videos";
  const showVideos = filter !== "images";
  const totalShown =
    (showImages ? ads.length : 0) + (showVideos ? videos.length : 0);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Favoritos</h1>
      <p className="mt-1 text-sm text-muted">
        Los anuncios y videos que guardaste para inspirarte más tarde.
      </p>

      {/* Filter tabs */}
      <div className="mt-4 flex gap-2">
        <FilterTab
          active={filter === "all"}
          label={`Todos (${ads.length + videos.length})`}
          onClick={() => setFilter("all")}
        />
        <FilterTab
          active={filter === "images"}
          label={
            <>
              <Icon name="image" size={15} className="text-indigo-500" />
              Imágenes ({ads.length})
            </>
          }
          onClick={() => setFilter("images")}
        />
        <FilterTab
          active={filter === "videos"}
          label={
            <>
              <Icon name="video" size={15} className="text-rose-500" />
              Videos ({videos.length})
            </>
          }
          onClick={() => setFilter("videos")}
        />
      </div>

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

      {!loading && totalShown === 0 && !error && (
        <Card className="mt-6 text-center">
          <Icon name="heart" size={36} fill="currentColor" className="mx-auto text-red-500" />
          <p className="mt-2 text-sm font-medium text-ink">
            Aún no tienes favoritos en esta categoría.
          </p>
          <p className="mt-1 text-sm text-muted">
            Busca anuncios o videos y toca el corazón para guardarlos aquí.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/ads/search">
              <Button size="sm" variant="ghost">
                Buscar imágenes
              </Button>
            </Link>
            <Link href="/ads/videos">
              <Button size="sm">Buscar videos</Button>
            </Link>
          </div>
        </Card>
      )}

      {!loading && showImages && ads.length > 0 && (
        <div className="mt-6">
          {filter === "all" && (
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted">
              <Icon name="image" size={15} className="text-indigo-500" />
              Imágenes
            </h2>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                isFavorite
                onFavoriteChange={(id, fav) => {
                  if (!fav) handleRemoveImage(id);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && showVideos && videos.length > 0 && (
        <div className="mt-6">
          {filter === "all" && (
            <h2 className="mb-3 mt-6 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted">
              <Icon name="video" size={15} className="text-rose-500" />
              Videos
            </h2>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <FavoriteVideoCard
                key={v.id}
                video={v}
                onRemove={() => handleRemoveVideo(v.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-orange bg-orange/10 text-orange"
          : "border-sand text-muted hover:border-orange/30 hover:text-orange"
      }`}
    >
      {label}
    </button>
  );
}

function FavoriteVideoCard({
  video,
  onRemove,
}: {
  video: VideoAd;
  onRemove: () => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-sand bg-white transition-colors hover:border-orange/40">
      <Link href={`/ads/videos/${video.id}`}>
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.headline || video.brandName || "Video"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/40">
              <Icon name="video" size={40} />
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.videoDuration)}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {video.brandName && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {video.brandName}
            </p>
          )}
          {video.headline && (
            <p className="line-clamp-2 text-sm font-semibold text-ink">
              {video.headline}
            </p>
          )}
          {video.description && (
            <p className="line-clamp-2 text-xs text-muted">
              {video.description}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-1.5">
            {video.publisherPlatform.slice(0, 3).map((p) => (
              <Badge key={p} variant="muted">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Quitar de favoritos"
        title="Quitar de favoritos"
        className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur transition-colors hover:bg-black/70"
      >
        <Icon name="heart" size={18} fill="currentColor" className="text-red-500" />
      </button>
    </div>
  );
}
