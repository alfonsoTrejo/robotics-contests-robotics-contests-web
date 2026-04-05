import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/constants";
import { proxyToApi } from "@/lib/api/proxy";
import type { ApiResponse } from "@/lib/types/api";
import type { Team } from "@/lib/types/domain";

type SessionUser = {
  id: string;
  role: "ADMIN" | "STUDENT";
  email: string;
};

async function fetchJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  const upstream = await fetch(`${API_BASE_URL}/teams/my`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  if (upstream.ok) {
    const payload = await fetchJson<ApiResponse<Team[]>>(upstream);
    return NextResponse.json(payload ?? { ok: true, data: [] }, { status: upstream.status });
  }

  // Fallback defensivo: algunos backends pueden resolver /teams/my como /teams/:id.
  // En ese caso reconstruimos "my teams" usando /auth/me + /teams.
  if (upstream.status === 404) {
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      const mePayload = await fetchJson<ApiResponse<SessionUser>>(meResponse);
      return NextResponse.json(
        mePayload ?? { ok: false, error: { message: "No autorizado" } },
        { status: meResponse.status },
      );
    }

    const mePayload = await fetchJson<ApiResponse<SessionUser>>(meResponse);
    if (!mePayload?.ok) {
      return NextResponse.json(mePayload ?? { ok: false, error: { message: "No autorizado" } }, {
        status: 401,
      });
    }

    const teamsResponse = await fetch(`${API_BASE_URL}/teams`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!teamsResponse.ok) {
      const teamsErrorPayload = await fetchJson<ApiResponse<Team[]>>(teamsResponse);
      return NextResponse.json(
        teamsErrorPayload ?? { ok: false, error: { message: "No se pudo obtener equipos" } },
        { status: teamsResponse.status },
      );
    }

    const teamsPayload = await fetchJson<ApiResponse<Team[]>>(teamsResponse);
    if (!teamsPayload?.ok) {
      return NextResponse.json(
        teamsPayload ?? { ok: false, error: { message: "No se pudo obtener equipos" } },
        { status: 400 },
      );
    }

    const myTeams = teamsPayload.data.filter((team) =>
      team.members?.some((member) => member.id === mePayload.data.id),
    );

    return NextResponse.json({ ok: true, data: myTeams }, { status: 200 });
  }

  const data = await fetchJson<unknown>(upstream);

  return NextResponse.json(data ?? { ok: false, error: { message: "Error inesperado" } }, {
    status: upstream.status,
  });
}

export async function POST(request: Request) {
  const body = await request.text();

  return proxyToApi(request, "/teams", {
    method: "POST",
    body,
  });
}
