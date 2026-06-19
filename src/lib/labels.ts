// Etiquetas legibles para mostrar en la UI (objetivos de campaña y países).
// Centralizado para reusar en el detalle y el listado de campañas.

// Objetivos de Meta → etiqueta en español (coincide con el selector de
// crear campaña). Cae al valor sin el prefijo OUTCOME_ si no está mapeado.
export const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_AWARENESS: "Reconocimiento",
  OUTCOME_TRAFFIC: "Tráfico",
  OUTCOME_ENGAGEMENT: "Interacción",
  OUTCOME_LEADS: "Clientes potenciales",
  OUTCOME_APP_PROMOTION: "Promoción de la app",
  OUTCOME_SALES: "Ventas",
};

export function objectiveLabel(objective: string): string {
  return OBJECTIVE_LABELS[objective] || objective.replace("OUTCOME_", "");
}

// Meta de rendimiento del grupo de anuncios (optimization_goal) → etiqueta.
export const PERFORMANCE_GOAL_LABELS: Record<string, string> = {
  LANDING_PAGE_VIEWS: "Visitas a la página de destino",
  LINK_CLICKS: "Clics en el enlace",
  IMPRESSIONS: "Impresiones",
  REACH: "Alcance único diario",
  OFFSITE_CONVERSIONS: "Conversiones",
  VALUE: "Valor de las conversiones",
  POST_ENGAGEMENT: "Interacciones con la publicación",
  THRUPLAY: "Reproducciones de ThruPlay",
  AD_RECALL_LIFT: "Recuerdo del anuncio",
  APP_INSTALLS: "Instalaciones de la app",
};

export function performanceGoalLabel(goal: string | null | undefined): string {
  if (!goal) return "—";
  return PERFORMANCE_GOAL_LABELS[goal] || goal;
}

// Códigos ISO de país → nombre. Foco LATAM + mercados frecuentes; cae al
// propio código si no está en la lista.
const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia",
  MX: "México",
  AR: "Argentina",
  CL: "Chile",
  PE: "Perú",
  EC: "Ecuador",
  VE: "Venezuela",
  BO: "Bolivia",
  PY: "Paraguay",
  UY: "Uruguay",
  GT: "Guatemala",
  CR: "Costa Rica",
  PA: "Panamá",
  DO: "República Dominicana",
  HN: "Honduras",
  SV: "El Salvador",
  NI: "Nicaragua",
  PR: "Puerto Rico",
  US: "Estados Unidos",
  ES: "España",
  BR: "Brasil",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}

// Resumen compacto de ubicación para tarjetas: "Bogotá · Colombia".
export function locationSummary(
  countries: string[],
  cities: { name: string }[],
): string {
  const parts: string[] = [];
  if (cities?.length) parts.push(cities.map((c) => c.name).join(", "));
  if (countries?.length) parts.push(countries.map(countryName).join(", "));
  return parts.join(" · ");
}
