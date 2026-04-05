"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contest, Modality, Team } from "@/lib/types/domain";

type SessionUser = {
  id: string;
  role: "ADMIN" | "STUDENT";
  email: string;
};

export function StudentDashboardClient() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [contestId, setContestId] = useState("");
  const [modalityId, setModalityId] = useState("");
  const [teammateUserId, setTeammateUserId] = useState("");

  const openContests = useMemo(
    () => contests.filter((contest) => contest.status === "OPEN"),
    [contests],
  );

  const contestById = useMemo(() => {
    return new Map(contests.map((contest) => [contest.id, contest]));
  }, [contests]);

  const modalityById = useMemo(() => {
    return new Map(modalities.map((modality) => [modality.id, modality]));
  }, [modalities]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);

      try {
        const [meResponse, teamsResponse, contestsResponse, modalitiesResponse] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/student/teams", { cache: "no-store" }),
          fetch("/api/public/contests", { cache: "no-store" }),
          fetch("/api/public/modalities", { cache: "no-store" }),
        ]);

        if (meResponse.status === 401 || meResponse.status === 403) {
          window.location.replace("/");
          return;
        }

        const mePayload = (await meResponse.json()) as {
          ok?: boolean;
          data?: SessionUser;
        };

        const teamsPayload = (await teamsResponse.json()) as {
          ok?: boolean;
          data?: Team[];
        };

        const contestsPayload = (await contestsResponse.json()) as {
          ok?: boolean;
          data?: Contest[];
        };

        const modalitiesPayload = (await modalitiesResponse.json()) as {
          ok?: boolean;
          data?: Modality[];
        };

        if (!mePayload.ok || !mePayload.data) {
          window.location.replace("/");
          return;
        }

        if (!cancelled) {
          setUser(mePayload.data);
          setTeams(teamsPayload.ok && teamsPayload.data ? teamsPayload.data : []);
          setContests(
            contestsPayload.ok && contestsPayload.data ? contestsPayload.data : [],
          );
          setModalities(
            modalitiesPayload.ok && modalitiesPayload.data ? modalitiesPayload.data : [],
          );
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar tu dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadModalities() {
      setModalityId("");

      if (!contestId) {
        setModalities([]);
        return;
      }

      try {
        const response = await fetch(`/api/public/modalities/by-contest/${contestId}`, {
          cache: "no-store",
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          data?: Modality[];
        };

        if (!cancelled) {
          setModalities(payload.ok && payload.data ? payload.data : []);
        }
      } catch {
        if (!cancelled) {
          setModalities([]);
        }
      }
    }

    loadModalities();

    return () => {
      cancelled = true;
    };
  }, [contestId]);

  async function onCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Sesion no valida");
      return;
    }

    if (!teamName || !contestId || !modalityId) {
      setError("Completa los campos obligatorios");
      return;
    }

    const selectedContest = contestById.get(contestId);
    if (!selectedContest || selectedContest.status !== "OPEN") {
      setError("Solo puedes crear equipos en concursos OPEN");
      return;
    }

    const memberUserIds = [user.id];
    const teammate = teammateUserId.trim();

    if (teammate && teammate !== user.id) {
      memberUserIds.push(teammate);
    }

    if (memberUserIds.length > 2) {
      setError("Un equipo admite maximo 2 miembros");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/student/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          contestId,
          modalityId,
          memberUserIds,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.replace("/");
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        data?: Team;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "No se pudo crear el equipo");
      }

      setTeams((previous) => [payload.data as Team, ...previous]);
      setTeamName("");
      setContestId("");
      setModalityId("");
      setTeammateUserId("");
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado al crear equipo";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-black/10 shadow-none">
        <CardContent className="py-8 text-sm text-neutral-600">
          Cargando dashboard...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle>Crear equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onCreateTeam}>
            <div className="grid gap-2">
              <Label htmlFor="team-name">Nombre del equipo</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Team A"
                required
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contest">Concurso (OPEN)</Label>
                <select
                  id="contest"
                  value={contestId}
                  onChange={(event) => setContestId(event.target.value)}
                  className="h-8 rounded-md border border-black/20 px-2 text-sm"
                  required
                >
                  <option value="">Selecciona concurso</option>
                  {openContests.map((contest) => (
                    <option key={contest.id} value={contest.id}>
                      {contest.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="modality">Modalidad</Label>
                <select
                  id="modality"
                  value={modalityId}
                  onChange={(event) => setModalityId(event.target.value)}
                  className="h-8 rounded-md border border-black/20 px-2 text-sm"
                  required
                  disabled={!contestId}
                >
                  <option value="">Selecciona modalidad</option>
                  {modalities.map((modality) => (
                    <option key={modality.id} value={modality.id}>
                      {modality.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teammate">ID de companero (opcional)</Label>
              <Input
                id="teammate"
                value={teammateUserId}
                onChange={(event) => setTeammateUserId(event.target.value)}
                placeholder="uuid del segundo miembro"
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <p className="text-xs text-neutral-500">
              Tu usuario ({user?.email}) se incluye automaticamente como miembro.
            </p>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear equipo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle>Mis equipos ({teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-sm text-neutral-600">Aun no tienes equipos creados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Concurso</TableHead>
                  <TableHead>Modalidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{contestById.get(team.contestId)?.title ?? team.contestId}</TableCell>
                    <TableCell>
                      {modalityById.get(team.modalityId)?.name ?? "Modalidad no encontrada"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
