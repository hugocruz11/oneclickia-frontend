"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Textarea } from "@/components/ui/Textarea";
import { api, ApiError } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [instagramSummary, setInstagramSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setWarnings([]);

    if (!name.trim()) {
      setError("El nombre de la marca es obligatorio.");
      return;
    }
    if (!logo) {
      setError("El logo es obligatorio.");
      return;
    }
    if (!websiteUrl.trim()) {
      setError("La URL del sitio web es obligatoria.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("logo", logo);
      formData.append("websiteUrl", websiteUrl.trim());

      if (instagramUrl.trim()) {
        formData.append("instagramUrl", instagramUrl.trim());
      }
      if (instagramSummary.trim()) {
        formData.append("instagramSummary", instagramSummary.trim());
      }

      const result = await api.post<{ brand: unknown; warnings: string[] }>(
        "/onboarding",
        formData,
      );

      if (result.warnings?.length > 0) {
        setWarnings(result.warnings);
        // Show warnings briefly, then redirect
        setTimeout(() => router.replace("/ads/search"), 3000);
      } else {
        router.replace("/ads/search");
      }
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
    <Card padding="lg">
      <h2 className="text-xl font-semibold text-ink">Configura tu marca</h2>
      <p className="mt-2 text-sm text-muted">
        Necesitamos estos datos para crear campañas personalizadas.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Input
          label="Nombre de la marca *"
          placeholder="Ej: Mi Tienda Online"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <FileUpload
          label="Logo de la marca *"
          onChange={setLogo}
          helperText="Se usará en tus anuncios generados."
        />

        <Input
          label="URL del sitio web *"
          type="url"
          placeholder="https://www.tumarca.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          required
        />

        <div className="border-t border-sand pt-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
            Opcional
          </p>

          <div className="flex flex-col gap-5">
            <Input
              label="URL de Instagram"
              type="url"
              placeholder="https://instagram.com/tumarca"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />

            <Textarea
              label="Descripción de Instagram"
              placeholder="Describe brevemente tu perfil de Instagram: qué publicas, qué vendes, a quién te diriges..."
              value={instagramSummary}
              onChange={(e) => setInstagramSummary(e.target.value)}
              helperText="Si no tienes web, esta descripción nos ayuda a entender tu marca."
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-error/20 bg-red-50 p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="rounded-md border border-warning/20 bg-amber-50 p-3">
            <p className="text-sm font-medium text-warning">Avisos:</p>
            {warnings.map((w, i) => (
              <p key={i} className="mt-1 text-sm text-warning">{w}</p>
            ))}
            <p className="mt-2 text-xs text-muted">
              Redirigiendo al dashboard...
            </p>
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" className="w-full">
          Completar configuración
        </Button>
      </form>
    </Card>
  );
}
