"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_TAGS,
  normalizeLocale,
  type Locale,
} from "@/i18n/config";
import { createTranslator, type TranslateFn } from "@/i18n/translate";

interface I18nContextValue {
  /** Idioma activo ("es" | "en"). */
  locale: Locale;
  /** Tag BCP 47 para las APIs de Intl (ej. "es-CO"). */
  localeTag: string;
  /** Traduce una clave (el texto en español) con interpolación opcional. */
  t: TranslateFn;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  localeTag: LOCALE_TAGS[DEFAULT_LOCALE],
  t: createTranslator(DEFAULT_LOCALE),
  setLocale: () => {},
});

// `initialLocale` viene del layout de servidor, que lee la cookie. Así el
// primer render del servidor ya sale en el idioma correcto y no hay
// parpadeo de español → inglés al hidratar.
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(() =>
    normalizeLocale(initialLocale),
  );

  const setLocale = useCallback(
    (next: Locale) => {
      const value = normalizeLocale(next);
      setLocaleState(value);
      document.documentElement.lang = value;
      document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
      // Los Server Components (páginas legales, layouts, <title>) leen el
      // idioma de la cookie: sin refrescar se quedarían en el anterior.
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      localeTag: LOCALE_TAGS[locale],
      t: createTranslator(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Atajo para el caso más común: solo necesitar `t`. */
export function useT(): TranslateFn {
  return useContext(I18nContext).t;
}
