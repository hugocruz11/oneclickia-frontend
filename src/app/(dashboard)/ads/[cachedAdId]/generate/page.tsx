"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";
import type { AdaptCopyResponse, GenerateImageResponse } from "@/lib/types";

const FORMAT_OPTIONS = [
  { key: "feed", label: "Feed (1:1)", size: "1080x1080" },
  { key: "vertical", label: "Vertical (4:5)", size: "1080x1350" },
  { key: "story", label: "Story (9:16)", size: "1080x1920" },
] as const;

export default function GenerateImagePage() {
  const { cachedAdId } = useParams<{ cachedAdId: string }>();

  const [adaptation, setAdaptation] = useState<AdaptCopyResponse | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [formats, setFormats] = useState<string[]>(["feed"]);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateImageResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`adaptation_${cachedAdId}`);
    if (stored) setAdaptation(JSON.parse(stored));

    const variant = sessionStorage.getItem(`selectedVariant_${cachedAdId}`);
    if (variant) setVariantIndex(Number(variant));
  }, [cachedAdId]);

  function toggleFormat(key: string) {
    setFormats((prev) =>
      prev.includes(key)
        ? prev.filter((f) => f !== key)
        : [...prev, key],
    );
  }

  async function handleGenerate() {
    if (!adaptation || formats.length === 0) return;

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        adaptationId: adaptation.adaptationId,
        variantIndex,
        formats,
      };
      if (price.trim()) {
        body.price = price.trim();
      }

      const res = await api.post<GenerateImageResponse>(
        `/ads/${cachedAdId}/generate-image`,
        body,
      );
      setResult(res);

      // Store for campaign creation
      sessionStorage.setItem(
        `generatedImage_${cachedAdId}`,
        JSON.stringify(res),
      );
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al generar imágenes.");
    } finally {
      setLoading(false);
    }
  }

  if (!adaptation) {
    return (
      <Card>
        <p className="text-error">
          Primero debes adaptar el copy. Vuelve al anuncio.
        </p>
        <Link href={`/ads/${cachedAdId}/adapt`} className="mt-4 inline-block">
          <Button variant="ghost" size="sm">Adaptar copy</Button>
        </Link>
      </Card>
    );
  }

  const selectedVariant = adaptation.variants[variantIndex];

  return (
    <div className="max-w-4xl">
      <Link
        href={`/ads/${cachedAdId}/adapt`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Volver a variantes
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">
        Generar imágenes
      </h1>
      <p className="mt-1 text-sm text-muted">
        Genera creativos publicitarios con IA.
      </p>

      {/* Selected variant summary */}
      <Card className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Copy seleccionado — Variante {variantIndex + 1}
        </h3>
        <p className="mt-2 text-base font-semibold text-ink">
          {selectedVariant.headline}
        </p>
        <p className="mt-1 text-sm text-charcoal">
          {selectedVariant.description}
        </p>
        <Badge variant="orange" className="mt-2">
          {selectedVariant.ctaTitle}
        </Badge>
      </Card>

      {!result && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Format selection */}
          <Card>
            <h3 className="text-sm font-semibold text-ink">
              Formatos a generar
            </h3>
            <p className="text-xs text-muted">Selecciona al menos uno.</p>

            <div className="mt-3 flex gap-3">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt.key}
                  type="button"
                  onClick={() => toggleFormat(fmt.key)}
                  className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                    formats.includes(fmt.key)
                      ? "border-orange bg-orange/5"
                      : "border-sand hover:border-orange/30"
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{fmt.label}</p>
                  <p className="text-xs text-muted">{fmt.size}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Price */}
          <Card>
            <Input
              label="Precio (opcional)"
              placeholder="Ej: $49.900 COP"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              helperText="Si no pones precio, se eliminará cualquier precio que aparezca en el diseño original."
            />
          </Card>

          <Button
            onClick={handleGenerate}
            loading={loading}
            size="lg"
            disabled={formats.length === 0}
            className="w-full"
          >
            Generar imágenes
          </Button>
        </div>
      )}

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-sm text-muted">
            Generando creativos con IA... esto puede tardar un momento.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-red-50 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-ink">
            Imágenes generadas
          </h2>
          <p className="mb-4 text-sm text-muted">
            Revisa los creativos y continúa para crear la campaña.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.feedImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Feed (1:1)</Badge>
                <img
                  src={`http://localhost:3000${result.feedImageUrl}`}
                  alt="Feed"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
            {result.verticalImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Vertical (4:5)</Badge>
                <img
                  src={`http://localhost:3000${result.verticalImageUrl}`}
                  alt="Vertical"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
            {result.storyImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Story (9:16)</Badge>
                <img
                  src={`http://localhost:3000${result.storyImageUrl}`}
                  alt="Story"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              Regenerar
            </Button>
            <Link href="/campaigns/new" className="flex-1">
              <Button size="lg" className="w-full">
                Crear campaña
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
