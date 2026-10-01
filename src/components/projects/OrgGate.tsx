"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useOrg } from "@/contexts/OrgContext";
import { useT } from "@/contexts/I18nContext";

// Las páginas del módulo de proyectos necesitan una organización activa.
// Si /orgs falla (backend caído o sin migrar) mostramos el error en vez de
// dejar la página cargando para siempre.
export function OrgGate({ children }: { children: ReactNode }) {
  const { current, isLoading, refresh } = useOrg();
  const t = useT();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }
  if (!current) {
    return (
      <Card className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3 text-center">
        <p className="font-medium text-ink">{t("No se pudo cargar tu organización.")}</p>
        <p className="text-sm text-muted">
          {t("Verifica que el servidor esté actualizado e inténtalo de nuevo.")}
        </p>
        <Button size="sm" onClick={() => void refresh()}>
          {t("Reintentar")}
        </Button>
      </Card>
    );
  }
  return <>{children}</>;
}
