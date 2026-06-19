"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

// Ruta heredada: la conexión de Meta ahora vive en la página unificada de
// Conexiones (pestaña Meta). Redirigimos preservando los parámetros.
function MetaRedirect() {
  const router = useRouter();

  useEffect(() => {
    const qs = window.location.search.replace(/^\?/, "");
    const extra = qs ? `&${qs}` : "";
    router.replace(`/connections?tab=meta${extra}`);
  }, [router]);

  return (
    <div className="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  );
}

export default function MetaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <MetaRedirect />
    </Suspense>
  );
}
