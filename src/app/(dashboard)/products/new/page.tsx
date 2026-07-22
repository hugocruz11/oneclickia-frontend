"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MultiFileUpload } from "@/components/ui/MultiFileUpload";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("El nombre del producto es obligatorio.");
    if (!images.length)
      return setError("Sube al menos una imagen del producto.");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      images.forEach((img) => formData.append("images", img));
      const { product } = await api.post<{ product: Product }>(
        "/products",
        formData,
      );
      // Pasos 2-5 viven en /products/[id]. La página resume el wizard
      // en el primer paso con campos vacíos.
      router.replace(`/products/${product.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el producto.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/products"
        className="text-xs text-muted hover:text-orange"
      >
        ← Volver a productos
      </Link>

      <Card padding="lg" className="mt-4">
        <h1 className="text-xl font-semibold text-ink">Nuevo producto</h1>
        <p className="mt-2 text-sm text-muted">
          Empecemos con lo esencial: el nombre y hasta 3 imágenes. Después podrás completar las
          10 preguntas que la IA usa para generar anuncios con contexto real.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Input
            label="Nombre del producto *"
            placeholder="Ej: Jeans tiro alto MUMU"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <MultiFileUpload
            label="Imágenes del producto *"
            value={images}
            onChange={setImages}
            max={3}
            helperText="Se usan como referencia en cada anuncio generado con IA."
          />

          {error && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-sand pt-5">
            <Button type="submit" size="md" loading={saving}>
              Continuar al diagnóstico →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
