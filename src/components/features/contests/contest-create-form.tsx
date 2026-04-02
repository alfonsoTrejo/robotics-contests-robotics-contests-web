"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirectHomeOnUnauthorized } from "@/lib/client-auth-guard";
import type { Contest } from "@/lib/types/domain";

type ContestCreateFormProps = {
  onCreated: (contest: Contest) => void;
};

type FormState = {
  title: string;
  description: string;
  date: string;
  location: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  date: "",
  location: "",
};

export function ContestCreateForm({ onCreated }: ContestCreateFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(),
        }),
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        data?: Contest;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "No se pudo crear el concurso");
      }

      onCreated(payload.data);
      setForm(emptyForm);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado al crear concurso";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-black/10 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Crear concurso
      </h2>

      <div className="grid gap-2">
        <Label htmlFor="contest-title">Titulo</Label>
        <Input
          id="contest-title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contest-description">Descripcion</Label>
        <Textarea
          id="contest-description"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          required
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contest-date">Fecha</Label>
          <Input
            id="contest-date"
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contest-location">Ubicacion</Label>
          <Input
            id="contest-location"
            value={form.location}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, location: event.target.value }))
            }
            required
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear concurso"}
      </Button>
    </form>
  );
}
