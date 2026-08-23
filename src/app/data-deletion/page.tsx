import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/i18n/server";
import { RichText } from "@/components/RichText";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Eliminación de Datos — OneClickIA"),
    description: t(
      "Cómo eliminar tus datos de OneClickIA, incluyendo los datos obtenidos a través de Meta (Facebook/Instagram).",
    ),
  };
}

export default async function DataDeletionPage() {
  const t = await getT();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="border-b border-sand pb-4">
        <Link href="/" className="text-sm text-orange hover:text-orange/80">
          ← OneClickIA
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-ink">
          {t("Eliminación de Datos")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t("Última actualización: 2026")}
        </p>
      </header>

      <section className="flex flex-col gap-4 text-sm leading-relaxed text-charcoal">
        <p>
          <RichText>
            {"En **OneClickIA** puedes eliminar tus datos en cualquier momento. Esta página explica qué datos almacenamos de tu cuenta de Meta (Facebook/Instagram) y cómo eliminarlos."}
          </RichText>
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("1. Qué datos de Meta almacenamos")}
        </h2>
        <p>
          {t(
            "Cuando conectas tu cuenta de Meta, guardamos un token de acceso (cifrado con AES-256-GCM), tu identificador de usuario de Meta y los metadatos de las cuentas publicitarias y Páginas que autorizas. Usamos estos datos exclusivamente para crear y administrar tus campañas publicitarias dentro de la plataforma.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("2. Eliminar tus datos de Meta (inmediato)")}
        </h2>
        <p>
          {t(
            "La forma más rápida es desconectar la integración desde la propia aplicación:",
          )}
        </p>
        <ol className="ml-5 list-decimal space-y-1">
          <li>{t("Inicia sesión en tu cuenta de OneClickIA.")}</li>
          <li>
            <RichText>
              {"Ve a la sección **Conexiones** / **Meta**."}
            </RichText>
          </li>
          <li>
            <RichText>{"Pulsa **“Desconectar”**."}</RichText>
          </li>
        </ol>
        <p>
          {t(
            "Al desconectar, eliminamos de inmediato y de forma permanente de nuestra base de datos el token de acceso, tu identificador de usuario de Meta y todos los metadatos de cuentas publicitarias y Páginas asociados. Esta acción es irreversible.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("3. Eliminar tu cuenta completa")}
        </h2>
        <p>
          {t(
            "Si deseas eliminar tu cuenta de OneClickIA y todos los datos asociados (perfil, marca, campañas e integraciones), puedes solicitarlo escribiéndonos al correo de contacto que aparece más abajo. Procesamos estas solicitudes en un plazo máximo de 30 días.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("4. Eliminación por solicitud")}
        </h2>
        <p>
          {t(
            "También puedes solicitar la eliminación de tus datos en cualquier momento enviando un correo a",
          )}{" "}
          <a
            href="mailto:hugocruz11@hotmail.com?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20datos"
            className="text-orange hover:text-orange/80"
          >
            hugocruz11@hotmail.com
          </a>{" "}
          {t(
            "con el asunto “Solicitud de eliminación de datos”. Incluye el correo electrónico asociado a tu cuenta para que podamos identificarla.",
          )}
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          {t("5. Contacto")}
        </h2>
        <p>
          {t("Para cualquier duda sobre la eliminación de datos, contáctanos en")}{" "}
          <a
            href="mailto:hugocruz11@hotmail.com"
            className="text-orange hover:text-orange/80"
          >
            hugocruz11@hotmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
