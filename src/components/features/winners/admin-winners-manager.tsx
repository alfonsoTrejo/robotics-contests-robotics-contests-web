"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirectHomeOnUnauthorized } from "@/lib/client-auth-guard";
import type { Contest, Modality, Team, Winner, WinnerPosition } from "@/lib/types/domain";

type ApiListPayload<T> = {
  ok?: boolean;
  data?: T[];
  error?: { message?: string };
};

type ApiItemPayload<T> = {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
};

const POSITION_OPTIONS: WinnerPosition[] = ["FIRST", "SECOND", "THIRD"];

export function AdminWinnersManager() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingModalityData, setLoadingModalityData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [contestId, setContestId] = useState("");
  const [modalityId, setModalityId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState<WinnerPosition>("FIRST");

  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<WinnerPosition>("FIRST");
  const [error, setError] = useState<string | null>(null);

  const modalityById = useMemo(
    () => new Map(modalities.map((item) => [item.id, item])),
    [modalities],
  );

  const teamById = useMemo(() => new Map(teams.map((item) => [item.id, item])), [teams]);

  const occupiedPositions = useMemo(
    () => new Set(winners.map((winner) => winner.position)),
    [winners],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBase() {
      setLoadingBase(true);
      setError(null);

      try {
        const response = await fetch("/api/public/contests", { cache: "no-store" });
        if (redirectHomeOnUnauthorized(response)) {
          return;
        }

        const payload = (await response.json()) as ApiListPayload<Contest>;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error?.message ?? "No se pudo cargar concursos");
        }

        if (!cancelled) {
          setContests(payload.data ?? []);
        }
      } catch (unknownError) {
        if (!cancelled) {
          const message =
            unknownError instanceof Error
              ? unknownError.message
              : "Error cargando concursos";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingBase(false);
        }
      }
    }

    loadBase();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadModalities() {
      setModalityId("");
      setTeamId("");
      setWinners([]);
      setTeams([]);

      if (!contestId) {
        setModalities([]);
        return;
      }

      setLoadingModalityData(true);

      try {
        const response = await fetch(`/api/public/modalities/by-contest/${contestId}`, {
          cache: "no-store",
        });
        if (redirectHomeOnUnauthorized(response)) {
          return;
        }

        const payload = (await response.json()) as ApiListPayload<Modality>;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error?.message ?? "No se pudo cargar modalidades");
        }

        if (!cancelled) {
          setModalities(payload.data ?? []);
        }
      } catch (unknownError) {
        if (!cancelled) {
          const message =
            unknownError instanceof Error
              ? unknownError.message
              : "Error cargando modalidades";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingModalityData(false);
        }
      }
    }

    loadModalities();

    return () => {
      cancelled = true;
    };
  }, [contestId]);

  useEffect(() => {
    let cancelled = false;

    async function loadTeamsAndWinners() {
      setTeamId("");
      setWinners([]);
      setTeams([]);

      if (!modalityId) {
        return;
      }

      setLoadingModalityData(true);

      try {
        const [teamsResponse, winnersResponse] = await Promise.all([
          fetch(`/api/public/teams?contestId=${contestId}&modalityId=${modalityId}`, {
            cache: "no-store",
          }),
          fetch(`/api/admin/winners?modalityId=${modalityId}`, { cache: "no-store" }),
        ]);

        if (redirectHomeOnUnauthorized(teamsResponse)) {
          return;
        }
        if (redirectHomeOnUnauthorized(winnersResponse)) {
          return;
        }

        const teamsPayload = (await teamsResponse.json()) as ApiListPayload<Team>;
        const winnersPayload = (await winnersResponse.json()) as ApiListPayload<Winner>;

        if (!teamsResponse.ok || !teamsPayload.ok) {
          throw new Error(teamsPayload.error?.message ?? "No se pudo cargar equipos");
        }

        if (!winnersResponse.ok || !winnersPayload.ok) {
          throw new Error(
            winnersPayload.error?.message ?? "No se pudo cargar ganadores",
          );
        }

        if (!cancelled) {
          setTeams(teamsPayload.data ?? []);
          setWinners(winnersPayload.data ?? []);
        }
      } catch (unknownError) {
        if (!cancelled) {
          const message =
            unknownError instanceof Error
              ? unknownError.message
              : "Error cargando datos de modalidad";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingModalityData(false);
        }
      }
    }

    loadTeamsAndWinners();

    return () => {
      cancelled = true;
    };
  }, [contestId, modalityId]);

  async function assignWinner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teamId || !modalityId) {
      setError("Selecciona modalidad y equipo");
      return;
    }

    if (winners.length >= 3) {
      setError("Esta modalidad ya tiene 3 ganadores");
      return;
    }

    if (occupiedPositions.has(position)) {
      setError(`La posicion ${position} ya esta ocupada`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, modalityId, position }),
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as ApiItemPayload<Winner>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "No se pudo asignar ganador");
      }

      setWinners((previous) => [...previous, payload.data as Winner]);
      setTeamId("");
      setPosition("FIRST");
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error asignando ganador";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function updateWinnerPosition(id: string) {
    const duplicate = winners.some(
      (item) => item.id !== id && item.position === editingPosition,
    );

    if (duplicate) {
      setError(`La posicion ${editingPosition} ya esta ocupada`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/winners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: editingPosition }),
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as ApiItemPayload<Winner>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "No se pudo actualizar posicion");
      }

      setWinners((previous) =>
        previous.map((item) => (item.id === id ? (payload.data as Winner) : item)),
      );
      setEditingWinnerId(null);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error actualizando ganador";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteWinner(id: string) {
    const approved = window.confirm("Deseas eliminar este ganador?");
    if (!approved) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/winners/${id}`, {
        method: "DELETE",
      });

      if (redirectHomeOnUnauthorized(response)) {
        return;
      }

      const payload = (await response.json()) as ApiItemPayload<Winner>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "No se pudo eliminar ganador");
      }

      setWinners((previous) => previous.filter((item) => item.id !== id));
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error eliminando ganador";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle>Asignar podio por modalidad</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={assignWinner}>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="winner-contest">Concurso</Label>
                <select
                  id="winner-contest"
                  value={contestId}
                  onChange={(event) => setContestId(event.target.value)}
                  className="h-8 rounded-md border border-black/20 px-2 text-sm"
                  disabled={loadingBase || saving}
                >
                  <option value="">Selecciona concurso</option>
                  {contests.map((contest) => (
                    <option key={contest.id} value={contest.id}>
                      {contest.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="winner-modality">Modalidad</Label>
                <select
                  id="winner-modality"
                  value={modalityId}
                  onChange={(event) => setModalityId(event.target.value)}
                  className="h-8 rounded-md border border-black/20 px-2 text-sm"
                  disabled={!contestId || loadingModalityData || saving}
                >
                  <option value="">Selecciona modalidad</option>
                  {modalities.map((modality) => (
                    <option key={modality.id} value={modality.id}>
                      {modality.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="winner-team">Equipo</Label>
                <select
                  id="winner-team"
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  className="h-8 rounded-md border border-black/20 px-2 text-sm"
                  disabled={!modalityId || loadingModalityData || saving}
                >
                  <option value="">Selecciona equipo</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2 md:max-w-xs">
              <Label htmlFor="winner-position">Posicion</Label>
              <select
                id="winner-position"
                value={position}
                onChange={(event) => setPosition(event.target.value as WinnerPosition)}
                className="h-8 rounded-md border border-black/20 px-2 text-sm"
                disabled={saving}
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span>Reglas: posicion unica por modalidad, maximo 3 ganadores.</span>
              <Badge variant="secondary">Ganadores actuales: {winners.length}</Badge>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving || !modalityId || !teamId}>
              {saving ? "Guardando..." : "Asignar ganador"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle>Ganadores de la modalidad</CardTitle>
        </CardHeader>
        <CardContent>
          {!modalityId ? (
            <p className="text-sm text-neutral-600">
              Selecciona concurso y modalidad para ver el podio.
            </p>
          ) : winners.length === 0 ? (
            <p className="text-sm text-neutral-600">Aun no hay ganadores asignados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Posicion</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((winner) => {
                  const isEditing = editingWinnerId === winner.id;
                  return (
                    <TableRow key={winner.id}>
                      <TableCell>{teamById.get(winner.teamId)?.name ?? winner.teamId}</TableCell>
                      <TableCell>
                        {modalityById.get(winner.modalityId)?.name ?? winner.modalityId}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <select
                            value={editingPosition}
                            onChange={(event) =>
                              setEditingPosition(event.target.value as WinnerPosition)
                            }
                            className="h-8 rounded-md border border-black/20 px-2 text-sm"
                            disabled={saving}
                          >
                            {POSITION_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          winner.position
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateWinnerPosition(winner.id)}
                                disabled={saving}
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingWinnerId(null)}
                                disabled={saving}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingWinnerId(winner.id);
                                  setEditingPosition(winner.position);
                                }}
                                disabled={saving}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteWinner(winner.id)}
                                disabled={saving}
                              >
                                Eliminar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
