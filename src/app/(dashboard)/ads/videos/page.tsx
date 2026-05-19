"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface VideoAd {
  id: string;
  foreplayId: string;
  brandName: string | null;
  headline: string | null;
  description: string | null;
  ctaTitle: string | null;
  ctaType: string | null;
  linkUrl: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  videoDuration: number | null;
  fullTranscription: string | null;
  languages: string[];
  publisherPlatform: string[];
  startedRunningAt: string | null;
}

interface SearchResponse {
  videos: VideoAd[];
  creditsRemaining?: number;
}

function formatDuration(secs: number | null): string {
  if (!secs || secs < 1) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function VideosSearchPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<
    "most_relevant" | "newest" | "longest_running"
  >("most_relevant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videos, setVideos] = useState<VideoAd[]>([]);
  const [searched, setSearched] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<string[]>("/video-ads/favorites/ids")
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => {});
  }, []);

  async function toggleFavorite(videoId: string) {
    const isFav = favoriteIds.has(videoId);
    // Optimistic
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
    try {
      if (isFav) await api.delete(`/video-ads/favorites/${videoId}`);
      else await api.post(`/video-ads/favorites/${videoId}`, {});
    } catch {
      // Revert on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(videoId);
        else next.delete(videoId);
        return next;
      });
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setVideos([]);
    setSearched(false);

    try {
      const res = await api.post<SearchResponse>("/video-ads/search", {
        query: query.trim(),
        order,
      });
      setVideos(res.videos);
      setSearched(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al buscar videos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink">Buscar Videos</h1>
      <p className="mt-1 text-sm text-muted">
        Encuentra anuncios en video de la competencia y úsalos como plantilla
        para tu marca. La IA extrae la estructura del video (hook, escenas,
        CTA) para que puedas replicarla.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <Input
            label="Palabra clave"
            placeholder="Ej: skincare natural, batidos detox, maletas viaje"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56">
              <Select
                label="Orden"
                value={order}
                onChange={(e) =>
                  setOrder(
                    e.target.value as
                      | "most_relevant"
                      | "newest"
                      | "longest_running",
                  )
                }
                options={[
                  { value: "most_relevant", label: "Más relevantes" },
                  { value: "longest_running", label: "Más tiempo activos" },
                  { value: "newest", label: "Más recientes" },
                ]}
              />
            </div>
            <Button type="submit" loading={loading} disabled={!query.trim()}>
              Buscar videos
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-sm text-muted">
            Buscando videos en Foreplay...
          </p>
        </div>
      )}

      {searched && !loading && videos.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-3xl">🎬</p>
          <p className="mt-2 text-sm text-muted">
            No se encontraron videos para esta búsqueda.
          </p>
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              isFavorite={favoriteIds.has(v.id)}
              onToggleFavorite={() => toggleFavorite(v.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  isFavorite,
  onToggleFavorite,
}: {
  video: VideoAd;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-sand bg-white transition-colors hover:border-orange/40">
      <Link href={`/ads/videos/${video.id}`} className="flex flex-col">
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.headline || video.brandName || "Video"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-white/40">
              🎬
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.videoDuration)}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {video.headline && (
            <p className="line-clamp-2 text-sm font-semibold text-ink">
              {video.headline}
            </p>
          )}
          {video.description && (
            <p className="line-clamp-2 text-xs text-muted">{video.description}</p>
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
          onToggleFavorite();
        }}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg backdrop-blur transition-colors hover:bg-black/70"
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>
    </div>
  );
}
