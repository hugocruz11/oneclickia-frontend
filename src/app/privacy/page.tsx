import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/i18n/server";
import { RichText } from "@/components/RichText";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Política de Privacidad — OneClickIA"),
    description: t(
      "Política de privacidad de OneClickIA, plataforma SaaS para creación de campañas publicitarias con IA.",
    ),
  };
}

const NOTION_URL =
  "https://jasper-dryer-7cd.notion.site/Pol-tica-de-Privacidad-OneClickIa-3650e7dd12df801fa45fd547b42c5285";

export default async function PrivacyPage() {
  const t = await getT();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="border-b border-sand pb-4">
        <Link
          href="/"
          className="text-sm text-orange hover:text-orange/80"
        >
          ← OneClickIA
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-ink">
          {t("Política de Privacidad")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t("Última actualización: 2026")}
        </p>
      </header>

      <section className="flex flex-col gap-4 text-sm leading-relaxed text-charcoal">
        <p>
          <RichText>
            {"En **OneClickIA** nos comprometemos a proteger la privacidad de nuestros usuarios. Esta política describe qué datos recolectamos, cómo los usamos y cómo los protegemos."}
          </RichText>
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("1. Información que recolectamos")}
        </h2>
        <p>
          {t(
            "Recolectamos información que tú nos proporcionas directamente al registrarte (email, nombre, contraseña), información sobre tu marca (nombre, logo, sitio web, descripciones) y datos de uso de la plataforma (campañas creadas, anuncios generados).",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("2. Integraciones con terceros")}
        </h2>
        <p>
          {t(
            "Para que la plataforma funcione, conectamos con servicios de terceros: Meta (Facebook/Instagram Ads) para publicar campañas, Google Gemini para generación de copy e imágenes, y Foreplay para inspiración de anuncios. Tus credenciales OAuth se almacenan cifradas (AES-256).",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("3. Uso de la información")}
        </h2>
        <p>
          {t(
            "Usamos tu información exclusivamente para operar la plataforma: generar anuncios personalizados, publicarlos en las plataformas que autorizas, y proveer analítica de rendimiento. No vendemos tus datos a terceros.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("4. Almacenamiento y seguridad")}
        </h2>
        <p>
          {t(
            "Tus datos se almacenan en servidores cifrados. Las contraseñas se guardan con hash bcrypt. Las credenciales de plataformas externas (Meta, Google) se cifran con AES-256-GCM antes de persistirse.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("5. Tus derechos")}
        </h2>
        <p>
          {t(
            "Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados en cualquier momento contactándonos. También puedes desconectar tus integraciones externas (Meta, etc.) desde el panel de la aplicación en cualquier momento.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("6. Contacto")}
        </h2>
        <p>
          {t("Si tienes preguntas sobre esta política, puedes contactarnos en")}{" "}
          <a
            href="mailto:hugocruz11@hotmail.com"
            className="text-orange hover:text-orange/80"
          >
            hugocruz11@hotmail.com
          </a>
          .
        </p>

        <div className="mt-8 border-t border-sand pt-6">
          <p className="text-xs text-muted">
            {t(
              "Para la versión completa con todos los detalles legales, también puedes consultar nuestra",
            )}{" "}
            <a
              href={NOTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:text-orange/80"
            >
              {t("versión extendida en Notion")}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
