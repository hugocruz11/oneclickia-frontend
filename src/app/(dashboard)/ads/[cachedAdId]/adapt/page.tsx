"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { CopyVariantPicker } from "@/components/CopyVariantPicker";
import { api, ApiError } from "@/lib/api";
import type { CachedAd, AdaptCopyResponse, Product } from "@/lib/types";

export default function AdaptCopyPage() {
  const { cachedAdId } = useParams<{ cachedAdId: string }>();
  const router = useRouter();
  const [ad, setAd] = useState<CachedAd | null>(null);

  // Form state
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [existingProductId, setExistingProductId] = useState("");
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);

  // Result state
  const [result, setResult] = useState<AdaptCopyResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(`ad_${cachedAdId}`);
    if (stored) setAd(JSON.parse(stored));

    // Load saved products
    api
      .get<Product[]>("/ads/products")
      .then((products) => setSavedProducts(products))
      .catch(() => {});
  }, [cachedAdId]);

  async function handleAdapt(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      if (mode === "existing" && existingProductId) {
        formData.append("productId", existingProductId);
      } else if (mode === "new") {
        if (productImage) {
          formData.append("productImage", productImage);
        }
        if (productName.trim()) {
          formData.append("productName", productName.trim());
        }
      }

      const res = await api.post<AdaptCopyResponse>(
        `/ads/${cachedAdId}/adapt-copy`,
        formData,
      );

      setResult(res);
      setSelectedVariant(0);

      // Store adaptation data for generate page
      sessionStorage.setItem(
        `adaptation_${cachedAdId}`,
        JSON.stringify(res),
      );
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al adaptar el copy.");
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    // Save selected variant for generate page
    sessionStorage.setItem(
      `selectedVariant_${cachedAdId}`,
      String(selectedVariant),
    );
    router.push(`/ads/${cachedAdId}/generate`);
  }

  if (!ad) {
    return (
      <Card>
        <p className="text-error">
          No se encontró el anuncio. Vuelve a buscarlo.
        </p>
        <Link href="/ads/search" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">Volver a buscar</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/ads/${cachedAdId}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Volver al anuncio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">Adaptar copy</h1>
      <p className="mt-1 text-sm text-muted">
        Adapta el copy de &quot;{ad.headline || "este anuncio"}&quot; a tu marca.
      </p>

      {!result && (
        <Card className="mt-6">
          <form onSubmit={handleAdapt} className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Producto (opcional)
            </h3>

            {savedProducts.length > 0 && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMode("new")}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    mode === "new"
                      ? "border-orange text-orange"
                      : "border-sand text-muted hover:border-orange/30"
                  }`}
                >
                  Nuevo producto
                </button>
                <button
                  type="button"
                  onClick={() => setMode("existing")}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    mode === "existing"
                      ? "border-orange text-orange"
                      : "border-sand text-muted hover:border-orange/30"
                  }`}
                >
                  Producto existente
                </button>
              </div>
            )}

            {mode === "new" ? (
              <div className="flex flex-col gap-4">
                <Input
                  label="Nombre del producto"
                  placeholder="Ej: Kit Detox 360"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <FileUpload
                  label="Foto del producto"
                  onChange={setProductImage}
                  helperText="La IA usará esta imagen para generar el creativo."
                />
              </div>
            ) : (
              <Select
                label="Seleccionar producto"
                value={existingProductId}
                onChange={(e) => setExistingProductId(e.target.value)}
                placeholder="Elige un producto guardado"
                options={savedProducts.map((p) => ({
                  value: p.id,
                  label: p.name || "Sin nombre",
                }))}
              />
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Generar variantes de copy
            </Button>
          </form>
        </Card>
      )}

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-sm text-muted">
            Gemini está adaptando el copy a tu marca...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-red-50 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Elige una variante
            </h2>
            <p className="text-sm text-muted">
              Selecciona la que mejor represente tu marca.
            </p>
          </div>

          <CopyVariantPicker
            variants={result.variants}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              Regenerar
            </Button>
            <Button onClick={handleContinue} size="lg" className="flex-1">
              Generar imágenes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
