import { apiFetch } from "@/lib/api/client";
import type { Modality } from "@/lib/types/domain";

export async function listModalitiesByContest(
  contestId: string,
  cache: RequestCache = "no-store",
): Promise<Modality[]> {
  return apiFetch<Modality[]>(`/modalities/by-contest/${contestId}`, {
    method: "GET",
    cache,
  });
}
