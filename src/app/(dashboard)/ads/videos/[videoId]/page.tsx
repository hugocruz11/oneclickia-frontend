"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

type Lang = "es" | "en" | "pt";
const LANG_LABELS: Record<Lang, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
};

function normalizeLang(v: unknown): Lang {
  return v === "en" || v === "pt" || v === "es" ? v : "es";
}

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

interface BlueprintScene {
  start: number;
  end: number;
  purpose: string;
  visualDescription: string;
  onScreenText: string | null;
  spokenText: string | null;
}

interface BlueprintData {
  totalDuration: number;
  hook: {
    start: number;
    end: number;
    visualDescription: string;
    spokenText: string | null;
    style: string;
  };
  scenes: BlueprintScene[];
  cta: {
    start: number;
    end: number;
    text: string;
    visualDescription: string;
  } | null;
  narrationTone: string;
  pacing: string;
  musicVibe: string;
  format: string;
  keyHooks: string[];
  takeaways: string[];
}

interface BlueprintResponse {
  id: string;
  blueprint: BlueprintData;
  lang: Lang;
  cached: boolean;
  createdAt: string;
}

function fmtTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return "0s";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function VideoBlueprintPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<VideoAd | null>(null);
  const [blueprint, setBlueprint] = useState<BlueprintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("es");
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
      setIsFavorite(prev); // revert
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
        `/video-ads/${videoId}/blueprint?lang=${lang}`,
      );
      setBlueprint({ ...res, lang: normalizeLang(res.lang) });
      setLang(normalizeLang(res.lang));
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
      video?.headline?.slice(0, 60) ||
      video?.brandName ||
      "Mi blueprint";
    const name = window.prompt(
      "Nombre para esta estructura:",
      defaultName,
    );
    if (!name || !name.trim()) return;
    try {
      await api.post(`/video-ads/${videoId}/blueprint/save`, {
        name: name.trim(),
      });
      alert(`Guardado como "${name.trim()}".`);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "No se pudo guardar.",
      );
    }
  }

  async function handleRegenerate() {
    if (!videoId) return;
    const langLabel = LANG_LABELS[lang];
    if (
      !window.confirm(
        `¿Regenerar el análisis en ${langLabel}? Reemplaza el análisis actual.`,
      )
    ) {
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const res = await api.post<BlueprintResponse>(
        `/video-ads/${videoId}/blueprint/regenerate`,
        { lang },
      );
      setBlueprint({ ...res, lang: normalizeLang(res.lang) });
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
                  className="shrink-0 text-xl transition-transform hover:scale-110"
                >
                  {isFavorite ? "❤️" : "🤍"}
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

        {/* Blueprint */}
        <div className="flex flex-col gap-4">
          {!blueprint && !analyzing && (
            <Card>
              <h2 className="text-lg font-semibold text-ink">
                Estructura del video
              </h2>
              <p className="mt-1 text-sm text-muted">
                La IA analiza el video y extrae la estructura escena por
                escena: hook, narrativa, CTA, ritmo, tono. Úsala como
                plantilla para crear tu propia versión.
              </p>
              <div className="mt-4 flex items-end gap-3">
                <div className="w-48">
                  <Select
                    label="Idioma del análisis"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    options={[
                      { value: "es", label: "Español" },
                      { value: "en", label: "Inglés" },
                      { value: "pt", label: "Portugués" },
                    ]}
                  />
                </div>
                <Button onClick={handleAnalyze}>
                  Analizar con IA
                </Button>
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
            <BlueprintView
              data={blueprint.blueprint}
              cached={blueprint.cached}
              blueprintLang={blueprint.lang}
              lang={lang}
              onLangChange={setLang}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BlueprintView({
  data,
  cached,
  blueprintLang,
  lang,
  onLangChange,
  onRegenerate,
  onSave,
}: {
  data: BlueprintData;
  cached: boolean;
  blueprintLang: Lang;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onRegenerate: () => void;
  onSave?: () => void;
}) {
  const langChanged = lang !== blueprintLang;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Estructura del video
          </h2>
          <p className="mt-1 text-xs text-muted">
            {cached
              ? `Análisis previo en ${LANG_LABELS[normalizeLang(blueprintLang)]} (cacheado).`
              : `Análisis generado en ${LANG_LABELS[normalizeLang(blueprintLang)]}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-40">
            <Select
              label="Idioma"
              value={lang}
              onChange={(e) => onLangChange(e.target.value as Lang)}
              options={[
                { value: "es", label: "Español" },
                { value: "en", label: "Inglés" },
                { value: "pt", label: "Portugués" },
              ]}
            />
          </div>
          <Button
            variant={langChanged ? "primary" : "ghost"}
            size="sm"
            onClick={onRegenerate}
          >
            {langChanged
              ? `Regenerar en ${LANG_LABELS[lang]}`
              : "Regenerar"}
          </Button>
          {onSave && (
            <Button size="sm" onClick={onSave}>
              💾 Guardar
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Meta label="Duración" value={fmtTime(data.totalDuration)} />
          <Meta label="Formato" value={data.format} />
          <Meta label="Ritmo" value={data.pacing} />
          <Meta label="Música" value={data.musicVibe} />
        </div>
        <div className="mt-3 border-t border-sand pt-3">
          <Meta label="Tono de narración" value={data.narrationTone} />
        </div>
      </Card>

      {/* Hook */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Hook ({fmtTime(data.hook.start)} – {fmtTime(data.hook.end)})
        </h3>
        <p className="mt-2 text-sm font-semibold text-ink">{data.hook.style}</p>
        <p className="mt-1 text-sm text-charcoal">
          {data.hook.visualDescription}
        </p>
        {data.hook.spokenText && (
          <p className="mt-2 text-xs italic text-muted">
            “{data.hook.spokenText}”
          </p>
        )}
      </Card>

      {/* Scenes */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Escenas
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {data.scenes.map((scene, idx) => (
            <div
              key={idx}
              className="flex gap-3 rounded-md border border-sand p-3"
            >
              <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-md bg-cream py-2">
                <span className="text-[10px] uppercase tracking-wide text-muted">
                  Escena {idx + 1}
                </span>
                <span className="text-xs font-semibold text-ink">
                  {fmtTime(scene.start)}
                </span>
                <span className="text-[10px] text-muted">
                  → {fmtTime(scene.end)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Badge variant="default">{scene.purpose}</Badge>
                <p className="text-sm text-charcoal">
                  {scene.visualDescription}
                </p>
                {scene.onScreenText && (
                  <p className="text-xs text-muted">
                    <span className="font-semibold">Texto en pantalla:</span>{" "}
                    {scene.onScreenText}
                  </p>
                )}
                {scene.spokenText && (
                  <p className="text-xs italic text-muted">
                    “{scene.spokenText}”
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      {data.cta && (
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            CTA ({fmtTime(data.cta.start)} – {fmtTime(data.cta.end)})
          </h3>
          <p className="mt-2 text-sm font-semibold text-orange">
            {data.cta.text}
          </p>
          <p className="mt-1 text-sm text-charcoal">
            {data.cta.visualDescription}
          </p>
        </Card>
      )}

      {/* Insights */}
      {(data.keyHooks?.length > 0 || data.takeaways?.length > 0) && (
        <Card>
          {data.keyHooks?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Insights clave
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-charcoal">
                {data.keyHooks.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {data.takeaways?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Qué lo hace funcionar
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-charcoal">
                {data.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
