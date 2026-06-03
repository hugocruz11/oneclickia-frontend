import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneClickIA — Campañas de ads en minutos",
  description:
    "Crea campañas publicitarias en Meta Ads de forma automática con inteligencia artificial.",
  verification: {
    other: {
      "facebook-domain-verification": "xcogjp2kbwhkb3uoiai260bxi02wj9",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
