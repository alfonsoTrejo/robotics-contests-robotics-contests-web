"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirectHomeOnUnauthorized } from "@/lib/client-auth-guard";
import type { Modality } from "@/lib/types/domain";

type ModalityListManagerProps = {
  contestId: string;
  initialModalities: Modality[];
};

type ModalityPayload = {
  ok?: boolean;
  data?: Modality;
  error?: { message?: string };
};

export function ModalityListManager({
  contestId,
  initialModalities,
}: ModalityListManagerProps) {
  const router = useRouter();
  const [modalities, setModalities] = useState(initialModalities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sortedModalities = useMemo(
    () => [...modalities].sort((a, b) => a.name.localeCompare(b.name)),
    [modalities],
  );

  useEffect(() => {
    setModalities(initialModalities);
  }, [initialModalities]);

  function onStartEdit(modality: Modality) {
    setEditingId(modality.id);
    setName(modality.name);
    setDescription(modality.description);
    setError(null);
  }

  function onCancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
    setError(null);
  }

  async function onSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    setSavingId(editingId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modalities/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          contestId,
        }),
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as ModalityPayload;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "No se pudo actualizar la modalidad");
      }

      setModalities((previous) =>
        previous.map((item) => (item.id === editingId ? payload.data! : item)),
      );
      onCancelEdit();
      router.refresh();
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado al actualizar modalidad";
      setError(message);
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(modalityId: string) {
    const approved = window.confirm("Deseas eliminar esta modalidad?");
    if (!approved) {
      return;
    }

    setDeletingId(modalityId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modalities/${modalityId}`, {
        method: "DELETE",
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as ModalityPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "No se pudo eliminar la modalidad");
      }

      setModalities((previous) => previous.filter((item) => item.id !== modalityId));
      if (editingId === modalityId) {
        onCancelEdit();
      }
      router.refresh();
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado al eliminar modalidad";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="border-black/10 shadow-none">
      <CardHeader>
        <CardTitle>Modalidades del concurso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-neutral-700">
        {sortedModalities.length === 0 && <p>No hay modalidades registradas aun.</p>}

        {sortedModalities.map((modality) => {
          const isEditing = editingId === modality.id;
          const isSaving = savingId === modality.id;
          const isDeleting = deletingId === modality.id;

          return (
            <div key={modality.id} className="rounded-md border border-black/10 p-3">
              {isEditing ? (
                <form onSubmit={onSaveEdit} className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor={`modality-name-${modality.id}`}>Nombre</Label>
                    <Input
                      id={`modality-name-${modality.id}`}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor={`modality-description-${modality.id}`}>Descripcion</Label>
                    <Textarea
                      id={`modality-description-${modality.id}`}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="sm" disabled={isSaving}>
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={onCancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-medium">{modality.name}</p>
                  <p>{modality.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onStartEdit(modality)}
                      disabled={Boolean(deletingId)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(modality.id)}
                      disabled={isDeleting || Boolean(savingId)}
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}