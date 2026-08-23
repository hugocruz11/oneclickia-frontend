import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale } from "@/i18n/config";
import { translate } from "@/i18n/translate";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component: el idioma sale de la cookie, igual que en el layout raíz.
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-12">
      {/* El selector va arriba a la derecha: quien aún no tiene cuenta también
          necesita poder cambiar de idioma. */}
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>

      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-oki-trim.png"
          alt="OneClickIA"
          className="mx-auto h-12 w-auto"
        />
        <p className="mt-2 text-sm text-muted">
          {translate(locale, "Campañas de ads en minutos")}
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
