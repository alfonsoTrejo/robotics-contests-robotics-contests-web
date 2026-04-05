import { headers } from "next/headers";

import type { ApiResponse } from "@/lib/types/api";
import { API_BASE_URL } from "@/lib/constants";

type SessionUser = {
  id: string;
  role: "ADMIN" | "STUDENT";
  email: string;
};

export async function resolveSessionUser(): Promise<SessionUser | null> {
  const headerStore = await headers();
  const cookie = headerStore.get("cookie") ?? "";

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<SessionUser>;
    if (!payload.ok) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}
