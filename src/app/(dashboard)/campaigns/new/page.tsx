"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { InterestAutocomplete } from "@/components/InterestAutocomplete";
import { CountryPicker } from "@/components/CountryPicker";
import { api, ApiError } from "@/lib/api";
import type {
  CampaignDefaults,
  Campaign,
  MetaAdAccount,
  MetaPage,
  GenerateImageResponse,
} from "@/lib/types";

const OBJECTIVES = [
  { value: "OUTCOME_TRAFFIC", label: "Tráfico" },
  { value: "OUTCOME_ENGAGEMENT", label: "Interacción" },
  { value: "OUTCOME_LEADS", label: "Clientes potenciales" },
  { value: "OUTCOME_SALES", label: "Ventas" },
  { value: "OUTCOME_AWARENESS", label: "Reconocimiento" },
];

export default function NewCampaignPage() {
  const router = useRouter();

  // Loading states
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingPages, setLoadingPages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Meta resources
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [pages, setPages] = useState<MetaPage[]>([]);

  // Form fields
  const [adAccountId, setAdAccountId] = useState("");
  const [pageId, setPageId] = useState("");
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC");
  const [budgetType, setBudgetType] = useState("DAILY");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [genders, setGenders] = useState<number[]>([0]);
  const [interests, setInterests] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Generated image data from session
  const [generatedImageId, setGeneratedImageId] = useState("");
  const [variantIndex, setVariantIndex] = useState(0);
  const [noImage, setNoImage] = useState(false);

  useEffect(() => {
    // Find the generated image from session storage
    let foundImage = false;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("generatedImage_")) {
        const data = JSON.parse(
          sessionStorage.getItem(key)!,
        ) as GenerateImageResponse;
        setGeneratedImageId(data.generatedImageId);
        setVariantIndex(data.variantIndex);
        foundImage = true;

        // Get variant index from session
        const cachedAdId = key.replace("generatedImage_", "");
        const savedVariant = sessionStorage.getItem(
          `selectedVariant_${cachedAdId}`,
        );
        if (savedVariant) setVariantIndex(Number(savedVariant));
        break;
      }
    }
    if (!foundImage) setNoImage(true);

    // Set default start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split("T")[0]);

    // Load defaults, ad accounts, and pages in parallel
    api
      .get<CampaignDefaults>("/campaigns/defaults")
      .then((defaults) => {
        if (defaults.adAccountId) setAdAccountId(defaults.adAccountId);
        if (defaults.pageId) setPageId(defaults.pageId);
        if (defaults.objective) setObjective(defaults.objective);
        if (defaults.budgetType) setBudgetType(defaults.budgetType);
        if (defaults.budgetAmount)
          setBudgetAmount(String(defaults.budgetAmount / 100));
        if (defaults.destinationUrl)
          setDestinationUrl(defaults.destinationUrl);
        if (defaults.targetCountries?.length)
          setTargetCountries(defaults.targetCountries);
        if (defaults.ageMin) setAgeMin(defaults.ageMin);
        if (defaults.ageMax) setAgeMax(defaults.ageMax);
        if (defaults.genders?.length) setGenders(defaults.genders);
        if (defaults.interests?.length) setInterests(defaults.interests);
      })
      .catch(() => {})
      .finally(() => setLoadingDefaults(false));

    api
      .get<{ adAccounts: MetaAdAccount[] }>("/connections/meta/ad-accounts")
      .then((res) => {
        setAdAccounts(res.adAccounts);
        if (res.adAccounts.length === 1 && !adAccountId) {
          setAdAccountId(res.adAccounts[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAccounts(false));

    api
      .get<{ pages: MetaPage[] }>("/connections/meta/pages")
      .then((res) => {
        setPages(res.pages);
        if (res.pages.length === 1 && !pageId) {
          setPageId(res.pages[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPages(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        generatedImageId,
        variantIndex,
        adAccountId,
        pageId,
        objective,
        budgetType,
        budgetAmount: Math.round(Number(budgetAmount) * 100),
        startDate,
        targetCountries,
        ageMin,
        ageMax,
        genders,
      };

      if (endDate) body.endDate = endDate;
      if (destinationUrl.trim()) body.destinationUrl = destinationUrl.trim();
      if (interests.length > 0) body.interests = interests;

      const campaign = await api.post<Campaign>("/campaigns/draft", body);
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al crear la campaña.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLoading = loadingDefaults || loadingAccounts || loadingPages;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (noImage) {
    return (
      <Card className="max-w-lg">
        <p className="text-error">
          Primero debes generar una imagen para crear una campaña.
        </p>
        <Link href="/ads/search" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">
            Buscar Ads
          </Button>
        </Link>
      </Card>
    );
  }

  if (adAccounts.length === 0 || pages.length === 0) {
    return (
      <Card className="max-w-lg">
        <p className="text-error">
          Necesitas conectar tu cuenta de Meta y tener al menos una cuenta
          publicitaria y una página para crear campañas.
        </p>
        <Link href="/meta" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">
            Conectar Meta
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/campaigns"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Volver a campañas
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">Nueva campaña</h1>
      <p className="mt-1 text-sm text-muted">
        Configura los detalles de tu campaña publicitaria.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-red-50 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        {/* Meta Resources */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Cuenta y página
          </h3>
          <div className="mt-4 flex flex-col gap-4">
            <Select
              label="Cuenta publicitaria"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              placeholder="Selecciona una cuenta"
              options={adAccounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${a.currency})`,
              }))}
              required
            />
            <Select
              label="Página de Facebook"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="Selecciona una página"
              options={pages.map((p) => ({
                value: p.id,
                label: `${p.name} — ${p.category}`,
              }))}
              required
            />
          </div>
        </Card>

        {/* Objective & Budget */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Objetivo y presupuesto
          </h3>
          <div className="mt-4 flex flex-col gap-4">
            <Select
              label="Objetivo"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              options={OBJECTIVES}
            />
            <div className="flex gap-4">
              <div className="w-40">
                <Select
                  label="Tipo de presupuesto"
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                  options={[
                    { value: "DAILY", label: "Diario" },
                    { value: "LIFETIME", label: "Total" },
                  ]}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Monto (moneda local)"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ej: 10"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <Input
              label="URL de destino"
              type="url"
              placeholder="https://tu-sitio.com"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              helperText="Deja vacío para usar la URL de tu marca."
            />
          </div>
        </Card>

        {/* Schedule */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Duración
          </h3>
          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <Input
                label="Fecha de inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                label={`Fecha de fin${budgetType === "LIFETIME" ? " (requerida)" : " (opcional)"}`}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required={budgetType === "LIFETIME"}
              />
            </div>
          </div>
        </Card>

        {/* Targeting */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Segmentación
          </h3>
          <div className="mt-4 flex flex-col gap-4">
            <CountryPicker
              selected={targetCountries}
              onChange={setTargetCountries}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label="Edad mínima"
                  type="number"
                  min="18"
                  max="65"
                  value={String(ageMin)}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Edad máxima"
                  type="number"
                  min="18"
                  max="65"
                  value={String(ageMax)}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                />
              </div>
            </div>

            <Select
              label="Género"
              value={String(genders[0])}
              onChange={(e) => setGenders([Number(e.target.value)])}
              options={[
                { value: "0", label: "Todos" },
                { value: "1", label: "Hombre" },
                { value: "2", label: "Mujer" },
              ]}
            />

            <InterestAutocomplete
              selected={interests}
              onChange={setInterests}
            />
          </div>
        </Card>

        <Button
          type="submit"
          loading={submitting}
          size="lg"
          className="w-full"
          disabled={
            !adAccountId ||
            !pageId ||
            !budgetAmount ||
            targetCountries.length === 0
          }
        >
          Crear borrador de campaña
        </Button>
      </form>
    </div>
  );
}
