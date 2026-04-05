"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentHistoryItem } from "@/lib/types/domain";

export function StudentHistoryClient() {
  const [history, setHistory] = useState<StudentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch("/api/student/history", { cache: "no-store" });

        if (response.status === 401 || response.status === 403) {
          window.location.replace("/");
          return;
        }

        const payload = (await response.json()) as {
          ok?: boolean;
          data?: StudentHistoryItem[];
        };

        if (!cancelled) {
          setHistory(payload.ok && payload.data ? payload.data : []);
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card className="border-black/10 shadow-none">
        <CardContent className="py-6 text-sm text-neutral-600">
          Cargando historial...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {history.length === 0 && (
        <Card className="border-black/10 shadow-none">
          <CardContent className="py-6 text-sm text-neutral-600">
            Aun no hay equipos registrados en tu historial.
          </CardContent>
        </Card>
      )}

      {history.map((item) => (
        <Card key={item.id} className="border-black/10 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {item.winner ? (
              <Badge>{item.winner.position}</Badge>
            ) : (
              <Badge variant="secondary">Sin podio</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-700">
            <p>Concurso: {item.contest.title}</p>
            <p>Modalidad: {item.modality.name}</p>
            {item.winner && (
              <a
                href={`/api/student/certificates/winner/${item.winner.id}`}
                className="inline-flex rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Descargar certificado
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
