import { API_BASE_URL } from "@/lib/constants";
import { ApiClientError, type ApiResponse } from "@/lib/types/api";

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? "no-store",
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.ok) {
    const message = json.ok ? "Request failed" : json.error.message;
    throw new ApiClientError(message, response.status);
  }

  return json.data;
}
