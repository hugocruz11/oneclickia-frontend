"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function CheckEmailContent() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <Card className="text-center">
      <div className="text-4xl">📬</div>
      <h2 className="mt-4 text-xl font-semibold text-ink">
        Revisa tu correo
      </h2>
      <p className="mt-2 text-sm text-muted">
        Enviamos un enlace de acceso a{" "}
        {email ? (
          <span className="font-medium text-ink">{email}</span>
        ) : (
          "tu correo"
        )}
        . Haz clic en él para iniciar sesión.
      </p>
      <p className="mt-4 text-xs text-muted">
        ¿No lo ves? Revisa tu carpeta de spam.
      </p>
      <Link href="/login" className="mt-6 inline-block">
        <Button variant="ghost" size="sm">
          Volver al inicio
        </Button>
      </Link>
    </Card>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
