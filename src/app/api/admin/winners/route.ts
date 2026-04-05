import { NextResponse } from "next/server";

import { proxyToApi } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const modalityId = url.searchParams.get("modalityId");

  if (!modalityId) {
    return NextResponse.json(
      { ok: false, error: { message: "modalityId es requerido" } },
      { status: 400 },
    );
  }

  return proxyToApi(request, `/winners/modality/${modalityId}`, {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.text();

  return proxyToApi(request, "/winners", {
    method: "POST",
    body,
  });
}
