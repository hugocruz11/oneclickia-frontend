"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface ShopifyStatus {
  connected: boolean;
  shop?: string;
  scope?: string | null;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  featuredImageUrl: string | null;
  minPrice: string;
  currencyCode: string;
}

export default function ShopifyPage() {
  const [status, setStatus] = useState<ShopifyStatus | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [shopInput, setShopInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<"connected" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") setBanner("connected");
    const cbError = params.get("error");
    if (cbError) setError(cbError);
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const res = await api.get<ShopifyStatus>("/connections/shopify/status");
      setStatus(res);
      if (res.connected) void loadProducts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar el estado.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const res = await api.get<ShopifyProduct[]>("/connections/shopify/products");
      setProducts(res);
    } catch {
      // Non-fatal: status still shows connected; products may load later.
    }
  }

  async function handleConnect() {
    if (!shopInput.trim()) {
      setError("Escribe el dominio de tu tienda (tutienda.myshopify.com).");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      const res = await api.get<{ authorizationUrl: string }>(
        `/connections/shopify/initiate?shop=${encodeURIComponent(shopInput.trim())}`,
      );
      window.location.href = res.authorizationUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al iniciar la conexión.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setError("");
    try {
      await api.delete("/connections/shopify");
      setStatus({ connected: false });
      setProducts([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al desconectar.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Tienda Shopify</h1>
      <p className="mt-1 text-sm text-muted">
        Conecta tu tienda para crear landing pages por avatar bajo tu propio
        dominio y enlazarlas a tus productos.
      </p>

      {banner === "connected" && (
        <div className="mt-4 rounded-md border border-success/20 bg-success/10 p-3">
          <p className="text-sm text-success-text">¡Tienda Shopify conectada!</p>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <Card className="mt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ink">Conexión</h2>
              <Badge variant={status?.connected ? "success" : "muted"}>
                {status?.connected ? "Conectada" : "Desconectada"}
              </Badge>
            </div>

            {status?.connected ? (
              <p className="mt-3 text-sm text-charcoal">
                <span className="font-medium text-ink">Tienda:</span>{" "}
                {status.shop}
              </p>
            ) : (
              <div className="mt-4">
                <label className="text-xs font-medium text-charcoal">
                  Dominio de tu tienda
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none"
                  placeholder="tutienda.myshopify.com"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="ml-4">
            {status?.connected ? (
              <Button
                variant="ghost"
                onClick={handleDisconnect}
                loading={disconnecting}
                size="sm"
              >
                Desconectar
              </Button>
            ) : (
              <Button onClick={handleConnect} loading={connecting}>
                Conectar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {status?.connected && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold text-ink">
            Productos ({products.length})
          </h3>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No se encontraron productos (o aún cargando).
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-sand">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2">
                  {p.featuredImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.featuredImageUrl}
                      alt={p.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-sand" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{p.title}</p>
                    <p className="text-xs text-muted">
                      {p.minPrice} {p.currencyCode}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
