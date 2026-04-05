import { apiFetch } from "@/lib/api/client";
import type { Winner } from "@/lib/types/domain";

export async function listWinnersByContest(
  contestId: string,
  cache: RequestCache = "no-store",
): Promise<Winner[]> {
  return apiFetch<Winner[]>(`/winners/contest/${contestId}`, {
    method: "GET",
    cache,
  });
}
