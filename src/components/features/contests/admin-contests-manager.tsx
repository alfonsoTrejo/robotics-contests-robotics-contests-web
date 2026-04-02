"use client";

import Link from "next/link";
import { useState } from "react";

import { ContestCreateForm } from "@/components/features/contests/contest-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectHomeOnUnauthorized } from "@/lib/client-auth-guard";
import type { Contest } from "@/lib/types/domain";

type AdminContestsManagerProps = {
  initialContests: Contest[];
};

export function AdminContestsManager({ initialContests }: AdminContestsManagerProps) {
  const [contests, setContests] = useState(initialContests);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreated(contest: Contest) {
    setContests((prev) => [contest, ...prev]);
  }

  async function handleDelete(id: string) {
    const approved = window.confirm("Deseas eliminar este concurso?");
    if (!approved) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/contests/${id}`, {
        method: "DELETE",
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "No se pudo eliminar el concurso");
      }

      setContests((prev) => prev.filter((contest) => contest.id !== id));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el concurso";
      window.alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <ContestCreateForm onCreated={handleCreated} />

      <div className="grid gap-4 md:grid-cols-2">
        {contests.map((contest) => (
          <Card key={contest.id} className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{contest.title}</span>
                <Badge variant={contest.status === "OPEN" ? "default" : "secondary"}>
                  {contest.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-700">
              <p>{contest.description}</p>
              <p>{new Date(contest.date).toLocaleString()}</p>
              <p>{contest.location}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/contests/${contest.id}`} className="underline underline-offset-4">
                  Editar
                </Link>
                <Link href={`/contests/${contest.id}`} className="underline underline-offset-4">
                  Vista publica
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(contest.id)}
                  disabled={deletingId === contest.id}
                >
                  {deletingId === contest.id ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
