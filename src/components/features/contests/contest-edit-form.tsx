"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirectHomeOnUnauthorized } from "@/lib/client-auth-guard";
import type { Contest } from "@/lib/types/domain";

type ContestEditFormProps = {
  contest: Contest;
};

export function ContestEditForm({ contest }: ContestEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: contest.title,
    description: contest.description,
    date: contest.date.slice(0, 16),
    location: contest.location,
    status: contest.status,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contests/${contest.id}`, {
        method: "PATCH",
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
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "No se pudo actualizar el concurso");
      }

      router.refresh();
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado al editar concurso";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-black/10 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Editar concurso
      </h2>

      <div className="grid gap-2">
        <Label htmlFor="edit-title">Titulo</Label>
        <Input
          id="edit-title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="edit-description">Descripcion</Label>
        <Textarea
          id="edit-description"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          required
        />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="grid gap-2 md:col-span-1">
          <Label htmlFor="edit-date">Fecha</Label>
          <Input
            id="edit-date"
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
        </div>

        <div className="grid gap-2 md:col-span-1">
          <Label htmlFor="edit-location">Ubicacion</Label>
          <Input
            id="edit-location"
            value={form.location}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, location: event.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2 md:col-span-1">
          <Label htmlFor="edit-status">Estado</Label>
          <select
            id="edit-status"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as Contest["status"] }))}
            className="h-8 rounded-md border border-black/20 px-2 text-sm"
          >
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
