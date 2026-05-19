"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse, OnboardingStatus } from "@/lib/types";
import Link from "next/link";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token no proporcionado.");
      return;
    }

    async function verify() {
      try {
        // 1. Verify magic link token
        const auth = await api.get<AuthResponse>(
          `/auth/verify?token=${token}`,
        );

        // 2. Store JWT in localStorage
        localStorage.setItem("oneclickia_token", auth.accessToken);

        // 3. Set httpOnly cookie for proxy (await to ensure cookie is set)
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: auth.accessToken }),
        });

        // 4. Check onboarding status
        const status = await api.get<OnboardingStatus>("/onboarding/status");

        // 5. Redirect based on onboarding state — use window.location
        //    to force a full navigation so the proxy picks up the new cookie
        if (status.completed) {
          window.location.href = "/ads/search";
        } else {
          window.location.href = "/onboarding";
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Error al verificar el acceso. Intenta de nuevo.");
        }
      }
    }

    verify();
  }, [token, router]);

  if (error) {
    return (
      <Card className="text-center">
        <div className="text-4xl">❌</div>
        <h2 className="mt-4 text-xl font-semibold text-ink">
          Error de verificación
        </h2>
        <p className="mt-2 text-sm text-error">{error}</p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="ghost" size="sm">
            Volver al inicio
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="text-center">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-sm text-muted">Verificando tu acceso...</p>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
