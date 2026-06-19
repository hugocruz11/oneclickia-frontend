"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import type { PlanTier } from "@/lib/billing";

const PAID_TIERS: PlanTier[] = ["STARTER", "PRO", "BUSINESS"];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const auth = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        name: name.trim() || undefined,
      });

      localStorage.setItem("oneclickia_token", auth.accessToken);
      await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: auth.accessToken }),
      });

      // Subscribe-before-register funnel: if the landing sent a paid plan
      // (?plan=PRO), send the new user to the plans page with that plan
      // preselected so the card form opens for it. Subscribing needs the
      // ePayco card-tokenization form, so it lives on /plans (not a redirect
      // to a hosted page). Otherwise go straight to onboarding.
      const plan = new URLSearchParams(window.location.search).get(
        "plan",
      ) as PlanTier | null;
      if (plan && PAID_TIERS.includes(plan)) {
        window.location.href = `/plans?plan=${plan}`;
        return;
      }
      window.location.href = "/onboarding";
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
      <h2 className="text-xl font-semibold text-ink">Crear cuenta</h2>
      <p className="mt-2 text-sm text-muted">
        Empieza a generar campañas con IA en minutos.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Nombre (opcional)"
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <Input
          label="Email *"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <PasswordInput
          label="Contraseña *"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          error={
            password.length > 0 && password.length < 8
              ? "La contraseña debe tener al menos 8 caracteres."
              : undefined
          }
          helperText="Mínimo 8 caracteres."
        />
        <PasswordInput
          label="Confirmar contraseña *"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          error={
            confirmPassword.length > 0 && confirmPassword !== password
              ? "Las contraseñas no coinciden."
              : undefined
          }
        />
        {error && (
          <div role="alert" className="rounded-md border border-error/20 bg-error/10 p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-orange hover:text-orange/80">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
