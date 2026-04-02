import { apiFetch } from "@/lib/api/client";
import type { Contest } from "@/lib/types/domain";

export async function listContests(
  cache: RequestCache = "force-cache",
): Promise<Contest[]> {
  return apiFetch<Contest[]>("/contests", {
    method: "GET",
    cache,
  });
}

export async function getContestById(
  id: string,
  cache: RequestCache = "force-cache",
): Promise<Contest> {
  return apiFetch<Contest>(`/contests/${id}`, {
    method: "GET",
    cache,
  });
}
