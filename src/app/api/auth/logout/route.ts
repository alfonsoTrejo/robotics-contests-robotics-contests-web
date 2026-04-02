import { NextResponse } from "next/server";

import { API_BASE_URL, AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  const upstream = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      cookie,
    },
    cache: "no-store",
  });

  const response = NextResponse.json({ ok: true }, { status: 200 });
  const setCookie = upstream.headers.get("set-cookie");

  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set(AUTH_ROLE_COOKIE_NAME, "", {
    httpOnly: false,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
