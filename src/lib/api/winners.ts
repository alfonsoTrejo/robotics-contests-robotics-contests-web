import { apiFetch } from "@/lib/api/client";
import type { Winner } from "@/lib/types/domain";

export async function listWinnersByContest(contestId: string): Promise<Winner[]> {
  return apiFetch<Winner[]>(`/winners/contest/${contestId}`, {
    method: "GET",
    cache: "force-cache",
  });
}
