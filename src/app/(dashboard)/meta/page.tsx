"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface MetaStatus {
  connected: boolean;
  externalUserId?: string;
  accountData?: { name: string; email: string | null };
  expiresAt?: string | null;
}

export default function MetaPage() {
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const res = await api.get<MetaStatus>("/connections/meta/status");
      setStatus(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al cargar el estado de Meta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      const res = await api.get<{ authorizationUrl: string }>(
        "/connections/meta/initiate",
      );
      window.location.href = res.authorizationUrl;
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al iniciar la conexión con Meta.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setError("");
    try {
      await api.delete("/connections/meta");
      setStatus({ connected: false });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al desconectar Meta.");
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
      <h1 className="text-2xl font-semibold text-ink">Meta Ads</h1>
      <p className="mt-1 text-sm text-muted">
        Conecta tu cuenta de Meta para publicar campañas publicitarias.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <Card className="mt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ink">
                Cuenta de Meta
              </h2>
              <Badge variant={status?.connected ? "success" : "muted"}>
                {status?.connected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            {status?.connected && status.accountData && (
              <div className="mt-3 flex flex-col gap-1">
                <p className="text-sm text-charcoal">
                  <span className="font-medium text-ink">Nombre:</span>{" "}
                  {status.accountData.name}
                </p>
                {status.accountData.email && (
                  <p className="text-sm text-charcoal">
                    <span className="font-medium text-ink">Email:</span>{" "}
                    {status.accountData.email}
                  </p>
                )}
                <p className="text-sm text-charcoal">
                  <span className="font-medium text-ink">ID:</span>{" "}
                  {status.externalUserId}
                </p>
              </div>
            )}
          </div>

          <div>
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
              <Button
                onClick={handleConnect}
                loading={connecting}
              >
                Conectar Meta
              </Button>
            )}
          </div>
        </div>
      </Card>

      {!status?.connected && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold text-ink">
            ¿Por qué conectar Meta?
          </h3>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-charcoal">
            <li>Publica campañas directamente desde OneClickIA</li>
            <li>Gestiona tus anuncios sin salir de la plataforma</li>
            <li>Activa y pausa campañas con un solo clic</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
