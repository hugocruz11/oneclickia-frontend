"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { VariantLightbox } from "@/components/VariantLightbox";
import { AdPreviewCard } from "@/components/AdPreviewCard";
import { api, ApiError } from "@/lib/api";
import type {
  AdaptCopyResponse,
  Brand,
  CachedAd,
  GenerateImageResponse,
  EditImageResponse,
  ImageVariantsResponse,
} from "@/lib/types";

/** "https://www.mumucol.com/x" → "mumucol.com" (best-effort). */
function domainFromUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const FORMAT_OPTIONS = [
  { key: "feed", label: "Feed (1:1)", size: "1080x1080" },
  { key: "vertical", label: "Vertical (4:5)", size: "1080x1350" },
  { key: "story", label: "Story (9:16)", size: "1080x1920" },
] as const;

type Step = "generate" | "iterate" | "variants";

export default function GenerateImagePage() {
  const { cachedAdId } = useParams<{ cachedAdId: string }>();

  const [adaptation, setAdaptation] = useState<AdaptCopyResponse | null>(null);
  const [ad, setAd] = useState<CachedAd | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [formats, setFormats] = useState<string[]>(["feed"]);
  const [price, setPrice] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateImageResponse | null>(null);

  // Iteration state
  const [step, setStep] = useState<Step>("generate");
  const [editInstructions, setEditInstructions] = useState("");
  const [editFormat, setEditFormat] = useState("story");
  const [editing, setEditing] = useState(false);

  // Variants state
  const [variantCount, setVariantCount] = useState(6);
  const [variantFormat, setVariantFormat] = useState("story");
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [imageVariants, setImageVariants] = useState<{ id: string; imageUrl: string }[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`adaptation_${cachedAdId}`);
    if (stored) setAdaptation(JSON.parse(stored));

    const adStored = sessionStorage.getItem(`ad_${cachedAdId}`);
    if (adStored) setAd(JSON.parse(adStored));

    const variant = sessionStorage.getItem(`selectedVariant_${cachedAdId}`);
    if (variant) setVariantIndex(Number(variant));
  }, [cachedAdId]);

  // Brand header for the ad previews (name + logo).
  useEffect(() => {
    api
      .get<{ brand: Brand }>("/brand")
      .then((r) => setBrand(r.brand))
      .catch(() => {});
  }, []);

  function toggleFormat(key: string) {
    setFormats((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  }

  // Get the current image URL for a format
  function getImageUrl(format: string): string | null {
    if (!result) return null;
    if (format === "feed" && result.feedImageUrl)
      return `${API_HOST}${result.feedImageUrl}`;
    if (format === "vertical" && result.verticalImageUrl)
      return `${API_HOST}${result.verticalImageUrl}`;
    if (format === "story" && result.storyImageUrl)
      return `${API_HOST}${result.storyImageUrl}`;
    return null;
  }

  // Get which formats were generated
  function getGeneratedFormats(): string[] {
    if (!result) return [];
    const fmts: string[] = [];
    if (result.feedImageUrl) fmts.push("feed");
    if (result.verticalImageUrl) fmts.push("vertical");
    if (result.storyImageUrl) fmts.push("story");
    return fmts;
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
      if (price.trim()) body.price = price.trim();
      if (imagePrompt.trim()) body.imagePrompt = imagePrompt.trim();

      const res = await api.post<GenerateImageResponse>(
        `/ads/${cachedAdId}/generate-image`,
        body,
      );
      setResult(res);
      setStep("iterate");

      // Set default edit/variant format to first generated format
      const generated = [];
      if (res.feedImageUrl) generated.push("feed");
      if (res.verticalImageUrl) generated.push("vertical");
      if (res.storyImageUrl) generated.push("story");
      if (generated.length > 0) {
        setEditFormat(generated[0]);
        setVariantFormat(generated[0]);
      }

      // Clear any previous generated image keys to avoid stale data
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith("generatedImage_") && k !== `generatedImage_${cachedAdId}`) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));

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

  async function handleEdit() {
    if (!result || !editInstructions.trim()) return;

    setEditing(true);
    setError("");

    try {
      const res = await api.post<EditImageResponse>(
        `/ads/${cachedAdId}/edit-image`,
        {
          generatedImageId: result.generatedImageId,
          format: editFormat,
          instructions: editInstructions.trim(),
        },
      );

      // Update result with new image URL and sync to sessionStorage
      setResult((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (res.format === "feed") updated.feedImageUrl = res.imageUrl;
        if (res.format === "vertical") updated.verticalImageUrl = res.imageUrl;
        if (res.format === "story") updated.storyImageUrl = res.imageUrl;
        // Sync updated state to sessionStorage
        sessionStorage.setItem(
          `generatedImage_${cachedAdId}`,
          JSON.stringify(updated),
        );
        return updated;
      });

      setEditInstructions("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al editar la imagen.");
    } finally {
      setEditing(false);
    }
  }

  async function handleGenerateVariants() {
    if (!result) return;

    setGeneratingVariants(true);
    setError("");
    setImageVariants([]);
    setSelectedVariants(new Set());

    try {
      const res = await api.post<ImageVariantsResponse>(
        `/ads/${cachedAdId}/image-variants`,
        {
          generatedImageId: result.generatedImageId,
          format: variantFormat,
          count: variantCount,
        },
      );

      setImageVariants(res.variants);
      // Select all by default
      setSelectedVariants(new Set(res.variants.map((_, i) => i)));
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al generar variantes.");
    } finally {
      setGeneratingVariants(false);
    }
  }

  function toggleVariantSelection(index: number) {
    setSelectedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleContinueToCampaign() {
    // Save selected variant for campaign creation
    sessionStorage.setItem(
      `selectedVariant_${cachedAdId}`,
      String(variantIndex),
    );

    // Save variant IDs if any were selected
    if (imageVariants.length > 0) {
      const selectedIds = imageVariants
        .filter((_, i) => selectedVariants.has(i))
        .map((v) => v.id);
      sessionStorage.setItem(
        `imageVariantIds_${cachedAdId}`,
        JSON.stringify(selectedIds),
      );
    }
  }

  if (!adaptation) {
    return (
      <Card>
        <p className="text-error">
          Primero debes adaptar el copy. Vuelve al anuncio.
        </p>
        <Link href={`/ads/${cachedAdId}/adapt`} className="mt-4 inline-block">
          <Button variant="ghost" size="sm">
            Adaptar copy
          </Button>
        </Link>
      </Card>
    );
  }

  const selectedCopyVariant = adaptation.variants[variantIndex];

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
          {selectedCopyVariant.headline}
        </p>
        <p className="mt-1 text-sm text-charcoal">
          {selectedCopyVariant.description}
        </p>
        <Badge variant="orange" className="mt-2">
          {selectedCopyVariant.ctaTitle}
        </Badge>
      </Card>

      {/* STEP 1: Generate initial image */}
      {step === "generate" && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Reference images: ad + product */}
          {(ad?.imageUrl || ad?.thumbnailUrl || adaptation?.product?.imageUrl) && (
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Imágenes de referencia
              </h3>
              <p className="mt-1 text-xs text-muted">
                La IA usará estas imágenes como base para generar tu creativo.
              </p>
              <div className="mt-3 flex gap-4">
                {(ad?.imageUrl || ad?.thumbnailUrl) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted">Ad original</span>
                    <img
                      src={ad.imageUrl || ad.thumbnailUrl!}
                      alt="Ad original"
                      className="h-32 w-32 rounded-lg border border-sand object-cover"
                    />
                  </div>
                )}
                {adaptation?.product?.imageUrl && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted">Tu producto</span>
                    <img
                      src={`${API_HOST}${adaptation.product.imageUrl}`}
                      alt="Producto"
                      className="h-32 w-32 rounded-lg border border-sand object-cover"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Dirección creativa de la imagen
            </h3>
            <p className="mt-1 text-xs text-muted">
              Describe cómo quieres que se vea tu anuncio. Si lo dejas vacío, la
              IA replicará el estilo del ad original.
            </p>
            <Textarea
              className="mt-3"
              rows={3}
              placeholder="Ej: Fondo blanco minimalista con el producto centrado. Luces tipo estudio profesional. Estilo limpio y moderno."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
          </Card>

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
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* STEP 2: Iterate — show images + edit field */}
      {step === "iterate" && result && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Imágenes generadas
            </h2>
            <p className="text-sm text-muted">
              Revisa los creativos. Puedes pedir cambios o generar variantes.
            </p>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.feedImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Feed (1:1)</Badge>
                <img
                  src={`${API_HOST}${result.feedImageUrl}`}
                  alt="Feed"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
            {result.verticalImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Vertical (4:5)</Badge>
                <img
                  src={`${API_HOST}${result.verticalImageUrl}`}
                  alt="Vertical"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
            {result.storyImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Story (9:16)</Badge>
                <img
                  src={`${API_HOST}${result.storyImageUrl}`}
                  alt="Story"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
          </div>

          {/* Edit section */}
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Editar imagen
            </h3>
            <p className="mt-1 text-xs text-muted">
              Describe qué quieres cambiar. La IA editará la imagen manteniendo
              el resto intacto.
            </p>

            <div className="mt-3 flex flex-col gap-3">
              {getGeneratedFormats().length > 1 && (
                <Select
                  label="Formato a editar"
                  value={editFormat}
                  onChange={(e) => setEditFormat(e.target.value)}
                  options={getGeneratedFormats().map((f) => ({
                    value: f,
                    label:
                      FORMAT_OPTIONS.find((o) => o.key === f)?.label ?? f,
                  }))}
                />
              )}
              <Textarea
                placeholder="Ej: Quita las maletas del fondo, deja solo mi producto centrado. Cambia el color del banner a azul oscuro."
                rows={3}
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
              />
              <Button
                onClick={handleEdit}
                loading={editing}
                disabled={!editInstructions.trim()}
                size="sm"
              >
                Aplicar cambios
              </Button>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
                setStep("generate");
              }}
              className="flex-1"
            >
              Regenerar desde cero
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep("variants")}
              className="flex-1"
            >
              Generar variantes
            </Button>
            <Link href="/campaigns/new" className="flex-1" onClick={handleContinueToCampaign}>
              <Button size="lg" className="w-full">
                Crear campaña
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* STEP 3: Variants */}
      {step === "variants" && result && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Show current approved image */}
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Imagen base aprobada
            </h3>
            <div className="mt-3 flex justify-center">
              {getGeneratedFormats().map((fmt) => {
                const url = getImageUrl(fmt);
                if (!url) return null;
                return (
                  <div key={fmt} className="flex flex-col items-center gap-2">
                    <Badge variant="default">
                      {FORMAT_OPTIONS.find((o) => o.key === fmt)?.label ?? fmt}
                    </Badge>
                    <img
                      src={url}
                      alt={fmt}
                      className="max-h-64 rounded-lg border border-sand object-contain"
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Variant config */}
          {imageVariants.length === 0 && (
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Configurar variantes
              </h3>
              <p className="mt-1 text-xs text-muted">
                Genera hasta 10 variantes de tu imagen aprobada para A/B testing
                en tu campaña.
              </p>
              <div className="mt-4 flex gap-4">
                {getGeneratedFormats().length > 1 && (
                  <div className="w-48">
                    <Select
                      label="Formato base"
                      value={variantFormat}
                      onChange={(e) => setVariantFormat(e.target.value)}
                      options={getGeneratedFormats().map((f) => ({
                        value: f,
                        label:
                          FORMAT_OPTIONS.find((o) => o.key === f)?.label ?? f,
                      }))}
                    />
                  </div>
                )}
                <div className="w-32">
                  <Select
                    label="Cantidad"
                    value={String(variantCount)}
                    onChange={(e) => setVariantCount(Number(e.target.value))}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: String(i + 1),
                      label: String(i + 1),
                    }))}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateVariants}
                loading={generatingVariants}
                size="lg"
                className="mt-4 w-full"
              >
                Generar {variantCount} variante{variantCount > 1 ? "s" : ""}
              </Button>
            </Card>
          )}

          {generatingVariants && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Spinner size="lg" />
              <p className="text-sm text-muted">
                Generando {variantCount} variantes... esto puede tardar.
              </p>
            </div>
          )}

          {/* Variant grid */}
          {imageVariants.length > 0 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Variantes generadas
                </h2>
                <p className="text-sm text-muted">
                  Selecciona las que quieres usar. Cada imagen seleccionada se
                  convierte en un anuncio independiente dentro de tu campaña.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {imageVariants.map((v, i) => (
                  <AdPreviewCard
                    key={v.id}
                    imageUrl={`${API_HOST}${v.imageUrl}`}
                    brandName={brand?.name || "Tu marca"}
                    brandLogoUrl={
                      brand?.logoUrl ? `${API_HOST}${brand.logoUrl}` : null
                    }
                    primaryText={selectedCopyVariant.description}
                    headline={selectedCopyVariant.headline}
                    ctaLabel={selectedCopyVariant.ctaTitle}
                    domain={domainFromUrl(brand?.websiteUrl)}
                    label={`Variante ${i + 1}`}
                    selected={selectedVariants.has(i)}
                    onToggle={() => toggleVariantSelection(i)}
                    onZoom={() => setLightboxIndex(i)}
                  />
                ))}
              </div>

              <div className="rounded-lg border border-orange/20 bg-orange/5 p-3">
                <p className="text-sm text-charcoal">
                  {selectedVariants.size > 0 ? (
                    <>
                      <span className="font-semibold text-ink">
                        Se crearán {selectedVariants.size} anuncio
                        {selectedVariants.size === 1 ? "" : "s"}
                      </span>{" "}
                      — uno por cada imagen seleccionada ({selectedVariants.size}{" "}
                      de {imageVariants.length}).
                    </>
                  ) : (
                    <>
                      Selecciona al menos una imagen. Se creará un anuncio por
                      cada una.
                    </>
                  )}
                </p>
              </div>

              {lightboxIndex !== null && imageVariants[lightboxIndex] && (
                <VariantLightbox
                  imageUrl={`${API_HOST}${imageVariants[lightboxIndex].imageUrl}`}
                  label={`Variante ${lightboxIndex + 1}`}
                  onClose={() => setLightboxIndex(null)}
                  onPrev={
                    lightboxIndex > 0
                      ? () => setLightboxIndex(lightboxIndex - 1)
                      : undefined
                  }
                  onNext={
                    lightboxIndex < imageVariants.length - 1
                      ? () => setLightboxIndex(lightboxIndex + 1)
                      : undefined
                  }
                />
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setImageVariants([]);
                setSelectedVariants(new Set());
                setStep("iterate");
              }}
              className="flex-1"
            >
              ← Volver a editar
            </Button>
            {imageVariants.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setImageVariants([]);
                  setSelectedVariants(new Set());
                }}
                className="flex-1"
              >
                Regenerar variantes
              </Button>
            )}
            <Link href="/campaigns/new" className="flex-1" onClick={handleContinueToCampaign}>
              <Button
                size="lg"
                className="w-full"
                disabled={imageVariants.length > 0 && selectedVariants.size === 0}
              >
                {selectedVariants.size > 0
                  ? `Crear campaña (${selectedVariants.size} anuncio${
                      selectedVariants.size === 1 ? "" : "s"
                    })`
                  : "Crear campaña"}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
