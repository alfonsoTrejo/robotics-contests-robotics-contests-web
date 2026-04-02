import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/constants";

export async function proxyToApi(
  request: Request,
  path: string,
  init?: RequestInit,
) {
  const cookie = request.headers.get("cookie") ?? "";

  const upstream = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const text = await upstream.text();
  const data = text ? JSON.parse(text) : { ok: upstream.ok };

  const response = NextResponse.json(data, {
    status: upstream.status,
  });

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
