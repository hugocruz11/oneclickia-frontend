import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "./config";
import { createTranslator, type TranslateFn } from "./translate";

/** Idioma activo leído de la cookie. Solo para Server Components. */
export async function getLocale(): Promise<Locale> {
  return normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

/**
 * Equivalente en servidor de `useT()`. Usa `cookies()`, así que la ruta que
 * lo llame pasa a render dinámico.
 */
export async function getT(): Promise<TranslateFn> {
  return createTranslator(await getLocale());
}
