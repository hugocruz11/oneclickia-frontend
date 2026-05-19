"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

type Lang = "es" | "en" | "pt";
const LANG_LABELS: Record<Lang, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
};

interface SavedBlueprint {
  id: string;
  name: string;
  lang: string;
  cachedVideoAdId: string | null;
  sourceVideoUrl: string | null;
  sourceThumbnail: string | null;
  sourceBrandName: string | null;
  sourceHeadline: string | null;
  createdAt: string;
}

export default function SavedVideosPage() {
  const [items, setItems] = useState<SavedBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<SavedBlueprint[]>("/video-ads/saved-blueprints")
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleRename(item: SavedBlueprint) {
    const name = window.prompt("Nuevo nombre:", item.name);
    if (!name || !name.trim() || name.trim() === item.name) return;
    try {
      await api.patch(`/video-ads/saved-blueprints/${item.id}`, {
        name: name.trim(),
      });
      setItems((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, name: name.trim() } : p,
        ),
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo renombrar.");
    }
  }

  async function handleDelete(item: SavedBlueprint) {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return;
    try {
      await api.delete(`/video-ads/saved-blueprints/${item.id}`);
      setItems((prev) => prev.filter((p) => p.id !== item.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo eliminar.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="text-sm text-muted">Cargando blueprints guardados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink">Videos guardados</h1>
      <p className="mt-1 text-sm text-muted">
        Tu librería de estructuras de video guardadas. Cada una es un
        snapshot independiente — regenerar el blueprint original no las
        afecta.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-3xl">💾</p>
          <p className="mt-2 text-sm text-muted">
            Aún no tienes blueprints guardados.{" "}
            <Link href="/ads/videos" className="text-orange hover:text-orange/80">
              Buscar videos
            </Link>
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <SavedBlueprintCard
              key={item.id}
              item={item}
              onRename={() => handleRename(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedBlueprintCard({
  item,
  onRename,
  onDelete,
}: {
  item: SavedBlueprint;
  onRename: () => void;
  onDelete: () => void;
}) {
  const langKey = (
    ["es", "en", "pt"].includes(item.lang) ? item.lang : "es"
  ) as Lang;
  return (
    <Card className="flex flex-col gap-3 p-0 overflow-hidden">
      <Link
        href={`/ads/videos/saved/${item.id}`}
        className="group block"
      >
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
          {item.sourceThumbnail ? (
            <img
              src={item.sourceThumbnail}
              alt={item.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-white/40">
              🎬
            </div>
          )}
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {LANG_LABELS[langKey]}
          </div>
        </div>
        <div className="flex flex-col gap-1 px-3 pt-3">
          <p className="line-clamp-2 text-sm font-semibold text-ink">
            {item.name}
          </p>
          {item.sourceBrandName && (
            <p className="text-xs text-muted">{item.sourceBrandName}</p>
          )}
          {item.sourceHeadline && (
            <p className="line-clamp-2 text-xs text-muted">
              {item.sourceHeadline}
            </p>
          )}
          <p className="mt-1 text-[10px] text-muted">
            {new Date(item.createdAt).toLocaleDateString("es")}
          </p>
        </div>
      </Link>
      <div className="flex gap-2 border-t border-sand px-3 py-2">
        <button
          type="button"
          onClick={onRename}
          className="text-xs text-muted hover:text-orange transition-colors"
        >
          Renombrar
        </button>
        <span className="text-xs text-muted">·</span>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-muted hover:text-error transition-colors"
        >
          Eliminar
        </button>
      </div>
    </Card>
  );
}
