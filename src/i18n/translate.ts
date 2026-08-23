// Motor de traducción.
//
// La clave ES el texto en español. Eso significa que:
//   - `es` no necesita diccionario: la clave ya es la traducción.
//   - Si a `en` le falta una entrada, cae al español en vez de mostrar una
//     clave cruda tipo "campaigns.new.title" al usuario.
//
// Interpolación con llaves: t("Hola {name}", { name: "Ana" }).

import { DEFAULT_LOCALE, type Locale } from "./config";
import { en } from "./messages/en";

export type Dictionary = Record<string, string>;

export type TranslateVars = Record<string, string | number>;

const DICTIONARIES: Record<Locale, Dictionary | null> = {
  // El español es el idioma fuente: la clave se devuelve tal cual.
  es: null,
  en,
};

const INTERPOLATION = /\{(\w+)\}/g;

export function interpolate(text: string, vars?: TranslateVars): string {
  if (!vars) return text;
  return text.replace(INTERPOLATION, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  locale: Locale,
  key: string,
  vars?: TranslateVars,
): string {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  const text = dictionary?.[key] ?? key;
  return interpolate(text, vars);
}

export type TranslateFn = (key: string, vars?: TranslateVars) => string;

export function createTranslator(locale: Locale): TranslateFn {
  return (key, vars) => translate(locale, key, vars);
}
