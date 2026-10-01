"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useT } from "@/contexts/I18nContext";
import { ORG_STORAGE_KEY } from "@/lib/api";
import { orgApi, type OrgRole } from "@/lib/projects";
import { errorMessage, ROLE_LABEL } from "@/components/projects/labels";

interface Preview {
  organizationName: string;
  role: OrgRole;
  email: string;
}

// Página pública de invitación: muestra la organización y el rol; si hay
// sesión permite aceptar, si no, lleva a iniciar sesión / registrarse y vuelve.
export default function InvitePage() {
  const t = useT();
  const { token } = useParams<{ token: string }>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    orgApi
      .previewInvitation(token)
      .then((p) => {
        setLoggedIn(!!localStorage.getItem("oneclickia_token"));
        setPreview(p);
      })
      .catch((err) => setError(errorMessage(err, t)));
  }, [token, t]);

  async function accept() {
    setBusy(true);
    setError("");
    try {
      const res = await orgApi.acceptInvitation(token);
      localStorage.setItem(ORG_STORAGE_KEY, res.organizationId);
      window.location.href = "/projects";
    } catch (err) {
      setError(errorMessage(err, t));
      setBusy(false);
    }
  }

  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <Card className="w-full max-w-md">
      {!preview && !error && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
      {error && <p className="text-center text-sm text-error">{error}</p>}
      {preview && (
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-xl font-semibold text-ink">
            {t("Te invitaron a {org}", { org: preview.organizationName })}
          </h1>
          <p className="text-sm text-muted">
            {t("Rol: {role} · Invitación para {email}", {
              role: t(ROLE_LABEL[preview.role]),
              email: preview.email,
            })}
          </p>
          {loggedIn ? (
            <Button loading={busy} onClick={accept}>
              {t("Aceptar invitación")}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href={`/register?next=${next}`}
                className="rounded-sm border border-orange bg-orange px-4 py-2 text-sm font-semibold text-cream hover:bg-orange-hover"
              >
                {t("Crear cuenta y unirme")}
              </Link>
              <Link
                href={`/login?next=${next}`}
                className="rounded-lg border border-sand bg-sand-light px-4 py-2 text-sm font-semibold text-charcoal hover:bg-sand"
              >
                {t("Ya tengo cuenta")}
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
