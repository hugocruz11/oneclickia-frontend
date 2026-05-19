"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

type Lang = "es" | "en" | "pt";
const LANG_LABELS: Record<Lang, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
};

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

interface SavedBlueprint {
  id: string;
  name: string;
  lang: string;
  cachedVideoAdId: string | null;
  sourceVideoUrl: string | null;
  sourceThumbnail: string | null;
  sourceBrandName: string | null;
  sourceHeadline: string | null;
  blueprint: BlueprintData;
  createdAt: string;
}

function fmtTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return "0s";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function SavedBlueprintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<SavedBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get<SavedBlueprint>(`/video-ads/saved-blueprints/${id}`)
      .then(setItem)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl">
        <Link
          href="/ads/videos/saved"
          className="text-sm text-orange hover:text-orange/80"
        >
          ← Volver a videos guardados
        </Link>
        {error && (
          <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
      </div>
    );
  }

  const data = item.blueprint;
  const langKey = (
    ["es", "en", "pt"].includes(item.lang) ? item.lang : "es"
  ) as Lang;

  return (
    <div className="max-w-6xl">
      <Link
        href="/ads/videos/saved"
        className="text-sm text-orange hover:text-orange/80"
      >
        ← Volver a videos guardados
      </Link>

      <div className="mt-2 mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold text-ink">{item.name}</h1>
        <Badge variant="muted">{LANG_LABELS[langKey]}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Source video preview */}
        <div className="flex flex-col gap-3">
          <Card className="overflow-hidden p-0">
            {item.sourceVideoUrl ? (
              <video
                src={item.sourceVideoUrl}
                controls
                className="aspect-[9/16] w-full bg-black"
                poster={item.sourceThumbnail ?? undefined}
              />
            ) : (
              <div className="flex aspect-[9/16] w-full items-center justify-center bg-black text-4xl text-white/40">
                🎬
              </div>
            )}
            <div className="flex flex-col gap-1 p-4">
              {item.sourceBrandName && (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {item.sourceBrandName}
                </p>
              )}
              {item.sourceHeadline && (
                <p className="text-sm text-charcoal">{item.sourceHeadline}</p>
              )}
              {item.cachedVideoAdId && (
                <Link
                  href={`/ads/videos/${item.cachedVideoAdId}`}
                  className="mt-2 text-xs text-orange hover:text-orange/80"
                >
                  Ver video original →
                </Link>
              )}
              <p className="mt-2 text-[10px] text-muted">
                Guardado el{" "}
                {new Date(item.createdAt).toLocaleString("es")}
              </p>
            </div>
          </Card>
        </div>

        {/* Blueprint readonly */}
        <div className="flex flex-col gap-4">
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
            <p className="mt-2 text-sm font-semibold text-ink">
              {data.hook.style}
            </p>
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
      </div>
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
