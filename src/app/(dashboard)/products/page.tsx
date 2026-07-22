"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      const { products } = await api.get<{ products: Product[] }>("/products");
      setProducts(products);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los productos.");
      setProducts([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto? No podrá usarse en futuros anuncios.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  }

  if (products === null) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Mis productos</h1>
          <p className="mt-1 text-sm text-muted">
            Cada producto que quieras pautar debe tener su perfil completo. La IA usa estas
            respuestas para generar mejores anuncios.
          </p>
        </div>
        <Link href="/products/new">
          <Button size="md">+ Nuevo producto</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Icon name="box" size={44} className="text-amber-700" />
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Todavía no tienes productos
              </h2>
              <p className="mt-1 text-sm text-muted">
                Crea tu primer producto y completa las 10 preguntas del diagnóstico para que la
                IA pueda generar anuncios con contexto real.
              </p>
            </div>
            <Link href="/products/new">
              <Button size="lg">Crear mi primer producto</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onDelete={() => handleDelete(p.id)}
              deleting={deletingId === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onDelete,
  deleting,
}: {
  product: Product;
  onDelete: () => void;
  deleting: boolean;
}) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const srcOf = (url: string) =>
    url.startsWith("http") ? url : `${apiBase}${url}`;
  const images = [product.imageUrl, ...(product.extraImageUrls ?? [])].filter(
    Boolean,
  );

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <ImageCarousel
        images={images.map(srcOf)}
        alt={product.name ?? "Producto"}
      />

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink line-clamp-2">
          {product.name ?? "(sin nombre)"}
        </h3>
        {product.isComplete ? (
          <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
            Listo
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
            Incompleto
          </span>
        )}
      </div>

      {!product.isComplete && (
        <p className="text-xs text-muted">
          Faltan preguntas por contestar — no se podrá usar en anuncios hasta completar.
        </p>
      )}

      <div className="mt-auto flex gap-2 border-t border-sand pt-3">
        <Link href={`/products/${product.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full">
            {product.isComplete ? "Editar" : "Completar"}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          loading={deleting}
          className="text-error hover:bg-error/10"
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const safe = Math.min(index, Math.max(0, count - 1));
  const go = (dir: number) =>
    setIndex((i) => (i + dir + count) % count);

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-md bg-sand">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + i}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            i === safe ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink/50 px-2 py-1 text-white opacity-0 transition-opacity hover:bg-ink/70 group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink/50 px-2 py-1 text-white opacity-0 transition-opacity hover:bg-ink/70 group-hover:opacity-100"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Imagen ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === safe ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
