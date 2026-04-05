import { NextResponse } from "next/server";

import { extractCookieValue } from "@/lib/auth-cookie";
import { API_BASE_URL, AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types/api";
import type { User } from "@/lib/types/domain";

function getFakeStudentEmailFromToken(idToken: string): string | null {
  const match = idToken.match(/^fake-google-id-(\d+)$/);
  const index = match?.[1];

  if (!index) {
    return null;
  }

  return `student${index}@fake.test`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { id_token: string };

  let upstream = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });

  if (!upstream.ok) {
    const rawError = await upstream.text();
    let parsedErrorMessage = rawError;

    try {
      const parsed = JSON.parse(rawError) as ApiResponse<User>;
      parsedErrorMessage = parsed.ok ? "No se pudo iniciar sesión" : parsed.error.message;
    } catch {
      parsedErrorMessage = rawError;
    }

    const fakeStudentEmail = getFakeStudentEmailFromToken(body.id_token);
    const shouldTryDevFallback =
      Boolean(fakeStudentEmail) &&
      parsedErrorMessage.includes("Wrong number of segments in token");

    if (shouldTryDevFallback && fakeStudentEmail) {
      upstream = await fetch(`${API_BASE_URL}/dev/login-fake-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fakeStudentEmail }),
        credentials: "include",
        cache: "no-store",
      });
    } else {
      return NextResponse.json(
        { message: parsedErrorMessage || "No se pudo iniciar sesión" },
        { status: upstream.status || 400 },
      );
    }
  }

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
