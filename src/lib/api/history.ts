import { apiFetch } from "@/lib/api/client";
import type { StudentHistoryItem } from "@/lib/types/domain";

export async function getMyHistory(): Promise<StudentHistoryItem[]> {
  return apiFetch<StudentHistoryItem[]>("/history/me", {
    method: "GET",
  });
}
