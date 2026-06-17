"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { CopyVariantPicker } from "@/components/CopyVariantPicker";
import { SavedCopiesBrowser } from "@/components/SavedCopiesBrowser";
import { VariantLightbox } from "@/components/VariantLightbox";
import { AdPreviewCard } from "@/components/AdPreviewCard";
import { api, ApiError } from "@/lib/api";
import type {
  AdaptCopyResponse,
  Brand,
  GenerateImageResponse,
  EditImageResponse,
  ImageVariantsResponse,
  Product,
  ReferenceImage,
  SavedCopy,
} from "@/lib/types";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/** "https://www.mumucol.com/x" → "mumucol.com" (best-effort). */
function domainFromUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

const FORMAT_OPTIONS = [
  { key: "feed", label: "Feed (1:1)", size: "1080x1080" },
  { key: "vertical", label: "Vertical (4:5)", size: "1080x1350" },
  { key: "story", label: "Story (9:16)", size: "1080x1920" },
] as const;

type Step = "copy" | "selectVariant" | "image" | "iterate" | "variants";

export default function CustomAdPage() {
  const router = useRouter();

  // Step tracking
  const [step, setStep] = useState<Step>("copy");

  // Copy generation state
  const [copySource, setCopySource] = useState<"new" | "saved">("new");
  const [copyPrompt, setCopyPrompt] = useState("");
  const [targetLang, setTargetLang] = useState("es");
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [copyResult, setCopyResult] = useState<AdaptCopyResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [pickedSavedCopy, setPickedSavedCopy] = useState<SavedCopy | null>(null);

  // Product picker — only products with the 10 questions filled appear.
  const [savedProducts, setSavedProducts] = useState<Product[] | null>(null);
  const [existingProductId, setExistingProductId] = useState("");

  // Reference image picker
  const [savedRefImages, setSavedRefImages] = useState<ReferenceImage[]>([]);
  const [refMode, setRefMode] = useState<"new" | "existing">("new");
  const [existingRefId, setExistingRefId] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [price, setPrice] = useState("");
  const [formats, setFormats] = useState<string[]>(["feed"]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageResult, setImageResult] = useState<GenerateImageResponse | null>(null);

  // Edit state
  const [editInstructions, setEditInstructions] = useState("");
  const [editFormat, setEditFormat] = useState("feed");
  const [editing, setEditing] = useState(false);

  // Variants state
  const [variantCount, setVariantCount] = useState(6);
  const [variantFormat, setVariantFormat] = useState("feed");
  const [generatingFormats, setGeneratingFormats] = useState<Set<string>>(new Set());
  const [imageVariants, setImageVariants] = useState<
    { id: string; imageUrl: string; format: string }[]
  >([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const generatingVariants = generatingFormats.size > 0;

  // Brand header for the ad previews (name + logo).
  const [brand, setBrand] = useState<Brand | null>(null);
  useEffect(() => {
    api
      .get<{ brand: Brand }>("/brand")
      .then((r) => setBrand(r.brand))
      .catch(() => {});
  }, []);

  // Reference image URL (returned after copy generation for use in image gen)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);

  // Load complete products + saved reference images on mount. If the
  // user has no usable products, send them to /products/new.
  useEffect(() => {
    api
      .get<{ products: Product[] }>("/products?onlyComplete=true")
      .then(({ products }) => {
        setSavedProducts(products);
        if (products.length === 0) {
          router.replace("/products/new");
          return;
        }
        setExistingProductId(products[0].id);
      })
      .catch(() => setSavedProducts([]));
    api.get<ReferenceImage[]>("/ads/reference-images").then(setSavedRefImages).catch(() => {});
  }, [router]);

  // ── Copy generation ──

  async function handleGenerateCopy(e: FormEvent) {
    e.preventDefault();
    if (!copyPrompt.trim()) return;

    setCopyError("");
    setCopyLoading(true);
    setCopyResult(null);

    if (!existingProductId) {
      setCopyError("Selecciona un producto antes de generar el copy.");
      setCopyLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("copyPrompt", copyPrompt.trim());
      formData.append("targetLang", targetLang);
      formData.append("productId", existingProductId);

      // Reference image: existing or new
      if (refMode === "existing" && existingRefId) {
        formData.append("referenceImageId", existingRefId);
      } else if (refMode === "new" && referenceImage) {
        formData.append("referenceImage", referenceImage);
      }

      const res = await api.post<AdaptCopyResponse>(
        "/ads/custom/generate-copy",
        formData,
      );

      setCopyResult(res);
      setSelectedVariant(0);

      // Store reference image URL for image generation step
      if (res.referenceImageUrl) {
        setReferenceImageUrl(res.referenceImageUrl);
      }

      setStep("selectVariant");
    } catch (err) {
      if (err instanceof ApiError) setCopyError(err.message);
      else setCopyError("Error al generar el copy.");
    } finally {
      setCopyLoading(false);
    }
  }

  async function handleUseSavedCopy() {
    if (!pickedSavedCopy) return;
    if (!existingProductId) {
      setCopyError("Selecciona un producto antes de usar el copy guardado.");
      return;
    }

    setCopyError("");
    setCopyLoading(true);
    setCopyResult(null);

    try {
      const formData = new FormData();
      formData.append("productId", existingProductId);

      if (refMode === "existing" && existingRefId) {
        formData.append("referenceImageId", existingRefId);
      } else if (refMode === "new" && referenceImage) {
        formData.append("referenceImage", referenceImage);
      }

      const res = await api.post<AdaptCopyResponse>(
        `/ads/saved-copies/${pickedSavedCopy.id}/use`,
        formData,
      );

      setCopyResult(res);
      setSelectedVariant(0);
      if (res.referenceImageUrl) setReferenceImageUrl(res.referenceImageUrl);
      setStep("selectVariant");
    } catch (err) {
      if (err instanceof ApiError) setCopyError(err.message);
      else setCopyError("Error al cargar el copy guardado.");
    } finally {
      setCopyLoading(false);
    }
  }

  // ── Image generation ──

  function toggleFormat(key: string) {
    setFormats((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  }

  function getImageUrl(format: string): string | null {
    if (!imageResult) return null;
    if (format === "feed" && imageResult.feedImageUrl)
      return `${API_HOST}${imageResult.feedImageUrl}`;
    if (format === "vertical" && imageResult.verticalImageUrl)
      return `${API_HOST}${imageResult.verticalImageUrl}`;
    if (format === "story" && imageResult.storyImageUrl)
      return `${API_HOST}${imageResult.storyImageUrl}`;
    return null;
  }

  function getGeneratedFormats(): string[] {
    if (!imageResult) return [];
    const fmts: string[] = [];
    if (imageResult.feedImageUrl) fmts.push("feed");
    if (imageResult.verticalImageUrl) fmts.push("vertical");
    if (imageResult.storyImageUrl) fmts.push("story");
    return fmts;
  }

  async function handleGenerateImage() {
    if (!copyResult || formats.length === 0) return;

    setImageError("");
    setImageLoading(true);
    setImageResult(null);

    try {
      const body: Record<string, unknown> = {
        adaptationId: copyResult.adaptationId,
        variantIndex: selectedVariant,
        formats,
      };
      if (imagePrompt.trim()) body.imagePrompt = imagePrompt.trim();
      if (price.trim()) body.price = price.trim();
      if (referenceImageUrl) body.referenceImageUrl = referenceImageUrl;

      const res = await api.post<GenerateImageResponse>(
        "/ads/custom/generate-image",
        body,
      );
      setImageResult(res);
      setStep("iterate");

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
        if (k?.startsWith("generatedImage_") && k !== "generatedImage_custom") {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));

      // Store for campaign creation
      sessionStorage.setItem("generatedImage_custom", JSON.stringify(res));
    } catch (err) {
      if (err instanceof ApiError) setImageError(err.message);
      else setImageError("Error al generar imágenes.");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleEdit() {
    if (!imageResult || !editInstructions.trim()) return;

    const targets =
      editFormat === "all" ? getGeneratedFormats() : [editFormat];
    if (targets.length === 0) return;

    setEditing(true);
    setImageError("");

    try {
      const results = await Promise.all(
        targets.map((fmt) =>
          api.post<EditImageResponse>("/ads/_/edit-image", {
            generatedImageId: imageResult.generatedImageId,
            format: fmt,
            instructions: editInstructions.trim(),
          }),
        ),
      );

      setImageResult((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        for (const res of results) {
          if (res.format === "feed") updated.feedImageUrl = res.imageUrl;
          if (res.format === "vertical") updated.verticalImageUrl = res.imageUrl;
          if (res.format === "story") updated.storyImageUrl = res.imageUrl;
        }
        sessionStorage.setItem("generatedImage_custom", JSON.stringify(updated));
        return updated;
      });

      setEditInstructions("");
    } catch (err) {
      if (err instanceof ApiError) setImageError(err.message);
      else setImageError("Error al editar la imagen.");
    } finally {
      setEditing(false);
    }
  }

  async function handleGenerateVariants(format: string) {
    if (!imageResult) return;
    if (generatingFormats.has(format)) return;

    setImageError("");
    setGeneratingFormats((prev) => new Set(prev).add(format));

    try {
      const res = await api.post<ImageVariantsResponse>(
        "/ads/_/image-variants",
        {
          generatedImageId: imageResult.generatedImageId,
          format,
          count: variantCount,
        },
      );

      const newVariants = res.variants.map((v) => ({ ...v, format: res.format }));
      setImageVariants((prev) => {
        const others = prev.filter((v) => v.format !== format);
        return [...others, ...newVariants];
      });
      setSelectedVariants((prev) => {
        const next = new Set(prev);
        // Drop previous selections for this format, then auto-select the new ones.
        for (const v of imageVariants) {
          if (v.format === format) next.delete(v.id);
        }
        for (const v of newVariants) next.add(v.id);
        return next;
      });
    } catch (err) {
      if (err instanceof ApiError) setImageError(err.message);
      else setImageError("Error al generar variantes.");
    } finally {
      setGeneratingFormats((prev) => {
        const next = new Set(prev);
        next.delete(format);
        return next;
      });
    }
  }

  async function handleGenerateAllFormats() {
    const formats = getGeneratedFormats();
    await Promise.all(formats.map((f) => handleGenerateVariants(f)));
  }

  function toggleVariantSelection(id: string) {
    setSelectedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleContinueToCampaign() {
    if (imageResult) {
      sessionStorage.setItem(
        "generatedImage_custom",
        JSON.stringify(imageResult),
      );
    }
    if (imageVariants.length > 0) {
      const selectedIds = imageVariants
        .filter((v) => selectedVariants.has(v.id))
        .map((v) => v.id);
      sessionStorage.setItem("imageVariantIds_custom", JSON.stringify(selectedIds));
    }
    router.push("/campaigns/new");
  }

  // ── Shared pickers (used by both "new" and "saved" copy flows) ──

  const productPickerCard = (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Producto a pautar
        </h3>
        <Link
          href="/products/new"
          className="text-xs font-medium text-orange hover:text-orange/80"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {(savedProducts ?? []).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setExistingProductId(p.id)}
            className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
              existingProductId === p.id
                ? "border-orange ring-2 ring-orange/30"
                : "border-sand hover:border-orange/30"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API_HOST}${p.imageUrl}`}
              alt={p.name || "Producto"}
              className="aspect-square w-full object-cover"
            />
            {p.name && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <span className="text-[10px] font-medium text-white line-clamp-1">
                  {p.name}
                </span>
              </div>
            )}
            {existingProductId === p.id && (
              <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[10px] text-white">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </Card>
  );

  const referencePickerCard = (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
        Imagen de referencia (opcional)
      </h3>
      <p className="mt-1 text-xs text-muted">
        Sube una imagen de un anuncio que te guste como inspiración visual.
      </p>

      {savedRefImages.length > 0 && (
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setRefMode("new")}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              refMode === "new"
                ? "border-orange text-orange"
                : "border-sand text-muted hover:border-orange/30"
            }`}
          >
            Subir nueva
          </button>
          <button
            type="button"
            onClick={() => setRefMode("existing")}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              refMode === "existing"
                ? "border-orange text-orange"
                : "border-sand text-muted hover:border-orange/30"
            }`}
          >
            Usar existente
          </button>
        </div>
      )}

      {refMode === "new" ? (
        <div className="mt-3">
          <FileUpload
            label="Imagen de referencia"
            value={referenceImage}
            onChange={setReferenceImage}
            helperText="La IA usará esta imagen como inspiración para el estilo visual."
          />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {savedRefImages.map((ref) => (
            <button
              key={ref.id}
              type="button"
              onClick={() => setExistingRefId(ref.id)}
              className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
                existingRefId === ref.id
                  ? "border-orange ring-2 ring-orange/30"
                  : "border-sand hover:border-orange/30"
              }`}
            >
              <img
                src={`${API_HOST}${ref.imageUrl}`}
                alt={ref.name || "Referencia"}
                className="aspect-square w-full object-cover"
              />
              {existingRefId === ref.id && (
                <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[10px] text-white">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </Card>
  );

  // ── Step indicator ──

  const steps: { key: Step; label: string }[] = [
    { key: "copy", label: "1. Copy" },
    { key: "selectVariant", label: "2. Variante" },
    { key: "image", label: "3. Imagen" },
    { key: "iterate", label: "4. Revisar" },
  ];

  const currentStepIndex = steps.findIndex((s) =>
    step === "variants" ? s.key === "iterate" : s.key === step,
  );

  function goBack() {
    if (step === "variants") {
      setStep("iterate");
      return;
    }
    const idx = steps.findIndex((s) => s.key === step);
    if (idx <= 0) {
      router.push("/ads/search");
    } else {
      setStep(steps[idx - 1].key);
    }
  }

  function jumpToStep(target: Step) {
    const targetIdx = steps.findIndex((s) => s.key === target);
    if (targetIdx === -1 || targetIdx > currentStepIndex) return;
    setStep(target);
  }

  if (savedProducts === null) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        type="button"
        onClick={goBack}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        {step === "copy" ? "← Volver a buscar ads" : "← Paso anterior"}
      </button>

      <h1 className="mt-4 text-2xl font-semibold text-ink">
        Crear anuncio personalizado
      </h1>
      <p className="mt-1 text-sm text-muted">
        Describe lo que necesitas y la IA generará el copy e imágenes para tu
        campaña.
      </p>

      {/* Step indicator */}
      <div className="mt-6 flex gap-2">
        {steps.map((s, i) => {
          const isVisited = i <= currentStepIndex;
          const isClickable = i < currentStepIndex;
          return (
            <button
              type="button"
              key={s.key}
              onClick={() => jumpToStep(s.key)}
              disabled={!isClickable}
              className={`flex-1 rounded-full py-1.5 text-center text-xs font-medium transition-colors ${
                isVisited
                  ? "bg-orange text-white"
                  : "bg-sand-light text-muted"
              } ${isClickable ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── STEP 1: Generate copy ── */}
      {step === "copy" && (
        <>
          <Card className="mt-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCopySource("new")}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  copySource === "new"
                    ? "border-orange text-orange"
                    : "border-sand text-muted hover:border-orange/30"
                }`}
              >
                Generar nuevo
              </button>
              <button
                type="button"
                onClick={() => setCopySource("saved")}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  copySource === "saved"
                    ? "border-orange text-orange"
                    : "border-sand text-muted hover:border-orange/30"
                }`}
              >
                Usar copy guardado
              </button>
            </div>
          </Card>

          {copySource === "saved" && (
            <div className="mt-4 flex flex-col gap-4">
              <Card>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Elige un copy guardado
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Selecciona el copy que quieres reutilizar, luego configura el
                  producto y la imagen de referencia antes de continuar.
                </p>
                <div className="mt-3">
                  <SavedCopiesBrowser
                    productId={existingProductId}
                    products={savedProducts ?? []}
                    onPick={setPickedSavedCopy}
                    pickedId={pickedSavedCopy?.id ?? null}
                  />
                </div>
              </Card>

              {pickedSavedCopy && (
                <>
                  {productPickerCard}

                  {referencePickerCard}

                  {copyError && (
                    <div className="rounded-md border border-error/20 bg-error/10 p-3">
                      <p className="text-sm text-error">{copyError}</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleUseSavedCopy}
                    loading={copyLoading}
                    size="lg"
                    className="w-full"
                  >
                    Usar este copy
                  </Button>

                  {copyLoading && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Spinner size="lg" />
                      <p className="text-sm text-muted">Cargando copy guardado...</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {step === "copy" && copySource === "new" && (
        <form onSubmit={handleGenerateCopy} className="mt-4 flex flex-col gap-4">
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Describe tu anuncio
            </h3>
            <p className="mt-1 text-xs text-muted">
              Cuéntale a la IA qué tipo de anuncio quieres. Sé lo más
              específico posible.
            </p>
            <Textarea
              className="mt-3"
              rows={5}
              placeholder="Ej: Quiero un anuncio para promocionar nuestro nuevo kit de skincare natural. El tono debe ser fresco y juvenil, enfocado en ingredientes orgánicos. Incluir una oferta de lanzamiento del 20% de descuento."
              value={copyPrompt}
              onChange={(e) => setCopyPrompt(e.target.value)}
              required
            />
          </Card>

          {productPickerCard}

          {referencePickerCard}

          <Card>
            <Select
              label="Idioma del anuncio"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              options={[
                { value: "es", label: "Español" },
                { value: "en", label: "Inglés" },
                { value: "pt", label: "Portugués" },
              ]}
            />
          </Card>

          {copyError && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{copyError}</p>
            </div>
          )}

          <Button
            type="submit"
            loading={copyLoading}
            size="lg"
            disabled={!copyPrompt.trim()}
            className="w-full"
          >
            Generar copy
          </Button>

          {copyLoading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Spinner size="lg" />
              <p className="text-sm text-muted">
                Generando copy con IA...
              </p>
            </div>
          )}
        </form>
      )}

      {/* ── STEP 2: Select variant ── */}
      {step === "selectVariant" && copyResult && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Elige una variante de copy
            </h2>
            <p className="text-sm text-muted">
              Selecciona la que mejor represente tu marca.
            </p>
          </div>

          <CopyVariantPicker
            adaptationId={copyResult.adaptationId}
            variants={copyResult.variants}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            productId={copyResult.product?.id ?? null}
            onVariantsChange={(variants) =>
              setCopyResult({ ...copyResult, variants })
            }
          />

          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setCopyResult(null);
                setStep("copy");
              }}
              className="flex-1"
            >
              Regenerar copy
            </Button>
            <Button
              onClick={() => setStep("image")}
              size="lg"
              className="flex-1"
            >
              Continuar con imagen
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Generate image ── */}
      {step === "image" && copyResult && (
        <div className="mt-6 flex flex-col gap-4">
          {/* Show selected copy */}
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Copy seleccionado — Variante {selectedVariant + 1}
            </h3>
            <p className="mt-2 text-base font-semibold text-ink">
              {copyResult.variants[selectedVariant].headline}
            </p>
            <p className="mt-1 text-sm text-charcoal">
              {copyResult.variants[selectedVariant].description}
            </p>
            <Badge variant="orange" className="mt-2">
              {copyResult.variants[selectedVariant].ctaTitle}
            </Badge>
          </Card>

          {/* Reference images: reference + product */}
          {(referenceImageUrl || copyResult.product?.imageUrl) && (
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Imágenes de referencia
              </h3>
              <p className="mt-1 text-xs text-muted">
                La IA usará estas imágenes como base para generar tu creativo.
              </p>
              <div className="mt-3 flex gap-4">
                {referenceImageUrl && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted">Imagen de referencia</span>
                    <img
                      src={`${API_HOST}${referenceImageUrl}`}
                      alt="Referencia"
                      className="h-32 w-32 rounded-lg border border-sand object-cover"
                    />
                  </div>
                )}
                {copyResult.product?.imageUrl && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted">Tu producto</span>
                    <img
                      src={`${API_HOST}${copyResult.product.imageUrl}`}
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
              Dirección creativa de la imagen (opcional)
            </h3>
            <p className="mt-1 text-xs text-muted">
              Describe cómo quieres que se vea tu anuncio. Si lo dejas vacío, la IA usará un estilo limpio y acorde a tu marca.
            </p>
            <Textarea
              className="mt-3"
              rows={4}
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
            />
          </Card>

          {imageError && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{imageError}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setStep("selectVariant")}
              className="flex-1"
            >
              ← Cambiar variante
            </Button>
            <Button
              onClick={handleGenerateImage}
              loading={imageLoading}
              size="lg"
              disabled={formats.length === 0}
              className="flex-1"
            >
              Generar imágenes
            </Button>
          </div>

          {imageLoading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Spinner size="lg" />
              <p className="text-sm text-muted">
                Generando creativos con IA... esto puede tardar un momento.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Iterate (edit + review) ── */}
      {step === "iterate" && imageResult && (
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
            {imageResult.feedImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Feed (1:1)</Badge>
                <img
                  src={`${API_HOST}${imageResult.feedImageUrl}`}
                  alt="Feed"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
            {imageResult.verticalImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Vertical (4:5)</Badge>
                <img
                  src={`${API_HOST}${imageResult.verticalImageUrl}`}
                  alt="Vertical"
                  className="w-full rounded-lg border border-sand"
                />
              </div>
            )}
            {imageResult.storyImageUrl && (
              <div className="flex flex-col gap-2">
                <Badge variant="default">Story (9:16)</Badge>
                <img
                  src={`${API_HOST}${imageResult.storyImageUrl}`}
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
                  options={[
                    { value: "all", label: "Todos los formatos" },
                    ...getGeneratedFormats().map((f) => ({
                      value: f,
                      label:
                        FORMAT_OPTIONS.find((o) => o.key === f)?.label ?? f,
                    })),
                  ]}
                />
              )}
              <Textarea
                placeholder="Ej: Cambia el fondo a un degradado azul oscuro. Haz el texto más grande."
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
                {editFormat === "all"
                  ? `Aplicar cambios a los ${getGeneratedFormats().length} formatos`
                  : "Aplicar cambios"}
              </Button>
            </div>
          </Card>

          {imageError && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{imageError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setImageResult(null);
                setStep("image");
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
            <Button
              onClick={handleContinueToCampaign}
              size="lg"
              className="flex-1"
            >
              Crear campaña
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Variants ── */}
      {step === "variants" && imageResult && (
        <div className="mt-6 flex flex-col gap-6">
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

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Configurar variantes
            </h3>
            <p className="mt-1 text-xs text-muted">
              Genera hasta 10 variantes por formato para A/B testing. Cada variante respeta el tamaño del formato base.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {getGeneratedFormats().length > 1 && (
                <div className="w-48">
                  <Select
                    label="Formato"
                    value={variantFormat}
                    onChange={(e) => setVariantFormat(e.target.value)}
                    options={getGeneratedFormats().map((f) => {
                      const has = imageVariants.some((v) => v.format === f);
                      const label =
                        FORMAT_OPTIONS.find((o) => o.key === f)?.label ?? f;
                      return { value: f, label: has ? `${label} ✓` : label };
                    })}
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
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => handleGenerateVariants(variantFormat)}
                loading={generatingFormats.has(variantFormat)}
                disabled={generatingVariants}
                size="lg"
                className="flex-1"
              >
                {imageVariants.some((v) => v.format === variantFormat)
                  ? "Regenerar"
                  : "Generar"}{" "}
                {variantCount} variante{variantCount > 1 ? "s" : ""} para{" "}
                {FORMAT_OPTIONS.find((o) => o.key === variantFormat)?.label ??
                  variantFormat}
              </Button>
              {getGeneratedFormats().length > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleGenerateAllFormats}
                  loading={generatingVariants}
                  disabled={generatingVariants}
                  size="lg"
                  className="flex-1"
                >
                  Generar para todos los formatos
                </Button>
              )}
            </div>
            {generatingVariants && (
              <p className="mt-3 text-xs text-muted">
                Generando {Array.from(generatingFormats).join(", ")}... esto puede tardar.
              </p>
            )}
          </Card>

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

              {getGeneratedFormats()
                .filter((fmt) => imageVariants.some((v) => v.format === fmt))
                .map((fmt) => {
                  const groupVariants = imageVariants.filter((v) => v.format === fmt);
                  const formatLabel =
                    FORMAT_OPTIONS.find((o) => o.key === fmt)?.label ?? fmt;
                  return (
                    <div key={fmt} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink">
                          {formatLabel}
                        </h3>
                        <Badge>{groupVariants.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {groupVariants.map((v) => {
                          const globalIndex = imageVariants.findIndex(
                            (x) => x.id === v.id,
                          );
                          const labelIndex =
                            groupVariants.findIndex((x) => x.id === v.id) + 1;
                          const copy = copyResult?.variants[selectedVariant];
                          return (
                            <AdPreviewCard
                              key={v.id}
                              imageUrl={`${API_HOST}${v.imageUrl}`}
                              brandName={brand?.name || "Tu marca"}
                              brandLogoUrl={
                                brand?.logoUrl
                                  ? `${API_HOST}${brand.logoUrl}`
                                  : null
                              }
                              primaryText={copy?.description ?? ""}
                              headline={copy?.headline ?? ""}
                              ctaLabel={copy?.ctaTitle ?? "Más información"}
                              domain={domainFromUrl(brand?.websiteUrl)}
                              label={`Variante ${labelIndex} · ${formatLabel}`}
                              selected={selectedVariants.has(v.id)}
                              onToggle={() => toggleVariantSelection(v.id)}
                              onZoom={() => setLightboxIndex(globalIndex)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

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

          {imageError && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{imageError}</p>
            </div>
          )}

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
            <Button
              onClick={handleContinueToCampaign}
              size="lg"
              className="flex-1"
              disabled={imageVariants.length > 0 && selectedVariants.size === 0}
            >
              {selectedVariants.size > 0
                ? `Crear campaña (${selectedVariants.size} anuncio${
                    selectedVariants.size === 1 ? "" : "s"
                  })`
                : "Crear campaña"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
