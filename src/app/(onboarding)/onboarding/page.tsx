"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { Brand, PricePositioning } from "@/lib/types";
import { useT } from "@/contexts/I18nContext";

// ─── Wizard state ──────────────────────────────────────────────────

interface WizardState {
  // Paso 1 — Identidad básica
  name: string;
  websiteUrl: string;
  instagramUrl: string;
  instagramSummary: string;
  identityContext: string;
  markets: string;
  mission: string;
  // Paso 2 — Personalidad y tono
  brandPersona: string;
  toneOfVoice: string;
  communicationProhibitions: string;
  admiredBrands: string;
  // Paso 3 — Filosofía
  coreBelief: string;
  // Paso 4 — Identidad visual
  visualIdentity: string;
  // Paso 5 — Posicionamiento competitivo
  pricePositioning: PricePositioning | "";
  positioningStatement: string;
  competitors: string;
  competitiveEdge: string;
  marketGap: string;
}

const EMPTY_STATE: WizardState = {
  name: "",
  websiteUrl: "",
  instagramUrl: "",
  instagramSummary: "",
  identityContext: "",
  markets: "",
  mission: "",
  brandPersona: "",
  toneOfVoice: "",
  communicationProhibitions: "",
  admiredBrands: "",
  coreBelief: "",
  visualIdentity: "",
  pricePositioning: "",
  positioningStatement: "",
  competitors: "",
  competitiveEdge: "",
  marketGap: "",
};

const TOTAL_STEPS = 5;

const PRICE_POSITIONING_OPTIONS: { value: PricePositioning; label: string }[] =
  [
    { value: "VALUE", label: "Value (económico)" },
    { value: "MID_MARKET", label: "Mid-market (medio)" },
    { value: "PREMIUM_ACCESSIBLE", label: "Premium accesible" },
    { value: "PREMIUM", label: "Premium" },
    { value: "ULTRA_PREMIUM", label: "Ultra premium" },
  ];

function hydrateFromBrand(brand: Brand | null): WizardState {
  if (!brand) return EMPTY_STATE;
  return {
    name: brand.name ?? "",
    websiteUrl: brand.websiteUrl ?? "",
    instagramUrl: brand.instagramUrl ?? "",
    instagramSummary: brand.instagramSummary ?? "",
    identityContext: brand.identityContext ?? "",
    markets: brand.markets ?? "",
    mission: brand.mission ?? "",
    brandPersona: brand.brandPersona ?? "",
    toneOfVoice: brand.toneOfVoice ?? "",
    communicationProhibitions: brand.communicationProhibitions ?? "",
    admiredBrands: brand.admiredBrands ?? "",
    coreBelief: brand.coreBelief ?? "",
    visualIdentity: brand.visualIdentity ?? "",
    pricePositioning: brand.pricePositioning ?? "",
    positioningStatement: brand.positioningStatement ?? "",
    competitors: brand.competitors ?? "",
    competitiveEdge: brand.competitiveEdge ?? "",
    marketGap: brand.marketGap ?? "",
  };
}

// Required fields per step. Drives "resume at first incomplete step"
// and per-step validation. Logo is required in step 1 only if the
// brand has no logoUrl yet (handled separately).
const REQUIRED_BY_STEP: Record<number, (keyof WizardState)[]> = {
  1: ["name", "websiteUrl", "identityContext", "markets", "mission"],
  2: [
    "brandPersona",
    "toneOfVoice",
    "communicationProhibitions",
    "admiredBrands",
  ],
  3: ["coreBelief"],
  4: ["visualIdentity"],
  5: [
    "pricePositioning",
    "positioningStatement",
    "competitors",
    "competitiveEdge",
    "marketGap",
  ],
};

function resumeStep(state: WizardState, hasLogo: boolean): number {
  for (let step = 1; step <= TOTAL_STEPS; step++) {
    const required = REQUIRED_BY_STEP[step];
    const missing = required.some((k) => {
      const v = state[k];
      return typeof v === "string" ? v.trim().length === 0 : !v;
    });
    if (missing) return step;
    if (step === 1 && !hasLogo) return 1;
  }
  return TOTAL_STEPS;
}

// ─── Page ──────────────────────────────────────────────────────────

export default function OnboardingWizardPage() {
  const router = useRouter();
  const t = useT();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [state, setState] = useState<WizardState>(EMPTY_STATE);
  const [logo, setLogo] = useState<File | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const { brand } = await api.get<{ brand: Brand | null }>("/brand");
        if (brand) {
          if (brand.onboardingCompleted) {
            router.replace("/ads/search");
            return;
          }
          const hydrated = hydrateFromBrand(brand);
          setState(hydrated);
          const logoPresent = !!brand.logoUrl;
          setHasLogo(logoPresent);
          setStep(resumeStep(hydrated, logoPresent));
        }
      } catch {
        // No brand yet — start at step 1
      }
      setBootstrapped(true);
    }
    void bootstrap();
  }, [router]);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  if (!bootstrapped) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  async function handleStep1(e: FormEvent) {
    e.preventDefault();
    setError("");
    setWarnings([]);

    if (!state.name.trim()) return setError("El nombre de la marca es obligatorio.");
    if (!hasLogo && !logo) return setError("El logo es obligatorio.");
    if (!state.websiteUrl.trim())
      return setError("La URL del sitio web es obligatoria.");
    for (const key of ["identityContext", "markets", "mission"] as const) {
      if (!state[key].trim()) return setError("Completa todas las preguntas para continuar.");
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", state.name.trim());
      if (logo) formData.append("logo", logo);
      formData.append("websiteUrl", state.websiteUrl.trim());
      if (state.instagramUrl.trim())
        formData.append("instagramUrl", state.instagramUrl.trim());
      if (state.instagramSummary.trim())
        formData.append("instagramSummary", state.instagramSummary.trim());
      formData.append("identityContext", state.identityContext.trim());
      formData.append("markets", state.markets.trim());
      formData.append("mission", state.mission.trim());

      const result = await api.post<{ brand: Brand; warnings: string[] }>(
        "/onboarding",
        formData,
      );
      if (result.brand.logoUrl) setHasLogo(true);
      if (result.warnings?.length) setWarnings(result.warnings);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el paso 1.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function patchBrand(extras: Record<string, unknown> = {}) {
    const required = REQUIRED_BY_STEP[step];
    for (const key of required) {
      const v = state[key];
      if (typeof v === "string" ? !v.trim() : !v) {
        setError("Completa todas las preguntas para continuar.");
        return false;
      }
    }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { ...extras };
      for (const key of required) {
        const v = state[key];
        if (typeof v === "string") payload[key] = v.trim();
        else payload[key] = v;
      }
      await api.patch<{ brand: Brand }>("/brand", payload);
      return true;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar este paso.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleStep2(e: FormEvent) {
    e.preventDefault();
    if (await patchBrand()) setStep(3);
  }

  async function handleStep3(e: FormEvent) {
    e.preventDefault();
    if (await patchBrand()) setStep(4);
  }

  async function handleStep4(e: FormEvent) {
    e.preventDefault();
    if (await patchBrand()) setStep(5);
  }

  async function handleStep5(e: FormEvent) {
    e.preventDefault();
    if (await patchBrand({ onboardingCompleted: true })) {
      router.replace("/ads/search");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Paso {step} de {total}", { step, total: TOTAL_STEPS })}
          </span>
        </div>

        {step === 1 && (
          <Step1
            state={state}
            update={update}
            logo={logo}
            setLogo={setLogo}
            hasLogo={hasLogo}
            onSubmit={handleStep1}
            saving={saving}
            error={error}
            warnings={warnings}
          />
        )}
        {step === 2 && (
          <Step2
            state={state}
            update={update}
            onSubmit={handleStep2}
            onBack={() => setStep(1)}
            saving={saving}
            error={error}
          />
        )}
        {step === 3 && (
          <Step3
            state={state}
            update={update}
            onSubmit={handleStep3}
            onBack={() => setStep(2)}
            saving={saving}
            error={error}
          />
        )}
        {step === 4 && (
          <Step4
            state={state}
            update={update}
            onSubmit={handleStep4}
            onBack={() => setStep(3)}
            saving={saving}
            error={error}
          />
        )}
        {step === 5 && (
          <Step5
            state={state}
            update={update}
            onSubmit={handleStep5}
            onBack={() => setStep(4)}
            saving={saving}
            error={error}
          />
        )}
      </Card>
    </div>
  );
}

// ─── Reusable building blocks ──────────────────────────────────────

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mt-2">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function ErrorBox({ error }: { error: string }) {
  const t = useT();
  if (!error) return null;
  return (
    <div className="rounded-md border border-error/20 bg-error/10 p-3">
      <p className="text-sm text-error">{t(error)}</p>
    </div>
  );
}

function WarningsBox({ warnings }: { warnings: string[] }) {
  const t = useT();
  if (!warnings.length) return null;
  return (
    <div className="rounded-md border border-warning/20 bg-warning/10 p-3">
      <p className="text-sm font-medium text-warning">{t("Avisos:")}</p>
      {warnings.map((w, i) => (
        <p key={i} className="mt-1 text-sm text-warning">
          {w}
        </p>
      ))}
    </div>
  );
}

function StepFooter({
  onBack,
  saving,
  primaryLabel,
}: {
  onBack?: () => void;
  saving: boolean;
  primaryLabel: string;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand pt-5">
      {onBack ? (
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {t("← Atrás")}
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" size="md" loading={saving}>
        {primaryLabel}
      </Button>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full bg-orange transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted">
        {current} / {total}
      </span>
    </div>
  );
}

function FormShell({
  onSubmit,
  children,
}: {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5" noValidate>
      {children}
    </form>
  );
}

// ─── Steps ─────────────────────────────────────────────────────────

interface StepProps {
  state: WizardState;
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  onSubmit: (e: FormEvent) => void;
  onBack?: () => void;
  saving: boolean;
  error: string;
}

function Step1({
  state,
  update,
  logo,
  setLogo,
  hasLogo,
  onSubmit,
  saving,
  error,
  warnings,
}: StepProps & {
  logo: File | null;
  setLogo: (f: File | null) => void;
  hasLogo: boolean;
  warnings: string[];
}) {
  const t = useT();

  return (
    <>
      <StepHeader
        title="Identidad básica"
        subtitle="Lo esencial de tu marca: nombre, logo, web y los primeros 3 puntos de identidad. (Se guarda y puedes retomar después.)"
      />
      <FormShell onSubmit={onSubmit}>
        <Input
          label={t("Nombre comercial *")}
          placeholder={t("Ej: MUMU")}
          value={state.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />

        <FileUpload
          label={
            hasLogo
              ? t("Logo de la marca (ya cargado)")
              : t("Logo de la marca *")
          }
          value={logo}
          onChange={setLogo}
          helperText={
            hasLogo
              ? t(
                  "Ya tienes un logo guardado. Sube uno nuevo solo si quieres reemplazarlo.",
                )
              : t("Se usará en tus anuncios generados.")
          }
        />

        <Input
          label={t("URL del sitio web *")}
          type="url"
          placeholder={t("https://www.tumarca.com")}
          value={state.websiteUrl}
          onChange={(e) => update("websiteUrl", e.target.value)}
          required
        />

        <div className="border-t border-sand pt-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Instagram (opcional)")}
          </p>
          <div className="flex flex-col gap-5">
            <Input
              label={t("URL de Instagram")}
              type="url"
              placeholder={t("https://instagram.com/tumarca")}
              value={state.instagramUrl}
              onChange={(e) => update("instagramUrl", e.target.value)}
            />
            <Textarea
              label={t("Descripción de Instagram")}
              placeholder={t("Qué publicas, qué vendes, a quién te diriges...")}
              value={state.instagramSummary}
              onChange={(e) => update("instagramSummary", e.target.value)}
              helperText={t("Útil si no tienes web pública o quieres complementar.")}
            />
          </div>
        </div>

        <div className="border-t border-sand pt-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Identidad de marca")}
          </p>
          <div className="flex flex-col gap-5">
            <Textarea
              label={t("1. Nombre comercial, razón social, año y canal de venta *")}
              placeholder={t('Ej: MUMU — razón social Bienestar Natural SAS. Fundada en 2021 en Medellín, Colombia. Canal principal: e-commerce propio (Shopify) + Farmatodo.')}
              value={state.identityContext}
              onChange={(e) => update("identityContext", e.target.value)}
              helperText={t("Nombre legal si es distinto al comercial, año, país de origen, canal principal.")}
              rows={4}
            />
            <Textarea
              label={t("2. Mercados actuales y mercados meta *")}
              placeholder={t('Ej: Hoy: Colombia (80% e-commerce). Meta año 2: México y Chile. Año 3: distribución en farmacias latinoamericanas.')}
              value={state.markets}
              onChange={(e) => update("markets", e.target.value)}
              helperText={t("Geografía actual y expansión planeada (países, ciudades, segmentos).")}
              rows={4}
            />
            <Textarea
              label={t("3. Misión: ¿por qué existe tu marca más allá de vender? *")}
              placeholder={t('Ej: Demostrar que cuidarse bien no requiere ni sufrimiento ni una licenciatura en nutrición.')}
              value={state.mission}
              onChange={(e) => update("mission", e.target.value)}
              helperText={t("El propósito real, no el eslogan.")}
              rows={4}
            />
          </div>
        </div>

        <ErrorBox error={error} />
        <WarningsBox warnings={warnings} />
        <StepFooter saving={saving} primaryLabel={t("Guardar y continuar →")} />
      </FormShell>
    </>
  );
}

function Step2({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  const t = useT();

  return (
    <>
      <StepHeader
        title="Personalidad y tono"
        subtitle="Cómo se comporta tu marca: persona, voz, prohibiciones y referentes. Define el tono de todos los creativos."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label={t("4. Si tu marca fuera una persona, ¿cómo sería? *")}
          placeholder={t('Ej: Mujer de 35 años, profesional, que se cuida sin obsesionarse. Vive en Medellín, va al pilates dos veces por semana, lee etiquetas antes de comprar pero no es extremista. Habla con honestidad, no promete milagros.')}
          value={state.brandPersona}
          onChange={(e) => update("brandPersona", e.target.value)}
          helperText={t("Edad, perfil, carácter, qué hace, cómo se ve. Esta persona define el tono de todos los creativos.")}
          rows={5}
        />
        <Textarea
          label={t("5. Tono de voz: 3-5 adjetivos + cómo se manifiesta en el copy *")}
          placeholder={t('Ej: Empático, honesto, directo, sin condescendencia. En la práctica: habla de tú a tú, no usa jerga wellness, nunca dice "babe" ni "sis", frases cortas, evita superlativos.')}
          value={state.toneOfVoice}
          onChange={(e) => update("toneOfVoice", e.target.value)}
          helperText={t("3-5 adjetivos que describen el tono y un ejemplo de cómo se manifiesta.")}
          rows={5}
        />
        <Textarea
          label={t("6. ¿Qué NUNCA diría, haría ni parecería tu marca? *")}
          placeholder={t('Ej: 1) Nunca lenguaje de vergüenza corporal. 2) Nunca prometer resultados sin esfuerzo. 3) Nunca testimonios falsos. 4) Nunca sonar desesperada. 5) Nunca comparar con estándares irreales.')}
          value={state.communicationProhibitions}
          onChange={(e) => update("communicationProhibitions", e.target.value)}
          helperText={t("Las 5 prohibiciones de tono y comunicación.")}
          rows={5}
        />
        <Textarea
          label={t("7. ¿Qué marcas admiras por su forma de comunicarse y qué replicarías? *")}
          placeholder={t('Ej: Patagonia por su honestidad radical. Oatly por su irreverencia sin perder credibilidad. Nubank por hablarle a adultos como adultos.')}
          value={state.admiredBrands}
          onChange={(e) => update("admiredBrands", e.target.value)}
          helperText={t("De cualquier industria — lo importante es qué tiene esa comunicación que te gustaría replicar.")}
          rows={4}
        />
        <ErrorBox error={error} />
        <StepFooter
          onBack={onBack}
          saving={saving}
          primaryLabel={t("Guardar y continuar →")}
        />
      </FormShell>
    </>
  );
}

function Step3({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  const t = useT();

  return (
    <>
      <StepHeader
        title="Filosofía"
        subtitle="La creencia central de tu marca — el discurso que enfrenta el statu quo de tu categoría."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label={t("8. ¿Cuál es la creencia central o filosofía de tu marca? *")}
          placeholder={t('Ej. calzado: "Creemos que un zapato puede ser elegante Y cómodo — la industria lleva 50 años diciéndote que tienes que elegir." Ej. ropa: "Creemos que el cuerpo no tiene que adaptarse a la talla — la ropa tiene que adaptarse al cuerpo."')}
          value={state.coreBelief}
          onChange={(e) => update("coreBelief", e.target.value)}
          helperText={t("¿Qué cree tu marca que es verdad en su categoría que otros no dicen? Una creencia poderosa enfrenta el statu quo.")}
          rows={6}
        />
        <ErrorBox error={error} />
        <StepFooter
          onBack={onBack}
          saving={saving}
          primaryLabel={t("Guardar y continuar →")}
        />
      </FormShell>
    </>
  );
}

function Step4({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  const t = useT();

  return (
    <>
      <StepHeader
        title="Identidad visual"
        subtitle="Cómo se ve tu marca — colores, tipografías, estética y referencias visuales."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label={t("9. ¿Cuál es la identidad visual de tu marca? *")}
          placeholder={t('Ej: Colores: verde menta #A8D8B9 + negro carbón #1C1C1C + blanco hueso #F9F7F2. Tipografía: sans-serif geométrica (Neue Haas Grotesk), serif clásica para cuerpo (Freight Text). Estética: limpia, espacio en blanco, fotografía de producto sobre fondos neutros. Referencias: Aesop, Muji, Kinfolk.')}
          value={state.visualIdentity}
          onChange={(e) => update("visualIdentity", e.target.value)}
          helperText={t("Colores corporativos (con códigos si los tienes), tipografías, estética general, estilo fotográfico y referencias visuales. Si no tienes identidad definida, describe cómo quisieras que se vea.")}
          rows={8}
        />
        <ErrorBox error={error} />
        <StepFooter
          onBack={onBack}
          saving={saving}
          primaryLabel={t("Guardar y continuar →")}
        />
      </FormShell>
    </>
  );
}

function Step5({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  const t = useT();
  const positioningOptions = useMemo(
    () =>
      PRICE_POSITIONING_OPTIONS.map((o) => ({
        value: o.value,
        label: t(o.label),
      })),
    [t],
  );

  return (
    <>
      <StepHeader
        title="Posicionamiento competitivo"
        subtitle="Tu lugar en el mercado: rango de precio, competidores y el hueco que solo tu marca llena."
      />
      <FormShell onSubmit={onSubmit}>
        <Select
          label={t("10. Rango de precio y percepción *")}
          placeholder={t("Selecciona un rango")}
          options={positioningOptions}
          value={state.pricePositioning}
          onChange={(e) =>
            update(
              "pricePositioning",
              e.target.value as PricePositioning | "",
            )
          }
        />
        <Textarea
          label={t("10. ¿Qué comunica ese posicionamiento? *")}
          placeholder={t('Ej: Premium accesible — por encima de marcas genéricas pero por debajo de marcas importadas de lujo. El precio comunica calidad real sin pagar por la etiqueta.')}
          value={state.positioningStatement}
          onChange={(e) => update("positioningStatement", e.target.value)}
          helperText={t("Explica qué transmite tu rango de precio al cliente.")}
          rows={4}
        />
        <Textarea
          label={t("11. Competidores directos de tu MARCA *")}
          placeholder={t('Ej: Competidor 1: Totto — masiva, buena distribución, diseño genérico. Nos eligen cuando quieren más personalidad. Competidor 2: Osprey — importada premium, $800K+, sin servicio local.')}
          value={state.competitors}
          onChange={(e) => update("competitors", e.target.value)}
          helperText={t("Para cada competidor: nombre, posicionamiento y por qué un cliente te elegiría sobre ellos.")}
          rows={6}
        />
        <Textarea
          label={t("12. ¿En qué es notablemente mejor tu marca? *")}
          placeholder={t('Ej: Soporte postventa en español, tiempo de entrega en Colombia, adaptación del producto al clima tropical.')}
          value={state.competitiveEdge}
          onChange={(e) => update("competitiveEdge", e.target.value)}
          helperText={t("Sé honesto y específico — no 'calidad' en abstracto.")}
          rows={4}
        />
        <Textarea
          label={t("12. ¿Cuál es el hueco de mercado que ocupas? *")}
          placeholder={t('Ej: La única marca de accesorios técnicos diseñada para el contexto latinoamericano — el calor, las lluvias, el transporte público.')}
          value={state.marketGap}
          onChange={(e) => update("marketGap", e.target.value)}
          helperText={t("El hueco que ningún competidor está llenando.")}
          rows={4}
        />
        <ErrorBox error={error} />
        <StepFooter
          onBack={onBack}
          saving={saving}
          primaryLabel={t("Terminar y empezar")}
        />
      </FormShell>
    </>
  );
}
