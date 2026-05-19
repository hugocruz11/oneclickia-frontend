"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      await completeLogin(auth.accessToken);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-ink">Iniciar sesión</h2>
      <p className="mt-2 text-sm text-muted">
        Ingresa tu email y contraseña para continuar.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <div className="rounded-md border border-error/20 bg-error/10 p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-orange hover:text-orange/80">
          Regístrate
        </Link>
      </p>
    </Card>
  );
}

async function completeLogin(token: string) {
  // Store JWT for client-side API calls (api client reads it from here)
  localStorage.setItem("oneclickia_token", token);
  // Set httpOnly cookie for the proxy middleware
  await fetch("/api/auth/set-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  // Decide entry point based on onboarding status. Use a full
  // navigation so the proxy picks up the fresh cookie immediately.
  let target = "/onboarding";
  try {
    const { api } = await import("@/lib/api");
    const status = await api.get<{ completed: boolean }>("/onboarding/status");
    if (status.completed) target = "/ads/search";
  } catch {
    // If status can't be fetched, fall through to /onboarding
  }
  window.location.href = target;
}
