"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { VideoTemplateView } from "@/components/VideoTemplateView";
import { api, ApiError } from "@/lib/api";

interface VideoAd {
  id: string;
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
}

interface BlueprintData {
  template: string;
  _meta?: { lang?: string; promptVersion?: string };
}

interface BlueprintResponse {
  id: string;
  blueprint: BlueprintData;
  lang: string;
  cached: boolean;
  createdAt: string;
}

export default function VideoBlueprintPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<VideoAd | null>(null);
  const [blueprint, setBlueprint] = useState<BlueprintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    api
      .get<string[]>("/video-ads/favorites/ids")
      .then((ids) => setIsFavorite(ids.includes(videoId)))
      .catch(() => {});
  }, [videoId]);

  async function toggleFavorite() {
    if (!videoId) return;
    const prev = isFavorite;
    setIsFavorite(!prev);
    try {
      if (prev) await api.delete(`/video-ads/favorites/${videoId}`);
      else await api.post(`/video-ads/favorites/${videoId}`, {});
    } catch {
      setIsFavorite(prev);
    }
  }

  useEffect(() => {
    if (!videoId) return;
    api
      .get<VideoAd>(`/video-ads/${videoId}`)
      .then(setVideo)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar el video."),
      )
      .finally(() => setLoading(false));
  }, [videoId]);

  async function handleAnalyze() {
    if (!videoId) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await api.get<BlueprintResponse>(
        `/video-ads/${videoId}/blueprint`,
      );
      setBlueprint(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al analizar el video.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!videoId || !blueprint) return;
    const defaultName =
      video?.headline?.slice(0, 60) || video?.brandName || "Mi template";
    const name = window.prompt("Nombre para este template:", defaultName);
    if (!name || !name.trim()) return;
    try {
      await api.post(`/video-ads/${videoId}/blueprint/save`, {
        name: name.trim(),
      });
      alert(`Guardado como "${name.trim()}".`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo guardar.");
    }
  }

  async function handleRegenerate() {
    if (!videoId) return;
    if (
      !window.confirm(
        "¿Regenerar el template? Reemplaza el análisis actual.",
      )
    ) {
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const res = await api.post<BlueprintResponse>(
        `/video-ads/${videoId}/blueprint/regenerate`,
        {},
      );
      setBlueprint(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al regenerar el análisis.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="text-sm text-muted">Cargando video...</p>
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="max-w-2xl">
        <Link
          href="/ads/videos"
          className="text-sm text-orange hover:text-orange/80"
        >
          ← Volver a buscar videos
        </Link>
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="max-w-6xl">
      <Link
        href="/ads/videos"
        className="text-sm text-orange hover:text-orange/80"
      >
        ← Volver a buscar videos
      </Link>

      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Video preview */}
        <div className="flex flex-col gap-3">
          <Card className="overflow-hidden p-0">
            <video
              src={video.videoUrl}
              controls
              className="aspect-[9/16] w-full bg-black"
              poster={video.thumbnailUrl ?? undefined}
            />
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  {video.brandName && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {video.brandName}
                    </p>
                  )}
                  {video.headline && (
                    <p className="text-sm font-semibold text-ink">
                      {video.headline}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-label={
                    isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                  }
                  title={
                    isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                  }
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  <Icon
                    name="heart"
                    size={22}
                    fill={isFavorite ? "currentColor" : "none"}
                    className={isFavorite ? "text-red-500" : "text-muted"}
                  />
                </button>
              </div>
              {video.description && (
                <p className="text-xs text-muted">{video.description}</p>
              )}
              {video.ctaTitle && (
                <Badge variant="default">{video.ctaTitle}</Badge>
              )}
              <div className="mt-1 flex flex-wrap gap-1.5">
                {video.publisherPlatform.map((p) => (
                  <Badge key={p} variant="muted">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {video.fullTranscription && (
            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Transcripción
              </h3>
              <p className="mt-2 text-xs text-charcoal whitespace-pre-wrap">
                {video.fullTranscription}
              </p>
            </Card>
          )}
        </div>

        {/* Template */}
        <div className="flex flex-col gap-4">
          {!blueprint && !analyzing && (
            <Card>
              <h2 className="text-lg font-semibold text-ink">
                Estructura del anuncio
              </h2>
              <p className="mt-1 text-sm text-muted">
                La IA analiza el script del video y extrae su estructura como un
                template universal neutro. Reemplazás las variables entre
                [CORCHETES] con tu producto y tenés un anuncio nuevo listo.
              </p>
              <div className="mt-4">
                <Button onClick={handleAnalyze}>Analizar con IA</Button>
              </div>
            </Card>
          )}

          {analyzing && (
            <Card className="flex flex-col items-center gap-3 py-10">
              <Spinner size="lg" />
              <p className="text-sm text-muted">
                Analizando el video con Gemini... esto puede tardar 30s-1min.
              </p>
            </Card>
          )}

          {error && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {blueprint && !analyzing && (
            <VideoTemplateView
              template={blueprint.blueprint.template}
              metaLine={
                blueprint.cached
                  ? "Análisis previo (cacheado)."
                  : "Análisis recién generado."
              }
              actions={
                <>
                  <Button size="sm" variant="ghost" onClick={handleRegenerate}>
                    Regenerar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Icon name="bookmark" size={15} className="mr-1.5" />
                    Guardar
                  </Button>
                </>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
