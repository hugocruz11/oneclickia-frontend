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
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { CustomAudiencePicker } from "@/components/CustomAudiencePicker";
import { api, ApiError } from "@/lib/api";
import { landingsApi } from "@/lib/landings";
import type {
  CampaignDefaults,
  Campaign,
  MetaAdAccount,
  MetaPage,
  GenerateImageResponse,
} from "@/lib/types";

const OBJECTIVES = [
  { value: "OUTCOME_AWARENESS", label: "Reconocimiento" },
  { value: "OUTCOME_TRAFFIC", label: "Tráfico" },
  { value: "OUTCOME_ENGAGEMENT", label: "Interacción" },
  { value: "OUTCOME_LEADS", label: "Clientes potenciales" },
  { value: "OUTCOME_APP_PROMOTION", label: "Promoción de la app" },
  { value: "OUTCOME_SALES", label: "Ventas" },
];

// Spanish labels for each Meta performance goal (optimization_goal).
const PERFORMANCE_GOAL_LABELS: Record<string, string> = {
  LANDING_PAGE_VIEWS: "Maximizar el número de visitas a la página de destino",
  LINK_CLICKS: "Maximizar el número de clics en el enlace",
  IMPRESSIONS: "Maximizar el número de impresiones",
  REACH: "Maximizar el alcance único diario",
  OFFSITE_CONVERSIONS: "Maximizar el número de conversiones",
  VALUE: "Maximizar el valor de las conversiones",
  POST_ENGAGEMENT: "Maximizar el número de interacciones con la publicación",
  THRUPLAY: "Maximizar las reproducciones de ThruPlay",
  AD_RECALL_LIFT: "Maximizar el recuerdo del anuncio",
  APP_INSTALLS: "Maximizar el número de instalaciones de la app",
};

// Ordered performance goals per objective; first entry is Meta's
// recommended default that gets pre-selected (mirrors Ads Manager).
const GOALS_BY_OBJECTIVE: Record<string, string[]> = {
  OUTCOME_AWARENESS: ["REACH", "IMPRESSIONS", "AD_RECALL_LIFT", "THRUPLAY"],
  OUTCOME_TRAFFIC: ["LANDING_PAGE_VIEWS", "LINK_CLICKS", "IMPRESSIONS", "REACH"],
  OUTCOME_ENGAGEMENT: [
    "POST_ENGAGEMENT",
    "LANDING_PAGE_VIEWS",
    "LINK_CLICKS",
    "IMPRESSIONS",
    "REACH",
  ],
  OUTCOME_LEADS: [
    "OFFSITE_CONVERSIONS",
    "LANDING_PAGE_VIEWS",
    "LINK_CLICKS",
    "IMPRESSIONS",
  ],
  OUTCOME_SALES: [
    "OFFSITE_CONVERSIONS",
    "VALUE",
    "LANDING_PAGE_VIEWS",
    "LINK_CLICKS",
  ],
  OUTCOME_APP_PROMOTION: ["APP_INSTALLS"],
};

function goalsForObjective(objective: string): string[] {
  return GOALS_BY_OBJECTIVE[objective] ?? ["IMPRESSIONS"];
}

function recommendedGoalForObjective(objective: string): string {
  return goalsForObjective(objective)[0];
}

const CTA_OPTIONS = [
  { value: "LEARN_MORE", label: "Más información" },
  { value: "SHOP_NOW", label: "Comprar ahora" },
  { value: "BUY_NOW", label: "Comprar" },
  { value: "SIGN_UP", label: "Registrarse" },
  { value: "SUBSCRIBE", label: "Suscribirse" },
  { value: "DOWNLOAD", label: "Descargar" },
  { value: "ORDER_NOW", label: "Pedir ahora" },
  { value: "BOOK_NOW", label: "Reservar ahora" },
  { value: "CONTACT_US", label: "Contáctanos" },
  { value: "GET_OFFER", label: "Obtener oferta" },
  { value: "GET_QUOTE", label: "Obtener cotización" },
  { value: "APPLY_NOW", label: "Aplicar ahora" },
  { value: "SEND_MESSAGE", label: "Enviar mensaje" },
  { value: "WATCH_MORE", label: "Ver más" },
  { value: "SEE_MENU", label: "Ver menú" },
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
  const [performanceGoal, setPerformanceGoal] = useState(
    recommendedGoalForObjective("OUTCOME_TRAFFIC"),
  );
  const [budgetType, setBudgetType] = useState("DAILY");
  const [budgetAmount, setBudgetAmount] = useState("5000");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [landingOptions, setLandingOptions] = useState<
    { url: string; label: string }[]
  >([]);

  // Offer the user's published landings as ad destinations (Grüns-style
  // ad↔landing matching). Best-effort — needs a connected Shopify store.
  useEffect(() => {
    (async () => {
      try {
        const [list, status] = await Promise.all([
          landingsApi.list(),
          api.get<{ connected: boolean; shop?: string }>(
            "/connections/shopify/status",
          ),
        ]);
        const shop = status.connected ? status.shop : null;
        if (!shop) return;
        setLandingOptions(
          list
            .filter((l) => l.status === "PUBLISHED")
            .map((l) => ({
              url: `https://${shop}/apps/ofertas/${l.slug}`,
              label: l.title || l.slug,
            })),
        );
      } catch {
        /* best-effort: no landing picker if it fails */
      }
    })();
  }, []);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [targetCities, setTargetCities] = useState<
    { key: string; name: string }[]
  >([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [genders, setGenders] = useState<number[]>([0]);
  const [interests, setInterests] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [customAudienceIds, setCustomAudienceIds] = useState<string[]>([]);

  // Names for Meta objects
  const [campaignName, setCampaignName] = useState("");
  const [adSetName, setAdSetName] = useState("");
  const [adName, setAdName] = useState("");
  const [ctaType, setCtaType] = useState("LEARN_MORE");

  // Existing campaign/adset selection
  const [campaignMode, setCampaignMode] = useState<"new" | "existing">("new");
  const [metaCampaigns, setMetaCampaigns] = useState<{ id: string; name: string; objective: string; status: string }[]>([]);
  const [selectedMetaCampaignId, setSelectedMetaCampaignId] = useState("");
  const [selectedMetaCampaignName, setSelectedMetaCampaignName] = useState("");

  const [adSetMode, setAdSetMode] = useState<"new" | "existing">("new");
  const [metaAdSets, setMetaAdSets] = useState<{ id: string; name: string; status: string }[]>([]);
  const [selectedMetaAdSetId, setSelectedMetaAdSetId] = useState("");
  const [selectedMetaAdSetName, setSelectedMetaAdSetName] = useState("");
  const [loadingAdSets, setLoadingAdSets] = useState(false);

  // Generated image data from session
  const [generatedImageId, setGeneratedImageId] = useState("");
  const [variantIndex, setVariantIndex] = useState(0);
  const [additionalImageIds, setAdditionalImageIds] = useState<string[]>([]);
  const [noImage, setNoImage] = useState(false);
  // Texto del post (flujo custom): título + descripción generados aparte.
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");

  useEffect(() => {
    // Find the most recent generated image from session storage
    let foundImage = false;
    const imageKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("generatedImage_")) {
        imageKeys.push(key);
      }
    }

    // Use the last one written (most recent flow)
    // Prefer "custom" key if present, otherwise take the last one
    const targetKey =
      imageKeys.find((k) => k === "generatedImage_custom") ??
      imageKeys[imageKeys.length - 1];

    if (targetKey) {
      const data = JSON.parse(
        sessionStorage.getItem(targetKey)!,
      ) as GenerateImageResponse;
      setGeneratedImageId(data.generatedImageId);
      setVariantIndex(data.variantIndex);
      foundImage = true;

      // Get variant index from session
      const cachedAdId = targetKey.replace("generatedImage_", "");
      const savedVariant = sessionStorage.getItem(
        `selectedVariant_${cachedAdId}`,
      );
      if (savedVariant) setVariantIndex(Number(savedVariant));

      // Load selected variant image IDs
      const variantIds = sessionStorage.getItem(
        `imageVariantIds_${cachedAdId}`,
      );
      if (variantIds) setAdditionalImageIds(JSON.parse(variantIds));

      // Texto del post (flujo custom): título + descripción.
      const postCopyRaw = sessionStorage.getItem("postCopy_custom");
      if (postCopyRaw) {
        try {
          const pc = JSON.parse(postCopyRaw) as {
            title?: string;
            description?: string;
          };
          if (pc.title) setPostTitle(pc.title);
          if (pc.description) setPostDescription(pc.description);
        } catch {
          /* ignore */
        }
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
        if (defaults.objective || defaults.performanceGoal)
          setPerformanceGoal(
            defaults.performanceGoal ||
              recommendedGoalForObjective(
                defaults.objective || "OUTCOME_TRAFFIC",
              ),
          );
        if (defaults.budgetType) setBudgetType(defaults.budgetType);
        if (defaults.budgetAmount)
          setBudgetAmount(String(defaults.budgetAmount));
        if (defaults.destinationUrl)
          setDestinationUrl(defaults.destinationUrl);
        if (defaults.targetCountries?.length)
          setTargetCountries(defaults.targetCountries);
        if (defaults.targetCities?.length)
          setTargetCities(
            defaults.targetCities.filter((c) => c && typeof c.key === "string"),
          );
        if (defaults.ageMin) setAgeMin(defaults.ageMin);
        if (defaults.ageMax) setAgeMax(defaults.ageMax);
        if (defaults.genders?.length) setGenders(defaults.genders);
        if (defaults.interests?.length) setInterests(defaults.interests);
        if (defaults.customAudienceIds?.length)
          setCustomAudienceIds(defaults.customAudienceIds);
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

    // Load existing Meta campaigns for the picker
    api
      .get<{ campaigns: { id: string; name: string; objective: string; status: string }[] }>(
        "/connections/meta/campaigns",
      )
      .then((res) => setMetaCampaigns(res.campaigns.filter((c) => c.status !== "DELETED")))
      .catch(() => {});
  }, []);

  // Changing the campaign objective pre-selects Meta's recommended
  // performance goal for that objective (the user can still change it).
  function handleObjectiveChange(value: string) {
    setObjective(value);
    setPerformanceGoal(recommendedGoalForObjective(value));
  }

  // Load ad sets when a Meta campaign is selected
  async function handleSelectMetaCampaign(campaignId: string) {
    setSelectedMetaCampaignId(campaignId);
    const campaign = metaCampaigns.find((c) => c.id === campaignId);
    setSelectedMetaCampaignName(campaign?.name ?? "");
    setAdSetMode("new");
    setSelectedMetaAdSetId("");
    setSelectedMetaAdSetName("");

    if (campaignId) {
      setLoadingAdSets(true);
      try {
        const res = await api.get<{ adSets: { id: string; name: string; status: string }[] }>(
          `/connections/meta/campaigns/${campaignId}/adsets`,
        );
        setMetaAdSets(res.adSets);
      } catch {
        setMetaAdSets([]);
      } finally {
        setLoadingAdSets(false);
      }
    } else {
      setMetaAdSets([]);
    }
  }

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
        performanceGoal,
        budgetType,
        budgetAmount: Math.round(Number(budgetAmount)),
        startDate,
        targetCountries,
        ageMin,
        ageMax,
        genders,
      };

      const validCities = targetCities.filter(
        (c) => c && typeof c.key === "string" && c.key.length > 0,
      );
      if (validCities.length > 0) body.targetCities = validCities;
      if (endDate) body.endDate = endDate;
      if (destinationUrl.trim()) body.destinationUrl = destinationUrl.trim();
      if (interests.length > 0) body.interests = interests;
      if (customAudienceIds.length > 0) body.customAudienceIds = customAudienceIds;
      if (campaignName.trim()) body.campaignName = campaignName.trim();
      if (adSetName.trim()) body.adSetName = adSetName.trim();
      if (adName.trim()) body.adName = adName.trim();
      if (ctaType) body.ctaType = ctaType;
      if (additionalImageIds.length > 0) body.additionalImageIds = additionalImageIds;
      if (postTitle.trim()) body.title = postTitle.trim();
      if (postDescription.trim()) body.description = postDescription.trim();
      if (campaignMode === "existing" && selectedMetaCampaignId) {
        body.existingMetaCampaignId = selectedMetaCampaignId;
        body.existingMetaCampaignName = selectedMetaCampaignName;
      }
      if (adSetMode === "existing" && selectedMetaAdSetId) {
        body.existingMetaAdSetId = selectedMetaAdSetId;
        body.existingMetaAdSetName = selectedMetaAdSetName;
      }

      const campaign = await api.post<Campaign>("/campaigns/draft", body);
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al crear la campaña.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCurrency =
    adAccounts.find((a) => a.id === adAccountId)?.currency || "COP";

  function formatBudgetDisplay(value: string): string {
    const num = value.replace(/\D/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("es-CO");
  }

  function handleBudgetChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    setBudgetAmount(digits);
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
        <Link href="/connections?tab=meta" className="mt-4 inline-block">
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
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
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

        {/* Campaign selection — only show if there are existing campaigns */}
        {metaCampaigns.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Campaña en Meta
            </h3>
            <p className="mt-1 text-xs text-muted">
              Puedes crear una campaña nueva o agregar este anuncio a una campaña existente.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => { setCampaignMode("new"); setSelectedMetaCampaignId(""); setSelectedMetaCampaignName(""); setAdSetMode("new"); setMetaAdSets([]); }}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  campaignMode === "new"
                    ? "border-orange text-orange"
                    : "border-sand text-muted hover:border-orange/30"
                }`}
              >
                Crear nueva
              </button>
              <button
                type="button"
                onClick={() => setCampaignMode("existing")}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  campaignMode === "existing"
                    ? "border-orange text-orange"
                    : "border-sand text-muted hover:border-orange/30"
                }`}
              >
                Usar existente
              </button>
            </div>
            {campaignMode === "new" && (
              <div className="mt-4">
                <Input
                  label="Nombre de la campaña"
                  placeholder="Ej: Campaña Verano 2026"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  helperText="Si lo dejas vacío se usará el headline del copy."
                />
              </div>
            )}
            {campaignMode === "existing" && (
              <div className="mt-4">
                <Select
                  label="Campaña existente"
                  value={selectedMetaCampaignId}
                  onChange={(e) => handleSelectMetaCampaign(e.target.value)}
                  placeholder="Selecciona una campaña"
                  options={metaCampaigns.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.status})`,
                  }))}
                />
              </div>
            )}
          </Card>
        )}

        {/* Ad Set — always shown (new campaign creates new, existing lets you pick) */}
        {(campaignMode === "new" || (campaignMode === "existing" && selectedMetaCampaignId)) && (
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Grupo de anuncios
            </h3>
            {campaignMode === "existing" && (
              <>
                <p className="mt-1 text-xs text-muted">
                  Crea un grupo nuevo o agrega el anuncio a uno existente.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setAdSetMode("new"); setSelectedMetaAdSetId(""); setSelectedMetaAdSetName(""); }}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      adSetMode === "new"
                        ? "border-orange text-orange"
                        : "border-sand text-muted hover:border-orange/30"
                    }`}
                  >
                    Crear nuevo
                  </button>
                  {metaAdSets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAdSetMode("existing")}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        adSetMode === "existing"
                          ? "border-orange text-orange"
                          : "border-sand text-muted hover:border-orange/30"
                      }`}
                    >
                      Usar existente
                    </button>
                  )}
                </div>
                {loadingAdSets && (
                  <div className="mt-4 flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-muted">Cargando grupos...</span>
                  </div>
                )}
                {adSetMode === "existing" && !loadingAdSets && (
                  <div className="mt-4">
                    <Select
                      label="Grupo de anuncios existente"
                      value={selectedMetaAdSetId}
                      onChange={(e) => {
                        setSelectedMetaAdSetId(e.target.value);
                        const adSet = metaAdSets.find((a) => a.id === e.target.value);
                        setSelectedMetaAdSetName(adSet?.name ?? "");
                      }}
                      placeholder="Selecciona un grupo"
                      options={metaAdSets.map((a) => ({
                        value: a.id,
                        label: `${a.name} (${a.status})`,
                      }))}
                    />
                  </div>
                )}
              </>
            )}
            {adSetMode === "new" && (
              <div className="mt-4">
                <Input
                  label="Nombre del grupo de anuncios"
                  placeholder="Ej: Mujeres 25-45 Colombia"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  helperText="Si lo dejas vacío se generará automáticamente."
                />
              </div>
            )}
          </Card>
        )}

        {/* Ad name — always shown */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Anuncio
          </h3>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Nombre del anuncio"
              placeholder="Ej: Variante A - Imagen principal"
              value={adName}
              onChange={(e) => setAdName(e.target.value)}
              helperText="Si lo dejas vacío se generará automáticamente."
            />
            <Select
              label="Llamado a la acción"
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value)}
              options={CTA_OPTIONS}
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
              onChange={(e) => handleObjectiveChange(e.target.value)}
              options={OBJECTIVES}
            />
            <div>
              <Select
                label="Objetivo de rendimiento"
                value={performanceGoal}
                onChange={(e) => setPerformanceGoal(e.target.value)}
                options={goalsForObjective(objective).map((g) => ({
                  value: g,
                  label:
                    g === recommendedGoalForObjective(objective)
                      ? `${PERFORMANCE_GOAL_LABELS[g]} (recomendado)`
                      : PERFORMANCE_GOAL_LABELS[g],
                }))}
              />
              <p className="mt-1.5 text-xs text-muted">
                Cómo mides el éxito de tus anuncios. Se recomienda según el
                objetivo de la campaña.
              </p>
            </div>
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
                  label={`Monto (${selectedCurrency})`}
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 5.000"
                  value={formatBudgetDisplay(budgetAmount)}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  required
                  helperText={`Mínimo recomendado: 5.000 ${selectedCurrency}`}
                />
              </div>
            </div>
            {landingOptions.length > 0 && (
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-charcoal">
                  Usar una landing (opcional)
                </label>
                <select
                  className="w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none"
                  value=""
                  onChange={(e) =>
                    e.target.value && setDestinationUrl(e.target.value)
                  }
                >
                  <option value="">— Elegir landing publicada —</option>
                  {landingOptions.map((o) => (
                    <option key={o.url} value={o.url}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label="URL de destino"
              type="url"
              placeholder="https://tu-sitio.com"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              helperText="Elige una landing arriba o pega tu URL. Vacío = URL de tu marca."
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

            <CityAutocomplete selected={targetCities} onChange={setTargetCities} />

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

            <CustomAudiencePicker
              adAccountId={adAccountId}
              selected={customAudienceIds}
              onChange={setCustomAudienceIds}
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
