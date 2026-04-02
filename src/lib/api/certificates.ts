import { API_BASE_URL } from "@/lib/constants";

export function getCertificateDownloadUrl(winnerId: string): string {
  return `${API_BASE_URL}/certificates/winner/${winnerId}`;
}
