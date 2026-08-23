import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { LOCALE_COOKIE, normalizeLocale } from "@/i18n/config";
import { translate } from "@/i18n/translate";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// El <title>/<description> también dependen del idioma, así que se resuelven
// desde la misma cookie que usa el resto de la app.
export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return {
    title: translate(locale, "OneClickIA — Campañas de ads en minutos"),
    description: translate(
      locale,
      "Crea campañas publicitarias en Meta Ads de forma automática con inteligencia artificial.",
    ),
    verification: {
      other: {
        "facebook-domain-verification": "xcogjp2kbwhkb3uoiai260bxi02wj9",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('oneclickia_theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <I18nProvider initialLocale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
