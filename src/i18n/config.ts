// Configuración base de idiomas. Sin dependencias de React ni del DOM para
// poder usarse tanto en el layout de servidor como en componentes cliente.

export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

// Nombre de la cookie: la lee el layout de servidor para renderizar el HTML
// ya en el idioma correcto (sin parpadeo) y la escribe el selector.
export const LOCALE_COOKIE = "oneclickia_locale";

// Un año. El idioma es una preferencia estable, no de sesión.
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Etiqueta del selector: cada idioma se muestra en su propio idioma.
export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

// Tag BCP 47 para las APIs de Intl (fechas, números, moneda).
export const LOCALE_TAGS: Record<Locale, string> = {
  es: "es-CO",
  en: "en-US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
