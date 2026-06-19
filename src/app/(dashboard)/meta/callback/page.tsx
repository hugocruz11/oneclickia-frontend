"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (success === "true") {
      router.push("/connections?tab=meta");
      return;
    }

    if (errorParam) {
      setError(errorDesc || "Error al conectar con Meta.");
    } else {
      setError("Respuesta inesperada del servidor.");
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h2 className="text-lg font-semibold text-ink">
          Error de conexión
        </h2>
        <p className="mt-2 text-sm text-error">{error}</p>
        <Link href="/connections?tab=meta" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">
            Volver a Conexiones
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md text-center">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-sm text-muted">
        Conectando con Meta Ads...
      </p>
    </Card>
  );
}

export default function MetaCallbackPage() {
  return (
    <div className="flex justify-center py-12">
      <Suspense
        fallback={
          <Card className="mx-auto max-w-md text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-sm text-muted">Cargando...</p>
          </Card>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
