"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CountryPicker } from "@/components/CountryPicker";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { InterestAutocomplete } from "@/components/InterestAutocomplete";
import { CustomAudiencePicker } from "@/components/CustomAudiencePicker";
import { api, ApiError } from "@/lib/api";
import { OBJECTIVE_LABELS } from "@/lib/labels";
import type { Campaign } from "@/lib/types";
import { useI18n } from "@/contexts/I18nContext";

// Los textos en español son también sus claves de traducción (ver src/i18n).
const OBJECTIVE_OPTIONS = Object.entries(OBJECTIVE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const CTA_OPTIONS = [
  { value: "LEARN_MORE", label: "Más información" },
  { value: "BUY_NOW", label: "Comprar ahora" },
  { value: "SHOP_NOW", label: "Comprar" },
  { value: "SIGN_UP", label: "Registrarse" },
  { value: "SUBSCRIBE", label: "Suscribirse" },
  { value: "DOWNLOAD", label: "Descargar" },
  { value: "ORDER_NOW", label: "Pedir ahora" },
  { value: "CONTACT_US", label: "Contactar" },
  { value: "GET_OFFER", label: "Obtener oferta" },
  { value: "BOOK_TRAVEL", label: "Reservar" },
];

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function gendersToValue(genders: number[]): string {
  if (!genders || genders.includes(0) || genders.length === 0) return "all";
  if (genders.includes(1)) return "male";
  return "female";
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, localeTag } = useI18n();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [ctaType, setCtaType] = useState("LEARN_MORE");
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC");
  const [budgetType, setBudgetType] = useState("DAILY");
  // String para permitir borrar todo el campo (sin un 0 fijo) y evitar ceros
  // a la izquierda; se muestra formateado con separador de miles.
  const [budgetAmount, setBudgetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<{ key: string; name: string }[]>([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("all");
  const [interests, setInterests] = useState<{ id: string; name: string }[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<Campaign>(`/campaigns/${id}`)
      .then((c) => {
        setCampaign(c);
        setHeadline(c.headline);
        setDescription(c.description);
        setDestinationUrl(c.destinationUrl);
        setCtaType(c.ctaType || "LEARN_MORE");
        setObjective(c.objective);
        setBudgetType(c.budgetType);
        setBudgetAmount(String(c.budgetAmount ?? ""));
        setStartDate(toDateInput(c.startDate));
        setEndDate(toDateInput(c.endDate));
        setCountries(c.targetCountries || []);
        setCities(Array.isArray(c.targetCities) ? c.targetCities : []);
        setAgeMin(c.ageMin);
        setAgeMax(c.ageMax);
        setGender(gendersToValue(c.genders));
        setInterests(Array.isArray(c.interests) ? c.interests : []);
        setAudiences(c.customAudienceIds || []);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Error al cargar la campaña.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Monto: solo dígitos, mostrado con separador de miles; vacío permitido.
  function formatBudgetDisplay(value: string): string {
    const num = value.replace(/\D/g, "");
    return num ? Number(num).toLocaleString(localeTag) : "";
  }
  function handleBudgetChange(raw: string) {
    setBudgetAmount(raw.replace(/\D/g, ""));
  }

  // Una vez en Meta, el objetivo no se puede cambiar.
  const isPublished = !!campaign?.metaCampaignId;
  const isLive =
    campaign?.status === "ACTIVE" || campaign?.status === "PAUSED";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const genders =
      gender === "all" ? [0] : gender === "male" ? [1] : [2];
    try {
      await api.patch<Campaign>(`/campaigns/${id}`, {
        headline,
        description,
        destinationUrl,
        ctaType,
        ...(isPublished ? {} : { objective }),
        budgetType,
        budgetAmount: Number(budgetAmount),
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        targetCountries: countries,
        targetCities: cities,
        ageMin,
        ageMax,
        genders,
        interests,
        customAudienceIds: audiences,
      });
      router.push(`/campaigns/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <p className="text-error">{t(error || "No se encontró la campaña.")}</p>
        <Link href="/campaigns" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">{t("Volver a campañas")}</Button>
        </Link>
      </Card>
    );
  }

  if (campaign.status === "PUBLISHING") {
    return (
      <Card>
        <p className="text-charcoal">
          {t(
            "No se puede editar mientras la campaña se está publicando. Espera a que termine.",
          )}
        </p>
        <Link href={`/campaigns/${id}`} className="mt-4 inline-block">
          <Button variant="ghost" size="sm">{t("Volver a la campaña")}</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/campaigns/${id}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        {t("← Volver a la campaña")}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">
        {t("Editar campaña")}
      </h1>

      {isLive && (
        <div className="mt-4 rounded-md border border-warning/20 bg-warning/10 p-3">
          <p className="text-sm text-warning">
            {t(
              "Esta campaña está publicada en Meta. Los cambios de presupuesto, segmentación y copy se sincronizan con Meta al guardar. El objetivo no se puede cambiar.",
            )}
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{t(error)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* Copy */}
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("Copy del anuncio")}
          </h2>
          <div className="mt-3 flex flex-col gap-4">
            <Input
              label={t("Titular")}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
            />
            <Textarea
              label={t("Descripción")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              label={t("URL de destino")}
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              required
            />
            <Select
              label={t("Botón (CTA)")}
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value)}
              options={CTA_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
            />
          </div>
        </Card>

        {/* Objective & budget */}
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("Objetivo y presupuesto")}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label={t("Objetivo")}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              options={OBJECTIVE_OPTIONS.map((o) => ({
                ...o,
                label: t(o.label),
              }))}
              disabled={isPublished}
            />
            <Select
              label={t("Tipo de presupuesto")}
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
              options={[
                { value: "DAILY", label: t("Diario") },
                { value: "LIFETIME", label: t("Total") },
              ]}
            />
            <Input
              label={t("Monto ({currency})", { currency: campaign.currency })}
              type="text"
              inputMode="numeric"
              placeholder={t("Ej: 5.000")}
              value={formatBudgetDisplay(budgetAmount)}
              onChange={(e) => handleBudgetChange(e.target.value)}
              required
            />
          </div>
          {isPublished && (
            <p className="mt-2 text-xs text-muted">
              {t("El objetivo no se puede cambiar en una campaña ya publicada.")}
            </p>
          )}
        </Card>

        {/* Schedule */}
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("Fechas")}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("Inicio")}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label={t("Fin (opcional)")}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </Card>

        {/* Targeting */}
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("Segmentación")}
          </h2>
          <div className="mt-3 flex flex-col gap-4">
            <CountryPicker selected={countries} onChange={setCountries} />
            <CityAutocomplete selected={cities} onChange={setCities} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Input
                label={t("Edad mín.")}
                type="number"
                min={18}
                max={65}
                value={ageMin}
                onChange={(e) => setAgeMin(Number(e.target.value))}
              />
              <Input
                label={t("Edad máx.")}
                type="number"
                min={18}
                max={65}
                value={ageMax}
                onChange={(e) => setAgeMax(Number(e.target.value))}
              />
              <Select
                label={t("Género")}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { value: "all", label: t("Todos") },
                  { value: "male", label: t("Hombres") },
                  { value: "female", label: t("Mujeres") },
                ]}
              />
            </div>
            <InterestAutocomplete selected={interests} onChange={setInterests} />
            <CustomAudiencePicker
              adAccountId={campaign.adAccountId}
              selected={audiences}
              onChange={setAudiences}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={saving} size="lg" className="flex-1">
            {t("Guardar cambios")}
          </Button>
          <Link href={`/campaigns/${id}`}>
            <Button type="button" variant="ghost" size="lg">
              {t("Cancelar")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
