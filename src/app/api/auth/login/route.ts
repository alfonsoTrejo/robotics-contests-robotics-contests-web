import { NextResponse } from "next/server";

import { extractCookieValue } from "@/lib/auth-cookie";
import { API_BASE_URL, AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types/api";
import type { User } from "@/lib/types/domain";

export async function POST(request: Request) {
  const body = (await request.json()) as { email: string; password: string };

  const upstream = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await upstream.json()) as ApiResponse<User>;

  if (!upstream.ok || !payload.ok) {
    return NextResponse.json(
      { message: payload.ok ? "No se pudo iniciar sesión" : payload.error.message },
      { status: upstream.status || 400 },
    );
  }

  const response = NextResponse.json({ ok: true, data: payload.data }, { status: 200 });
  const setCookie = upstream.headers.get("set-cookie");
  const token = extractCookieValue(setCookie, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json(
      { message: "No se pudo establecer la sesion" },
      { status: 500 },
    );
  }

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set(AUTH_ROLE_COOKIE_NAME, payload.data.role, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
