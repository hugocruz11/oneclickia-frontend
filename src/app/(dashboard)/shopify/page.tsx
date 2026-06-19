"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

// Ruta heredada: el callback OAuth de Shopify vuelve a /shopify?connected=true.
// Redirigimos a la nueva página unificada de Conexiones (pestaña Shopify)
// preservando los parámetros (connected/error) para que el panel los lea.
function ShopifyRedirect() {
  const router = useRouter();

  useEffect(() => {
    const qs = window.location.search.replace(/^\?/, "");
    const extra = qs ? `&${qs}` : "";
    router.replace(`/connections?tab=shopify${extra}`);
  }, [router]);

  return (
    <div className="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  );
}

export default function ShopifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <ShopifyRedirect />
    </Suspense>
  );
}
