"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { VideoTemplateView } from "@/components/VideoTemplateView";
import { api } from "@/lib/api";

interface BlueprintData {
  template: string;
  _meta?: { lang?: string; promptVersion?: string };
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

  return (
    <div className="max-w-6xl">
      <Link
        href="/ads/videos/saved"
        className="text-sm text-orange hover:text-orange/80"
      >
        ← Volver a videos guardados
      </Link>

      <div className="mt-2 mb-4">
        <h1 className="text-2xl font-semibold text-ink">{item.name}</h1>
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
              <div className="flex aspect-[9/16] w-full items-center justify-center bg-black text-white/40">
                <Icon name="video" size={40} />
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
                Guardado el {new Date(item.createdAt).toLocaleString("es")}
              </p>
            </div>
          </Card>
        </div>

        {/* Template readonly */}
        <div className="flex flex-col gap-4">
          <VideoTemplateView template={item.blueprint.template} />
        </div>
      </div>
    </div>
  );
}
