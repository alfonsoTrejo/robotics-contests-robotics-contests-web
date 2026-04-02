"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirectHomeOnUnauthorized } from "@/lib/client-auth-guard";

type ModalityCreateFormProps = {
  contestId: string;
};

export function ModalityCreateForm({ contestId }: ModalityCreateFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/modalities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, contestId }),
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "No se pudo crear la modalidad");
      }

      setName("");
      setDescription("");
      router.refresh();
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado al crear modalidad";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-black/10 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Nueva modalidad
      </h3>

      <div className="grid gap-2">
        <Label htmlFor="modality-name">Nombre</Label>
        <Input
          id="modality-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="modality-description">Descripcion</Label>
        <Textarea
          id="modality-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear modalidad"}
      </Button>
    </form>
  );
}
