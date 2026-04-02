import { apiFetch } from "@/lib/api/client";
import type { Team } from "@/lib/types/domain";

export type CreateTeamInput = {
  name: string;
  contestId: string;
  modalityId: string;
  memberUserIds: string[];
};

export async function listMyTeams(): Promise<Team[]> {
  return apiFetch<Team[]>("/teams/my", { method: "GET" });
}

export async function createTeam(input: CreateTeamInput): Promise<Team> {
  return apiFetch<Team>("/teams", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
