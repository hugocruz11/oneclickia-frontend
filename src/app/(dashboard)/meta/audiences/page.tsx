"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type {
  MetaAdAccount,
  MetaCustomAudience,
  AudienceUploadResult,
} from "@/lib/types";

type CustomerFileSource =
  | "USER_PROVIDED_ONLY"
  | "PARTNER_PROVIDED_ONLY"
  | "BOTH_USER_AND_PARTNER_PROVIDED";

function formatSize(a?: number, b?: number): string {
  if (!a && !b) return "—";
  if (a && b) return `${a.toLocaleString()}–${b.toLocaleString()}`;
  return (a || b)!.toLocaleString();
}

function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString();
}

export default function AudiencesPage() {
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [adAccountId, setAdAccountId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [audiences, setAudiences] = useState<MetaCustomAudience[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSource, setNewSource] = useState<CustomerFileSource>(
    "USER_PROVIDED_ONLY",
  );

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<
    (AudienceUploadResult & { audienceId: string }) | null
  >(null);

  useEffect(() => {
    api
      .get<{ adAccounts: MetaAdAccount[] }>("/connections/meta/ad-accounts")
      .then(({ adAccounts }) => {
        setAdAccounts(adAccounts);
        if (adAccounts.length > 0) setAdAccountId(adAccounts[0].id);
      })
      .catch(() =>
        setError(
          "No se pudo leer tus ad accounts. Asegurate de tener Meta conectado.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!adAccountId) return;
    setLoadingAudiences(true);
    setError("");
    api
      .get<{ audiences: MetaCustomAudience[] }>(
        `/connections/meta/ad-accounts/${adAccountId}/custom-audiences`,
      )
      .then(({ audiences }) => setAudiences(audiences))
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("No se pudieron cargar los públicos.");
      })
      .finally(() => setLoadingAudiences(false));
  }, [adAccountId]);

  async function handleCreate() {
    if (!newName.trim() || !adAccountId) return;
    setCreating(true);
    setError("");
    try {
      await api.post(
        `/connections/meta/ad-accounts/${adAccountId}/custom-audiences`,
        {
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          customerFileSource: newSource,
        },
      );
      setNewName("");
      setNewDescription("");
      setShowCreate(false);
      await refreshAudiences();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No se pudo crear el público.");
    } finally {
      setCreating(false);
    }
  }

  async function refreshAudiences() {
    if (!adAccountId) return;
    const { audiences } = await api.get<{ audiences: MetaCustomAudience[] }>(
      `/connections/meta/ad-accounts/${adAccountId}/custom-audiences`,
    );
    setAudiences(audiences);
  }

  async function handleFile(
    e: ChangeEvent<HTMLInputElement>,
    audienceId: string,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingId(audienceId);
    setError("");
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("csv", file);
      const result = await api.post<AudienceUploadResult>(
        `/connections/meta/custom-audiences/${audienceId}/users`,
        formData,
      );
      setUploadResult({ ...result, audienceId });
      // Meta takes minutes to update counts; just refresh list to show the row moved/exists
      await refreshAudiences();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No se pudo subir el archivo.");
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este público? Esta acción es irreversible en Meta.")) {
      return;
    }
    try {
      await api.delete(`/connections/meta/custom-audiences/${id}`);
      setAudiences((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No se pudo eliminar.");
    }
  }

  const sortedAudiences = useMemo(
    () =>
      [...audiences].sort((a, b) => (b.time_updated ?? 0) - (a.time_updated ?? 0)),
    [audiences],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Públicos personalizados</h1>
      <p className="mt-1 text-sm text-muted">
        Crea públicos en Meta subiendo un CSV con correos de tus clientes. Los
        datos se hashean (SHA-256) antes de enviarse.
      </p>

      {adAccounts.length === 0 && (
        <Card className="mt-6">
          <p className="text-sm text-muted">
            No hay cuentas publicitarias de Meta conectadas. Conectá Meta
            primero desde la sección Meta Ads.
          </p>
        </Card>
      )}

      {adAccounts.length > 0 && (
        <Card className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:w-80">
              <Select
                label="Cuenta publicitaria"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                options={adAccounts.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${a.currency})`,
                }))}
              />
            </div>
            <Button onClick={() => setShowCreate((s) => !s)}>
              {showCreate ? "Cancelar" : "+ Crear público"}
            </Button>
          </div>

          {showCreate && (
            <div className="mt-4 flex flex-col gap-3 rounded-md border border-sand bg-sand-light p-4">
              <Input
                label="Nombre del público"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Clientes VIP Q1 2026"
              />
              <Textarea
                label="Descripción (opcional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
              <Select
                label="Origen de los datos"
                value={newSource}
                onChange={(e) =>
                  setNewSource(e.target.value as CustomerFileSource)
                }
                options={[
                  {
                    value: "USER_PROVIDED_ONLY",
                    label: "Datos recolectados directo del cliente",
                  },
                  {
                    value: "PARTNER_PROVIDED_ONLY",
                    label: "Datos de un partner / agencia",
                  },
                  {
                    value: "BOTH_USER_AND_PARTNER_PROVIDED",
                    label: "Ambos",
                  },
                ]}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreate}
                  loading={creating}
                  disabled={!newName.trim()}
                >
                  Crear
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {uploadResult && (
        <div className="mt-4 rounded-md border border-success/20 bg-success/10 p-3 text-sm">
          <p className="font-semibold text-ink">
            Subida enviada a Meta ({uploadResult.uploaded} correos).
          </p>
          <p className="mt-1 text-muted">
            Total leídos: {uploadResult.total} · Inválidos:{" "}
            {uploadResult.invalid} · Duplicados: {uploadResult.duplicates}.
            Meta tarda unos minutos en actualizar el tamaño.
          </p>
        </div>
      )}

      {loadingAudiences ? (
        <div className="mt-6 flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : sortedAudiences.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-3xl">🎯</p>
          <p className="mt-2 text-sm font-medium text-ink">
            Aún no hay públicos en esta cuenta.
          </p>
          <p className="mt-1 text-sm text-muted">
            Creá el primero con el botón de arriba.
          </p>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {sortedAudiences.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-ink">{a.name}</h3>
                    <Badge variant="muted">{a.subtype}</Badge>
                    {a.operation_status?.code === 471 && (
                      <Badge variant="default">Restringido</Badge>
                    )}
                  </div>
                  {a.description && (
                    <p className="mt-1 text-sm text-charcoal">{a.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span>
                      Tamaño aprox:{" "}
                      {formatSize(
                        a.approximate_count_lower_bound,
                        a.approximate_count_upper_bound,
                      )}
                    </span>
                    <span>Actualizado: {formatDate(a.time_updated)}</span>
                    <span className="font-mono">{a.id}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {a.subtype === "CUSTOM" && (
                    <label className="inline-flex cursor-pointer items-center rounded-md border border-sand px-3 py-1.5 text-xs font-medium text-ink hover:border-orange">
                      {uploadingId === a.id ? "Subiendo..." : "Subir CSV"}
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        disabled={uploadingId === a.id}
                        onChange={(e) => handleFile(e, a.id)}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="rounded-md border border-sand px-3 py-1.5 text-xs font-medium text-muted hover:border-error hover:text-error"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
